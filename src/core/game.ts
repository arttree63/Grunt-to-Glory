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
import { makeChronicleEntry, soldierName } from './chronicle'
import { ENCOUNTER_ORDER } from './encounters'
import {
  canBuyTech,
  emptyTechs,
  heirloomSlots,
  techById,
  techDamageMult,
  techGoldMult,
  techFineForges,
  techOfflineHours,
  techStartGold,
} from './techs'
import type {
  BaseType,
  BossKind,
  BossStats,
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
  TacticId,
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
    bossKind: null,
    shellLeft: 0,
    shellValue: 0,
    shellValueThisSec: 0,
    shellSecAcc: 0,
    shellVulnLeft: 0,
    channelLeft: 0,
    channelUsed: 0,
    channelDamage: D(0),
    vulnLeft: 0,
    hardenLeft: 0,
    totemHp: D(0),
    totemMaxHp: D(0),
    nextTotemAt: 0,
    bossStats: null,
    lastBossStats: null,
    runStats: { kills: 0, mercKills: 0, skillCasts: 0, lateBossKills: 0 },
    runHighlight: null,
    bossLore: {
      shell: { seen: 0, handled: 0 },
      channel: { seen: 0, handled: 0 },
      totem: { seen: 0, handled: 0 },
    },
    bossTactic: null,
    tacticDelayLeft: 0,
    tacticKeepSigils: false,
    perfectWindowLeft: 0,
    resonance: { artisan: 0, hunter: 0, tactician: 0 },
    resonanceSrc: { salvage: 0, forge: 0, event: 0, encounter: 0, combo: 0, skill: 0 },
    runBossFails: {},
    nemesis: null,
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
    autoCast: false, // 預設關:掛機玩家的基準不因新系統改變
    skillCd: {},
    buffs: [],
    zealStacks: 0,
    conquestLeft: 0,
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
    burnStacks: 0,
    burnDps: D(0),
    bannerLeft: 0,
    zoneLeft: 0,
    zoneDps: D(0),
    zoneFireAcc: 0,
    mercBestFloor: 0,
    legendsSeen: [],
    attackAcc: 0,
    clickBudget: B.CLICK_BUDGET_PER_SEC,
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
    pityLegendShort: 0,
    normalForgeProgress: 0,
    fineForgesUsed: 0,
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
  // 準備型科技:買的是「下一輪怎麼開局」,所以效果在這裡兌現。
  // ⚠️ 這三項都不進 DPS 乘區——它們降低運氣支配、讓構築更早成形,不是更大的數字
  s.destinyPoints = techs.herald
  for (let i = 0; i < techs.quarter; i++) {
    // 開局部位素材:輪流分配而非隨機,免得買了三級還全押同一個部位
    s.partMaterials[SLOTS[i % SLOTS.length]]++
  }
  spawnEnemy(s)
  return s
}

export const SAVE_VERSION = 26

// ---------- 數值查詢 ----------

/** 金幣總乘區:裝備詞條(加法)× 後勤補給科技(乘法) */
export function goldMult(s: GameState): number {
  return (
    (1 + equipBonuses(s.equipped).gold + (JOBS[s.jobId].bonus.gold ?? 0)) * techGoldMult(s.techs)
  )
}

export function critRate(s: GameState): number {
  // 多槽 buff 的暴擊加成相加。常駐化(不退之壁)取原視窗 uptime 平均——
  // 漏掉的話疾風連刺的 +60% 會變永久,單件傳說直接破 power-neutral
  let buffCrit = 0
  for (const b of s.buffs) {
    const sk = SKILLS[b.skillId]
    const uptime = b.permanent ? ((sk.duration ?? 0) / sk.cd) * B.WALL_PERMANENT_BONUS : 1
    buffCrit += (sk.critAdd ?? 0) * uptime
  }
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
  return setCount(s, 'ironwall') >= 2 && s.buffs.some((b) => SKILLS[b.skillId].duration)
}

/** 有任何暴擊視窗(疾風連刺系)生效中 */
export function critWindowActive(s: GameState): boolean {
  return s.buffs.some((b) => !!SKILLS[b.skillId].critAdd)
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
  // 多槽相乘:重疊視窗 > 輪流開——這正是「總攻」的數值來源(技能是成長預算,不受 ±10% 約束)
  let mult = 1
  for (const b of s.buffs) {
    const sk = SKILLS[b.skillId]
    if (!sk.dmgMult) continue
    if (!b.permanent) {
      mult *= sk.dmgMult
    } else {
      const dur = sk.duration ?? 0
      mult *= ((dur * sk.dmgMult + (sk.cd - dur)) / sk.cd) * B.WALL_PERMANENT_BONUS
    }
  }
  return mult
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
    .mul(Math.pow(1 + B.ZEAL_PER_FULL, s.zealStacks)) // 戰意昂揚(輪內疊乘)
    .mul(!s.isBoss && s.conquestLeft > 0 ? B.CONQUEST_MULT : 1) // 乘勝推進(不影響下一場檢定)
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
    ...(s.zealStacks > 0
      ? [{ label: `戰意昂揚 ×${s.zealStacks}`, mult: Math.pow(1 + B.ZEAL_PER_FULL, s.zealStacks) }]
      : []),
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
    // Boss 開場壓縮傭兵倒數:否則 8~15 秒的間隔常常整場輪不到牠行動
    if (s.activeMerc) s.mercTimer = Math.min(s.mercTimer, B.MERC_BOSS_OPENING_SEC)
    // Boss 行為原型(v1.7):X10 拆盾 / X20 蓄力 / X30 圖騰,循環。
    // 敵人對構築提出不同的問題——「這一場跟上一場不一樣」從這裡開始
    s.bossKind = bossKindFor(s.floor)
    s.bossLore[s.bossKind].seen++
    // 戰術修正:只對這一次挑戰生效(緩兵之計把第一個手段延後幾秒)
    s.tacticDelayLeft = s.bossTactic === 'delay' ? B.TACTIC_DELAY_SEC : 0
    s.tacticKeepSigils = s.bossTactic === 'keepSigils'
    if (s.bossTactic === 'mercFirst' && s.activeMerc) s.mercTimer = 0.01
    s.shellLeft = s.bossKind === 'shell' ? B.SHELL_HITS : 0
    s.shellValue = 0
    s.shellValueThisSec = 0
    s.shellSecAcc = 0
    s.shellVulnLeft = 0
    s.channelLeft = 0
    s.channelUsed = 0
    s.channelDamage = D(0)
    s.vulnLeft = 0
    s.hardenLeft = 0
    s.totemHp = D(0)
    s.totemMaxHp = D(0)
    s.nextTotemAt = s.bossKind === 'totem' ? B.TOTEM_FIRST_AT : 0
    s.bossStats = {
      floor: s.floor,
      kind: s.bossKind,
      win: false,
      bySource: {},
      shellTime: 0,
      shieldValue: 0,
      shieldBySource: {},
      shieldPeakPerSec: 0,
      interrupts: 0,
      channels: 0,
      totemTime: 0,
      dealtRatio: 0,
    }
    // 貪婪之眼:打造出好東西後,下一場 Boss 開場帶著遺物弱點
    if (s.relicPending) {
      s.relicPending = false
      s.relicLeft = B.RELIC_WINDOW
    }
  } else {
    s.isBoss = false
    s.enemyMaxHp = mobHP(s.floor)
    s.bossKind = null
  }
  s.enemyHp = s.enemyMaxHp
}

/** X10 拆盾 / X20 蓄力 / X30 圖騰(循環)。第一個 Boss 教最簡單的 */
export function bossKindFor(floor: number): BossKind {
  const m = floor % 30
  if (m === 10) return 'shell'
  if (m === 20) return 'channel'
  return 'totem'
}

export const BOSS_KIND_NAME: Record<BossKind, string> = {
  shell: '拆盾型',
  channel: '蓄力型',
  totem: '圖騰型',
}

/**
 * 蓄力打斷進度 0~1(goal-gradient):讓玩家在窗口內就知道「再多做一件事就會不同」,
 * 而不是等到硬化了才發現差一點。非蓄力中回 0。
 */
export function channelProgress(s: GameState): number {
  if (s.channelLeft <= 0 || s.enemyMaxHp.lte(0)) return 0
  const need = s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK)
  return Math.min(1, s.channelDamage.div(need).toNumber())
}

/** 破下一層護盾還差幾點破盾值(盾已破回 0) */
export function shellToNext(s: GameState): number {
  if (s.shellLeft <= 0) return 0
  return Math.max(0, B.SHIELD_VALUE_PER_LAYER - s.shellValue)
}

/** 當前這一層護盾的累積比例 0~1(給演出畫碎裂進度) */
export function shellProgress(s: GameState): number {
  if (s.shellLeft <= 0) return 0
  return Math.min(1, s.shellValue / B.SHIELD_VALUE_PER_LAYER)
}

export const BOSS_KIND_HINT: Record<BossKind, string> = {
  shell: '護盾要吃多次命中才破——攻速、分身、傭兵、點擊都算一次',
  channel: '蓄力時打出爆發即可打斷——儲存的傷害挑這時放',
  totem: '圖騰會加速倒數,優先處理——燃燒與背刺可以無視它直打 Boss',
}

// ---------- 敵情熟悉度(籃 C 第一階段:前代學會的敵情成為下代知識) ----------

export type LoreStage = 'unseen' | 'glimpse' | 'known' | 'mastered'

/**
 * 三階段:初見(只看得到模糊描述)→ 識破(成功處理一次:名稱與效果)→
 * 精通(累積處理多次:精確時點與反制)。跨轉生保留,只給資訊不給數值。
 */
export function loreStage(s: GameState, kind: BossKind): LoreStage {
  const lore = s.bossLore[kind]
  if (lore.handled >= B.LORE_MASTER_HANDLED) return 'mastered'
  if (lore.handled >= 1) return 'known'
  if (lore.seen >= 1) return 'glimpse'
  return 'unseen'
}

/** 初見/未見:模糊描述——顯示動作,不顯示精確效果 */
export const BOSS_LORE_GLIMPSE: Record<BossKind, string> = {
  shell: '它被某種護殼包覆,尋常刀劍似乎難以撼動',
  channel: '它會蓄積某種力量——前代未能看清那是什麼',
  totem: '它似乎倚仗著某種外物,戰場上的時間流逝異常',
}

/** 精通:精確時點與反制(資訊,不是加成) */
export const BOSS_LORE_MASTERY: Record<BossKind, string> = {
  shell: `護盾共 ${B.SHELL_HITS} 層:每次命中 ${B.SHIELD_HIT_VALUE} 點、狀態 tick ${B.SHIELD_TICK_VALUE} 點,每 ${B.SHIELD_VALUE_PER_LAYER} 點破一層(每秒上限 ${B.SHIELD_VALUE_PER_SEC_CAP} 點)——破盾後有易傷窗口`,
  channel: `蓄力出現在倒數 ${B.CHANNEL_TIMES.join(' 秒與 ')} 秒,${B.CHANNEL_DURATION} 秒內打進 ${Math.round(B.CHANNEL_HP_TO_BREAK * 100)}% 血量即可打斷——打斷給易傷,漏掉則硬化`,
  totem: `圖騰在倒數 ${B.TOTEM_FIRST_AT} 秒首度出現,之後每 ${B.TOTEM_INTERVAL} 秒一根——存活期間倒數加速,燃燒與背刺可穿透直打本體`,
}

// ---------- 戰術修正(在線三選一;離線無修正自動重試) ----------

export const TACTICS: Array<{ id: TacticId; name: string; desc: string }> = [
  { id: 'delay', name: '緩兵之計', desc: `守關者的第一個手段延後 ${B.TACTIC_DELAY_SEC} 秒` },
  { id: 'keepSigils', name: '蓄勢而來', desc: `本場第一次引爆後保留 ${B.TACTIC_KEEP_SIGILS} 層印記` },
  { id: 'mercFirst', name: '傭兵先行', desc: '傭兵開場立即行動' },
]

/**
 * 選擇/取消戰術修正。只在失敗待重戰時可選;只對下一次挑戰生效。
 * ⚠️ 預設 null=無修正——掛機自動重試永遠不套用,系統也不代選(企劃裁決)。
 */
export function setTactic(s: GameState, id: TacticId | null): boolean {
  if (!s.bossFailed || s.bossRetryFloor === null) return false
  if (id === 'keepSigils' && !JOBS[s.jobId].awakenSkill) return false // 沒有印記體系就沒得保留
  if (id === 'mercFirst' && !s.activeMerc) return false
  s.bossTactic = id
  return true
}

/**
 * 失敗診斷三分類(2026-07-30,回饋:「只有數值不足的遊戲,會把玩家訓練成不停刷資源」)。
 * 每次失敗先判「類」再給一句話——玩家要知道的是「該改打法還是該刷資源」:
 * - timing 時機錯誤:傷害其實夠,但沒打在對的窗口(蓄力沒斷)
 * - combo 組合未完成:缺一種來源(多段命中 / 穿透),刷等級解決不了
 * - stat 數值不足:真的就是打不動,升級換裝最實際
 * 規則刻意粗:一句話就好,玩家要的是方向不是報表。
 */
export type BossDiagnosis = {
  category: 'timing' | 'combo' | 'stat'
  text: string
}

export const DIAGNOSIS_NAME: Record<BossDiagnosis['category'], string> = {
  timing: '時機錯誤',
  combo: '組合未完成',
  stat: '數值不足',
}

export function diagnoseBoss(st: BossStats | null): BossDiagnosis | null {
  if (!st || st.win) return null
  if (st.kind === 'channel' && st.channels > 0 && st.interrupts < st.channels) {
    return {
      category: 'timing',
      text: `${st.channels} 次蓄力只打斷 ${st.interrupts} 次——蓄力時留一手爆發(引爆/凍結/軍旗儲存)`,
    }
  }
  if (st.kind === 'shell' && st.shellTime > B.BOSS_TIME * 0.4) {
    // 破盾值只有一種來源=構築裡缺多段命中,不是等級問題
    if (Object.keys(st.shieldBySource).length <= 1) {
      return {
        category: 'combo',
        text: `護盾佔了 ${st.shellTime.toFixed(0)} 秒——缺多段命中來源:分身、傭兵、燃燒或多點幾下都算`,
      }
    }
    return {
      category: 'stat',
      text: `護盾佔了 ${st.shellTime.toFixed(0)} 秒,破盾來源夠了但輸出跟不上——升級或換裝最實際`,
    }
  }
  if (st.kind === 'totem' && st.totemTime > 8) {
    // 沒有任何穿透來源(燃燒/背刺)打進本體=組合缺件
    const pierce = (st.bySource.burn ?? 0) + (st.bySource.merc ?? 0)
    if (pierce === 0) {
      return {
        category: 'combo',
        text: `圖騰存活了 ${st.totemTime.toFixed(0)} 秒,一直在偷時間——缺穿透來源:燃燒與盜賊背刺可無視圖騰直打本體`,
      }
    }
    return {
      category: 'stat',
      text: `圖騰存活了 ${st.totemTime.toFixed(0)} 秒——穿透有了但整體輸出不足,升級或換裝最實際`,
    }
  }
  if (st.dealtRatio < 1) {
    return {
      category: 'stat',
      text: `只打掉 ${Math.round(st.dealtRatio * 100)}% 血量——純輸出不足,升級或換裝最實際`,
    }
  }
  return null
}

function reward(s: GameState, boss: boolean, events: GameEvent[], rng: Rng = Math.random) {
  const mult = boss ? B.BOSS_GOLD_MULT : 1
  // 覺醒後每隔固定擊殺自然獲得一枚印記。第一技能仍是加速器，但第二技能不再被它鎖死。
  if (isAwakened(s) && s.runStats.kills > 0 && s.runStats.kills % B.PASSIVE_KILLS_PER_SIGIL === 0) {
    gainSigil(s, 1, events, 'battle')
  }
  // buff 視窗期間的擊殺會累積印記(軍勢 / 追風印記)。
  // 不退之壁把視窗變成常駐,若照原樣累積會變成每殺必給 → 印記速率暴增。
  // 改為依原本的視窗佔比擲骰,累積速率因此與沒穿時相同。
  // 多槽下取「最有利的一個視窗」判定,不逐槽疊加——否則雙 buff 職業印記速率直接翻倍
  const windows = s.buffs.filter((b) => SKILLS[b.skillId].duration)
  if (windows.length > 0) {
    const live = windows.find((b) => !b.permanent)
    const pick = live ?? windows[0]
    const sk = SKILLS[pick.skillId]
    const n = windows.some((b) => evolved(s, b.skillId)) ? B.EVOLVE_SIGIL_MULT : 1
    if (live || rng() < (sk.duration ?? 0) / sk.cd) gainSigil(s, n, events, live ? 'window' : 'chance')
  }
  // 連斬:每次擊殺 +1 層並重置衰減視窗
  if (hasNode(s, 'tactician_start')) {
    const before = s.combo
    s.combo = Math.min(B.COMBO_MAX, s.combo + 1)
    s.comboIdle = 0
    // 戰術家:連斬每跨過 N 層就給一枚印記,把連斬與印記串起來
    if (Math.floor(s.combo / B.TACTICIAN_COMBO_PER_SIGIL) > Math.floor(before / B.TACTICIAN_COMBO_PER_SIGIL)) {
      gainSigil(s, 1, events, 'combo')
      addResonance(s, 'combo', events)
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
  // 打贏就把這層的失敗紀錄清掉:宿怨當代已了結,轉生時不該再結成宿敵
  delete s.runBossFails[s.floor]
  // 家族宿敵:擊敗宿敵=宿怨終結,寫進列傳(蓋過其他代表事件)
  if (s.nemesis && !s.nemesis.resolved && s.nemesis.floor === s.floor) {
    s.nemesis.resolved = true
    s.nemesis.resolvedGen = s.runs + 1
    s.runHighlight = `終結了第 ${s.nemesis.gen} 代結下的宿怨——擊破第 ${s.floor} 層守關者`
    events.push({ type: 'nemesisResolved', floor: s.floor })
  }
  // 代表事件(關聯感串接):挑本輪最戲劇性的一句留給列傳。最後一刻擊破 > 多次打斷
  if (s.bossTimeLeft < 5) {
    s.runStats.lateBossKills++
    s.runHighlight = `在最後 ${Math.max(1, Math.ceil(s.bossTimeLeft))} 秒擊破第 ${s.floor} 層守關者`
  } else if (s.bossStats && s.bossStats.interrupts >= 2 && !s.runHighlight) {
    s.runHighlight = `${s.bossStats.interrupts} 度打斷第 ${s.floor} 層守關者的蓄力`
  }
  if (s.bossStats) {
    s.bossStats.win = true
    s.lastBossStats = { ...s.bossStats, bySource: { ...s.bossStats.bySource } }
    s.bossStats = null
  }
  s.conquestLeft = B.CONQUEST_SEC // 乘勝推進:把擊破做成節奏高點
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
    // Boss 被擊破 → 進下一層。戰術修正只活一場,不論勝敗都清掉
    s.bossTactic = null
    s.tacticDelayLeft = 0
    s.tacticKeepSigils = false
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
  tickAutoCast(s, raw)
  tickTactician(s, dt)
  tickMerc(s, dt, raw, rng)
  tickCombatStatus(s, dt, raw, rng)
  // 點擊傷害預算回充:每秒 CLICK_BUDGET_PER_SEC 秒份,存量上限同值(不可囤)
  s.clickBudget = Math.min(B.CLICK_BUDGET_PER_SEC, s.clickBudget + dt * B.CLICK_BUDGET_PER_SEC)
  if (s.perfectWindowLeft > 0) s.perfectWindowLeft = Math.max(0, s.perfectWindowLeft - dt)
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

  // Boss 倒數是時間,每個 tick 都照走(只扣一次,不可在攻擊 tick 重複扣)。
  // 圖騰存活時倒數加速——「必須處理它」的壓力來源
  if (s.isBoss && s.enemyHp.gt(0)) {
    s.bossTimeLeft -= dt * (s.totemHp.gt(0) ? B.TOTEM_TIMER_MULT : 1)
    tickBossMechanics(s, dt, raw)
  }

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
  const galeWindow = critWindowActive(s)
  let swingHits = 1
  let swingSource = 'hero'
  if (galeWindow && hasLegend(s, 'twinblade')) {
    raw.push({ type: 'attack', damage: dmg.mul(1 - B.TWIN_CLONE_SHARE), source: 'hero' })
    raw.push({ type: 'attack', damage: dmg.mul(B.TWIN_CLONE_SHARE), source: 'clone' })
    swingHits = 2 // 分身多一次命中——拆盾型 Boss 前分身的實質價值
    swingSource = 'clone'
  } else if (s.bannerLeft > 0) {
    raw.push({ type: 'attack', damage: dmg.mul(1 - B.BANNER_ZONE_SHARE), source: 'hero' })
    raw.push({ type: 'attack', damage: dmg.mul(B.BANNER_ZONE_SHARE), source: 'zone' })
    swingHits = 2
    swingSource = 'zone'
  } else {
    raw.push({ type: 'attack', damage: dmg })
  }
  registerBossHits(s, 1, raw, 'hero')
  if (swingHits > 1) {
    // 分身是完整的第二個攻擊者;軍旗是弱化回音(傷害只有 15%),給 2 點
    if (swingSource === 'clone') registerBossHits(s, 1, raw, 'clone')
    else addShieldValue(s, B.SHIELD_ECHO_VALUE, swingSource, raw)
  }
  tickWindBoots(s, rng, raw)

  // 突發事件優先吃傷害:出現期間取代當前目標
  if (s.event) {
    dealDamage(s, dmg, raw, rng)
    if (s.event && s.event.timeLeft <= 0) escapeEvent(s, raw, rng)
    return mergeKills(raw) // 事件期間不推進一般戰鬥
  }

  dealDamage(s, dmg, raw, rng, { source: swingSource === 'hero' ? 'hero' : swingSource })

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
  events.push({ type: 'cooldownAdvance', skillId: target, seconds: B.WINDBOOTS_CD_SEC, via: 'windboots' })
}

/**
 * 把一份傷害套用到當前目標,並處理擊殺與溢出。
 * 自動攻擊、點擊、戰意爆發、套裝自動引爆全部走這裡——
 * 走同一條路才不會出現「血扣了但沒結算擊殺」或「畫面揮了血條沒動」。
 */
interface DealOpts {
  /** 燃燒與盜賊背刺無視圖騰直接打 Boss(狀態流與位移的構築價值) */
  pierceTotem?: boolean
  /** 統計分帳用 */
  source?: string
}

function dealDamage(s: GameState, damage: Decimal, raw: GameEvent[], rng: Rng, opts: DealOpts = {}) {
  let dmg = damage
  // 凍結 = 表現延遲(GDD v3 § 4.3,封版):傷害在邏輯層**立即結算**,
  // frozenPool 只是演出彙總——解凍時給一個大數字,不是延後扣血。
  // ⚠️ 禁止 deferred damage buffer:機制延遲曾造成「倒數前明明打夠了卻判失敗」,
  // 表現延遲讓那個 bug 在結構上不存在。
  if (s.freezeLeft > 0) s.frozenPool = s.frozenPool.add(dmg)
  if (s.event) {
    s.event.hp = s.event.hp.sub(dmg)
    if (s.event.hp.lte(0)) {
      rewardEvent(s, s.event.kind, raw, rng)
      s.event = null
      s.eventCooldown = eventInterval(rng, s)
    }
    return
  }
  // ── Boss 行為管線(v1.7)──
  if (s.isBoss) {
    // 圖騰是優先目標:吸走攻擊直到被打掉(溢出的部分繼續打 Boss)
    if (s.totemHp.gt(0) && !opts.pierceTotem) {
      if (dmg.lt(s.totemHp)) {
        s.totemHp = s.totemHp.sub(dmg)
        return
      }
      dmg = dmg.sub(s.totemHp)
      s.totemHp = D(0)
      s.bossLore.totem.handled++ // 敵情:成功毀掉一根圖騰
      raw.push({ type: 'totemDown' })
      if (dmg.lte(0)) return
    }
    // 減傷/易傷相乘:盾上衰減、蓄力失敗的硬化、打斷成功與破盾的易傷
    let mult = 1
    // 緩兵之計期間護盾尚未成形(戰術修正:改變條件,不改數值)
    if (s.shellLeft > 0 && s.tacticDelayLeft <= 0) mult *= B.SHELL_DR
    if (s.hardenLeft > 0) mult *= B.CHANNEL_HARDEN_DR
    if (s.vulnLeft > 0) mult *= B.INTERRUPT_VULN
    if (s.shellVulnLeft > 0) mult *= B.SHELL_BREAK_MULT
    if (mult !== 1) dmg = dmg.mul(mult)
    // 蓄力期間打進的傷害累計,達標即打斷
    if (s.channelLeft > 0) {
      s.channelDamage = s.channelDamage.add(dmg)
      if (s.channelDamage.gte(s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK))) {
        s.channelLeft = 0
        s.vulnLeft = B.INTERRUPT_VULN_SEC
        if (s.bossStats) s.bossStats.interrupts++
        s.bossLore.channel.handled++ // 敵情:成功打斷一次
        raw.push({ type: 'interrupted' })
      }
    }
    // 統計分帳(以 maxHp 的比例累計,避免大數)
    if (s.bossStats && s.enemyMaxHp.gt(0)) {
      const ratio = dmg.div(s.enemyMaxHp).toNumber()
      const key = opts.source ?? 'hero'
      s.bossStats.bySource[key] = (s.bossStats.bySource[key] ?? 0) + ratio
      s.bossStats.dealtRatio += ratio
    }
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
    // 行為計數(人格稱號用):誰補的最後一擊
    s.runStats.kills++
    if (opts.source === 'merc') s.runStats.mercKills++
    reward(s, s.isBoss, raw, rng)
    nextEnemy(s, raw)
    if (dmg.lte(0)) return
  }
}

/** Boss 行為原型的時間驅動:蓄力排程、圖騰生成、各狀態倒數、統計 */
function tickBossMechanics(s: GameState, dt: number, raw: GameEvent[]) {
  // 破盾值每秒上限:滿一秒就重置額度
  s.shellSecAcc += dt
  if (s.shellSecAcc >= 1) {
    s.shellSecAcc = 0
    s.shellValueThisSec = 0
  }
  if (s.shellVulnLeft > 0) s.shellVulnLeft = Math.max(0, s.shellVulnLeft - dt)
  if (s.vulnLeft > 0) s.vulnLeft = Math.max(0, s.vulnLeft - dt)
  if (s.hardenLeft > 0) s.hardenLeft = Math.max(0, s.hardenLeft - dt)
  if (s.bossStats) {
    if (s.shellLeft > 0 && s.tacticDelayLeft <= 0) s.bossStats.shellTime += dt
    if (s.totemHp.gt(0)) s.bossStats.totemTime += dt
  }

  // 緩兵之計:延遲期間第一個手段(護盾成形/首次蓄力/首根圖騰)不啟動
  if (s.tacticDelayLeft > 0) {
    s.tacticDelayLeft = Math.max(0, s.tacticDelayLeft - dt)
    return
  }

  if (s.bossKind === 'channel') {
    if (s.channelLeft > 0) {
      s.channelLeft -= dt
      if (s.channelLeft <= 0) {
        // 沒打斷:硬化(拖時間,但不擋通關——掛機契約)
        s.channelLeft = 0
        s.hardenLeft = B.CHANNEL_HARDEN_SEC
        raw.push({ type: 'channelFailed' })
      }
    } else {
      const next = B.CHANNEL_TIMES[s.channelUsed]
      if (next !== undefined && s.bossTimeLeft <= next) {
        s.channelUsed++
        s.channelLeft = B.CHANNEL_DURATION
        s.channelDamage = D(0)
        if (s.bossStats) s.bossStats.channels++
        raw.push({ type: 'channelStart' })
      }
    }
  }

  if (s.bossKind === 'totem' && s.totemHp.lte(0) && s.nextTotemAt > 0 && s.bossTimeLeft <= s.nextTotemAt) {
    s.totemMaxHp = s.enemyMaxHp.mul(B.TOTEM_HP_RATIO)
    s.totemHp = s.totemMaxHp
    s.nextTotemAt -= B.TOTEM_INTERVAL
    raw.push({ type: 'totemSpawn' })
  }
}

/**
 * 技能直傷打向當前敵人。⚠️ 不可直接 enemyHp.sub:那會繞過 Boss 的
 * 減傷/易傷/圖騰/蓄力累計管線(打斷型 Boss 的整個玩法都掛在這條上)。
 * 非 Boss 時等價於直接扣血。
 */
function dealSkillToBoss(s: GameState, dmg: Decimal, events: GameEvent[]) {
  dealDamage(s, dmg, events, Math.random, { source: 'skill' })
}

/**
 * 投入破盾值(GDD v3 § 5.4)。命中 4 點、狀態 tick 1 點,每 4 點破一層。
 * ⚠️ 用明確的「來源 + 值」而不是呼叫次數:分身/砲台/傭兵各自是一個攻擊者,
 * 技能內部多次呼叫仍是一擊。每秒上限防高頻構築直接把盾抹平。
 */
function addShieldValue(s: GameState, value: number, source: string, raw: GameEvent[]) {
  if (!s.isBoss || s.shellLeft <= 0 || s.totemHp.gt(0) || s.tacticDelayLeft > 0) return
  const room = Math.max(0, B.SHIELD_VALUE_PER_SEC_CAP - s.shellValueThisSec)
  const applied = Math.min(value, room)
  if (applied <= 0) return
  s.shellValueThisSec += applied
  s.shellValue += applied
  // 投點可見化:命中 4 / 狀態 1 / 軍旗回音 2 的差異要能在畫面上跳出來
  raw.push({ type: 'shellGain', count: applied, shellSource: source })

  if (s.bossStats) {
    s.bossStats.shieldValue += applied
    s.bossStats.shieldBySource[source] = (s.bossStats.shieldBySource[source] ?? 0) + applied
    s.bossStats.shieldPeakPerSec = Math.max(s.bossStats.shieldPeakPerSec, s.shellValueThisSec)
  }

  while (s.shellValue >= B.SHIELD_VALUE_PER_LAYER && s.shellLeft > 0) {
    s.shellValue -= B.SHIELD_VALUE_PER_LAYER
    s.shellLeft--
  }
  if (s.shellLeft === 0) {
    s.shellValue = 0
    s.shellVulnLeft = B.SHELL_BREAK_SEC
    s.bossLore.shell.handled++ // 敵情:成功破盾一次
    raw.push({ type: 'shellBreak' })
  }
}

/** 獨立命中:每個攻擊者算一次(hits = 攻擊者數量) */
function registerBossHits(s: GameState, hits: number, raw: GameEvent[], source = 'hero') {
  addShieldValue(s, hits * B.SHIELD_HIT_VALUE, source, raw)
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
function checkBossTimeout(s: GameState, raw: GameEvent[], rng: Rng) {
  void rng
  if (!s.isBoss || s.enemyHp.lte(0) || s.bossTimeLeft > 0) return
  // 凍結是表現延遲:傷害早已即時結算,這裡只需把演出狀態清掉,不存在「池吞擊殺」問題
  if (s.freezeLeft > 0) {
    raw.push({ type: 'freezeBurst', damage: s.frozenPool })
    s.freezeLeft = 0
    s.frozenPool = D(0)
  }
  // DPS check 失敗 → 退回前一層 farm(玩家心智模型:打不過就退一層)
  // 戰術修正一場一次:再敗要重新選(企劃裁決:不永久疊加、不越敗越簡單)
  s.bossTactic = null
  s.tacticDelayLeft = 0
  s.tacticKeepSigils = false
  s.bossFailed = true
  if (s.bossStats) {
    // 失敗的統計要留下來:診斷「差在哪、該改什麼」全靠它
    s.lastBossStats = { ...s.bossStats, bySource: { ...s.bossStats.bySource } }
    // 家族宿敵:記下本輪對這層 Boss 的失敗次數與最佳戰績
    const rec = s.runBossFails[s.floor] ?? { count: 0, bestDealt: 0 }
    rec.count++
    rec.bestDealt = Math.max(rec.bestDealt, Math.min(1, s.lastBossStats.dealtRatio))
    s.runBossFails[s.floor] = rec
    s.bossStats = null
  }
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
  if (s.destinyPath === 'hunter') gainSigil(s, B.HUNTER_SIGIL_ON_EVENT, events, 'hunter')

  markEventKind(s, kind)
  addResonance(s, 'event', events)
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

  // clickDmg 詞綴只加戰意獲取——點擊「傷害」禁止有任何升級軸(GDD v3 § 1.4)
  const clickBonus = equipBonuses(s.equipped).clickDmg
  const moraleBefore = s.morale
  s.morale = Math.min(B.MORALE_MAX, s.morale + B.MORALE_PER_CLICK * (1 + clickBonus))
  const moraleGained = s.morale - moraleBefore

  // 點擊直接傷害:受每秒預算約束。預算盡了仍給戰意/素材,只是這一下不追加傷害
  const spend = Math.min(B.CLICK_DMG_SEC, s.clickBudget)
  if (spend > 0) {
    s.clickBudget -= spend
    const dmg = currentDPS(s).mul(spend)
    events.push({ type: 'attack', damage: dmg, source: 'click', count: moraleGained })
    registerBossHits(s, 1, events)
    dealDamage(s, dmg, events, rng, { source: 'hero' })
  } else {
    events.push({ type: 'clickFeedback', count: moraleGained })
  }

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
      registerBossHits(s, 1, events)
      dealDamage(s, burst, events, rng, { source: 'burst' })
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

// ---------- 命運共鳴(顯示傾向,不替玩家推薦答案) ----------

const RESONANCE_PATH: Record<keyof typeof B.RESONANCE, DestinyPathId> = {
  salvage: 'artisan',
  forge: 'artisan',
  event: 'hunter',
  encounter: 'hunter',
  combo: 'tactician',
  skill: 'tactician',
}

/** 行為累積共鳴。選過命運後仍繼續累積(顯示用),但禮物只在選擇當下發一次 */
export function addResonance(s: GameState, src: keyof typeof B.RESONANCE, events?: GameEvent[]) {
  s.resonanceSrc[src]++
  s.resonance[RESONANCE_PATH[src]] += B.RESONANCE[src]
  if (events) events.push(resonanceEvent(src))
}

/** 共鳴累積事件(鍛造/分解等面板動作沒有事件陣列,由 store 層用這個 emit) */
export function resonanceEvent(src: keyof typeof B.RESONANCE): GameEvent {
  return { type: 'resonanceGain', count: B.RESONANCE[src] }
}

/** 共鳴最強的命運(全 0 回 null)。措辭是「產生了較強共鳴」,不是「推薦」 */
export function strongestResonance(s: GameState): DestinyPathId | null {
  const entries = Object.entries(s.resonance) as Array<[DestinyPathId, number]>
  const best = entries.sort((a, b) => b[1] - a[1])[0]
  return best && best[1] > 0 ? best[0] : null
}

/** 共鳴來源明細(公開:玩家要知道是哪些行為在累積,不是系統在背後貼標籤) */
export const RESONANCE_SRC_NAME: Record<keyof typeof B.RESONANCE, string> = {
  salvage: '拆解裝備',
  forge: '進行鍛造',
  event: '擊破限時事件',
  encounter: '處理留存事件',
  combo: '連斬跨檔',
  skill: '施放技能',
}

// ---------- 命運樹 ----------

/** 選擇本輪的命運路徑,同時獲得起始能力。一輪只能選一次 */
export function chooseDestiny(s: GameState, path: DestinyPathId): boolean {
  if (s.destinyPath !== null) return false
  s.destinyPath = path
  s.destinyNodes = [DESTINY_PATHS[path].start]
  // 共鳴開場禮物:選了「共鳴最強」的那條才發,一次性、小型、不成長期強弱差。
  // 三條照選——共鳴只是傾向的呈現,不是標準答案
  if (strongestResonance(s) === path) {
    if (path === 'artisan') s.materials += B.FORGE_COST // 等值一次免費鍛造
    if (path === 'hunter') s.eventCooldown = Math.min(s.eventCooldown, 1) // 下一個事件立刻接近
    if (path === 'tactician') s.combo = Math.max(s.combo, B.RESONANCE_GIFT_COMBO) // 連斬起步
  }
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
  const echo = s.buffs.some((b) => evolved(s, b.skillId) && SKILLS[b.skillId].critAdd) ? B.EVOLVE_INTERVAL : 1
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
function gainSigil(s: GameState, n = 1, events?: GameEvent[], via?: GameEvent['via']) {
  if (!JOBS[s.jobId].awakenSkill) return
  const before = s.sigils
  s.sigils = Math.min(sigilCap(s), s.sigils + n)
  // 疊層瞬間發事件:玩家要看得到「這隻為什麼給」(視窗擊殺/擲骰/連斬…)
  if (events && s.sigils > before) events.push({ type: 'sigilGain', count: s.sigils - before, via })
  // 疊滿的瞬間開金色窗口:窗口內「手動」引爆=完美引爆(掛機正常引爆,無完美獎勵)
  if (before < sigilCap(s) && s.sigils >= sigilCap(s)) s.perfectWindowLeft = B.PERFECT_WINDOW_SEC
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
  return (s.skillCd[id] ?? 0) <= 0
}

/**
 * 施放技能。buff 型覆蓋當前 buff;立即傷害型直接扣目標血量
 * (吃智力的技能傷害加成,是突破 Boss 檢定的主要工具)
 */
export function castSkill(s: GameState, id: SkillId, auto = false): GameEvent[] {
  if (!skillReady(s, id)) return []
  const sk = SKILLS[id]
  s.skillCd[id] = skillCooldown(s, id)
  s.runStats.skillCasts++
  const events: GameEvent[] = []
  addResonance(s, 'skill', events)
  // 這一招實際打出多少,最後回填給 skill 事件——
  // 全遊戲最大的一擊(印記引爆 / 隕石術)原本是完全沒有演出的
  let skillDamage = D(0)
  // 裁決餘燼:轉入燃燒的份額,回填給 skill 事件(玩家要知道傷害沒少,是慢燒)
  let emberBurn: Decimal | undefined

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
    registerBossHits(s, 1, events)
    if (s.event) s.event.hp = s.event.hp.sub(stored)
    else dealSkillToBoss(s, stored, events)
    s.bannerStored = 0
    events.push({ type: 'moraleBurst', damage: stored, via: 'lostbanner' })
  }

  if (sk.consumesSigils) {
    // 法典殘頁:保留三分之一不清空,每枚威力降低 → 從「攢滿再引爆」變成「連續小引爆」
    const codex = hasLegend(s, 'codexpage')
    const perSigil = B.SIGIL_BURST_SEC * (1 + bonus.sigilPower) * (codex ? B.CODEX_POWER : 1)
    const spentNow = s.sigils
    const wasFull = spentNow >= sigilCap(s)
    const dmg = currentDPS(s).mul((B.SIGIL_BASE_BURST_SEC + spentNow * perSigil) * skillDmg)
    skillDamage = skillDamage.add(dmg)
    registerBossHits(s, 1, events, 'skill') // 引爆是單次重擊,不因層數增加破盾值
    if (s.event) s.event.hp = s.event.hp.sub(dmg)
    else dealSkillToBoss(s, dmg, events)
    s.sigils = codex ? Math.floor(s.sigils * B.CODEX_KEEP) : 0
    // 蓄勢而來:本場第一次引爆後保留幾層(傷害照算,層數留著續疊)
    if (s.isBoss && s.tacticKeepSigils) {
      s.sigils = Math.max(s.sigils, Math.min(B.TACTIC_KEEP_SIGILS, spentNow))
      s.tacticKeepSigils = false
    }

    // 引爆回轉(Reload 式):依消耗層數推進其他技能的冷卻,把循環閉合成 loop
    for (const other of availableSkills(s)) {
      if (other === id) continue
      const left = s.skillCd[other] ?? 0
      if (left <= 0) continue
      const advance = spentNow * B.RELOAD_PER_SIGIL
      const next = left - advance
      if (next <= 0) delete s.skillCd[other]
      else s.skillCd[other] = next
      events.push({ type: 'cooldownAdvance', skillId: other, seconds: advance, via: 'reload' })
    }
    // 戰意昂揚(輪內疊乘):滿層引爆才算——保留「現在引爆還是再疊」的決策
    if (wasFull && s.zealStacks < B.ZEAL_MAX_STACKS) {
      s.zealStacks++
      events.push({ type: 'zealGain', count: s.zealStacks })
    }
    // 完美引爆:滿層後金色窗口內「手動」引爆。獎勵放操作感不放傷害
    // (士氣/傭兵推進/昂揚再 +1);掛機自動引爆走不進這裡=沒有完美獎勵
    if (wasFull && !auto && s.perfectWindowLeft > 0) {
      s.morale = Math.min(100, s.morale + B.PERFECT_MORALE)
      if (s.activeMerc) s.mercTimer = Math.max(0, s.mercTimer - B.PERFECT_MERC_ADVANCE)
      if (s.zealStacks < B.ZEAL_MAX_STACKS) {
        s.zealStacks++
        events.push({ type: 'zealGain', count: s.zealStacks })
      }
      events.push({ type: 'perfectBurst' })
    }
    s.perfectWindowLeft = 0
  } else if (sk.burstSeconds) {
    let dmg = currentDPS(s).mul(sk.burstSeconds * skillDmg)
    skillDamage = skillDamage.add(dmg)
    // 裁決餘燼:七成立即、三成化為燃燒(總量不變——差別是敵人會持續冒火)
    if (hasLegend(s, 'ember')) {
      emberBurn = dmg.mul(1 - B.EMBER_IMMEDIATE)
      applyBurn(s, emberBurn, B.EMBER_BURN_DURATION, events)
      dmg = dmg.mul(B.EMBER_IMMEDIATE)
    }
    registerBossHits(s, 1, events, 'skill')
    if (s.event) {
      s.event.hp = s.event.hp.sub(dmg)
    } else {
      dealSkillToBoss(s, dmg, events)
    }
    // 立即傷害型(聖光審判)每次施放留下法令;連判(二轉進化)留三枚
    gainSigil(s, evolved(s, id) ? B.EVOLVE_EDICT_SIGILS : 1, events, 'edict')
  } else if (sk.duration) {
    // 熔火軍旗:盾牆突擊系(dmgMult buff)施放時插旗,軍旗與視窗同壽命
    if (sk.dmgMult && hasLegend(s, 'bannerflag')) s.bannerLeft = sk.duration
    // 不退之壁:軍陣留在場上直到下次施放(倍率改用平均值,見 buffMult)
    const permanent = hasLegend(s, 'wall')
    // 多槽:同技能重放刷新自己,不同技能併存(總攻 = 玩家決定把視窗疊起來)
    s.buffs = s.buffs.filter((b) => b.skillId !== id)
    s.buffs.push({
      skillId: id,
      timeLeft: permanent
        ? Infinity
        : sk.duration *
          (1 + bonus.buffDur + baseMods(s.equipped).buffDur) *
          (command ? B.COMMANDER_POWER : 1),
      permanent,
    })
  }

  trackCastOrder(s, id, events)
  events.push({
    type: 'skill',
    skillId: id,
    damage: skillDamage.gt(0) ? skillDamage : undefined,
    count: spent || undefined,
    burnDamage: emberBurn,
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
    events.push({ type: 'cooldownAdvance', skillId: longest, seconds: advance, via: 'hourglass' })
  }
  s.castOrder = []
  s.hourglassLock = B.HOURGLASS_LOCK
}

/**
 * 自動施放。⚠️ 這是「政策」不是「手速」:玩家設定一次長期有效,
 * 掛機玩家關著就完全不受影響(GDD v3 § 2.4.4 護欄一)。
 * 消耗印記型等滿層才放,保留「攢滿再引爆」的價值;蓄勢期間不放(那是刻意停手)。
 */
function tickAutoCast(s: GameState, raw: GameEvent[]) {
  if (!s.autoCast || s.charging) return
  for (const id of availableSkills(s)) {
    const sk = SKILLS[id]
    if (sk.consumesSigils && s.sigils < sigilCap(s)) continue
    if (!skillReady(s, id)) continue
    raw.push(...castSkill(s, id, true)) // auto=true:自動引爆拿不到完美獎勵
  }
}

/** 開關自動施放 */
export function toggleAutoCast(s: GameState): boolean {
  s.autoCast = !s.autoCast
  return s.autoCast
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
      events.push({ type: 'attack', damage: dmg, source: 'merc', pierce: s.totemHp.gt(0) || undefined })
      registerBossHits(s, 1, events, 'merc')
      // 背刺無視圖騰:位移的構築價值——盜賊繞到後面直接捅本體
      dealDamage(s, dmg, events, rng, { pierceTotem: true, source: 'merc' })
      gainSigil(s, 1, events, 'rogue')
      break
    }
    case 'icemage': {
      // 凍結:Boss 每場上限、正在凍結中跳過。
      // ⚠️ 限時事件中也跳過:事件逾時逃走時,池裡打事件的傷害會誤導到一般敵人,獎勵直接蒸發
      if (s.freezeLeft > 0 || s.event) break
      if (s.isBoss && s.freezeUsedThisBoss >= B.FREEZE_BOSS_CAP) {
        // 上限已滿的第一次嘗試發事件(之後靜默):否則玩家只覺得冰法師突然罷工
        if (s.freezeUsedThisBoss === B.FREEZE_BOSS_CAP) {
          s.freezeUsedThisBoss++
          events.push({ type: 'freezeCapped' })
        }
        break
      }
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
      applyBurn(s, currentDPS(s).mul(B.MERC_PYRO_SEC), B.MERC_PYRO_BURN_SEC, events)
      break
  }
}

/**
 * 施加/疊加燃燒:剩餘的燒量與新的合併,重算每秒傷害。
 * 層數是 F18 爆燃的演出鉤子(純視覺,不改傷害——傷害仍由燒量決定):
 * 每次施加 +1 層,滿層發 burnMax 事件並歸零(視覺上「一次釋放」)。
 */
function applyBurn(s: GameState, total: Decimal, duration: number, events: GameEvent[]) {
  const remaining = s.burnDps.mul(Math.max(0, s.burnLeft))
  s.burnLeft = duration
  s.burnDps = remaining.add(total).div(duration)
  s.burnStacks++
  if (s.burnStacks >= B.BURN_MAX_STACKS) {
    s.burnStacks = 0
    events.push({ type: 'burnMax' })
  }
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
        dealDamage(s, total, events, rng, { source: 'frozen' })
      }
    }
    return // 凍結期間燃燒與砲台也暫停(它們的傷害會進池,乾脆停表)
  }
  if (s.burnLeft > 0) {
    const step = Math.min(dt, s.burnLeft)
    const dmg = s.burnDps.mul(step)
    s.burnLeft -= dt
    if (dmg.gt(0)) {
      events.push({ type: 'burnTick', damage: dmg, pierce: s.totemHp.gt(0) || undefined })
      // 狀態週期 tick 投 1 點破盾值(GDD § 5.4)——燃燒流也能拆盾,只是比命中慢
      addShieldValue(s, B.SHIELD_TICK_VALUE, 'burn', events)
      // 燃燒無視圖騰:狀態流的構築價值——火繼續燒本體
      dealDamage(s, dmg, events, rng, { pierceTotem: true, source: 'burn' })
    }
    if (s.burnLeft <= 0) {
      s.burnLeft = 0
      s.burnDps = D(0)
      s.burnStacks = 0 // 火熄了,層數跟著清
    }
  }
  if (s.bannerLeft > 0) s.bannerLeft = Math.max(0, s.bannerLeft - dt)
  if (s.conquestLeft > 0) s.conquestLeft = Math.max(0, s.conquestLeft - dt)
  if (s.zoneLeft > 0) {
    const step = Math.min(dt, s.zoneLeft)
    s.zoneLeft -= dt
    // 砲台依固定節奏開火(每 tick 一發等於 10 次/秒,會把破盾值上限直接吃滿)
    s.zoneFireAcc += step
    if (s.zoneFireAcc >= B.ZONE_FIRE_INTERVAL) {
      const dmg = s.zoneDps.mul(s.zoneFireAcc)
      s.zoneFireAcc = 0
      if (dmg.gt(0)) {
        events.push({ type: 'attack', damage: dmg, source: 'zone' })
        registerBossHits(s, 1, events, 'zone') // 砲台是獨立攻擊者
        dealDamage(s, dmg, events, rng, { source: 'zone' })
      }
    }
    if (s.zoneLeft <= 0) {
      s.zoneLeft = 0
      s.zoneFireAcc = 0
    }
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
  registerBossHits(s, 1, events)
  if (s.event) s.event.hp = s.event.hp.sub(dmg)
  else dealSkillToBoss(s, dmg, events)
  s.sigils = 0
  s.perfectWindowLeft = 0 // 套裝自動引爆同樣不算完美(不是玩家挑的時機)
  events.push({ type: 'skill', skillId: id, damage: dmg, count: spent, via: 'ironwall' })
}

function tickSkills(s: GameState, dt: number, events: GameEvent[]) {
  for (const id of Object.keys(s.skillCd) as SkillId[]) {
    const left = (s.skillCd[id] ?? 0) - dt
    if (left <= 0) delete s.skillCd[id]
    else s.skillCd[id] = left
  }
  if (s.buffs.length > 0) {
    const hadWindow = s.buffs.some((b) => SKILLS[b.skillId].duration)
    for (const b of s.buffs) if (!b.permanent) b.timeLeft -= dt
    const expiring = s.buffs.filter((b) => !b.permanent && b.timeLeft <= 0)
    if (expiring.length > 0) {
      // ⚠️ 先引爆再清:軍陣是「結束時的最後一擊」,反過來吃不到增益倍率(實測掉 18%)
      // 多槽下只在「這是最後一個持續視窗」時引爆,總攻疊窗不會連環爆
      const remaining = s.buffs.filter((b) => !(b.timeLeft <= 0 && !b.permanent))
      if (hadWindow && !remaining.some((b) => SKILLS[b.skillId].duration)) autoDetonate(s, events)
      s.buffs = remaining
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
  addResonance(s, 'encounter')
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
  addResonance(s, 'forge')
  // 保底計數:出紫以上就歸零
  s.pityCount = QUALITIES.indexOf(e.quality) >= QUALITIES.indexOf('purple') ? 0 : s.pityCount + 1
  // 普通鍛造每 10 次推進 1 點精工短保底——掛機玩家也持續接近「必出傳說特性」
  s.normalForgeProgress++
  if (s.normalForgeProgress >= B.NORMAL_FORGE_PER_PITY) {
    s.normalForgeProgress = 0
    s.pityLegendShort++
  }

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
  // 每輪上限:決策感集中在高價值鍛造。⚠️ 走 techFineForges 而不是常數,
  // 否則買了「鍛造熟練」會顯示 4 次卻在第 4 次被這裡擋掉
  if (s.fineForgesUsed >= techFineForges(s.techs)) return false
  if (s.materials < B.FINE_FORGE_COST) return false
  if (opts.slot && s.partMaterials[opts.slot] < 1) return false
  if (opts.useElite && s.eliteMaterials < 1) return false
  return true
}

/** 本輪剩幾次精工 */
export function fineForgesLeft(s: GameState): number {
  return Math.max(0, techFineForges(s.techs) - s.fineForgesUsed)
}

/** 短保底(12 次必出傳說特性)還差幾次 */
export function pityShortLeft(s: GameState): number {
  return Math.max(0, B.PITY_LEGEND_SHORT - s.pityLegendShort)
}

/** 精工鍛造:素材決定鎖部位與品質下限,所見即所得 */
export function fineForge(s: GameState, opts: FineForgeOptions, rng: Rng = Math.random): Equipment | null {
  if (!canFineForge(s, opts)) return null
  s.fineForgesUsed++
  s.materials -= B.FINE_FORGE_COST
  if (opts.slot) s.partMaterials[opts.slot]--
  if (opts.useElite) s.eliteMaterials--

  const inscribe = hasNode(s, 'artisan_2b')
  // 雙保底:短(12)必出傳說特性;長(50)必出帶套裝標籤的傳奇
  const shortHit = s.pityLegendShort >= B.PITY_LEGEND_SHORT
  const pityHit = s.pityLegendary >= B.PITY_LEGENDARY
  const e = rollEquipment(rng, {
    forgeCount: s.forgeCount,
    heatBonus: forgeHeatBonus(s),
    qualityBonus: equipBonuses(s.equipped).forgeQuality,
    extraAffix: inscribe && rng() < B.INSCRIBE_AFFIX_CHANCE ? 1 : 0,
    guaranteePurple: opts.useElite || s.pityCount >= B.PITY_FORGE,
    guaranteeGold: pityHit || shortHit,
    lockSlot: opts.slot,
    forceBase: opts.useElite ? opts.base : undefined,
  })

  // 傳說特性:傳奇以上才可能帶,且部位與基底要對得上某件傳說。
  // 短保底那一次必定帶——玩家等的是「會改變玩法的東西」,不是品質階級
  if (QUALITIES.indexOf(e.quality) >= QUALITIES.indexOf('gold')) {
    const l = legendFor(e.slot, e.base)
    if (l && (shortHit || pityHit || rng() < B.LEGEND_CHANCE)) {
      e.legend = l.id
      if (!s.legendsSeen.includes(l.id)) s.legendsSeen.push(l.id) // 傳說圖鑑(跨輪)
    }
  }
  // 套裝標籤:投入部位+菁英素材時有機率;長保底(50)那一次必定附
  if ((opts.slot && opts.useElite && rng() < B.SET_TAG_CHANCE) || pityHit) {
    const tags = Object.keys(SETS) as SetTagId[]
    e.setTag = tags[Math.floor(rng() * tags.length)]
  }

  // 精工銘刻:出低於菁英視為失敗,退還部分素材
  if (inscribe && QUALITIES.indexOf(e.quality) < QUALITIES.indexOf('purple')) {
    s.materials += Math.floor(B.FINE_FORGE_COST * B.INSCRIBE_REFUND)
  }

  s.forgeCount++
  addResonance(s, 'forge')
  const qi = QUALITIES.indexOf(e.quality)
  s.pityCount = qi >= QUALITIES.indexOf('purple') ? 0 : s.pityCount + 1
  // 短保底看「傳說特性」,長保底看「套裝標籤」——兩個計數各自歸零
  s.pityLegendShort = e.legend ? 0 : s.pityLegendShort + 1
  s.pityLegendary = e.setTag ? 0 : s.pityLegendary + 1

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
  if (s.inscribedId === e.id) s.inscribedId = null
  const back = SALVAGE_RETURN[e.quality]
  s.materials += back
  addResonance(s, 'salvage')
  return back
}

export function salvageEquipped(s: GameState, slot: Slot): number {
  const e = s.equipped[slot]
  if (!e) return 0
  s.equipped[slot] = null
  if (s.inscribedId === e.id) s.inscribedId = null
  const back = SALVAGE_RETURN[e.quality]
  s.materials += back
  addResonance(s, 'salvage')
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
  // 敵情熟悉度跨轉生:前代學會的敵情成為下代知識
  next.bossLore = {
    shell: { ...s.bossLore.shell },
    channel: { ...s.bossLore.channel },
    totem: { ...s.bossLore.totem },
  }
  // 家族宿敵跨轉生。第一版同時只有一個:已有未解決的宿敵就不結新怨
  next.nemesis = s.nemesis ? { ...s.nemesis } : null
  if (!next.nemesis || next.nemesis.resolved) {
    const worst = Object.entries(s.runBossFails)
      .map(([floor, r]) => ({ floor: Number(floor), ...r }))
      .filter((r) => r.count >= B.NEMESIS_FAILURES)
      .sort((a, b) => b.count - a.count || b.floor - a.floor)[0]
    if (worst) {
      next.nemesis = {
        floor: worst.floor,
        kind: bossKindFor(worst.floor),
        gen: s.runs + 1,
        failures: worst.count,
        bestDealt: worst.bestDealt,
        resolved: false,
      }
    }
  }
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
      // 關聯感串接:傳家之器記得前任持有者是誰
      bearer: soldierName(s),
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
  next.pityLegendShort = s.pityLegendShort
  next.normalForgeProgress = s.normalForgeProgress
  next.fineForgesUsed = 0 // 精工次數每輪重置
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
