import { create } from 'zustand'
import * as B from '../core/balance'
import { D, type Decimal } from '../core/decimal'
import { QUALITIES } from '../core/equipment'
import * as G from '../core/game'
import type { Equipment, GameState, JobId, Slot } from '../core/types'
import { gameEvents } from './events'
import { loadGame, saveGame, wipeSave } from './persist'

interface OfflineReport {
  seconds: number
  gold: Decimal
}

interface Store {
  s: GameState
  /** 每次 state 變動 +1,供元件訂閱 */
  rev: number
  loaded: boolean
  offline: OfflineReport | null

  init: () => Promise<void>
  tick: (dtMs: number) => void
  click: () => void
  buy: (n: number | 'max') => void
  promote: (job: Exclude<JobId, 'rookie'>) => void
  forge: () => Equipment | null
  equip: (id: string) => void
  unequip: (slot: Slot) => void
  salvage: (id: string) => void
  salvageBelow: (quality: number) => void
  retryBoss: () => void
  prestige: (heirloomIds?: string[]) => void
  dismissOffline: () => void
  reset: () => Promise<void>
}

const bump = (set: (p: Partial<Store>) => void, get: () => Store) => set({ rev: get().rev + 1 })

export const useGame = create<Store>((set, get) => ({
  s: G.createInitialState(),
  rev: 0,
  loaded: false,
  offline: null,

  async init() {
    const { state, awayMs } = await loadGame()
    let offline: OfflineReport | null = null
    if (awayMs > 60_000) {
      const r = G.computeOffline(state, awayMs)
      state.gold = state.gold.add(r.gold)
      offline = { seconds: r.seconds, gold: r.gold }
    }
    set({ s: state, loaded: true, offline, rev: get().rev + 1 })
    startLoop()
  },

  tick(dtMs) {
    const s = get().s
    const events = G.applyTick(s, dtMs)
    events.forEach(gameEvents.emit)
    bump(set, get)
  },

  click() {
    G.click(get().s)
    bump(set, get)
  },

  buy(n) {
    const s = get().s
    const before = s.lv
    if (n === 'max') G.buyMaxLevels(s)
    else G.buyLevels(s, n)
    if (s.lv !== before) gameEvents.emit({ type: 'levelUp' })
    bump(set, get)
  },

  promote(job) {
    G.promote(get().s, job)
    bump(set, get)
  },

  forge() {
    const e = G.forge(get().s)
    if (e) gameEvents.emit({ type: 'forge', equipment: e })
    bump(set, get)
    return e
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
    G.salvage(get().s, id)
    bump(set, get)
  },

  salvageBelow(qualityIdx) {
    const s = get().s
    for (const e of [...s.inventory]) {
      if (QUALITIES.indexOf(e.quality) <= qualityIdx) G.salvage(s, e.id)
    }
    bump(set, get)
  },

  retryBoss() {
    G.retryBoss(get().s)
    bump(set, get)
  },

  prestige(heirloomIds = []) {
    const next = G.prestige(get().s, heirloomIds)
    if (next) {
      set({ s: next, rev: get().rev + 1 })
      void saveGame(next)
    }
  },

  dismissOffline() {
    set({ offline: null })
  },

  async reset() {
    await wipeSave()
    set({ s: G.createInitialState(), rev: get().rev + 1, offline: null })
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
      useGame.setState({ s, offline: { seconds: r.seconds, gold: r.gold }, rev: useGame.getState().rev + 1 })
      dt = STEP
    }

    useGame.getState().tick(Math.min(dt, MAX_STEP))

    saveAcc += dt
    if (saveAcc > 10_000) {
      saveAcc = 0
      void saveGame(useGame.getState().s)
    }
  }, STEP)

  const flush = () => void saveGame(useGame.getState().s)
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

// 開發用:瀏覽器 console 可直接操作 state 驗證(不進 production bundle)
if (import.meta.env.DEV) {
  ;(window as unknown as { __game: typeof useGame }).__game = useGame
}

// UI 便利選擇器
export const selDps = (st: Store) => G.currentDPS(st.s)
export const selGoldPerSec = (st: Store) => G.goldPerSec(st.s)
export const selPendingMedals = (st: Store) => G.pendingMedals(st.s)
export const ZERO_D = D(0)
