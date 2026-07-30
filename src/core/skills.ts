import type { SkillId } from './types'

export interface Skill {
  id: SkillId
  name: string
  desc: string
  /** 冷卻秒數(未計智力縮減) */
  cd: number
  /** buff 型:持續秒數 */
  duration?: number
  /** buff 型:傷害乘區 */
  dmgMult?: number
  /** buff 型:暴擊率加成 */
  critAdd?: number
  /** 立即傷害型:造成相當於 N 秒 DPS 的傷害 */
  burstSeconds?: number
  /** 消耗印記型:依印記層數造成傷害,並清空印記 */
  consumesSigils?: boolean
  /** 印記在這個職業叫什麼 */
  sigilName?: string
}

/**
 * 一轉第二技能:三個職業共用同一個骨架
 *   既有技能建立累積 → 印記疊加 → 第二技能挑時機消耗
 * 現行模型做得出來(只要一個計數器 + 一次爆發),不需要位置、多目標或 HP。
 */
export const SKILLS: Record<SkillId, Skill> = {
  shieldRush: {
    id: 'shieldRush',
    name: '盾牆突擊',
    desc: '10 秒內傷害 ×2.5',
    cd: 75,
    duration: 10,
    dmgMult: 2.5,
  },
  gale: {
    id: 'gale',
    name: '疾風連刺',
    desc: '10 秒內暴擊率 +60%',
    cd: 75,
    duration: 10,
    critAdd: 0.6,
  },
  judgement: {
    id: 'judgement',
    name: '聖光審判',
    desc: '立即造成 25 秒份的傷害',
    cd: 90,
    burstSeconds: 25,
  },
  bulwark: {
    id: 'bulwark',
    name: '不動如山',
    desc: '15 秒內傷害 ×3',
    cd: 70,
    duration: 15,
    dmgMult: 3,
  },
  shadowClone: {
    id: 'shadowClone',
    name: '影分身',
    desc: '15 秒內暴擊率 +100%',
    cd: 70,
    duration: 15,
    critAdd: 1,
  },
  rally: {
    id: 'rally',
    name: '軍陣號令',
    desc: '立即發動小型號令；消耗全部軍勢強化爆發',
    cd: 20,
    consumesSigils: true,
    sigilName: '軍勢',
  },
  windMark: {
    id: 'windMark',
    name: '追風印記',
    desc: '立即發動一次追擊；消耗全部追風印記強化追擊',
    cd: 20,
    consumesSigils: true,
    sigilName: '追風印記',
  },
  edict: {
    id: 'edict',
    name: '律令標記',
    desc: '立即降下小型裁決；引爆全部法令強化傷害',
    cd: 20,
    consumesSigils: true,
    sigilName: '法令',
  },
  meteor: {
    id: 'meteor',
    name: '隕石術',
    desc: '立即造成 40 秒份的傷害',
    cd: 80,
    burstSeconds: 40,
  },
}
