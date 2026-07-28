import type { Decimal } from './decimal'

export type Slot = 'weapon' | 'head' | 'body' | 'boots' | 'trinket'
export type Quality = 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'crimson'
export type AffixType = 'dmg' | 'gold' | 'crit' | 'clickDmg'
export type JobId = 'rookie' | 'infantry' | 'scout'
export type TechId = 'valor' | 'supply' | 'legacy' | 'camp' | 'heirloom'
export type EventKind = 'chest' | 'goblin'

export interface RareEvent {
  kind: EventKind
  hp: Decimal
  maxHp: Decimal
  timeLeft: number
}
export type Techs = Record<TechId, number>

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
  /** 突發事件(寶箱怪 / 黃金哥布林),出現時取代當前目標 */
  event: RareEvent | null
  /** 下次事件倒數(秒) */
  eventCooldown: number

  // 資源
  materials: number
  /** 累積鍛造次數 → 鐵匠鋪等級 */
  forgeCount: number
  /** 連續未出紫以上的次數 → 普通鍛造保底 */
  pityCount: number
  /** 連續未出金以上的次數 → 精工鍛造保底(跨轉生保留) */
  pityLegendary: number
  /** 各部位素材存量 */
  partMaterials: Record<Slot, number>
  /** 菁英素材(品質下限保證券) */
  eliteMaterials: number
  /** 已首殺過的最高 Boss 層數,用來判定部位素材首殺必掉 */
  maxBossKilled: number
  /** 上次領每日 Boss 菁英素材的日期(YYYY-MM-DD) */
  lastEliteDay: string
  inventory: Equipment[]
  equipped: Record<Slot, Equipment | null>

  // 轉生
  medals: number
  runs: number
  techs: Techs

  lastSaved: number
}

/** tick 期間發生的事,供 render / UI 演出用(core 不碰畫面) */
export interface GameEvent {
  type:
    | 'kill'
    | 'bossKill'
    | 'bossFail'
    | 'floorUp'
    | 'levelUp'
    | 'forge'
    | 'partDrop'
    | 'eliteDrop'
    | 'eventSpawn'
    | 'eventKill'
    | 'eventEscape'
  floor?: number
  gold?: Decimal
  equipment?: Equipment
  /** kill 事件在單 tick 內合併的隻數 */
  count?: number
  slot?: Slot
  kind?: EventKind
}
