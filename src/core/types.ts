import type { Decimal } from './decimal'

export type Slot = 'weapon' | 'head' | 'body' | 'boots' | 'trinket'
export type Quality = 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'crimson'
export type AffixType = 'dmg' | 'gold' | 'crit' | 'clickDmg'
export type JobId =
  | 'rookie'
  | 'infantry'
  | 'scout'
  | 'marshal'
  | 'paladin'
  | 'shadow'
  | 'archmage'
  // 命運限定二轉(一轉職業 + 本輪命運共同決定)
  | 'forgewarden'
  | 'shadowvanguard'
  | 'relicarbiter'
export type SkillId =
  | 'shieldRush'
  | 'gale'
  | 'judgement'
  | 'bulwark'
  | 'shadowClone'
  | 'meteor'
  // 一轉第二技能(職業覺醒後解鎖)
  | 'rally'
  | 'windMark'
  | 'edict'
export type DestinyPathId = 'artisan' | 'hunter' | 'tactician'
export type DestinyNodeId = string

/** 技能造成的限時 buff */
export interface ActiveBuff {
  skillId: SkillId
  timeLeft: number
}
export type TechId = 'valor' | 'supply' | 'legacy' | 'camp' | 'heirloom'
export type EventKind = 'chest' | 'goblin'
/** 留存事件:不限時,保留在「旅途紀錄」等玩家回來處理,不會因掛機錯過 */
export type EncounterId = 'blacksmith' | 'merchant' | 'crossroad'

export interface PendingEncounter {
  id: EncounterId
  floor: number
}

/** 岔路等事件給的限時增益,以剩餘層數計算 */
/** 歷代小兵列傳。每代結束自動生成一張卡 */
export interface ChronicleEntry {
  gen: number
  name: string
  /** 職業路徑,例如「重裝步兵 → 聖騎士」 */
  jobPath: string
  destiny: string | null
  floor: number
  /** 留下的傳家之器名稱 */
  heirloom: string | null
  /** 結局文字。⚠️ 不可寫「被打死」——遊戲沒有玩家 HP */
  epitaph: string
  medalsGained: number
  forgeGained: number
  codexGained: number
}

export interface RouteBuff {
  kind: 'material' | 'gold'
  floorsLeft: number
}

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
  /** 神匠成長(武器吞噬 / 活體神兵),1 = 未成長 */
  growth?: number
  /** 活體神兵已進化幾階 */
  livingSteps?: number
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
  /** 本層 Boss 已挑戰失敗過 → 退回前一層 farm */
  bossFailed: boolean
  /** 失敗的是哪一層的 Boss。玩家退回前一層 farm,按鈕或自動重試會回到這層 */
  bossRetryFloor: number | null

  morale: number
  /** 爐火層數的素材基準:距上次打造累積了多少素材(神匠起始節點) */
  forgeHeatMaterials: number
  /** 傳承圖鑑:歷代登錄過的裝備(跨轉生保留) */
  codex: Equipment[]
  /** 歷代小兵列傳(跨轉生保留) */
  chronicle: ChronicleEntry[]
  /** 本輪開始時的永久資產快照,用來算轉生結算的「本代帶來的變化」 */
  runStart: { medals: number; forgeCount: number; codexCount: number }
  /** 本輪擊破 Boss 次數(活體神兵用) */
  bossKills: number
  /** 本輪選擇的命運路徑 */
  destinyPath: DestinyPathId | null
  /** 已解鎖的命運節點(本輪) */
  destinyNodes: DestinyNodeId[]
  /** 未使用的命運點 */
  destinyPoints: number
  /** 本輪已發出幾枚命運點,用來對里程碑 */
  destinyEarned: number
  /** 各技能剩餘冷卻(秒) */
  skillCd: Partial<Record<SkillId, number>>
  /** 生效中的技能 buff */
  buff: ActiveBuff | null
  /** 印記層數(軍勢 / 追風印記 / 法令,三職業共用同一個計數) */
  sigils: number
  /** 距上次攻擊累積的秒數(暫態,不進存檔) */
  attackAcc: number
  /** 玩家剛點擊,下一個 tick 提前出手(暫態) */
  attackNow: boolean
  /** 突發事件(寶箱怪 / 黃金哥布林),出現時取代當前目標 */
  event: RareEvent | null
  /** 下次事件倒數(秒) */
  eventCooldown: number
  /** 待處理的留存事件(上限 ENCOUNTER_CAP) */
  encounters: PendingEncounter[]
  /** 下一個留存事件的層數 */
  nextEncounterFloor: number
  /** 本輪完成過的事件種類(黃金路線用) */
  eventKindsDone: string[]
  /** 黃金路線:下一次事件保證高價值 */
  goldenPending: boolean
  /** 岔路增益 */
  routeBuff: RouteBuff | null
  /** 本輪已用過幾次命運交易 */
  barterUsed: number

  // ── 戰術家 ──
  /** 連斬層數 */
  combo: number
  /** 距上次擊殺的秒數(連斬視窗) */
  comboIdle: number
  /** 蓄勢中(暫停輸出換爆發) */
  charging: boolean
  /** 蓄勢層數 */
  chargeStacks: number
  /** 蓄勢爆發剩餘秒數 */
  chargeBurstLeft: number
  /** Boss 失敗累積的戰術加成層數 */
  valiantStacks: number

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
    | 'destinyPoint'
    | 'attack'
    | 'weaponEvolve'
    | 'encounter'
    | 'skill'
  floor?: number
  gold?: Decimal
  /** attack 事件:這一擊實際造成的傷害 */
  damage?: Decimal
  equipment?: Equipment
  /** kill 事件在單 tick 內合併的隻數 */
  count?: number
  slot?: Slot
  kind?: EventKind
  skillId?: SkillId
  encounterId?: EncounterId
}
