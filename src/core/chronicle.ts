import { DESTINY_PATHS } from './destiny'
import { QUALITY_NAME, SLOT_NAME } from './equipment'
import { JOBS } from './jobs'
import type { ChronicleEntry, Equipment, GameState } from './types'

/** 小兵的名字。無名雜兵在留下紀錄的那一刻才有名字 */
const NAMES = [
  '洛恩', '賈爾', '米卡', '席德', '溫特', '柯爾', '奈德', '巴爾特', '瑞恩', '多倫',
  '費格', '亞蘭', '崔佛', '瓦德', '格倫', '諾曼', '艾德', '希恩', '莫里', '藍斯',
]

/**
 * 結局文字。
 * ⚠️ 遊戲沒有玩家 HP,小兵不會「被打死」。
 * 只能用:未能突破 / 戰線潰散 / 時限耗盡 / 遠征止步於 / 未能阻止。
 */
function epitaphFor(s: GameState): string {
  if (s.bossRetryFloor !== null) {
    return `最終未能在時限內擊破第 ${s.bossRetryFloor} 層的守關者`
  }
  if (s.highestFloor >= 100) return `遠征止步於第 ${s.highestFloor} 層,戰線在此潰散`
  return `遠征止步於第 ${s.highestFloor} 層`
}

function jobPathOf(s: GameState): string {
  const job = JOBS[s.jobId]
  if (!job.from) return job.name
  const from = JOBS[job.from]
  return from.from ? `${JOBS[from.from].name} → ${from.name} → ${job.name}` : `${from.name} → ${job.name}`
}

const itemName = (e: Equipment) => `${QUALITY_NAME[e.quality]}${SLOT_NAME[e.slot]}`

/** 為這一代生成列傳。在 prestige 當下呼叫 */
export function makeChronicleEntry(
  s: GameState,
  medalsGained: number,
  heirloom: Equipment | null,
): ChronicleEntry {
  return {
    gen: s.runs + 1,
    name: NAMES[(s.runs + 1) % NAMES.length],
    jobPath: jobPathOf(s),
    destiny: s.destinyPath ? DESTINY_PATHS[s.destinyPath].name : null,
    floor: s.highestFloor,
    heirloom: heirloom ? itemName(heirloom) : null,
    epitaph: epitaphFor(s),
    medalsGained,
    forgeGained: s.forgeCount - s.runStart.forgeCount,
    codexGained: s.codex.length - s.runStart.codexCount,
  }
}
