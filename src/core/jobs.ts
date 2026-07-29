import type { DestinyPathId, JobId, SkillId } from './types'

export interface Job {
  id: JobId
  name: string
  tier: number
  reqLv: number
  /** 由哪個職業轉來(Tier 0 為 null) */
  from: JobId | null
  desc: string
  /** 被動:乘入對應乘區 */
  bonus: { dmg?: number; crit?: number; gold?: number; morale?: number }
  /** 轉職即解鎖的主動技能 */
  skills: SkillId[]
  /** 職業覺醒後解鎖的第二技能(消耗印記型) */
  awakenSkill?: SkillId
  /** 命運限定二轉:本輪命運必須是這條才會出現 */
  requiresDestiny?: DestinyPathId
  /**
   * 二轉的「既有技能進化」。content-design 定案:Lv.100 要一次給三層內容
   * (新主動 + 新被動 + **既有技能進化**),前兩項早就有了,這是補上的第三項。
   * 進化不是換一個更大的數字,而是讓一轉那招在循環裡多做一件事。
   */
  evolve?: { skill: SkillId; name: string; desc: string }
  /** 換裝視覺:披風色 / 武器樣式(render 讀) */
  look: { cape: number; weapon: 'wood' | 'sword' | 'dagger' }
}

export const JOBS: Record<JobId, Job> = {
  rookie: {
    id: 'rookie',
    name: '無名小兵',
    tier: 0,
    reqLv: 1,
    from: null,
    desc: '揮著木劍的雜兵,故事從這裡開始。',
    bonus: {},
    skills: [],
    look: { cape: 0x8a3040, weapon: 'wood' },
  },
  infantry: {
    id: 'infantry',
    name: '重裝步兵',
    tier: 1,
    reqLv: 20,
    from: 'rookie',
    desc: '傷害 +20%,戰意衰減減半。適合掛機推進。',
    bonus: { dmg: 0.2, morale: 0.5 },
    skills: ['shieldRush'],
    awakenSkill: 'rally',
    look: { cape: 0x2f4a7a, weapon: 'sword' },
  },
  scout: {
    id: 'scout',
    name: '突擊斥候',
    tier: 1,
    reqLv: 20,
    from: 'rookie',
    desc: '暴擊率 +15%。適合主動點擊。',
    bonus: { crit: 0.15 },
    skills: ['gale'],
    awakenSkill: 'windMark',
    look: { cape: 0x2f6b4a, weapon: 'dagger' },
  },
  marshal: {
    id: 'marshal',
    name: '隨軍法警',
    tier: 1,
    reqLv: 20,
    from: 'rookie',
    desc: '金幣 +25%。技能可瞬間爆發,適合硬闖 Boss。',
    bonus: { gold: 0.25 },
    skills: ['judgement'],
    awakenSkill: 'edict',
    look: { cape: 0x6b4a8a, weapon: 'sword' },
  },
  paladin: {
    id: 'paladin',
    name: '聖騎士',
    tier: 2,
    reqLv: 100,
    from: 'infantry',
    desc: '傷害 +60%,戰意衰減減半。',
    bonus: { dmg: 0.6, morale: 0.5 },
    skills: ['shieldRush', 'bulwark'],
    awakenSkill: 'rally',
    evolve: { skill: 'shieldRush', name: '盾牆突擊・堅陣', desc: '視窗期間的擊殺累積雙倍軍勢' },
    look: { cape: 0xc8b06a, weapon: 'sword' },
  },
  shadow: {
    id: 'shadow',
    name: '影舞者',
    tier: 2,
    reqLv: 100,
    from: 'scout',
    desc: '暴擊率 +30%。',
    bonus: { crit: 0.3 },
    skills: ['gale', 'shadowClone'],
    awakenSkill: 'windMark',
    evolve: { skill: 'gale', name: '疾風連刺・殘影', desc: '視窗期間攻擊間隔縮短,切得更細' },
    look: { cape: 0x2a2a3a, weapon: 'dagger' },
  },
  archmage: {
    id: 'archmage',
    name: '大元素使',
    tier: 2,
    reqLv: 100,
    from: 'marshal',
    desc: '金幣 +60%,爆發技能更強。',
    bonus: { gold: 0.6 },
    skills: ['judgement', 'meteor'],
    awakenSkill: 'edict',
    evolve: { skill: 'judgement', name: '聖光審判・連判', desc: '每次施放留下三枚法令,而不是一枚' },
    look: { cape: 0x3a6b8a, weapon: 'sword' },
  },
  // ── 命運限定二轉:一轉職業 + 本輪命運共同決定 ──
  // 首版只做三組高辨識度組合,剛好各覆蓋一個一轉職業與一條命運;
  // 其餘六格走通用二轉 + 命運後綴,玩家的路線仍被承認
  forgewarden: {
    id: 'forgewarden',
    name: '鐵壁工匠',
    tier: 2,
    reqLv: 100,
    from: 'infantry',
    requiresDestiny: 'artisan',
    desc: '傷害 +50%,戰意衰減減半。軍勢上限再提高,鍛造品質更好。',
    bonus: { dmg: 0.5, morale: 0.5 },
    skills: ['shieldRush', 'bulwark'],
    awakenSkill: 'rally',
    evolve: { skill: 'shieldRush', name: '盾牆突擊・堅陣', desc: '視窗期間的擊殺累積雙倍軍勢' },
    look: { cape: 0x8a6a3a, weapon: 'sword' },
  },
  shadowvanguard: {
    id: 'shadowvanguard',
    name: '影陣先鋒',
    tier: 2,
    reqLv: 100,
    from: 'scout',
    requiresDestiny: 'tactician',
    desc: '暴擊率 +25%。連斬層數上限提高,追風印記引爆更兇。',
    bonus: { crit: 0.25 },
    skills: ['gale', 'shadowClone'],
    awakenSkill: 'windMark',
    evolve: { skill: 'gale', name: '疾風連刺・殘影', desc: '視窗期間攻擊間隔縮短,切得更細' },
    look: { cape: 0x1f2a3a, weapon: 'dagger' },
  },
  relicarbiter: {
    id: 'relicarbiter',
    name: '遺物裁定者',
    tier: 2,
    reqLv: 100,
    from: 'marshal',
    requiresDestiny: 'hunter',
    desc: '金幣 +50%。事件擊破會直接轉化為法令。',
    bonus: { gold: 0.5 },
    skills: ['judgement', 'meteor'],
    awakenSkill: 'edict',
    evolve: { skill: 'judgement', name: '聖光審判・連判', desc: '每次施放留下三枚法令,而不是一枚' },
    look: { cape: 0x6b5a2a, weapon: 'sword' },
  },
}

export const ALL_JOBS = Object.values(JOBS)

/** 下一階的所有候選(不論等級與命運),用來做逐步揭露 */
export function nextTierJobs(jobId: JobId): Job[] {
  return ALL_JOBS.filter((j) => j.from === jobId)
}

/** 本輪實際可能走到的下一階:通用二轉 + 命運相符的限定二轉 */
export function destinyJobs(jobId: JobId, destiny: DestinyPathId | null): Job[] {
  return nextTierJobs(jobId).filter((j) => !j.requiresDestiny || j.requiresDestiny === destiny)
}

/** 目前能轉的職業(等級達標且命運相符) */
export function availableJobs(jobId: JobId, lv: number, destiny: DestinyPathId | null = null): Job[] {
  return destinyJobs(jobId, destiny).filter((j) => lv >= j.reqLv)
}

/** 命運後綴:即使走通用二轉,玩家的路線也要被承認 */
export function destinySuffix(destiny: DestinyPathId | null): string {
  if (destiny === 'artisan') return '・神匠系'
  if (destiny === 'hunter') return '・尋寶系'
  if (destiny === 'tactician') return '・戰術系'
  return ''
}
