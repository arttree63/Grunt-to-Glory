/**
 * 破盾值模擬(GDD v3 § 5.4 / § 11.4 的 P0-A 必做項)。
 *
 * 目的有三:
 *   1. **反推每秒上限**:規則是「使一般配置落在上限的 50~60%」。上限太低,
 *      分身流會與燃燒流撞到同一道天花板,「分身讓拆盾更快」就永遠驗不出來
 *   2. **驗證構築差異**:分身/砲台/燃燒/傭兵各自對拆盾的貢獻要真的不同
 *   3. **三職業代理**(§ 12.1 第 9 項):斥候=高事件數 / 重裝=中 / 法警=低事件數高單擊,
 *      效率差須落在 10~20% 帶內——證明護盾不是一道職業牆
 *
 * 用法:npm run sim:shield
 *
 * ⚠️ 等級必須**自動校準**,不可寫死:第一版寫 Lv.120 @ 70 層,一擊就把 Boss 秒了,
 * 量到的全是雜訊(法警顯示 0 點破盾值,其實是 Boss 在它出手前就死了)。
 * 現在先二分搜出「打得完但要花 ~20 秒」的等級,才有拆盾過程可量。
 *
 * ⚠️ 兩個指標分開看:
 *   拆盾階段效率(診斷用)——分身/軍旗天生就是多一個攻擊者,差距必然大
 *   整場擊破時間(§ 3.5 適性驗收的 10~25%)——護盾只是全場的一部分,這才是驗收標準
 */
import * as B from '../../src/core/balance'
import {
  applyTick,
  availableSkills,
  castSkill,
  createInitialState,
  promote,
  setActiveMerc,
  sigilCap,
  skillReady,
  spawnEnemy,
  toggleAutoCast,
  chooseDestiny,
  pickDestinyNode,
} from '../../src/core/game'
import { pendingChoice } from '../../src/core/destiny'
import { SKILLS } from '../../src/core/skills'
import { SLOTS } from '../../src/core/equipment'
import type { Equipment, GameState, JobId, LegendId, MercId } from '../../src/core/types'

const STEP_MS = 1000 / B.TICK_HZ
const SEEDS = [20260729, 12345, 777]
/** 拆盾型 Boss 在 X10 */
const SHELL_FLOOR = 70
/** 校準目標:整場擊破約 20 秒(在 30 秒限時內,但留得下拆盾過程) */
const TARGET_TTK = 20

function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Build {
  name: string
  job: JobId
  legend?: LegendId
  legendSlot?: keyof GameState['equipped']
  base?: 'swift' | 'heavy' | 'guard' | 'focus'
  merc?: MercId
}

/** 一般配置 = 沒有任何拆盾特化,用來反推「50~60%」的基準 */
const BUILDS: Build[] = [
  { name: '一般配置(斥候)', job: 'scout' },
  { name: '一般配置(重裝)', job: 'infantry' },
  { name: '一般配置(法警)', job: 'marshal' },
  { name: '分身流(雙生影刃)', job: 'scout', legend: 'twinblade', legendSlot: 'weapon', base: 'swift' },
  { name: '軍旗流(熔火軍旗)', job: 'infantry', legend: 'bannerflag', legendSlot: 'weapon', base: 'heavy' },
  { name: '燃燒流(裁決餘燼)', job: 'marshal', legend: 'ember', legendSlot: 'body', base: 'focus' },
  { name: '砲台流(工兵傭兵)', job: 'scout', merc: 'sapper' },
  { name: '背刺流(盜賊傭兵)', job: 'scout', merc: 'rogue' },
]

function gear(s: GameState, b: Build) {
  for (const sl of SLOTS) {
    const e: Equipment = {
      id: `f-${sl}`,
      slot: sl,
      quality: 'gold',
      base: b.base && sl === b.legendSlot ? b.base : 'guard',
      affixes: [{ type: 'dmg', value: 0.12 }],
    }
    if (b.legend && sl === b.legendSlot) e.legend = b.legend
    s.equipped[sl] = e
  }
}

interface Result {
  /** 拆盾階段:破盾值/秒 */
  vps: number
  peak: number
  /** 拆完護盾花幾秒 */
  shellSec: number
  /** 整場擊破花幾秒(未擊破 = 30) */
  killSec: number
  bySource: Record<string, number>
}

function setup(seed: number, b: Build, lv: number) {
  const rng = makeRng(seed)
  const s = createInitialState()
  chooseDestiny(s, 'tactician')
  s.lv = lv
  s.mercBestFloor = 200
  promote(s, b.job)
  setActiveMerc(s, b.merc ?? null, rng)
  toggleAutoCast(s)
  s.floor = SHELL_FLOOR
  s.highestFloor = SHELL_FLOOR
  gear(s, b)
  spawnEnemy(s)
  return { s, rng }
}

function run(seed: number, b: Build, lv: number): Result {
  const { s, rng } = setup(seed, b, lv)
  let ms = 0
  let sec = 0
  let shellSec = 0
  let killSec = 0
  let totalValue = 0
  let peak = 0
  let bySource: Record<string, number> = {}

  while (ms < B.BOSS_TIME * 1000) {
    sec += STEP_MS
    if (sec >= 1000) {
      sec = 0
      gear(s, b)
      const c = pendingChoice(s)
      if (c) pickDestinyNode(s, c[0].id)
      for (const id of availableSkills(s)) {
        const sk = SKILLS[id]
        if (sk.consumesSigils && s.sigils < sigilCap(s)) continue
        if (skillReady(s, id)) castSkill(s, id, true, rng) // auto:代理=掛機基準,不吃完美引爆獎勵
      }
    }
    const shellBefore = s.shellLeft
    if (s.bossStats) {
      totalValue = s.bossStats.shieldValue
      peak = Math.max(peak, s.bossStats.shieldPeakPerSec)
      bySource = { ...s.bossStats.shieldBySource }
    }
    applyTick(s, STEP_MS, rng)
    ms += STEP_MS
    if (shellBefore > 0 && s.shellLeft === 0 && shellSec === 0) shellSec = ms / 1000
    // 擊破:floor **前進**才代表 Boss 死了。
    // ⚠️ 不能寫 !== :失敗會讓 floor 退一層(game.ts 的 checkBossTimeout),
    // 那樣會把「打輸」記成「擊破」並寫進 killSec,量出來的是假數據。
    if (s.floor > SHELL_FLOOR) {
      killSec = ms / 1000
      break
    }
  }

  const shellPhase = shellSec || ms / 1000
  return {
    vps: totalValue / Math.max(0.1, shellPhase),
    peak,
    shellSec: shellPhase,
    killSec: killSec || B.BOSS_TIME,
    bySource,
  }
}

/** 二分搜「整場約 TARGET_TTK 秒」的等級——不校準的話量到的是秒殺雜訊 */
function calibrateLv(b: Build): number {
  let lo = 20
  let hi = 400
  for (let i = 0; i < 12; i++) {
    const mid = Math.floor((lo + hi) / 2)
    const kill = avg(SEEDS.map((sd) => run(sd, b, mid).killSec))
    if (kill > TARGET_TTK) lo = mid
    else hi = mid
  }
  return hi
}

function avg(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

const CALIB_BUILD = BUILDS[0]
const LV = calibrateLv(CALIB_BUILD)

console.log(`破盾值模擬:${SHELL_FLOOR} 層拆盾 Boss、自動施放開、${SEEDS.length} 種子`)
console.log(`等級自動校準至 Lv.${LV}(讓「${CALIB_BUILD.name}」整場約 ${TARGET_TTK}s 擊破)`)
console.log(`護盾 ${B.SHELL_HITS} 層 × ${B.SHIELD_VALUE_PER_LAYER} 點;命中 ${B.SHIELD_HIT_VALUE} 點 / 狀態 tick ${B.SHIELD_TICK_VALUE} 點`)
console.log(`每秒上限 ${B.SHIELD_VALUE_PER_SEC_CAP} 點\n`)
console.log('構築                 | 破盾值/秒 | 佔上限 | 峰值 | 拆盾(秒) | 擊破(秒) | 主要來源')

const results: Array<{ b: Build; r: Result }> = []
for (const b of BUILDS) {
  const rs = SEEDS.map((sd) => run(sd, b, LV))
  const merged: Record<string, number> = {}
  for (const x of rs) for (const [k, v] of Object.entries(x.bySource)) merged[k] = (merged[k] ?? 0) + v
  const total = Object.values(merged).reduce((a, c) => a + c, 0)
  const r: Result = {
    vps: avg(rs.map((x) => x.vps)),
    peak: Math.max(...rs.map((x) => x.peak)),
    shellSec: avg(rs.map((x) => x.shellSec)),
    killSec: avg(rs.map((x) => x.killSec)),
    bySource: merged,
  }
  results.push({ b, r })
  const top = Object.entries(merged)
    .sort((a, c) => c[1] - a[1])
    .slice(0, 2)
    .map(([k, v]) => `${k} ${Math.round((v / Math.max(1, total)) * 100)}%`)
    .join(' / ')
  console.log(
    `${b.name.padEnd(20)}| ${r.vps.toFixed(1).padStart(9)} | ${((r.vps / B.SHIELD_VALUE_PER_SEC_CAP) * 100).toFixed(0).padStart(5)}% | ${r.peak.toFixed(0).padStart(4)} | ${r.shellSec.toFixed(1).padStart(8)} | ${r.killSec.toFixed(1).padStart(8)} | ${top}`,
  )
}

const normal = results.filter((x) => x.b.name.startsWith('一般配置'))
const normalVps = avg(normal.map((x) => x.r.vps))
const ratio = normalVps / B.SHIELD_VALUE_PER_SEC_CAP
console.log(`\n【每秒上限反推】一般配置平均 ${normalVps.toFixed(1)} 點/秒 = 上限的 ${(ratio * 100).toFixed(0)}%`)
if (ratio < 0.5 || ratio > 0.6) {
  console.log(`⚠️ 不在 50~60%。建議 SHIELD_VALUE_PER_SEC_CAP = ${(normalVps / 0.55).toFixed(0)}`)
} else {
  console.log('✅ 落在 50~60%(留出讓多段/分身構築真正受益的空間)')
}

// ⚠️ 三職業代理要比「拆盾階段」——整場擊破時間包含職業本身的 DPS 差
// (法警是金幣職業,傷害本來就低),那屬 § 5.6 的職業平衡,不是護盾機制的鍋
const jobShell = normal.map((x) => ({ job: x.b.name.slice(5, 7), sec: x.r.shellSec })).sort((a, b) => a.sec - b.sec)
const shellSpread = (jobShell[jobShell.length - 1].sec / jobShell[0].sec - 1) * 100
console.log(`\n【三職業代理・拆盾機制】${jobShell.map((x) => `${x.job} ${x.sec.toFixed(1)}s`).join(' / ')} → 差 ${shellSpread.toFixed(0)}%`)
console.log(shellSpread <= 20 ? '✅ 護盾不是職業牆(§ 12.1 第 9 項)' : '⚠️ 護盾偏向某職業')

const jobKill = normal.map((x) => ({ job: x.b.name.slice(5, 7), sec: x.r.killSec })).sort((a, b) => a.sec - b.sec)
const killSpread = (jobKill[jobKill.length - 1].sec / jobKill[0].sec - 1) * 100
console.log(`【三職業・整場擊破】${jobKill.map((x) => `${x.job} ${x.sec.toFixed(1)}s`).join(' / ')} → 差 ${killSpread.toFixed(0)}%`)
console.log(
  killSpread <= 20
    ? '✅ 在 § 5.6 的 10~20% 帶內'
    : `⚠️ 超出 § 5.6 的 20%——屬**職業基礎 DPS 差**(法警靠金幣不靠傷害),需企劃裁決是否調整職業被動`,
)

console.log('\n【適性驗收】特化 vs 同職業一般配置(§ 3.5 標準:整場效率 +10~25%)')
for (const spec of results.filter((x) => !x.b.name.startsWith('一般配置'))) {
  const base = normal.find((n) => n.b.job === spec.b.job)
  if (!base) continue
  const shellGain = (base.r.shellSec / spec.r.shellSec - 1) * 100
  const killGain = (base.r.killSec / spec.r.killSec - 1) * 100
  const ok = killGain >= 10 && killGain <= 25
  console.log(
    `  ${spec.b.name.padEnd(20)} 拆盾 ${shellGain >= 0 ? '+' : ''}${shellGain.toFixed(0)}% → 整場 ${killGain >= 0 ? '+' : ''}${killGain.toFixed(0)}%  ${ok ? 'OK' : killGain < 10 ? '⚠️ 提升不足' : '⚠️ 過強'}`,
  )
}
