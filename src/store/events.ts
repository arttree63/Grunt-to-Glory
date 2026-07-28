import type { GameEvent } from '../core/types'

/** core → render 的單向事件橋(render 不 import store 以外的東西) */
type Listener = (e: GameEvent) => void

const listeners = new Set<Listener>()

export const gameEvents = {
  on(fn: Listener) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  emit(e: GameEvent) {
    listeners.forEach((fn) => fn(e))
  },
}
