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
export const BASE_MOB_HP = 10
export const BASE_GOLD = 5
export const BASE_UP_COST = 20
export const BASE_DPS = 3.68 // 乘上基礎暴擊期望 ×1.36 後 ≈ 5,與舊模擬同起點

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
 * 點擊直接造成的傷害,折算成幾秒份 DPS。
 * ⚠️ 玩家要的是「點了有打到」,所以點擊必須自己出一次手、自己扣一次血,
 * 而不是只餵戰意等爆發。但它同時是個常數乘區,必然被 1.16^層 貶值,
 * 所以數字不能大到讓「不點就過不了」——調校目標是積極玩家比掛機領先兩成上下。
 */
export const CLICK_DMG_SEC = 0.3
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
/** 每枚印記在消耗時折算成幾秒份的 DPS */
export const SIGIL_BURST_SEC = 3
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
// 精工保底:累計 N 次未出傳奇 → 必出傳奇以上(跨轉生保留)
export const PITY_LEGENDARY = 50

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
export const MERC_PYRO_SEC = 1.2
export const MERC_PYRO_BURN_SEC = 5
export const MERC_ICE_BONUS_SEC = 0.5
/** 冰法師凍結秒數與每場 Boss 觸發上限(v1.5 § 7.3 護欄) */
export const FREEZE_DURATION = 2
export const FREEZE_BOSS_CAP = 2
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
export const DESTINY_MILESTONES = [20, 50, 90]
/** 未使用命運點上限。滿了就停發,但不阻止推進(掛機玩家回來不用連點十次) */
export const DESTINY_POINT_CAP = 2
