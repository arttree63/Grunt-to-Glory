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

// 轉生
export const MEDAL_PER_FLOORS = 10 // 每 10 層 1 枚勳章
export const MEDAL_DMG = 0.05 // 每枚 +5% 全局傷害
export const MEDAL_START_GOLD = 1000 // 每枚開局資金

// 新兵祝福:首輪限定金幣加成。設 0 = 停用。
// 模擬結論:給了首輪會虛高、轉生後淨變弱(第二輪極限反而下降)→ 停用,首輪節奏改由新手斜坡負責。
export const ROOKIE_BLESSING_GOLD = 0

// 鍛造與素材
export const MATERIAL_PER_MOB = 1
export const FORGE_COST = 10 // 普通鍛造消耗怪物素材

// 離線收益
export const OFFLINE_RATE = 0.6 // 6 折
export const OFFLINE_CAP_HOURS = 4

// 戰鬥
export const TICK_HZ = 10 // 邏輯固定 tick
export const CRIT_RATE = 0.18
export const CRIT_MULT = 3
