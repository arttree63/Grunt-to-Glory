/**
 * 數值常數 — 對應 skills/game-balance_SKILL.md
 * 禁止在其他檔案寫魔法數字;調整流程:改 skill → 跑 npm run sim → 改此檔。
 */

// 成長曲線
export const GROWTH_HP = 1.16 // 怪物 HP 每層倍率
export const GROWTH_HP_EARLY = 1.13 // 新手斜坡:前 RAMP_FLOOR 層
export const RAMP_FLOOR = 30
export const GROWTH_GOLD = 1.15 // 金幣每層倍率(低於 HP → 自然撞牆)
export const COST_GROWTH = 1.09 // 升級成本每級倍率
/**
 * 每級傷害。命運樹改版後回歸單一常數:
 * **基礎成長對所有玩家一致**,命運樹只改變玩法與資源路線,不改變基礎 DPS 曲線。
 * 這樣才不會像舊的四維天賦一樣,出現「不點某屬性就殘廢」的唯一解。
 */
export const DMG_PER_LV = 1.072
export const BASE_DMG_PER_LV = DMG_PER_LV

// 基準值
/** 戰鬥數字統一放大，HP 與傷害同比例成長，不影響通關速度與經濟。 */
export const COMBAT_NUMBER_SCALE = 100
export const BASE_MOB_HP = 10 * COMBAT_NUMBER_SCALE
export const BASE_GOLD = 5
export const BASE_UP_COST = 20
export const BASE_DPS = 3.68 * COMBAT_NUMBER_SCALE // 乘上基礎暴擊期望後約 500

// 關卡
export const MOBS_PER_FLOOR = 3
export const BOSS_EVERY = 10
export const BOSS_HP_MULT = 8
export const BOSS_TIME = 30 // 秒
export const BOSS_GOLD_MULT = 3 // Boss 金幣 = 該層小怪 ×3(等同清一層,模擬已含)
export const BOSS_MATERIALS = 3

// 戰意(點擊 buff)
export const MORALE_PER_CLICK = 7
export const MORALE_DECAY = 0.008 // 每 ms
export const MORALE_MAX = 100
export const MORALE_DMG_PER_POINT = 0.004 // 滿層 +40% DPS

/**
 * 點擊的價值不放在常數乘區(那必然被 1.16^層 貶值),而是放在三個地方:
 *   D 二元判定:Boss 檢定與限時事件內,戰意效果加倍且不衰減
 *   C 節奏爆點:戰意滿檔自動爆發,填補 10~30 秒的期待層
 *   素材:事件中點擊直接換素材,素材不隨層數貶值 → 點擊價值永不衰減
 *
 * ⚠️ 調校原則:點擊要把「差一點過不了」變成「過」,而不是「不點就過不了」。
 * 掛機玩家戰意為 0,加倍對他們毫無影響,所以這條天然不懲罰掛機。
 */
export const MORALE_CHECK_BOOST = 2
/**
 * 點擊直接造成的傷害,折算成幾秒份 DPS(受每秒預算約束,見 CLICK_BUDGET_PER_SEC)。
 * 玩家要的是「點了有打到」,所以點擊必須自己出一次手、自己扣一次血。
 * ⚠️ GDD v3 § 1.4:禁止任何點擊傷害相關的升級/詞綴/天賦——避免第二條成長軸。
 * clickDmg 詞綴(點擊戰意)只加**戰意獲取**,不加傷害。
 */
export const CLICK_DMG_SEC = 0.05
/**
 * 每秒點擊傷害預算(GDD v3 § 1.4,封版):budget = DPS × 0.2/秒,單次 0.05 秒份。
 * 用「每秒預算」而非次數上限——防高刷新率、自動連點與巨集突破。
 * 預算用盡的點擊仍給戰意與素材回饋,只是不追加直接傷害。
 * ⚠️ 歷史錯誤:單次 0.3 無上限時,4 點/秒 = +120% DPS,手速會變成最強成長軸。
 */
export const CLICK_BUDGET_PER_SEC = 0.2
export const MORALE_BURST_SEC = 4
/** 每個事件最多能用點擊換到幾個素材 */
export const EVENT_CLICK_MAT_CAP = 12

// 轉生:勳章是純貨幣,加成一律來自科技(每級乘算)
export const MEDAL_PER_FLOORS = 10 // 每 10 層 1 枚勳章

export const TECH_DMG_MULT = 1.1 // 軍功勳令:每級全局傷害
export const TECH_COST_DMG = 3
export const TECH_GOLD_MULT = 1.12 // 後勤補給:每級金幣獲取(第二乘區)
export const TECH_COST_GOLD = 3
export const TECH_START_GOLD_BASE = 500 // 老兵餘蔭:第 1 級的開局資金
export const TECH_START_GOLD_MULT = 5
export const TECH_COST_START = 4
export const TECH_OFFLINE_HOURS = 2 // 營地帳篷:每級離線上限
export const TECH_COST_CAMP = 5
export const TECH_CAMP_MAX = 4
export const TECH_COST_HEIRLOOM = 8 // 家族傳承:每級 +1 件傳家寶
export const TECH_HEIRLOOM_MAX = 4
/**
 * 準備型科技:不給傷害,改變下一輪的開局條件。
 * ⚠️ 為什麼不是再加傷害乘數:實測裝備乘區 ×3.5~7.7 已經蓋過科技 ×1.2~3.1,
 * 再堆乘數只會讓開錘運氣更決定一切。這三項全部指向「降低運氣支配 / 更快成形」。
 */
export const TECH_COST_MASTERY = 6 // 鍛造熟練:每輪精工次數 +1(§ 344 已列 P1 槓桿)
export const TECH_MASTERY_MAX = 3
export const TECH_COST_HERALD = 10 // 傳令兵:開局直接給命運點,每輪更快進入構築
export const TECH_HERALD_MAX = 2
export const TECH_COST_QUARTER = 5 // 軍需官:開局帶部位素材,不必等 Boss 掉才能鎖部位
export const TECH_QUARTER_MAX = 3

// 新兵祝福:首輪限定金幣加成。設 0 = 停用。
// 模擬結論:給了首輪會虛高、轉生後淨變弱(第二輪極限反而下降)→ 停用,首輪節奏改由新手斜坡負責。
export const ROOKIE_BLESSING_GOLD = 0

// 鍛造與素材
export const MATERIAL_PER_MOB = 1
export const FORGE_COST = 10 // 普通鍛造消耗怪物素材

/** 品質基礎倍率:每件裝備是獨立乘區,全金 5 件 = 1.5^5 ≈ +29 級等效 */
export const QUALITY_POWER = {
  white: 1.05,
  green: 1.1,
  blue: 1.18,
  purple: 1.3,
  gold: 1.5,
  crimson: 1.75,
} as const

/** 普通鍛造品質權重 */
export const QUALITY_WEIGHT = {
  white: 0.45,
  green: 0.3,
  blue: 0.17,
  purple: 0.06,
  gold: 0.019,
  crimson: 0.001,
} as const

/** 詞條數 */
export const AFFIX_COUNT = {
  white: 1,
  green: 1,
  blue: 2,
  purple: 2,
  gold: 3,
  crimson: 4,
} as const

/**
 * 詞綴出現權重。輸出類權重最高——玩家一眼看得懂的還是傷害,
 * 循環/經濟類負責製造流派傾向,但不能常見到把輸出稀釋掉(舊版只有 4 種,一半是輸出)。
 */
export const AFFIX_WEIGHT = {
  dmg: 6,
  crit: 5,
  critDmg: 3,
  skillDmg: 2,
  bossDmg: 2,
  cdr: 2,
  buffDur: 2,
  sigilPower: 2,
  clickDmg: 2,
  gold: 3,
  matFind: 2,
  forgeQuality: 2,
  eventGold: 2,
} as const

/**
 * 詞綴值域倍率。同樣「+10%」在不同詞綴上的實際價值差很多——
 * 暴擊率 +10% 約 +15% DPS,暴擊傷害 +10% 只有 +4%。若不修正,
 * 玩家會學到「除了暴擊率其他都是垃圾」,分類管理就白做了。
 */
export const AFFIX_VALUE_MULT = {
  critDmg: 2.5,
  skillDmg: 1.5,
  buffDur: 1.5,
  sigilPower: 1.5,
} as const

/**
 * 白裝基底修正(每件裝備各算一份,5 件同基底才有明顯體感)。
 * ⚠️ 基底改的是節奏不是強度:攻擊間隔在本引擎是傷害中性的(傷害 = DPS × 累積時間),
 * 所以「快 vs 重」不會讓人變強,只會讓打擊感與技能節奏不同。
 * 唯一帶輸出的是重擊的暴擊傷害,5 件滿配約 +8%,壓在 power-neutral 的 ±10% 內。
 */
export const BASE_MODS = {
  swift: { interval: -0.06, cd: 0.03, buffDur: 0, critDmg: 0 },
  heavy: { interval: 0.08, cd: 0, buffDur: 0, critDmg: 0.04 },
  guard: { interval: 0, cd: 0.04, buffDur: 0.06, critDmg: 0 },
  focus: { interval: 0.03, cd: -0.05, buffDur: 0, critDmg: 0 },
} as const

/**
 * 系統級護欄(機制關鍵字表 § 三之二):任何技能的實際冷卻不得低於基礎值的 30%。
 * 「冷卻完成 / 重複 / 複製」這類關鍵字互相組合最容易做出無限循環,下限是全域規則,
 * 不是個別裝備的備註。
 */
export const CD_FLOOR = 0.3

/** 詞條值域(%) */
export const AFFIX_RANGE = {
  white: [3, 5],
  green: [4, 7],
  blue: [6, 9],
  purple: [8, 11],
  gold: [10, 13],
  crimson: [12, 15],
} as const

/** 分解返還怪物素材 */
export const SALVAGE_RETURN = {
  white: 2,
  green: 3,
  blue: 5,
  purple: 8,
  gold: 14,
  crimson: 25,
} as const

// 突發事件:寶箱怪 / 黃金哥布林
export const EVENT_INTERVAL_AVG = 75 // 秒,平均間隔
export const EVENT_TIME = 8 // 秒,逾時逃走
export const EVENT_HP_MULT = 3 // HP = 該層小怪 ×3
export const CHEST_GOLD_MULT = 30 // 金幣 = 該層小怪掉落 ×30
export const GOBLIN_GOLD_MULT = 60

// ── 尋寶獵人流派 ──
/** 留存事件:每隔幾層出現一個,上限幾個待處理 */
export const ENCOUNTER_EVERY_FLOORS = 12
export const ENCOUNTER_CAP = 2
/** 岔路增益持續層數 */
export const ROUTE_BUFF_FLOORS = 15
export const ROUTE_BUFF_MULT = 2
/** 不祥預感:事件出現前幾秒開始預告 */
export const OMEN_LEAD_SEC = 12
/** 追跡者:依剩餘時間比例最多加成 */
export const TRACKER_BONUS = 0.5
/** 耐心獵人:事件時間倍率與獎勵倍率 */
export const PATIENT_TIME_MULT = 1.6
export const PATIENT_REWARD_MULT = 1.25
/** 誘餌箱:事件逃走仍給的獎勵比例 */
export const BAIT_CONSOLATION = 0.3
/** 命運交易:放棄事件獎勵換命運點,每輪上限 */
export const BARTER_MAX_PER_RUN = 2
/** 黃金路線:完成幾種不同事件觸發一次保證高價值,獎勵倍率 */
export const GOLDEN_KINDS_NEEDED = 3
export const GOLDEN_REWARD_MULT = 2
/** 禁忌地圖:事件出現頻率倍率 */
export const FORBIDDEN_RATE_MULT = 0.6

// ── 一轉第二技能(印記體系)──
/** 印記上限。三個職業共用同一套計數,只有名稱與累積來源不同 */
export const SIGIL_MAX = 10
/** 第二技能即使沒有印記也有自己的基本威力，不再只是第一技能的延遲結算按鈕。 */
export const SIGIL_BASE_BURST_SEC = 3
/** 每枚印記在消耗時折算成幾秒份的 DPS */
export const SIGIL_BURST_SEC = 3
/** 覺醒後每累積幾次擊殺自然獲得一枚印記，第一技能只負責加速累積。 */
export const PASSIVE_KILLS_PER_SIGIL = 10
/** 職業覺醒(解鎖第二技能)的雙條件:層數 + 至少一個命運節點 */
export const AWAKEN_FLOOR = 25

// 命運對印記體系的改造:三條命運各自改變「怎麼累積 / 怎麼用」,不是加數字
/** 神匠:囤積思維,印記上限提高 */
export const ARTISAN_SIGIL_CAP = 5
/** 尋寶獵人:事件擊殺也累積印記(把事件拉進戰鬥循環,而不只是經濟) */
export const HUNTER_SIGIL_ON_EVENT = 3
/** 戰術家:連斬每 N 層額外給一枚印記 */
export const TACTICIAN_COMBO_PER_SIGIL = 5

// ── 戰術家流派 ──
/** 乘勝追擊:每層連斬的傷害加成、上限、以及沒擊殺多久開始衰減 */
export const COMBO_DMG = 0.03
export const COMBO_MAX = 20
export const COMBO_WINDOW_SEC = 4
export const COMBO_DECAY_SEC = 1.5
/** 蓄勢:每幾秒累積一層、上限、每層爆發傷害、爆發持續秒數 */
export const CHARGE_SEC = 2
export const CHARGE_MAX = 10
export const CHARGE_DMG = 0.25
export const CHARGE_BURST_SEC = 10
/** 越戰越勇:每次 Boss 失敗累積的加成與上限 */
export const VALIANT_DMG = 0.15
export const VALIANT_MAX = 6

// 部位素材:每 10 層 Boss 首殺必掉 1,重複擊殺機率掉落
export const PART_DROP_REPEAT = 0.3
// 菁英素材:品質下限保證紫以上
export const ELITE_FROM_CHEST = 0.05 // 寶箱怪掉落機率
export const ELITE_DAILY_BOSS = 1 // 每日首次擊破 Boss 保底
export const ELITE_MEDAL_COST = 20 // 轉生商店兌換價

// 精工鍛造:怪物素材 ×10 +(可選)部位素材 +(可選)菁英素材
export const FINE_FORGE_COST = 10
/**
 * 精工每輪次數上限(GDD v3 § 3.9,封版):決策感集中在高價值鍛造。
 * 次數之後可用勳章擴充(P1)。
 */
export const FINE_FORGE_PER_RUN = 3
/**
 * 雙保底(GDD v3 § 3.9):單一 50 次保底在每輪 3 次下最差要 17 輪,無感。
 *   短保底:精工累計 12 次未出**傳說特性** → 必出(玩家等的是玩法改變,不是品質)
 *   長保底:精工累計 50 次 → 必出帶**套裝標籤**的傳奇
 * 普通鍛造每 10 次推進 1 點短保底計數——掛機玩家也持續接近目標。
 */
export const PITY_LEGEND_SHORT = 12
export const PITY_LEGENDARY = 50
export const NORMAL_FORGE_PER_PITY = 10

// 鐵匠鋪等級:每 N 次鍛造升 1 級,每級給品質升階機率
export const FORGE_PER_LEVEL = 25
export const FORGE_MAX_LEVEL = 10
export const FORGE_UPGRADE_PER_LEVEL = 0.04
export const FORGE_UPGRADE_CAP = 0.5

// 普通鍛造保底:連續 N 次未出紫以上 → 必出紫以上(跨轉生保留)
export const PITY_FORGE = 30

// 轉生可指定帶走的裝備件數(基準;「家族傳承」科技每級 +1,最多全身 5 件)
export const HEIRLOOM_SLOTS = 1

// ── 傳家之器(統一系統,取代 v1.2「傳家寶銘刻制」的獨立規則)──
/**
 * 銘刻的那一件跨輪必定回來,但**保留機制不保留強度**:
 * 傳說特性、套裝標籤、一條代表性詞綴留著,品質降階變成「殘缺版」,
 * 打贏幾個 Boss 後修復回原本品質。這樣才不會下一輪開局就碾壓。
 */
export const HEIRLOOM_BROKEN_TIERS = 2
/** 神匠系:殘缺程度較輕,且多保留一條詞綴 */
export const HEIRLOOM_ARTISAN_TIERS = 1
export const HEIRLOOM_AFFIX_KEEP = 1
export const HEIRLOOM_ARTISAN_AFFIX_KEEP = 2
/** 修復條件:本輪擊破幾個 Boss */
export const HEIRLOOM_REPAIR_BOSSES = 3

// 離線收益
export const OFFLINE_RATE = 0.6 // 6 折
export const OFFLINE_CAP_HOURS = 4

// 戰鬥
/**
 * 攻擊間隔(秒)。傷害按這個間隔成塊套用,而不是每 tick 連續扣。
 * 總傷害量不變(dmg = DPS × 累積時間),但血條會跟著揮砍一格一格掉,
 * 而不是像敵人在流血。渲染層的揮砍由 core 發出的 attack 事件驅動,兩者不會漂移。
 */
export const ATTACK_INTERVAL = 0.8
/** 訓練里程碑。只切換攻擊節奏/主動投入,不直接加基礎 DPS。 */
/**
 * 操練令的里程碑。⚠️ 2026-07-31 從**等級**改綁**樓層**。
 *
 * 原本是 `[10,20,30,40,50]` 級。實測腳本化真人操作:五次全部落在開局
 * **1.73 分鐘內**(0.45 / 0.67 / 1.04 / 1.47 / 1.73 分),而且 Lv.20 那次與
 * 一轉(`jobs.ts` 的 reqLv: 20)撞在同一幀——因為兩者都吃等級,而等級在前期會爆衝。
 *
 * 改綁樓層之後:
 * - 與命運降臨、地帶、傭兵解鎖同一把尺,可以刻意交錯而不是意外重疊。
 * - 一轉仍綁等級,所以那個同幀碰撞自動消失。
 * - 樓層是單調遞增的 `highestFloor`,Boss 失敗退層不會把已發的操練令收回去。
 *
 * ⚠️ 第一個里程碑刻意放在**一轉(Lv.20,約 0.67 分)之後**:初版放第 12 層,
 * 實測落在 0.47 分——距命運種子(0.45 分)只有 1.2 秒,正是要避免的那種重疊。
 * 選點依據見下方實測表;會鍛造的玩家更快,但相對間距不變。
 */
export const TRAINING_FLOORS = [25, 40, 65, 95, 125] as const
/**
 * 兩次操練令之間至少隔多久。樓層閘負責「你走得夠遠了」,這道時間閘負責
 * 「不管你走多快,節奏不會被壓扁」——推進快的玩家不會一口氣收到三張。
 */
export const TRAINING_MIN_GAP_SEC = 100
export const TRAINING_HEAVY_INTERVAL = 1.12
export const TRAINING_RAPID_INTERVAL = 0.9
export const TRAINING_MORALE_GAIN = 1.12
export const TRAINING_MORALE_DECAY = 0.9
/**
 * 戰意縮短攻擊間隔:滿戰意時攻擊頻率翻倍。
 * 這是傷害中性的——每擊傷害 = DPS × 累積時間,打得快只是切得細。
 * 但它讓「點擊強化自動攻擊」在畫面上真的看得見。
 */
export const MORALE_ATTACK_SPEED = 0.02

export const TICK_HZ = 10 // 邏輯固定 tick
export const CRIT_RATE = 0.18
export const CRIT_MULT = 3

// ── 神匠流派節點數值 ──
/** 鐵匠學徒:爐火 = 距上次打造累積的素材 / FORGE_COST,每層提高品質升階機率 */
export const HEAT_PER_LAYER = 0.015
export const HEAT_MAX_LAYERS = 8
/** 升階總機率上限(鐵匠鋪等級 + 爐火) */
export const FORGE_UPGRADE_HARD_CAP = 0.75
/** 餘火回收:打造出比身上差的裝備,返還素材比例 */
export const EMBER_REFUND = 0.3
/** 孤注一擲:雙倍素材換品質下限 +1 階 */
export const ALLIN_COST_MULT = 2
/** 武器吞噬:每次吞噬給武器的成長,與上限 */
export const DEVOUR_GROWTH = 0.03
export const DEVOUR_MAX = 10
/** 精工銘刻:額外詞條機率;精工出低於菁英視為失敗,返還比例 */
export const INSCRIBE_AFFIX_CHANCE = 0.3
export const INSCRIBE_REFUND = 0.5
/** 活體神兵:每 N 次擊破 Boss 讓武器成長一階,與上限 */
export const LIVING_BOSS_PER_STEP = 3
export const LIVING_GROWTH = 0.07
export const LIVING_MAX_STEPS = 5

// ── 傭兵(v1.5 § 五)──
/**
 * 招牌行為的傷害折算(N 秒份 DPS)。占比 ≈ N / 間隔,全部壓在 ≤15% 護欄內:
 * 盜賊 1.2/10 = 12%、工兵 1.4/12 ≈ 11.7%、火術士 1.2/11 ≈ 11%、冰法師 0.5/14 ≈ 3.6%+引爆中性。
 */
export const MERC_ROGUE_SEC = 1.2
export const MERC_SAPPER_SEC = 1.4
export const MERC_SAPPER_DURATION = 4
/** 砲台開火間隔(GDD § 6.3「存在數秒依固定節奏攻擊」)。每 tick 一發會變成 10 次/秒 */
export const ZONE_FIRE_INTERVAL = 0.5
export const MERC_PYRO_SEC = 1.2
export const MERC_PYRO_BURN_SEC = 5
export const MERC_ICE_BONUS_SEC = 0.5
/** 冰法師凍結秒數與每場 Boss 觸發上限(v1.5 § 7.3 護欄) */
export const FREEZE_DURATION = 2
export const FREEZE_BOSS_CAP = 2
/**
 * Boss 戰開場時傭兵最慢多久出手。
 * ⚠️ 沒有這條的話,8~15 秒的間隔常常整場 Boss 都輪不到傭兵行動,
 * 「傭兵是 Boss 檢定的解法之一」就是空話(實測砲台流拆盾貢獻 0%)。
 */
export const MERC_BOSS_OPENING_SEC = 2
/** 行為間隔的隨機幅度 ±30% */
export const MERC_INTERVAL_JITTER = 0.3

// ── 行為型傳說(v1.5 § 11.1,全部 power-neutral:分帳不加量)──
/** 雙生影刃:疾風連刺期間,攻擊拆成本體/分身兩份(總量不變) */
export const TWIN_CLONE_SHARE = 0.3
/** 熔火軍旗:盾牆突擊插旗;軍旗存在期間攻擊分一份由軍旗打出(總量不變) */
export const BANNER_ZONE_SHARE = 0.15
/** 裁決餘燼:聖光審判 70% 立即、30% 轉為燃燒(短時間內燒完,Boss 30 秒檢定內必定結算完) */
export const EMBER_IMMEDIATE = 0.7
export const EMBER_BURN_DURATION = 4
/** F18 爆燃:燃燒疊到滿層發 burnMax 事件(純演出鉤子,不改傷害) */
export const BURN_MAX_STACKS = 5

// ── Boss 行為原型(v1.7:敵人不再是木樁)──
// ⚠️ 全部活在 Boss 30 秒沙盒內,不碰 farm 曲線。
// ⚠️ 掛機契約:每個原型純 DPS 都能硬過(約需 ×1.2),主動與對構築只是更容易。
/** 原型輪替:X10 拆盾 / X20 蓄力 / X30 圖騰(循環)。第一個 Boss 教最簡單的 */
/**
 * 破盾值系統(GDD v3 § 5.4)。底層用「點」,UI 換算成完整層數(不顯示小數)。
 * 每 SHIELD_VALUE_PER_LAYER 點破一層。
 * ⚠️ 每秒上限由模擬反推(`npm run sim:shield`),使一般配置落在上限的 50~60%
 * ——若上限就等於 4 次獨立命中,分身流會與燃燒流撞到同一道天花板,
 * 「分身讓拆盾更快」這個假設就永遠驗不出來。
 */
export const SHIELD_HIT_VALUE = 4 // 獨立命中(普攻/技能/分身/砲台/傭兵)
export const SHIELD_TICK_VALUE = 1 // 狀態週期 tick(燃燒等)
/**
 * 弱化衝擊(熔火軍旗的分帳打擊):2 點。
 * GDD § 5.4 只定義了「獨立命中 4 點」與「狀態 tick 1 點」,軍旗這種
 * 「傷害只有 15% 的回音式打擊」介於兩者之間——給滿 4 點會讓它 +33% 超出適性上限。
 */
export const SHIELD_ECHO_VALUE = 2
export const SHIELD_VALUE_PER_LAYER = 4
/**
 * 每秒破盾值上限。**由 `npm run sim:shield` 反推**,不硬編猜值。
 * 2026-07-30 實測:一般配置 4.6 點/秒 → 上限 8 使其落在 57%(規則要求 50~60%),
 * 留出讓分身/軍旗/燃燒真正受益的空間,同時封住高頻構築把盾直接抹平。
 */
export const SHIELD_VALUE_PER_SEC_CAP = 8
/** 拆盾:護盾層數(每層需 SHIELD_VALUE_PER_LAYER 點) */
export const SHELL_HITS = 10
export const SHELL_DR = 0.3
export const SHELL_BREAK_MULT = 1.3
export const SHELL_BREAK_SEC = 4
/** 蓄力:剩 20s / 10s 各一次,持續 4s;期間打出 maxHp × 比例即打斷 */
/**
 * 蓄力觸發點(以 Boss 倒數剩餘秒數表示)。⚠️ 2026-07-31 從 [20,10] 前移。
 * 舊值代表開戰後第 10 / 20 秒才起手,但實測前期 Boss 戰只有 6~9 秒就結束
 * → **蓄力機制第一次真正發動是第 80 層 / 6.3 分鐘**,在那之前玩家以為 Boss 只有一種。
 * 新值 = 開戰後第 4 / 15 秒,短戰也看得到。
 */
export const CHANNEL_TIMES = [26, 15]
export const CHANNEL_DURATION = 4
/**
 * 打斷門檻(佔 Boss maxHp 比例)。⚠️ 2026-07-31 從 0.06 上調。
 * 舊值算術上是**負機制稅**:剛好能通關的玩家(30 秒打完 maxHp)在 4 秒蓄力窗內
 * 自然打進 13.3%,是門檻 6% 的 **2.22 倍**——能贏的人必定 100% 打斷,
 * 於是蓄力型比同 HP 木樁**更好打**(打斷還送 6 秒 ×1.25 易傷)。
 * 新值 0.20 高於 13.3%,所以純被動輸出會失敗,必須真的留一手爆發——
 * 這正是聚光燈文案承諾的「留一手爆發,就是留給這種時候」。
 */
export const CHANNEL_HP_TO_BREAK = 0.2
/** 打斷成功:Boss 易傷;失敗:Boss 硬化(拖時間但不擋通關) */
export const INTERRUPT_VULN = 1.25
export const INTERRUPT_VULN_SEC = 6
export const CHANNEL_HARDEN_DR = 0.6
export const CHANNEL_HARDEN_SEC = 5
/** 圖騰:剩 24s 出第一根,之後每 10s;存活期間倒數加速;血量為 Boss 的比例 */
export const TOTEM_FIRST_AT = 24
export const TOTEM_INTERVAL = 10

// ── 敵情熟悉度 + 戰術修正(籃 C 第一階段,2026-07-30 裁決)──
/** 精通門檻:累積成功處理(破盾/打斷/毀圖騰)次數 */
export const LORE_MASTER_HANDLED = 5
/** 戰術「緩兵之計」:守關者的第一個手段延後秒數 */
export const TACTIC_DELAY_SEC = 5
/** 戰術「蓄勢而來」:本場第一次引爆後保留的印記層數 */
export const TACTIC_KEEP_SIGILS = 3

// ── 完美引爆窗口(籃 C 第二階段,2026-07-30 裁決:過載引爆的簡化版)──
/** 印記疊滿後的金色窗口秒數;窗口內手動引爆=完美 */
export const PERFECT_WINDOW_SEC = 4
/** 完美引爆獎勵:士氣(獎勵放操作感,不放傷害) */
export const PERFECT_MORALE = 15
/** 完美引爆獎勵:傭兵行動提早秒數 */
export const PERFECT_MERC_ADVANCE = 1

// ── 命運共鳴(顯示傾向,不推薦答案;來源公開)──
/** 共鳴累積:拆解 → 神匠 / 鍛造 → 神匠 / 限時事件 → 尋寶 / 留存事件 → 尋寶 / 連斬跨檔 → 戰術家 / 施放技能 → 戰術家 */
export const RESONANCE = {
  salvage: 2, // 神匠:每拆解一件
  forge: 3, // 神匠:每鍛造一次
  event: 3, // 尋寶:每擊破一次限時事件
  encounter: 2, // 尋寶:每處理一次留存事件
  combo: 2, // 戰術家:連斬每跨 10 層
  skill: 1, // 戰術家:每施放一次技能
} as const
/** 開場禮物:神匠共鳴=送一次鍛造的素材;尋寶=下一個事件立刻接近;戰術家=連斬起步層數 */
export const RESONANCE_GIFT_COMBO = 10

/**
 * 戰場遺骸「埋葬」給的共鳴次數。⚠️ 共鳴只決定「哪條命運與你共鳴」與一次性開場禮物,
 * 不進成長曲線(game-balance § 四),所以這裡給多一點也不會動到平衡。
 */
export const ENCOUNTER_BURY_RESONANCE = 4

/** 家族宿敵:本輪對同一層 Boss 失敗達此次數,退役時結為宿敵 */
export const NEMESIS_FAILURES = 3
export const TOTEM_HP_RATIO = 0.03
export const TOTEM_TIMER_MULT = 1.5

// ── 總攻 loop(v1.6:爽感預算花在技能與輪內成長,不動裝備的 power-neutral)──
/**
 * 引爆回轉(Reload 式):引爆印記時,依消耗層數推進**其他**技能的冷卻。
 * 這是把既有循環閉合成 loop 的那一塊:視窗擊殺 → 印記 → 引爆 → 冷卻回轉 → 更快開下一輪總攻。
 * 受 CD_FLOOR 護欄約束(實際冷卻不得低於基礎 30%)。
 */
export const RELOAD_PER_SIGIL = 0.4
/**
 * 戰意昂揚(Dark Ritual 式輪內疊乘):**滿層**引爆印記時,本輪傷害永久 +2%(乘算疊加)。
 * 轉生歸零——所以它製造「這輪再 loop 一下」的癮,而不會像舊勳章那樣跨輪失控。
 * 滿層才算:保留「現在引爆還是再疊」的決策,不會變成無腦速引。
 */
export const ZEAL_PER_FULL = 0.02
export const ZEAL_MAX_STACKS = 30
/**
 * 乘勝推進(破牆 spike):擊破 Boss 後短暫的清怪加速,把擊破做成節奏高點。
 * 只對非 Boss 目標生效——不影響下一場檢定,也不進 power-neutral 的裝備預算。
 */
export const CONQUEST_SEC = 12
export const CONQUEST_MULT = 1.5

// ── 二轉的既有技能進化(Lv.100 的第三層內容)──
/** 堅陣:視窗期間擊殺的印記倍數 */
export const EVOLVE_SIGIL_MULT = 2
/** 殘影:視窗期間的攻擊間隔倍率(傷害中性,只是切得更細) */
export const EVOLVE_INTERVAL = 0.75
/** 連判:立即傷害型技能施放後留下的印記數 */
export const EVOLVE_EDICT_SIGILS = 3

// ── 傳說裝(裝備第三層)──
/**
 * 精工鍛造出傳奇以上、且部位與基底對得上某件傳說時,附帶傳說特性的機率。
 * 傳奇保底(PITY_LEGENDARY)觸發時必定附帶,否則保底只給品質、給不到玩法。
 */
export const LEGEND_CHANCE = 0.4
/**
 * 不退之壁的常駐溢價。⚠️ 定案為 1(無溢價):乾淨的牆上量測證明視窗平均本身就是
 * 輸出中性的;先前的 −18.9% 是擊殺回饋雜訊,靠它校出來的 1.12 反而超標 +11%。
 * 留著這個常數是因為測試引用它;若未來要補「失去挑時機的自由」的體感補償,從這裡調。
 */
export const WALL_PERMANENT_BONUS = 1
/** 倒轉沙漏:施放幾個不同技能觸發、推進冷卻的比例、觸發後鎖多久(護欄:防自我循環) */
export const HOURGLASS_DISTINCT = 3
export const HOURGLASS_PROGRESS = 0.15
export const HOURGLASS_LOCK = 30
/** 追風者之靴:每次暴擊推進第二技能幾秒、每秒觸發次數上限(護欄) */
export const WINDBOOTS_CD_SEC = 0.25
export const WINDBOOTS_PER_SEC = 2
/** 法典殘頁:引爆後保留的印記比例、每枚威力倍率 */
export const CODEX_KEEP = 1 / 3
export const CODEX_POWER = 0.95
/**
 * 失落軍旗:儲存的爆發只留原本的幾成。
 * 儲存起來的爆發會在施放技能時釋放,而技能常常伴隨增益視窗 → 同樣的秒數打出更多傷害。
 * 這個係數把「挑時機」賺到的部分收回去,讓它回到 power-neutral(實測未收前 +11.9%)。
 */
export const BANNER_STORE = 0.7
/** 貪婪之眼:遺物弱點的持續秒數與傷害倍率(Boss 30 秒檢定內約 +5%) */
export const RELIC_WINDOW = 3
export const RELIC_MULT = 1.5

// ── 套裝標籤(裝備第四層)──
/** 精工鍛造投入部位素材 + 菁英素材時,附加套裝標籤的機率 */
export const SET_TAG_CHANCE = 0.3
/** 帝國鐵壁 2 件:軍陣期間的攻擊間隔倍率(傷害中性,只是切得更細) */
export const IRONWALL_INTERVAL = 0.75
/** 帝國鐵壁 3 件:軍陣結束時自動引爆印記,威力為手動引爆的幾成 */
export const IRONWALL_AUTO_POWER = 0.1
/** 戰術指揮官 3 件:指揮形態的威力倍率與冷卻代價(拿冷卻換威力,不是白送) */
export const COMMANDER_POWER = 1.6
export const COMMANDER_CD = 1.15
/** 完成一道指令需要幾個不同技能 */
export const COMMANDER_DISTINCT = 3

/** 列傳保留幾代 */
export const CHRONICLE_MAX = 30

// 命運樹
/** 本輪達到這些層數各給一枚命運點(用當輪層數,不是歷史最高) */
export const DESTINY_MILESTONES = [30, 60, 90]
/**
 * 大抉擇與上一個命運節拍之間至少隔多久。
 * ⚠️ 實測:種子 0.45 分、第 30 層大抉擇 1.31 分——全遊戲最重的決策
 * 在最輕的隨機事件後 50 秒就到,玩家還沒消化「這輪我是殘影」。
 * 樓層閘管「你走得夠遠」,這道時間閘管「上一拍有時間沉澱」,
 * 與操練令的 TRAINING_MIN_GAP_SEC 同一套二維做法。
 */
export const DESTINY_BEAT_GAP_SEC = 150
/** 未使用命運點上限。滿了就停發,但不阻止推進(掛機玩家回來不用連點十次) */
export const DESTINY_POINT_CAP = 2

// ── 命運降臨(2026-07-31)──
/**
 * 兩次降臨之間的最小間隔(秒)。
 * ⚠️ 這個值被**現行推進速度**綁死:實測前 150 層只要 4.8 分鐘,
 * 所以企劃希望的「2~4 分鐘一次」在目前速度下整輪只會觸發兩次。
 * 40 秒在前 150 層約給 7 次,是現況下可行的折衷。
 * **恢復到 2~4 分鐘的前提是先修整體推進速度**(見 game-balance § 七的漂移紀錄)。
 */
export const DESTINY_DESCENT_GAP_SEC = 40
/** 種子(第一次降臨)固定在這一層,不受時間閘門限制——玩家必須早點拿到它 */
export const DESTINY_SEED_FLOOR = 10
/** 前幾次降臨強制同流派,讓流派先成形(壞手保護) */
export const DESTINY_SAME_BUCKET_FIRST = 2
/** 桶權重:同流派 / 跨流派 / 其餘為意外 */
export const DESTINY_BUCKET_SAME = 0.5
export const DESTINY_BUCKET_CROSS = 0.3
/** 每輪最多幾次「完全意外」,超過退回跨流派 */
export const DESTINY_WILD_PER_RUN = 2

// ── 殘影(命運種子「殘留之影」的斥候詮釋:鏡影刺客)──
/** 每幾次普攻生成一個殘影。玩家要能「數」得出來,所以用次數不用秒數 */
export const AFTERIMAGE_EVERY = 5
/** 殘影重演接下來幾次普攻 */
export const AFTERIMAGE_REPLAYS = 2
/**
 * 殘影傷害佔原攻擊的比例。
 * ⚠️ 算式:穩定狀態每 AFTERIMAGE_EVERY 次普攻中有 AFTERIMAGE_REPLAYS 次帶殘影,
 * 淨增傷 = (2/5) × 0.4 = **16%**,落在企劃要求的 15~20%。
 * 企劃原本寫 20%,那只有 8% —— 節奏(5 次生成、重演 2 次)是操作感核心不能動,
 * 所以調的是這個比例。
 */
export const AFTERIMAGE_DAMAGE_SHARE = 0.4
/**
 * 殘影的機制累積效率(相對本體)。破盾直接用既有的 SHIELD_ECHO_VALUE(4 的一半),
 * 印記則是每 AFTERIMAGE_SIGIL_PER 次殘影攻擊給一枚。
 * 限制效率是為了避免「同時複製所有機制」造成失控。
 */
export const AFTERIMAGE_SIGIL_PER = 2
/** 同步步伐:殘影每次攻擊都累積破綻(效率 1/1),代價是直接傷害打折 */
export const AFTERIMAGE_SYNC_SIGIL_PER = 1
export const AFTERIMAGE_SYNC_DAMAGE_MULT = 0.75
/**
 * ── 同一顆種子的三種職業詮釋 ──
 * ⚠️ 三者改的是**觸發條件與重演對象**,不是傷害數字。
 * 只換名稱或加百分比 = 職業仍然直接鎖死玩法,那正是這張卡要解決的問題。
 *
 * 重裝步兵「守護殘像」:技能視窗期間殘影不消耗重演次數(每一擊都被重演)。
 * 決策從「數普攻次數」變成「什麼時候開視窗、怎麼延長它」——buffDur 詞綴因此有價值。
 * 視窗佔比約 duration/cd ≈ 13%,額外淨增傷約 +3%,但視窗內體感明顯。
 */
export const AFTERIMAGE_GUARD_IN_WINDOW = true
/**
 * 隨軍法警「法術餘響」:殘影不重演普攻,改為施放技能時追加一次餘響。
 * 傷害**從該技能分帳**(不加量),並推進其他技能的冷卻 → 技能順序成為主要決策。
 * ⚠️ 冷卻推進走既有的 cooldownAdvance,受 CD_FLOOR(30%)護欄保護。
 */
export const AFTERIMAGE_ECHO_SHARE = 0.25
export const AFTERIMAGE_ECHO_CD_SEC = 0.5

/**
 * ── 第 30 層命運抉擇:殘影的三種形態 ──
 *
 * ⚠️ 2026-07-31 體驗審查抓到:這三個節點在 core 與 render **零引用**,
 * 選哪個結果完全一樣——而它會硬暫停整個遊戲。全遊戲唯一的真決策原本是假的。
 *
 * 三者刻意**不比大小**:前兩者淨增傷與基準幾乎相同(16.0% / 16.7% / 16.9%),
 * 差別在「每次命中的密度」與「重演窗口的長度」;誘敵之影則明確用傷害換資源
 * (淨增傷腰斬到 8%,但破綻效率翻倍、破盾從弱化的 2 點升到獨立命中的 4 點)。
 * 能用計算機分高下的就不是決策——所以只有誘敵之影可以比,而它比的是「換什麼」。
 */
export interface AfterimageShape {
  /** 每幾次普攻生成 */
  every: number
  /** 生成後重演幾次 */
  replays: number
  /** 每次重演的傷害佔比 */
  share: number
  /** 每幾次殘影攻擊給一枚破綻 */
  sigilPer: number
  /** 殘影的破盾值。基準用弱化的 SHIELD_ECHO_VALUE,誘敵之影升為獨立命中 */
  shieldValue: number
  /** 殘影攻擊時推進其他技能冷卻的秒數(0 = 不推進) */
  cdAdvance: number
}

export const AFTERIMAGE_BASE_SHAPE: AfterimageShape = {
  every: AFTERIMAGE_EVERY,
  replays: AFTERIMAGE_REPLAYS,
  share: AFTERIMAGE_DAMAGE_SHARE,
  sigilPer: AFTERIMAGE_SIGIL_PER,
  shieldValue: SHIELD_ECHO_VALUE,
  cdAdvance: 0,
}

/**
 * 群影:影子多而弱。每次普攻帶殘影的比例從 0.40 升到 0.67(+67% 獨立命中)
 * → 拆盾與「每次命中」類效果變快,代價是每一道影子的傷害只剩基準的 6 成。
 * ⚠️ every 變小**不等於**命中變多,決定命中密度的是 replays/every——
 * 初版寫 every:3 / replays:1 得到 0.33,比基準還少,與身分相反(實測抓到)。
 */
export const AFTERIMAGE_SHAPE_SWARM: AfterimageShape = {
  every: 3,
  replays: 2,
  share: 0.24,
  sigilPer: 2,
  shieldValue: SHIELD_ECHO_VALUE,
  cdAdvance: 0,
}

/** 鏡像:影子少而長,且會推進其他技能冷卻 → 施放順序成為主要決策 */
export const AFTERIMAGE_SHAPE_MIRROR: AfterimageShape = {
  every: 8,
  replays: 3,
  share: 0.43,
  sigilPer: 2,
  shieldValue: SHIELD_ECHO_VALUE,
  cdAdvance: 0.3,
}

/**
 * 多久沒推進樓層就算「這一輪到頂了」。撞牆後每 10 層要 20~30 分鐘,
 * 單層卡住 3 分鐘已經明顯不是暫時的。⚠️ 還要同時有勳章可拿才提示,
 * 否則首輪前段被 Boss 卡住的新手會被叫去退役,那是反效果。
 */
export const RUN_STALL_SEC = 180

// ── 命運池補充節點(2026-07-31,審查抓到池子只有 2 個)──
/** 餘燼之影:殘影每次重演點燃敵人,燃燒量 = 該次殘影傷害的幾倍、持續幾秒 */
export const SHADE_EMBER_MULT = 0.6
export const SHADE_EMBER_SEC = 3
/** 獵隙者:完美引爆金色窗口的倍率 */
export const SIGIL_HUNTER_WINDOW_MULT = 2
/** 回響裝填:完美引爆時額外推進所有冷卻中技能幾秒 */
export const SIGIL_RELOAD_SEC = 2
/** 背水一戰:守關倒數剩幾秒內、傷害乘多少 */
export const LASTDITCH_SEC = 8
export const LASTDITCH_MULT = 1.35

/** 誘敵之影:放棄正面輸出換破綻。破綻效率翻倍、破盾升為獨立命中 4 點 */
export const AFTERIMAGE_SHAPE_LURE: AfterimageShape = {
  every: 5,
  replays: 2,
  share: 0.2,
  sigilPer: 1,
  shieldValue: SHIELD_HIT_VALUE,
  cdAdvance: 0,
}
