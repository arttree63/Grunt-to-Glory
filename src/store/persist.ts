import localforage from 'localforage'
import { deserialize, serialize, type SaveData } from '../core/save'
import type { GameState } from '../core/types'

const KEY = 'little-soldier-save'

localforage.config({ name: 'little-soldier', storeName: 'save' })

export async function loadGame(): Promise<{ state: GameState; awayMs: number }> {
  try {
    const raw = await localforage.getItem<SaveData>(KEY)
    const state = deserialize(raw)
    const awayMs = raw?.lastSaved ? Date.now() - raw.lastSaved : 0
    return { state, awayMs }
  } catch {
    return { state: deserialize(null), awayMs: 0 }
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
