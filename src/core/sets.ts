import type { MechanicTag, SetTagId } from './types'

/**
 * 套裝:**標籤制,不是稀有度階級**。任何品質的裝備都可能帶一個套裝標籤,
 * 穿滿同標籤就啟動,不綁定部位(玩家不會被部位鎖死)。
 *
 * 三件式而非傳統六件:裝備只有 5 格,3 件才留得下其他格位裝單件傳說。
 * 套裝提供「機制拼圖」,**不提供純倍率**——直接給數倍傷害會讓沒套裝等於不能玩,
 * 單件傳說失去價值,流派差距也會爆表。
 *
 * ⚠️ 原案「帝國鐵壁 3 件:週期性複製最近一次非盾類技能」未採用:
 * 職業只有 1~2 個技能可複製,且在單目標模型下複製只等於多一份傷害,做了沒有辨識度。
 * 改為同樣走軍陣 / 儲存、但能落地的自動引爆。
 */
export interface EquipmentSet {
  id: SetTagId
  name: string
  /** 2 件效果 */
  two: string
  /** 3 件效果(質變) */
  three: string
  tags: MechanicTag[]
  /** 這套想成立什麼流派 */
  builds: string
}

export const SETS: Record<SetTagId, EquipmentSet> = {
  ironwall: {
    id: 'ironwall',
    name: '帝國鐵壁',
    two: '持續型技能施放時同時展開軍陣,軍陣期間攻擊間隔縮短',
    three: '軍陣結束時,把視窗內累積的印記自動引爆一次',
    tags: ['formation', 'store'],
    builds: '陣地流 / 印記流',
  },
  commander: {
    id: 'commander',
    name: '戰術指揮官',
    two: '記錄施放順序,顯示下一道戰術指令還差幾個不同技能',
    three: '完成指令後,下一個技能轉化為指揮形態:威力提高,但該次冷卻延長',
    tags: ['sequence', 'transform'],
    builds: '循環流 / 指令流',
  },
}

export const ALL_SETS = Object.values(SETS)
