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

// 轉生可指定帶走的傳家寶件數(基準;「家族傳承」科技每級 +1,最多全身 5 件)
export const HEIRLOOM_SLOTS = 1

// 離線收益
export const OFFLINE_RATE = 0.6 // 6 折
export const OFFLINE_CAP_HOURS = 4

// 戰鬥
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
/** 傳家之器:下一輪開局取得殘缺版的機率(品質降一階) */
export const HEIRLOOM_CODEX_CHANCE = 0.5

/** 列傳保留幾代 */
export const CHRONICLE_MAX = 30

// 命運樹
/** 本輪達到這些層數各給一枚命運點(用當輪層數,不是歷史最高) */
export const DESTINY_MILESTONES = [20, 50, 90]
/** 未使用命運點上限。滿了就停發,但不阻止推進(掛機玩家回來不用連點十次) */
export const DESTINY_POINT_CAP = 2
