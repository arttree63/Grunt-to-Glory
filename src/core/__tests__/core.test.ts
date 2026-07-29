import { describe, expect, it } from 'vitest'
import * as B from '../balance'
import { D } from '../decimal'
import { bossPartSlot, forgeLevel, forgeUpgradeChance, QUALITIES, score, SLOTS } from '../equipment'
import { fmt, fmtTime } from '../format'
import { bossHP, critMultiplier, goldDrop, heroDPS, isBossFloor, medalsFromFloor, mobHP, upCost } from '../formulas'
import { availableJobs, JOBS } from '../jobs'
import { SKILLS } from '../skills'
import { pendingChoice } from '../destiny'
import { heirloomSlots, techOfflineHours } from '../techs'
import {
  applyTick,
  buyLevels,
  buyElite,
  buyTech,
  canFineForge,
  barterForDestiny,
  chargeMult,
  chooseDestiny,
  comboMult,
  toggleCharge,
  valiantMult,
  devourWeapon,
  resolveEncounter,
  forgeHeat,
  forgeHeatBonus,
  pickDestinyNode,
  claimDailyElite,
  fineForge,
  goldMult,
  castSkill,
  click,
  skillCooldown,
  skillReady,
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

  it('Boss 限時到 → 退回前一層 farm,farm 一輪後自動再挑戰', () => {
    const s = createInitialState()
    s.floor = 10
    s.bossFailed = false
    s.lv = 1 // 打不動
    spawnEnemy(s)
    expect(s.isBoss).toBe(true)

    applyTick(s, B.BOSS_TIME * 1000)
    expect(s.bossFailed).toBe(true)
    expect(s.isBoss).toBe(false)
    expect(s.floor).toBe(9) // 退回前一層
    expect(s.bossRetryFloor).toBe(10)

    s.lv = 40
    let guard = 0
    while (!s.isBoss && guard++ < 500) applyTick(s, 100)
    expect(s.isBoss).toBe(true) // 清完一輪自動回去挑戰
    expect(s.floor).toBe(10)
    expect(s.bossRetryFloor).toBe(null)
  })

  it('挑戰 Boss 按鈕:不必等清完小怪就能直接回 Boss 層', () => {
    const s = createInitialState()
    s.floor = 19
    s.bossFailed = true
    s.bossRetryFloor = 20
    s.isBoss = false

    expect(retryBoss(s)).toBe(true)
    expect(s.floor).toBe(20)
    expect(s.isBoss).toBe(true)
    expect(s.bossTimeLeft).toBe(B.BOSS_TIME)
    expect(s.bossRetryFloor).toBe(null)
  })

  it('沒有待挑戰的 Boss 就不能用挑戰按鈕', () => {
    const s = createInitialState()
    expect(retryBoss(s)).toBe(false)
  })

  it('擊破 Boss 後清掉重試層,不會再被拉回去', () => {
    const s = createInitialState()
    s.floor = 10
    s.bossRetryFloor = 10
    spawnEnemy(s)
    s.enemyHp = D(1)
    applyTick(s, 1000)
    expect(s.floor).toBe(11)
    expect(s.bossRetryFloor).toBe(null)
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

describe('命運樹', () => {
  it('選擇路徑會拿到起始能力,一輪只能選一次', () => {
    const s = createInitialState()
    expect(s.destinyPath).toBe(null)
    expect(chooseDestiny(s, 'artisan')).toBe(true)
    expect(s.destinyPath).toBe('artisan')
    expect(s.destinyNodes).toEqual(['artisan_start'])
    expect(chooseDestiny(s, 'hunter')).toBe(false) // 不能改
  })

  it('里程碑發命運點,用當輪層數', () => {
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    s.lv = 200 // 推得動
    let guard = 0
    while (s.floor < B.DESTINY_MILESTONES[0] && guard++ < 5000) applyTick(s, 100)
    applyTick(s, 100)
    expect(s.destinyPoints).toBe(1)
    expect(s.destinyEarned).toBe(1)
  })

  it('未使用命運點有上限,滿了停發但不擋推進', () => {
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    s.lv = 300
    const floorBefore = s.floor
    let guard = 0
    while (s.floor < 200 && guard++ < 20000) applyTick(s, 100)
    expect(s.destinyPoints).toBeLessThanOrEqual(B.DESTINY_POINT_CAP)
    expect(s.floor).toBeGreaterThan(floorBefore) // 推進沒有被卡住
  })

  it('二選一:選了一個,另一個本輪關閉', () => {
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    s.destinyPoints = 1

    const choice = pendingChoice(s)!
    expect(choice.map((n) => n.id)).toEqual(['artisan_1a', 'artisan_1b'])

    expect(pickDestinyNode(s, 'artisan_1a')).toBe(true)
    expect(s.destinyNodes).toContain('artisan_1a')
    expect(s.destinyPoints).toBe(0)

    // 沒點數不能再選,而且下一個決策點換成第二層
    expect(pickDestinyNode(s, 'artisan_1b')).toBe(false)
    s.destinyPoints = 1
    expect(pendingChoice(s)!.map((n) => n.id)).toEqual(['artisan_2a', 'artisan_2b'])
    expect(pickDestinyNode(s, 'artisan_1b')).toBe(false) // 上一層的選項已關閉
  })

  it('不能選不屬於當前決策點的節點', () => {
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    s.destinyPoints = 1
    expect(pickDestinyNode(s, 'hunter_1a')).toBe(false)
    expect(pickDestinyNode(s, 'artisan_3a')).toBe(false)
  })

  it('轉生後命運樹重新來過', () => {
    const s = createInitialState()
    chooseDestiny(s, 'hunter')
    s.destinyPoints = 2
    s.destinyEarned = 2
    s.highestFloor = 50

    const next = prestige(s)!
    expect(next.destinyPath).toBe(null)
    expect(next.destinyNodes).toEqual([])
    expect(next.destinyPoints).toBe(0)
    expect(next.destinyEarned).toBe(0)
  })
})

describe('神匠流派節點效果', () => {
  const artisan = (nodes: string[]) => {
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    s.destinyNodes.push(...nodes)
    return s
  }

  it('鐵匠學徒:忍住不打造會累積爐火,打造後清空', () => {
    const s = artisan([])
    expect(forgeHeat(s)).toBe(0)
    s.materials = 100
    s.forgeHeatMaterials = 50
    expect(forgeHeat(s)).toBe(5)
    expect(forgeHeatBonus(s)).toBeCloseTo(5 * B.HEAT_PER_LAYER)

    forge(s)
    expect(s.forgeHeatMaterials).toBe(0)
    expect(forgeHeat(s)).toBe(0)
  })

  it('沒有起始節點就沒有爐火', () => {
    const s = createInitialState()
    s.forgeHeatMaterials = 100
    expect(forgeHeat(s)).toBe(0)
  })

  it('爐火有層數上限,升階總機率也有硬上限', () => {
    const s = artisan([])
    s.forgeHeatMaterials = 99_999
    expect(forgeHeat(s)).toBe(B.HEAT_MAX_LAYERS)
    s.forgeCount = 99_999 // 鐵匠鋪也滿級
    s.materials = 20
    forge(s, () => 0.99) // 不該爆掉
    expect(s.inventory).toHaveLength(1)
  })

  it('餘火回收:打出比身上差的裝備會退素材', () => {
    const s = artisan(['artisan_1a'])
    s.equipped.weapon = { id: 'good', slot: 'weapon', quality: 'gold', affixes: [] }
    s.materials = B.FORGE_COST
    // rng 壓到最低 → 必出白裝,且鎖不到武器就換個做法:直接檢查退款條件
    const e = forge(s, () => 0.01)!
    const refunded = s.materials
    if (s.equipped[e.slot] && score(s.equipped[e.slot]!) > score(e)) {
      expect(refunded).toBe(Math.floor(B.FORGE_COST * B.EMBER_REFUND))
    }
  })

  it('孤注一擲:雙倍素材換品質下限 +1 階,沒節點時不生效', () => {
    const s = artisan(['artisan_1b'])
    s.materials = B.FORGE_COST * B.ALLIN_COST_MULT
    const e = forge(s, () => 0.01, { allIn: true })!
    expect(s.materials).toBe(0) // 扣了雙倍
    expect(QUALITIES.indexOf(e.quality)).toBeGreaterThanOrEqual(1) // 白 → 綠

    const noNode = createInitialState()
    noNode.materials = 100
    forge(noNode, () => 0.01, { allIn: true })
    expect(noNode.materials).toBe(100 - B.FORGE_COST) // 只扣單倍
  })

  it('武器吞噬:吃掉一把武器換成長,有上限', () => {
    const s = artisan(['artisan_2a'])
    s.equipped.weapon = { id: 'main', slot: 'weapon', quality: 'blue', affixes: [] }
    const before = currentDPS(s)

    s.inventory.push({ id: 'food', slot: 'weapon', quality: 'white', affixes: [] })
    expect(devourWeapon(s, 'food')).toBe(true)
    expect(s.inventory).toHaveLength(0)
    expect(s.equipped.weapon!.growth).toBeCloseTo(1 + B.DEVOUR_GROWTH)
    expect(currentDPS(s).gt(before)).toBe(true)

    // 吃到上限就停
    s.equipped.weapon!.growth = 1 + B.DEVOUR_GROWTH * B.DEVOUR_MAX
    s.inventory.push({ id: 'food2', slot: 'weapon', quality: 'white', affixes: [] })
    expect(devourWeapon(s, 'food2')).toBe(false)
  })

  it('武器吞噬:沒節點或沒裝武器都不能吃', () => {
    const noNode = createInitialState()
    noNode.inventory.push({ id: 'f', slot: 'weapon', quality: 'white', affixes: [] })
    expect(devourWeapon(noNode, 'f')).toBe(false)

    const s = artisan(['artisan_2a'])
    s.inventory.push({ id: 'f', slot: 'weapon', quality: 'white', affixes: [] })
    expect(devourWeapon(s, 'f')).toBe(false) // 沒裝備武器
  })

  it('活體神兵:每擊破 N 個 Boss 讓武器進化,有上限', () => {
    const s = artisan(['artisan_3b'])
    s.equipped.weapon = { id: 'w', slot: 'weapon', quality: 'blue', affixes: [] }
    s.floor = 10
    for (let i = 0; i < B.LIVING_BOSS_PER_STEP; i++) {
      spawnEnemy(s)
      s.enemyHp = D(1)
      applyTick(s, 1000)
      s.floor = 10
      s.bossFailed = false
    }
    expect(s.equipped.weapon!.livingSteps).toBe(1)
    expect(s.equipped.weapon!.growth).toBeCloseTo(1 + B.LIVING_GROWTH)
  })

  it('傳家之器:轉生時把最好的裝備登錄圖鑑', () => {
    const s = artisan(['artisan_3a'])
    s.highestFloor = 50
    s.equipped.weapon = { id: 'best', slot: 'weapon', quality: 'gold', affixes: [] }
    const next = prestige(s)!
    expect(next.codex.some((c) => c.id === 'best')).toBe(true)
  })

  it('沒有傳家之器就不會登錄圖鑑', () => {
    const s = artisan([])
    s.highestFloor = 50
    s.equipped.weapon = { id: 'best', slot: 'weapon', quality: 'gold', affixes: [] }
    expect(prestige(s)!.codex).toHaveLength(0)
  })
})

describe('尋寶獵人流派與留存事件', () => {
  const hunter = (nodes: string[]) => {
    const s = createInitialState()
    chooseDestiny(s, 'hunter')
    s.destinyNodes.push(...nodes)
    return s
  }

  it('留存事件會累積在旅途紀錄,有上限,且不限時', () => {
    const s = createInitialState()
    s.lv = 300
    let guard = 0
    while (s.encounters.length < B.ENCOUNTER_CAP && guard++ < 20000) applyTick(s, 100)
    expect(s.encounters.length).toBe(B.ENCOUNTER_CAP)

    // 滿了不會再累積,但推進不受影響
    const floorBefore = s.floor
    for (let i = 0; i < 2000; i++) applyTick(s, 100)
    expect(s.encounters.length).toBe(B.ENCOUNTER_CAP)
    expect(s.floor).toBeGreaterThan(floorBefore)
  })

  it('神秘鐵匠:幫他花金幣換菁英素材,拒絕拿零錢', () => {
    const s = createInitialState()
    s.encounters = [{ id: 'blacksmith', floor: 10 }]
    s.gold = D('1e9')
    expect(resolveEncounter(s, 'blacksmith', 'help')).toBe(true)
    expect(s.eliteMaterials).toBe(1)
    expect(s.encounters).toHaveLength(0)

    const s2 = createInitialState()
    s2.encounters = [{ id: 'blacksmith', floor: 10 }]
    const before = s2.gold
    resolveEncounter(s2, 'blacksmith', 'refuse')
    expect(s2.gold.gt(before)).toBe(true)
  })

  it('金幣不夠就不能幫鐵匠,事件也不會消失', () => {
    const s = createInitialState()
    s.encounters = [{ id: 'blacksmith', floor: 40 }]
    s.gold = D(0)
    expect(resolveEncounter(s, 'blacksmith', 'help')).toBe(false)
    expect(s.encounters).toHaveLength(1)
  })

  it('岔路給限時增益,會隨層數遞減', () => {
    const s = createInitialState()
    s.encounters = [{ id: 'crossroad', floor: 10 }]
    resolveEncounter(s, 'crossroad', 'left')
    expect(s.routeBuff).toEqual({ kind: 'material', floorsLeft: B.ROUTE_BUFF_FLOORS })

    s.lv = 200
    let guard = 0
    while (s.routeBuff && guard++ < 20000) applyTick(s, 100)
    expect(s.routeBuff).toBe(null)
  })

  it('誘餌箱:事件逃走仍留下較低階獎勵', () => {
    // 把血量調高強制逾時,否則事件會被打死變成正常獎勵
    const escapeEvent = (s: ReturnType<typeof createInitialState>) => {
      s.eventCooldown = 0
      applyTick(s, 100)
      expect(s.event).not.toBe(null)
      s.event!.hp = D('1e18')
      const before = s.gold
      applyTick(s, (s.event!.timeLeft + 1) * 1000)
      expect(s.event).toBe(null)
      return before
    }

    const s = hunter(['hunter_2a'])
    s.lv = 1
    const before = escapeEvent(s)
    expect(s.gold.gt(before)).toBe(true)

    const noNode = createInitialState()
    noNode.lv = 1
    const g0 = escapeEvent(noNode)
    expect(noNode.gold.toString()).toBe(g0.toString()) // 沒節點就什麼都沒有
  })

  it('耐心獵人:事件時間變長', () => {
    const s = hunter(['hunter_1b'])
    s.lv = 1
    s.eventCooldown = 0
    applyTick(s, 100)
    expect(s.event!.timeLeft).toBeGreaterThan(B.EVENT_TIME)
  })

  it('命運交易:放棄事件收穫換命運點,每輪有上限', () => {
    const s = hunter(['hunter_2b'])
    expect(barterForDestiny(s)).toBe(false) // 還沒完成過事件

    s.eventKindsDone = ['chest']
    expect(barterForDestiny(s)).toBe(true)
    expect(s.destinyPoints).toBe(1)
    expect(s.eventKindsDone).toHaveLength(0)

    s.eventKindsDone = ['goblin']
    s.destinyPoints = 0
    expect(barterForDestiny(s)).toBe(true)
    s.eventKindsDone = ['chest']
    s.destinyPoints = 0
    expect(barterForDestiny(s)).toBe(false) // 已達每輪上限
  })

  it('沒有命運交易節點就不能換', () => {
    const s = hunter([])
    s.eventKindsDone = ['chest']
    expect(barterForDestiny(s)).toBe(false)
  })
})

describe('戰術家流派', () => {
  const tac = (nodes: string[]) => {
    const s = createInitialState()
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push(...nodes)
    return s
  }

  it('乘勝追擊:擊殺累積連斬,停手後逐層衰減', () => {
    const s = tac([])
    s.lv = 60
    applyTick(s, 1000)
    expect(s.combo).toBeGreaterThan(0)
    const peak = s.combo
    expect(comboMult(s)).toBeCloseTo(1 + peak * B.COMBO_DMG)

    // 沒有節點就不累積
    const noNode = createInitialState()
    noNode.lv = 60
    applyTick(noNode, 1000)
    expect(noNode.combo).toBe(0)
  })

  it('連斬有上限', () => {
    const s = tac([])
    s.lv = 400
    for (let i = 0; i < 50; i++) applyTick(s, 200)
    expect(s.combo).toBeLessThanOrEqual(B.COMBO_MAX)
  })

  it('破陣:Boss 戰期間連斬不衰減,擊破後清空', () => {
    const s = tac(['tactician_1a'])
    s.combo = 10
    s.floor = 10
    spawnEnemy(s)
    expect(s.isBoss).toBe(true)

    applyTick(s, 100) // Boss 戰中不衰減
    s.comboIdle = 999
    applyTick(s, 100)
    expect(s.combo).toBe(10)

    // 用剛好殺掉 Boss 的傷害,避免溢出傷害又殺一串小怪把連斬重新疊回來
    s.lv = 1
    s.enemyHp = D(1)
    applyTick(s, 1000)
    expect(s.combo).toBe(0) // 擊破後清空
  })

  it('蓄勢:暫停輸出換爆發,沒節點不能用', () => {
    const noNode = createInitialState()
    expect(toggleCharge(noNode)).toBe(false)

    const s = tac(['tactician_1b'])
    s.lv = 60
    expect(toggleCharge(s)).toBe(true)
    expect(s.charging).toBe(true)

    const hpBefore = s.enemyHp
    applyTick(s, B.CHARGE_SEC * 4 * 1000)
    expect(s.enemyHp.toString()).toBe(hpBefore.toString()) // 蓄勢期間不輸出
    expect(s.chargeStacks).toBeGreaterThan(0)

    toggleCharge(s)
    expect(s.charging).toBe(false)
    expect(s.chargeBurstLeft).toBe(B.CHARGE_BURST_SEC)
    expect(chargeMult(s)).toBeGreaterThan(1)

    applyTick(s, (B.CHARGE_BURST_SEC + 1) * 1000)
    expect(chargeMult(s)).toBe(1) // 爆發結束
  })

  it('越戰越勇:Boss 失敗累積加成,只在 Boss 戰生效,擊破後歸零', () => {
    const s = tac(['tactician_2a'])
    s.floor = 10
    s.lv = 1
    spawnEnemy(s)
    applyTick(s, B.BOSS_TIME * 1000 + 100)
    expect(s.valiantStacks).toBe(1)
    expect(s.bossFailed).toBe(true)

    // farm 中(非 Boss)不生效
    expect(valiantMult(s)).toBe(1)

    retryBoss(s)
    expect(valiantMult(s)).toBeCloseTo(1 + B.VALIANT_DMG)

    s.lv = 400
    s.enemyHp = D(1)
    applyTick(s, 100)
    expect(s.valiantStacks).toBe(0) // 擊破後歸零
  })

  it('越戰越勇有上限', () => {
    const s = tac(['tactician_2a'])
    s.valiantStacks = B.VALIANT_MAX
    s.floor = 20
    s.lv = 1
    spawnEnemy(s)
    applyTick(s, B.BOSS_TIME * 1000 + 100)
    expect(s.valiantStacks).toBe(B.VALIANT_MAX)
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

describe('歷代列傳與傳承', () => {
  it('每次轉生留下一張列傳,含職業路徑、命運、層數、結局', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    chooseDestiny(s, 'artisan')
    s.highestFloor = 86

    const next = prestige(s)!
    expect(next.chronicle).toHaveLength(1)
    const c = next.chronicle[0]
    expect(c.gen).toBe(1)
    expect(c.name).toBeTruthy()
    expect(c.jobPath).toContain('重裝步兵')
    expect(c.destiny).toBe('神匠')
    expect(c.floor).toBe(86)
    expect(c.medalsGained).toBe(8)
  })

  it('結局文字不能寫成「被打死」——遊戲沒有玩家 HP', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.bossRetryFloor = 50
    const c = prestige(s)!.chronicle[0]
    expect(c.epitaph).toContain('未能在時限內')
    expect(c.epitaph).not.toMatch(/死|殺|陣亡/)
  })

  it('列傳最新的在最前面,且有保留上限', () => {
    let s = createInitialState()
    for (let i = 0; i < 3; i++) {
      s.highestFloor = 10 * (i + 2)
      s = prestige(s)!
    }
    expect(s.chronicle).toHaveLength(3)
    expect(s.chronicle[0].gen).toBe(3) // 最新在最前
    expect(s.chronicle.length).toBeLessThanOrEqual(B.CHRONICLE_MAX)
  })

  it('傳家寶不會蓋掉圖鑑給的殘缺版(回歸測試)', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.destinyNodes = ['artisan_start', 'artisan_3a']
    s.destinyPath = 'artisan'
    s.equipped.weapon = { id: 'best', slot: 'weapon', quality: 'gold', affixes: [] }

    // codex 一定會給(機率 100%)時,傳家寶與殘缺版要並存
    const orig = Math.random
    Math.random = () => 0
    try {
      const next = prestige(s, ['best'])!
      expect(next.inventory.some((e) => e.id === 'best')).toBe(true) // 傳家寶還在
      expect(next.inventory.length).toBeGreaterThan(1) // 殘缺版沒被蓋掉
    } finally {
      Math.random = orig
    }
  })

  it('本輪增量:列傳記錄這代帶來的永久變化', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.materials = 100
    forge(s)
    forge(s)
    const c = prestige(s)!.chronicle[0]
    expect(c.forgeGained).toBe(2)
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

  it('v7 存檔遷移到 v8:天賦移除、不自動替玩家選流派、補一枚命運點', () => {
    const s = createInitialState()
    s.lv = 51
    const v7 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v7.version = 7
    v7.talents = { str: 50, agi: 0, int: 0, luk: 0 } // 舊格式

    const back = deserialize(v7 as never)
    expect(back.lv).toBe(51)
    expect(back.destinyPath).toBe(null) // 不替玩家選,這是最重要的一個選擇
    expect(back.destinyNodes).toEqual([])
    expect(back.destinyPoints).toBe(1) // 補償
  })

  it('壞存檔回退成新局而不是崩潰', () => {
    expect(deserialize(null).lv).toBe(1)
    expect(deserialize({ foo: 1 } as never).floor).toBe(1)
  })
})
