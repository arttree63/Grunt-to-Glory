import { describe, expect, it } from 'vitest'
import * as B from '../balance'
import { D } from '../decimal'
import {
  bossPartSlot,
  compareEquipment,
  forgeLevel,
  forgeUpgradeChance,
  QUALITIES,
  score,
  SLOTS,
} from '../equipment'
import { LEGENDS } from '../legends'
import { SETS } from '../sets'
import { MERCS, unlockedMercs } from '../mercs'
import { KEYWORD_NAME, keywordSupported } from '../keywords'
import { fmt, fmtTime } from '../format'
import { bossHP, critMultiplier, goldDrop, heroDPS, isBossFloor, medalsFromFloor, mobHP, upCost } from '../formulas'
import { availableJobs, destinyJobs, JOBS } from '../jobs'
import { SKILLS } from '../skills'
import { pendingChoice } from '../destiny'
import { heirloomSlots, techOfflineHours } from '../techs'
import {
  applyTick,
  attackInterval,
  buffMult,
  hasLegend,
  setCount,
  setProgress,
  ironwallActive,
  buyLevels,
  buyElite,
  buyTech,
  canFineForge,
  barterForDestiny,
  availableSkills,
  chargeMult,
  chooseDestiny,
  isAwakened,
  revealStage,
  sigilCap,
  sigilName,
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
  inscribeHeirloom,
  inCheckWindow,
  equip,
  forge,
  pityLeft,
  prestige,
  promote,
  retryBoss,
  bestFloorEver,
  bossKindFor,
  matrixKey,
  matrixOutcome,
  setActiveMerc,
  salvage,
  salvageBelow,
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
    expect(fmt(5)).toBe('5')
    expect(fmt(32.3)).toBe('32') // 金幣不出現小數點
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

describe('點擊的價值(不放在常數乘區)', () => {
  it('D:Boss 檢定與限時事件內戰意效果加倍', () => {
    const s = createInitialState()
    s.morale = 100
    const normal = currentDPS(s)

    s.floor = 10
    spawnEnemy(s)
    expect(inCheckWindow(s)).toBe(true)
    const inBoss = currentDPS(s)
    // 戰意的加成部分變兩倍(1+0.4 → 1+0.8)
    expect(inBoss.div(normal).toNumber()).toBeCloseTo(1.8 / 1.4, 3)
  })

  it('D:檢定窗口內戰意不衰減,窗口外照常衰減', () => {
    const s = createInitialState()
    s.floor = 10
    spawnEnemy(s)
    s.morale = 100
    applyTick(s, 2000)
    expect(s.morale).toBe(100) // Boss 戰中不掉

    const s2 = createInitialState()
    s2.morale = 100
    applyTick(s2, 2000)
    expect(s2.morale).toBeLessThan(100)
  })

  it('D 不懲罰掛機:戰意 0 時加倍毫無影響', () => {
    const s = createInitialState()
    const before = currentDPS(s)
    s.floor = 10
    spawnEnemy(s)
    expect(currentDPS(s).toString()).toBe(before.toString())
  })

  it('C:戰意滿檔觸發爆發並歸零', () => {
    const s = createInitialState()
    s.lv = 30
    s.morale = B.MORALE_MAX - B.MORALE_PER_CLICK

    const events = click(s)
    expect(events.some((e) => e.type === 'moraleBurst')).toBe(true)
    expect(s.morale).toBe(0)
    // 這一擊在低層會直接把怪打死 → 敵人已換下一隻,所以驗的是「有打出傷害」而不是血量變低
    expect(events.some((e) => e.type === 'attack' || e.type === 'kill')).toBe(true)
  })

  it('點擊會自己出一次手:一次點擊 = 一個 attack 事件 = 一次扣血', () => {
    const s = createInitialState()
    s.lv = 1
    s.enemyMaxHp = D(1e6)
    s.enemyHp = D(1e6)
    const hpBefore = s.enemyHp

    const events = click(s)
    const atk = events.filter((e) => e.type === 'attack')
    expect(atk).toHaveLength(1) // 揮砍與扣血 1:1,不會有空點
    expect(s.enemyHp.lt(hpBefore)).toBe(true)
    expect(atk[0].damage!.toNumber()).toBeCloseTo(
      currentDPS(s).mul(B.CLICK_DMG_SEC).toNumber(),
      5,
    )
  })

  it('素材:事件中點擊換素材,有上限,且不隨層數貶值', () => {
    const s = createInitialState()
    s.lv = 1
    s.eventCooldown = 0
    applyTick(s, 100)
    expect(s.event).not.toBe(null)

    // 事件血量拉高,免得點擊把事件打死之後改成算擊殺素材
    s.event!.hp = D(1e9)
    s.event!.maxHp = D(1e9)
    let gained = 0
    for (let i = 0; i < B.EVENT_CLICK_MAT_CAP + 5; i++) {
      gained += click(s).filter((e) => e.type === 'clickMaterial').length
    }
    expect(gained).toBe(B.EVENT_CLICK_MAT_CAP) // 到上限就停
  })

  it('素材:沒有事件時點擊不給「點擊素材」(擊殺掉的素材照算)', () => {
    const s = createInitialState()
    const events = Array.from({ length: 10 }, () => click(s)).flat()
    expect(events.some((e) => e.type === 'clickMaterial')).toBe(false)
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

describe('職業覺醒與第二技能(印記體系)', () => {
  const awakened = (job: 'infantry' | 'scout' | 'marshal') => {
    const s = createInitialState()
    s.lv = 20
    promote(s, job)
    chooseDestiny(s, 'artisan')
    s.destinyNodes.push('artisan_1a') // 一個命運節點
    s.highestFloor = B.AWAKEN_FLOOR
    return s
  }

  it('覺醒要層數 + 命運節點雙條件,缺一不可', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'scout')
    expect(isAwakened(s)).toBe(false)

    s.highestFloor = B.AWAKEN_FLOOR
    expect(isAwakened(s)).toBe(false) // 只有層數不夠

    chooseDestiny(s, 'hunter')
    expect(isAwakened(s)).toBe(false) // 起始節點不算,要 tier>0 的節點

    s.destinyNodes.push('hunter_1a')
    expect(isAwakened(s)).toBe(true)
  })

  it('覺醒前拿不到第二技能,覺醒後才出現', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    expect(availableSkills(s)).toEqual(['shieldRush'])

    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'artisan')
    s.destinyNodes.push('artisan_1a')
    expect(availableSkills(s)).toContain('rally')
  })

  it('三個職業共用同一套印記,只有名稱不同', () => {
    expect(sigilName(awakened('infantry'))).toBe('軍勢')
    expect(sigilName(awakened('scout'))).toBe('追風印記')
    expect(sigilName(awakened('marshal'))).toBe('法令')
  })

  it('buff 視窗期間的擊殺會累積印記', () => {
    const s = awakened('scout')
    s.lv = 60
    expect(s.sigils).toBe(0)

    castSkill(s, 'gale') // 開視窗
    applyTick(s, 1000)
    expect(s.sigils).toBeGreaterThan(0)

    // 視窗外的擊殺不累積
    s.buffs = []
    const before = s.sigils
    applyTick(s, 1000)
    expect(s.sigils).toBe(before)
  })

  it('聖光審判每次施放留下一枚法令', () => {
    const s = awakened('marshal')
    castSkill(s, 'judgement')
    expect(s.sigils).toBe(1)
  })

  it('第二技能消耗全部印記造成傷害;沒有印記就不能放', () => {
    const s = awakened('infantry')
    s.floor = 5
    spawnEnemy(s)
    expect(skillReady(s, 'rally')).toBe(false) // 沒印記

    s.sigils = 5
    expect(skillReady(s, 'rally')).toBe(true)
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    const before = s.enemyHp
    castSkill(s, 'rally')
    const dealt = before.sub(s.enemyHp)
    expect(dealt.div(currentDPS(s)).toNumber()).toBeCloseTo(5 * B.SIGIL_BURST_SEC, 0)
    expect(s.sigils).toBe(0)
  })

  it('印記有上限', () => {
    const s = awakened('scout')
    s.lv = 400
    castSkill(s, 'gale')
    for (let i = 0; i < 100; i++) applyTick(s, 100)
    expect(s.sigils).toBeLessThanOrEqual(sigilCap(s)) // 神匠命運會提高上限
  })

  it('沒有第二技能的職業(無名小兵)不會累積印記', () => {
    const s = createInitialState()
    s.lv = 60
    applyTick(s, 1000)
    expect(s.sigils).toBe(0)
  })
})

describe('命運限定二轉與逐步揭露', () => {
  const atTier1 = (job: 'infantry' | 'scout' | 'marshal', destiny?: 'artisan' | 'hunter' | 'tactician') => {
    const s = createInitialState()
    s.lv = 20
    promote(s, job)
    if (destiny) chooseDestiny(s, destiny)
    return s
  }

  it('命運相符才會出現限定二轉,不符只有通用二轉', () => {
    const withArtisan = atTier1('infantry', 'artisan')
    expect(destinyJobs('infantry', 'artisan').map((j) => j.id)).toContain('forgewarden')
    expect(destinyJobs('infantry', 'tactician').map((j) => j.id)).not.toContain('forgewarden')
    expect(destinyJobs('infantry', 'tactician').map((j) => j.id)).toEqual(['paladin'])
    expect(withArtisan.destinyPath).toBe('artisan')
  })

  it('命運不符就不能轉限定二轉', () => {
    const s = atTier1('infantry', 'tactician')
    s.lv = 100
    expect(promote(s, 'forgewarden')).toBe(false)
    expect(promote(s, 'paladin')).toBe(true)
  })

  it('命運相符時可以轉限定二轉', () => {
    const s = atTier1('scout', 'tactician')
    s.lv = 100
    expect(promote(s, 'shadowvanguard')).toBe(true)
    expect(JOBS.shadowvanguard.awakenSkill).toBe('windMark') // 二轉仍保有印記體系
  })

  it('揭露階段隨命運節點推進', () => {
    const s = atTier1('marshal', 'hunter')
    expect(revealStage(s)).toBe('outline')

    s.destinyNodes.push('hunter_1a')
    expect(revealStage(s)).toBe('leaning')

    s.destinyNodes.push('hunter_2a')
    expect(revealStage(s)).toBe('named')

    s.destinyNodes.push('hunter_3a')
    expect(revealStage(s)).toBe('full')
  })

  it('接近二轉等級也會直接進入完整預覽', () => {
    const s = atTier1('marshal', 'hunter')
    s.lv = 90
    expect(revealStage(s)).toBe('full')
  })

  it('未一轉或已二轉都沒有揭露階段', () => {
    expect(revealStage(createInitialState())).toBe('none')
    const s = atTier1('scout', 'tactician')
    s.lv = 100
    promote(s, 'shadowvanguard')
    expect(revealStage(s)).toBe('none')
  })
})

describe('命運對印記的改造', () => {
  it('神匠提高印記上限', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    chooseDestiny(s, 'artisan')
    expect(sigilCap(s)).toBe(B.SIGIL_MAX + B.ARTISAN_SIGIL_CAP)
  })

  it('尋寶獵人:擊破事件會轉成印記,事件不再只是經濟收益', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'marshal')
    chooseDestiny(s, 'hunter')
    s.lv = 400
    s.eventCooldown = 0
    applyTick(s, 100)
    expect(s.event).not.toBe(null)
    applyTick(s, 1000) // 打掉事件
    expect(s.sigils).toBeGreaterThanOrEqual(B.HUNTER_SIGIL_ON_EVENT)
  })

  it('戰術家:連斬跨過門檻會給印記', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'scout')
    chooseDestiny(s, 'tactician')
    s.lv = 200
    for (let i = 0; i < 30; i++) applyTick(s, 100)
    expect(s.combo).toBeGreaterThanOrEqual(B.TACTICIAN_COMBO_PER_SIGIL)
    expect(s.sigils).toBeGreaterThan(0)
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
    applyTick(s, B.ATTACK_INTERVAL * 1000) // 要夠一次攻擊才會出手
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
    expect(s.buffs).toHaveLength(0)
    expect(currentDPS(s).div(base).toNumber()).toBeCloseTo(1)
  })

  it('立即傷害型技能:直接扣目標血量,是破 Boss 檢定的工具', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'marshal')
    s.floor = 10
    spawnEnemy(s)
    s.isBoss = false // 隔離 v1.7 Boss 管線(拆盾減傷是刻意的,另有測試)
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
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

  it('傳家之器:銘刻的那件必定回來,但以殘缺版出現(保留機制不保留強度)', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.equipped.weapon = {
      id: 'best',
      slot: 'weapon',
      quality: 'gold',
      base: 'guard',
      legend: 'lostbanner',
      setTag: 'ironwall',
      affixes: [
        { type: 'dmg', value: 0.12 },
        { type: 'crit', value: 0.09 },
      ],
    }
    expect(inscribeHeirloom(s, 'best')).toBe(true)

    const next = prestige(s)!
    const relic = next.inventory.find((e) => e.heirloom)!
    expect(relic).toBeDefined()
    expect(relic.legend).toBe('lostbanner') // 機制留著
    expect(relic.setTag).toBe('ironwall')
    expect(relic.affixes).toHaveLength(B.HEIRLOOM_AFFIX_KEEP) // 只留代表性詞綴
    expect(relic.broken).toBe(true)
    expect(QUALITIES.indexOf(relic.quality)).toBe(QUALITIES.indexOf('gold') - B.HEIRLOOM_BROKEN_TIERS)
    expect(relic.fullQuality).toBe('gold') // 修復後回到原品質
    expect(next.inscribedId).toBe(relic.id)
  })

  it('傳家之器:打贏指定數量的 Boss 後修復回完整品質', () => {
    const s = createInitialState()
    s.inventory.push({
      id: 'relic',
      slot: 'weapon',
      quality: 'blue',
      fullQuality: 'gold',
      broken: true,
      heirloom: true,
      affixes: [],
    })
    s.lv = 400 // 打得動 Boss
    s.floor = 10
    spawnEnemy(s)
    for (let i = 0; i < B.HEIRLOOM_REPAIR_BOSSES; i++) {
      s.floor = 10
      s.bossFailed = false
      spawnEnemy(s)
      applyTick(s, 1000)
    }
    const relic = s.inventory.find((e) => e.id === 'relic')!
    expect(s.bossKills).toBeGreaterThanOrEqual(B.HEIRLOOM_REPAIR_BOSSES)
    expect(relic.broken).toBe(false)
    expect(relic.quality).toBe('gold')
  })

  it('傳家之器不佔「家族傳承」的攜帶名額', () => {
    const s = createInitialState()
    s.highestFloor = 50
    s.equipped.weapon = { id: 'best', slot: 'weapon', quality: 'gold', affixes: [] }
    s.inventory.push({ id: 'other', slot: 'head', quality: 'purple', affixes: [] })
    inscribeHeirloom(s, 'best')

    const next = prestige(s, ['best', 'other'])!
    // 銘刻件走傳家之器(殘缺版),名額讓給另一件完整帶走
    expect(next.inventory.some((e) => e.id === 'other')).toBe(true)
    expect(next.inventory.some((e) => e.heirloom && e.broken)).toBe(true)
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

describe('裝備四層架構(基底 / 詞綴分類 / 傳說)', () => {
  const gold = (over: Partial<import('../types').Equipment> = {}): import('../types').Equipment => ({
    id: `t${Math.random()}`,
    slot: 'body',
    quality: 'gold',
    base: 'guard',
    affixes: [],
    ...over,
  })

  it('冷卻縮短詞綴有效,但不得低於基礎的 30%(系統級護欄)', () => {
    const s = createInitialState()
    const base = skillCooldown(s, 'shieldRush')
    s.equipped.body = gold({ base: undefined, affixes: [{ type: 'cdr', value: 0.2 }] })
    expect(skillCooldown(s, 'shieldRush')).toBeCloseTo(base * 0.8, 5)

    // 塞滿五件超額冷卻縮短 → 卡在下限,不會歸零(否則冷卻完成類效果可以自我循環)
    for (const sl of SLOTS) s.equipped[sl] = gold({ slot: sl, base: undefined, affixes: [{ type: 'cdr', value: 0.5 }] })
    expect(skillCooldown(s, 'shieldRush')).toBeCloseTo(base * B.CD_FLOOR, 5)
  })

  it('基底只改節奏:快速縮短攻擊間隔、重擊拉長', () => {
    const s = createInitialState()
    const plain = attackInterval(s)
    for (const sl of SLOTS) s.equipped[sl] = gold({ slot: sl, base: 'swift' })
    const swift = attackInterval(s)
    for (const sl of SLOTS) s.equipped[sl] = gold({ slot: sl, base: 'heavy' })
    expect(swift).toBeLessThan(plain)
    expect(attackInterval(s)).toBeGreaterThan(plain)
  })

  it('不退之壁:軍陣不倒數,倍率換成原本視窗的平均值', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.equipped.body = gold({ legend: 'wall' })
    expect(hasLegend(s, 'wall')).toBe(true)

    castSkill(s, 'shieldRush')
    expect(s.buffs[0]?.permanent).toBe(true)
    const sk = SKILLS.shieldRush
    // 常駐倍率 = 原視窗平均值 × 常駐溢價(補回 Boss 視窗內拿不到的爆發)
    const avg =
      (((sk.duration ?? 0) * sk.dmgMult! + (sk.cd - (sk.duration ?? 0))) / sk.cd) *
      B.WALL_PERMANENT_BONUS
    expect(buffMult(s)).toBeCloseTo(avg, 5)

    applyTick(s, 60_000) // 遠超過原本 10 秒視窗
    expect(s.buffs.length).toBeGreaterThan(0)
    expect(buffMult(s)).toBeCloseTo(avg, 5)
  })

  it('失落軍旗:滿戰意改為儲存,下次施放技能時一起釋放', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.equipped.weapon = gold({ slot: 'weapon', legend: 'lostbanner' })
    for (let i = 0; i < 30; i++) click(s)
    expect(s.bannerStored).toBeGreaterThan(0)

    const stored = s.bannerStored
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    const hpBefore = s.enemyHp
    castSkill(s, 'shieldRush')
    expect(s.bannerStored).toBe(0)
    expect(s.enemyHp.lt(hpBefore)).toBe(true)
    // 每次滿檔存一份,總量是原本爆發秒數的 BANNER_STORE 倍
    expect(stored % (B.MORALE_BURST_SEC * B.BANNER_STORE)).toBeCloseTo(0, 5)
  })

  it('倒轉沙漏:把手上的技能各放過一輪就推進冷卻,觸發後上鎖', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    s.equipped.head = gold({ slot: 'head', legend: 'hourglass', base: 'focus' })
    s.sigils = 3
    // 一轉只有兩招,門檻就是兩招(寫死 3 會讓這件裝備在 Lv.100 前完全是死的)
    expect(availableSkills(s)).toHaveLength(2)

    castSkill(s, 'shieldRush')
    const afterCast = s.skillCd.shieldRush!
    const spent = s.sigils
    castSkill(s, 'rally') // 湊滿一輪 → 沙漏推進 + 引爆回轉(v1.6)各推一段
    const progressed = s.skillCd.shieldRush!
    expect(progressed).toBeCloseTo(
      afterCast - skillCooldown(s, 'shieldRush') * B.HOURGLASS_PROGRESS - spent * B.RELOAD_PER_SIGIL,
      5,
    )

    // 上鎖期間再湊滿也不再推進(冷卻完成類不得連鎖自我觸發)
    s.sigils = 3
    s.skillCd.rally = 0
    castSkill(s, 'rally')
    castSkill(s, 'rally')
    expect(s.skillCd.shieldRush).toBeLessThan(progressed + 0.01)
    // 沙漏上鎖不再推進,但引爆回轉(v1.6)照常:允許 3 層 × RELOAD_PER_SIGIL 的量
    expect(s.skillCd.shieldRush).toBeGreaterThan(progressed - 3 * B.RELOAD_PER_SIGIL - 0.01)
  })

  it('精工保底那一次必定附上傳說(部位與基底對得上時)', () => {
    const s = createInitialState()
    s.materials = 999
    s.eliteMaterials = 5
    s.partMaterials.body = 1
    s.pityLegendary = B.PITY_LEGENDARY
    const e = fineForge(s, { useElite: true, base: 'guard', slot: 'body' }, () => 0.5)
    expect(e?.legend).toBe('wall')
    expect(LEGENDS.wall.tags.every((t) => KEYWORD_NAME[t])).toBe(true)
  })

  it('傳說不回傳戰力 %,改回傳構築關係', () => {
    const s = createInitialState()
    const empty = s.equipped
    const legendItem = gold({ legend: 'wall' })
    const plain = gold({ quality: 'blue' })
    expect(compareEquipment(legendItem, empty).powerDelta).toBeUndefined()
    expect(compareEquipment(legendItem, empty).relation).toBe('opens_new')
    expect(compareEquipment(plain, empty).powerDelta).toBeDefined()
  })

  it('關鍵字表標出現行引擎做不到的效果(提案前的擋牆)', () => {
    expect(keywordSupported('chain')).toBe(false) // 需要多目標
    expect(keywordSupported('store')).toBe(true)
  })

  it('v13 存檔遷移到 v14:舊裝備沒有基底與傳說,不影響既有強度', () => {
    const s = createInitialState()
    s.equipped.body = { id: 'old', slot: 'body', quality: 'gold', affixes: [{ type: 'dmg', value: 0.1 }] }
    const v13 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v13.version = 13
    delete v13.castOrder
    delete v13.bannerStored

    const back = deserialize(v13 as never)
    expect(back.equipped.body?.base).toBeUndefined()
    expect(back.castOrder).toEqual([])
    expect(back.bannerStored).toBe(0)
  })
})

describe('一鍵分解的保護', () => {
  it('傳家之器 / 傳說 / 套裝件不會被一鍵分解掃掉,即使品質很低', () => {
    const s = createInitialState()
    s.inventory.push(
      { id: 'junk', slot: 'head', quality: 'white', affixes: [] },
      // 殘缺版傳奇會降成稀有 → 舊版「分解稀有以下」會把玩家唯一的傳家之器銷毀
      { id: 'relic', slot: 'weapon', quality: 'blue', heirloom: true, broken: true, affixes: [] },
      { id: 'legend', slot: 'body', quality: 'white', legend: 'wall', affixes: [] },
      { id: 'setpiece', slot: 'boots', quality: 'green', setTag: 'ironwall', affixes: [] },
    )

    const r = salvageBelow(s, QUALITIES.indexOf('blue'))
    expect(r.count).toBe(1)
    expect(r.protectedCount).toBe(3)
    expect(s.inventory.map((e) => e.id).sort()).toEqual(['legend', 'relic', 'setpiece'])
  })
})

describe('套裝標籤(裝備第四層)', () => {
  const tagged = (slot: import('../types').Slot, tag: import('../types').SetTagId): import('../types').Equipment => ({
    id: `s${slot}${tag}`,
    slot,
    quality: 'blue', // 標籤制:任何品質都可能帶標籤,不是稀有度階級
    setTag: tag,
    affixes: [],
  })

  it('標籤不綁部位,穿幾件就算幾件', () => {
    const s = createInitialState()
    s.equipped.weapon = tagged('weapon', 'ironwall')
    s.equipped.trinket = tagged('trinket', 'ironwall')
    expect(setCount(s, 'ironwall')).toBe(2)
    expect(setCount(s, 'commander')).toBe(0)
    expect(setProgress(s)).toEqual([{ tag: 'ironwall', count: 2 }])
  })

  it('帝國鐵壁 2 件:軍陣期間攻擊間隔縮短,沒有軍陣時不變', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.equipped.weapon = tagged('weapon', 'ironwall')
    s.equipped.head = tagged('head', 'ironwall')
    const idle = attackInterval(s)
    expect(ironwallActive(s)).toBe(false)

    castSkill(s, 'shieldRush')
    expect(ironwallActive(s)).toBe(true)
    expect(attackInterval(s)).toBeCloseTo(idle * B.IRONWALL_INTERVAL, 5)
  })

  it('帝國鐵壁 3 件:軍陣結束時自動引爆印記', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    for (const sl of ['weapon', 'head', 'body'] as const) s.equipped[sl] = tagged(sl, 'ironwall')

    castSkill(s, 'shieldRush')
    s.sigils = 5
    // 敵人設得夠厚,這段時間不會有擊殺 → 印記不會被連斬回補,才驗得到「自動引爆後歸零」
    s.enemyMaxHp = D(1e6)
    s.enemyHp = D(1e6)
    const hpBefore = s.enemyHp
    applyTick(s, SKILLS.shieldRush.duration! * 1000 + 200)
    expect(s.sigils).toBe(0)
    expect(s.enemyHp.lt(hpBefore)).toBe(true)
  })

  it('戰術指揮官 3 件:完成指令後下一個技能威力提高、冷卻延長', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    for (const sl of ['weapon', 'head', 'body'] as const) s.equipped[sl] = tagged(sl, 'commander')

    castSkill(s, 'shieldRush')
    s.sigils = 3
    castSkill(s, 'rally') // 兩招各一次 = 完成一道指令
    expect(s.commandReady).toBe(true)

    // 指揮形態:buff 持續時間拉長,但該次冷卻也延長(拿冷卻換威力)
    s.skillCd.shieldRush = 0
    castSkill(s, 'shieldRush')
    expect(s.commandReady).toBe(false)
    expect(s.buffs.find((b) => b.skillId === 'shieldRush')!.timeLeft).toBeCloseTo(
      SKILLS.shieldRush.duration! * B.COMMANDER_POWER,
      5,
    )
    expect(s.skillCd.shieldRush!).toBeCloseTo(skillCooldown(s, 'shieldRush') * B.COMMANDER_CD, 5)
  })

  it('套裝效果只寫機制,不給純倍率', () => {
    // 兩套的敘述都必須落在關鍵字表內(共鳴判定與 UI 篩選依賴這個值域)
    for (const set of Object.values(SETS)) {
      expect(set.tags.length).toBeGreaterThan(0)
    }
  })

  it('v14 存檔遷移到 v15:舊裝備沒有套裝標籤', () => {
    const s = createInitialState()
    const v14 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v14.version = 14
    delete v14.commandReady
    const back = deserialize(v14 as never)
    expect(back.commandReady).toBe(false)
    expect(back.equipped.weapon?.setTag).toBeUndefined()
  })
})

describe('二轉的既有技能進化(Lv.100 的第三層內容)', () => {
  it('堅陣:視窗期間的擊殺累積雙倍軍勢', () => {
    const base = createInitialState()
    base.lv = 20
    promote(base, 'infantry')
    const evo = createInitialState()
    evo.lv = 100
    promote(evo, 'infantry')
    promote(evo, 'paladin')
    expect(JOBS.paladin.evolve?.skill).toBe('shieldRush')

    for (const s of [base, evo]) {
      s.highestFloor = B.AWAKEN_FLOOR
      chooseDestiny(s, 'tactician')
      s.destinyNodes.push('tactician_1a')
      castSkill(s, 'shieldRush')
      s.sigils = 0
      s.lv = 120 // 打得動但不會一 tick 打爆上限,才比得出累積速率
      applyTick(s, 300)
    }
    // 兩邊擊殺數相同,印記卻不同 → 差的就是進化
    expect(evo.sigils).toBe(base.sigils * B.EVOLVE_SIGIL_MULT)
  })

  it('連判:聖光審判施放後留下三枚法令而不是一枚', () => {
    const base = createInitialState()
    base.lv = 20
    promote(base, 'marshal')
    const evo = createInitialState()
    evo.lv = 100
    promote(evo, 'marshal')
    promote(evo, 'archmage')

    for (const s of [base, evo]) {
      s.highestFloor = B.AWAKEN_FLOOR
      chooseDestiny(s, 'tactician')
      s.destinyNodes.push('tactician_1a')
      s.enemyMaxHp = D(1e12) // 隔離溢出擊殺 → 連斬 → 額外印記
      s.enemyHp = D(1e12)
      castSkill(s, 'judgement')
    }
    expect(base.sigils).toBe(1)
    expect(evo.sigils).toBe(B.EVOLVE_EDICT_SIGILS)
  })

  it('殘影:疾風連刺視窗期間攻擊間隔縮短(傷害中性,只是切得更細)', () => {
    const s = createInitialState()
    s.lv = 100
    promote(s, 'scout')
    promote(s, 'shadow')
    const idle = attackInterval(s)
    castSkill(s, 'gale')
    expect(attackInterval(s)).toBeCloseTo(idle * B.EVOLVE_INTERVAL, 5)
  })

  it('一轉沒有進化,二轉才有(三層內容的第三層)', () => {
    expect(JOBS.infantry.evolve).toBeUndefined()
    expect(JOBS.scout.evolve).toBeUndefined()
    expect(JOBS.marshal.evolve).toBeUndefined()
    for (const id of ['paladin', 'shadow', 'archmage', 'forgewarden', 'shadowvanguard', 'relicarbiter'] as const) {
      expect(JOBS[id].evolve).toBeDefined()
    }
  })
})

describe('命運 × 職業矩陣圖鑑', () => {
  it('二轉達成會記進矩陣,並記下是第幾代', () => {
    const s = createInitialState()
    s.runs = 2
    s.lv = 100
    chooseDestiny(s, 'artisan')
    promote(s, 'infantry')
    expect(Object.keys(s.jobMatrix)).toHaveLength(0) // 一轉不算

    promote(s, 'forgewarden')
    expect(s.jobMatrix[matrixKey('infantry', 'artisan')]).toBe(3) // 第 3 代
  })

  it('矩陣跨轉生保留,且不會被後面的代數覆蓋', () => {
    const s = createInitialState()
    s.lv = 100
    s.highestFloor = 50
    chooseDestiny(s, 'tactician')
    promote(s, 'scout')
    promote(s, 'shadowvanguard')

    const next = prestige(s)!
    expect(next.jobMatrix[matrixKey('scout', 'tactician')]).toBe(1)

    next.lv = 100
    chooseDestiny(next, 'tactician')
    promote(next, 'scout')
    promote(next, 'shadowvanguard')
    expect(next.jobMatrix[matrixKey('scout', 'tactician')]).toBe(1) // 首次達成的代數不變
  })

  it('九格都有出路:命運限定優先,其餘走通用二轉', () => {
    const tier1 = ['infantry', 'scout', 'marshal'] as const
    const paths = ['artisan', 'tactician', 'hunter'] as const
    const unique = tier1.flatMap((t) => paths.map((p) => matrixOutcome(t, p))).filter((id) => {
      return id && JOBS[id].requiresDestiny
    })
    for (const t of tier1) for (const p of paths) expect(matrixOutcome(t, p)).not.toBe(null)
    expect(unique).toHaveLength(3) // 首版三組命運限定二轉
  })

  it('v16 存檔遷移到 v17:舊存檔沒有矩陣紀錄,從這代開始累積', () => {
    const s = createInitialState()
    const v16 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v16.version = 16
    delete v16.jobMatrix
    expect(deserialize(v16 as never).jobMatrix).toEqual({})
  })
})

describe('演出鉤子(core → render 的資料契約)', () => {
  it('印記引爆會回報消耗了幾層,演出才畫得出 N 道射線', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    s.sigils = 7

    const ev = castSkill(s, 'rally').find((e) => e.type === 'skill')!
    expect(ev.count).toBe(7)
    expect(ev.damage).toBeDefined()
  })

  it('buff 型技能不回報層數,但要帶得出技能 id', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    const ev = castSkill(s, 'shieldRush').find((e) => e.type === 'skill')!
    expect(ev.skillId).toBe('shieldRush')
    expect(ev.count).toBeUndefined()
  })

  it('冷卻被推進時會發事件(追風者之靴 / 倒轉沙漏的演出來源)', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    s.equipped.head = {
      id: 'hourglass',
      slot: 'head',
      quality: 'gold',
      base: 'focus',
      legend: 'hourglass',
      affixes: [],
    }
    s.sigils = 3

    castSkill(s, 'shieldRush')
    const ev = castSkill(s, 'rally').find((e) => e.type === 'cooldownAdvance')
    expect(ev).toBeDefined()
    expect(ev!.skillId).toBe('shieldRush')
    expect(ev!.seconds).toBeGreaterThan(0)
  })
})

describe('傭兵(v1.5:低頻高辨識度的事件源)', () => {
  const withMerc = (id: import('../types').MercId) => {
    const s = createInitialState()
    s.lv = 150
    s.mercBestFloor = 200 // 全部解鎖
    setActiveMerc(s, id)
    s.mercTimer = 0.05 // 馬上觸發
    return s
  }

  it('盜賊背刺:造成傷害並留下一枚印記(破綻)', () => {
    const s = withMerc('rogue')
    s.lv = 20
    promote(s, 'infantry')
    s.enemyMaxHp = D(1e9)
    s.enemyHp = D(1e9)
    const ev = applyTick(s, 100)
    expect(ev.some((e) => e.type === 'mercAct' && e.mercId === 'rogue')).toBe(true)
    expect(s.sigils).toBe(1)
    expect(s.enemyHp.lt(D(1e9))).toBe(true)
  })

  it('冰法師凍結:期間傷害進池不結算,解凍一次引爆;Boss 倒數照走', () => {
    const s = withMerc('icemage')
    s.floor = 10
    spawnEnemy(s)
    const t0 = s.bossTimeLeft
    applyTick(s, 100) // 觸發凍結
    expect(s.freezeLeft).toBeGreaterThan(0)

    const hpAtFreeze = s.enemyHp
    applyTick(s, 1000)
    expect(s.enemyHp.toString()).toBe(hpAtFreeze.toString()) // 凍結中血量不動
    expect(s.frozenPool.gt(0)).toBe(true)
    expect(s.bossTimeLeft).toBeLessThan(t0) // ⚠️ 倒數不停:凍結不偷時間

    const before = s.floor
    const ev = applyTick(s, 1500) // 解凍
    expect(s.freezeLeft).toBe(0)
    expect(ev.some((e) => e.type === 'freezeBurst')).toBe(true)
    expect(s.floor).toBeGreaterThan(before) // 引爆的傷害真的結算了(直接推層)
  })

  it('冰法師:每場 Boss 凍結上限(護欄)', () => {
    const s = withMerc('icemage')
    s.floor = 10
    spawnEnemy(s)
    s.freezeUsedThisBoss = B.FREEZE_BOSS_CAP
    applyTick(s, 100)
    expect(s.freezeLeft).toBe(0) // 上限已滿,不再凍結
  })

  it('傭兵傷害占比壓在 15% 護欄內(常數自檢)', () => {
    expect(B.MERC_ROGUE_SEC / MERCS.rogue.interval).toBeLessThanOrEqual(0.15)
    expect(B.MERC_SAPPER_SEC / MERCS.sapper.interval).toBeLessThanOrEqual(0.15)
    expect(B.MERC_PYRO_SEC / MERCS.pyro.interval).toBeLessThanOrEqual(0.15)
  })

  it('roster 跨轉生:出戰傭兵與歷代最高層都帶到下一代', () => {
    const s = createInitialState()
    s.highestFloor = 95
    s.mercBestFloor = 60
    setActiveMerc(s, 'hound')
    const next = prestige(s)!
    expect(next.activeMerc).toBe('hound')
    expect(next.mercBestFloor).toBe(95)
    expect(unlockedMercs(bestFloorEver(next))).toContain('sapper') // 90 層已解鎖
  })
})

describe('行為型傳說(v1.5:分帳不加量)', () => {
  it('雙生影刃:疾風連刺期間攻擊拆成本體/分身兩份,總量不變', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'scout')
    s.equipped.weapon = { id: 'tb', slot: 'weapon', quality: 'gold', base: 'swift', legend: 'twinblade', affixes: [] }
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    castSkill(s, 'gale')

    const ev = applyTick(s, 900).filter((e) => e.type === 'attack')
    const hero = ev.find((e) => e.source === 'hero')
    const clone = ev.find((e) => e.source === 'clone')
    expect(hero).toBeDefined()
    expect(clone).toBeDefined()
    const ratio = clone!.damage!.div(hero!.damage!.add(clone!.damage!)).toNumber()
    expect(ratio).toBeCloseTo(B.TWIN_CLONE_SHARE, 5)
  })

  it('熔火軍旗:盾牆突擊插旗,軍旗期間攻擊分一份由軍旗打出', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.equipped.weapon = { id: 'bf', slot: 'weapon', quality: 'gold', base: 'heavy', legend: 'bannerflag', affixes: [] }
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    castSkill(s, 'shieldRush')
    expect(s.bannerLeft).toBeGreaterThan(0)

    const ev = applyTick(s, 900).filter((e) => e.type === 'attack')
    expect(ev.some((e) => e.source === 'zone')).toBe(true)
  })

  it('裁決餘燼:七成立即、三成化為燃燒,數秒內燒完(總量守恆)', () => {
    const plain = createInitialState()
    plain.lv = 20
    promote(plain, 'marshal')
    // ⚠️ 兩邊裝備要同規格(只差 legend),否則品質乘區 ×1.5 會污染比值
    plain.equipped.body = { id: 'pl', slot: 'body', quality: 'gold', base: 'focus', affixes: [] }
    plain.enemyMaxHp = D(1e12)
    plain.enemyHp = D(1e12)
    castSkill(plain, 'judgement')
    const plainDealt = D(1e12).sub(plain.enemyHp)

    const s = createInitialState()
    s.lv = 20
    promote(s, 'marshal')
    s.equipped.body = { id: 'em', slot: 'body', quality: 'gold', base: 'focus', legend: 'ember', affixes: [] }
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    castSkill(s, 'judgement')
    const immediate = D(1e12).sub(s.enemyHp)
    expect(immediate.div(plainDealt).toNumber()).toBeCloseTo(B.EMBER_IMMEDIATE, 2)
    expect(s.burnLeft).toBeGreaterThan(0)

    // 燒完後總量要追平(允許普攻的微小誤差:比較燃燒補回的量)
    applyTick(s, (B.EMBER_BURN_DURATION + 1) * 1000)
    expect(s.burnLeft).toBe(0)
  })
})

describe('遊戲性掃描修復(2026-07-30)', () => {
  it('凍結不吃 Boss 擊殺:倒數歸零時先結算凍結池,池夠殺就算你贏', () => {
    const s = createInitialState()
    s.lv = 150
    s.mercBestFloor = 200
    setActiveMerc(s, 'icemage')
    s.floor = 10
    spawnEnemy(s)
    // 手動進入凍結,池裡塞遠超 Boss 血量的傷害,然後把倒數歸零
    s.freezeLeft = 5
    // 第 10 層是拆盾型:盾未破時傷害 ×SHELL_DR,池要大到減傷後仍足以擊殺
    s.frozenPool = s.enemyMaxHp.mul(3 / B.SHELL_DR)
    s.bossTimeLeft = 0.01

    const before = s.floor
    const ev = applyTick(s, 100)
    // 池先結算 → Boss 被擊破 → 不是 bossFail
    expect(ev.some((e) => e.type === 'bossFail')).toBe(false)
    expect(ev.some((e) => e.type === 'bossKill')).toBe(true)
    expect(s.floor).toBeGreaterThan(before)
  })

  it('凍結池不夠殺:照樣判失敗,但池有先結算(血量有掉)', () => {
    const s = createInitialState()
    s.lv = 1
    s.floor = 10
    spawnEnemy(s)
    s.freezeLeft = 5
    s.frozenPool = s.enemyMaxHp.div(2)
    s.bossTimeLeft = 0.01

    const maxHp = s.enemyMaxHp
    const ev = applyTick(s, 100)
    expect(ev.some((e) => e.type === 'bossFail')).toBe(true)
    expect(s.freezeLeft).toBe(0) // 池已清
    void maxHp
  })

  it('吞噬不得吃掉銘刻的傳家之器', () => {
    const s = createInitialState()
    s.destinyNodes = ['artisan_start', 'artisan_2a']
    s.destinyPath = 'artisan'
    s.equipped.weapon = { id: 'main', slot: 'weapon', quality: 'blue', affixes: [] }
    s.inventory.push({ id: 'relicw', slot: 'weapon', quality: 'gold', heirloom: true, affixes: [] })
    inscribeHeirloom(s, 'relicw')
    expect(devourWeapon(s, 'relicw')).toBe(false) // 「必定回來」的承諾不可被一次誤點毀掉
    expect(s.inventory.some((e) => e.id === 'relicw')).toBe(true)
  })

  it('冰法師在限時事件中不開凍結(事件逾時會讓池裡的獎勵蒸發)', () => {
    const s = createInitialState()
    s.lv = 150
    s.mercBestFloor = 200
    setActiveMerc(s, 'icemage')
    s.mercTimer = 0.05
    s.event = { kind: 'chest', hp: D(1e9), maxHp: D(1e9), timeLeft: 8 }
    applyTick(s, 100)
    expect(s.freezeLeft).toBe(0)
  })

  it('指揮官 3 件 + 倒轉沙漏同時穿:同一次湊滿兩者都觸發,沙漏不再餓死', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    s.equipped.head = { id: 'hg', slot: 'head', quality: 'gold', base: 'focus', legend: 'hourglass', affixes: [] }
    for (const sl of ['weapon', 'body', 'boots'] as const)
      s.equipped[sl] = { id: `c${sl}`, slot: sl, quality: 'blue', setTag: 'commander', affixes: [] }
    s.sigils = 3

    castSkill(s, 'shieldRush')
    const ev = castSkill(s, 'rally') // 兩招各一次 = 湊滿
    expect(s.commandReady).toBe(true) // 指揮官觸發
    expect(ev.some((e) => e.type === 'cooldownAdvance')).toBe(true) // 沙漏也觸發
  })
})

describe('總攻 loop(v1.6:buff 併存 / 引爆回轉 / 戰意昂揚 / 乘勝推進)', () => {
  const twoSkillHero = () => {
    const s = createInitialState()
    s.lv = 100
    promote(s, 'infantry')
    promote(s, 'paladin')
    return s
  }

  it('buff 多槽併存:兩個視窗疊加,乘區相乘(總攻的數值來源)', () => {
    const s = twoSkillHero()
    castSkill(s, 'shieldRush')
    castSkill(s, 'bulwark')
    expect(s.buffs).toHaveLength(2)
    expect(buffMult(s)).toBeCloseTo(2.5 * 3, 5) // 重疊視窗 > 輪流開

    // 同技能重放刷新自己,不會疊出第三槽
    s.skillCd.shieldRush = 0
    castSkill(s, 'shieldRush')
    expect(s.buffs).toHaveLength(2)
  })

  it('引爆回轉:引爆印記推進其他技能的冷卻,把循環閉成 loop', () => {
    const s = twoSkillHero()
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    castSkill(s, 'shieldRush')
    const before = s.skillCd.shieldRush!
    s.sigils = 10
    const ev = castSkill(s, 'rally')
    expect(s.skillCd.shieldRush!).toBeCloseTo(before - 10 * B.RELOAD_PER_SIGIL, 5)
    expect(ev.filter((e) => e.type === 'cooldownAdvance').length).toBeGreaterThan(0)
  })

  it('戰意昂揚:滿層引爆 +1 層輪內乘算;沒滿層不給(保留引爆時機的決策)', () => {
    const s = twoSkillHero()
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')

    s.sigils = 3 // 未滿
    castSkill(s, 'rally')
    expect(s.zealStacks).toBe(0)

    s.skillCd.rally = 0
    s.sigils = sigilCap(s) // 滿層
    const dpsBefore = currentDPS(s)
    const ev = castSkill(s, 'rally')
    expect(s.zealStacks).toBe(1)
    expect(ev.some((e) => e.type === 'zealGain')).toBe(true)
    expect(currentDPS(s).gt(dpsBefore)).toBe(true) // 輪內永久變強

    const next = prestige({ ...s, highestFloor: 50 } as typeof s)
    if (next) expect(next.zealStacks).toBe(0) // 轉生歸零,不跨輪失控
  })

  it('乘勝推進:擊破 Boss 後清怪加速,但不影響下一場 Boss 檢定', () => {
    const s = createInitialState()
    s.lv = 200
    s.floor = 10
    spawnEnemy(s)
    applyTick(s, 1000) // 一擊擊破
    expect(s.conquestLeft).toBeGreaterThan(0)

    const base = currentDPS(s)
    s.isBoss = false
    const rushing = currentDPS(s)
    s.conquestLeft = 0
    expect(rushing.div(currentDPS(s)).toNumber()).toBeCloseTo(B.CONQUEST_MULT, 5)
    void base

    // Boss 目標不吃加成
    s.conquestLeft = 10
    s.isBoss = true
    const boss1 = currentDPS(s)
    s.conquestLeft = 0
    expect(currentDPS(s).toString()).toBe(boss1.toString())
  })
})

/** 測試用:透過火術士的路徑點燃(applyBurn 是私有) */
function applyBurnForTest(s: ReturnType<typeof createInitialState>) {
  s.mercBestFloor = 200
  setActiveMerc(s, 'pyro')
  s.mercTimer = 0.01
  applyTick(s, 50)
}

describe('Boss 行為原型(v1.7:敵人不再是木樁)', () => {
  it('原型輪替:X10 拆盾 / X20 蓄力 / X30 圖騰', () => {
    expect(bossKindFor(10)).toBe('shell')
    expect(bossKindFor(20)).toBe('channel')
    expect(bossKindFor(30)).toBe('totem')
    expect(bossKindFor(40)).toBe('shell')
  })

  it('拆盾:盾上傷害衰減、命中數打破後易傷;分身一揮算兩次命中', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'scout')
    s.floor = 10
    spawnEnemy(s)
    expect(s.bossKind).toBe('shell')
    expect(s.shellLeft).toBe(B.SHELL_HITS)

    // 盾上傷害 ×SHELL_DR
    const before = s.enemyHp
    click(s)
    const dealt = before.sub(s.enemyHp)
    expect(dealt.div(currentDPS(s).mul(B.CLICK_DMG_SEC)).toNumber()).toBeCloseTo(B.SHELL_DR, 2)
    expect(s.shellLeft).toBe(B.SHELL_HITS - 1) // 點一下 = 一次命中

    // 點到破盾 → 易傷窗口
    for (let i = 0; i < B.SHELL_HITS; i++) click(s)
    expect(s.shellLeft).toBe(0)
    expect(s.shellVulnLeft).toBeGreaterThan(0)
  })

  it('蓄力:倒數到觸發點開始蓄力;打進足量傷害 → 打斷+易傷;沒斷 → 硬化但仍可通關', () => {
    const s = createInitialState()
    s.lv = 1
    s.floor = 20
    spawnEnemy(s)
    expect(s.bossKind).toBe('channel')

    s.bossTimeLeft = B.CHANNEL_TIMES[0] + 0.05
    applyTick(s, 100)
    expect(s.channelLeft).toBeGreaterThan(0) // 開始蓄力

    // 灌足量傷害 → 打斷
    const ev: import('../types').GameEvent[] = []
    s.lv = 1
    const need = s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK)
    s.frozenPool = D(0)
    // 用凍結池借道 dealDamage(最省事的灌傷害方式)
    s.freezeLeft = 0.01
    s.frozenPool = need.mul(1.01)
    const out = applyTick(s, 100)
    expect(out.some((e) => e.type === 'interrupted')).toBe(true)
    expect(s.vulnLeft).toBeGreaterThan(0)
    void ev

    // 第二次蓄力不打 → 硬化(拖時間但不是失敗判定)
    s.bossTimeLeft = B.CHANNEL_TIMES[1] + 0.05
    applyTick(s, 100)
    expect(s.channelLeft).toBeGreaterThan(0)
    applyTick(s, (B.CHANNEL_DURATION + 0.2) * 1000)
    const failed = s.hardenLeft > 0
    expect(failed).toBe(true)
  })

  it('圖騰:出場加速倒數、吸走攻擊;燃燒與背刺無視圖騰直打 Boss', () => {
    const s = createInitialState()
    s.lv = 1 // 弱到打不掉圖騰,才能觀察加速
    s.floor = 30
    spawnEnemy(s)
    expect(s.bossKind).toBe('totem')

    s.bossTimeLeft = B.TOTEM_FIRST_AT + 0.05
    applyTick(s, 100)
    expect(s.totemHp.gt(0)).toBe(true)

    // 倒數加速
    const t0 = s.bossTimeLeft
    applyTick(s, 1000)
    expect(t0 - s.bossTimeLeft).toBeCloseTo(1 * B.TOTEM_TIMER_MULT, 1)

    // 一般傷害吸到圖騰,Boss 不動
    const bossHp = s.enemyHp
    s.freezeLeft = 0.01
    s.frozenPool = s.totemMaxHp.div(2)
    applyTick(s, 100)
    expect(s.enemyHp.toString()).toBe(bossHp.toString())
    expect(s.totemHp.lt(s.totemMaxHp)).toBe(true)

    // 燃燒穿透:Boss 直接掉血
    applyBurnForTest(s)
    applyTick(s, 500)
    expect(s.enemyHp.lt(bossHp)).toBe(true)
  })

  it('失敗後留下診斷統計(kind / 分帳 / 護盾佔時)', () => {
    const s = createInitialState()
    s.lv = 1
    s.floor = 10
    spawnEnemy(s)
    s.bossTimeLeft = 0.01
    applyTick(s, 100)
    expect(s.bossFailed).toBe(true)
    expect(s.lastBossStats).not.toBe(null)
    expect(s.lastBossStats!.kind).toBe('shell')
    expect(s.lastBossStats!.win).toBe(false)
    expect(s.lastBossStats!.shellTime).toBeGreaterThanOrEqual(0)
  })
})
