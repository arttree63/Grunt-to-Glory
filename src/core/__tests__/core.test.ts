import { describe, expect, it } from 'vitest'
import * as B from '../balance'
import { D, Decimal } from '../decimal'
import { bossPartSlot, forgeLevel, forgeUpgradeChance, QUALITIES, SLOTS } from '../equipment'
import { fmt, fmtTime } from '../format'
import { bossHP, critMultiplier, goldDrop, heroDPS, isBossFloor, medalsFromFloor, mobHP, upCost } from '../formulas'
import { availableJobs, JOBS } from '../jobs'
import { SKILLS } from '../skills'
import { heirloomSlots, techOfflineHours } from '../techs'
import {
  applyTick,
  buyLevels,
  buyElite,
  buyTech,
  canFineForge,
  claimDailyElite,
  fineForge,
  goldMult,
  castSkill,
  click,
  critRate,
  resetTalents,
  skillCooldown,
  skillReady,
  spendTalent,
  talentPoints,
  computeOffline,
  createInitialState,
  currentDPS,
  equip,
  forge,
  pityLeft,
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
    expect(heroDPS({ lv: 1 }).toNumber()).toBeCloseTo(B.BASE_DPS)
  })

  it('科技與戰意乘區', () => {
    expect(heroDPS({ lv: 1, techMult: 1.5 }).toNumber()).toBeCloseTo(B.BASE_DPS * 1.5)
    expect(heroDPS({ lv: 1, morale: 100 }).toNumber()).toBeCloseTo(B.BASE_DPS * 1.4)
    expect(medalsFromFloor(87)).toBe(8)
  })

  it('全點力量 = 改版前已驗證的 1.072/級曲線(天賦不是額外變強)', () => {
    // 天賦改版的核心約束。力量同時給傷害倍率與暴擊傷害,兩個都是乘區,
    // 任何一邊調大都會讓整條曲線偏離已驗證的基準 → 這裡跨等級釘死。
    for (const lv of [1, 25, 50, 100, 200]) {
      const s = createInitialState()
      s.lv = lv
      spendTalent(s, 'str', talentPoints(s))
      const legacy = D(5).mul(Decimal.pow(1.072, lv - 1))
      const ratio = currentDPS(s).div(legacy).toNumber()
      expect(ratio).toBeGreaterThan(0.95)
      expect(ratio).toBeLessThan(1.05)
    }
  })

  it('暴擊真的進傷害公式,不再只是跳字', () => {
    expect(critMultiplier(0.18)).toBeCloseTo(1 + 0.18 * 2)
    expect(critMultiplier(0.5, 0.2)).toBeCloseTo(1 + 0.5 * (3 * 1.2 - 1))
    expect(critMultiplier(2)).toBeCloseTo(critMultiplier(1)) // 暴擊率上限 100%
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
    let guard = 0
    while (s.floor === 1 && guard++ < 500) applyTick(s, 100)
    expect(s.floor).toBe(2)
    expect(s.materials).toBe(3)
    expect(s.gold.gt(0)).toBe(true)
  })

  it('溢出傷害會帶到下一隻,不被 tick 頻率鎖住推進', () => {
    const s = createInitialState()
    s.lv = 60 // DPS 遠高於前幾層的怪
    const events = applyTick(s, 1000)
    // 單一 tick 內連續擊殺多隻
    expect(s.floor).toBeGreaterThan(2)
    const kill = events.find((e) => e.type === 'kill')
    expect(kill?.count).toBeGreaterThan(1) // 事件已合併,演出層不會被灌爆
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

    s.lv = 40
    let guard = 0
    while (!s.isBoss && guard++ < 500) applyTick(s, 100)
    expect(s.isBoss).toBe(true) // farm 一輪後自動重新挑戰
    expect(s.floor).toBe(10)
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
    spawnEnemy(s)
    s.enemyHp = D(1) // 剩一滴血,溢傷不足以殺掉 11 層的小怪
    applyTick(s, 1000)
    expect(s.floor).toBe(11)
    expect(s.highestFloor).toBe(11)
    expect(s.isBoss).toBe(false)
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

  it('每件裝備是獨立乘區,全金 5 件約 +29 級等效', () => {
    const s = createInitialState()
    const base = currentDPS(s)
    for (const slot of SLOTS) {
      s.equipped[slot] = { id: slot, slot, quality: 'gold', affixes: [] }
    }
    const mult = currentDPS(s).div(base).toNumber()
    expect(mult).toBeCloseTo(1.5 ** 5, 3)
    // 換算成等效等級,確認落在 skill 訂的 25~35 級
    const equivLv = Math.log(mult) / Math.log(B.DMG_PER_LV)
    expect(equivLv).toBeGreaterThan(25)
    expect(equivLv).toBeLessThan(35)
  })

  it('鍛造保底:連續 30 次未出紫 → 下次必出紫以上', () => {
    const s = createInitialState()
    s.materials = 10_000
    s.pityCount = B.PITY_FORGE
    const e = forge(s, () => 0.01)! // rng 固定成最低品質
    expect(QUALITIES.indexOf(e.quality)).toBeGreaterThanOrEqual(QUALITIES.indexOf('purple'))
    expect(s.pityCount).toBe(0) // 出紫後歸零
    expect(pityLeft(s)).toBe(B.PITY_FORGE)
  })

  it('鐵匠鋪等級隨鍛造次數提升品質升階機率,有上限', () => {
    expect(forgeLevel(0)).toBe(1)
    expect(forgeLevel(75)).toBe(4)
    expect(forgeLevel(99_999)).toBe(B.FORGE_MAX_LEVEL)
    expect(forgeUpgradeChance(99_999)).toBeLessThanOrEqual(B.FORGE_UPGRADE_CAP)
  })

  it('裝備進 DPS 乘區,換下同部位回背包', () => {
    const s = createInitialState()
    s.materials = 10
    const e = forge(s, () => 0.99)! // 固定 rng → 傳奇
    e.affixes = [{ type: 'dmg', value: 0.5 }]
    const before = currentDPS(s)
    expect(equip(s, e.id)).toBe(true)
    // 品質乘區 1.5 × 詞條 +50%
    expect(currentDPS(s).div(before).toNumber()).toBeCloseTo(1.5 * 1.5)
    expect(s.equipped[e.slot]?.id).toBe(e.id)
  })
})

describe('天賦配點', () => {
  it('每升一級 1 點,不能超支', () => {
    const s = createInitialState()
    s.lv = 11
    expect(talentPoints(s)).toBe(10)
    expect(spendTalent(s, 'str', 4)).toBe(4)
    expect(talentPoints(s)).toBe(6)
    expect(spendTalent(s, 'agi', 99)).toBe(6) // 只給得出剩下的
    expect(talentPoints(s)).toBe(0)
    expect(spendTalent(s, 'luk', 1)).toBe(0)
  })

  it('力量提升傷害,敏捷提升暴擊率', () => {
    const s = createInitialState()
    s.lv = 21
    const base = currentDPS(s)
    spendTalent(s, 'str', 10)
    const withStr = currentDPS(s)
    expect(withStr.div(base).toNumber()).toBeGreaterThan(1.2)

    const s2 = createInitialState()
    s2.lv = 21
    const crit0 = critRate(s2)
    spendTalent(s2, 'agi', 10)
    expect(critRate(s2)).toBeCloseTo(crit0 + 10 * B.AGI_CRIT_RATE)
    expect(currentDPS(s2).gt(currentDPS(createInitialState()))).toBe(true)
  })

  it('幸運提升金幣、智力縮短冷卻', () => {
    const s = createInitialState()
    s.lv = 41
    const g0 = goldMult(s)
    spendTalent(s, 'luk', 10)
    expect(goldMult(s) / g0).toBeCloseTo(1 + 10 * B.LUK_GOLD)

    const s2 = createInitialState()
    s2.lv = 41
    s2.jobId = 'infantry'
    const cd0 = skillCooldown(s2, 'shieldRush')
    spendTalent(s2, 'int', 20)
    expect(skillCooldown(s2, 'shieldRush')).toBeCloseTo(cd0 * (1 - 20 * B.INT_CDR))
  })

  it('洗點把點數全部退回', () => {
    const s = createInitialState()
    s.lv = 31
    spendTalent(s, 'str', 20)
    resetTalents(s)
    expect(talentPoints(s)).toBe(30)
    expect(s.talents.str).toBe(0)
  })
})

describe('轉職與主動技能', () => {
  it('轉職樹:小兵 → 一轉三選一 → 二轉只能走對應分支', () => {
    const s = createInitialState()
    expect(availableJobs(s.jobId, 1)).toHaveLength(0)
    expect(availableJobs(s.jobId, 20)).toHaveLength(3) // 重裝步兵 / 突擊斥候 / 隨軍法警

    s.lv = 20
    expect(promote(s, 'paladin')).toBe(false) // 不能跳級轉二轉
    expect(promote(s, 'scout')).toBe(true)

    s.lv = 100
    expect(promote(s, 'paladin')).toBe(false) // 影舞者才是斥候的下一階
    expect(promote(s, 'shadow')).toBe(true)
    expect(JOBS.shadow.skills).toContain('shadowClone')
  })

  it('buff 型技能:提升傷害、會過期、冷卻期間不能再放', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    const base = currentDPS(s)

    expect(skillReady(s, 'shieldRush')).toBe(true)
    castSkill(s, 'shieldRush')
    expect(currentDPS(s).div(base).toNumber()).toBeCloseTo(SKILLS.shieldRush.dmgMult!)
    expect(skillReady(s, 'shieldRush')).toBe(false)

    applyTick(s, SKILLS.shieldRush.duration! * 1000 + 100)
    expect(s.buff).toBe(null)
    expect(currentDPS(s).div(base).toNumber()).toBeCloseTo(1)
  })

  it('立即傷害型技能:直接扣目標血量,是破 Boss 檢定的工具', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'marshal')
    s.floor = 10
    spawnEnemy(s)
    const before = s.enemyHp

    castSkill(s, 'judgement')
    const dealt = before.sub(s.enemyHp)
    expect(dealt.div(currentDPS(s)).toNumber()).toBeCloseTo(SKILLS.judgement.burstSeconds!, 0)
  })

  it('沒有該技能的職業不能施放', () => {
    const s = createInitialState()
    expect(skillReady(s, 'shieldRush')).toBe(false)
    expect(castSkill(s, 'shieldRush')).toHaveLength(0)
  })

  it('冷卻會隨 tick 回復', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    castSkill(s, 'shieldRush')
    applyTick(s, skillCooldown(s, 'shieldRush') * 1000 + 100)
    expect(skillReady(s, 'shieldRush')).toBe(true)
  })
})

describe('部位/菁英素材與精工鍛造', () => {
  it('Boss 部位輪替:X10 頭 / X20 武器 / X30 身 / X40 鞋 / X50 飾品,循環', () => {
    expect(bossPartSlot(10)).toBe('head')
    expect(bossPartSlot(20)).toBe('weapon')
    expect(bossPartSlot(30)).toBe('body')
    expect(bossPartSlot(40)).toBe('boots')
    expect(bossPartSlot(50)).toBe('trinket')
    expect(bossPartSlot(60)).toBe('head') // 循環
  })

  it('Boss 首殺必掉部位素材,重複擊殺才看機率', () => {
    const s = createInitialState()
    s.floor = 10
    spawnEnemy(s)
    s.enemyHp = D(1)
    applyTick(s, 1000, () => 0.99) // rng 高到不會觸發重複掉落
    expect(s.partMaterials.head).toBe(1)
    expect(s.maxBossKilled).toBe(10)

    // 回頭再打同一層 Boss:不再是首殺
    s.floor = 10
    s.bossFailed = false
    spawnEnemy(s)
    s.enemyHp = D(1)
    applyTick(s, 1000, () => 0.99)
    expect(s.partMaterials.head).toBe(1) // 沒掉
  })

  it('精工鍛造:部位素材鎖部位、菁英素材保證菁英以上', () => {
    const s = createInitialState()
    s.materials = 100
    s.partMaterials.weapon = 1
    s.eliteMaterials = 1

    const e = fineForge(s, { slot: 'weapon', useElite: true }, () => 0.01)!
    expect(e.slot).toBe('weapon')
    expect(QUALITIES.indexOf(e.quality)).toBeGreaterThanOrEqual(QUALITIES.indexOf('purple'))
    expect(s.partMaterials.weapon).toBe(0)
    expect(s.eliteMaterials).toBe(0)
    expect(s.materials).toBe(100 - B.FINE_FORGE_COST)
  })

  it('素材不足就不能精工,也不會扣素材', () => {
    const s = createInitialState()
    s.materials = 100
    expect(canFineForge(s, { slot: 'weapon' })).toBe(false)
    expect(fineForge(s, { slot: 'weapon' })).toBe(null)
    expect(s.materials).toBe(100)
  })

  it('精工傳奇保底:50 次未出金 → 必出,普通鍛造不推進這個計數', () => {
    const s = createInitialState()
    s.materials = 10_000
    s.pityLegendary = B.PITY_LEGENDARY
    const e = fineForge(s, {}, () => 0.01)!
    expect(QUALITIES.indexOf(e.quality)).toBeGreaterThanOrEqual(QUALITIES.indexOf('gold'))
    expect(s.pityLegendary).toBe(0)

    const before = s.pityLegendary
    forge(s, () => 0.01)
    expect(s.pityLegendary).toBe(before) // 普通鍛造不吃傳奇保底
  })

  it('每日首殺 Boss 給 1 菁英素材,同一天只給一次', () => {
    const s = createInitialState()
    expect(claimDailyElite(s, '2026-07-29')).toBe(true)
    expect(s.eliteMaterials).toBe(1)
    expect(claimDailyElite(s, '2026-07-29')).toBe(false)
    expect(claimDailyElite(s, '2026-07-30')).toBe(true)
    expect(s.eliteMaterials).toBe(2)
  })

  it('勳章可換菁英素材,不夠不給換', () => {
    const s = createInitialState()
    s.medals = B.ELITE_MEDAL_COST - 1
    expect(buyElite(s)).toBe(false)
    s.medals = B.ELITE_MEDAL_COST
    expect(buyElite(s)).toBe(true)
    expect(s.eliteMaterials).toBe(1)
    expect(s.medals).toBe(0)
  })

  it('菁英素材與傳奇保底跨轉生保留,首殺記錄歸零', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.eliteMaterials = 3
    s.pityLegendary = 20
    s.maxBossKilled = 50
    const next = prestige(s)!
    expect(next.eliteMaterials).toBe(3)
    expect(next.pityLegendary).toBe(20)
    expect(next.maxBossKilled).toBe(0)
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
    expect(next.gold.toNumber()).toBe(0) // 沒買「老兵餘蔭」就沒有開局資金
  })

  it('勳章科技:扣勳章、每級乘算、跨轉生保留', () => {
    const s = createInitialState()
    s.medals = 10
    const base = currentDPS(s)

    expect(buyTech(s, 'valor')).toBe(true)
    expect(s.medals).toBe(10 - B.TECH_COST_DMG)
    expect(currentDPS(s).div(base).toNumber()).toBeCloseTo(B.TECH_DMG_MULT)

    buyTech(s, 'valor')
    expect(currentDPS(s).div(base).toNumber()).toBeCloseTo(B.TECH_DMG_MULT ** 2) // 乘算不是加算

    s.highestFloor = 50
    const next = prestige(s)!
    expect(next.techs.valor).toBe(2)
  })

  it('勳章不夠買不了,有上限的科技滿級後不能再買', () => {
    const s = createInitialState()
    s.medals = 0
    expect(buyTech(s, 'valor')).toBe(false)

    s.medals = 999
    for (let i = 0; i < B.TECH_CAMP_MAX; i++) expect(buyTech(s, 'camp')).toBe(true)
    expect(buyTech(s, 'camp')).toBe(false)
    expect(techOfflineHours(s.techs)).toBe(B.OFFLINE_CAP_HOURS + B.TECH_CAMP_MAX * B.TECH_OFFLINE_HOURS)
  })

  it('後勤補給是獨立於傷害的第二乘區(金幣)', () => {
    const s = createInitialState()
    s.medals = 99
    const before = goldMult(s)
    buyTech(s, 'supply')
    expect(goldMult(s) / before).toBeCloseTo(B.TECH_GOLD_MULT)
    // 買金幣科技不會動到傷害
    const dps = currentDPS(s)
    buyTech(s, 'supply')
    expect(currentDPS(s).toNumber()).toBeCloseTo(dps.toNumber())
  })

  it('老兵餘蔭決定下一代的開局資金', () => {
    const s = createInitialState()
    s.medals = 99
    s.highestFloor = 50
    buyTech(s, 'legacy')
    buyTech(s, 'legacy')
    const next = prestige(s)!
    expect(next.gold.toNumber()).toBe(B.TECH_START_GOLD_BASE * B.TECH_START_GOLD_MULT)
  })

  it('傳家寶:轉生可帶走 1 件,其餘歸零,鐵匠鋪進度保留', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.materials = 30
    s.forgeCount = 40
    const keep = forge(s)!
    const drop = forge(s)!
    equip(s, keep.id)

    const next = prestige(s, [keep.id, drop.id])!
    expect(next.inventory.map((e) => e.id)).toEqual([keep.id]) // 上限 1 件
    expect(next.materials).toBe(0)
    expect(next.forgeCount).toBe(s.forgeCount) // 鐵匠鋪等級不歸零
  })

  it('家族傳承科技可擴充傳家寶欄位', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.materials = 100
    expect(heirloomSlots(s.techs)).toBe(B.HEIRLOOM_SLOTS)

    s.medals = 99
    buyTech(s, 'heirloom')
    buyTech(s, 'heirloom')
    expect(heirloomSlots(s.techs)).toBe(B.HEIRLOOM_SLOTS + 2)

    const a = forge(s)!
    const b = forge(s)!
    const c = forge(s)!
    const next = prestige(s, [a.id, b.id, c.id])!
    expect(next.inventory).toHaveLength(3) // 基準 1 + 科技 2
  })

  it('不指定傳家寶就全部歸零', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.materials = 10
    forge(s)
    const next = prestige(s)!
    expect(next.inventory).toHaveLength(0)
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

  it('v1 存檔可遷移到 v2(缺的欄位補預設,進度不掉)', () => {
    const s = createInitialState()
    s.lv = 42
    s.floor = 33
    const v1 = JSON.parse(JSON.stringify(serialize(s)))
    v1.version = 1
    delete v1.forgeCount
    delete v1.pityCount

    const back = deserialize(v1)
    expect(back.lv).toBe(42)
    expect(back.floor).toBe(33)
    expect(back.forgeCount).toBe(0)
    expect(back.pityCount).toBe(0)
  })

  it('v2 存檔可遷移到 v3(勳章留著,科技從零開始)', () => {
    const s = createInitialState()
    s.lv = 77
    s.medals = 12
    const v2 = JSON.parse(JSON.stringify(serialize(s)))
    v2.version = 2
    delete v2.techs

    const back = deserialize(v2)
    expect(back.lv).toBe(77)
    expect(back.medals).toBe(12) // 勳章不沒收,玩家自己決定買哪條科技
    expect(back.techs).toEqual({ valor: 0, supply: 0, legacy: 0, camp: 0, heirloom: 0 })
  })

  it('v5 存檔遷移到 v6:既有等級的天賦點自動補進力量,戰力不下降', () => {
    const s = createInitialState()
    s.lv = 51
    const v5 = JSON.parse(JSON.stringify(serialize(s)))
    v5.version = 5
    delete v5.talents

    const back = deserialize(v5)
    expect(back.talents.str).toBe(50) // 等級 51 → 50 點全給力量
    expect(talentPoints(back)).toBe(0)
    // 舊玩家的 DPS 不因為改版變弱
    expect(back.lv).toBe(51)
  })

  it('壞存檔回退成新局而不是崩潰', () => {
    expect(deserialize(null).lv).toBe(1)
    expect(deserialize({ foo: 1 } as never).floor).toBe(1)
  })
})
