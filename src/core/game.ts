import * as B from './balance'
import { D, Decimal } from './decimal'
import {
  equipBonuses,
  equipPower,
  QUALITIES,
  rollEquipment,
  SALVAGE_RETURN,
  score,
  SLOTS,
  type Rng,
} from './equipment'
import {
  affordableLevels,
  bossHP,
  goldDrop,
  heroDPS,
  isBossFloor,
  medalsFromFloor,
  mobHP,
  upCost,
} from './formulas'
import { JOBS } from './jobs'
import type { Equipment, GameEvent, GameState, Slot } from './types'

/**
 * 所有函式直接改動傳入的 state(呼叫端負責產生新參考給 React),
 * 並回傳本次發生的事件供演出層使用。core 不 import React/Pixi。
 */

export function createInitialState(medals = 0, runs = 0): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    lv: 1,
    gold: D(B.MEDAL_START_GOLD).mul(medals),
    jobId: 'rookie',
    floor: 1,
    highestFloor: 1,
    killsInFloor: 0,
    isBoss: false,
    enemyHp: D(0),
    enemyMaxHp: D(0),
    bossTimeLeft: B.BOSS_TIME,
    bossFailed: false,
    morale: 0,
    materials: 0,
    forgeCount: 0,
    pityCount: 0,
    inventory: [],
    equipped: { weapon: null, head: null, body: null, boots: null, trinket: null },
    medals,
    runs,
    lastSaved: Date.now(),
  }
  spawnEnemy(s)
  return s
}

export const SAVE_VERSION = 2

// ---------- 數值查詢 ----------

export function goldBonus(s: GameState): number {
  return equipBonuses(s.equipped).gold
}

export function critRate(s: GameState): number {
  return B.CRIT_RATE + equipBonuses(s.equipped).crit + (JOBS[s.jobId].bonus.crit ?? 0)
}

export function currentDPS(s: GameState): Decimal {
  const bonus = equipBonuses(s.equipped)
  const job = JOBS[s.jobId].bonus
  return heroDPS({
    lv: s.lv,
    medals: s.medals,
    equipBonus: bonus.dmg + (job.dmg ?? 0),
    morale: s.morale,
  }).mul(equipPower(s.equipped)) // 每件裝備獨立乘區
}

/** 每秒 farm 金幣期望(離線收益與 UI 用) */
export function goldPerSec(s: GameState): Decimal {
  const dps = currentDPS(s)
  const floor = Math.max(1, s.floor)
  const clearTime = mobHP(floor).mul(B.MOBS_PER_FLOOR).div(dps).toNumber() + 2
  return goldDrop(floor).mul(B.MOBS_PER_FLOOR).mul(1 + goldBonus(s)).div(Math.max(0.1, clearTime))
}

// ---------- 戰鬥 ----------

/** 依現在的層數重建敵人(層數被外部改動、或讀檔後校正時呼叫) */
export function spawnEnemy(s: GameState) {
  if (isBossFloor(s.floor) && !s.bossFailed) {
    s.isBoss = true
    s.enemyMaxHp = bossHP(s.floor)
    s.bossTimeLeft = B.BOSS_TIME
  } else {
    s.isBoss = false
    s.enemyMaxHp = mobHP(s.floor)
  }
  s.enemyHp = s.enemyMaxHp
}

function reward(s: GameState, boss: boolean, events: GameEvent[]) {
  const mult = boss ? B.BOSS_GOLD_MULT : 1
  const g = goldDrop(s.floor).mul(mult).mul(1 + goldBonus(s))
  s.gold = s.gold.add(g)
  s.materials += boss ? B.BOSS_MATERIALS : B.MATERIAL_PER_MOB
  events.push({ type: boss ? 'bossKill' : 'kill', gold: g, floor: s.floor })
}

function nextEnemy(s: GameState, events: GameEvent[]) {
  if (s.isBoss) {
    // Boss 被擊破 → 進下一層
    s.floor++
    s.killsInFloor = 0
    s.bossFailed = false
    events.push({ type: 'floorUp', floor: s.floor })
  } else {
    s.killsInFloor++
    if (s.killsInFloor >= B.MOBS_PER_FLOOR) {
      s.killsInFloor = 0
      if (isBossFloor(s.floor)) {
        s.bossFailed = false // farm 一輪後自動重新挑戰 Boss
      } else {
        s.floor++
        events.push({ type: 'floorUp', floor: s.floor })
      }
    }
  }
  s.highestFloor = Math.max(s.highestFloor, s.floor)
  spawnEnemy(s)
}

/**
 * 單一 tick 最多結算幾隻怪。HP 每層指數成長,正常情況幾隻內就會收斂,
 * 這個上限只是防呆(避免極端狀態下單 tick 卡住)。
 */
const MAX_KILLS_PER_TICK = 500

/** 固定 tick;dtMs 由外部 game loop 提供 */
export function applyTick(s: GameState, dtMs: number): GameEvent[] {
  const raw: GameEvent[] = []

  // 戰意衰減(重裝步兵衰減減半)
  const decay = B.MORALE_DECAY * (1 - (JOBS[s.jobId].bonus.morale ?? 0))
  s.morale = Math.max(0, s.morale - decay * dtMs)

  const dt = dtMs / 1000
  let dmg = currentDPS(s).mul(dt) // 本 tick 的總傷害量

  // 溢出傷害要帶到下一隻,否則推進速度會被 tick 頻率鎖死
  // (實測:Lv.80 時每 tick 只殺一隻會讓實際進度比數值模型慢 4.8 倍)
  for (let i = 0; i < MAX_KILLS_PER_TICK; i++) {
    if (s.enemyHp.gt(dmg)) {
      s.enemyHp = s.enemyHp.sub(dmg)
      dmg = D(0)
      break
    }
    dmg = dmg.sub(s.enemyHp)
    s.enemyHp = D(0)
    reward(s, s.isBoss, raw)
    nextEnemy(s, raw)
    if (dmg.lte(0)) break
  }

  if (s.isBoss && s.enemyHp.gt(0)) {
    s.bossTimeLeft -= dt
    if (s.bossTimeLeft <= 0) {
      // DPS check 失敗 → 退回該層 farm
      s.bossFailed = true
      s.killsInFloor = 0
      raw.push({ type: 'bossFail', floor: s.floor })
      spawnEnemy(s)
    }
  }
  return mergeKills(raw)
}

/** 高 DPS 時單 tick 可能殺掉幾十隻,合併成一則事件,演出層不必被灌爆 */
function mergeKills(events: GameEvent[]): GameEvent[] {
  const out: GameEvent[] = []
  let acc: GameEvent | null = null
  for (const e of events) {
    if (e.type === 'kill') {
      if (acc) {
        acc.gold = acc.gold!.add(e.gold!)
        acc.count = (acc.count ?? 1) + 1
      } else {
        acc = { ...e, count: 1 }
      }
      continue
    }
    if (acc) {
      out.push(acc)
      acc = null
    }
    out.push(e)
  }
  if (acc) out.push(acc)
  return out
}

/** 點擊:疊戰意(點擊強化自動攻擊,不另計傷害) */
export function click(s: GameState): void {
  const clickBonus = equipBonuses(s.equipped).clickDmg
  s.morale = Math.min(B.MORALE_MAX, s.morale + B.MORALE_PER_CLICK * (1 + clickBonus))
}

/** 手動重新挑戰 Boss */
export function retryBoss(s: GameState): boolean {
  if (!s.bossFailed || !isBossFloor(s.floor)) return false
  s.bossFailed = false
  s.killsInFloor = 0
  spawnEnemy(s)
  return true
}

// ---------- 養成 ----------

export function buyLevels(s: GameState, count = 1): number {
  let bought = 0
  for (let i = 0; i < count; i++) {
    const cost = upCost(s.lv)
    if (s.gold.lt(cost)) break
    s.gold = s.gold.sub(cost)
    s.lv++
    bought++
  }
  return bought
}

export function buyMaxLevels(s: GameState): number {
  return buyLevels(s, affordableLevels(s.lv, s.gold))
}

export function promote(s: GameState, jobId: 'infantry' | 'scout'): boolean {
  if (s.jobId !== 'rookie' || s.lv < JOBS[jobId].reqLv) return false
  s.jobId = jobId
  return true
}

// ---------- 鍛造 ----------

export function forge(s: GameState, rng: Rng = Math.random): Equipment | null {
  if (s.materials < B.FORGE_COST) return null
  s.materials -= B.FORGE_COST

  const e = rollEquipment(rng, {
    forgeCount: s.forgeCount,
    guaranteePurple: s.pityCount >= B.PITY_FORGE,
  })

  s.forgeCount++
  // 保底計數:出紫以上就歸零
  s.pityCount = QUALITIES.indexOf(e.quality) >= QUALITIES.indexOf('purple') ? 0 : s.pityCount + 1

  s.inventory.push(e)
  return e
}

/** 距離保底還差幾次(UI 顯示用) */
export function pityLeft(s: GameState): number {
  return Math.max(0, B.PITY_FORGE - s.pityCount)
}

export function equip(s: GameState, id: string): boolean {
  const idx = s.inventory.findIndex((e) => e.id === id)
  if (idx < 0) return false
  const e = s.inventory[idx]
  const old = s.equipped[e.slot]
  s.equipped[e.slot] = e
  s.inventory.splice(idx, 1)
  if (old) s.inventory.push(old)
  return true
}

export function unequip(s: GameState, slot: Slot): boolean {
  const e = s.equipped[slot]
  if (!e) return false
  s.equipped[slot] = null
  s.inventory.push(e)
  return true
}

export function salvage(s: GameState, id: string): number {
  const idx = s.inventory.findIndex((e) => e.id === id)
  if (idx < 0) return 0
  const e = s.inventory[idx]
  s.inventory.splice(idx, 1)
  const back = SALVAGE_RETURN[e.quality]
  s.materials += back
  return back
}

// ---------- 轉生 ----------

export function pendingMedals(s: GameState): number {
  return medalsFromFloor(s.highestFloor)
}

/** 可帶走的傳家寶(已裝備 + 背包,依評分排序),UI 用來讓玩家挑 */
export function heirloomCandidates(s: GameState): Equipment[] {
  const equipped = SLOTS.map((slot) => s.equipped[slot]).filter((e): e is Equipment => !!e)
  return [...equipped, ...s.inventory].sort((a, b) => score(b) - score(a))
}

/**
 * 轉生。heirloomIds 指定帶到下一代的裝備(上限 B.HEIRLOOM_SLOTS 件),
 * 其餘等級/金幣/素材/裝備全歸零。
 */
export function prestige(s: GameState, heirloomIds: string[] = []): GameState | null {
  const gain = pendingMedals(s)
  if (gain <= 0) return null

  const pool = heirloomCandidates(s)
  const keep = heirloomIds
    .slice(0, B.HEIRLOOM_SLOTS)
    .map((id) => pool.find((e) => e.id === id))
    .filter((e): e is Equipment => !!e)

  const next = createInitialState(s.medals + gain, s.runs + 1)
  next.inventory = keep
  next.forgeCount = s.forgeCount // 鐵匠鋪等級不隨轉生歸零
  next.pityCount = s.pityCount // 保底計數跨轉生保留
  return next
}

// ---------- 離線收益 ----------

export interface OfflineResult {
  seconds: number
  gold: Decimal
  capped: boolean
}

export function computeOffline(s: GameState, elapsedMs: number): OfflineResult {
  const capSec = B.OFFLINE_CAP_HOURS * 3600
  const raw = Math.max(0, elapsedMs / 1000)
  const sec = Math.min(raw, capSec)
  return {
    seconds: sec,
    gold: goldPerSec(s).mul(sec).mul(B.OFFLINE_RATE),
    capped: raw > capSec,
  }
}
