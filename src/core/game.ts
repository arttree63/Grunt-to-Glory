import * as B from './balance'
import { D, Decimal } from './decimal'
import {
  bossPartSlot,
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
  critMultiplier,
  goldDrop,
  heroDPS,
  isBossFloor,
  medalsFromFloor,
  mobHP,
  upCost,
} from './formulas'
import { JOBS } from './jobs'
import { SKILLS } from './skills'
import { ALL_PATHS, DESTINY_NODES, DESTINY_PATHS, hasNode, pendingChoice } from './destiny'
import { makeChronicleEntry } from './chronicle'
import { ENCOUNTER_ORDER } from './encounters'
import {
  canBuyTech,
  emptyTechs,
  heirloomSlots,
  techById,
  techDamageMult,
  techGoldMult,
  techOfflineHours,
  techStartGold,
} from './techs'
import type {
  DestinyNodeId,
  DestinyPathId,
  EncounterId,
  Equipment,
  EventKind,
  GameEvent,
  GameState,
  JobId,
  SkillId,
  Slot,
  TechId,
  Techs,
} from './types'

/**
 * 所有函式直接改動傳入的 state(呼叫端負責產生新參考給 React),
 * 並回傳本次發生的事件供演出層使用。core 不 import React/Pixi。
 */

export function createInitialState(medals = 0, runs = 0, techs: Techs = emptyTechs()): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    lv: 1,
    gold: D(techStartGold(techs)),
    jobId: 'rookie',
    floor: 1,
    highestFloor: 1,
    killsInFloor: 0,
    isBoss: false,
    enemyHp: D(0),
    enemyMaxHp: D(0),
    bossTimeLeft: B.BOSS_TIME,
    bossFailed: false,
    bossRetryFloor: null,
    morale: 0,
    forgeHeatMaterials: 0,
    codex: [],
    chronicle: [],
    runStart: { medals, forgeCount: 0, codexCount: 0 },
    bossKills: 0,
    destinyPath: null,
    destinyNodes: [],
    destinyPoints: 0,
    destinyEarned: 0,
    skillCd: {},
    buff: null,
    event: null,
    eventCooldown: B.EVENT_INTERVAL_AVG,
    encounters: [],
    nextEncounterFloor: B.ENCOUNTER_EVERY_FLOORS,
    eventKindsDone: [],
    goldenPending: false,
    routeBuff: null,
    barterUsed: 0,
    combo: 0,
    comboIdle: 0,
    charging: false,
    chargeStacks: 0,
    chargeBurstLeft: 0,
    valiantStacks: 0,
    materials: 0,
    forgeCount: 0,
    pityCount: 0,
    pityLegendary: 0,
    partMaterials: { weapon: 0, head: 0, body: 0, boots: 0, trinket: 0 },
    eliteMaterials: 0,
    maxBossKilled: 0,
    lastEliteDay: '',
    inventory: [],
    equipped: { weapon: null, head: null, body: null, boots: null, trinket: null },
    medals,
    runs,
    techs,
    lastSaved: Date.now(),
  }
  spawnEnemy(s)
  return s
}

export const SAVE_VERSION = 12

// ---------- 數值查詢 ----------

/** 金幣總乘區:裝備詞條(加法)× 後勤補給科技(乘法) */
export function goldMult(s: GameState): number {
  return (
    (1 + equipBonuses(s.equipped).gold + (JOBS[s.jobId].bonus.gold ?? 0)) * techGoldMult(s.techs)
  )
}

export function critRate(s: GameState): number {
  const buffCrit = s.buff ? (SKILLS[s.buff.skillId].critAdd ?? 0) : 0
  return B.CRIT_RATE + equipBonuses(s.equipped).crit + (JOBS[s.jobId].bonus.crit ?? 0) + buffCrit
}

/** 技能 buff 的傷害乘區 */
export function buffMult(s: GameState): number {
  return s.buff ? (SKILLS[s.buff.skillId].dmgMult ?? 1) : 1
}

export function currentDPS(s: GameState): Decimal {
  const bonus = equipBonuses(s.equipped)
  const job = JOBS[s.jobId].bonus
  return heroDPS({
    lv: s.lv,
    techMult: techDamageMult(s.techs),
    equipBonus: bonus.dmg + (job.dmg ?? 0),
    morale: s.morale,
    critMult: critMultiplier(critRate(s)),
    buffMult: buffMult(s) * comboMult(s) * chargeMult(s) * valiantMult(s),
  }).mul(equipPower(s.equipped)) // 每件裝備獨立乘區
}

export interface DpsPart {
  label: string
  mult: number
}

/** DPS 各乘區來源,讓玩家看得到自己變強在哪 */
export function dpsBreakdown(s: GameState): DpsPart[] {
  const bonus = equipBonuses(s.equipped)
  const job = JOBS[s.jobId]
  return [
    { label: `等級 Lv.${s.lv}`, mult: Math.pow(B.DMG_PER_LV, s.lv - 1) },
    { label: `職業 ${job.name}`, mult: 1 + (job.bonus.dmg ?? 0) },
    { label: '轉生科技', mult: techDamageMult(s.techs) },
    { label: '裝備品質', mult: equipPower(s.equipped) },
    { label: '裝備詞條', mult: 1 + bonus.dmg },
    { label: '戰意', mult: 1 + s.morale * B.MORALE_DMG_PER_POINT },
  ]
}

/** Boss 檢定還差多少倍 DPS(>1 代表打不過)。floor 省略時用當前層 */
export function bossGap(s: GameState, floor = s.floor): number {
  const need = bossHP(floor).div(B.BOSS_TIME)
  return need.div(currentDPS(s)).toNumber()
}

/** 每秒 farm 金幣期望(離線收益與 UI 用) */
export function goldPerSec(s: GameState): Decimal {
  const dps = currentDPS(s)
  const floor = Math.max(1, s.floor)
  const clearTime = mobHP(floor).mul(B.MOBS_PER_FLOOR).div(dps).toNumber() + 2
  return goldDrop(floor).mul(B.MOBS_PER_FLOOR).mul(goldMult(s)).div(Math.max(0.1, clearTime))
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

function reward(s: GameState, boss: boolean, events: GameEvent[], rng: Rng = Math.random) {
  const mult = boss ? B.BOSS_GOLD_MULT : 1
  // 連斬:每次擊殺 +1 層並重置衰減視窗
  if (hasNode(s, 'tactician_start')) {
    s.combo = Math.min(B.COMBO_MAX, s.combo + 1)
    s.comboIdle = 0
  }
  const routeGold = s.routeBuff?.kind === 'gold' ? B.ROUTE_BUFF_MULT : 1
  const g = goldDrop(s.floor).mul(mult).mul(goldMult(s)).mul(routeGold)
  s.gold = s.gold.add(g)
  const routeMat = s.routeBuff?.kind === 'material' ? B.ROUTE_BUFF_MULT : 1
  const gained = (boss ? B.BOSS_MATERIALS : B.MATERIAL_PER_MOB) * routeMat
  s.materials += gained
  s.forgeHeatMaterials += gained
  events.push({ type: boss ? 'bossKill' : 'kill', gold: g, floor: s.floor })

  if (!boss) return
  s.bossKills++
  tickLivingWeapon(s, events)
  // 部位素材:首殺必掉,重複擊殺機率掉
  const first = s.floor > s.maxBossKilled
  if (first) s.maxBossKilled = s.floor
  if (first || rng() < B.PART_DROP_REPEAT) {
    const slot = bossPartSlot(s.floor)
    s.partMaterials[slot]++
    events.push({ type: 'partDrop', slot, floor: s.floor })
  }
}

/** 每日首次擊破 Boss 保底 1 個菁英素材(留存鉤子)。日期由呼叫端提供,core 不碰時鐘 */
export function claimDailyElite(s: GameState, today: string): boolean {
  if (s.lastEliteDay === today) return false
  s.lastEliteDay = today
  s.eliteMaterials += B.ELITE_DAILY_BOSS
  return true
}

function nextEnemy(s: GameState, events: GameEvent[]) {
  if (s.isBoss) {
    // Boss 被擊破 → 進下一層
    s.floor++
    s.killsInFloor = 0
    s.bossFailed = false
    s.bossRetryFloor = null
    s.valiantStacks = 0
    if (hasNode(s, 'tactician_1a')) s.combo = 0 // 破陣:Boss 戰結束後清空
    events.push({ type: 'floorUp', floor: s.floor })
  } else {
    s.killsInFloor++
    if (s.killsInFloor >= B.MOBS_PER_FLOOR) {
      s.killsInFloor = 0
      if (s.bossRetryFloor !== null) {
        // 在前一層 farm 完一輪 → 自動再挑戰(掛機玩家不會卡死)
        s.floor = s.bossRetryFloor
        s.bossFailed = false
        s.bossRetryFloor = null
        events.push({ type: 'floorUp', floor: s.floor })
      } else {
        s.floor++
        events.push({ type: 'floorUp', floor: s.floor })
      }
    }
  }
  s.highestFloor = Math.max(s.highestFloor, s.floor)
  if (s.routeBuff) {
    s.routeBuff.floorsLeft--
    if (s.routeBuff.floorsLeft <= 0) s.routeBuff = null
  }
  spawnEnemy(s)
}

/**
 * 單一 tick 最多結算幾隻怪。HP 每層指數成長,正常情況幾隻內就會收斂,
 * 這個上限只是防呆(避免極端狀態下單 tick 卡住)。
 */
const MAX_KILLS_PER_TICK = 500

/** 固定 tick;dtMs 由外部 game loop 提供。rng 可注入以便模擬可重現 */
export function applyTick(s: GameState, dtMs: number, rng: Rng = Math.random): GameEvent[] {
  const raw: GameEvent[] = []

  // 戰意衰減(重裝步兵衰減減半)
  const decay = B.MORALE_DECAY * (1 - (JOBS[s.jobId].bonus.morale ?? 0))
  s.morale = Math.max(0, s.morale - decay * dtMs)

  const dt = dtMs / 1000
  tickSkills(s, dt)
  tickTactician(s, dt)
  grantDestinyPoints(s, raw)
  if (s.charging) return mergeKills(raw) // 蓄勢期間停止輸出
  let dmg = currentDPS(s).mul(dt) // 本 tick 的總傷害量

  // 突發事件優先吃傷害:出現期間取代當前目標
  if (s.event) {
    s.event.hp = s.event.hp.sub(dmg)
    s.event.timeLeft -= dt
    if (s.event.hp.lte(0)) {
      rewardEvent(s, s.event.kind, raw, rng)
      s.event = null
      s.eventCooldown = eventInterval(rng, s)
    } else if (s.event.timeLeft <= 0) {
      // 誘餌箱:逃走仍留下較低階獎勵
      if (hasNode(s, 'hunter_2a')) {
        const g = eventGold(s, s.event.kind).mul(B.BAIT_CONSOLATION)
        s.gold = s.gold.add(g)
        raw.push({ type: 'eventEscape', kind: s.event.kind, gold: g })
      } else {
        raw.push({ type: 'eventEscape', kind: s.event.kind })
      }
      s.event = null
      s.eventCooldown = eventInterval(rng, s)
    }
    return mergeKills(raw) // 事件期間不推進一般戰鬥
  }

  if (!s.isBoss) spawnEncounter(s, raw, rng)

  // 一般層才會刷事件(Boss 戰不打斷)
  if (!s.isBoss) {
    s.eventCooldown -= dt
    if (s.eventCooldown <= 0) spawnEvent(s, raw, rng)
  }

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
    reward(s, s.isBoss, raw, rng)
    nextEnemy(s, raw)
    if (dmg.lte(0)) break
  }

  if (s.isBoss && s.enemyHp.gt(0)) {
    s.bossTimeLeft -= dt
    if (s.bossTimeLeft <= 0) {
      // DPS check 失敗 → 退回前一層 farm(玩家心智模型:打不過就退一層)
      s.bossFailed = true
      if (hasNode(s, 'tactician_2a')) s.valiantStacks = Math.min(B.VALIANT_MAX, s.valiantStacks + 1)
      s.bossRetryFloor = s.floor
      s.floor = Math.max(1, s.floor - 1)
      s.killsInFloor = 0
      raw.push({ type: 'bossFail', floor: s.bossRetryFloor })
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

/** 事件間隔:平均值上下 ±50% 隨機,避免玩家精算時間 */
function eventInterval(rng: Rng, s?: GameState): number {
  const rate = s && hasNode(s, 'hunter_3b') ? B.FORBIDDEN_RATE_MULT : 1
  return B.EVENT_INTERVAL_AVG * rate * (0.5 + rng())
}

function spawnEvent(s: GameState, events: GameEvent[], rng: Rng) {
  const kind: EventKind = rng() < 0.5 ? 'chest' : 'goblin'
  const hp = mobHP(s.floor).mul(B.EVENT_HP_MULT)
  const time = B.EVENT_TIME * (hasNode(s, 'hunter_1b') ? B.PATIENT_TIME_MULT : 1)
  s.event = { kind, hp, maxHp: hp, timeLeft: time }
  events.push({ type: 'eventSpawn', kind })
}

/** 事件基礎金幣 */
function eventGold(s: GameState, kind: EventKind): Decimal {
  const mult = kind === 'chest' ? B.CHEST_GOLD_MULT : B.GOBLIN_GOLD_MULT
  return goldDrop(s.floor).mul(mult).mul(goldMult(s))
}

function rewardEvent(s: GameState, kind: EventKind, events: GameEvent[], rng: Rng) {
  let g = eventGold(s, kind)

  // 追跡者:打得越快(剩餘時間比例越高)獎勵越高
  if (hasNode(s, 'hunter_1a') && s.event) {
    const maxTime = B.EVENT_TIME * (hasNode(s, 'hunter_1b') ? B.PATIENT_TIME_MULT : 1)
    g = g.mul(1 + (s.event.timeLeft / maxTime) * B.TRACKER_BONUS)
  }
  // 耐心獵人:獎勵品質提高
  if (hasNode(s, 'hunter_1b')) g = g.mul(B.PATIENT_REWARD_MULT)
  // 黃金路線:湊滿種類後的下一次事件保證高價值
  if (s.goldenPending) {
    g = g.mul(B.GOLDEN_REWARD_MULT)
    s.goldenPending = false
  }

  s.gold = s.gold.add(g)

  // 寶箱怪小機率掉菁英素材(菁英素材的主要來源之一)
  let elite = kind === 'chest' && rng() < B.ELITE_FROM_CHEST
  // 禁忌地圖:事件必掉一個部位素材
  if (hasNode(s, 'hunter_3b')) {
    s.partMaterials[bossPartSlot(Math.max(10, s.floor))]++
    if (kind === 'chest' && rng() < B.ELITE_FROM_CHEST) elite = true
  }
  if (elite) s.eliteMaterials++

  markEventKind(s, kind)
  events.push({ type: 'eventKill', kind, gold: g, count: elite ? 1 : 0 })
}

/** 黃金路線:完成三種不同事件就預約一次高價值事件 */
function markEventKind(s: GameState, kind: string) {
  if (!s.eventKindsDone.includes(kind)) s.eventKindsDone.push(kind)
  if (hasNode(s, 'hunter_3a') && s.eventKindsDone.length >= B.GOLDEN_KINDS_NEEDED) {
    s.eventKindsDone = []
    s.goldenPending = true
  }
}

/** 點擊:疊戰意(點擊強化自動攻擊,不另計傷害) */
export function click(s: GameState): void {
  const clickBonus = equipBonuses(s.equipped).clickDmg
  s.morale = Math.min(B.MORALE_MAX, s.morale + B.MORALE_PER_CLICK * (1 + clickBonus))
}

/** 手動重新挑戰 Boss */
/** 手動挑戰 Boss:從 farm 的前一層直接回到 Boss 層,不必等清完小怪 */
export function retryBoss(s: GameState): boolean {
  if (!s.bossFailed || s.bossRetryFloor === null) return false
  s.floor = s.bossRetryFloor
  s.bossFailed = false
  s.bossRetryFloor = null
  s.killsInFloor = 0
  spawnEnemy(s)
  return true
}

// ---------- 命運樹 ----------

/** 選擇本輪的命運路徑,同時獲得起始能力。一輪只能選一次 */
export function chooseDestiny(s: GameState, path: DestinyPathId): boolean {
  if (s.destinyPath !== null) return false
  s.destinyPath = path
  s.destinyNodes = [DESTINY_PATHS[path].start]
  return true
}

/** 花一枚命運點解鎖節點。二選一的另一個從此關閉(本輪) */
export function pickDestinyNode(s: GameState, id: DestinyNodeId): boolean {
  if (s.destinyPoints <= 0) return false
  const choice = pendingChoice(s)
  if (!choice || !choice.some((n) => n.id === id)) return false
  s.destinyPoints--
  s.destinyNodes.push(id)
  return true
}

/** 里程碑發點。用當輪層數,每輪重新來過 */
function grantDestinyPoints(s: GameState, events: GameEvent[]) {
  const next = B.DESTINY_MILESTONES[s.destinyEarned]
  if (next === undefined || s.floor < next) return
  // 未使用的點滿了就停發,但不擋推進(掛機玩家回來不必連點十次)
  if (s.destinyPoints >= B.DESTINY_POINT_CAP) return
  s.destinyPoints++
  s.destinyEarned++
  events.push({ type: 'destinyPoint', floor: s.floor })
}

export const destinyPaths = () => ALL_PATHS
export const destinyNode = (id: DestinyNodeId) => DESTINY_NODES[id]

// ---------- 主動技能 ----------

/** 實際冷卻(受智力縮減) */
export function skillCooldown(_s: GameState, id: SkillId): number {
  return SKILLS[id].cd
}

export function skillReady(s: GameState, id: SkillId): boolean {
  return (s.skillCd[id] ?? 0) <= 0 && JOBS[s.jobId].skills.includes(id)
}

/**
 * 施放技能。buff 型覆蓋當前 buff;立即傷害型直接扣目標血量
 * (吃智力的技能傷害加成,是突破 Boss 檢定的主要工具)
 */
export function castSkill(s: GameState, id: SkillId): GameEvent[] {
  if (!skillReady(s, id)) return []
  const sk = SKILLS[id]
  s.skillCd[id] = skillCooldown(s, id)
  const events: GameEvent[] = [{ type: 'skill', skillId: id }]

  if (sk.burstSeconds) {
    const dmg = currentDPS(s).mul(sk.burstSeconds)
    if (s.event) {
      s.event.hp = s.event.hp.sub(dmg)
    } else {
      s.enemyHp = s.enemyHp.sub(dmg)
    }
  } else if (sk.duration) {
    s.buff = { skillId: id, timeLeft: sk.duration }
  }
  return events
}

function tickSkills(s: GameState, dt: number) {
  for (const id of Object.keys(s.skillCd) as SkillId[]) {
    const left = (s.skillCd[id] ?? 0) - dt
    if (left <= 0) delete s.skillCd[id]
    else s.skillCd[id] = left
  }
  if (s.buff) {
    s.buff.timeLeft -= dt
    if (s.buff.timeLeft <= 0) s.buff = null
  }
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

export function promote(s: GameState, jobId: JobId): boolean {
  const job = JOBS[jobId]
  if (job.from !== s.jobId || s.lv < job.reqLv) return false
  s.jobId = jobId
  return true
}

// ---------- 戰術家流派 ----------

/** 連斬:每層固定加成,有上限 */
export function comboMult(s: GameState): number {
  return 1 + s.combo * B.COMBO_DMG
}

/** 蓄勢爆發中的傷害倍率 */
export function chargeMult(s: GameState): number {
  return s.chargeBurstLeft > 0 ? 1 + s.chargeStacks * B.CHARGE_DMG : 1
}

/** 越戰越勇:只在 Boss 戰生效 */
export function valiantMult(s: GameState): number {
  return s.isBoss ? 1 + s.valiantStacks * B.VALIANT_DMG : 1
}

/** 開始/結束蓄勢。蓄勢期間不輸出,換取結束後的短時爆發 */
export function toggleCharge(s: GameState): boolean {
  if (!hasNode(s, 'tactician_1b')) return false
  if (s.charging) {
    s.charging = false
    if (s.chargeStacks > 0) s.chargeBurstLeft = B.CHARGE_BURST_SEC
  } else {
    s.charging = true
    s.chargeStacks = 0
    s.chargeBurstLeft = 0
  }
  return true
}

function tickTactician(s: GameState, dt: number) {
  if (!hasNode(s, 'tactician_start')) return

  // 連斬:一段時間沒擊殺就開始逐層衰減。破陣讓 Boss 戰期間不衰減
  const holdInBoss = s.isBoss && hasNode(s, 'tactician_1a')
  if (!holdInBoss) {
    s.comboIdle += dt
    if (s.comboIdle > B.COMBO_WINDOW_SEC && s.combo > 0) {
      const decaySteps = Math.floor((s.comboIdle - B.COMBO_WINDOW_SEC) / B.COMBO_DECAY_SEC)
      if (decaySteps > 0) {
        s.combo = Math.max(0, s.combo - decaySteps)
        s.comboIdle = B.COMBO_WINDOW_SEC
      }
    }
  }

  // 蓄勢
  if (s.charging && s.chargeStacks < B.CHARGE_MAX) {
    s.chargeStacks = Math.min(B.CHARGE_MAX, s.chargeStacks + dt / B.CHARGE_SEC)
  }
  if (s.chargeBurstLeft > 0) {
    s.chargeBurstLeft -= dt
    if (s.chargeBurstLeft <= 0) s.chargeStacks = 0
  }
}

// ---------- 留存事件(旅途紀錄) ----------

/**
 * 留存事件不限時、不打斷戰鬥,累積在旅途紀錄裡等玩家回來處理。
 * 命運相關的分支只能放這裡——放進限時事件會讓掛機玩家永遠拿不到。
 */
function spawnEncounter(s: GameState, events: GameEvent[], rng: Rng) {
  if (s.floor < s.nextEncounterFloor) return
  s.nextEncounterFloor = s.floor + B.ENCOUNTER_EVERY_FLOORS
  if (s.encounters.length >= B.ENCOUNTER_CAP) return
  const id = ENCOUNTER_ORDER[Math.floor(rng() * ENCOUNTER_ORDER.length)]
  s.encounters.push({ id, floor: s.floor })
  events.push({ type: 'encounter', encounterId: id, floor: s.floor })
}

/** 處理旅途紀錄裡的一個事件 */
export function resolveEncounter(s: GameState, id: EncounterId, choiceId: string): boolean {
  const idx = s.encounters.findIndex((e) => e.id === id)
  if (idx < 0) return false
  const enc = s.encounters[idx]
  const price = goldDrop(enc.floor).mul(40)

  if (id === 'blacksmith') {
    if (choiceId === 'help') {
      if (s.gold.lt(price)) return false
      s.gold = s.gold.sub(price)
      s.eliteMaterials++
    } else {
      s.gold = s.gold.add(price.div(3))
    }
  } else if (id === 'merchant') {
    if (choiceId === 'buy') {
      if (s.gold.lt(price)) return false
      s.gold = s.gold.sub(price)
      s.materials += B.FORGE_COST * 3
    } else {
      if (s.materials < B.FORGE_COST) return false
      s.materials -= B.FORGE_COST
      s.gold = s.gold.add(price)
    }
  } else {
    s.routeBuff = { kind: choiceId === 'left' ? 'material' : 'gold', floorsLeft: B.ROUTE_BUFF_FLOORS }
  }

  s.encounters.splice(idx, 1)
  markEventKind(s, id)
  return true
}

/** 命運交易:放棄事件獎勵換一枚命運點,每輪有上限 */
export function barterForDestiny(s: GameState): boolean {
  if (!hasNode(s, 'hunter_2b')) return false
  if (s.barterUsed >= B.BARTER_MAX_PER_RUN) return false
  if (s.destinyPoints >= B.DESTINY_POINT_CAP) return false
  if (s.eventKindsDone.length === 0) return false // 至少完成過一次事件
  s.barterUsed++
  s.eventKindsDone = []
  s.destinyPoints++
  return true
}

// ---------- 神匠流派 ----------

/** 爐火層數:距上次打造累積的素材越多,層數越高(忍住不打造的回報) */
export function forgeHeat(s: GameState): number {
  if (!hasNode(s, 'artisan_start')) return 0
  return Math.min(B.HEAT_MAX_LAYERS, Math.floor(s.forgeHeatMaterials / B.FORGE_COST))
}

export function forgeHeatBonus(s: GameState): number {
  return forgeHeat(s) * B.HEAT_PER_LAYER
}

/** 打造後結算:清爐火,並處理餘火回收 */
function afterForge(s: GameState, e: Equipment, cost: number) {
  s.forgeHeatMaterials = 0
  // 餘火回收:打出來比身上該部位差 → 退素材
  if (hasNode(s, 'artisan_1a')) {
    const cur = s.equipped[e.slot]
    if (cur && score(cur) > score(e)) {
      s.materials += Math.floor(cost * B.EMBER_REFUND)
    }
  }
}

/** 武器吞噬:讓現有武器吃掉一件武器,換取成長 */
export function devourWeapon(s: GameState, foodId: string): boolean {
  if (!hasNode(s, 'artisan_2a')) return false
  const weapon = s.equipped.weapon
  if (!weapon) return false
  const idx = s.inventory.findIndex((e) => e.id === foodId && e.slot === 'weapon')
  if (idx < 0) return false
  const grown = Math.round(((weapon.growth ?? 1) - 1) / B.DEVOUR_GROWTH)
  if (grown >= B.DEVOUR_MAX) return false

  s.inventory.splice(idx, 1)
  weapon.growth = (weapon.growth ?? 1) + B.DEVOUR_GROWTH
  return true
}

/** 活體神兵:擊破 Boss 累積,武器自動進化 */
function tickLivingWeapon(s: GameState, events: GameEvent[]) {
  if (!hasNode(s, 'artisan_3b')) return
  const w = s.equipped.weapon
  if (!w) return
  const steps = Math.min(B.LIVING_MAX_STEPS, Math.floor(s.bossKills / B.LIVING_BOSS_PER_STEP))
  if (steps <= (w.livingSteps ?? 0)) return
  const gain = steps - (w.livingSteps ?? 0)
  w.livingSteps = steps
  w.growth = (w.growth ?? 1) + gain * B.LIVING_GROWTH
  events.push({ type: 'weaponEvolve', slot: 'weapon' })
}

// ---------- 鍛造 ----------

export interface ForgeOptions {
  /** 孤注一擲:雙倍素材換品質下限 +1 階 */
  allIn?: boolean
}

export function forge(s: GameState, rng: Rng = Math.random, opts: ForgeOptions = {}): Equipment | null {
  const allIn = !!opts.allIn && hasNode(s, 'artisan_1b')
  const cost = allIn ? B.FORGE_COST * B.ALLIN_COST_MULT : B.FORGE_COST
  if (s.materials < cost) return null
  s.materials -= cost

  const e = rollEquipment(rng, {
    forgeCount: s.forgeCount,
    heatBonus: forgeHeatBonus(s),
    minQualityBoost: allIn ? 1 : 0,
    guaranteePurple: s.pityCount >= B.PITY_FORGE,
  })

  s.forgeCount++
  // 保底計數:出紫以上就歸零(傳奇保底只由精工累計,普通鍛造不推進)
  s.pityCount = QUALITIES.indexOf(e.quality) >= QUALITIES.indexOf('purple') ? 0 : s.pityCount + 1

  afterForge(s, e, cost)
  s.inventory.push(e)
  return e
}

/** 距離普通鍛造保底還差幾次(UI 顯示用) */
export function pityLeft(s: GameState): number {
  return Math.max(0, B.PITY_FORGE - s.pityCount)
}

/** 距離精工鍛造傳奇保底還差幾次 */
export function pityLegendaryLeft(s: GameState): number {
  return Math.max(0, B.PITY_LEGENDARY - s.pityLegendary)
}

export interface FineForgeOptions {
  /** 投入部位素材 → 鎖定部位 */
  slot?: Slot
  /** 投入菁英素材 → 品質下限紫 */
  useElite?: boolean
}

export function canFineForge(s: GameState, opts: FineForgeOptions): boolean {
  if (s.materials < B.FINE_FORGE_COST) return false
  if (opts.slot && s.partMaterials[opts.slot] < 1) return false
  if (opts.useElite && s.eliteMaterials < 1) return false
  return true
}

/** 精工鍛造:素材決定鎖部位與品質下限,所見即所得 */
export function fineForge(s: GameState, opts: FineForgeOptions, rng: Rng = Math.random): Equipment | null {
  if (!canFineForge(s, opts)) return null
  s.materials -= B.FINE_FORGE_COST
  if (opts.slot) s.partMaterials[opts.slot]--
  if (opts.useElite) s.eliteMaterials--

  const inscribe = hasNode(s, 'artisan_2b')
  const e = rollEquipment(rng, {
    forgeCount: s.forgeCount,
    heatBonus: forgeHeatBonus(s),
    extraAffix: inscribe && rng() < B.INSCRIBE_AFFIX_CHANCE ? 1 : 0,
    guaranteePurple: opts.useElite || s.pityCount >= B.PITY_FORGE,
    guaranteeGold: s.pityLegendary >= B.PITY_LEGENDARY,
    lockSlot: opts.slot,
  })

  // 精工銘刻:出低於菁英視為失敗,退還部分素材
  if (inscribe && QUALITIES.indexOf(e.quality) < QUALITIES.indexOf('purple')) {
    s.materials += Math.floor(B.FINE_FORGE_COST * B.INSCRIBE_REFUND)
  }

  s.forgeCount++
  const qi = QUALITIES.indexOf(e.quality)
  s.pityCount = qi >= QUALITIES.indexOf('purple') ? 0 : s.pityCount + 1
  s.pityLegendary = qi >= QUALITIES.indexOf('gold') ? 0 : s.pityLegendary + 1

  afterForge(s, e, B.FINE_FORGE_COST)
  s.inventory.push(e)
  return e
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
    .slice(0, heirloomSlots(s.techs))
    .map((id) => pool.find((e) => e.id === id))
    .filter((e): e is Equipment => !!e)

  const next = createInitialState(s.medals + gain, s.runs + 1, { ...s.techs })

  // 傳家之器:本輪最高階裝備登錄傳承圖鑑(跨轉生保留)
  next.codex = [...s.codex]
  if (hasNode(s, 'artisan_3a')) {
    const best = heirloomCandidates(s)[0]
    if (best && !next.codex.some((c) => c.id === best.id)) next.codex.push({ ...best })
  }
  // 圖鑑收藏有機率讓下一代開局就拿到殘缺版(品質降一階)
  if (next.codex.length > 0 && Math.random() < B.HEIRLOOM_CODEX_CHANCE) {
    const pick = next.codex[Math.floor(Math.random() * next.codex.length)]
    const qi = Math.max(0, QUALITIES.indexOf(pick.quality) - 1)
    next.inventory.push({
      ...pick,
      id: `codex${Date.now().toString(36)}`,
      quality: QUALITIES[qi],
      growth: 1,
      livingSteps: 0,
    })
  }
  // ⚠️ 用 push 不是覆蓋:上面圖鑑可能已經放了一件殘缺版,
  // 原本寫成 next.inventory = keep 會把它蓋掉,等於傳家之器的跨輪獎勵永遠發不出去
  next.inventory = [...keep, ...next.inventory]
  // 命運樹每輪重新選,不帶過去(跨輪的收藏留給之後的傳承圖鑑)
  next.forgeCount = s.forgeCount // 鐵匠鋪等級不隨轉生歸零
  next.pityCount = s.pityCount // 保底計數跨轉生保留
  next.pityLegendary = s.pityLegendary
  next.maxBossKilled = 0 // 層數歸零,首殺重新計算

  // 歷代小兵列傳:每代留下一段歷史,這就是「小兵的故事」
  const entry = makeChronicleEntry(s, gain, keep[0] ?? null)
  next.chronicle = [entry, ...s.chronicle].slice(0, B.CHRONICLE_MAX)
  next.runStart = { medals: next.medals, forgeCount: next.forgeCount, codexCount: next.codex.length }
  next.lastEliteDay = s.lastEliteDay
  next.eliteMaterials = s.eliteMaterials // 菁英素材是稀有資源,不因轉生沒收
  return next
}

/** 購買轉生科技。勳章是純貨幣,買完就扣 */
export function buyTech(s: GameState, id: TechId): boolean {
  if (!canBuyTech(s.techs, s.medals, id)) return false
  s.medals -= techById(id).cost
  s.techs[id]++
  return true
}

/** 轉生商店:勳章換菁英素材 */
export function buyElite(s: GameState): boolean {
  if (s.medals < B.ELITE_MEDAL_COST) return false
  s.medals -= B.ELITE_MEDAL_COST
  s.eliteMaterials++
  return true
}

// ---------- 離線收益 ----------

export interface OfflineResult {
  seconds: number
  gold: Decimal
  capped: boolean
}

export function computeOffline(s: GameState, elapsedMs: number): OfflineResult {
  const capSec = techOfflineHours(s.techs) * 3600
  const raw = Math.max(0, elapsedMs / 1000)
  const sec = Math.min(raw, capSec)
  return {
    seconds: sec,
    gold: goldPerSec(s).mul(sec).mul(B.OFFLINE_RATE),
    capped: raw > capSec,
  }
}
