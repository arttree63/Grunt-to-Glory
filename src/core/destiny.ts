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

/**
 * 節點的取得方式。
 * - `seed`：命運種子。第一次降臨給的,只描述**共同核心概念**,不寫完整功能——
 *   寫太滿等於系統偷偷替玩家選了職業
 * - `descend`：命運降臨。系統給,不需玩家當場決定
 * - `choice`：命運抉擇。玩家三選一,是流派真正分岔的地方
 */
export type DestinyKind = 'seed' | 'descend' | 'choice'

/** 抽取時的權重桶:同流派 / 跨流派 / 完全意外 */
export type DestinyBucket = 'same' | 'cross' | 'wild'

/**
 * 進池的先決條件。
 * ⚠️ 一律用「引擎查得到的狀態」表達,不可寫成自由字串或 lambda——
 * 否則「為什麼沒抽到這個」寫不出說明,圖鑑也分不了類。
 * 第一階段只實作這四種;`{k:'tag'}`(需要有燃燒/分身來源)要先幫 SKILLS 補 tags,是獨立前置工作。
 */
export type DestinyReq =
  | { k: 'node'; id: DestinyNodeId }
  | { k: 'notNode'; id: DestinyNodeId }
  | { k: 'job'; ids: string[] }
  | { k: 'merc' }
  | { k: 'awakenSkill' }

export interface DestinyNode {
  id: DestinyNodeId
  path: DestinyPathId
  name: string
  desc: string
  /** 0 = 選擇路徑時自動獲得的起始能力 */
  tier: number

  // ── 命運降臨制新增。現有 18 個節點走預設值,不必逐一改寫 ──
  /** 預設 'descend' */
  kind?: DestinyKind
  /** 同桶內的相對權重。0 或未填 = 不進降臨池(只能由既有的抉擇流程取得) */
  weight?: number
  /** 全部滿足才進池 */
  reqs?: DestinyReq[]
  /**
   * 種子的職業詮釋:同一顆種子,不同職業長成不同東西。
   * 這是整套設計的核心——玩家會期待「我等等選什麼職業,這顆種子會變成什麼」
   */
  interpretations?: Record<string, { name: string; desc: string }>
  /** 抉擇型:同一組三選一共用 */
  groupId?: string
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
    N('artisan_3a', 'artisan', 3, '傳家之器', '本輪最高階裝備登錄傳承圖鑑;銘刻的傳家之器殘缺程度較輕,並多保留一條詞綴'),
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

/**
 * ── 命運降臨池(第一階段:殘影線)──
 *
 * 這批節點**不進 `DESTINY_PATHS.choices`**,因此不會推進既有的決策點索引,
 * 舊的二選一流程完全不受影響(見 `nextChoiceIds` 的過濾)。
 *
 * ⚠️ 種子的描述刻意寫得「不完整」:第 10 層玩家還沒選職業,
 * 若把功能寫死就等於系統替他選了斥候。職業詮釋放在 `interpretations`。
 */
export const DESTINY_SEEDS: DestinyNode[] = [
  {
    id: 'seed_afterimage',
    path: 'tactician',
    tier: 1,
    kind: 'seed',
    weight: 10,
    name: '殘留之影',
    desc: '你的動作在戰場上留下殘影。殘影會參與接下來的攻擊。',
    interpretations: {
      // 第一階段只實作斥候線;另兩個先給文案,UI 會標「尚未實作」
      scout: {
        name: '鏡影刺客',
        desc: '殘影重播接下來的普攻,並從敵人另一側出現——製造破綻與背刺窗口。',
      },
      infantry: {
        name: '守護殘像',
        desc: '技能視窗期間殘影留在陣線上不會消失——每一擊都被重演。開窗時機與視窗長度成為主要決策。',
      },
      marshal: {
        name: '法術餘響',
        desc: '殘影不複製普攻。改為在施放技能時追加一次餘響,並推進其他技能的冷卻——順序決定循環效率。',
      },
    },
  },
]

/**
 * 降臨型改造。⚠️ 這些**不是**升級數值,而是改變殘影在做什麼——
 * 「殘影傷害 +30%」那種只會讓後續分支退化成「分身傷害加多少」。
 */
export const DESTINY_MODS: DestinyNode[] = [
  {
    id: 'shade_sync',
    path: 'tactician',
    tier: 1,
    kind: 'descend',
    weight: 8,
    reqs: [{ k: 'node', id: 'seed_afterimage' }],
    name: '同步步伐',
    desc: '殘影重演攻擊時也會累積破綻,但直接傷害降低——殘影從傷害來源變成破綻產生器。',
  },
  /**
   * ⚠️ 2026-07-31 ReviewOS 審查:在這批之前,可降臨的節點**只有 2 個**
   * (種子 + 同步步伐),第 3 次降臨起 `rollDescent` 回 null 並靜默 return——
   * 負責「驚喜」的系統在開局 1.5 分鐘後就永久沉默,而遊戲從沒告訴玩家。
   * 連帶:`DESTINY_SAME_BUCKET_FIRST = 2` 等於池子總數,cross / wild 桶在首輪
   * 數學上不可能被抽到,整組壞手保護是死碼。
   *
   * 這批補的每一個都是**規則改變**且只掛一處既有機制,不加新資源、不加百分比。
   */
  {
    id: 'shade_ember',
    path: 'tactician',
    tier: 1,
    kind: 'descend',
    weight: 6,
    reqs: [{ k: 'node', id: 'seed_afterimage' }],
    name: '餘燼之影',
    desc: '殘影的每一次重演都會點燃敵人。燃燒會無視圖騰直打本體,並持續累積破盾——殘影從打擊者變成縱火者。',
  },
  {
    id: 'sigil_hunter',
    path: 'tactician',
    tier: 1,
    kind: 'descend',
    weight: 6,
    name: '獵隙者',
    desc: '破綻疊滿後的金色窗口延長一倍。你有更多時間挑引爆的時機,而不是被窗口追著跑。',
  },
  {
    id: 'sigil_reload',
    path: 'artisan',
    tier: 1,
    kind: 'descend',
    weight: 6,
    name: '回響裝填',
    desc: '完美引爆會替所有冷卻中的技能各轉一段。引爆不再是循環的終點,而是下一輪的起點。',
  },
  {
    id: 'boss_lastditch',
    path: 'hunter',
    tier: 1,
    kind: 'descend',
    weight: 6,
    name: '背水一戰',
    desc: '守關戰倒數剩最後幾秒時,你的傷害大幅提升。差一點打不完的那些場,會變成打得完。',
  },
]

/** 第 30 層的抉擇:殘影最後長成什麼。三條刻意指向不同的玩法,不是同一件事的強弱 */
export const DESTINY_CHOICES: DestinyNode[] = [
  {
    id: 'shade_swarm',
    path: 'tactician',
    tier: 2,
    kind: 'choice',
    groupId: 'afterimage_30',
    weight: 0,
    reqs: [{ k: 'node', id: 'seed_afterimage' }],
    name: '群影',
    desc: '每 3 次普攻就生成殘影,但每個只重演 1 次。影子更密、每秒獨立命中更多——拆盾與「每次命中」類效果全部變快。',
  },
  {
    id: 'shade_mirror',
    path: 'tactician',
    tier: 2,
    kind: 'choice',
    groupId: 'afterimage_30',
    weight: 0,
    reqs: [{ k: 'node', id: 'seed_afterimage' }],
    name: '鏡像',
    desc: '每 8 次普攻才生成,但會重演 3 次,而且每次都替你轉技能冷卻。影子少而長,施放順序成為主要決策。',
  },
  {
    id: 'shade_lure',
    path: 'tactician',
    tier: 2,
    kind: 'choice',
    groupId: 'afterimage_30',
    weight: 0,
    reqs: [{ k: 'node', id: 'seed_afterimage' }],
    name: '誘敵之影',
    desc: '殘影傷害砍到一半以下,換來每一次都給破綻、破盾從弱化的 2 點升為獨立命中的 4 點。放棄正面輸出,換資源。',
  },
]

/** 全部可降臨/可抉擇的新節點,併進查表 */
for (const n of [...DESTINY_SEEDS, ...DESTINY_MODS, ...DESTINY_CHOICES]) DESTINY_NODES[n.id] = n

/** 條件是否成立。⚠️ 只讀引擎查得到的狀態 */
export function meetsReq(s: GameState, r: DestinyReq): boolean {
  switch (r.k) {
    case 'node':
      return hasNode(s, r.id)
    case 'notNode':
      return !hasNode(s, r.id)
    case 'job':
      return r.ids.includes(s.jobId)
    case 'merc':
      return s.activeMerc !== null
    case 'awakenSkill':
      return isAwakenedJob(s)
  }
}

/** 覺醒判定的最小依賴(避免 destiny.ts 反向 import game.ts) */
function isAwakenedJob(s: GameState): boolean {
  return s.destinyNodes.some((id) => (DESTINY_NODES[id]?.tier ?? 0) > 0)
}

/** 這個節點現在能不能進池 */
export function eligible(s: GameState, n: DestinyNode): boolean {
  if (!n.weight || n.weight <= 0) return false
  if (hasNode(s, n.id)) return false
  return (n.reqs ?? []).every((r) => meetsReq(s, r))
}

/**
 * 抽一個降臨節點。
 *
 * ⚠️ **壞手保護內建在這裡,不是事後補**:整輪只有幾次降臨,純加權抽在這個樣本數下
 * 方差極大(整輪 0 次意外、或前三次連續意外都是常見結果)。
 * 前 `SAME_BUCKET_FIRST` 次強制同流派,讓流派先成形,之後才開放跨流派與意外。
 *
 * ⚠️ rng 一定要用注入的:模擬器的重現性靠它,`Math.random` 會讓平衡驗證失效。
 */
export function rollDescent(
  s: GameState,
  rng: () => number,
): { node: DestinyNode; bucket: DestinyBucket } | null {
  // ⚠️ 還沒有種子時只抽種子。種子是「這一輪你是誰」的地基,職業詮釋與第 30 層抉擇
  // 都掛在它上面;讓一般降臨節點插隊到它前面,玩家會先拿到一個修飾語再拿到本體。
  // (補池子那批節點沒有 reqs,不擋的話真的會抽到——這條是測試抓出來的)
  const hasSeed = DESTINY_SEEDS.some((n) => hasNode(s, n.id))
  const source = hasSeed ? [...DESTINY_SEEDS, ...DESTINY_MODS, ...DESTINY_CHOICES] : DESTINY_SEEDS
  const pool = source.filter((n) => n.kind !== 'choice' && eligible(s, n))
  if (pool.length === 0) return null

  const forcedSame = s.destinyLog.length < B.DESTINY_SAME_BUCKET_FIRST
  const bucket: DestinyBucket = forcedSame ? 'same' : pickBucket(s, rng)
  const inBucket = pool.filter((n) => bucketOf(s, n) === bucket)
  // 該桶沒東西就退回整池,不要因為桶空了就什麼都不給
  const candidates = inBucket.length > 0 ? inBucket : pool

  let total = candidates.reduce((a, n) => a + (n.weight ?? 0), 0)
  let roll = rng() * total
  for (const n of candidates) {
    roll -= n.weight ?? 0
    if (roll <= 0) return { node: n, bucket }
  }
  return { node: candidates[candidates.length - 1], bucket }
}

function bucketOf(s: GameState, n: DestinyNode): DestinyBucket {
  if (!s.destinyPath) return 'same'
  return n.path === s.destinyPath ? 'same' : 'cross'
}

function pickBucket(s: GameState, rng: () => number): DestinyBucket {
  const wild = s.destinyLog.filter((r) => r.bucket === 'wild').length
  const r = rng()
  if (r < B.DESTINY_BUCKET_SAME) return 'same'
  if (r < B.DESTINY_BUCKET_SAME + B.DESTINY_BUCKET_CROSS) return 'cross'
  // wild 有每輪上限,超過就退回 cross
  return wild < B.DESTINY_WILD_PER_RUN ? 'wild' : 'cross'
}

/**
 * 還沒兌現的抉擇組(例如殘影的第 30 層三選一)。
 * 條件全滿足、且這一組還沒選過任何一個,才算待決。
 */
export function pendingChoiceGroup(s: GameState): DestinyNodeId[] | null {
  const groups = new Map<string, DestinyNode[]>()
  for (const n of DESTINY_CHOICES) {
    if (!n.groupId) continue
    if (!groups.has(n.groupId)) groups.set(n.groupId, [])
    groups.get(n.groupId)!.push(n)
  }
  for (const members of groups.values()) {
    if (members.some((n) => hasNode(s, n.id))) continue // 這組已經選過了
    if (!members.every((n) => (n.reqs ?? []).every((r) => meetsReq(s, r)))) continue
    return members.map((n) => n.id)
  }
  return null
}

/** 由已取得的節點反推傾向(定錨用)。平手取先取得的 */
export function dominantPath(s: GameState): DestinyPathId | null {
  const count: Partial<Record<DestinyPathId, number>> = {}
  for (const id of s.destinyNodes) {
    const n = DESTINY_NODES[id]
    if (!n || n.tier <= 0) continue
    count[n.path] = (count[n.path] ?? 0) + 1
  }
  let best: DestinyPathId | null = null
  for (const id of s.destinyNodes) {
    const n = DESTINY_NODES[id]
    if (!n || n.tier <= 0) continue
    if (best === null || (count[n.path] ?? 0) > (count[best] ?? 0)) best = n.path
  }
  return best
}

/** 種子在目前職業下的詮釋。沒有對應詮釋就回種子本身 */
export function interpretOf(n: DestinyNode, jobId: string): { name: string; desc: string } {
  return n.interpretations?.[jobId] ?? { name: n.name, desc: n.desc }
}

/** 已解鎖某節點 */
export function hasNode(s: GameState, id: DestinyNodeId): boolean {
  return s.destinyNodes.includes(id)
}

/**
 * 下一個決策點的選項;沒得選時回 null。
 *
 * ⚠️ 改讀 `s.pendingChoiceIds`,**不再用「已有節點數」當 `path.choices[]` 的索引**。
 * 舊寫法在命運降臨制下必壞:降臨每次塞一個 tier>0 節點進去,索引就往前跳一格,
 * 玩家會看到下一輪的選項,或 `choices[tier]` 直接 undefined → 回 null →
 * 命運點永遠花不掉、紅點常駐不滅,而且不會報錯、測試也抓不到。
 */
export function pendingChoice(s: GameState): DestinyNode[] | null {
  if (s.destinyPoints <= 0) return null
  const ids = s.pendingChoiceIds
  if (!ids || ids.length === 0) return null
  return ids.map((id) => DESTINY_NODES[id]).filter((n): n is DestinyNode => !!n)
}

/**
 * 依目前進度算出「下一組」抉擇選項。發命運點時用它寫進 `pendingChoiceIds`。
 * 這裡仍用 tier 索引,但**只在發點的那一刻算一次**,算完就固定住,
 * 之後再多幾個降臨節點也不會讓玩家手上的選項變掉。
 */
export function nextChoiceIds(s: GameState): DestinyNodeId[] | null {
  // 命運抉擇優先於既有的二選一:玩家手上有種子時,第 30 層要兌現的是
  // 「我的分身最後長成什麼」,不是路徑表上的下一個二選一
  const group = pendingChoiceGroup(s)
  if (group) return group

  if (!s.destinyPath) return null
  const path = DESTINY_PATHS[s.destinyPath]
  // 只數「抉擇型」節點,降臨得到的節點不推進決策點
  const taken = s.destinyNodes.filter((id) => {
    const n = DESTINY_NODES[id]
    return n && n.tier > 0 && path.choices.some((g) => g.includes(id))
  }).length
  const ids = path.choices[taken]
  return ids && ids.length > 0 ? [...ids] : null
}

/**
 * 冪等自癒:讀檔後與每次節點池變動後都可以呼叫。
 * 專治「有命運點但沒有選項」這種會讓點數卡死的狀態,
 * 以及節點改名後 `pendingChoiceIds` 裡殘留已不存在的 id。
 * ⚠️ 放這裡而不是 save.ts 的 migrate():migrate 全是純欄位操作,
 * 讓它反向依賴會變動的節點表,之後每次改節點都要回頭改遷移。
 */
export function reconcileDestiny(s: GameState): void {
  if (s.pendingChoiceIds) {
    const alive = s.pendingChoiceIds.filter((id) => !!DESTINY_NODES[id])
    s.pendingChoiceIds = alive.length > 0 ? alive : null
  }
  if (!s.pendingChoiceIds && s.destinyPoints > 0) s.pendingChoiceIds = nextChoiceIds(s)
}

/** 本輪還會再給幾枚命運點 */
export function milestonesLeft(s: GameState): number {
  return Math.max(0, B.DESTINY_MILESTONES.length - s.destinyEarned)
}

/** 下一個里程碑層數;都拿完回 null */
export function nextMilestone(s: GameState): number | null {
  return B.DESTINY_MILESTONES[s.destinyEarned] ?? null
}
