import type { Decimal } from './decimal'

export type Slot = 'weapon' | 'head' | 'body' | 'boots' | 'trinket'
export type Quality = 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'crimson'
export type AffixType = 'dmg' | 'gold' | 'crit' | 'clickDmg'
export type JobId = 'rookie' | 'infantry' | 'scout'

export interface Affix {
  type: AffixType
  /** 百分比,0.12 = +12% */
  value: number
}

export interface Equipment {
  id: string
  slot: Slot
  quality: Quality
  affixes: Affix[]
}

export interface GameState {
  version: number

  // 養成
  lv: number
  gold: Decimal
  jobId: JobId

  // 關卡
  floor: number
  highestFloor: number
  killsInFloor: number

  // 當前戰鬥
  isBoss: boolean
  enemyHp: Decimal
  enemyMaxHp: Decimal
  bossTimeLeft: number
  /** 本層 Boss 已挑戰失敗過 → farm 模式 */
  bossFailed: boolean

  morale: number

  // 資源
  materials: number
  inventory: Equipment[]
  equipped: Record<Slot, Equipment | null>

  // 轉生
  medals: number
  runs: number

  lastSaved: number
}

/** tick 期間發生的事,供 render / UI 演出用(core 不碰畫面) */
export interface GameEvent {
  type: 'kill' | 'bossKill' | 'bossFail' | 'floorUp' | 'levelUp' | 'forge'
  floor?: number
  gold?: Decimal
  equipment?: Equipment
}
