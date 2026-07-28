import type { SkillId } from './types'

export interface Skill {
  id: SkillId
  name: string
  icon: string
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
}

export const SKILLS: Record<SkillId, Skill> = {
  shieldRush: {
    id: 'shieldRush',
    name: '盾牆突擊',
    icon: '🛡️',
    desc: '10 秒內傷害 ×2.5',
    cd: 75,
    duration: 10,
    dmgMult: 2.5,
  },
  gale: {
    id: 'gale',
    name: '疾風連刺',
    icon: '🗡️',
    desc: '10 秒內暴擊率 +60%',
    cd: 75,
    duration: 10,
    critAdd: 0.6,
  },
  judgement: {
    id: 'judgement',
    name: '聖光審判',
    icon: '✨',
    desc: '立即造成 25 秒份的傷害',
    cd: 90,
    burstSeconds: 25,
  },
  bulwark: {
    id: 'bulwark',
    name: '不動如山',
    icon: '🏰',
    desc: '15 秒內傷害 ×3',
    cd: 70,
    duration: 15,
    dmgMult: 3,
  },
  shadowClone: {
    id: 'shadowClone',
    name: '影分身',
    icon: '🌑',
    desc: '15 秒內暴擊率 +100%',
    cd: 70,
    duration: 15,
    critAdd: 1,
  },
  meteor: {
    id: 'meteor',
    name: '隕石術',
    icon: '☄️',
    desc: '立即造成 40 秒份的傷害',
    cd: 80,
    burstSeconds: 40,
  },
}
