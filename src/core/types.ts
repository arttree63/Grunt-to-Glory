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
export type TechId =
  | 'valor'
  | 'supply'
  | 'legacy'
  | 'camp'
  | 'heirloom'
  // 準備型科技(2026-07-31):不給傷害乘數,改變「下一輪怎麼開局」。
  // 加這三項是因為裝備運氣(×3.5~7.7)壓過轉生成長(×1.2~3.1),
  // 玩家感覺不到「這輪比上輪強」——見 game-balance § 七
  | 'mastery'
  | 'herald'
  | 'quarter'
export type EventKind = 'chest' | 'goblin'
/** Boss 行為原型(v1.7):敵人對玩家的構築提出不同的問題 */
export type BossKind = 'shell' | 'channel' | 'totem'
/** 戰術修正(在線三選一,只對下一次挑戰生效;離線無修正) */
export type TacticId = 'delay' | 'keepSigils' | 'mercFirst'
/** 留存事件:不限時,保留在「旅途紀錄」等玩家回來處理,不會因掛機錯過 */
export type EncounterId =
  | 'blacksmith'
  | 'merchant'
  | 'crossroad'
  // 2026-07-31 擴充:原本只有三種,每一輪玩家看到的都是同樣三個選擇。
  // 新增的四種刻意接上「素材↔金幣」以外的系統(共鳴/敵情/風險/越戰越勇),
  // 讓選擇服務不同的構築目標,而不是換個包裝的同一個決定
  | 'remains'
  | 'veteran'
  | 'supply'
  | 'wounded'

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
  /** 人格稱號(行為計數推出;沒有鮮明行為就 null)。舊列傳沒有此欄位 */
  title?: string | null
  /** 代表事件一句話(bossStats 餵)。舊列傳沒有此欄位 */
  highlight?: string | null
}

export interface RouteBuff {
  kind: 'material' | 'gold'
  floorsLeft: number
}

/** 一場 Boss 戰的統計:失敗後要能告訴玩家「差在哪、該改什麼」 */
/**
 * 一次「命中」的明確描述(GDD v3 § 5.4)。
 * ⚠️ 不可用 dealDamage 的呼叫次數當命中數:一個技能可能內部多次呼叫但玩家認知上是一擊,
 * 反之本體與分身應算兩個攻擊者。否則技能重構會意外改變拆盾效率。
 */
export interface HitEvent {
  /** 玩家認知上的「一擊」 */
  hitEventId: string
  /** 本體 / 分身 / 砲台 / 傭兵 */
  sourceEntityId: string
  shieldHitValue: number
}

export interface BossStats {
  floor: number
  kind: BossKind
  win: boolean
  /** 傷害分帳(hero/clone/zone/merc/burn/frozen/skill) */
  bySource: Record<string, number>
  /** 護盾佔用的秒數 */
  shellTime: number
  /** 投入的破盾值總量與各來源分帳(驗證分身/燃燒是否真的更快) */
  shieldValue: number
  shieldBySource: Record<string, number>
  /** 本場破盾值曾達到的每秒峰值(反推上限用) */
  shieldPeakPerSec: number
  /** 打斷成功 / 嘗試次數 */
  interrupts: number
  channels: number
  /** 圖騰存活總秒數 */
  totemTime: number
  /** 對 Boss 本體造成的總傷害(相對 maxHp 的比例) */
  dealtRatio: number
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
  /** 前任持有者名(傳家之器跨輪時寫入,關聯感串接) */
  bearer?: string
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

  // ── Boss 行為(v1.7,全部單場暫態)──
  /** 本場 Boss 的行為原型;非 Boss 為 null */
  bossKind: BossKind | null
  /** 拆盾:剩餘護盾層數(0 = 已破)。底層以破盾值累計,UI 只看層數 */
  shellLeft: number
  /** 當前這一層累積的破盾值(0 ~ SHIELD_VALUE_PER_LAYER) */
  shellValue: number
  /** 本秒已投入的破盾值與計時(每秒上限,暫態) */
  shellValueThisSec: number
  shellSecAcc: number
  /** 破盾易傷剩餘秒數 */
  shellVulnLeft: number
  /** 蓄力:剩餘秒數(0 = 沒在蓄);本場已用掉哪幾個觸發點 */
  channelLeft: number
  channelUsed: number
  /** 蓄力期間已打進的傷害(達標即打斷) */
  channelDamage: Decimal
  /** 打斷成功的易傷 / 失敗的硬化 剩餘秒數 */
  vulnLeft: number
  hardenLeft: number
  /** 圖騰(優先目標;燃燒與背刺無視它直接打 Boss) */
  totemHp: Decimal
  totemMaxHp: Decimal
  /** 下一根圖騰在倒數剩幾秒時出現 */
  nextTotemAt: number

  // ── Boss 戰統計(失敗診斷用,單場暫態)──
  bossStats: BossStats | null
  /** 上一場 Boss 的統計(給失敗診斷 UI;不進存檔) */
  lastBossStats: BossStats | null

  // ── 本輪行為計數(人格稱號 / 代表事件用;進存檔,轉生歸零)──
  runStats: {
    /** 本輪總擊殺(相對比例的分母) */
    kills: number
    /** 傭兵造成的最後一擊 */
    mercKills: number
    /** 本輪施放技能次數 */
    skillCasts: number
    /** 最後 5 秒內擊破 Boss 的次數 */
    lateBossKills: number
  }
  /** 本輪代表事件一句話(最戲劇性的那個,轉生時寫進列傳) */
  runHighlight: string | null

  // ── 敵情熟悉度(跨轉生保留——前代學會的敵情成為下代知識)──
  /** 各行為原型:遭遇次數 / 成功處理次數(破盾、打斷、毀圖騰) */
  bossLore: Record<BossKind, { seen: number; handled: number }>
  /** 選好的戰術修正(下一次挑戰生效,打完即清;預設 null=無修正) */
  bossTactic: TacticId | null
  /** 緩兵之計剩餘秒數(暫態) */
  tacticDelayLeft: number
  /** 蓄勢而來:本場首次引爆保留印記(暫態,一場一次) */
  tacticKeepSigils: boolean
  /** 完美引爆金色窗口剩餘秒數(印記疊滿時開啟,暫態) */
  perfectWindowLeft: number

  // ── 命運共鳴(本輪累積,轉生歸零;顯示傾向不替玩家推薦)──
  /** 各命運的共鳴值(行為累積) */
  resonance: Record<DestinyPathId, number>
  /** 共鳴來源計數(公開給玩家看:「拆解 ×3、鍛造 ×1」) */
  resonanceSrc: Record<'salvage' | 'forge' | 'event' | 'encounter' | 'combo' | 'skill', number>

  // ── 家族宿敵(籃 C 第三階段第一版:只做宿敵,跨轉生)──
  /** 本輪各層 Boss 的失敗紀錄(次數與最佳戰績),轉生時據此結宿敵 */
  runBossFails: Record<number, { count: number; bestDealt: number }>
  /** 家族宿敵(第一版同時只有一個)。resolved 後保留當紀念 */
  nemesis: {
    floor: number
    kind: BossKind
    /** 結下宿怨的世代 */
    gen: number
    failures: number
    /** 前代最佳戰績:打掉的血量比例(0~1) */
    bestDealt: number
    resolved: boolean
    resolvedGen?: number
  } | null

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
  /**
   * 待決的抉擇選項。
   * ⚠️ 一定要是 state,不可再用「已有節點數當 choices 索引」推導——
   * 命運降臨每次塞一個 tier>0 節點進去,索引立刻錯位,玩家會看到錯的選項
   * 或直接拿不到選項(命運點永遠花不掉,而且完全靜默)
   */
  pendingChoiceIds: DestinyNodeId[] | null
  /** 已解鎖的命運節點(本輪) */
  destinyNodes: DestinyNodeId[]
  /** 未使用的命運點 */
  destinyPoints: number
  /** 本輪已發出幾枚命運點,用來對里程碑 */
  destinyEarned: number
  /**
   * 自動施放(GDD v3 § 2.4 的最小版)。**預設關**:
   * 開著才自動放技能,所以純掛機玩家的基準曲線完全不受影響。
   * 消耗印記型技能等滿層才放——這是「立即施放 / 滿層施放」兩種策略中的後者,
   * 之後要擴成完整策略模板就從這裡長。
   */
  autoCast: boolean
  /** 各技能剩餘冷卻(秒) */
  skillCd: Partial<Record<SkillId, number>>
  /**
   * 生效中的技能 buff(多槽併存,v1.6 總攻改版)。
   * ⚠️ 單槽互斥是「開全套總攻」在結構上不存在的原因——爽感的本體是
   * 「我決定現在全放」,所以不同技能的 buff 必須能疊;同一技能重放則刷新自己。
   */
  buffs: ActiveBuff[]
  /** 印記層數(軍勢 / 追風印記 / 法令,三職業共用同一個計數) */
  sigils: number
  /** 戰意昂揚:本輪滿層引爆的累積層數(輪內永久乘算,轉生歸零) */
  zealStacks: number
  /** 乘勝推進:Boss 擊破後的加速剩餘秒數(暫態) */
  conquestLeft: number

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
  /** 燃燒層數(F18 爆燃演出用;滿層歸零並發 burnMax,暫態) */
  burnStacks: number
  /** 燃燒每秒傷害 */
  burnDps: Decimal
  /** 熔火軍旗:軍旗剩餘秒數(攻擊分一份由軍旗打出) */
  bannerLeft: number
  /** 場地物件(砲台)剩餘秒數與每秒傷害 */
  zoneLeft: number
  zoneDps: Decimal
  /** 砲台開火計時(暫態):固定節奏而非每 tick */
  zoneFireAcc: number
  /** 歷代最高層(跨轉生,解鎖傭兵用;highestFloor 每輪歸零所以要另存) */
  mercBestFloor: number
  /** 傳說圖鑑:歷代鍛出過哪些傳說(跨轉生保留) */
  legendsSeen: LegendId[]
  /** 已達成的軍功記錄 id(跨轉生保留;單輪條件達成過就不收回) */
  achieved: string[]
  /** 本輪銘刻為傳家之器的裝備 id(同時只能有一件) */
  inscribedId: string | null
  /**
   * 命運 × 職業矩陣圖鑑(跨轉生保留)。
   * key = `一轉職業:命運`,value = 首次達成的代數。這是玩家的長期目標地圖。
   */
  jobMatrix: Record<string, number>
  /** 距上次攻擊累積的秒數(暫態,不進存檔) */
  attackAcc: number
  /** 點擊傷害的每秒預算餘額(秒份 DPS,暫態)。GDD v3 § 1.4 */
  clickBudget: number
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
  /** 連續未出金以上的次數 → 精工長保底(跨轉生保留,50 次必出帶套裝標籤的傳奇) */
  pityLegendary: number
  /** 短保底:精工累計未出傳說特性的次數(跨轉生保留;普通鍛造每 10 次 +1) */
  pityLegendShort: number
  /** 普通鍛造次數 mod 10 的進度(推短保底用) */
  normalForgeProgress: number
  /** 本輪已用掉幾次精工(每輪上限 FINE_FORGE_PER_RUN) */
  fineForgesUsed: number
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
    | 'clickFeedback'
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
    | 'burnMax'
    | 'perfectBurst'
    | 'nemesisResolved'
    | 'zealGain'
    | 'shellBreak'
    | 'channelStart'
    | 'interrupted'
    | 'channelFailed'
    | 'totemSpawn'
    | 'totemDown'
    | 'achievement'
    | 'zoneEnter'
    | 'sigilGain'
    | 'resonanceGain'
    | 'freezeCapped'
    | 'relicPrimed'
    | 'shellGain'
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
  /** achievement 事件:達成的軍功記錄 id */
  achievementId?: string
  mercId?: MercId
  /** attack 事件:這一擊來自誰(分帳演出用)。省略 = 主角 */
  source?: 'hero' | 'click' | 'clone' | 'zone' | 'merc'
  /**
   * 觸發歸因(演出用):
   * sigilGain — window(視窗內擊殺)/ chance(不退之壁擲骰)/ combo(戰術家連斬)/
   *             hunter(尋寶獵人事件)/ edict(聖光施放留印)/ rogue(盜賊背刺破綻)/
   *             battle(固定擊殺自然累積)
   * cooldownAdvance — windboots / hourglass / reload(引爆回轉)
   * moraleBurst — lostbanner(失落軍旗釋放,跳字別再寫成普通戰意爆發)
   * skill — ironwall(帝國鐵壁 3 件自動引爆,非玩家手動)
   */
  via?:
    | 'window'
    | 'chance'
    | 'combo'
    | 'hunter'
    | 'edict'
    | 'rogue'
    | 'battle'
    | 'windboots'
    | 'hourglass'
    | 'reload'
    | 'lostbanner'
    | 'ironwall'
  /** skill 事件(裁決餘燼):damage 中有多少轉入燃燒(七成立即、這一份慢燒) */
  burnDamage?: Decimal
  /** shellGain 事件:這次投入的破盾值來源(hero/skill/merc/burn/banner…) */
  shellSource?: string
  /**
   * attack / burnTick:圖騰在場時仍打進本體(燃燒/背刺的穿透)。
   * 演出要在跳字標出「穿透」——規則用看的學,不用文字解釋。
   */
  pierce?: boolean
}
