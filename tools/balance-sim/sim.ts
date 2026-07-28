/**
 * headless 數值模擬 — 直接引用 /core/formulas,確保模擬與遊戲同一份公式。
 * 用法:npm run sim
 * 調整常數後必須重跑,結果貼回 skills/game-balance_SKILL.md 第七節。
 */
import { D, Decimal } from '../../src/core/decimal'
import * as B from '../../src/core/balance'
import { affordableLevels, bossHP, goldDrop, heroDPS, isBossFloor, mobHP, upCost } from '../../src/core/formulas'

/** 停滯判定:一個 10 層區塊耗時超過此分鐘數,視為撞牆、玩家轉生 */
const STALL_MIN = 12

interface RunResult {
  floor: number
  minutes: number
  lv: number
  medals: number
  pace: Array<[number, number]> // [層數, 分鐘]
  lvMarks: Record<number, number> // 等級里程碑 → 分鐘
}

function run(medals: number, capMinutes = 120): RunResult {
  let lv = 1
  let gold = D(B.MEDAL_START_GOLD).mul(medals)
  let floor = 1
  let t = 0 // 秒
  const goldMult = medals === 0 ? 1 + B.ROOKIE_BLESSING_GOLD : 1 // 新兵祝福:首輪限定
  const pace: Array<[number, number]> = []
  let stuck = 0
  let lastBlockT = 0 // 上一個 10 層區塊的完成時間,用來判定停滯

  const lvMarks: Record<number, number> = {}
  const MARKS = [20, 50, 100]
  const buy = () => {
    const n = affordableLevels(lv, gold)
    for (let i = 0; i < n; i++) {
      gold = gold.sub(upCost(lv))
      lv++
      for (const m of MARKS) if (lv === m && lvMarks[m] === undefined) lvMarks[m] = +(t / 60).toFixed(1)
    }
  }

  while (t < capMinutes * 60) {
    buy()
    const dps = heroDPS({ lv, medals })

    if (isBossFloor(floor)) {
      const need = bossHP(floor)
      if (need.div(dps).toNumber() > B.BOSS_TIME) {
        // 撞牆:farm 該層小怪換金幣再試
        const mob = mobHP(floor)
        t += mob.mul(B.MOBS_PER_FLOOR).div(dps).toNumber() + 2
        gold = gold.add(goldDrop(floor).mul(B.MOBS_PER_FLOOR).mul(goldMult))
        stuck++
        // 再 farm 40 級也過不了 → 判定極限
        if (need.div(heroDPS({ lv: lv + 40, medals })).toNumber() > B.BOSS_TIME) break
        if (stuck > 400) break
        continue
      }
      stuck = 0
      t += need.div(dps).toNumber()
      gold = gold.add(goldDrop(floor).mul(B.BOSS_GOLD_MULT).mul(goldMult))
    } else {
      t += mobHP(floor).mul(B.MOBS_PER_FLOOR).div(dps).toNumber() + 2
      gold = gold.add(goldDrop(floor).mul(B.MOBS_PER_FLOOR).mul(goldMult))
    }

    if (floor % 10 === 0) {
      pace.push([floor, +(t / 60).toFixed(1)])
      // 玩家心理極限:推進 10 層已需 STALL_MIN 分鐘以上 → 選擇轉生
      if ((t - lastBlockT) / 60 > STALL_MIN) break
      lastBlockT = t
    }
    floor++
  }

  return { floor, minutes: t / 60, lv, medals: medals + Math.floor(floor / 10), pace, lvMarks }
}

function main() {
  console.log('輪次 | 極限層數 | 耗時(分) | 等級 | 累積勳章')
  let m = 0
  let first: RunResult | null = null
  for (let i = 1; i <= 5; i++) {
    const r = run(m)
    if (!first) first = r
    console.log(
      ` ${String(i).padEnd(3)}|   ${String(r.floor).padEnd(7)}|  ${r.minutes.toFixed(0).padEnd(7)}| ${String(r.lv).padEnd(4)}| ${r.medals}`,
    )
    m = r.medals
  }
  console.log('\n首輪轉職里程碑(等級 → 分鐘):', JSON.stringify(first!.lvMarks))
  console.log('\n首輪節奏(層 → 分鐘):')
  console.log(first!.pace.map(([f, min]) => `${f}層 ${min}分`).join(' / '))

  // DPS check 抽樣:確認 Boss 檢定不會不可能
  console.log('\nBoss 檢定抽樣(該層無裝備、剛好買滿等級時的餘裕):')
  for (const f of [10, 30, 50, 70, 100]) {
    const need = bossHP(f)
    console.log(`  ${f} 層 Boss HP = ${need.toExponential(2)}`)
  }
  console.log('\n新手斜坡效果:30 層 HP =', mobHP(30).toFixed(0), '/ 無斜坡則為', D(10).mul(Decimal.pow(1.16, 29)).toFixed(0))
}

main()
