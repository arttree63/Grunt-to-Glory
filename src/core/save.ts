import { D } from './decimal'
import { createInitialState, SAVE_VERSION } from './game'
import type { GameState } from './types'

/** 存檔格式:Decimal 一律轉字串 */
export interface SaveData {
  version: number
  lv: number
  gold: string
  jobId: GameState['jobId']
  floor: number
  highestFloor: number
  killsInFloor: number
  isBoss: boolean
  enemyHp: string
  enemyMaxHp: string
  bossTimeLeft: number
  bossFailed: boolean
  morale: number
  materials: number
  forgeCount: number
  pityCount: number
  inventory: GameState['inventory']
  equipped: GameState['equipped']
  medals: number
  runs: number
  lastSaved: number
}

export function serialize(s: GameState): SaveData {
  return {
    version: SAVE_VERSION,
    lv: s.lv,
    gold: s.gold.toString(),
    jobId: s.jobId,
    floor: s.floor,
    highestFloor: s.highestFloor,
    killsInFloor: s.killsInFloor,
    isBoss: s.isBoss,
    enemyHp: s.enemyHp.toString(),
    enemyMaxHp: s.enemyMaxHp.toString(),
    bossTimeLeft: s.bossTimeLeft,
    bossFailed: s.bossFailed,
    morale: s.morale,
    materials: s.materials,
    forgeCount: s.forgeCount,
    pityCount: s.pityCount,
    inventory: s.inventory,
    equipped: s.equipped,
    medals: s.medals,
    runs: s.runs,
    lastSaved: Date.now(),
  }
}

/**
 * 存檔遷移。原則:只擴不縮,舊欄位不刪、新欄位補預設值。
 * 無法辨識的存檔回退成新局,不讓玩家卡死。
 */
function migrate(raw: SaveData): SaveData {
  const d = { ...raw }
  // v1 → v2:加入鐵匠鋪等級與保底計數
  if (d.version < 2) {
    d.forgeCount = d.forgeCount ?? 0
    d.pityCount = d.pityCount ?? 0
    d.version = 2
  }
  return d
}

export function deserialize(raw: SaveData | null | undefined): GameState {
  if (!raw || typeof raw.version !== 'number') return createInitialState()
  const d = migrate(raw)
  const base = createInitialState(d.medals ?? 0, d.runs ?? 0)
  return {
    ...base,
    lv: d.lv ?? 1,
    gold: D(d.gold ?? 0),
    jobId: d.jobId ?? 'rookie',
    floor: d.floor ?? 1,
    highestFloor: d.highestFloor ?? 1,
    killsInFloor: d.killsInFloor ?? 0,
    isBoss: !!d.isBoss,
    enemyHp: D(d.enemyHp ?? base.enemyHp),
    enemyMaxHp: D(d.enemyMaxHp ?? base.enemyMaxHp),
    bossTimeLeft: d.bossTimeLeft ?? 30,
    bossFailed: !!d.bossFailed,
    morale: d.morale ?? 0,
    materials: d.materials ?? 0,
    forgeCount: d.forgeCount ?? 0,
    pityCount: d.pityCount ?? 0,
    inventory: d.inventory ?? [],
    equipped: { ...base.equipped, ...(d.equipped ?? {}) },
    lastSaved: d.lastSaved ?? Date.now(),
  }
}
