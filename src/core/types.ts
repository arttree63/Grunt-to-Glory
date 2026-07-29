import type { Decimal } from './decimal'

export type Slot = 'weapon' | 'head' | 'body' | 'boots' | 'trinket'
export type Quality = 'white' | 'green' | 'blue' | 'purple' | 'gold' | 'crimson'
/**
 * 詞綴分四類管理(輸出 / 循環 / 經濟 / 節奏),避免無效詞綴稀釋期待。
 * ⚠️ 沒有「範圍類」——現行引擎一次只有一個目標,彈射/穿透/擴散無處可掛。
 */
export type AffixType =
  // 輸出類
  | 'dmg'
  | 'crit'
  | 'critDmg'
  | 'skillDmg'
  | 'bossDmg'
  // 循環類
  | 'cdr'
  | 'buffDur'
  | 'sigilPower'
  // 節奏類
  | 'clickDmg'
  // 經濟類
  | 'gold'
  | 'matFind'
  | 'forgeQuality'
  | 'eventGold'
/**
 * 白裝基底:裝備的第一層,不可變。決定「怎麼打」而不是「打多少」,
 * 也決定這件基底適合打造成哪一系。舊存檔的裝備沒有基底(undefined = 無修正)。
 */
export type BaseType = 'swift' | 'heavy' | 'guard' | 'focus'
/**
 * 機制關鍵字(全遊戲共用語言,見 keywords.ts)。
 * ⚠️ 必須是 enum,禁止自由字串——共鳴判定與 UI 篩選都依賴這個值域。
 */
export type MechanicTag =
  | 'repeat'
  | 'delay'
  | 'mark'
  | 'afterimage'
  | 'copy'
  | 'store'
  | 'transform'
  | 'chain'
  | 'spread'
  | 'cooldown_complete'
  | 'sequence'
  | 'relic'
  | 'formation'
  // v1.5 新增四個(事件庫有、關鍵字缺的類別)
  | 'clone'
  | 'status'
  | 'zone'
  | 'displace'
/** 傭兵(v1.5:低頻高辨識度的戰鬥事件來源) */
export type MercId = 'hound' | 'rogue' | 'icemage' | 'sapper' | 'pyro'
/** 套裝標籤(裝備第四層)。標籤制:任何品質都可能帶,不綁部位 */
export type SetTagId = 'ironwall' | 'commander'
/** 傳說特性(裝備第三層)。固定,不可被重鑄洗掉 */
export type LegendId =
  | 'wall'
  | 'windboots'
  | 'codexpage'
  | 'hourglass'
  | 'greedeye'
  | 'lostbanner'
  // v1.5 行為型傳說:穿上之後,戰鬥畫面會多發生一件事
  | 'twinblade'
  | 'bannerflag'
  | 'ember'
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
  /** 不退之壁:軍陣常駐,不倒數(倍率改用平均值,總輸出不變) */
  permanent?: boolean
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
  /** 基底(不可變)。舊存檔沒有 → 無修正 */
  base?: BaseType
  /** 傳說特性(不可重鑄)。只有傳奇以上會有 */
  legend?: LegendId
  /** 套裝標籤(不可重鑄)。任何品質都可能帶 */
  setTag?: SetTagId
  affixes: Affix[]
  /** 神匠成長(武器吞噬 / 活體神兵),1 = 未成長 */
  growth?: number
  /** 活體神兵已進化幾階 */
  livingSteps?: number
  /** 已銘刻為傳家之器(同時只能有一件) */
  heirloom?: boolean
  /** 傳家之器的殘缺版:保留機制,基礎數值待修復 */
  broken?: boolean
  /** 殘缺版修復後要回到的品質 */
  fullQuality?: Quality
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

  // ── 傳說裝(關鍵字狀態)──
  /** 順序:本次循環已施放過的不同技能 */
  castOrder: SkillId[]
  /** 倒轉沙漏的觸發鎖(秒,暫態)。護欄:冷卻完成類不得連鎖自我觸發 */
  hourglassLock: number
  /** 追風者之靴:本秒已推進幾次冷卻(暫態,每秒上限) */
  windUses: number
  windAcc: number
  /** 貪婪之眼:已備妥的遺物弱點(下場 Boss 開場生效) */
  relicPending: boolean
  /** 遺物弱點剩餘秒數(暫態) */
  relicLeft: number
  /** 失落軍旗:儲存的爆發秒數,下次施放技能時一起釋放 */
  bannerStored: number
  /** 戰術指揮官 3 件:指令已完成,下一個技能轉化為指揮形態 */
  commandReady: boolean

  // ── 傭兵(roster 跨轉生;行為計時是暫態)──
  /** 出戰中的傭兵(同時 1 隻) */
  activeMerc: MercId | null
  /** 下次招牌行為倒數(秒,暫態) */
  mercTimer: number
  /** 本場 Boss 已被凍結幾次(護欄:每場上限) */
  freezeUsedThisBoss: number

  // ── 戰鬥狀態(v1.5 行為原型;全部暫態,不進存檔)──
  /** 凍結剩餘秒數:期間傷害進 frozenPool 不結算 */
  freezeLeft: number
  /** 凍結期間累積的傷害,解凍時一次引爆 */
  frozenPool: Decimal
  /** 燃燒剩餘秒數 */
  burnLeft: number
  /** 燃燒每秒傷害 */
  burnDps: Decimal
  /** 熔火軍旗:軍旗剩餘秒數(攻擊分一份由軍旗打出) */
  bannerLeft: number
  /** 場地物件(砲台)剩餘秒數與每秒傷害 */
  zoneLeft: number
  zoneDps: Decimal
  /** 歷代最高層(跨轉生,解鎖傭兵用;highestFloor 每輪歸零所以要另存) */
  mercBestFloor: number
  /** 傳說圖鑑:歷代鍛出過哪些傳說(跨轉生保留) */
  legendsSeen: LegendId[]
  /** 本輪銘刻為傳家之器的裝備 id(同時只能有一件) */
  inscribedId: string | null
  /**
   * 命運 × 職業矩陣圖鑑(跨轉生保留)。
   * key = `一轉職業:命運`,value = 首次達成的代數。這是玩家的長期目標地圖。
   */
  jobMatrix: Record<string, number>
  /** 距上次攻擊累積的秒數(暫態,不進存檔) */
  attackAcc: number
  /** 本次事件已用點擊換到幾個素材(暫態) */
  eventClickMats: number
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
    | 'runReset'
    | 'moraleBurst'
    | 'clickMaterial'
    | 'weaponEvolve'
    | 'encounter'
    | 'skill'
    | 'heirloomRestored'
    | 'bannerStore'
    | 'cooldownAdvance'
    | 'mercAct'
    | 'freezeStart'
    | 'freezeBurst'
    | 'burnTick'
  floor?: number
  gold?: Decimal
  /** attack 事件:這一擊實際造成的傷害 */
  damage?: Decimal
  equipment?: Equipment
  /** kill 事件在單 tick 內合併的隻數;skill 事件則是消耗掉的印記層數 */
  count?: number
  /** cooldownAdvance:這次推進了幾秒(演出用來讓冷卻條跳一格) */
  seconds?: number
  slot?: Slot
  kind?: EventKind
  skillId?: SkillId
  encounterId?: EncounterId
  mercId?: MercId
  /** attack 事件:這一擊來自誰(分帳演出用)。省略 = 主角 */
  source?: 'hero' | 'clone' | 'zone' | 'merc'
}
