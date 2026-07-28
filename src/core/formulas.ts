import { D, Decimal } from './decimal'
import * as B from './balance'

/** 怪物 HP:前 30 層走新手斜坡(1.13),之後回 1.16 */
export function mobHP(floor: number): Decimal {
  const early = Math.min(floor, B.RAMP_FLOOR) - 1
  const late = Math.max(0, floor - B.RAMP_FLOOR)
  return D(B.BASE_MOB_HP)
    .mul(Decimal.pow(B.GROWTH_HP_EARLY, early))
    .mul(Decimal.pow(B.GROWTH_HP, late))
}

export function bossHP(floor: number): Decimal {
  return mobHP(floor).mul(B.BOSS_HP_MULT)
}

export function goldDrop(floor: number): Decimal {
  return D(B.BASE_GOLD).mul(Decimal.pow(B.GROWTH_GOLD, floor - 1))
}

export function upCost(lv: number): Decimal {
  return D(B.BASE_UP_COST).mul(Decimal.pow(B.COST_GROWTH, lv - 1))
}

export function isBossFloor(floor: number): boolean {
  return floor % B.BOSS_EVERY === 0
}

export function moraleMult(morale: number): number {
  return 1 + morale * B.MORALE_DMG_PER_POINT
}

export interface DpsInput {
  lv: number
  /** 力量天賦的傷害乘區 */
  strMult?: number
  /** 轉生科技的傷害乘區(techDamageMult) */
  techMult?: number
  /** 裝備詞條加成,如 0.35 = +35% */
  equipBonus?: number
  morale?: number
  /** 暴擊期望倍率 */
  critMult?: number
  /** 技能 buff 的傷害乘區 */
  buffMult?: number
}

/** 主角 DPS:等級 × 力量 × 科技 × 裝備 × 戰意 × 暴擊期望 × 技能 */
export function heroDPS({
  lv,
  strMult = 1,
  techMult = 1,
  equipBonus = 0,
  morale = 0,
  critMult = 1,
  buffMult = 1,
}: DpsInput): Decimal {
  return D(B.BASE_DPS)
    .mul(Decimal.pow(B.BASE_DMG_PER_LV, lv - 1))
    .mul(strMult)
    .mul(techMult)
    .mul(1 + equipBonus)
    .mul(moraleMult(morale))
    .mul(critMult)
    .mul(buffMult)
}

/** 暴擊期望倍率:暴擊不再只是跳字特效,真的進傷害 */
export function critMultiplier(critRate: number, critDamageBonus = 0): number {
  const capped = Math.min(1, critRate)
  return 1 + capped * (B.CRIT_MULT * (1 + critDamageBonus) - 1)
}

/** 轉生可得勳章(取代舊有,非累加) */
export function medalsFromFloor(highestFloor: number): number {
  return Math.floor(highestFloor / B.MEDAL_PER_FLOORS)
}

/** 從 lv 起連買 n 級的總成本 */
export function bulkUpCost(lv: number, n: number): Decimal {
  let total = D(0)
  for (let i = 0; i < n; i++) total = total.add(upCost(lv + i))
  return total
}

/** 現有金幣最多可買幾級 */
export function affordableLevels(lv: number, gold: Decimal, max = 1000): number {
  let n = 0
  let left = gold
  while (n < max) {
    const c = upCost(lv + n)
    if (left.lt(c)) break
    left = left.sub(c)
    n++
  }
  return n
}
