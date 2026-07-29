import * as B from './balance'
import type { DestinyNodeId, DestinyPathId, GameState } from './types'

/**
 * 命運樹(Destiny Tree)——取代舊的四維天賦。
 *
 * 設計要點(來自 2026-07-29 企劃決策):
 * - 節點是「機制」不是「數值」,機制之間沒有共同尺度,才不會又出現唯一解
 * - 每輪重選,轉生不保留節點;跨輪的東西留給之後的傳承圖鑑
 * - 首版三條路徑,其中戰術家只做輕量對照組,用來檢驗玩家是否真的依玩法偏好選擇,
 *   而不是一律選收益最高的經濟流
 * - **首版節點效果差距控制在 15~25%**,超過就會被換算成唯一最佳解
 */

export interface DestinyNode {
  id: DestinyNodeId
  path: DestinyPathId
  name: string
  desc: string
  /** 0 = 選擇路徑時自動獲得的起始能力 */
  tier: number
}

export interface DestinyPath {
  id: DestinyPathId
  name: string
  tagline: string
  /** 這一輪玩起來的樣子,選擇畫面用 */
  fantasy: string
  start: DestinyNodeId
  /** 每個決策點的選項。多數是二選一,終局也可能只有一個 */
  choices: DestinyNodeId[][]
}

const N = (
  id: DestinyNodeId,
  path: DestinyPathId,
  tier: number,
  name: string,
  desc: string,
): DestinyNode => ({ id, path, tier, name, desc })

export const DESTINY_NODES: Record<DestinyNodeId, DestinyNode> = Object.fromEntries(
  [
    // ── 神匠:打造流。核心問題是「現在打造,還是繼續累積條件?」
    N('artisan_start', 'artisan', 0, '鐵匠學徒', '每次沒使用打造機會就累積一層「爐火」,下次打造提高高品質機率,打造後清空'),
    N('artisan_1a', 'artisan', 1, '餘火回收', '打造出低於身上裝備品質的物品時,返還部分素材'),
    N('artisan_1b', 'artisan', 1, '孤注一擲', '可消耗雙倍素材,把本次打造的最低品質提高一階'),
    N('artisan_2a', 'artisan', 2, '武器吞噬', '武器可吞噬新打造的武器,獲得部分屬性成長'),
    N('artisan_2b', 'artisan', 2, '精工銘刻', '精工成功時有機會產生特殊詞條;失敗不再完全損失素材'),
    N('artisan_3a', 'artisan', 3, '傳家之器', '本輪最高階裝備登錄傳承圖鑑,未來輪迴有機率以殘缺版本出現'),
    N('artisan_3b', 'artisan', 3, '活體神兵', '武器隨擊敗 Boss 次數進化,外觀與效果同步改變'),

    // ── 尋寶獵人:事件流。把事件從隨機插曲變成可期待、可操作的內容
    N('hunter_start', 'hunter', 0, '不祥預感', '特殊事件出現前幾層顯示模糊預告:危險 / 財富 / 商人 / 未知'),
    N('hunter_1a', 'hunter', 1, '追跡者', '事件倒數期間擊殺越快,事件獎勵越高'),
    N('hunter_1b', 'hunter', 1, '耐心獵人', '事件出現時間變慢,但成功後獎勵品質提高'),
    N('hunter_2a', 'hunter', 2, '誘餌箱', '寶箱怪失敗時不再完全消失,會留下較低階獎勵'),
    N('hunter_2b', 'hunter', 2, '命運交易', '事件成功後可放棄原獎勵,換取一個未知命運節點'),
    N('hunter_3a', 'hunter', 3, '黃金路線', '每完成三次不同種類的事件,開啟一次保證高價值事件'),
    N('hunter_3b', 'hunter', 3, '禁忌地圖', '本輪解鎖隱藏區段,內含特殊 Boss 與流派限定掉落'),

    // ── 戰術家:純戰鬥對照組,刻意只做三個節點
    N('tactician_start', 'tactician', 0, '乘勝追擊', '連續快速擊殺累積連斬層數提高輸出,卡關時逐步消失'),
    N('tactician_1a', 'tactician', 1, '破陣', '連斬層數在 Boss 戰中保留,Boss 戰結束後清空'),
    N('tactician_1b', 'tactician', 1, '蓄勢', '主動停止推進時累積蓄勢,重新開始後短時間爆發'),
    N('tactician_2a', 'tactician', 2, '越戰越勇', '首次挑戰 Boss 失敗後,下次挑戰獲得可疊加的戰術加成(有上限)'),
  ].map((n) => [n.id, n]),
)

export const DESTINY_PATHS: Record<DestinyPathId, DestinyPath> = {
  artisan: {
    id: 'artisan',
    name: '神匠',
    tagline: '打造流',
    fantasy: '整輪都在等下一次開錘',
    start: 'artisan_start',
    choices: [
      ['artisan_1a', 'artisan_1b'],
      ['artisan_2a', 'artisan_2b'],
      ['artisan_3a', 'artisan_3b'],
    ],
  },
  hunter: {
    id: 'hunter',
    name: '尋寶獵人',
    tagline: '事件流',
    fantasy: '整輪都在期待下一個事件',
    start: 'hunter_start',
    choices: [
      ['hunter_1a', 'hunter_1b'],
      ['hunter_2a', 'hunter_2b'],
      ['hunter_3a', 'hunter_3b'],
    ],
  },
  tactician: {
    id: 'tactician',
    name: '戰術家',
    tagline: '連斬流(輕量對照)',
    fantasy: '不停手,越打越順',
    start: 'tactician_start',
    choices: [['tactician_1a', 'tactician_1b'], ['tactician_2a']],
  },
}

export const ALL_PATHS = Object.values(DESTINY_PATHS)

/** 已解鎖某節點 */
export function hasNode(s: GameState, id: DestinyNodeId): boolean {
  return s.destinyNodes.includes(id)
}

/** 下一個決策點的選項;沒得選時回 null */
export function pendingChoice(s: GameState): DestinyNode[] | null {
  if (!s.destinyPath || s.destinyPoints <= 0) return null
  const path = DESTINY_PATHS[s.destinyPath]
  const tier = s.destinyNodes.filter((id) => DESTINY_NODES[id]?.tier > 0).length
  const ids = path.choices[tier]
  if (!ids) return null
  return ids.map((id) => DESTINY_NODES[id])
}

/** 本輪還會再給幾枚命運點 */
export function milestonesLeft(s: GameState): number {
  return Math.max(0, B.DESTINY_MILESTONES.length - s.destinyEarned)
}

/** 下一個里程碑層數;都拿完回 null */
export function nextMilestone(s: GameState): number | null {
  return B.DESTINY_MILESTONES[s.destinyEarned] ?? null
}
