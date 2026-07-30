import type { MechanicTag, MercId } from './types'

/**
 * 傭兵(v1.5 § 五):**低頻率、高辨識度的戰鬥事件來源**。
 * 不做高頻普攻——「待機 + 招牌行為」:每 8~15 秒發動一次,短暫成為畫面焦點後退回。
 *
 * 護欄(v1.5 § 5.2,數字化):
 *   - 傭兵總傷害占比 ≤ 15%:每次行為折算 N 秒份 DPS,N / 間隔 ≈ 占比,常數見 balance.ts
 *   - 同時攜帶 1 隻;傭兵不得生成新傭兵(禁止 SpawnAlly 循環)
 *   - 計入流派差距模擬(npm run sim 的代理玩家帶預設傭兵)
 *
 * 取得:爬塔里程碑解鎖(歷代最高層,跨轉生),GDD 原設計。
 * 這是待裁決 #2 的 sensible default——沒綁命運/二轉,不會有人因選錯而拿不到。
 */
export interface Merc {
  id: MercId
  name: string
  /** 行為類型(對應 v1.5 四原型 + 老獵犬) */
  archetype: '位移' | '控制' | '場地' | '狀態' | '巡守'
  /** 招牌行為的一句描述(玩家要能說出「剛剛牠做了什麼」) */
  signature: string
  /** 解鎖條件:歷代最高層 */
  unlockFloor: number
  /** 招牌行為間隔(秒,實際會 ±30% 隨機) */
  interval: number
  tags: MechanicTag[]
}

export const MERCS: Record<MercId, Merc> = {
  hound: {
    id: 'hound',
    name: '老獵犬',
    archetype: '巡守',
    signature: '定期叼回一份怪物素材',
    unlockFloor: 1,
    interval: 14,
    tags: ['relic'],
  },
  rogue: {
    id: 'rogue',
    name: '盜賊',
    archetype: '位移',
    signature: '消失、繞到敵人背後補上一刀,留下一道破綻(化為印記)',
    unlockFloor: 30,
    interval: 10,
    tags: ['displace', 'mark'],
  },
  icemage: {
    id: 'icemage',
    name: '冰法師',
    archetype: '控制',
    signature: '凍結戰場數秒——期間傷害累積不結算,解凍時一次引爆',
    unlockFloor: 60,
    interval: 14,
    tags: ['status', 'delay'],
  },
  sapper: {
    id: 'sapper',
    name: '工兵',
    archetype: '場地',
    signature: '架起砲台,存在期間依固定節奏開火',
    unlockFloor: 90,
    interval: 12,
    tags: ['zone'],
  },
  pyro: {
    id: 'pyro',
    name: '火術士',
    archetype: '狀態',
    signature: '點燃敵人,燃燒持續造成傷害',
    unlockFloor: 120,
    interval: 11,
    tags: ['status'],
  },
}

export const ALL_MERCS = Object.values(MERCS)

/** 依歷代最高層數,目前已解鎖哪些傭兵 */
export function unlockedMercs(bestFloorEver: number): MercId[] {
  return ALL_MERCS.filter((m) => bestFloorEver >= m.unlockFloor).map((m) => m.id)
}
