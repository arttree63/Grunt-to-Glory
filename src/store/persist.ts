import localforage from 'localforage'
import { deserialize, serialize, type SaveData } from '../core/save'
import type { GameState } from '../core/types'

const KEY = 'little-soldier-save'

localforage.config({ name: 'little-soldier', storeName: 'save' })

/**
 * lastSaved 與 hasSave 只有這一層知道:deserialize 在第一行就把 null 換成初始 state 了。
 * ⚠️ hasSave 問的是「有沒有旅途可以繼續」而不是「檔案在不在」:重置後迴圈仍在跑,
 * 10 秒內就會把全新的初始 state 寫回去,只看檔案存不存在的話,剛重置完會被叫「繼續旅途」。
 */
export async function loadGame(): Promise<{
  state: GameState
  lastSaved: number | null
  hasSave: boolean
}> {
  try {
    const raw = await localforage.getItem<SaveData>(KEY)
    const state = deserialize(raw)
    const started = state.runs > 0 || state.highestFloor > 1 || state.lv > 1 || state.medals > 0
    return { state, lastSaved: raw?.lastSaved ?? null, hasSave: raw != null && started }
  } catch {
    return { state: deserialize(null), lastSaved: null, hasSave: false }
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
