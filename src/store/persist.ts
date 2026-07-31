import localforage from 'localforage'
import { deserialize, serialize, type SaveData } from '../core/save'
import type { GameState } from '../core/types'

const KEY = 'little-soldier-save'

localforage.config({ name: 'little-soldier', storeName: 'save' })

/** hasSave 只有這一層知道:deserialize 在第一行就把 null 換成初始 state 了 */
export async function loadGame(): Promise<{ state: GameState; awayMs: number; hasSave: boolean }> {
  try {
    const raw = await localforage.getItem<SaveData>(KEY)
    const state = deserialize(raw)
    const awayMs = raw?.lastSaved ? Date.now() - raw.lastSaved : 0
    return { state, awayMs, hasSave: raw != null }
  } catch {
    return { state: deserialize(null), awayMs: 0, hasSave: false }
  }
}

export async function saveGame(s: GameState): Promise<void> {
  try {
    await localforage.setItem(KEY, serialize(s))
  } catch {
    // 存檔失敗不影響遊玩(隱私模式 / 配額滿)
  }
}

export async function wipeSave(): Promise<void> {
  await localforage.removeItem(KEY)
}
