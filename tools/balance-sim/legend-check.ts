/**
 * power-neutral 檢核(裝備規範 § 四):每件傳說上線前跑「有 vs 無」對照,
 * 淨輸出差異必須落在 ±10% 內。差異要來自「怎麼打」,不是「打多少」。
 *
 * 用法:npm run sim:legend
 *
 * ⚠️ 量的是**總傷害輸出**,不是層數。
 * 層數同時受金幣→升級驅動,幾層之差換算不回輸出差(第一版這樣寫,量出 ±50% 的假差距)。
 * 這裡固定等級與裝備、不買升級,把擊殺掉的血量加起來,那才是「打多少」。
 * ⚠️ 也不可以用「每 tick 的 enemyHp 差」來加總:單 tick 內可能連殺數十隻,
 * 只取 tick 前後的血量會把中間整批漏掉,爆發型傳說會被誤判成 −33%(第二版踩過)。
 * ⚠️ 更不可以讓層數自由推進:過不過一個 Boss 會讓後續怪物 HP 差好幾倍,
 * 量到的是「走多遠」不是「打多少」,結果會量化成階梯(第三版踩過:同一個機制
 * 調 0.5 與 0.35 得到完全一樣的數字,因為兩者卡在同一個 Boss)。
 * 現在固定層數跑兩個場景:清怪輸出(非 Boss 層)與 Boss 檢定輸出(30 秒視窗)。
 * ⚠️ 超標時優先削數值不要移除機制——機制是那件傳說存在的理由。
 */
import * as B from '../../src/core/balance'
import {
  applyTick,
  availableSkills,
  castSkill,
  click,
  createInitialState,
  sigilCap,
  skillReady,
  promote,
  spawnEnemy,
  chooseDestiny,
  pickDestinyNode,
} from '../../src/core/game'
import { pendingChoice } from '../../src/core/destiny'
import { ALL_LEGENDS } from '../../src/core/legends'
import { ALL_SETS } from '../../src/core/sets'
import { SKILLS } from '../../src/core/skills'
import { SLOTS } from '../../src/core/equipment'
import { bossHP, mobHP } from '../../src/core/formulas'
import { D, Decimal } from '../../src/core/decimal'
import type { Equipment, GameState, JobId, LegendId, SetTagId, Slot } from '../../src/core/types'

const STEP_MS = 1000 / B.TICK_HZ
const MINUTES = 10
const SEEDS = [20260729, 12345, 777]
/** 只跑名稱含這個字串的項目,調校時用:ONLY=沙漏 npm run sim:legend */
const ONLY = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env?.ONLY ?? ''
/** 固定等級與層數:代理玩家不升級、層數釘死,輸出只由裝備決定 */
const FIXED_LV = 150
/**
 * 清怪場景用非 Boss 層;Boss 場景用「打不死的牆」——
 * 第 100 層 Boss HP 9e7,Lv.150 最大單發(聖光審判 ≈ 6e7)打不穿,30 秒也磨不死。
 * ⚠️ Boss 選太低會一擊秒殺:過量傷害封頂後,「一次大擊」與「分期結算」的量測就不公平
 * (燃燒每 tick 都在封頂內全額計入,大擊被砍頭 → 延遲型被誤判 +49%,第五版踩過)。
 */
const FARM_FLOOR = 63
/**
 * ⚠️ 牆要真的打不死:第 100 層(9e7)會被滿層印記引爆(≈7e7)+ 普攻偶爾擊破,
 * 一旦有擊殺就進入「擊殺→視窗回補印記→更多引爆」的混沌回饋,微小時序差被放大成 ±13%
 * (第六版踩過:倒轉沙漏明明沒觸發任何效果,量出 −12.6%)。
 * 第 110 層 Boss ≈ 4e8,一切都打不穿 → 完全確定性,無擊殺回饋。
 * 代價:印記迴圈在牆上測不到(沒擊殺就沒印記),那部分由清怪場景覆蓋。
 */
const BOSS_FLOOR = 110

function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function baseOf(legend: LegendId | null) {
  return legend ? ALL_LEGENDS.find((l) => l.id === legend)!.base : 'guard'
}

/** 固定裝:五件同規格傳奇,只有指定那件掛不掛傳說(或前三件掛不掛套裝標籤)有差 */
function gearUp(
  s: GameState,
  legend: LegendId | null,
  slot: Slot,
  setTag: SetTagId | null = null,
  baseFor: LegendId | null = null,
) {
  SLOTS.forEach((sl, i) => {
    const e: Equipment = {
      id: `fixed-${sl}`,
      slot: sl,
      quality: 'gold',
      // 對照組也穿受測傳說的基底:量傳說差,不是基底差
      base: sl === slot ? baseOf(baseFor ?? legend) : 'guard',
      affixes: [{ type: 'dmg', value: 0.12 }],
    }
    if (sl === slot && legend) e.legend = legend
    if (setTag && i < 3) e.setTag = setTag
    s.equipped[sl] = e
  })
}

/** 回傳這段時間打掉的總血量。mode='farm' 清小怪、mode='boss' 反覆打同一層 Boss */
function run(
  seed: number,
  legend: LegendId | null,
  slot: Slot,
  job: JobId,
  active: boolean,
  setTag: SetTagId | null = null,
  mode: 'farm' | 'boss' = 'farm',
  baseFor: LegendId | null = null,
): Decimal {
  const rng = makeRng(seed)
  const floor = mode === 'boss' ? BOSS_FLOOR : FARM_FLOOR
  const s = createInitialState()
  chooseDestiny(s, 'tactician')
  s.lv = FIXED_LV
  s.floor = floor
  s.highestFloor = floor
  // 二轉職業要先經過一轉(promote 會檢查 from);走「順序」的效果需要三招才測得到
  if (job === 'paladin') promote(s, 'infantry')
  else if (job === 'shadow') promote(s, 'scout')
  else if (job === 'archmage') promote(s, 'marshal')
  promote(s, job)
  gearUp(s, legend, slot, setTag, baseFor)
  spawnEnemy(s)

  let dealt = D(0)
  let ms = 0
  let secAcc = 0
  let clickAcc = 0
  let prev = s.enemyHp

  while (ms < MINUTES * 60_000) {
    secAcc += STEP_MS
    if (secAcc >= 1000) {
      secAcc = 0
      gearUp(s, legend, slot, setTag, baseFor) // 每秒重掛,確保沒有任何路徑換掉對照組的裝備
      const choice = pendingChoice(s)
      if (choice) pickDestinyNode(s, choice[0].id)
      for (const id of availableSkills(s)) {
        const sk = SKILLS[id]
        if (sk.consumesSigils && s.sigils < sigilCap(s)) continue
        if (skillReady(s, id)) castSkill(s, id)
      }
    }
    if (active) {
      clickAcc += 3 * (STEP_MS / 1000)
      while (clickAcc >= 1) {
        clickAcc -= 1
        click(s, rng)
      }
    }

    for (const ev of applyTick(s, STEP_MS, rng)) {
      // 清怪場景用擊殺事件累加(單 tick 可能連殺很多隻)
      if (mode === 'farm' && ev.type === 'kill') dealt = dealt.add(mobHP(floor).mul(ev.count ?? 1))
      else if (mode === 'boss' && ev.type === 'bossKill') dealt = dealt.add(bossHP(floor))
    }
    // Boss 場景:血量差**以剩餘血量封頂**——過量傷害不是輸出,不封頂全是雜訊
    if (mode === 'boss') {
      if (s.enemyHp.lt(prev)) {
        const diff = prev.sub(s.enemyHp)
        dealt = dealt.add(diff.gt(prev) ? prev : diff)
      }
      prev = s.enemyHp
    }
    // 層數釘死:打贏或打輸都拉回同一層重來,免得後續怪物 HP 差好幾倍
    if (s.floor !== floor) {
      s.floor = floor
      s.killsInFloor = 0
      s.bossFailed = false
      s.bossRetryFloor = null
      spawnEnemy(s)
      prev = s.enemyHp
    }
    ms += STEP_MS
  }
  return dealt
}

function avg(xs: Decimal[]): Decimal {
  return xs.reduce((a, b) => a.add(b), D(0)).div(xs.length)
}

console.log(`power-neutral 檢核:${MINUTES} 分鐘 × ${SEEDS.length} 種子,固定 Lv.${FIXED_LV}、層數釘死`)
console.log('項目           | 清怪(參考) | Boss 淨差 | 判定')
/**
 * 判定以 Boss(牆)為準——那是本作真正的 DPS 檢定。
 * 清怪場景的擊殺計帳對「把一次大擊改成分期」的傳說有已知偏差
 * (單 tick 連殺鏈會跨層計價),列為參考值,寫在這裡免得下次又想拿它當判準。
 */

let worst = 0
function report(name: string, run1: (mode: 'farm' | 'boss') => number) {
  if (ONLY && !name.includes(ONLY)) return
  const farm = run1('farm')
  const boss = run1('boss')
  const dev = Math.abs(boss)
  worst = Math.max(worst, dev)
  console.log(
    `${name.padEnd(13)}| ${(farm * 100).toFixed(1).padStart(7)}% | ${(boss * 100).toFixed(1).padStart(8)}% | ${dev <= 0.1 ? 'OK' : '⚠️ 超標(±10%)'}`,
  )
}

for (const l of ALL_LEGENDS) {
  // 職業核心傳說用它綁的職業跑;通用傳說用聖騎士(三招都有,走「順序」的效果才測得到)
  const job: JobId = (l.jobs?.[0] as JobId) ?? 'paladin'
  // 失落軍旗改的是點擊爆發,只有積極玩家量得到
  const active = l.id === 'lostbanner'
  report(l.name, (mode) => {
    const off = avg(SEEDS.map((sd) => run(sd, null, l.slot, job, active, null, mode, l.id)))
    const on = avg(SEEDS.map((sd) => run(sd, l.id, l.slot, job, active, null, mode, l.id)))
    return on.div(off).toNumber() - 1
  })
}

for (const st of ALL_SETS) {
  report(`${st.name} 3 件`, (mode) => {
    const off = avg(SEEDS.map((sd) => run(sd, null, 'body', 'paladin', false, null, mode)))
    const on = avg(SEEDS.map((sd) => run(sd, null, 'body', 'paladin', false, st.id, mode)))
    return on.div(off).toNumber() - 1
  })
}

console.log(`\n最大偏離:${(worst * 100).toFixed(1)}%(上限 10%)`)
