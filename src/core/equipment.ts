import type { Affix, AffixType, Equipment, Quality, Slot } from './types'

export const SLOTS: Slot[] = ['weapon', 'head', 'body', 'boots', 'trinket']
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

/** 普通鍛造品質權重(LUK / 鐵匠鋪等級為 Phase 2 修正項) */
const QUALITY_WEIGHT: Record<Quality, number> = {
  white: 0.45,
  green: 0.3,
  blue: 0.17,
  purple: 0.06,
  gold: 0.019,
  crimson: 0.001,
}

/** 詞條數:白1/綠1/藍2/紫2/金3/暗紅4 */
const AFFIX_COUNT: Record<Quality, number> = {
  white: 1,
  green: 1,
  blue: 2,
  purple: 2,
  gold: 3,
  crimson: 4,
}

/** 詞條值域(%),隨品質階梯 3~15 */
const AFFIX_RANGE: Record<Quality, [number, number]> = {
  white: [3, 5],
  green: [4, 7],
  blue: [6, 9],
  purple: [8, 11],
  gold: [10, 13],
  crimson: [12, 15],
}

/** 分解返還怪物素材 */
export const SALVAGE_RETURN: Record<Quality, number> = {
  white: 2,
  green: 3,
  blue: 5,
  purple: 8,
  gold: 14,
  crimson: 25,
}

const AFFIX_TYPES: AffixType[] = ['dmg', 'gold', 'crit', 'clickDmg']

export const AFFIX_NAME: Record<AffixType, string> = {
  dmg: '傷害',
  gold: '金幣掉落',
  crit: '暴擊率',
  clickDmg: '點擊戰意',
}

export type Rng = () => number

function pick<T extends string>(weights: Record<T, number>, rng: Rng): T {
  const total = Object.values<number>(weights).reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (const [k, w] of Object.entries<number>(weights)) {
    r -= w
    if (r <= 0) return k as T
  }
  return Object.keys(weights)[0] as T
}

let idSeq = 0
export function rollEquipment(rng: Rng = Math.random): Equipment {
  const quality = pick(QUALITY_WEIGHT, rng)
  const slot = SLOTS[Math.floor(rng() * SLOTS.length)]
  const [lo, hi] = AFFIX_RANGE[quality]
  const affixes: Affix[] = []
  for (let i = 0; i < AFFIX_COUNT[quality]; i++) {
    const type = AFFIX_TYPES[Math.floor(rng() * AFFIX_TYPES.length)]
    const value = Math.round(lo + rng() * (hi - lo)) / 100
    affixes.push({ type, value })
  }
  return { id: `e${Date.now().toString(36)}${idSeq++}`, slot, quality, affixes }
}

/** 已裝備部位的加成總和(同類型相加) */
export function equipBonuses(equipped: Record<Slot, Equipment | null>): Record<AffixType, number> {
  const out: Record<AffixType, number> = { dmg: 0, gold: 0, crit: 0, clickDmg: 0 }
  for (const slot of SLOTS) {
    const e = equipped[slot]
    if (!e) continue
    for (const a of e.affixes) out[a.type] += a.value
  }
  return out
}

/** 裝備評分:用於「是否比身上的好」提示 */
export function score(e: Equipment): number {
  return QUALITIES.indexOf(e.quality) * 100 + e.affixes.reduce((s, a) => s + a.value * 100, 0)
}
