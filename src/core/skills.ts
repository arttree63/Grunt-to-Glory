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
  /** 傳奇技能不消耗 MP，改走完整冷卻。 */
  apex?: boolean
  /** 立即回復最大 HP 的比例。 */
  healRatio?: number
  /** 生效期間承受威脅傷害的倍率。 */
  defenseMult?: number
  /** 生效期間攻擊間隔倍率。 */
  attackSpeedMult?: number
  /** 技能造成的獨立命中段數。 */
  hitCount?: number
  /** 每次擋下威脅後，反擊折算的 DPS 秒數。 */
  retaliationSeconds?: number
}

/**
 * 一轉第二技能:三個職業共用同一個骨架
 *   既有技能建立累積 → 印記疊加 → 第二技能挑時機消耗
 * 現行模型做得出來(只要一個計數器 + 一次爆發),不需要位置、多目標或 HP。
 */
export const SKILLS: Record<SkillId, Skill> = {
  armsHeavy: { id: 'armsHeavy', name: '重擊', desc: '造成 8 秒份傷害，破盾值較高', cd: 14, burstSeconds: 8, hitCount: 2 },
  armsCharge: { id: 'armsCharge', name: '衝鋒', desc: '先鋒軍發動三段突擊，造成 12 秒份傷害', cd: 26, burstSeconds: 12, hitCount: 3 },
  armsCommand: { id: 'armsCommand', name: '先鋒號令', desc: '消耗所有已部署士兵發動總攻；每名士兵提高 12% 傷害', cd: 44, burstSeconds: 22, hitCount: 5 },
  armsLegend: { id: 'armsLegend', name: '武神姿態', desc: '12 秒內傷害 ×3', cd: 85, duration: 12, dmgMult: 3, apex: true },

  bodyGuard: { id: 'bodyGuard', name: '格擋', desc: '8 秒內減傷；每次受擊反擊，盾衛兵會強化反擊', cd: 20, duration: 8, defenseMult: 0.45, retaliationSeconds: 0.55 },
  bodyIronwall: { id: 'bodyIronwall', name: '鐵壁', desc: '12 秒內傷害 ×1.3、減傷並強化反擊', cd: 34, duration: 12, dmgMult: 1.3, defenseMult: 0.4, retaliationSeconds: 0.8 },
  bodyCommand: { id: 'bodyCommand', name: '盾衛號令', desc: '回復 30% HP，10 秒內全軍架盾反擊', cd: 48, duration: 10, healRatio: 0.3, defenseMult: 0.5, retaliationSeconds: 1.05 },
  bodyLegend: { id: 'bodyLegend', name: '不落要塞', desc: '回復 40% HP，15 秒內攻擊 ×1.8、極大減傷與反擊', cd: 95, duration: 15, dmgMult: 1.8, healRatio: 0.4, defenseMult: 0.2, retaliationSeconds: 1.4, apex: true },

  agilityRoll: { id: 'agilityRoll', name: '翻滾', desc: '6 秒內暴擊率 +25%、承受傷害 ×0.15', cd: 18, duration: 6, critAdd: 0.25, defenseMult: 0.15 },
  agilityHaste: { id: 'agilityHaste', name: '疾走', desc: '10 秒內攻擊間隔 ×0.65、暴擊率 +20%', cd: 30, duration: 10, critAdd: 0.2, attackSpeedMult: 0.65 },
  agilityCommand: { id: 'agilityCommand', name: '游擊號令', desc: '游擊兵發動八段攻擊', cd: 44, burstSeconds: 18, hitCount: 8 },
  agilityLegend: { id: 'agilityLegend', name: '無影突襲', desc: '12 秒內攻擊間隔 ×0.45、傷害 ×1.8', cd: 90, duration: 12, dmgMult: 1.8, attackSpeedMult: 0.45, apex: true },

  magicFireball: { id: 'magicFireball', name: '火球術', desc: '造成 14 秒份魔法傷害', cd: 20, burstSeconds: 14 },
  magicBurst: { id: 'magicBurst', name: '元素爆發', desc: '造成三段、共 26 秒份魔法傷害', cd: 38, burstSeconds: 26, hitCount: 3 },
  magicCommand: { id: 'magicCommand', name: '法師號令', desc: '法師團共同詠唱，造成五段大型傷害', cd: 56, burstSeconds: 38, hitCount: 5 },
  magicLegend: { id: 'magicLegend', name: '禁咒', desc: '造成 70 秒份最高級魔法傷害', cd: 105, burstSeconds: 70, apex: true },

  faithHeal: { id: 'faithHeal', name: '治療術', desc: '立即回復 25% HP', cd: 22, healRatio: 0.25 },
  faithBlessing: { id: 'faithBlessing', name: '神聖祝福', desc: '回復 15% HP，12 秒內傷害 ×1.35、承受傷害 ×0.7', cd: 38, duration: 12, dmgMult: 1.35, healRatio: 0.15, defenseMult: 0.7 },
  faithCommand: { id: 'faithCommand', name: '祭司號令', desc: '回復 40% HP，並造成三段聖光傷害', cd: 54, burstSeconds: 12, healRatio: 0.4, hitCount: 3 },
  faithLegend: { id: 'faithLegend', name: '聖域', desc: '回復 60% HP，15 秒內傷害 ×1.6、承受傷害 ×0.55', cd: 105, duration: 15, dmgMult: 1.6, healRatio: 0.6, defenseMult: 0.55, apex: true },

  // 舊版定義保留供裝備與舊存檔資料解析，不再加入技能列。
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
    apex: true,
  },
  windMark: {
    id: 'windMark',
    name: '追風印記',
    desc: '立即發動一次追擊；消耗全部追風印記強化追擊',
    cd: 20,
    consumesSigils: true,
    sigilName: '追風印記',
    apex: true,
  },
  edict: {
    id: 'edict',
    name: '律令標記',
    desc: '立即降下小型裁決；引爆全部法令強化傷害',
    cd: 20,
    consumesSigils: true,
    sigilName: '法令',
    apex: true,
  },
  meteor: {
    id: 'meteor',
    name: '隕石術',
    desc: '立即造成 40 秒份的傷害',
    cd: 80,
    burstSeconds: 40,
  },
}
