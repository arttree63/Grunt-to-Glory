import * as B from './balance'
import type { Affix, AffixType, Equipment, Quality, Slot } from './types'

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

const AFFIX_TYPES: AffixType[] = ['dmg', 'gold', 'crit', 'clickDmg']

export const AFFIX_NAME: Record<AffixType, string> = {
  dmg: '傷害',
  gold: '金幣掉落',
  crit: '暴擊率',
  clickDmg: '點擊戰意',
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

/** 鐵匠鋪等級:累積鍛造次數換來的品質修正 */
export function forgeLevel(forgeCount: number): number {
  return Math.min(B.FORGE_MAX_LEVEL, Math.floor(forgeCount / B.FORGE_PER_LEVEL) + 1)
}

export function forgeUpgradeChance(forgeCount: number): number {
  return Math.min(B.FORGE_UPGRADE_CAP, forgeLevel(forgeCount) * B.FORGE_UPGRADE_PER_LEVEL)
}

export interface RollOptions {
  /** 累積鍛造次數,決定鐵匠鋪等級 */
  forgeCount?: number
  /** 保底觸發:品質下限拉到紫 */
  guaranteePurple?: boolean
}

let idSeq = 0
export function rollEquipment(rng: Rng = Math.random, opts: RollOptions = {}): Equipment {
  let qi = QUALITIES.indexOf(pickQuality(rng))

  // 鐵匠鋪等級:機率升一階
  if (rng() < forgeUpgradeChance(opts.forgeCount ?? 0)) qi = Math.min(QUALITIES.length - 1, qi + 1)
  // 保底:下限拉到紫
  if (opts.guaranteePurple) qi = Math.max(qi, QUALITIES.indexOf('purple'))

  const quality = QUALITIES[qi]
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)]
  const [lo, hi] = B.AFFIX_RANGE[quality]
  const affixes: Affix[] = []
  for (let i = 0; i < B.AFFIX_COUNT[quality]; i++) {
    const type = AFFIX_TYPES[Math.floor(rng() * AFFIX_TYPES.length)]
    affixes.push({ type, value: Math.round(lo + rng() * (hi - lo)) / 100 })
  }
  return { id: `e${Date.now().toString(36)}${idSeq++}`, slot, quality, affixes }
}

/** 詞條加成(同類相加) */
export function equipBonuses(equipped: Record<Slot, Equipment | null>): Record<AffixType, number> {
  const out: Record<AffixType, number> = { dmg: 0, gold: 0, crit: 0, clickDmg: 0 }
  for (const slot of SLOTS) {
    const e = equipped[slot]
    if (!e) continue
    for (const a of e.affixes) out[a.type] += a.value
  }
  return out
}

/** 品質基礎倍率:每件獨立乘區,5 件相乘 */
export function equipPower(equipped: Record<Slot, Equipment | null>): number {
  let mult = 1
  for (const slot of SLOTS) {
    const e = equipped[slot]
    if (e) mult *= B.QUALITY_POWER[e.quality]
  }
  return mult
}

/** 裝備評分:用於「是否比身上的好」提示。品質權重遠大於詞條,與乘區設計一致 */
export function score(e: Equipment): number {
  return B.QUALITY_POWER[e.quality] * 1000 + e.affixes.reduce((s, a) => s + a.value * 100, 0)
}
