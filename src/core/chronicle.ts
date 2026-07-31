import { DESTINY_PATHS } from './destiny'
import { isBossFloor } from './formulas'
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
    // ⚠️ 失敗有兩種形態(v4.1):輸出不夠(逾時)與擋不住(耐久歸零)。
    // 一律寫「未能在時限內擊破守關者」的話,被打死的那些代會被寫成謊話,
    // 而且非 Boss 層根本沒有守關者
    const byEndurance = s.lastBossStats?.failedBy === 'endurance'
    if (byEndurance) return `最終戰線潰散於第 ${s.bossRetryFloor} 層`
    if (!isBossFloor(s.bossRetryFloor)) return `最終止步於第 ${s.bossRetryFloor} 層`
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

/** 這一代小兵的名字(轉生時列傳與傳家之器都要用同一個) */
export function soldierName(s: GameState): string {
  return NAMES[(s.runs + 1) % NAMES.length]
}

/**
 * 人格稱號輕量版(關聯感串接):行為計數 → 稱號。
 * 沒有鮮明行為就 null——稱號要稀罕才有意義,不硬發。
 */
export function titleFor(s: GameState): string | null {
  const r = s.runStats
  if (r.lateBossKills >= 2) return '遲來的勝者'
  // 技能已解鎖(轉職後)卻整輪一次都沒放
  if (r.skillCasts === 0 && JOBS[s.jobId].tier >= 1) return '沉默的守望者'
  // 四分之一以上的最後一擊由傭兵補刀
  if (r.kills >= 100 && r.mercKills / r.kills >= 0.25) return '眾人簇擁者'
  return null
}

/** 為這一代生成列傳。在 prestige 當下呼叫 */
export function makeChronicleEntry(
  s: GameState,
  medalsGained: number,
  heirloom: Equipment | null,
): ChronicleEntry {
  return {
    gen: s.runs + 1,
    name: soldierName(s),
    jobPath: jobPathOf(s),
    destiny: s.destinyPath ? DESTINY_PATHS[s.destinyPath].name : null,
    floor: s.highestFloor,
    heirloom: heirloom ? itemName(heirloom) : null,
    epitaph: epitaphFor(s),
    medalsGained,
    forgeGained: s.forgeCount - s.runStart.forgeCount,
    codexGained: s.codex.length - s.runStart.codexCount,
    title: titleFor(s),
    highlight: s.runHighlight,
  }
}
