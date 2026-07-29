import type { MechanicTag } from './types'

/**
 * 機制關鍵字表(裝備規範 § 三)——技能、命運節點、裝備特效、套裝效果、共鳴條件的共同語言。
 * ⚠️ 只能用這 13 個關鍵字,不可自由造字:每件裝備各寫各的規則就無法平衡、無法判定共鳴、
 * 也寫不出程式邏輯。UI 的篩選與圖示同樣綁這份值域。
 */
export const KEYWORD_NAME: Record<MechanicTag, string> = {
  repeat: '重複',
  delay: '延遲',
  mark: '標記',
  afterimage: '殘影',
  copy: '複製',
  store: '儲存',
  transform: '轉化',
  chain: '連鎖',
  spread: '擴散',
  cooldown_complete: '冷卻完成',
  sequence: '順序',
  relic: '遺物',
  formation: '軍陣',
  clone: '分身',
  status: '狀態',
  zone: '區域',
  displace: '位移',
}

export const KEYWORD_DEF: Record<MechanicTag, string> = {
  repeat: '同一效果再次執行一次',
  delay: '效果分割為數段,於後續時點結算',
  mark: '附加於敵人的可消耗狀態',
  afterimage: '重演過去某次行動的較弱版本',
  copy: '取得另一效果的部分內容',
  store: '將效果保留至觸發條件達成',
  transform: '改變效果的類型或形態',
  chain: '依序波及多個目標',
  spread: '由單點向範圍傳播',
  cooldown_complete: '直接推進或完成冷卻',
  sequence: '依施放次序記錄並判定',
  relic: '戰鬥中可取得的臨時道具',
  formation: '場上的區域性持續效果',
  clone: '生成我方實體,替你行動',
  status: '敵人持續處於可見狀態,可疊層、引爆、轉移',
  zone: '留在戰場上的物件(軍旗、砲台、法陣)',
  displace: '繞後、突進、返回等移動(僅表現)',
}

/**
 * 為什麼某個關鍵字現在不能用。⚠️ 三種情況不一樣,不要混講成「引擎做不到」:
 *
 *   needs_multitarget —— 真的缺引擎。core 只有一個 enemyHp,擊殺是序列處理
 *                        (畫面上的多隻怪是 BattleScene 自己生的,與 core 無關)。
 *                        要做得先引入多目標模型,會牽動已驗證的 HP/金幣曲線。
 *   no_distinct_feel  —— 技術上做得出來,但做了跟現有的爆發/印記引爆分不出來。
 *                        單目標 +「傷害 = DPS × 累積時間」下,再執行一次 / 複製 / 重演
 *                        都只等於多一份傷害,吃掉 power-neutral 的預算卻換不到體感。
 *                        缺的是可辨識的載體(位置、目標、看得見的動作實體)。
 *   boss_conflict     —— 技術上最簡單(排時間佇列),但 Boss 是 30 秒限時檢定,
 *                        延遲傷害會讓過關與否兩極化。無法立即結算者首版不做。
 */
export type KeywordStatus =
  | 'ok'
  | 'needs_multitarget'
  | 'no_distinct_feel'
  | 'boss_conflict'
  /**
   * 純表現:現行引擎沒有座標系統,MoveEntity 只是演出層動畫。
   * ⚠️ 不可作為共鳴或任何邏輯判定的條件——那會讓共鳴依賴一個邏輯上不存在的東西。
   */
  | 'presentation_only'

export const KEYWORD_STATUS: Record<MechanicTag, KeywordStatus> = {
  repeat: 'no_distinct_feel',
  delay: 'boss_conflict',
  mark: 'ok',
  afterimage: 'no_distinct_feel',
  copy: 'no_distinct_feel',
  store: 'ok',
  transform: 'ok',
  chain: 'needs_multitarget',
  spread: 'needs_multitarget',
  cooldown_complete: 'ok',
  sequence: 'ok',
  relic: 'ok',
  formation: 'ok',
  clone: 'ok', // 雙生影刃(v1.5):我方短時實體,本體/分身分帳
  status: 'ok', // 裁決餘燼(v1.5):燃燒疊層與引爆
  zone: 'ok', // 熔火軍旗(v1.5):場地物件,存在期間週期行為
  displace: 'presentation_only',
}

export function keywordSupported(tag: MechanicTag): boolean {
  return KEYWORD_STATUS[tag] === 'ok'
}

/** 可以掛在共鳴/邏輯判定上的關鍵字(排除純表現的 displace) */
export function keywordLogical(tag: MechanicTag): boolean {
  return KEYWORD_STATUS[tag] !== 'presentation_only'
}
