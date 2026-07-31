import { create } from 'zustand'
import * as B from '../core/balance'
import { D, type Decimal } from '../core/decimal'
import * as G from '../core/game'
import type {
  DestinyNodeId,
  DestinyPathId,
  EncounterId,
  MercId,
  Equipment,
  GameState,
  JobId,
  SkillId,
  Slot,
  TechId,
  TrainingId,
} from '../core/types'
import { gameEvents } from './events'
import { loadGame, saveGame, wipeSave } from './persist'

interface OfflineReport {
  seconds: number
  gold: Decimal
  /** 有沒有撞到離線上限。⚠️ core 一直有算,但先前整條被丟掉,玩家不知道自己損失了時間 */
  capped: boolean
}

interface Store {
  s: GameState
  /** 每次 state 變動 +1,供元件訂閱 */
  rev: number
  loaded: boolean
  /** 這台裝置本來就有存檔:標題畫面用它決定「繼續旅途」還是「開始遊戲」 */
  hasSave: boolean
  offline: OfflineReport | null
  /** 剛完成的轉生結算,供結算頁顯示 */
  lastRun: import('../core/types').ChronicleEntry | null

  init: () => Promise<void>
  /** 玩家在標題畫面按下開始:世界從這一刻才開始跑 */
  enterGame: () => void
  tick: (dtMs: number) => void
  click: () => void
  buy: (n: number | 'max') => void
  chooseTraining: (id: TrainingId) => void
  promote: (job: JobId) => void
  chooseDestiny: (path: DestinyPathId) => void
  pickDestinyNode: (id: DestinyNodeId) => void
  castSkill: (id: SkillId) => void
  forge: (opts?: G.ForgeOptions) => Equipment | null
  devourWeapon: (foodId: string) => void
  fineForge: (opts: G.FineForgeOptions) => Equipment | null
  buyElite: () => void
  resolveEncounter: (id: EncounterId, choiceId: string) => boolean
  barterForDestiny: () => void
  toggleCharge: () => void
  equip: (id: string) => void
  unequip: (slot: Slot) => void
  salvage: (id: string) => void
  salvageEquipped: (slot: Slot) => void
  salvageBelow: (quality: number) => void
  /** 最近一次一鍵分解的結果(給 UI 回饋用) */
  lastSalvage: { count: number; materials: number; protectedCount: number } | null
  retryBoss: () => void
  setTactic: (id: import('../core/types').TacticId | null) => void
  buyTech: (id: TechId) => void
  prestige: (heirloomIds?: string[]) => void
  inscribeHeirloom: (id: string) => void
  setActiveMerc: (id: MercId | null) => void
  toggleAutoCast: () => void
  /**
   * 集中注意力式教學:機制第一次出現時全畫面壓暗、只亮該機制的 HUD,
   * 遊戲暫停(含 Boss 倒數,不偷玩家時間),點一下繼續。值 = 聚焦目標 id。
   */
  spotlight: string | null
  /** 會遮住戰場或要求玩家閱讀的 UI。modal 全停；panel 只保護限時戰鬥。 */
  uiLocks: string[]
  setUiLock: (key: string, active: boolean) => void
  showSpotlight: (id: string) => void
  dismissSpotlight: () => void
  dismissOffline: () => void
  dismissRunSummary: () => void
  reset: () => Promise<void>
}

const bump = (set: (p: Partial<Store>) => void, get: () => Store) => set({ rev: get().rev + 1 })

/** 讀檔時存檔上的 lastSaved:離線收益要算到「按下開始」為止,不是算到開頁為止 */
let awayFrom: number | null = null

export const useGame = create<Store>((set, get) => ({
  s: G.createInitialState(),
  rev: 0,
  lastSalvage: null,
  loaded: false,
  hasSave: false,
  offline: null,
  lastRun: null,

  async init() {
    const { state, lastSaved, hasSave } = await loadGame()
    // ⚠️ 離線結算刻意**不在這裡**做:玩家可能在標題畫面停很久(切走、放著)。
    // 在讀檔當下結清的話,那段時間會兩頭落空——迴圈還沒跑所以沒有線上推進,
    // 離線又只算到開頁那一刻;而且「按開始」與「重新整理」會拿到不一樣的收益。
    awayFrom = lastSaved
    set({ s: state, loaded: true, hasSave, rev: get().rev + 1 })
  },

  // ⚠️ 迴圈刻意不在 init 啟動:玩家還停在標題畫面時,小兵不該已經在推層、每 10 秒覆蓋存檔。
  // 離線結算也在這一刻才結清,截止點是「按下開始」而不是「頁面載入」
  enterGame() {
    const awayMs = awayFrom === null ? 0 : Date.now() - awayFrom
    awayFrom = null
    if (awayMs > 60_000) {
      const s = get().s
      const r = G.computeOffline(s, awayMs)
      s.gold = s.gold.add(r.gold)
      set({ s, offline: { seconds: r.seconds, gold: r.gold, capped: r.capped }, rev: get().rev + 1 })
    }
    startLoop()
  },

  spotlight: null,
  uiLocks: [],
  setUiLock(key, active) {
    const locks = get().uiLocks
    const next = active
      ? locks.includes(key) ? locks : [...locks, key]
      : locks.filter((lock) => lock !== key)
    if (next !== locks) set({ uiLocks: next })
  },
  showSpotlight(id) {
    set({ spotlight: id })
  },
  dismissSpotlight() {
    set({ spotlight: null })
  },

  tick(dtMs) {
    const state = get()
    const s = state.s
    const modalOpen = state.uiLocks.some((lock) => lock.startsWith('modal:'))
    const panelOpen = state.uiLocks.includes('panel')
    if (
      state.spotlight ||
      modalOpen ||
      (panelOpen && (s.isBoss || !!s.event || s.perfectWindowLeft > 0))
    ) return
    const events = G.applyTick(s, dtMs)
    // 每日首殺 Boss 保底菁英素材(core 不碰時鐘,日期由這裡提供)
    if (events.some((e) => e.type === 'bossKill')) {
      if (G.claimDailyElite(s, new Date().toISOString().slice(0, 10))) {
        gameEvents.emit({ type: 'eliteDrop' })
      }
    }
    events.forEach(gameEvents.emit)
    bump(set, get)
  },

  click() {
    G.click(get().s).forEach(gameEvents.emit)
    bump(set, get)
  },

  buy(n) {
    const s = get().s
    const before = s.lv
    const pendingBefore = G.pendingTrainingCount(s)
    if (n === 'max') G.buyMaxLevels(s)
    else G.buyLevels(s, n)
    if (s.lv !== before) gameEvents.emit({ type: 'levelUp' })
    // 跨過操練里程碑不再彈窗打斷,改成戰場上一行——「發生了」看得見,要不要現在去選由玩家決定
    const gained = G.pendingTrainingCount(s) - pendingBefore
    if (gained > 0) gameEvents.emit({ type: 'trainingReady', count: gained })
    bump(set, get)
  },

  chooseTraining(id) {
    if (G.chooseTraining(get().s, id)) gameEvents.emit({ type: 'trainingChosen', trainingId: id })
    bump(set, get)
  },

  promote(job) {
    G.promote(get().s, job)
    bump(set, get)
  },

  chooseDestiny(path) {
    G.chooseDestiny(get().s, path)
    bump(set, get)
  },

  pickDestinyNode(id) {
    G.pickDestinyNode(get().s, id)
    bump(set, get)
  },

  castSkill(id) {
    G.castSkill(get().s, id).forEach(gameEvents.emit)
    bump(set, get)
  },

  forge(opts) {
    const s = get().s
    const relicBefore = s.relicPending
    const e = G.forge(s, Math.random, opts)
    if (e) {
      gameEvents.emit({ type: 'forge', equipment: e })
      gameEvents.emit(G.resonanceEvent('forge'))
      // 貪婪之眼:鍛出紫裝當下就要說「下場 Boss 帶弱點」,不能等玩家自己回鐵匠鋪發現
      if (!relicBefore && s.relicPending) gameEvents.emit({ type: 'relicPrimed' })
    }
    bump(set, get)
    return e
  },

  devourWeapon(foodId) {
    G.devourWeapon(get().s, foodId)
    bump(set, get)
  },

  fineForge(opts) {
    const s = get().s
    const relicBefore = s.relicPending
    const e = G.fineForge(s, opts)
    if (e) {
      gameEvents.emit({ type: 'forge', equipment: e })
      gameEvents.emit(G.resonanceEvent('forge'))
      if (!relicBefore && s.relicPending) gameEvents.emit({ type: 'relicPrimed' })
    }
    bump(set, get)
    return e
  },

  resolveEncounter(id, choiceId) {
    const resolved = G.resolveEncounter(get().s, id, choiceId)
    if (resolved) gameEvents.emit(G.resonanceEvent('encounter'))
    bump(set, get)
    return resolved
  },

  toggleCharge() {
    G.toggleCharge(get().s)
    bump(set, get)
  },

  barterForDestiny() {
    G.barterForDestiny(get().s)
    bump(set, get)
  },

  buyElite() {
    G.buyElite(get().s)
    bump(set, get)
  },

  equip(id) {
    G.equip(get().s, id)
    bump(set, get)
  },

  unequip(slot) {
    G.unequip(get().s, slot)
    bump(set, get)
  },

  salvage(id) {
    if (G.salvage(get().s, id) > 0) gameEvents.emit(G.resonanceEvent('salvage'))
    bump(set, get)
  },

  salvageEquipped(slot) {
    if (G.salvageEquipped(get().s, slot) > 0) gameEvents.emit(G.resonanceEvent('salvage'))
    bump(set, get)
  },

  salvageBelow(qualityIdx) {
    const r = G.salvageBelow(get().s, qualityIdx)
    set({ lastSalvage: r })
    bump(set, get)
  },

  retryBoss() {
    G.retryBoss(get().s)
    bump(set, get)
  },

  setTactic(id) {
    G.setTactic(get().s, id)
    bump(set, get)
  },

  buyTech(id) {
    G.buyTech(get().s, id)
    bump(set, get)
  },

  toggleAutoCast() {
    G.toggleAutoCast(get().s)
    bump(set, get)
  },
  setActiveMerc(id) {
    if (G.setActiveMerc(get().s, id)) bump(set, get)
  },
  inscribeHeirloom(id) {
    // ⚠️ state 是原地變動的,一律用 bump 觸發重繪(直接 set 新物件不會讓 useGameState 更新)
    if (G.inscribeHeirloom(get().s, id)) bump(set, get)
  },
  prestige(heirloomIds = []) {
    const next = G.prestige(get().s, heirloomIds)
    if (next) {
      // 轉生要被呈現為結算與傳承,不是清空
      gameEvents.emit({ type: 'runReset' })
      set({ s: next, lastRun: next.chronicle[0] ?? null, rev: get().rev + 1 })
      void saveGame(next)
    }
  },

  dismissOffline() {
    set({ offline: null })
  },

  dismissRunSummary() {
    set({ lastRun: null })
  },

  async reset() {
    await wipeSave()
    gameEvents.emit({ type: 'runReset' })
    // lastRun 一起清:重置時若結算卡還開著,它會一直掛著 modal:app lock 把遊戲停住
    set({ s: G.createInitialState(), rev: get().rev + 1, offline: null, lastRun: null, hasSave: false })
  },
}))

// ---------- 固定 tick 迴圈(與渲染幀率解耦) ----------

let loopId: number | null = null
const STEP = 1000 / B.TICK_HZ
/** 單次 tick 最大時間,避免分頁被節流後一次結算爆衝 */
const MAX_STEP = 500
/** 離開超過此時間才視為離線,回來時用離線公式補 */
const AWAY_MS = 30_000

function startLoop() {
  if (loopId !== null) return
  let last = Date.now()
  let saveAcc = 0

  loopId = window.setInterval(() => {
    const now = Date.now()
    let dt = now - last
    last = now

    if (dt > AWAY_MS) {
      // 分頁被凍結:走離線結算,不用戰鬥 tick 硬跑
      const s = useGame.getState().s
      const r = G.computeOffline(s, dt)
      s.gold = s.gold.add(r.gold)
      useGame.setState({
        s,
        offline: { seconds: r.seconds, gold: r.gold, capped: r.capped },
        rev: useGame.getState().rev + 1,
      })
      dt = STEP
    }

    useGame.getState().tick(Math.min(dt, MAX_STEP))

    saveAcc += dt
    if (saveAcc > 10_000) {
      saveAcc = 0
      void saveGame(useGame.getState().s)
    }
  }, STEP)

  // 熱更新會換掉模組,舊的 setInterval 卻還在跑,累積下來會有好幾份迴圈
  // 同時推進(攻擊變得又快又零星)。這裡在模組被替換時把它收掉。
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      if (loopId !== null) window.clearInterval(loopId)
      loopId = null
    })
  }

  const flush = () => void saveGame(useGame.getState().s)
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

// 開發用:瀏覽器 console 可直接操作 state 驗證(不進 production bundle)
if (import.meta.env.DEV) {
  ;(window as unknown as { __game: typeof useGame }).__game = useGame
  // 驗證顯示字串用:畫面上的數字要能直接對得回來
  void import('../core/format').then((m) => {
    ;(window as unknown as { __fmt: typeof m.fmt }).__fmt = m.fmt
  })
  // 驗證用:攔事件流,確認畫面顯示的數字與實際入袋一致
  ;(window as unknown as { __events: typeof gameEvents }).__events = gameEvents
}

// UI 便利選擇器
export const selDps = (st: Store) => G.currentDPS(st.s)
export const selGoldPerSec = (st: Store) => G.goldPerSec(st.s)
export const selPendingMedals = (st: Store) => G.pendingMedals(st.s)
export const ZERO_D = D(0)
