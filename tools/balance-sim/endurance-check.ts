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

// ── 流派對照:同樣的總點數,分配不同會怎樣(v4.1 § 3)──
import { TRACKS } from '../../src/core/game'
import type { TrackId } from '../../src/core/types'

console.log('\n同樣 200 點,分配不同 → 各自的牆在哪、牆前會被哪一軸擋下:')
const builds: Array<[string, Partial<Record<TrackId, number>>]> = [
  ['全押武藝(玻璃大砲)', { arms: 200 }],
  ['武藝 150 / 體能 50', { arms: 150, body: 50 }],
  ['平均分配', { arms: 40, body: 40, agility: 40, magic: 40, faith: 40 }],
  ['全押體能(肉盾)', { body: 200 }],
]
for (const [name, alloc] of builds) {
  const s = createInitialState()
  s.lv = 201
  for (const t of TRACKS) s.tracks[t] = alloc[t] ?? 0
  // 一層一層往上找,直到某一軸過不了 —— 那就是這個流派的牆
  let floor = 10
  let stop = ''
  for (; floor < 400; floor += 10) {
    s.floor = floor
    s.isBoss = true
    spawnEnemy(s)
    const killSec = bossHP(floor).div(currentDPS(s)).toNumber()
    const surviveSec = enduranceMax(s).div(threatPerSec(s)).toNumber()
    if (killSec > B.BOSS_TIME) { stop = `輸出不夠(要打 ${killSec.toFixed(0)}s > ${B.BOSS_TIME}s)`; break }
    if (surviveSec < killSec) { stop = `擋不住(只能撐 ${surviveSec.toFixed(0)}s,但要打 ${killSec.toFixed(0)}s)`; break }
  }
  console.log(`${name.padEnd(22)} 牆在第 ${floor} 層 → ${stop}`)
}
