import * as B from './balance'
import type { StatId, Talents } from './types'

export interface StatDef {
  id: StatId
  name: string
  short: string
  desc: string
}

export const STATS: StatDef[] = [
  { id: 'str', name: '力量', short: 'STR', desc: `傷害 ×${B.STR_DMG_PER_POINT} / 暴擊傷害 +${B.STR_CRIT_DMG * 100}%` },
  { id: 'agi', name: '敏捷', short: 'AGI', desc: `暴擊率 +${B.AGI_CRIT_RATE * 100}% / 點擊戰意 +${B.AGI_CLICK * 100}%` },
  { id: 'int', name: '智力', short: 'INT', desc: `技能傷害 +${B.INT_SKILL_DMG * 100}% / 冷卻 −${B.INT_CDR * 100}%` },
  { id: 'luk', name: '幸運', short: 'LUK', desc: `金幣 +${B.LUK_GOLD * 100}% / 鍛造品質 +${B.LUK_FORGE * 100}%` },
]

export const emptyTalents = (): Talents => ({ str: 0, agi: 0, int: 0, luk: 0 })

export const spentPoints = (t: Talents): number => t.str + t.agi + t.int + t.luk

/** 每升一級 1 點 */
export const earnedPoints = (lv: number): number => lv - 1

export const freePoints = (lv: number, t: Talents): number => Math.max(0, earnedPoints(lv) - spentPoints(t))

// ---- 各屬性的實際效果 ----

/** 力量:傷害乘區(與等級基礎相乘) */
export const strDamageMult = (t: Talents): number => B.STR_DMG_PER_POINT ** t.str
export const strCritDamage = (t: Talents): number => t.str * B.STR_CRIT_DMG
export const agiCritRate = (t: Talents): number => t.agi * B.AGI_CRIT_RATE
export const agiClickBonus = (t: Talents): number => t.agi * B.AGI_CLICK
export const intSkillDamage = (t: Talents): number => t.int * B.INT_SKILL_DMG
export const intCdr = (t: Talents): number => Math.min(B.INT_CDR_CAP, t.int * B.INT_CDR)
export const lukGold = (t: Talents): number => t.luk * B.LUK_GOLD
export const lukForge = (t: Talents): number => t.luk * B.LUK_FORGE
