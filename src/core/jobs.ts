import type { JobId, SkillId } from './types'

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
  /** 主動技能(轉職即解鎖) */
  skills: SkillId[]
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
    look: { cape: 0x3a6b8a, weapon: 'sword' },
  },
}

export const ALL_JOBS = Object.values(JOBS)

/** 目前能轉的職業(下一階、等級達標) */
export function availableJobs(jobId: JobId, lv: number): Job[] {
  return ALL_JOBS.filter((j) => j.from === jobId && lv >= j.reqLv)
}

/** 下一階職業(不論等級是否達標),用來顯示「還差幾級」 */
export function nextTierJobs(jobId: JobId): Job[] {
  return ALL_JOBS.filter((j) => j.from === jobId)
}
