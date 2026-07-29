import * as B from './balance'
import { D, Decimal } from './decimal'
import {
  baseMods,
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
import { destinyJobs, JOBS } from './jobs'
import { legendFor } from './legends'
import { MERCS, unlockedMercs } from './mercs'
import { SETS } from './sets'
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
  BaseType,
  DestinyNodeId,
  DestinyPathId,
  EncounterId,
  Equipment,
  EventKind,
  GameEvent,
  GameState,
  JobId,
  LegendId,
  MercId,
  SetTagId,
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
    sigils: 0,
    castOrder: [],
    hourglassLock: 0,
    windUses: 0,
    windAcc: 0,
    relicPending: false,
    relicLeft: 0,
    bannerStored: 0,
    commandReady: false,
    inscribedId: null,
    jobMatrix: {},
    activeMerc: 'hound', // 老獵犬開局就在場上(貼圖早就有了,只是一直沒有行為)
    mercTimer: 10,
    freezeUsedThisBoss: 0,
    freezeLeft: 0,
    frozenPool: D(0),
    burnLeft: 0,
    burnDps: D(0),
    bannerLeft: 0,
    zoneLeft: 0,
    zoneDps: D(0),
    mercBestFloor: 0,
    legendsSeen: [],
    attackAcc: 0,
    eventClickMats: 0,
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

export const SAVE_VERSION = 18

// ---------- 數值查詢 ----------

/** 金幣總乘區:裝備詞條(加法)× 後勤補給科技(乘法) */
export function goldMult(s: GameState): number {
  return (
    (1 + equipBonuses(s.equipped).gold + (JOBS[s.jobId].bonus.gold ?? 0)) * techGoldMult(s.techs)
  )
}

export function critRate(s: GameState): number {
  // 常駐化的 buff(不退之壁)一律取原本視窗的平均值,暴擊型 buff 也不例外——
  // 漏掉這裡的話,疾風連刺的 +60% 暴擊會變成永久,單件傳說直接破 power-neutral
  const sk = s.buff ? SKILLS[s.buff.skillId] : null
  const uptime = s.buff?.permanent && sk ? ((sk.duration ?? 0) / sk.cd) * B.WALL_PERMANENT_BONUS : 1
  const buffCrit = sk ? (sk.critAdd ?? 0) * uptime : 0
  return B.CRIT_RATE + equipBonuses(s.equipped).crit + (JOBS[s.jobId].bonus.crit ?? 0) + buffCrit
}

/** 本職業的既有技能進化(二轉才有);沒有就是 null */
export function skillEvolve(s: GameState) {
  return JOBS[s.jobId].evolve ?? null
}

/** 這個技能在目前職業有沒有進化 */
function evolved(s: GameState, id: SkillId): boolean {
  return JOBS[s.jobId].evolve?.skill === id
}

/** 身上是否帶著某件傳說 */
export function hasLegend(s: GameState, id: LegendId): boolean {
  return SLOTS.some((sl) => s.equipped[sl]?.legend === id)
}

/** 身上所有傳說(UI 用) */
export function activeLegends(s: GameState): LegendId[] {
  return SLOTS.map((sl) => s.equipped[sl]?.legend).filter((l): l is LegendId => !!l)
}

/** 身上帶著幾件同一個套裝標籤(標籤制:不綁部位) */
export function setCount(s: GameState, tag: SetTagId): number {
  return SLOTS.filter((sl) => s.equipped[sl]?.setTag === tag).length
}

/** 已裝備的套裝標籤與件數,UI 直接顯示進度 */
export function setProgress(s: GameState): Array<{ tag: SetTagId; count: number }> {
  return (Object.keys(SETS) as SetTagId[])
    .map((tag) => ({ tag, count: setCount(s, tag) }))
    .filter((p) => p.count > 0)
}

/** 帝國鐵壁 2 件:持續型技能展開的軍陣是否生效中 */
export function ironwallActive(s: GameState): boolean {
  return setCount(s, 'ironwall') >= 2 && !!s.buff && !!SKILLS[s.buff.skillId].duration
}

/** 暴擊傷害加成:詞綴 + 重擊基底 */
export function critDamageBonus(s: GameState): number {
  return equipBonuses(s.equipped).critDmg + baseMods(s.equipped).critDmg
}

/**
 * 技能 buff 的傷害乘區。
 * 不退之壁把「短視窗高倍率」換成「常駐平均倍率」——
 * 平均值直接由原本的視窗與冷卻算出來,所以總輸出不變(power-neutral),
 * 變的是玩家不再需要抓視窗。
 */
export function buffMult(s: GameState): number {
  if (!s.buff) return 1
  const sk = SKILLS[s.buff.skillId]
  if (!sk.dmgMult) return 1
  if (!s.buff.permanent) return sk.dmgMult
  const dur = sk.duration ?? 0
  return ((dur * sk.dmgMult + (sk.cd - dur)) / sk.cd) * B.WALL_PERMANENT_BONUS
}

export function currentDPS(s: GameState): Decimal {
  const bonus = equipBonuses(s.equipped)
  const job = JOBS[s.jobId].bonus
  return heroDPS({
    lv: s.lv,
    techMult: techDamageMult(s.techs),
    equipBonus: bonus.dmg + (job.dmg ?? 0),
    morale: s.morale,
    moraleBoosted: inCheckWindow(s),
    critMult: critMultiplier(critRate(s), critDamageBonus(s)),
    buffMult: buffMult(s) * comboMult(s) * chargeMult(s) * valiantMult(s),
  })
    .mul(equipPower(s.equipped)) // 每件裝備獨立乘區
    .mul(s.isBoss ? 1 + bonus.bossDmg : 1)
    .mul(s.relicLeft > 0 ? B.RELIC_MULT : 1) // 貪婪之眼的遺物弱點
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
    { label: '暴擊期望', mult: critMultiplier(critRate(s), critDamageBonus(s)) },
    { label: '戰意', mult: 1 + s.morale * B.MORALE_DMG_PER_POINT },
    ...(s.isBoss && bonus.bossDmg > 0 ? [{ label: '對 Boss', mult: 1 + bonus.bossDmg }] : []),
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
    s.freezeUsedThisBoss = 0
    // 貪婪之眼:打造出好東西後,下一場 Boss 開場帶著遺物弱點
    if (s.relicPending) {
      s.relicPending = false
      s.relicLeft = B.RELIC_WINDOW
    }
  } else {
    s.isBoss = false
    s.enemyMaxHp = mobHP(s.floor)
  }
  s.enemyHp = s.enemyMaxHp
}

function reward(s: GameState, boss: boolean, events: GameEvent[], rng: Rng = Math.random) {
  const mult = boss ? B.BOSS_GOLD_MULT : 1
  // buff 視窗期間的擊殺會累積印記(軍勢 / 追風印記)。
  // 不退之壁把視窗變成常駐,若照原樣累積會變成每殺必給 → 印記速率暴增。
  // 改為依原本的視窗佔比擲骰,累積速率因此與沒穿時相同。
  if (s.buff && SKILLS[s.buff.skillId].duration) {
    const sk = SKILLS[s.buff.skillId]
    // 堅陣(二轉進化):視窗期間的擊殺累積雙倍
    const n = evolved(s, s.buff.skillId) ? B.EVOLVE_SIGIL_MULT : 1
    if (!s.buff.permanent || rng() < (sk.duration ?? 0) / sk.cd) gainSigil(s, n)
  }
  // 連斬:每次擊殺 +1 層並重置衰減視窗
  if (hasNode(s, 'tactician_start')) {
    const before = s.combo
    s.combo = Math.min(B.COMBO_MAX, s.combo + 1)
    s.comboIdle = 0
    // 戰術家:連斬每跨過 N 層就給一枚印記,把連斬與印記串起來
    if (Math.floor(s.combo / B.TACTICIAN_COMBO_PER_SIGIL) > Math.floor(before / B.TACTICIAN_COMBO_PER_SIGIL)) {
      gainSigil(s)
    }
  }
  const routeGold = s.routeBuff?.kind === 'gold' ? B.ROUTE_BUFF_MULT : 1
  const g = goldDrop(s.floor).mul(mult).mul(goldMult(s)).mul(routeGold)
  s.gold = s.gold.add(g)
  const routeMat = s.routeBuff?.kind === 'material' ? B.ROUTE_BUFF_MULT : 1
  // 素材獲取詞綴:小數部分用機率補,長期期望才對得上(直接 floor 會讓 +12% 完全消失)
  const rawMat = (boss ? B.BOSS_MATERIALS : B.MATERIAL_PER_MOB) * routeMat * (1 + equipBonuses(s.equipped).matFind)
  const gained = Math.floor(rawMat) + (rng() < rawMat % 1 ? 1 : 0)
  s.materials += gained
  s.forgeHeatMaterials += gained
  events.push({ type: boss ? 'bossKill' : 'kill', gold: g, floor: s.floor })

  if (!boss) return
  s.bossKills++
  tickLivingWeapon(s, events)
  tickHeirloomRepair(s, events)
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
  const dt = dtMs / 1000

  // 戰意衰減(重裝步兵衰減減半)。檢定窗口內不衰減:
  // Boss 是二元判定,玩家在那 30 秒裡的努力不該一邊被扣掉
  if (!inCheckWindow(s)) {
    const decay = B.MORALE_DECAY * (1 - (JOBS[s.jobId].bonus.morale ?? 0))
    s.morale = Math.max(0, s.morale - decay * dtMs)
  }

  tickSkills(s, dt, raw)
  tickTactician(s, dt)
  tickMerc(s, dt, raw, rng)
  tickCombatStatus(s, dt, raw, rng)
  grantDestinyPoints(s, raw)
  if (s.charging) return mergeKills(raw) // 蓄勢期間停止輸出

  // ── 時間驅動:倒數與生成不受攻擊節奏影響 ──
  if (s.event) {
    s.event.timeLeft -= dt
  } else if (!s.isBoss) {
    spawnEncounter(s, raw, rng)
    s.eventCooldown -= dt
    if (s.eventCooldown <= 0) spawnEvent(s, raw, rng)
  }

  // Boss 倒數是時間,每個 tick 都照走(只扣一次,不可在攻擊 tick 重複扣)
  if (s.isBoss && s.enemyHp.gt(0)) s.bossTimeLeft -= dt

  // ── 攻擊驅動:傷害按攻擊間隔成塊套用 ──
  // 血條跟著揮砍一格一格掉,而不是連續流失。總量不變(累積多久就打多少),
  // 所以數值曲線不受影響;渲染層的揮砍也由這裡發出的 attack 事件驅動,兩者不會漂移。
  // 自動攻擊的節奏由攻擊間隔決定;玩家點擊則是**另一次獨立的出手**
  // (click() 自己發 attack 事件 + 自己扣血),兩邊都維持「一次揮砍 = 一次扣血」。
  const interval = attackInterval(s)
  s.attackAcc += dt
  if (s.attackAcc < interval) {
    if (s.event && s.event.timeLeft <= 0) escapeEvent(s, raw, rng)
    else checkBossTimeout(s, raw, rng)
    return mergeKills(raw)
  }
  const swung = s.attackAcc
  s.attackAcc = 0
  const dmg = currentDPS(s).mul(swung)
  // 行為型傳說的分帳:總量不變(power-neutral by construction),
  // 只是把同一份傷害拆給不同的「行動者」——演出因此能畫出分身/軍旗各自出手
  const galeWindow = s.buff && !!SKILLS[s.buff.skillId].critAdd
  if (galeWindow && hasLegend(s, 'twinblade')) {
    raw.push({ type: 'attack', damage: dmg.mul(1 - B.TWIN_CLONE_SHARE), source: 'hero' })
    raw.push({ type: 'attack', damage: dmg.mul(B.TWIN_CLONE_SHARE), source: 'clone' })
  } else if (s.bannerLeft > 0) {
    raw.push({ type: 'attack', damage: dmg.mul(1 - B.BANNER_ZONE_SHARE), source: 'hero' })
    raw.push({ type: 'attack', damage: dmg.mul(B.BANNER_ZONE_SHARE), source: 'zone' })
  } else {
    raw.push({ type: 'attack', damage: dmg })
  }
  tickWindBoots(s, rng, raw)

  // 突發事件優先吃傷害:出現期間取代當前目標
  if (s.event) {
    dealDamage(s, dmg, raw, rng)
    if (s.event && s.event.timeLeft <= 0) escapeEvent(s, raw, rng)
    return mergeKills(raw) // 事件期間不推進一般戰鬥
  }

  dealDamage(s, dmg, raw, rng)

  // 逾時判定放在傷害之後,讓這一擊有機會先擊破
  checkBossTimeout(s, raw, rng)
  return mergeKills(raw)
}

/**
 * 追風者之靴:這一擊有沒有暴擊,決定要不要推進第二技能的冷卻。
 * 暴擊在本引擎原本只活在期望值裡,這件裝備讓它變成看得見的事件。
 * 每秒上限 B.WINDBOOTS_PER_SEC 次(系統級護欄:冷卻完成類不得無限觸發)。
 */
function tickWindBoots(s: GameState, rng: Rng, events: GameEvent[]) {
  if (!hasLegend(s, 'windboots')) return
  if (s.windUses >= B.WINDBOOTS_PER_SEC) return
  if (rng() >= Math.min(1, critRate(s))) return
  const target = JOBS[s.jobId].awakenSkill
  const cdLeft = target ? (s.skillCd[target] ?? 0) : 0
  if (!target || cdLeft <= 0) return
  s.windUses++
  const left = cdLeft - B.WINDBOOTS_CD_SEC
  if (left <= 0) delete s.skillCd[target]
  else s.skillCd[target] = left
  events.push({ type: 'cooldownAdvance', skillId: target, seconds: B.WINDBOOTS_CD_SEC })
}

/**
 * 把一份傷害套用到當前目標,並處理擊殺與溢出。
 * 自動攻擊、點擊、戰意爆發、套裝自動引爆全部走這裡——
 * 走同一條路才不會出現「血扣了但沒結算擊殺」或「畫面揮了血條沒動」。
 */
function dealDamage(s: GameState, damage: Decimal, raw: GameEvent[], rng: Rng) {
  let dmg = damage
  // 凍結(DeferDamageWindow):期間所有傷害累積,解凍時一次引爆。
  // 倒數與冷卻照常進行——凍結不偷時間,只改結算節奏(power-neutral 的關鍵)
  if (s.freezeLeft > 0) {
    s.frozenPool = s.frozenPool.add(dmg)
    return
  }
  if (s.event) {
    s.event.hp = s.event.hp.sub(dmg)
    if (s.event.hp.lte(0)) {
      rewardEvent(s, s.event.kind, raw, rng)
      s.event = null
      s.eventCooldown = eventInterval(rng, s)
    }
    return
  }
  // 溢出傷害要帶到下一隻,否則推進速度會被攻擊頻率鎖死
  // (實測:Lv.80 時每次只殺一隻會讓實際進度比數值模型慢 4.8 倍)
  for (let i = 0; i < MAX_KILLS_PER_TICK; i++) {
    if (s.enemyHp.gt(dmg)) {
      s.enemyHp = s.enemyHp.sub(dmg)
      return
    }
    dmg = dmg.sub(s.enemyHp)
    s.enemyHp = D(0)
    reward(s, s.isBoss, raw, rng)
    nextEnemy(s, raw)
    if (dmg.lte(0)) return
  }
}

/** 事件逾時逃走。誘餌箱會留下較低階獎勵 */
function escapeEvent(s: GameState, raw: GameEvent[], rng: Rng) {
  if (!s.event) return
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

/** Boss 逾時判定。倒數本身在 tick 開頭就扣過了,這裡只負責結算 */
/** 強制結算凍結池(倒數歸零、事件逾時等「要判定勝負」的時刻呼叫) */
function settleFrozen(s: GameState, raw: GameEvent[], rng: Rng) {
  if (s.freezeLeft <= 0 && s.frozenPool.lte(0)) return
  s.freezeLeft = 0
  const pool = s.frozenPool
  s.frozenPool = D(0)
  if (pool.gt(0)) {
    raw.push({ type: 'freezeBurst', damage: pool })
    dealDamage(s, pool, raw, rng)
  }
}

function checkBossTimeout(s: GameState, raw: GameEvent[], rng: Rng) {
  if (!s.isBoss || s.enemyHp.lte(0) || s.bossTimeLeft > 0) return
  // ⚠️ 判失敗之前先結算凍結池:池裡的傷害可能早就足以擊殺。
  // 不結算就判定,冰法師在 Boss 尾端凍結會把玩家已經打出的傷害吞掉、反而害你輸
  //(v1.5 § 七:延遲類效果在 Boss 戰內必須結算完才有資格談勝負)
  settleFrozen(s, raw, rng)
  if (s.enemyHp.lte(0) || !s.isBoss) return // 池結算後擊破了(nextEnemy 已在 dealDamage 裡走完)
  // DPS check 失敗 → 退回前一層 farm(玩家心智模型:打不過就退一層)
  s.bossFailed = true
  if (hasNode(s, 'tactician_2a')) s.valiantStacks = Math.min(B.VALIANT_MAX, s.valiantStacks + 1)
  s.bossRetryFloor = s.floor
  s.floor = Math.max(1, s.floor - 1)
  s.killsInFloor = 0
  raw.push({ type: 'bossFail', floor: s.bossRetryFloor })
  spawnEnemy(s)
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
  s.eventClickMats = 0
  events.push({ type: 'eventSpawn', kind })
}

/** 事件基礎金幣 */
function eventGold(s: GameState, kind: EventKind): Decimal {
  const mult = kind === 'chest' ? B.CHEST_GOLD_MULT : B.GOBLIN_GOLD_MULT
  return goldDrop(s.floor)
    .mul(mult)
    .mul(goldMult(s))
    .mul(1 + equipBonuses(s.equipped).eventGold)
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

  // 尋寶獵人:把事件拉進戰鬥循環,而不只是經濟收益
  if (s.destinyPath === 'hunter') gainSigil(s, B.HUNTER_SIGIL_ON_EVENT)

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

/**
 * 點擊。做三件事,缺一不可:
 *   1. **直接出手**:點一下就是一次揮砍、一次扣血(1:1,不會有空點)
 *   2. 疊戰意:縮短自動攻擊間隔,Boss/事件視窗內效果加倍且不衰減
 *   3. 滿檔爆發:填補 10~30 秒的期待層
 *
 * rng 可注入以便模擬可重現(點擊會擊殺 → 會抽部位素材掉落)。
 */
export function click(s: GameState, rng: Rng = Math.random): GameEvent[] {
  const events: GameEvent[] = []

  // 事件中點擊直接換素材。素材不隨 1.16^層 貶值,
  // 所以這是唯一「點擊價值永不衰減」的獎勵形式(GDD 的寶箱怪快速點擊)
  if (s.event && s.eventClickMats < B.EVENT_CLICK_MAT_CAP) {
    s.eventClickMats++
    s.materials += B.MATERIAL_PER_MOB
    s.forgeHeatMaterials += B.MATERIAL_PER_MOB
    events.push({ type: 'clickMaterial' })
  }

  const clickBonus = equipBonuses(s.equipped).clickDmg
  s.morale = Math.min(B.MORALE_MAX, s.morale + B.MORALE_PER_CLICK * (1 + clickBonus))

  // 點擊自己的一擊:折算成 B.CLICK_DMG_SEC 秒份 DPS,吃「點擊戰意」詞綴
  const dmg = currentDPS(s).mul(B.CLICK_DMG_SEC * (1 + clickBonus))
  events.push({ type: 'attack', damage: dmg })
  dealDamage(s, dmg, events, rng)

  // 戰意滿檔爆發:填補 10~30 秒的期待層(「快滿了」)
  if (s.morale >= B.MORALE_MAX) {
    s.morale = 0
    // 失落軍旗:不當場炸掉,存進軍旗等下一個技能一起放(總量不變,節奏變了)
    if (hasLegend(s, 'lostbanner')) {
      s.bannerStored += B.MORALE_BURST_SEC * B.BANNER_STORE
      events.push({ type: 'bannerStore' })
    } else {
      const burst = currentDPS(s).mul(B.MORALE_BURST_SEC)
      events.push({ type: 'moraleBurst', damage: burst })
      dealDamage(s, burst, events, rng)
    }
  }
  return events
}

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

// ---------- 二轉逐步揭露 ----------

export type RevealStage = 'none' | 'outline' | 'leaning' | 'named' | 'full'

/**
 * 揭露階段。填滿 Lv.20~100 之間原本空轉的區間:
 * 一轉後給模糊方向 → 命運節點讓方向亮起 → 揭露候選名稱 → 接近二轉給完整預覽
 */
export function revealStage(s: GameState): RevealStage {
  if (JOBS[s.jobId].tier !== 1) return 'none'
  const nodes = s.destinyNodes.filter((id) => (DESTINY_NODES[id]?.tier ?? 0) > 0).length
  if (s.lv >= 90 || nodes >= 3) return 'full'
  if (nodes >= 2) return 'named'
  if (nodes >= 1) return 'leaning'
  return 'outline'
}

/** 本輪會走到的二轉(命運已定時只有一個) */
export function destinyOutcome(s: GameState) {
  return destinyJobs(s.jobId, s.destinyPath)
}

/** 是否在「檢定窗口」內:Boss 限時或事件限時。點擊的價值集中在這裡 */
export function inCheckWindow(s: GameState): boolean {
  return s.isBoss || s.event !== null
}

/**
 * 實際攻擊間隔。戰意越高打得越快(傷害中性,只是切得更細)。
 * 基底也只改這裡:快速基底切得細、重擊基底一擊沉重,總傷害不變。
 */
export function attackInterval(s: GameState): number {
  const mod = Math.max(0.3, 1 + baseMods(s.equipped).interval)
  const formation = ironwallActive(s) ? B.IRONWALL_INTERVAL : 1
  // 殘影(二轉進化):自己那招的視窗期間切得更細
  const echo = s.buff && evolved(s, s.buff.skillId) && SKILLS[s.buff.skillId].critAdd ? B.EVOLVE_INTERVAL : 1
  return (B.ATTACK_INTERVAL * mod * formation * echo) / (1 + s.morale * B.MORALE_ATTACK_SPEED)
}

// ---------- 職業覺醒與印記 ----------

/**
 * 職業覺醒:解鎖一轉第二技能。
 * 雙條件(層數 + 至少一個命運節點)——只用層數會變成固定流程,
 * 只用命運節點會受節點出現順序影響;而且不綁特定命運,
 * 不會有人因為選錯命運就拿不到核心技能。
 */
export function isAwakened(s: GameState): boolean {
  const hasDestinyNode = s.destinyNodes.some((id) => (DESTINY_NODES[id]?.tier ?? 0) > 0)
  return s.highestFloor >= B.AWAKEN_FLOOR && hasDestinyNode
}

/** 目前實際可用的主動技能 */
export function availableSkills(s: GameState): SkillId[] {
  const job = JOBS[s.jobId]
  const list = [...job.skills]
  if (job.awakenSkill && isAwakened(s)) list.push(job.awakenSkill)
  return list
}

/** 印記在當前職業叫什麼 */
export function sigilName(s: GameState): string {
  const id = JOBS[s.jobId].awakenSkill
  return (id && SKILLS[id].sigilName) || '印記'
}

/** 印記上限。神匠的囤積思維會提高上限 */
export function sigilCap(s: GameState): number {
  return B.SIGIL_MAX + (s.destinyPath === 'artisan' ? B.ARTISAN_SIGIL_CAP : 0)
}

/** 累積印記。既有技能建立累積,第二技能挑時機消耗 */
function gainSigil(s: GameState, n = 1) {
  if (!JOBS[s.jobId].awakenSkill) return
  s.sigils = Math.min(sigilCap(s), s.sigils + n)
}

/** 命運對印記的改造說明,UI 直接顯示 */
export function sigilModifier(s: GameState): string | null {
  if (!JOBS[s.jobId].awakenSkill) return null
  if (s.destinyPath === 'artisan') return `神匠:${sigilName(s)}上限 +${B.ARTISAN_SIGIL_CAP}`
  if (s.destinyPath === 'hunter') return `尋寶獵人:擊破事件額外 +${B.HUNTER_SIGIL_ON_EVENT}`
  if (s.destinyPath === 'tactician')
    return `戰術家:連斬每 ${B.TACTICIAN_COMBO_PER_SIGIL} 層額外 +1`
  return null
}

// ---------- 主動技能 ----------

/**
 * 實際冷卻 = 基礎 × (1 + 基底修正 − 冷卻縮短詞綴)。
 * ⚠️ 下限 B.CD_FLOOR 是系統級護欄,不是這裡的隨手保護:
 * 冷卻一旦能無限縮到 0,「冷卻完成 / 重複」類效果就能自我循環。
 */
export function skillCooldown(s: GameState, id: SkillId): number {
  const bonus = equipBonuses(s.equipped)
  const mod = 1 + baseMods(s.equipped).cd - bonus.cdr
  return SKILLS[id].cd * Math.max(B.CD_FLOOR, mod)
}

export function skillReady(s: GameState, id: SkillId): boolean {
  if (!availableSkills(s).includes(id)) return false
  if (SKILLS[id].consumesSigils && s.sigils <= 0) return false // 沒有印記就沒東西可消耗
  return (s.skillCd[id] ?? 0) <= 0
}

/**
 * 施放技能。buff 型覆蓋當前 buff;立即傷害型直接扣目標血量
 * (吃智力的技能傷害加成,是突破 Boss 檢定的主要工具)
 */
export function castSkill(s: GameState, id: SkillId): GameEvent[] {
  if (!skillReady(s, id)) return []
  const sk = SKILLS[id]
  s.skillCd[id] = skillCooldown(s, id)
  const events: GameEvent[] = []
  // 這一招實際打出多少,最後回填給 skill 事件——
  // 全遊戲最大的一擊(印記引爆 / 隕石術)原本是完全沒有演出的
  let skillDamage = D(0)

  const bonus = equipBonuses(s.equipped)
  // 演出要知道「這一發吃了幾層」,才畫得出 N 道射線
  const spent = SKILLS[id].consumesSigils ? s.sigils : 0
  // 戰術指揮官:指揮形態拿冷卻換威力,不是白送威力
  const command = s.commandReady
  if (command) {
    s.commandReady = false
    s.skillCd[id] = (s.skillCd[id] ?? 0) * B.COMMANDER_CD
  }
  const skillDmg = (1 + bonus.skillDmg) * (command ? B.COMMANDER_POWER : 1)

  // 失落軍旗:戰意滿檔存起來的爆發,在這裡「轉化」成技能的一部分一起釋放
  if (s.bannerStored > 0) {
    const stored = currentDPS(s).mul(s.bannerStored)
    if (s.event) s.event.hp = s.event.hp.sub(stored)
    else s.enemyHp = s.enemyHp.sub(stored)
    s.bannerStored = 0
    events.push({ type: 'moraleBurst', damage: stored })
  }

  if (sk.consumesSigils) {
    // 法典殘頁:保留三分之一不清空,每枚威力降低 → 從「攢滿再引爆」變成「連續小引爆」
    const codex = hasLegend(s, 'codexpage')
    const perSigil = B.SIGIL_BURST_SEC * (1 + bonus.sigilPower) * (codex ? B.CODEX_POWER : 1)
    const dmg = currentDPS(s).mul(s.sigils * perSigil * skillDmg)
    skillDamage = skillDamage.add(dmg)
    if (s.event) s.event.hp = s.event.hp.sub(dmg)
    else s.enemyHp = s.enemyHp.sub(dmg)
    s.sigils = codex ? Math.floor(s.sigils * B.CODEX_KEEP) : 0
  } else if (sk.burstSeconds) {
    let dmg = currentDPS(s).mul(sk.burstSeconds * skillDmg)
    skillDamage = skillDamage.add(dmg)
    // 裁決餘燼:七成立即、三成化為燃燒(總量不變——差別是敵人會持續冒火)
    if (hasLegend(s, 'ember')) {
      applyBurn(s, dmg.mul(1 - B.EMBER_IMMEDIATE), B.EMBER_BURN_DURATION)
      dmg = dmg.mul(B.EMBER_IMMEDIATE)
    }
    if (s.event) {
      s.event.hp = s.event.hp.sub(dmg)
    } else {
      s.enemyHp = s.enemyHp.sub(dmg)
    }
    // 立即傷害型(聖光審判)每次施放留下法令;連判(二轉進化)留三枚
    gainSigil(s, evolved(s, id) ? B.EVOLVE_EDICT_SIGILS : 1)
  } else if (sk.duration) {
    // 熔火軍旗:盾牆突擊系(dmgMult buff)施放時插旗,軍旗與視窗同壽命
    if (sk.dmgMult && hasLegend(s, 'bannerflag')) s.bannerLeft = sk.duration
    // 不退之壁:軍陣留在場上直到下次施放(倍率改用平均值,見 buffMult)
    const permanent = hasLegend(s, 'wall')
    s.buff = {
      skillId: id,
      timeLeft: permanent
        ? Infinity
        : sk.duration *
          (1 + bonus.buffDur + baseMods(s.equipped).buffDur) *
          (command ? B.COMMANDER_POWER : 1),
      permanent,
    }
  }

  trackCastOrder(s, id, events)
  events.push({
    type: 'skill',
    skillId: id,
    damage: skillDamage.gt(0) ? skillDamage : undefined,
    count: spent || undefined,
  })
  return events
}

/**
 * 「不同技能」的門檻:取「設計值」與「目前實際擁有的技能數」較小者,下限 2。
 * ⚠️ 一轉只有 2 招(既有 + 覺醒)、二轉才有 3 招。寫死 3 會讓所有走「順序」的效果
 * 在 Lv.100 前完全不觸發——玩家在第 30 層打到的東西會是死的。
 * 下限 2 是為了覺醒前(只有 1 招)不要每放一次就觸發。
 */
function distinctNeeded(s: GameState, want: number): number {
  return Math.max(2, Math.min(want, availableSkills(s).length))
}

/**
 * 順序:記錄施放過的不同技能,湊滿一輪就讓最長冷卻的技能立即推進一段(倒轉沙漏)。
 * ⚠️ 觸發後上鎖 B.HOURGLASS_LOCK 秒——「冷卻完成」關鍵字若能自我觸發就是無限循環,
 * 這是系統級護欄的一部分,不是這件裝備的備註。
 */
function trackCastOrder(s: GameState, id: SkillId, events: GameEvent[]) {
  if (!s.castOrder.includes(id)) s.castOrder.push(id)

  // 戰術指揮官 3 件與倒轉沙漏搶同一份施放順序。
  // ⚠️ 不可先到先贏:指揮官的判定在前面且會清空 castOrder,同時穿的話沙漏永遠餓死,
  // 玩家戴著一件死裝備卻不會知道。改為同一次湊滿讓**兩者都觸發**(各自獨立中性,疊加無虞)
  const commanderDone =
    setCount(s, 'commander') >= 3 && s.castOrder.length >= distinctNeeded(s, B.COMMANDER_DISTINCT)
  const hourglassDone =
    hasLegend(s, 'hourglass') &&
    s.castOrder.length >= distinctNeeded(s, B.HOURGLASS_DISTINCT) &&
    s.hourglassLock <= 0
  if (!commanderDone && !hourglassDone) return
  if (commanderDone) s.commandReady = true
  s.castOrder = []
  if (!hourglassDone) return

  const longest = availableSkills(s)
    .filter((sid) => (s.skillCd[sid] ?? 0) > 0)
    .sort((a, b) => skillCooldown(s, b) - skillCooldown(s, a))[0]
  if (longest) {
    const advance = skillCooldown(s, longest) * B.HOURGLASS_PROGRESS
    const left = (s.skillCd[longest] ?? 0) - advance
    if (left <= 0) delete s.skillCd[longest]
    else s.skillCd[longest] = left
    events.push({ type: 'cooldownAdvance', skillId: longest, seconds: advance })
  }
  s.castOrder = []
  s.hourglassLock = B.HOURGLASS_LOCK
}

/** 換一隻出戰傭兵(英雄頁第五區)。null = 收起 */
export function setActiveMerc(s: GameState, id: MercId | null): boolean {
  if (id !== null && !unlockedMercs(bestFloorEver(s)).includes(id)) return false
  s.activeMerc = id
  s.mercTimer = mercInterval(s, Math.random)
  return true
}

/** 歷代最高層(解鎖傭兵用):目前輪 + 矩陣時代之前沒有記錄,用 highestFloor 保底 */
export function bestFloorEver(s: GameState): number {
  return Math.max(s.highestFloor, s.mercBestFloor)
}

function mercInterval(s: GameState, rng: Rng): number {
  const m = s.activeMerc ? MERCS[s.activeMerc] : null
  if (!m) return 10
  return m.interval * (1 - B.MERC_INTERVAL_JITTER + rng() * B.MERC_INTERVAL_JITTER * 2)
}

/**
 * 傭兵招牌行為(v1.5 § 五):每 8~15 秒一次、可被說出「剛剛牠做了什麼」。
 * 傷害一律折算 N 秒份 DPS,占比壓在 ≤15% 護欄內(常數見 balance.ts)。
 */
function tickMerc(s: GameState, dt: number, events: GameEvent[], rng: Rng) {
  if (!s.activeMerc) return
  s.mercTimer -= dt
  if (s.mercTimer > 0) return
  s.mercTimer = mercInterval(s, rng)

  const id = s.activeMerc
  events.push({ type: 'mercAct', mercId: id })
  switch (id) {
    case 'hound':
      // 經濟行為,不佔傷害預算
      s.materials += B.MATERIAL_PER_MOB
      s.forgeHeatMaterials += B.MATERIAL_PER_MOB
      break
    case 'rogue': {
      // 背刺 + 留下破綻(轉為印記,與第二技能咬合)
      const dmg = currentDPS(s).mul(B.MERC_ROGUE_SEC)
      events.push({ type: 'attack', damage: dmg, source: 'merc' })
      dealDamage(s, dmg, events, rng)
      gainSigil(s)
      break
    }
    case 'icemage': {
      // 凍結:Boss 每場上限、正在凍結中跳過。
      // ⚠️ 限時事件中也跳過:事件逾時逃走時,池裡打事件的傷害會誤導到一般敵人,獎勵直接蒸發
      if (s.freezeLeft > 0 || s.event) break
      if (s.isBoss && s.freezeUsedThisBoss >= B.FREEZE_BOSS_CAP) break
      if (s.isBoss) s.freezeUsedThisBoss++
      s.freezeLeft = B.FREEZE_DURATION
      s.frozenPool = D(0)
      events.push({ type: 'freezeStart' })
      break
    }
    case 'sapper':
      // 砲台:場地物件,存在期間由 tickCombatStatus 週期開火
      s.zoneLeft = Math.max(s.zoneLeft, B.MERC_SAPPER_DURATION)
        s.zoneDps = currentDPS(s).mul(B.MERC_SAPPER_SEC / B.MERC_SAPPER_DURATION)
      break
    case 'pyro':
      // 燃燒:狀態原型,短時間內燒完(30 秒 Boss 檢定內必定結算)
      applyBurn(s, currentDPS(s).mul(B.MERC_PYRO_SEC), B.MERC_PYRO_BURN_SEC)
      break
  }
}

/** 施加/疊加燃燒:剩餘的燒量與新的合併,重算每秒傷害 */
function applyBurn(s: GameState, total: Decimal, duration: number) {
  const remaining = s.burnDps.mul(Math.max(0, s.burnLeft))
  s.burnLeft = duration
  s.burnDps = remaining.add(total).div(duration)
}

/** 凍結解凍、燃燒滴傷、砲台開火(行為原型的時間驅動部分) */
function tickCombatStatus(s: GameState, dt: number, events: GameEvent[], rng: Rng) {
  if (s.freezeLeft > 0) {
    s.freezeLeft -= dt
    if (s.freezeLeft <= 0) {
      s.freezeLeft = 0
      const pool = s.frozenPool
      s.frozenPool = D(0)
      if (pool.gt(0)) {
        // 解凍引爆:累積的傷害一次結算 + 冰法師的小額獎勵
        const bonus = s.activeMerc === 'icemage' ? currentDPS(s).mul(B.MERC_ICE_BONUS_SEC) : D(0)
        const total = pool.add(bonus)
        events.push({ type: 'freezeBurst', damage: total })
        dealDamage(s, total, events, rng)
      }
    }
    return // 凍結期間燃燒與砲台也暫停(它們的傷害會進池,乾脆停表)
  }
  if (s.burnLeft > 0) {
    const step = Math.min(dt, s.burnLeft)
    const dmg = s.burnDps.mul(step)
    s.burnLeft -= dt
    if (dmg.gt(0)) {
      events.push({ type: 'burnTick', damage: dmg })
      dealDamage(s, dmg, events, rng)
    }
    if (s.burnLeft <= 0) {
      s.burnLeft = 0
      s.burnDps = D(0)
    }
  }
  if (s.bannerLeft > 0) s.bannerLeft = Math.max(0, s.bannerLeft - dt)
  if (s.zoneLeft > 0) {
    const step = Math.min(dt, s.zoneLeft)
    const dmg = s.zoneDps.mul(step)
    s.zoneLeft -= dt
    if (dmg.gt(0)) {
      events.push({ type: 'attack', damage: dmg, source: 'zone' })
      dealDamage(s, dmg, events, rng)
    }
    if (s.zoneLeft <= 0) s.zoneLeft = 0
  }
}

/**
 * 帝國鐵壁 3 件:軍陣結束時把視窗內累積的印記自動引爆一次。
 * 威力低於手動引爆(B.IRONWALL_AUTO_POWER)——玩家用「挑時機」換到的東西不能白送。
 */
function autoDetonate(s: GameState, events: GameEvent[]) {
  if (setCount(s, 'ironwall') < 3 || s.sigils <= 0) return
  const id = JOBS[s.jobId].awakenSkill
  if (!id || !availableSkills(s).includes(id)) return
  const spent = s.sigils
  const dmg = currentDPS(s).mul(s.sigils * B.SIGIL_BURST_SEC * B.IRONWALL_AUTO_POWER)
  if (s.event) s.event.hp = s.event.hp.sub(dmg)
  else s.enemyHp = s.enemyHp.sub(dmg)
  s.sigils = 0
  events.push({ type: 'skill', skillId: id, damage: dmg, count: spent })
}

function tickSkills(s: GameState, dt: number, events: GameEvent[]) {
  for (const id of Object.keys(s.skillCd) as SkillId[]) {
    const left = (s.skillCd[id] ?? 0) - dt
    if (left <= 0) delete s.skillCd[id]
    else s.skillCd[id] = left
  }
  if (s.buff && !s.buff.permanent) {
    s.buff.timeLeft -= dt
    if (s.buff.timeLeft <= 0) {
      // ⚠️ 先引爆再清 buff:軍陣是「結束時的最後一擊」,
      // 順序反過來會讓自動引爆吃不到增益倍率,實測直接掉 18% 輸出
      autoDetonate(s, events)
      s.buff = null
    }
  }
  if (s.hourglassLock > 0) s.hourglassLock = Math.max(0, s.hourglassLock - dt)
  if (s.relicLeft > 0) s.relicLeft = Math.max(0, s.relicLeft - dt)
  // 追風者之靴的每秒觸發上限
  s.windAcc += dt
  if (s.windAcc >= 1) {
    s.windAcc = 0
    s.windUses = 0
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
  // 命運限定二轉:本輪命運不符就不能轉
  if (job.requiresDestiny && job.requiresDestiny !== s.destinyPath) return false
  const from = s.jobId
  s.jobId = jobId
  // 二轉達成 → 記進矩陣圖鑑(跨輪保留),這是「下輪想試別的組合」的來源
  if (job.tier === 2 && s.destinyPath) {
    const key = matrixKey(from, s.destinyPath)
    if (s.jobMatrix[key] === undefined) s.jobMatrix[key] = s.runs + 1
  }
  return true
}

/** 矩陣格子的 key:一轉職業 × 本輪命運 */
export function matrixKey(tier1: JobId, destiny: DestinyPathId): string {
  return `${tier1}:${destiny}`
}

/** 這一格走到的二轉是誰(已實作的命運限定優先,其餘走通用二轉 + 命運後綴) */
export function matrixOutcome(tier1: JobId, destiny: DestinyPathId): JobId | null {
  const list = destinyJobs(tier1, destiny)
  return (list.find((j) => j.requiresDestiny)?.id ?? list[0]?.id) ?? null
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
  // 貪婪之眼:打出菁英以上就備妥下一場 Boss 的遺物弱點(把鍛造與 Boss 檢定串起來)
  if (hasLegend(s, 'greedeye') && QUALITIES.indexOf(e.quality) >= QUALITIES.indexOf('purple')) {
    s.relicPending = true
  }
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
  // 傳家之器不可被吞:那是全遊戲唯一「必定回來」的承諾,銘刻要先換給別件才准吃
  if (s.inventory[idx].heirloom) return false
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
    qualityBonus: equipBonuses(s.equipped).forgeQuality,
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
  /** 定向基底:投入菁英素材時可指定,決定這一錘有機會打出哪一系傳說 */
  base?: BaseType
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
  const pityHit = s.pityLegendary >= B.PITY_LEGENDARY
  const e = rollEquipment(rng, {
    forgeCount: s.forgeCount,
    heatBonus: forgeHeatBonus(s),
    qualityBonus: equipBonuses(s.equipped).forgeQuality,
    extraAffix: inscribe && rng() < B.INSCRIBE_AFFIX_CHANCE ? 1 : 0,
    guaranteePurple: opts.useElite || s.pityCount >= B.PITY_FORGE,
    guaranteeGold: pityHit,
    lockSlot: opts.slot,
    forceBase: opts.useElite ? opts.base : undefined,
  })

  // 傳說特性:傳奇以上才可能帶,且部位與基底要對得上某件傳說。
  // 保底那一次必定帶——否則保底只給了品質,給不到「會改變玩法的東西」。
  if (QUALITIES.indexOf(e.quality) >= QUALITIES.indexOf('gold')) {
    const l = legendFor(e.slot, e.base)
    if (l && (pityHit || rng() < B.LEGEND_CHANCE)) {
      e.legend = l.id
      if (!s.legendsSeen.includes(l.id)) s.legendsSeen.push(l.id) // 傳說圖鑑(跨輪)
    }
  }
  // 套裝標籤:標籤制,任何品質都可能帶。投入部位素材 + 菁英素材時才有機會
  if (opts.slot && opts.useElite && rng() < B.SET_TAG_CHANCE) {
    const tags = Object.keys(SETS) as SetTagId[]
    e.setTag = tags[Math.floor(rng() * tags.length)]
  }

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

/**
 * 這件能不能被「一鍵分解」掃掉。
 * ⚠️ 傳家之器是全遊戲唯一「必定回來」的承諾;傳說特性與套裝標籤是玩法本身。
 * 這三種即使品質低(殘缺版傳奇會降成稀有)也不可以被一鍵操作銷毀。
 */
export function protectedFromBulkSalvage(e: Equipment): boolean {
  return !!e.heirloom || !!e.legend || !!e.setTag
}

/** 一鍵分解:回傳分解件數、返還素材、以及保護了幾件 */
export function salvageBelow(s: GameState, maxQualityIdx: number) {
  let count = 0
  let materials = 0
  let protectedCount = 0
  for (const e of [...s.inventory]) {
    if (QUALITIES.indexOf(e.quality) > maxQualityIdx) continue
    if (protectedFromBulkSalvage(e)) {
      protectedCount++
      continue
    }
    materials += salvage(s, e.id)
    count++
  }
  return { count, materials, protectedCount }
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

/**
 * 銘刻為傳家之器。同時只能有一件,銘刻新的會取代舊的。
 * 這是 v1.2「傳家寶銘刻制」與神匠「傳家之器」合併後的**唯一**入口。
 */
export function inscribeHeirloom(s: GameState, id: string): boolean {
  const all = [...s.inventory, ...SLOTS.map((sl) => s.equipped[sl]).filter((e): e is Equipment => !!e)]
  const target = all.find((e) => e.id === id)
  if (!target) return false
  for (const e of all) e.heirloom = e.id === id
  s.inscribedId = id
  return true
}

/** 本輪銘刻的那一件(找不到代表已被分解/吞噬) */
export function inscribedItem(s: GameState): Equipment | null {
  if (!s.inscribedId) return null
  const all = [...s.inventory, ...SLOTS.map((sl) => s.equipped[sl]).filter((e): e is Equipment => !!e)]
  return all.find((e) => e.id === s.inscribedId) ?? null
}

/** 殘缺的傳家之器修復進度(還差幾個 Boss) */
export function heirloomRepairLeft(s: GameState): number {
  return Math.max(0, B.HEIRLOOM_REPAIR_BOSSES - s.bossKills)
}

/**
 * 傳家之器的修復:本輪擊破足夠的 Boss 後,殘缺版回到完整品質。
 * 產生「這件會不會回來」(轉生時揭曉)與「回來後能不能修好」(本輪目標)兩層期待。
 */
function tickHeirloomRepair(s: GameState, events: GameEvent[]) {
  if (s.bossKills < B.HEIRLOOM_REPAIR_BOSSES) return
  for (const e of [...s.inventory, ...SLOTS.map((sl) => s.equipped[sl])]) {
    if (!e || !e.broken) continue
    e.quality = e.fullQuality ?? e.quality
    e.broken = false
    events.push({ type: 'heirloomRestored', equipment: e })
  }
}

/** 可帶走的裝備(已裝備 + 背包,依評分排序),UI 用來讓玩家挑 */
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
    .filter((id) => id !== s.inscribedId) // 銘刻件走傳家之器,不佔攜帶名額
    .slice(0, heirloomSlots(s.techs))
    .map((id) => pool.find((e) => e.id === id))
    .filter((e): e is Equipment => !!e)

  const next = createInitialState(s.medals + gain, s.runs + 1, { ...s.techs })

  // 傳承圖鑑:本輪最高階裝備登錄(跨轉生保留)
  next.codex = [...s.codex]
  next.jobMatrix = { ...s.jobMatrix }
  next.activeMerc = s.activeMerc
  next.mercBestFloor = Math.max(s.mercBestFloor, s.highestFloor)
  next.legendsSeen = [...s.legendsSeen]
  if (hasNode(s, 'artisan_3a')) {
    const best = heirloomCandidates(s)[0]
    if (best && !next.codex.some((c) => c.id === best.id)) next.codex.push({ ...best })
  }

  // 傳家之器:銘刻的那一件**必定**回來,但保留機制不保留強度——
  // 傳說特性與套裝標籤留著,品質降階成殘缺版,打贏幾個 Boss 才修復。
  // 這樣既有「它會不會回來」的期待,又不會下一輪開局就碾壓。
  const inscribed = inscribedItem(s)
  if (inscribed) {
    const artisan = hasNode(s, 'artisan_3a')
    const tiers = artisan ? B.HEIRLOOM_ARTISAN_TIERS : B.HEIRLOOM_BROKEN_TIERS
    const keepAffix = artisan ? B.HEIRLOOM_ARTISAN_AFFIX_KEEP : B.HEIRLOOM_AFFIX_KEEP
    const qi = Math.max(0, QUALITIES.indexOf(inscribed.quality) - tiers)
    const relic: Equipment = {
      ...inscribed,
      id: `heir${Date.now().toString(36)}`,
      quality: QUALITIES[qi],
      fullQuality: inscribed.quality,
      broken: QUALITIES[qi] !== inscribed.quality,
      heirloom: true,
      affixes: inscribed.affixes.slice(0, keepAffix),
      growth: 1,
      livingSteps: 0,
    }
    next.inventory.push(relic)
    next.inscribedId = relic.id
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
