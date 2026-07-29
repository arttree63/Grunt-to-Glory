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
}

export const ENCOUNTER_ORDER: EncounterId[] = ['blacksmith', 'merchant', 'crossroad']
