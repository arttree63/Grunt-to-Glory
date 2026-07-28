import { D } from './decimal'
import { createInitialState, SAVE_VERSION } from './game'
import { emptyTalents } from './talents'
import { emptyTechs } from './techs'
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
  talents: GameState['talents']
  materials: number
  forgeCount: number
  pityCount: number
  pityLegendary: number
  partMaterials: GameState['partMaterials']
  eliteMaterials: number
  maxBossKilled: number
  lastEliteDay: string
  inventory: GameState['inventory']
  equipped: GameState['equipped']
  medals: number
  runs: number
  techs: GameState['techs']
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
    talents: s.talents,
    materials: s.materials,
    forgeCount: s.forgeCount,
    pityCount: s.pityCount,
    pityLegendary: s.pityLegendary,
    partMaterials: s.partMaterials,
    eliteMaterials: s.eliteMaterials,
    maxBossKilled: s.maxBossKilled,
    lastEliteDay: s.lastEliteDay,
    inventory: s.inventory,
    equipped: s.equipped,
    medals: s.medals,
    runs: s.runs,
    techs: s.techs,
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
  // v2 → v3:勳章由被動加成改為可花費貨幣,舊存檔的勳章原封不動留著讓玩家自己買科技
  if (d.version < 3) {
    d.techs = d.techs ?? emptyTechs()
    d.version = 3
  }
  // v3 → v4:部位/菁英素材、精工保底
  if (d.version < 4) {
    d.pityLegendary = d.pityLegendary ?? 0
    d.partMaterials = d.partMaterials ?? { weapon: 0, head: 0, body: 0, boots: 0, trinket: 0 }
    d.eliteMaterials = d.eliteMaterials ?? 0
    // 舊存檔沒有首殺記錄,用當前最高層推回去,免得已打過的 Boss 又送一次素材
    d.maxBossKilled = d.maxBossKilled ?? Math.floor((d.highestFloor ?? 1) / 10) * 10
    d.lastEliteDay = d.lastEliteDay ?? ''
    d.version = 4
  }
  // v4 → v5:突發事件。事件是限時暫態,刻意不進存檔,讀檔後重新計時
  if (d.version < 5) {
    d.version = 5
  }
  // v5 → v6:天賦配點。舊存檔的等級已經吃過「含配點期望值」的舊曲線,
  // 這裡把既有等級的點數全部補進力量,玩家戰力不會因為改版下降(之後可自行洗點)
  if (d.version < 6) {
    if (!d.talents) d.talents = { str: Math.max(0, (d.lv ?? 1) - 1), agi: 0, int: 0, luk: 0 }
    d.version = 6
  }
  return d
}

export function deserialize(raw: SaveData | null | undefined): GameState {
  if (!raw || typeof raw.version !== 'number') return createInitialState()
  const d = migrate(raw)
  const base = createInitialState(d.medals ?? 0, d.runs ?? 0, { ...emptyTechs(), ...(d.techs ?? {}) })
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
    talents: d.talents ?? emptyTalents(),
    materials: d.materials ?? 0,
    forgeCount: d.forgeCount ?? 0,
    pityCount: d.pityCount ?? 0,
    pityLegendary: d.pityLegendary ?? 0,
    partMaterials: { ...base.partMaterials, ...(d.partMaterials ?? {}) },
    eliteMaterials: d.eliteMaterials ?? 0,
    maxBossKilled: d.maxBossKilled ?? 0,
    lastEliteDay: d.lastEliteDay ?? '',
    inventory: d.inventory ?? [],
    equipped: { ...base.equipped, ...(d.equipped ?? {}) },
    lastSaved: d.lastSaved ?? Date.now(),
  }
}
