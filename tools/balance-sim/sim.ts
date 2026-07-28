/**
 * headless 數值模擬 — 直接驅動真實遊戲迴圈(createInitialState + applyTick),
 * 不自己算積分。模擬與遊戲因此不可能漂移。
 * 用法:npm run sim
 * 調常數後必須重跑,結果貼回 .claude/skills/game-balance/SKILL.md 第七節。
 */
import * as B from '../../src/core/balance'
import { bossHP, mobHP } from '../../src/core/formulas'
import {
  applyTick,
  buyMaxLevels,
  buyTech,
  createInitialState,
  equip,
  forge,
  pendingMedals,
  salvage,
} from '../../src/core/game'
import { canBuyTech, emptyTechs, techDamageMult, techGoldMult } from '../../src/core/techs'
import type { Techs } from '../../src/core/types'
import { equipPower, QUALITY_NAME, score, SLOTS } from '../../src/core/equipment'
import { D, Decimal } from '../../src/core/decimal'

/**
 * 固定種子亂數:鍛造有隨機性,不固定種子的話雜訊會蓋掉調整常數的效果,
 * 兩次跑的結果無法比較。要看不同運氣下的分佈就改 SEED。
 */
const SEED = 20260729
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 停滯判定:一個 10 層區塊耗時超過此分鐘數,視為撞牆、玩家轉生 */
const STALL_MIN = 12
const STEP_MS = 1000 / B.TICK_HZ
/** 玩家多久檢查一次升級(每秒,貼近真實操作) */
const BUY_EVERY_MS = 1000

/**
 * 勳章花用策略:傷害與金幣輪流買(兩個乘區都要成長),
 * 開局資金與離線上限用零頭補。真人不會這麼平均,但足以檢驗曲線。
 */
function spendMedals(s: ReturnType<typeof createInitialState>) {
  const order: Array<'valor' | 'supply' | 'legacy' | 'camp'> = ['valor', 'supply', 'valor', 'supply', 'legacy', 'camp']
  let bought = true
  while (bought) {
    bought = false
    for (const id of order) {
      if (canBuyTech(s.techs, s.medals, id)) {
        buyTech(s, id)
        bought = true
      }
    }
  }
}

interface RunResult {
  floor: number
  minutes: number
  lv: number
  medals: number
  pace: Array<[number, number]>
  lvMarks: Record<number, number>
  gear: string
  gearMult: number
  techs: Techs
  medalsLeft: number
}

/** active = 玩家持續點擊(戰意滿),否則純掛機 */
function run(medals: number, techs: Techs, active = false, capMinutes = 180, rng = makeRng(SEED)): RunResult {
  const s = createInitialState(medals, 0, techs)
  spendMedals(s)
  let ms = 0
  let buyAcc = 0
  let lastBlockMs = 0
  let nextMark = 10
  const pace: Array<[number, number]> = []
  const lvMarks: Record<number, number> = {}
  const MARKS = [20, 50, 100]

  while (ms < capMinutes * 60_000) {
    buyAcc += STEP_MS
    if (buyAcc >= BUY_EVERY_MS) {
      buyAcc = 0

      // 玩家行為:素材夠就開錘,比身上好就換,否則分解
      while (s.materials >= B.FORGE_COST) {
        const e = forge(s, rng)
        if (!e) break
        const cur = s.equipped[e.slot]
        if (!cur || score(e) > score(cur)) equip(s, e.id)
        else salvage(s, e.id)
      }

      const before = s.lv
      buyMaxLevels(s)
      if (s.lv !== before) {
        for (const m of MARKS) {
          if (lvMarks[m] === undefined && s.lv >= m) lvMarks[m] = +(ms / 60_000).toFixed(1)
        }
      }
    }
    if (active) s.morale = B.MORALE_MAX

    applyTick(s, STEP_MS)
    ms += STEP_MS

    if (s.floor > nextMark) {
      pace.push([nextMark, +(ms / 60_000).toFixed(1)])
      if (ms - lastBlockMs > STALL_MIN * 60_000) break
      lastBlockMs = ms
      nextMark += 10
    }
  }

  return {
    floor: s.highestFloor,
    minutes: ms / 60_000,
    lv: s.lv,
    medals: medals + pendingMedals(s),
    pace,
    lvMarks,
    techs: { ...s.techs },
    medalsLeft: s.medals,
    gear: SLOTS.map((sl) => (s.equipped[sl] ? QUALITY_NAME[s.equipped[sl]!.quality] : '空')).join('/'),
    gearMult: equipPower(s.equipped),
  }
}

function table(label: string, active: boolean) {
  console.log(`\n${label}`)
  console.log('輪次 | 極限層數 | 增幅  | 耗時(分) | 等級 | 科技')
  let m = 0
  let techs = emptyTechs()
  let first: RunResult | null = null
  let prevFloor = 0
  const rng = makeRng(SEED) // 整條轉生鏈共用一個序列
  for (let i = 1; i <= 6; i++) {
    const r = run(m, techs, active, 180, rng)
    if (!first) first = r
    const delta = prevFloor ? `+${r.floor - prevFloor}` : '-'
    console.log(
      ` ${String(i).padEnd(3)}|   ${String(r.floor).padEnd(7)}| ${delta.padEnd(6)}|  ${r.minutes.toFixed(0).padEnd(7)}| ${String(r.lv).padEnd(4)}| 傷害×${techDamageMult(r.techs).toFixed(1)} 金幣×${techGoldMult(r.techs).toFixed(1)}`,
    )
    prevFloor = r.floor
    m = r.medals
    techs = r.techs
  }
  console.log('首輪節奏:', first!.pace.map(([f, min]) => `${f}層 ${min}分`).join(' / '))
  console.log('首輪畢業裝:', first!.gear, `(裝備乘區 ×${first!.gearMult.toFixed(2)})`)
  console.log('首輪轉職里程碑(等級→分鐘):', JSON.stringify(first!.lvMarks))
}

table('【純掛機】不點擊,戰意 0', false)
table('【積極點擊】戰意維持滿檔 (+40% DPS)', true)

console.log('\nBoss HP 抽樣:')
for (const f of [10, 30, 50, 70, 100]) {
  console.log(`  ${f} 層 = ${bossHP(f).toExponential(2)}(小怪 ${mobHP(f).toExponential(2)})`)
}
console.log(
  '\n新手斜坡:30 層 HP =',
  mobHP(30).toFixed(0),
  '/ 無斜坡則為',
  D(10).mul(Decimal.pow(1.16, 29)).toFixed(0),
)
