import type { EncounterId } from './types'

export interface EncounterChoice {
  id: string
  label: string
  desc: string
}

export interface Encounter {
  id: EncounterId
  name: string
  text: string
  choices: [EncounterChoice, EncounterChoice]
}

/**
 * 留存事件。與限時事件(寶箱怪/黃金哥布林)的分工:
 * - 限時事件:主動玩家收益高、錯過不阻塞、**不承載必要的流派解鎖**
 * - 留存事件:保留在旅途紀錄等玩家回來處理,**命運相關的分支只能放這裡**,
 *   否則掛機玩家會被天然懲罰
 */
export const ENCOUNTERS: Record<EncounterId, Encounter> = {
  blacksmith: {
    id: 'blacksmith',
    name: '神秘鐵匠',
    text: '路邊的老鐵匠爐火將熄,他抬頭看你一眼:「小子,借點錢?」',
    choices: [
      { id: 'help', label: '幫他', desc: '付出金幣,換得一塊菁英素材' },
      { id: 'refuse', label: '走開', desc: '省下麻煩,撿走他掉的零錢' },
    ],
  },
  merchant: {
    id: 'merchant',
    name: '旅行商人',
    text: '一輛吱嘎作響的板車擋在路中央,布簾後傳來聲音:「要看看貨嗎?」',
    choices: [
      { id: 'buy', label: '買素材', desc: '用金幣換一批怪物素材' },
      { id: 'sell', label: '賣素材', desc: '把素材換成金幣' },
    ],
  },
  crossroad: {
    id: 'crossroad',
    name: '岔路',
    text: '小徑在這裡分成兩條。左邊傳來鐵器的氣味,右邊隱約有金幣的聲響。',
    choices: [
      { id: 'left', label: '走左邊', desc: '接下來一段路素材加倍' },
      { id: 'right', label: '走右邊', desc: '接下來一段路金幣加倍' },
    ],
  },
  remains: {
    id: 'remains',
    name: '戰場遺骸',
    text: '一小隊人倒在這裡很久了。裝備還能用,他們的家人大概還在等消息。',
    choices: [
      { id: 'loot', label: '搜刮', desc: '拿走還能用的東西:一批怪物素材' },
      { id: 'bury', label: '埋葬他們', desc: '耽誤一點時間,但這條路記得你(命運共鳴大幅累積)' },
    ],
  },
  veteran: {
    id: 'veteran',
    name: '老兵的忠告',
    text: '一個獨眼老兵蹲在火堆旁:「前面那東西我見過。要聽嗎?聽完別說我沒警告你。」',
    choices: [
      { id: 'listen', label: '聽他說', desc: '下一種守關者的敵情熟悉度 +1(戰前預告更精確)' },
      { id: 'rations', label: '要他的乾糧', desc: '省下時間,換一批怪物素材' },
    ],
  },
  supply: {
    id: 'supply',
    name: '廢棄補給箱',
    text: '箱子鎖著,鎖已經鏽穿了。撬開可能是滿的,也可能早被人搬空。',
    choices: [
      { id: 'pry', label: '撬開', desc: '一半機率大批素材,一半機率只有一點' },
      { id: 'carry', label: '整箱扛走', desc: '不冒險,拿確定的中等份量' },
    ],
  },
  wounded: {
    id: 'wounded',
    name: '傷兵',
    text: '一個小兵靠在樹下,傷口還在滲血。他看見你,想撐起身子敬禮。',
    choices: [
      { id: 'heal', label: '替他包紮', desc: '他把最後的膽識留給你:下一場守關者戰傷害提升' },
      { id: 'take', label: '拿走他的補給', desc: '他用不到了:一批怪物素材' },
    ],
  },
}

export const ENCOUNTER_ORDER: EncounterId[] = [
  'blacksmith',
  'merchant',
  'crossroad',
  'remains',
  'veteran',
  'supply',
  'wounded',
]
