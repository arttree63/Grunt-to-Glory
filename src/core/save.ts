import { D } from './decimal'
import { createInitialState, SAVE_VERSION } from './game'
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
  bossRetryFloor: number | null
  morale: number
  forgeHeatMaterials: number
  codex: GameState['codex']
  chronicle: GameState['chronicle']
  runStart: GameState['runStart']
  bossKills: number
  encounters: GameState['encounters']
  nextEncounterFloor: number
  eventKindsDone: string[]
  goldenPending: boolean
  routeBuff: GameState['routeBuff']
  barterUsed: number
  sigils: number
  castOrder: GameState['castOrder']
  relicPending: boolean
  bannerStored: number
  commandReady: boolean
  inscribedId: string | null
  jobMatrix: GameState['jobMatrix']
  activeMerc: GameState['activeMerc']
  mercBestFloor: number
  legendsSeen: GameState['legendsSeen']
  zealStacks: number
  combo: number
  valiantStacks: number
  destinyPath: GameState['destinyPath']
  destinyNodes: GameState['destinyNodes']
  destinyPoints: number
  destinyEarned: number
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
    bossRetryFloor: s.bossRetryFloor,
    morale: s.morale,
    forgeHeatMaterials: s.forgeHeatMaterials,
    codex: s.codex,
    chronicle: s.chronicle,
    runStart: s.runStart,
    bossKills: s.bossKills,
    encounters: s.encounters,
    nextEncounterFloor: s.nextEncounterFloor,
    eventKindsDone: s.eventKindsDone,
    goldenPending: s.goldenPending,
    routeBuff: s.routeBuff,
    barterUsed: s.barterUsed,
    sigils: s.sigils,
    castOrder: s.castOrder,
    relicPending: s.relicPending,
    bannerStored: s.bannerStored,
    commandReady: s.commandReady,
    inscribedId: s.inscribedId,
    jobMatrix: s.jobMatrix,
    activeMerc: s.activeMerc,
    mercBestFloor: s.mercBestFloor,
    legendsSeen: s.legendsSeen,
    zealStacks: s.zealStacks,
    combo: s.combo,
    valiantStacks: s.valiantStacks,
    destinyPath: s.destinyPath,
    destinyNodes: s.destinyNodes,
    destinyPoints: s.destinyPoints,
    destinyEarned: s.destinyEarned,
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
  // v5 → v6:曾經加入四維天賦。v8 已把天賦整套移除,所以這一步現在是空的,
  // 保留只是為了讓版本鏈連續(舊存檔仍會依序走到 v8)
  if (d.version < 6) {
    d.version = 6
  }
  // v6 → v7:Boss 失敗改為退回前一層,需要記住要重挑戰哪一層
  if (d.version < 7) {
    // 舊存檔停在 Boss 層 farm;把重試層設成當前層,讀檔後行為一致
    d.bossRetryFloor = d.bossFailed ? (d.floor ?? null) : null
    d.version = 7
  }
  // v7 → v8:四維天賦改為命運樹。
  // 不做一對一轉換——兩套系統沒有可靠對應,而且照「原本全點力量」自動配流派
  // 等於上線第一刻就替玩家做掉最重要的選擇。改為全額返還:
  // 天賦效果移除後基礎曲線回到原始基準(沒有人變弱),再送一枚命運點當補償。
  if (d.version < 8) {
    const hadTalents = 'talents' in (d as Record<string, unknown>)
    d.destinyPath = null
    d.destinyNodes = []
    d.destinyPoints = hadTalents ? 1 : 0
    d.destinyEarned = 0
    d.version = 8
  }
  // v8 → v9:神匠節點效果(爐火、傳承圖鑑、Boss 計數)
  if (d.version < 9) {
    d.forgeHeatMaterials = d.forgeHeatMaterials ?? 0
    d.codex = d.codex ?? []
    d.bossKills = d.bossKills ?? 0
    d.version = 9
  }
  // v9 → v10:留存事件(旅途紀錄)。留存事件會進存檔——限時事件才是暫態
  if (d.version < 10) {
    d.encounters = d.encounters ?? []
    d.nextEncounterFloor = d.nextEncounterFloor ?? (d.floor ?? 1) + 12
    d.eventKindsDone = d.eventKindsDone ?? []
    d.goldenPending = d.goldenPending ?? false
    d.routeBuff = d.routeBuff ?? null
    d.barterUsed = d.barterUsed ?? 0
    d.version = 10
  }
  // v10 → v11:戰術家。連斬與越戰越勇進存檔;蓄勢是暫態,讀檔後歸零
  if (d.version < 11) {
    d.combo = d.combo ?? 0
    d.valiantStacks = d.valiantStacks ?? 0
    d.version = 11
  }
  // v11 → v12:歷代列傳與本輪增量快照
  if (d.version < 12) {
    d.chronicle = d.chronicle ?? []
    d.runStart = d.runStart ?? {
      medals: d.medals ?? 0,
      forgeCount: d.forgeCount ?? 0,
      codexCount: (d.codex ?? []).length,
    }
    d.version = 12
  }
  // v12 → v13:一轉第二技能與印記
  if (d.version < 13) {
    d.sigils = d.sigils ?? 0
    d.version = 13
  }
  // v13 → v14:裝備四層架構(基底 / 詞綴分類 / 傳說)。
  // 舊裝備沒有 base 與 legend,留 undefined = 無修正,不動玩家既有裝備的強度
  if (d.version < 14) {
    d.castOrder = d.castOrder ?? []
    d.relicPending = d.relicPending ?? false
    d.bannerStored = d.bannerStored ?? 0
    d.version = 14
  }
  // v14 → v15:套裝標籤。舊裝備沒有 setTag = 沒有標籤,不動既有強度
  if (d.version < 15) {
    d.commandReady = d.commandReady ?? false
    d.version = 15
  }
  // v15 → v16:傳家之器合併為單一系統(銘刻 → 殘缺 → 修復)。
  // 舊存檔沒有銘刻紀錄,留 null 讓玩家自己選一件,不替他決定
  if (d.version < 16) {
    d.inscribedId = d.inscribedId ?? null
    d.version = 16
  }
  // v16 → v17:命運 × 職業矩陣圖鑑。舊存檔沒有紀錄,從這一代開始累積
  if (d.version < 17) {
    d.jobMatrix = d.jobMatrix ?? {}
    d.version = 17
  }
  // v17 → v18:傭兵歸位(v1.5)。老獵犬本來就在畫面上,直接當出戰傭兵;
  // 歷代最高用當前 highestFloor 保底,老玩家已推過的層數直接算解鎖進度
  if (d.version < 18) {
    d.activeMerc = d.activeMerc ?? 'hound'
    d.mercBestFloor = d.mercBestFloor ?? d.highestFloor ?? 1
    // 舊玩家身上/背包已有的傳說直接入圖鑑,不要讓已擁有的顯示成「未取得」
    d.legendsSeen =
      d.legendsSeen ??
      [...(d.inventory ?? []), ...Object.values(d.equipped ?? {})]
        .map((e) => e?.legend)
        .filter((x): x is NonNullable<typeof x> => !!x)
    d.version = 18
  }
  // v18 → v19:總攻改版(buff 多槽是暫態不進檔;戰意昂揚的輪內疊乘要進檔)
  if (d.version < 19) {
    d.zealStacks = d.zealStacks ?? 0
    d.version = 19
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
    bossRetryFloor: d.bossRetryFloor ?? null,
    morale: d.morale ?? 0,
    forgeHeatMaterials: d.forgeHeatMaterials ?? 0,
    codex: d.codex ?? [],
    chronicle: d.chronicle ?? [],
    runStart: d.runStart ?? { medals: d.medals ?? 0, forgeCount: d.forgeCount ?? 0, codexCount: (d.codex ?? []).length },
    bossKills: d.bossKills ?? 0,
    encounters: d.encounters ?? [],
    nextEncounterFloor: d.nextEncounterFloor ?? 12,
    eventKindsDone: d.eventKindsDone ?? [],
    goldenPending: !!d.goldenPending,
    routeBuff: d.routeBuff ?? null,
    barterUsed: d.barterUsed ?? 0,
    sigils: d.sigils ?? 0,
    castOrder: d.castOrder ?? [],
    relicPending: !!d.relicPending,
    bannerStored: d.bannerStored ?? 0,
    commandReady: !!d.commandReady,
    inscribedId: d.inscribedId ?? null,
    jobMatrix: d.jobMatrix ?? {},
    activeMerc: d.activeMerc ?? 'hound',
    mercBestFloor: d.mercBestFloor ?? 1,
    legendsSeen: d.legendsSeen ?? [],
    zealStacks: d.zealStacks ?? 0,
    combo: d.combo ?? 0,
    valiantStacks: d.valiantStacks ?? 0,
    destinyPath: d.destinyPath ?? null,
    destinyNodes: d.destinyNodes ?? [],
    destinyPoints: d.destinyPoints ?? 0,
    destinyEarned: d.destinyEarned ?? 0,
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
