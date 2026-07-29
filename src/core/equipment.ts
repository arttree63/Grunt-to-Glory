import * as B from './balance'
import { LEGENDS } from './legends'
import type { Affix, AffixType, BaseType, Equipment, Quality, Slot } from './types'

export const SLOTS: Slot[] = ['weapon', 'head', 'body', 'boots', 'trinket']
/** 由低到高,索引即階級 */
export const QUALITIES: Quality[] = ['white', 'green', 'blue', 'purple', 'gold', 'crimson']

export const SLOT_NAME: Record<Slot, string> = {
  weapon: '武器',
  head: '頭盔',
  body: '鎧甲',
  boots: '鞋子',
  trinket: '飾品',
}

export const QUALITY_NAME: Record<Quality, string> = {
  white: '粗製',
  green: '精良',
  blue: '稀有',
  purple: '菁英',
  gold: '傳奇',
  crimson: '神器',
}

export const SALVAGE_RETURN = B.SALVAGE_RETURN

const AFFIX_TYPES = Object.keys(B.AFFIX_WEIGHT) as AffixType[]

export const AFFIX_NAME: Record<AffixType, string> = {
  dmg: '傷害',
  crit: '暴擊率',
  critDmg: '暴擊傷害',
  skillDmg: '技能傷害',
  bossDmg: '對 Boss 傷害',
  cdr: '冷卻縮短',
  buffDur: '技能持續',
  sigilPower: '印記威力',
  clickDmg: '點擊戰意',
  gold: '金幣掉落',
  matFind: '素材獲取',
  forgeQuality: '鍛造品質',
  eventGold: '事件獎勵',
}

export type AffixGroup = '輸出' | '循環' | '節奏' | '經濟'
export const AFFIX_GROUP: Record<AffixType, AffixGroup> = {
  dmg: '輸出',
  crit: '輸出',
  critDmg: '輸出',
  skillDmg: '輸出',
  bossDmg: '輸出',
  cdr: '循環',
  buffDur: '循環',
  sigilPower: '循環',
  clickDmg: '節奏',
  gold: '經濟',
  matFind: '經濟',
  forgeQuality: '經濟',
  eventGold: '經濟',
}

export const BASES: BaseType[] = ['swift', 'heavy', 'guard', 'focus']

export const BASE_NAME: Record<BaseType, string> = {
  swift: '快速',
  heavy: '重擊',
  guard: '陣地',
  focus: '技能',
}

/** 基底做什麼(玩家看得到的那一行) */
export const BASE_DESC: Record<BaseType, string> = {
  swift: '攻擊間隔短、技能略慢',
  heavy: '揮擊沉重、暴擊傷害高',
  guard: '技能持續長、冷卻略慢',
  focus: '技能冷卻短、揮擊略慢',
}

/** 這個基底適合打造成什麼(§ 六:白裝是打造入口) */
export const BASE_TENDENCY: Record<BaseType, string> = {
  swift: '斥候系',
  heavy: '重裝系',
  guard: '陣地系',
  focus: '法警系',
}

export interface BaseMods {
  interval: number
  cd: number
  buffDur: number
  critDmg: number
}

/** 已裝備的基底修正總和。同基底穿越多,傾向越明顯 */
export function baseMods(equipped: Record<Slot, Equipment | null>): BaseMods {
  const out: BaseMods = { interval: 0, cd: 0, buffDur: 0, critDmg: 0 }
  for (const slot of SLOTS) {
    const b = equipped[slot]?.base
    if (!b) continue
    const m = B.BASE_MODS[b]
    out.interval += m.interval
    out.cd += m.cd
    out.buffDur += m.buffDur
    out.critDmg += m.critDmg
  }
  return out
}

export type Rng = () => number

function pickQuality(rng: Rng): Quality {
  const w = B.QUALITY_WEIGHT
  const total = QUALITIES.reduce((a, q) => a + w[q], 0)
  let r = rng() * total
  for (const q of QUALITIES) {
    r -= w[q]
    if (r <= 0) return q
  }
  return 'white'
}

/** Boss 部位素材輪替:X10 頭 / X20 武器 / X30 身 / X40 鞋 / X50 飾品(循環) */
export function bossPartSlot(floor: number): Slot {
  const map: Record<number, Slot> = { 10: 'head', 20: 'weapon', 30: 'body', 40: 'boots', 0: 'trinket' }
  return map[floor % 50] ?? 'trinket'
}

/** 鐵匠鋪等級:累積鍛造次數換來的品質修正 */
export function forgeLevel(forgeCount: number): number {
  return Math.min(B.FORGE_MAX_LEVEL, Math.floor(forgeCount / B.FORGE_PER_LEVEL) + 1)
}

export function forgeUpgradeChance(forgeCount: number): number {
  return Math.min(B.FORGE_UPGRADE_CAP, forgeLevel(forgeCount) * B.FORGE_UPGRADE_PER_LEVEL)
}

/** 依權重抽詞綴。輸出類較常見,循環/經濟類負責製造傾向 */
function pickAffixType(rng: Rng): AffixType {
  const w = B.AFFIX_WEIGHT
  const total = AFFIX_TYPES.reduce((a, t) => a + w[t], 0)
  let r = rng() * total
  for (const t of AFFIX_TYPES) {
    r -= w[t]
    if (r <= 0) return t
  }
  return 'dmg'
}

export interface RollOptions {
  /** 累積鍛造次數,決定鐵匠鋪等級 */
  forgeCount?: number
  /** 爐火等額外升階機率(神匠) */
  heatBonus?: number
  /** 品質下限提高幾階(孤注一擲) */
  minQualityBoost?: number
  /** 額外詞條數(精工銘刻) */
  extraAffix?: number
  /** 保底或菁英素材觸發:品質下限拉到紫 */
  guaranteePurple?: boolean
  /** 精工保底觸發:品質下限拉到金 */
  guaranteeGold?: boolean
  /** 部位素材:鎖定部位 */
  lockSlot?: Slot
  /** 裝備詞綴「鍛造品質」帶來的額外升階機率 */
  qualityBonus?: number
  /** 定向打造:指定基底(決定這件有機會成為哪一系傳說) */
  forceBase?: BaseType
}

let idSeq = 0
export function rollEquipment(rng: Rng = Math.random, opts: RollOptions = {}): Equipment {
  let qi = QUALITIES.indexOf(pickQuality(rng))

  // 鐵匠鋪等級:機率升一階
  const upgradeChance = Math.min(
    B.FORGE_UPGRADE_HARD_CAP,
    forgeUpgradeChance(opts.forgeCount ?? 0) + (opts.heatBonus ?? 0) + (opts.qualityBonus ?? 0),
  )
  if (rng() < upgradeChance) qi = Math.min(QUALITIES.length - 1, qi + 1)
  if (opts.minQualityBoost) qi = Math.min(QUALITIES.length - 1, qi + opts.minQualityBoost)
  // 下限保證:菁英素材 → 紫,精工保底 → 金
  if (opts.guaranteePurple) qi = Math.max(qi, QUALITIES.indexOf('purple'))
  if (opts.guaranteeGold) qi = Math.max(qi, QUALITIES.indexOf('gold'))

  const quality = QUALITIES[qi]
  const slot = opts.lockSlot ?? SLOTS[Math.floor(rng() * SLOTS.length)]
  const [lo, hi] = B.AFFIX_RANGE[quality]
  const affixes: Affix[] = []
  const affixCount = B.AFFIX_COUNT[quality] + (opts.extraAffix ?? 0)
  for (let i = 0; i < affixCount; i++) {
    const type = pickAffixType(rng)
    const mult = (B.AFFIX_VALUE_MULT as Partial<Record<AffixType, number>>)[type] ?? 1
    affixes.push({ type, value: Math.round((lo + rng() * (hi - lo)) * mult) / 100 })
  }
  const base = opts.forceBase ?? BASES[Math.floor(rng() * BASES.length)]
  return { id: `e${Date.now().toString(36)}${idSeq++}`, slot, quality, base, affixes }
}

/** 詞條加成(同類相加) */
export function equipBonuses(equipped: Record<Slot, Equipment | null>): Record<AffixType, number> {
  const out = Object.fromEntries(AFFIX_TYPES.map((t) => [t, 0])) as Record<AffixType, number>
  for (const slot of SLOTS) {
    const e = equipped[slot]
    if (!e) continue
    for (const a of e.affixes) out[a.type] += a.value
  }
  return out
}

/** 單件裝備的實際倍率:品質基礎 × 神匠成長 */
export function itemPower(e: Equipment): number {
  return B.QUALITY_POWER[e.quality] * (e.growth ?? 1)
}

/** 品質基礎倍率:每件獨立乘區,5 件相乘 */
export function equipPower(equipped: Record<Slot, Equipment | null>): number {
  let mult = 1
  for (const slot of SLOTS) {
    const e = equipped[slot]
    if (e) mult *= itemPower(e)
  }
  return mult
}

/**
 * 換裝比較。⚠️ 先講機制差異、戰力百分比放最後(裝備規範 § 八):
 * 只顯示綠箭頭的話,整套構築設計會退化成「數字大的就穿」。
 */
export interface EquipDiff {
  lost: string[]
  gained: string[]
  /**
   * 戰力變化,0.12 = +12%。
   * ⚠️ 傳說與神器回傳 undefined:它們是 power-neutral 的,戰力差幾乎都是雜訊,
   * 顯示出來只會把玩家推回「綠箭頭思維」,正是這套設計要避免的失敗狀態。
   */
  powerDelta?: number
  /** 取代傳說戰力 % 的構築關係標示 */
  relation: 'fits_current' | 'opens_new' | 'conflicts'
}

export const RELATION_NAME: Record<EquipDiff['relation'], string> = {
  fits_current: '契合目前構築',
  opens_new: '開啟新構築',
  conflicts: '與目前構築衝突',
}

export function compareEquipment(next: Equipment, equipped: Record<Slot, Equipment | null>): EquipDiff {
  const cur = equipped[next.slot]
  const lost: string[] = []
  const gained: string[] = []

  if (next.legend) gained.push(`傳說特性「${LEGENDS[next.legend].name}」`)
  if (cur?.legend) lost.push(`傳說特性「${LEGENDS[cur.legend].name}」`)

  if (cur?.base !== next.base) {
    if (cur?.base) lost.push(`${BASE_NAME[cur.base]}基底(${BASE_DESC[cur.base]})`)
    if (next.base) gained.push(`${BASE_NAME[next.base]}基底(${BASE_DESC[next.base]})`)
  }
  const kinds = (e: Equipment | null) => new Set((e?.affixes ?? []).map((a) => a.type))
  const curKinds = kinds(cur)
  const nextKinds = kinds(next)
  for (const t of curKinds) if (!nextKinds.has(t)) lost.push(`「${AFFIX_NAME[t]}」`)
  for (const t of nextKinds) if (!curKinds.has(t)) gained.push(`「${AFFIX_NAME[t]}」`)

  const before = cur ? itemPower(cur) * (1 + affixDmg(cur)) : 1
  const after = itemPower(next) * (1 + affixDmg(next))
  // 傳說之間比的是機制不是數字,所以戰力 % 只給白~紫
  const showPower = !next.legend && QUALITIES.indexOf(next.quality) < QUALITIES.indexOf('gold')

  return {
    lost,
    gained,
    powerDelta: showPower ? after / before - 1 : undefined,
    relation: buildRelation(next, cur, equipped),
  }
}

/** 這件會接上現有機制、開一條新的,還是把正在運作的換掉 */
function buildRelation(
  next: Equipment,
  cur: Equipment | null,
  equipped: Record<Slot, Equipment | null>,
): EquipDiff['relation'] {
  if (!next.legend) return cur?.legend ? 'conflicts' : 'fits_current'
  if (cur?.legend && cur.legend !== next.legend) return 'conflicts'
  const worn = new Set(
    SLOTS.filter((sl) => sl !== next.slot)
      .flatMap((sl) => equipped[sl]?.legend ?? [])
      .flatMap((id) => LEGENDS[id].tags),
  )
  return LEGENDS[next.legend].tags.some((t) => worn.has(t)) ? 'fits_current' : 'opens_new'
}

/** 只算直接進傷害的詞綴,用於戰力比較 */
function affixDmg(e: Equipment): number {
  return e.affixes.filter((a) => a.type === 'dmg').reduce((s, a) => s + a.value, 0)
}

/** 裝備評分:用於「是否比身上的好」提示。品質權重遠大於詞條,與乘區設計一致 */
export function score(e: Equipment): number {
  // 傳說特性換算成約 1.5 階品質:玩家不該為了一階品質丟掉會改變玩法的東西
  return itemPower(e) * 1000 + e.affixes.reduce((s, a) => s + a.value * 100, 0) + (e.legend ? 300 : 0)
}
