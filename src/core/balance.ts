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
export const DMG_PER_LV = 1.072 // 每級傷害倍率(含配點期望值)

// 基準值
export const BASE_MOB_HP = 10
export const BASE_GOLD = 5
export const BASE_UP_COST = 20
export const BASE_DPS = 5

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
