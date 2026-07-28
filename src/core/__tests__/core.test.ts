import { describe, expect, it } from 'vitest'
import * as B from '../balance'
import { D } from '../decimal'
import { fmt, fmtTime } from '../format'
import { bossHP, goldDrop, heroDPS, isBossFloor, medalsFromFloor, mobHP, upCost } from '../formulas'
import {
  applyTick,
  buyLevels,
  click,
  computeOffline,
  createInitialState,
  currentDPS,
  equip,
  forge,
  prestige,
  promote,
  retryBoss,
  salvage,
  spawnEnemy,
} from '../game'
import { deserialize, serialize } from '../save'

describe('formulas', () => {
  it('新手斜坡:前 30 層走 1.13,之後回 1.16', () => {
    expect(mobHP(1).toNumber()).toBeCloseTo(10)
    expect(mobHP(30).toNumber()).toBeCloseTo(10 * 1.13 ** 29, 5)
    expect(mobHP(31).toNumber()).toBeCloseTo(10 * 1.13 ** 29 * 1.16, 5)
  })

  it('金幣成長低於 HP 成長 → 自然撞牆', () => {
    const ratio = (f: number) => goldDrop(f).div(mobHP(f)).toNumber()
    expect(ratio(60)).toBeLessThan(ratio(31))
  })

  it('Boss HP = 該層小怪 ×8,DPS check 條件為 30 秒', () => {
    expect(bossHP(10).div(mobHP(10)).toNumber()).toBeCloseTo(B.BOSS_HP_MULT)
    expect(isBossFloor(10)).toBe(true)
    expect(isBossFloor(11)).toBe(false)
  })

  it('升級成本與傷害隨等級指數成長', () => {
    expect(upCost(1).toNumber()).toBeCloseTo(20)
    expect(upCost(11).toNumber()).toBeCloseTo(20 * 1.09 ** 10, 6)
    expect(heroDPS({ lv: 1, medals: 0 }).toNumber()).toBeCloseTo(5)
  })

  it('勳章與戰意乘區', () => {
    expect(heroDPS({ lv: 1, medals: 10 }).toNumber()).toBeCloseTo(5 * 1.5)
    expect(heroDPS({ lv: 1, medals: 0, morale: 100 }).toNumber()).toBeCloseTo(5 * 1.4)
    expect(medalsFromFloor(87)).toBe(8)
  })
})

describe('format', () => {
  it('數值縮寫階梯', () => {
    expect(fmt(999)).toBe('999')
    expect(fmt(1234)).toBe('1.2K')
    expect(fmt(3.4e6)).toBe('3.4M')
    expect(fmt(5.6e9)).toBe('5.6B')
    expect(fmt(7.8e12)).toBe('7.8T')
    expect(fmt(D('1e15'))).toBe('1.0aa')
    expect(fmt(D('1e18'))).toBe('1.0ab')
  })
  it('時間格式', () => {
    expect(fmtTime(65)).toBe('1:05')
    expect(fmtTime(3725)).toBe('1:02:05')
  })
})

describe('戰鬥循環', () => {
  it('擊殺給金幣與素材,3 隻推進一層', () => {
    const s = createInitialState()
    s.lv = 50 // 保證秒殺
    for (let i = 0; i < 4; i++) applyTick(s, 1000)
    expect(s.floor).toBe(2)
    expect(s.materials).toBeGreaterThanOrEqual(3)
    expect(s.gold.gt(0)).toBe(true)
  })

  it('10 層進 Boss;限時到 → 退回 farm,farm 一輪後自動重挑戰', () => {
    const s = createInitialState()
    s.floor = 10
    s.bossFailed = false
    s.lv = 1 // 打不動
    spawnEnemy(s)
    expect(s.isBoss).toBe(true)
    applyTick(s, B.BOSS_TIME * 1000)
    expect(s.bossFailed).toBe(true)
    expect(s.isBoss).toBe(false)
    expect(s.floor).toBe(10) // 停在該層 farm

    s.lv = 60
    for (let i = 0; i < B.MOBS_PER_FLOOR; i++) applyTick(s, 1000)
    expect(s.isBoss).toBe(true) // 自動重新挑戰
  })

  it('手動重挑戰 Boss', () => {
    const s = createInitialState()
    s.floor = 20
    s.bossFailed = true
    s.isBoss = false
    expect(retryBoss(s)).toBe(true)
    expect(s.isBoss).toBe(true)
    expect(s.bossTimeLeft).toBe(B.BOSS_TIME)
  })

  it('擊破 Boss 進下一層', () => {
    const s = createInitialState()
    s.floor = 10
    s.lv = 200
    spawnEnemy(s)
    applyTick(s, 1000)
    expect(s.floor).toBe(11)
    expect(s.highestFloor).toBe(11)
  })

  it('點擊疊戰意並提升 DPS,不點會衰減', () => {
    const s = createInitialState()
    const base = currentDPS(s)
    click(s)
    click(s)
    expect(s.morale).toBe(B.MORALE_PER_CLICK * 2)
    expect(currentDPS(s).gt(base)).toBe(true)
    applyTick(s, 5000)
    expect(s.morale).toBe(0)
  })
})

describe('養成與經濟', () => {
  it('買等級扣金幣', () => {
    const s = createInitialState()
    s.gold = D(1000)
    const n = buyLevels(s, 5)
    expect(n).toBe(5)
    expect(s.lv).toBe(6)
    expect(s.gold.lt(1000)).toBe(true)
  })

  it('Lv.20 才能轉職,且只能轉一次', () => {
    const s = createInitialState()
    expect(promote(s, 'scout')).toBe(false)
    s.lv = 20
    expect(promote(s, 'scout')).toBe(true)
    expect(promote(s, 'infantry')).toBe(false)
  })

  it('鍛造消耗 10 素材,分解可回收', () => {
    const s = createInitialState()
    expect(forge(s)).toBe(null)
    s.materials = 10
    const e = forge(s)!
    expect(e).toBeTruthy()
    expect(s.materials).toBe(0)
    expect(s.inventory).toHaveLength(1)
    const back = salvage(s, e.id)
    expect(back).toBeGreaterThan(0)
    expect(s.materials).toBe(back)
    expect(s.inventory).toHaveLength(0)
  })

  it('裝備進 DPS 乘區,換下同部位回背包', () => {
    const s = createInitialState()
    s.materials = 10
    const e = forge(s, () => 0.99)! // 固定 rng → 高品質
    e.affixes = [{ type: 'dmg', value: 0.5 }]
    const before = currentDPS(s)
    expect(equip(s, e.id)).toBe(true)
    expect(currentDPS(s).div(before).toNumber()).toBeCloseTo(1.5)
  })
})

describe('轉生與離線', () => {
  it('轉生給勳章並重置進度,勳章累積', () => {
    const s = createInitialState()
    s.highestFloor = 63
    s.lv = 120
    const next = prestige(s)!
    expect(next.medals).toBe(6)
    expect(next.lv).toBe(1)
    expect(next.floor).toBe(1)
    expect(next.runs).toBe(1)
    expect(next.gold.toNumber()).toBe(6 * B.MEDAL_START_GOLD)
  })

  it('未達 10 層不能轉生', () => {
    const s = createInitialState()
    s.highestFloor = 9
    expect(prestige(s)).toBe(null)
  })

  it('離線收益 6 折且有 4 小時上限', () => {
    const s = createInitialState()
    s.lv = 40
    const oneHour = computeOffline(s, 3600 * 1000)
    const tenHours = computeOffline(s, 10 * 3600 * 1000)
    expect(oneHour.gold.gt(0)).toBe(true)
    expect(tenHours.capped).toBe(true)
    expect(tenHours.seconds).toBe(B.OFFLINE_CAP_HOURS * 3600)
  })
})

describe('存檔', () => {
  it('序列化往返保值(含 Decimal 與裝備)', () => {
    const s = createInitialState()
    s.gold = D('1.234e25')
    s.materials = 7
    s.lv = 88
    s.floor = 43
    s.highestFloor = 47
    s.materials = 10
    const e = forge(s)!
    equip(s, e.id)

    const back = deserialize(JSON.parse(JSON.stringify(serialize(s))))
    expect(back.gold.toString()).toBe(s.gold.toString())
    expect(back.lv).toBe(88)
    expect(back.floor).toBe(43)
    expect(back.equipped[e.slot]?.id).toBe(e.id)
  })

  it('壞存檔回退成新局而不是崩潰', () => {
    expect(deserialize(null).lv).toBe(1)
    expect(deserialize({ foo: 1 } as never).floor).toBe(1)
  })
})
