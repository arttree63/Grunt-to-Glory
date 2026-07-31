/**
 * 生存檢定的驗算:在「剛好過得了 DPS 檢定」的功力下,耐久撐不撐得住?
 * 兩條檢定不該互相污染——這支就是用來確認生存軸沒有默默變成第二道 DPS 牆。
 * 用法:npx tsx tools/balance-sim/endurance-check.ts
 */
import { createInitialState, spawnEnemy, enduranceMax, threatPerSec, currentDPS } from '../../src/core/game'
import { mobHP, bossHP } from '../../src/core/formulas'
import * as B from '../../src/core/balance'

console.log('層 | 剛好過檢定的等級 | Boss 場可撐(秒) | 小怪場可撐(秒)')
for (const floor of [10, 30, 50, 100, 200, 300]) {
  const s = createInitialState()
  s.floor = floor
  let lv = 1
  while (lv < 3000) {
    s.lv = lv
    if (currentDPS(s).mul(B.BOSS_TIME).gte(bossHP(floor))) break
    lv += 5
  }
  s.isBoss = true
  spawnEnemy(s)
  const bossSurvive = enduranceMax(s).div(threatPerSec(s)).toNumber()
  s.isBoss = false
  const mobSurvive = enduranceMax(s).div(threatPerSec(s)).toNumber()
  const ttk = mobHP(floor).div(currentDPS(s)).toNumber()
  console.log(
    `${String(floor).padStart(3)} | ${String(lv).padStart(4)} | ${bossSurvive.toFixed(1).padStart(6)} | ${mobSurvive.toFixed(0).padStart(5)}(打死一隻小怪要 ${ttk.toFixed(1)} 秒)`,
  )
}
