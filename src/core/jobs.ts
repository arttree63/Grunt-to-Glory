import type { JobId } from './types'

export interface Job {
  id: JobId
  name: string
  tier: number
  reqLv: number
  desc: string
  /** 職業被動:乘入對應乘區 */
  bonus: { dmg?: number; crit?: number; gold?: number; morale?: number }
  /** 換裝視覺:披風色 / 武器樣式(render 讀) */
  look: { cape: number; weapon: 'wood' | 'sword' | 'dagger' }
}

export const JOBS: Record<JobId, Job> = {
  rookie: {
    id: 'rookie',
    name: '無名小兵',
    tier: 0,
    reqLv: 1,
    desc: '揮著木劍的雜兵,故事從這裡開始。',
    bonus: {},
    look: { cape: 0x8a3040, weapon: 'wood' },
  },
  infantry: {
    id: 'infantry',
    name: '重裝步兵',
    tier: 1,
    reqLv: 20,
    desc: '傷害 +20%,戰意衰減減半——適合掛機推進。',
    bonus: { dmg: 0.2, morale: 0.5 },
    look: { cape: 0x2f4a7a, weapon: 'sword' },
  },
  scout: {
    id: 'scout',
    name: '突擊斥候',
    tier: 1,
    reqLv: 20,
    desc: '暴擊率 +15%,點擊戰意 +50%——適合主動點擊。',
    bonus: { crit: 0.15 },
    look: { cape: 0x2f6b4a, weapon: 'dagger' },
  },
}

export const TIER1_JOBS: Array<Exclude<JobId, 'rookie'>> = ['infantry', 'scout']

export function canPromote(lv: number, jobId: JobId): boolean {
  return jobId === 'rookie' && lv >= JOBS.infantry.reqLv
}
