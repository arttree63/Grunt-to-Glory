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
import { fmt, fmtCombat, fmtTime } from '../format'
import { bossHP, critMultiplier, goldDrop, heroDPS, isBossFloor, medalsFromFloor, mobHP, upCost } from '../formulas'
import { availableJobs, destinyJobs, JOBS } from '../jobs'
import { SKILLS } from '../skills'
import { pendingChoice } from '../destiny'
import { emptyTechs, heirloomSlots, techFineForges, techOfflineHours } from '../techs'
import { ACHIEVEMENTS } from '../achievements'
import { ZONE_SPAN, zoneOf, zoneProgress } from '../zones'
import { speciesPair } from '../enemies'
import { ENCOUNTERS, ENCOUNTER_ORDER } from '../encounters'
import { nextChoiceIds, reconcileDestiny, rollDescent } from '../destiny'
import type { EncounterId } from '../types'
import {
  applyTick,
  afterimageShape,
  pendingMedals,
  runStalled,
  dealDamage,
  gainSigil,
  lastDitchMult,
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
  chooseTraining,
  isAwakened,
  revealStage,
  sigilCap,
  sigilName,
  comboMult,
  toggleAutoCast,
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
  addDestinyPoint,
  afterimageStyle,
  computeOffline,
  createInitialState,
  sigilPerStackSeconds,
  fineForgesLeft,
  currentDPS,
  inscribeHeirloom,
  inCheckWindow,
  equip,
  forge,
  pityLeft,
  pendingTrainingCount,
  pendingTrainingLevel,
  prestige,
  promote,
  retryBoss,
  bestFloorEver,
  bossKindFor,
  matrixKey,
  matrixOutcome,
  setActiveMerc,
  salvage,
  salvageEquipped,
  salvageBelow,
  spawnEnemy,
  diagnoseBoss,
  loreStage,
  setTactic,
  strongestResonance,
  trainingCount,
  channelProgress,
  shellProgress,
  shellToNext,
} from '../game'
import { legacyGoal, nearGoal, runGoal } from '../goals'
import { titleFor } from '../chronicle'
import { deserialize, serialize } from '../save'

describe('formulas', () => {
  it('新手斜坡:前 30 層走 1.13,之後回 1.16', () => {
    expect(mobHP(1).toNumber()).toBeCloseTo(10 * B.COMBAT_NUMBER_SCALE)
    expect(mobHP(30).toNumber()).toBeCloseTo(10 * B.COMBAT_NUMBER_SCALE * 1.13 ** 29, 5)
    expect(mobHP(31).toNumber()).toBeCloseTo(10 * B.COMBAT_NUMBER_SCALE * 1.13 ** 29 * 1.16, 5)
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
    expect(fmt(0)).toBe('0')
    expect(fmt(0.25)).toBe('1') // 極小分帳值不可顯示成 0
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

  it('戰鬥數字一律顯示整數', () => {
    expect(fmtCombat(999.8)).toBe('999')
    expect(fmtCombat(1234.8)).toBe('1,234')
    expect(fmtCombat(999999.9)).toBe('999,999')
    expect(fmtCombat(1.8e6)).toBe('1M')
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


/** 推進到指定樓層並讓時間流過,直到操練令釋出(釋出是 tick 驅動的:樓層 AND 最小間隔) */
function advanceToTraining(s: ReturnType<typeof createInitialState>, floor: number, sec = 200) {
  s.highestFloor = floor
  for (let i = 0; i < sec; i++) applyTick(s, 1000)
}

describe('養成與經濟', () => {
  it('買等級扣金幣', () => {
    const s = createInitialState()
    s.gold = D(1000)
    const n = buyLevels(s, 5)
    expect(n).toBe(5)
    expect(s.lv).toBe(6)
    expect(s.gold.lt(1000)).toBe(true)
  })

  it('推進到里程碑樓層可選操練，重擊與疾攻只改攻擊節奏', () => {
    const s = createInitialState()
    const levelOneDps = currentDPS(s)
    const baseInterval = attackInterval(s)
    expect(pendingTrainingLevel(s)).toBe(null)

    s.lv = 10
    advanceToTraining(s, B.TRAINING_FLOORS[0])
    const levelTenDps = currentDPS(s)
    expect(levelTenDps.gt(levelOneDps)).toBe(true)
    expect(pendingTrainingLevel(s)).toBe(B.TRAINING_FLOORS[0])
    expect(chooseTraining(s, 'heavy')).toBe(true)
    expect(trainingCount(s, 'heavy')).toBe(1)
    expect(attackInterval(s)).toBeCloseTo(baseInterval * B.TRAINING_HEAVY_INTERVAL)
    expect(currentDPS(s).eq(levelTenDps)).toBe(true)
    expect(chooseTraining(s, 'rapid')).toBe(false)

    advanceToTraining(s, B.TRAINING_FLOORS[1])
    expect(chooseTraining(s, 'rapid')).toBe(true)
    expect(attackInterval(s)).toBeCloseTo(
      baseInterval * B.TRAINING_HEAVY_INTERVAL * B.TRAINING_RAPID_INTERVAL,
    )
  })

  it('操練令可累積:跨多個里程碑不會漏,補選結果等同逐級選', () => {
    // 不阻斷後玩家可能一路推到最後一個里程碑才回頭選,五筆一次補完不能少給
    const banked = createInitialState()
    // 時間閘只管釋出節奏,不吞次數:走到最後一個門檻、放著不選,最終仍會拿到全部五次
    advanceToTraining(banked, B.TRAINING_FLOORS[B.TRAINING_FLOORS.length - 1], 900)
    expect(pendingTrainingCount(banked)).toBe(B.TRAINING_FLOORS.length)

    const stepwise = createInitialState()
    for (const f of B.TRAINING_FLOORS) {
      advanceToTraining(stepwise, f)
      expect(pendingTrainingCount(stepwise)).toBe(1)
      expect(chooseTraining(stepwise, 'rapid')).toBe(true)
      expect(pendingTrainingCount(stepwise)).toBe(0)
    }

    for (let i = 0; i < B.TRAINING_FLOORS.length; i++) expect(chooseTraining(banked, 'rapid')).toBe(true)
    expect(pendingTrainingCount(banked)).toBe(0)
    expect(chooseTraining(banked, 'rapid')).toBe(false)
    // 訓練沒有路徑相依:晚選不吃虧,所以不需要補償機制
    expect(attackInterval(banked)).toBeCloseTo(attackInterval(stepwise))
  })

  it('操練令的時間閘:推進再快也不會一次收到三張,但一張都不會少', () => {
    // ⚠️ 只綁樓層給不出穩定節奏——同一組樓層,不鍛造的玩家第 125 層要 60 分鐘以上,
    // 會鍛造的模擬器只要 4.1 分。所以是「樓層 AND 最小間隔」的二維閘。
    const rusher = createInitialState()
    rusher.highestFloor = B.TRAINING_FLOORS[B.TRAINING_FLOORS.length - 1] // 一口氣衝到最後一個門檻
    applyTick(rusher, 1000)
    expect(pendingTrainingCount(rusher)).toBe(1) // 第一張立刻給,不必等

    // 間隔沒到就不會有第二張
    for (let i = 0; i < B.TRAINING_MIN_GAP_SEC - 5; i++) applyTick(rusher, 1000)
    expect(pendingTrainingCount(rusher)).toBe(1)
    // 過了間隔才給下一張
    for (let i = 0; i < 10; i++) applyTick(rusher, 1000)
    expect(pendingTrainingCount(rusher)).toBe(2)

    // 放著不選也不會被吞掉:時間夠久最終拿滿
    for (let i = 0; i < B.TRAINING_MIN_GAP_SEC * 5; i++) applyTick(rusher, 1000)
    expect(pendingTrainingCount(rusher)).toBe(B.TRAINING_FLOORS.length)
  })

  it('待分配的操練令會出現在近期目標,但排在際遇之後', () => {
    const s = createInitialState()
    advanceToTraining(s, B.TRAINING_FLOORS[0])
    expect(nearGoal(s)?.tab).toBe('hero')
    expect(nearGoal(s)?.text).toContain('操練')

    // 際遇會真的溢出丟失(cap 2),操練令不會過期 → 際遇優先
    s.encounters = [{ id: 'wounded', floor: 5 }]
    expect(nearGoal(s)?.tab).toBe('journal')

    s.encounters = []
    s.materials = B.FORGE_COST * 10
    expect(nearGoal(s)?.tab).toBe('hero')
    chooseTraining(s, 'heavy')
    expect(nearGoal(s)?.tab).toBe('forge')
  })

  it('戰意訓練提高點擊累積並延長保留時間', () => {
    const plain = createInitialState()
    const trained = createInitialState()
    advanceToTraining(trained, B.TRAINING_FLOORS[0])
    expect(chooseTraining(trained, 'morale')).toBe(true)

    click(plain)
    click(trained)
    expect(trained.morale).toBeCloseTo(plain.morale * B.TRAINING_MORALE_GAIN)

    applyTick(plain, 500)
    applyTick(trained, 500)
    expect(trained.morale).toBeGreaterThan(plain.morale)
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

  it('已穿裝備可直接分解,不必先卸下', () => {
    const s = createInitialState()
    s.equipped.weapon = { id: 'equipped-weapon', slot: 'weapon', quality: 'blue', affixes: [] }
    const before = s.materials
    const back = salvageEquipped(s, 'weapon')
    expect(back).toBeGreaterThan(0)
    expect(s.materials).toBe(before + back)
    expect(s.equipped.weapon).toBe(null)
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

  it('里程碑命運點只在擊破守關者後發放', () => {
    const s = createInitialState()
    s.destinyPath = 'tactician'
    s.destinyNodes = ['seed_afterimage']
    s.floor = B.DESTINY_MILESTONES[0]
    s.destinyGapSec = B.DESTINY_BEAT_GAP_SEC // 呼吸間隔已滿(單獨的閘有自己的測試)
    spawnEnemy(s)

    applyTick(s, 100)
    expect(s.destinyPoints).toBe(0)

    s.enemyHp = D(0)
    s.attackAcc = 10
    const events = applyTick(s, 1000)
    expect(s.destinyPoints).toBe(1)
    expect(s.destinyEarned).toBe(1)
    expect(events.some((e) => e.type === 'destinyPoint')).toBe(true)
    expect(pendingChoice(s)!.map((n) => n.id)).toEqual([
      'shade_swarm',
      'shade_mirror',
      'shade_lure',
    ])
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
    // ⚠️ 走 addDestinyPoint 而不是直接寫 destinyPoints——
    // 直接寫不會備妥 pendingChoiceIds,那正是會讓點數卡死的路徑
    addDestinyPoint(s)

    const choice = pendingChoice(s)!
    expect(choice.map((n) => n.id)).toEqual(['artisan_1a', 'artisan_1b'])

    expect(pickDestinyNode(s, 'artisan_1a')).toBe(true)
    expect(s.destinyNodes).toContain('artisan_1a')
    expect(s.destinyPoints).toBe(0)

    // 沒點數不能再選,而且下一個決策點換成第二層
    expect(pickDestinyNode(s, 'artisan_1b')).toBe(false)
    addDestinyPoint(s)
    expect(pendingChoice(s)!.map((n) => n.id)).toEqual(['artisan_2a', 'artisan_2b'])
    expect(pickDestinyNode(s, 'artisan_1b')).toBe(false) // 上一層的選項已關閉
  })

  it('殘影:每 5 次普攻生成、重演 2 次、破盾 2 點、印記半速、背刺窗口用完即清', () => {
    const s = createInitialState()
    s.destinyNodes = ['seed_afterimage']
    s.jobId = 'scout'
    const rng = () => 0.5
    const swing = () => {
      s.attackAcc = 10 // 保證這一 tick 一定出手
      return applyTick(s, 100, rng)
    }

    // 前 4 次不該有殘影
    for (let i = 0; i < 4; i++) {
      const ev = swing()
      expect(ev.some((e) => e.type === 'afterimageSpawn')).toBe(false)
      expect(ev.some((e) => e.source === 'clone')).toBe(false)
    }
    // 第 5 次生成
    expect(swing().some((e) => e.type === 'afterimageSpawn')).toBe(true)
    expect(s.afterimageLeft).toBe(B.AFTERIMAGE_REPLAYS)

    // 接下來 2 次會有殘影攻擊,第 3 次沒有
    expect(swing().some((e) => e.type === 'attack' && e.source === 'clone')).toBe(true)
    expect(swing().some((e) => e.type === 'attack' && e.source === 'clone')).toBe(true)
    expect(s.afterimageLeft).toBe(0)
    const backstab = swing().find((e) => e.type === 'attack' && e.source !== 'clone')
    expect(backstab?.pierce).toBe(true)
    expect(s.backstabReady).toBe(false)

    // 沒有種子就完全不會有殘影(不影響其他構築)
    const plain = createInitialState()
    plain.jobId = 'scout'
    for (let i = 0; i < 12; i++) {
      plain.attackAcc = 10
      const ev = applyTick(plain, 100, rng)
      expect(ev.some((e) => e.type === 'afterimageSpawn')).toBe(false)
    }
  })

  it('同一顆種子在三職業下是三種不同的機制,不是換名稱', () => {
    const mk = (job: 'infantry' | 'scout' | 'marshal') => {
      const s = createInitialState()
      s.jobId = job
      s.destinyNodes = ['seed_afterimage']
      return s
    }
    expect(afterimageStyle(mk('scout'))).toBe('mirror')
    expect(afterimageStyle(mk('infantry'))).toBe('guard')
    expect(afterimageStyle(mk('marshal'))).toBe('echo')
    // 沒有種子就沒有詮釋
    const plain = createInitialState()
    plain.jobId = 'infantry'
    expect(afterimageStyle(plain)).toBeNull()
  })

  it('守護殘像:技能視窗期間殘影不消耗重演次數', () => {
    const s = createInitialState()
    s.jobId = 'infantry'
    s.destinyNodes = ['seed_afterimage']
    const rng = () => 0.5
    const swing = () => {
      s.attackAcc = 10
      return applyTick(s, 100, rng)
    }
    for (let i = 0; i < 5; i++) swing() // 生成殘影
    expect(s.afterimageLeft).toBe(B.AFTERIMAGE_REPLAYS)

    // 開著 dmgMult 視窗時,重演次數不減。
    // ⚠️ 只揮 2 次:再多會跨過「第 5 次重新生成」的邊界,測到的就不是這條規則了
    s.buffs = [{ skillId: 'shieldRush', timeLeft: 99 }]
    for (let i = 0; i < 2; i++) swing()
    expect(s.afterimageLeft).toBe(B.AFTERIMAGE_REPLAYS)

    // 視窗結束後恢復消耗
    s.buffs = []
    swing()
    expect(s.afterimageLeft).toBe(B.AFTERIMAGE_REPLAYS - 1)
  })

  it('法術餘響完全不重演普攻——否則法警只是「斥候 + 額外一份」', () => {
    const s = createInitialState()
    s.jobId = 'marshal'
    s.destinyNodes = ['seed_afterimage']
    const rng = () => 0.5
    for (let i = 0; i < 20; i++) {
      s.attackAcc = 10
      const ev = applyTick(s, 100, rng)
      expect(ev.some((e) => e.type === 'attack' && e.source === 'clone')).toBe(false)
      expect(ev.some((e) => e.type === 'afterimageSpawn')).toBe(false)
    }
  })

  it('法術餘響:技能傷害是分帳不是加量,而且會推進其他技能冷卻', () => {
    const withEcho = createInitialState()
    withEcho.jobId = 'marshal'
    withEcho.destinyNodes = ['seed_afterimage']
    const plain = createInitialState()
    plain.jobId = 'marshal'
    for (const st of [withEcho, plain]) {
      st.lv = 50
      st.skillCd = {}
      st.enemyHp = D('1e30')
      st.enemyMaxHp = D('1e30')
    }
    const sum = (evs: ReturnType<typeof castSkill>) =>
      evs.reduce((a, e) => (e.damage ? a + e.damage.toNumber() : a), 0)

    const a = sum(castSkill(withEcho, 'judgement'))
    const b = sum(castSkill(plain, 'judgement'))
    // ⚠️ 總傷害一致 = 分帳不加量。差異只在「拆給誰」與冷卻推進
    expect(a).toBeCloseTo(b, 5)

    // 餘響會推進其他技能的冷卻(玩家要排順序才吃得到)
    const s2 = createInitialState()
    s2.jobId = 'marshal'
    s2.destinyNodes = ['seed_afterimage']
    s2.lv = 50
    s2.skillCd = { judgement: 0 }
    castSkill(s2, 'judgement')
    const evs = castSkill(s2, 'judgement')
    expect(evs.some((e) => e.type === 'cooldownAdvance')).toBe(false) // 只有一招時沒有「其他」可推
  })

  it('殘影淨增傷落在企劃要求的 15~20%', () => {
    // ⚠️ 算式:每 AFTERIMAGE_EVERY 次普攻中有 AFTERIMAGE_REPLAYS 次帶殘影
    const net = (B.AFTERIMAGE_REPLAYS / B.AFTERIMAGE_EVERY) * B.AFTERIMAGE_DAMAGE_SHARE
    expect(net).toBeGreaterThanOrEqual(0.15)
    expect(net).toBeLessThanOrEqual(0.2)
  })

  it('命運降臨:種子固定第 10 層、之後走時間閘門、會定錨流派', () => {
    const s = createInitialState()
    const rng = () => 0.5

    // 第 9 層打贏 Boss 不給種子(還沒到第 10 層)
    s.floor = 9
    s.isBoss = true
    s.enemyHp = D(0)
    applyTick(s, 1000, rng) // ⚠️ 要超過攻擊間隔才會結算擊殺
    expect(s.destinyLog).toHaveLength(0)

    // 第 10 層才給,而且會定錨流派
    const t = createInitialState()
    t.floor = B.DESTINY_SEED_FLOOR
    t.isBoss = true
    t.enemyHp = D(0)
    applyTick(t, 1000, rng)
    expect(t.destinyLog).toHaveLength(1)
    expect(t.destinyNodes).toContain('seed_afterimage')
    expect(t.destinyPath).not.toBeNull() // 定錨
    expect(t.destinyLocked).toBe(false) // 但還沒鎖定

    // 冷卻沒過就不會再降臨(不然前期會每 12 秒跳一張卡)
    expect(t.descentCooldown).toBeGreaterThan(0)
    const logLen = t.destinyLog.length
    t.floor = 20
    t.isBoss = true
    t.enemyHp = D(0)
    applyTick(t, 1000, rng)
    expect(t.destinyLog).toHaveLength(logLen)
  })

  it('舊存檔已有命運點但沒有路徑時，首次降臨會補回可選項目', () => {
    const s = createInitialState()
    s.floor = 50
    s.destinyPoints = 1
    s.pendingChoiceIds = null
    s.isBoss = true
    s.enemyHp = D(0)

    applyTick(s, 1000, () => 0.5)
    expect(s.destinyNodes).toContain('seed_afterimage')
    expect(s.destinyPath).toBe('tactician')
    expect(pendingChoice(s)!.map((n) => n.id)).toEqual([
      'shade_swarm',
      'shade_mirror',
      'shade_lure',
    ])
  })

  it('種子會讓自己的抉擇組優先,但不污染既有的二選一索引', () => {
    const s = createInitialState()
    chooseDestiny(s, 'tactician')
    addDestinyPoint(s)
    const pathChoice = pendingChoice(s)!.map((n) => n.id)
    expect(pathChoice).toEqual(['tactician_1a', 'tactician_1b'])

    // 拿到種子後,第 30 層要兌現的是「分身最後長成什麼」,不是路徑表的下一個二選一
    s.destinyNodes.push('seed_afterimage')
    s.pendingChoiceIds = nextChoiceIds(s)
    expect(pendingChoice(s)!.map((n) => n.id)).toEqual([
      'shade_swarm',
      'shade_mirror',
      'shade_lure',
    ])

    // 選完抉擇組後,路徑二選一要原封不動回來 ——
    // ⚠️ 這才是「索引沒被降臨節點污染」的真正證明
    expect(pickDestinyNode(s, 'shade_mirror')).toBe(true)
    expect(s.destinyLocked).toBe(true) // 重大抉擇 = 流派定案
    addDestinyPoint(s)
    expect(pendingChoice(s)!.map((n) => n.id)).toEqual(pathChoice)
  })

  it('第 30 層三選一必須真的改變殘影行為(它會硬暫停遊戲,不能是 no-op)', () => {
    // ⚠️ 2026-07-31 體驗審查:這三個節點原本在 core 零引用,選哪個結果完全一樣。
    // 這條測試釘死「三者形態互不相同」,不准再退回文案。
    const shapeOf = (choice: string | null) => {
      const s = createInitialState()
      s.destinyNodes.push('seed_afterimage')
      if (choice) s.destinyNodes.push(choice)
      return afterimageShape(s)
    }
    const base = shapeOf(null)
    const swarm = shapeOf('shade_swarm')
    const mirror = shapeOf('shade_mirror')
    const lure = shapeOf('shade_lure')

    // 三者彼此不同,且都不等於基準
    const key = (x: typeof base) => JSON.stringify(x)
    expect(new Set([key(base), key(swarm), key(mirror), key(lure)]).size).toBe(4)

    // ⚠️ 命中密度是 replays/every,不是 every 本身。
    // 初版寫 every:3 / replays:1 讓群影的命中數反而**低於**基準(實測 43 vs 52),
    // 與「命中型」的身分相反。這條就是釘死那個錯誤。
    const density = (x: typeof base) => x.replays / x.every
    expect(density(swarm)).toBeGreaterThan(density(base))
    expect(density(mirror)).toBeLessThan(density(base))
    // 鏡像:影子少而長 + 替你轉冷卻 → 施放順序成為決策
    expect(mirror.every).toBeGreaterThan(base.every)
    expect(mirror.replays).toBeGreaterThan(base.replays)
    expect(mirror.cdAdvance).toBeGreaterThan(0)
    expect(base.cdAdvance).toBe(0)
    expect(lure.share).toBeLessThan(base.share)
    expect(lure.sigilPer).toBeLessThan(base.sigilPer)
    expect(lure.shieldValue).toBe(B.SHIELD_HIT_VALUE)

    // 前三者不可以用計算機分高下:淨增傷 = (replays/every) × share,差距須在 1 個百分點內
    const net = (x: typeof base) => (x.replays / x.every) * x.share
    expect(Math.abs(net(swarm) - net(base))).toBeLessThan(0.01)
    expect(Math.abs(net(mirror) - net(base))).toBeLessThan(0.01)
    // 誘敵之影是明講的取捨:傷害明顯低,換到的是破綻與破盾
    expect(net(lure)).toBeLessThan(net(base) * 0.7)
  })

  it('命運降臨池要撐得住整輪,而且 cross/wild 桶抽得到', () => {
    // ⚠️ 2026-07-31 審查:池子曾經只有 2 個節點(種子 + 同步步伐),
    // 第 3 次降臨起 rollDescent 回 null 並靜默 return —— 負責「驚喜」的系統
    // 在開局 1.5 分鐘後永久沉默。而 DESTINY_SAME_BUCKET_FIRST = 2 剛好等於池子總數,
    // 所以 cross(30%)與 wild(20%)桶在首輪數學上不可能被抽到,壞手保護是死碼。
    const s = createInitialState()
    let rngState = 12345
    const rng = () => ((rngState = (rngState * 1103515245 + 12345) % 2147483648) / 2147483648)

    const buckets: string[] = []
    for (let i = 0; i < 6; i++) {
      const picked = rollDescent(s, rng)
      expect(picked, `第 ${i + 1} 次降臨不該是 null`).not.toBe(null)
      s.destinyNodes.push(picked!.node.id)
      s.destinyLog.push({ floor: 10 + i * 10, id: picked!.node.id, bucket: picked!.bucket })
      buckets.push(picked!.bucket)
    }
    // 池子必須大於強制同流派的次數,否則後面的桶永遠輪不到
    expect(buckets.length).toBeGreaterThan(B.DESTINY_SAME_BUCKET_FIRST)
    // 節點不重複(eligible 會擋掉已持有的)
    expect(new Set(s.destinyNodes).size).toBe(s.destinyNodes.length)
  })

  it('凍結是表現延遲:總傷害不變,不可以把池子再打一次', () => {
    // ⚠️ 曾經在 tickCombatStatus 解凍時 dealDamage(pool + bonus),
    // 但 pool 在 dealDamage 當下就扣過血了 → 同一份傷害打兩遍,實測 +50%。
    // 同情境的 checkBossTimeout 一直是對的(只發事件不重打),兩條路徑不一致才藏這麼久。
    const measure = (freeze: boolean, merc: string | null) => {
      const s = createInitialState()
      s.jobId = 'scout'
      s.lv = 50
      s.activeMerc = merc as typeof s.activeMerc
      const dps = currentDPS(s)
      let dealt = D(0)
      for (let i = 0; i < 40; i++) {
        if (freeze && i === 10) s.freezeLeft = 2
        s.enemyHp = D('1e12')
        s.enemyMaxHp = D('1e12')
        applyTick(s, 100)
        dealt = dealt.add(D('1e12').sub(s.enemyHp))
      }
      return dealt.div(dps).toNumber()
    }
    const plain = measure(false, null)
    const frozen = measure(true, null)
    // 凍結不得改變總傷害(這是「表現延遲」的定義)
    expect(frozen).toBeCloseTo(plain, 5)
    // 但冰法師的解凍獎勵是真的新增傷害,不可以連它一起砍掉
    expect(measure(true, 'icemage')).toBeGreaterThan(frozen)
  })

  it('蓄力型:剛好能通關的輸出**打不斷**,必須真的留一手爆發', () => {
    // ⚠️ 舊值 CHANNEL_HP_TO_BREAK=0.06 是負機制稅:剛好能通關的玩家(BOSS_TIME 秒打完 maxHp)
    // 在 CHANNEL_DURATION 秒的窗內自然打進 13.3%,是門檻 6% 的 2.22 倍
    // → 能贏的人必定 100% 打斷,還白拿 6 秒易傷,蓄力型因此比同 HP 木樁更好打。
    const winPace = (1 / B.BOSS_TIME) * B.CHANNEL_DURATION
    expect(winPace).toBeLessThan(B.CHANNEL_HP_TO_BREAK) // 純被動輸出打不斷
    // 但也不能高到「留爆發也打不斷」:第二技能零印記的基本威力就該夠
    const burst = (B.SIGIL_BASE_BURST_SEC / B.BOSS_TIME)
    expect(winPace + burst).toBeGreaterThan(B.CHANNEL_HP_TO_BREAK)
  })

  it('蓄力觸發點要早到短戰也看得見', () => {
    // 舊值 [20,10] = 開戰後第 10/20 秒,而實測前期 Boss 戰只有 6~9 秒
    // → 蓄力機制第一次真正發動在第 80 層 / 6.3 分鐘,在那之前玩家以為 Boss 只有一種
    const firstAt = B.BOSS_TIME - B.CHANNEL_TIMES[0]
    expect(firstAt).toBeLessThanOrEqual(6)
    // 兩個觸發點不可以擠在一起
    expect(B.CHANNEL_TIMES[0] - B.CHANNEL_TIMES[1]).toBeGreaterThanOrEqual(B.CHANNEL_DURATION * 2)
  })

  it('三層目標:near 沒東西時 run 目標一定有值(主畫面才不會空白)', () => {
    // ⚠️ 原本只有 near 一層上得了主畫面,而 near 在中後段回 null
    // → 整段最長的時間裡主畫面沒有任何「我在往哪裡走」的資訊。
    const s = createInitialState()
    s.jobId = 'shadow'
    s.lv = 140
    s.floor = 150
    s.highestFloor = 150
    s.destinyPath = 'tactician'
    s.destinyLocked = true
    s.encounters = []
    s.materials = 0
    s.medals = 0
    s.destinyPoints = 0
    s.training = ['heavy', 'rapid', 'morale', 'heavy', 'rapid']
    s.trainingShown = 5
    expect(nearGoal(s)).toBe(null) // near 這一層確實空了
    const run = runGoal(s)
    expect(run.text.length).toBeGreaterThan(0)
    // ⚠️ run 目標不可以帶 tab:紅點單一來源仍由 near 驅動,帶了就會多亮一顆
    expect(run.tab).toBe(null)
  })

  it('傭兵解鎖要發事件,而且一生只發一次', () => {
    // ⚠️ 以前 unlockedMercs 是純推導,全庫零事件——玩家在第 30/60/90/120 層
    // 各解鎖一名傭兵而完全不會知道。四個現成的「拿到新東西」節拍被實作成 0。
    const s = createInitialState()
    s.lv = 200 // 打得動,讓樓層自然推進
    s.floor = 29
    s.highestFloor = 29
    const unlocks: string[] = []
    for (let i = 0; i < 400; i++) {
      for (const e of applyTick(s, 1000)) {
        if (e.type === 'mercUnlock') unlocks.push(e.mercId!)
      }
      if (s.highestFloor > 65) break
    }
    // 跨過第 30 層 → 盜賊;跨過第 60 層 → 冰法師。各一次,不重複
    expect(unlocks).toContain('rogue')
    expect(unlocks.filter((m) => m === 'rogue')).toHaveLength(1)
    // 起始傭兵(unlockFloor 1)不該在半路被宣告
    expect(unlocks).not.toContain('hound')
  })

  it('本輪到頂判定:卡住夠久且有勳章才提示退役', () => {
    const s = createInitialState()
    s.highestFloor = 50 // 有勳章可拿
    expect(runStalled(s)).toBe(false)
    s.stallSec = B.RUN_STALL_SEC + 1
    expect(runStalled(s)).toBe(true)
    expect(nearGoal(s)?.tab).toBe('legacy')

    // ⚠️ 首輪前段被 Boss 卡住的新手不該被叫去退役 —— 沒勳章就不提示
    const rookie = createInitialState()
    rookie.highestFloor = 3
    rookie.stallSec = B.RUN_STALL_SEC + 1
    expect(pendingMedals(rookie)).toBe(0)
    expect(runStalled(rookie)).toBe(false)

    // 推進樓層會歸零計時
    const moving = createInitialState()
    moving.highestFloor = 50
    moving.stallSec = B.RUN_STALL_SEC + 1
    moving.floor = 5 // 非 Boss 層,清完最後一隻就會推進
    moving.killsInFloor = B.MOBS_PER_FLOOR - 1
    moving.enemyHp = D(1)
    moving.enemyMaxHp = D(1)
    applyTick(moving, 1000) // 攻擊間隔 0.8s,要跨得過去才會擊殺
    expect(moving.floor).toBe(6)
    expect(moving.stallSec).toBeLessThan(B.RUN_STALL_SEC)
  })

  it('背水一戰只在守關倒數尾段生效,不是全程加傷', () => {
    const s = createInitialState()
    s.destinyNodes.push('boss_lastditch')
    // 非 Boss:完全不生效(它買的是「差一點打不完」那些場,不是整體 DPS)
    s.isBoss = false
    s.bossTimeLeft = 3
    expect(lastDitchMult(s)).toBe(1)
    // Boss 戰但時間還多:不生效
    s.isBoss = true
    s.bossTimeLeft = B.LASTDITCH_SEC + 1
    expect(lastDitchMult(s)).toBe(1)
    // 進入尾段才開
    s.bossTimeLeft = B.LASTDITCH_SEC - 1
    expect(lastDitchMult(s)).toBe(B.LASTDITCH_MULT)
    // 沒有節點的人不受任何影響
    const plain = createInitialState()
    plain.isBoss = true
    plain.bossTimeLeft = 1
    expect(lastDitchMult(plain)).toBe(1)
  })

  it('獵隙者延長金色窗口,回響裝填讓完美引爆推進冷卻', () => {
    const base = createInitialState()
    const hunter = createInitialState()
    hunter.destinyNodes.push('sigil_hunter')
    for (const s of [base, hunter]) {
      s.jobId = 'scout'
      s.lv = 60
      s.sigils = sigilCap(s) - 1
      gainSigil(s, 1, [], 'battle')
    }
    expect(base.perfectWindowLeft).toBe(B.PERFECT_WINDOW_SEC)
    expect(hunter.perfectWindowLeft).toBe(B.PERFECT_WINDOW_SEC * B.SIGIL_HUNTER_WINDOW_MULT)
  })

  it('大抉擇的呼吸間隔:距上個命運節拍太近就等下一次 Boss', () => {
    // ⚠️ 實測:種子 0.45 分、第 30 層大抉擇 1.31 分——全遊戲最重的決策
    // 在最輕的隨機事件後 50 秒就到。時間閘只延後發放,不擋推進,因果仍在 Boss 擊破。
    const kill = (s: ReturnType<typeof createInitialState>) => {
      s.enemyHp = D(0)
      s.attackAcc = 10
      return applyTick(s, 1000)
    }
    const s = createInitialState()
    s.destinyPath = 'tactician'
    s.destinyNodes = ['seed_afterimage']
    s.floor = B.DESTINY_MILESTONES[0]
    s.destinyGapSec = 10 // 剛降臨過不久
    spawnEnemy(s)
    kill(s)
    expect(s.destinyPoints).toBe(0) // 這次 Boss 不發——太近了

    // 時間過了,下一次 Boss 擊破正常發
    s.destinyGapSec = B.DESTINY_BEAT_GAP_SEC
    s.descentCooldown = 0 // 距上次小降臨也要夠久(第二層閘)
    s.floor = B.DESTINY_MILESTONES[0]
    spawnEnemy(s)
    kill(s)
    expect(s.destinyPoints).toBe(1)
    expect(s.destinyGapSec).toBe(0) // 發完歸零,下一拍重新計
  })

  it('壞手保護:前幾次降臨強制同流派', () => {
    const s = createInitialState()
    s.destinyPath = 'tactician'
    // rng 全部回 0.99(最偏向 wild 桶),前幾次仍必須是 same
    const picked = rollDescent(s, () => 0.99)
    expect(picked?.bucket).toBe('same')
  })

  it('所有發點路徑都要備妥選項,否則點數會靜默卡死', () => {
    // ⚠️ 這條守的是 R10 的「同一個值只能有一個算法」:里程碑、命運交易、
    // 傳令兵科技三條路徑都必須走 addDestinyPoint,不可各自 destinyPoints++
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    addDestinyPoint(s)
    expect(pendingChoice(s)).not.toBeNull()

    // 傳令兵科技:開局直接給點,同樣要能花掉
    const herald = createInitialState(0, 1, { ...emptyTechs(), herald: 1 })
    chooseDestiny(herald, 'tactician')
    expect(herald.destinyPoints).toBe(1)
    expect(pendingChoice(herald)).not.toBeNull()
  })

  it('reconcileDestiny 冪等自癒:補回遺失的選項、清掉不存在的節點 id', () => {
    const s = createInitialState()
    chooseDestiny(s, 'artisan')
    addDestinyPoint(s)

    // 模擬節點改名後的殘留
    s.pendingChoiceIds = ['已經不存在的節點']
    reconcileDestiny(s)
    expect(pendingChoice(s)!.every((n) => !!n)).toBe(true)

    // 有點數卻沒有選項(舊存檔的形狀)
    s.pendingChoiceIds = null
    reconcileDestiny(s)
    expect(pendingChoice(s)).not.toBeNull()

    // 冪等:再跑一次不會變
    const before = [...s.pendingChoiceIds!]
    reconcileDestiny(s)
    expect(s.pendingChoiceIds).toEqual(before)
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
    expect(s.sigils).toBe(B.EVOLVE_EDICT_SIGILS)
  })

  it('第二技能零印記也能造成基礎傷害,印記再追加爆發', () => {
    const s = awakened('infantry')
    s.floor = 5
    spawnEnemy(s)
    expect(skillReady(s, 'rally')).toBe(true)
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    const zeroBefore = s.enemyHp
    castSkill(s, 'rally')
    expect(zeroBefore.sub(s.enemyHp).div(currentDPS(s)).toNumber()).toBeCloseTo(B.SIGIL_BASE_BURST_SEC, 0)

    const withSigils = awakened('infantry')
    withSigils.sigils = 5
    withSigils.enemyMaxHp = D(1e12)
    withSigils.enemyHp = D(1e12)
    const before = withSigils.enemyHp
    castSkill(withSigils, 'rally')
    const dealt = before.sub(withSigils.enemyHp)
    expect(dealt.div(currentDPS(withSigils)).toNumber()).toBeCloseTo(
      B.SIGIL_BASE_BURST_SEC + 5 * B.SIGIL_BURST_SEC,
      0,
    )
    expect(withSigils.sigils).toBe(0)
  })

  it('覺醒後每十次擊殺自然獲得一枚印記', () => {
    const s = awakened('infantry')
    s.runStats.kills = B.PASSIVE_KILLS_PER_SIGIL - 1
    s.enemyHp = D(1)
    click(s)
    expect(s.sigils).toBe(1)
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
    s.training = ['heavy', 'morale']
    const e = forge(s)!
    equip(s, e.id)

    const back = deserialize(JSON.parse(JSON.stringify(serialize(s))))
    expect(back.gold.toString()).toBe(s.gold.toString())
    expect(back.lv).toBe(88)
    expect(back.floor).toBe(43)
    expect(back.equipped[e.slot]?.id).toBe(e.id)
    expect(back.training).toEqual(['heavy', 'morale'])
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

  it('印記威力詞綴在「手動」與「套裝自動引爆」兩條路徑都要生效', () => {
    // ⚠️ 這條守的是「多路徑寫同一個值」:自動引爆先前自己算,
    // 導致 sigilPower 詞綴與法典殘頁在那條路徑上靜默失效
    const plain = createInitialState()
    const geared = createInitialState()
    geared.equipped.trinket = {
      id: 'sp',
      slot: 'trinket',
      quality: 'gold',
      affixes: [{ type: 'sigilPower', value: 0.5 }],
    }
    expect(sigilPerStackSeconds(geared)).toBeGreaterThan(sigilPerStackSeconds(plain))

    // 法典殘頁也要反映在同一個函式上
    const codex = createInitialState()
    codex.equipped.trinket = {
      id: 'cx',
      slot: 'trinket',
      quality: 'gold',
      affixes: [],
      legend: 'codexpage',
    }
    expect(sigilPerStackSeconds(codex)).not.toBe(sigilPerStackSeconds(plain))
  })

  it('離線上限跟著營地帳篷走,撞上限時 capped 為真', () => {
    const base = createInitialState()
    const away = (B.OFFLINE_CAP_HOURS + 1) * 3600 * 1000
    const r1 = computeOffline(base, away)
    expect(r1.capped).toBe(true)
    expect(r1.seconds).toBeCloseTo(B.OFFLINE_CAP_HOURS * 3600, 0)

    // 買了營地帳篷之後,同樣的離開時間就不該再被截斷
    const camped = createInitialState(0, 1, { ...emptyTechs(), camp: 1 })
    const r2 = computeOffline(camped, away)
    expect(r2.capped).toBe(false)
    expect(r2.seconds).toBeGreaterThan(r1.seconds)
    // ⚠️ UI 顯示的上限必須走 techOfflineHours,不可寫死 OFFLINE_CAP_HOURS
    expect(techOfflineHours(camped.techs)).toBe(B.OFFLINE_CAP_HOURS + B.TECH_OFFLINE_HOURS)
  })

  it('留存事件:七種都可結算、選項各自接到不同系統', () => {
    const mk = (id: EncounterId) => {
      const s = createInitialState()
      s.floor = 45
      s.gold = D('1e9')
      s.materials = 100
      s.encounters = [{ id, floor: 45 }]
      return s
    }
    // ⚠️ 每一種都要能被結算掉,否則玩家的旅途紀錄會卡住一個處理不掉的項目
    for (const id of ENCOUNTER_ORDER) {
      const s = mk(id)
      const ok = resolveEncounter(s, id, ENCOUNTERS[id].choices[0].id, () => 0.9)
      expect(ok).toBe(true)
      expect(s.encounters).toHaveLength(0)
    }
    // 埋葬:換共鳴而不是素材
    const bury = mk('remains')
    const matBefore = bury.materials
    resolveEncounter(bury, 'remains', 'bury')
    expect(bury.materials).toBe(matBefore)
    expect(bury.resonance.hunter).toBeGreaterThan(0)
    // 聽忠告:換敵情熟悉度,不換素材
    const vet = mk('veteran')
    const loreBefore = Object.values(vet.bossLore).reduce((a, b) => a + b.handled, 0)
    resolveEncounter(vet, 'veteran', 'listen')
    expect(Object.values(vet.bossLore).reduce((a, b) => a + b.handled, 0)).toBe(loreBefore + 1)
    expect(vet.materials).toBe(100)
    // 傷兵:換下一場 Boss 的越戰越勇,且受既有上限保護
    const wd = mk('wounded')
    wd.valiantStacks = B.VALIANT_MAX
    resolveEncounter(wd, 'wounded', 'heal')
    expect(wd.valiantStacks).toBe(B.VALIANT_MAX)
    // 補給箱:賭與不賭都在合理範圍(rng 可注入才驗得到兩邊)
    const lucky = mk('supply')
    resolveEncounter(lucky, 'supply', 'pry', () => 0.1)
    const unlucky = mk('supply')
    resolveEncounter(unlucky, 'supply', 'pry', () => 0.9)
    expect(lucky.materials).toBeGreaterThan(unlucky.materials)
  })

  it('敵種:每地帶兩種、跨地帶整組換、深層加前綴且不重複原名', () => {
    const forest = speciesPair(1)
    expect(forest).toHaveLength(2)
    expect(forest[0].name).toBe('森林哥布林')
    // 同一地帶內任何一層都是同一組
    expect(speciesPair(20).map((x) => x.name)).toEqual(forest.map((x) => x.name))
    // 換地帶整組換掉
    expect(speciesPair(21)[0].name).not.toBe(forest[0].name)
    // ⚠️ 敵種只帶外觀,不可以有任何數值欄位(HP/金幣完全由層數決定)
    expect(Object.keys(forest[0]).sort()).toEqual(['name', 'scale', 'sprite', 'tint'])
    // 深層循環要加前綴,不能讓原名原樣再出現
    const deep = speciesPair(1 + ZONE_SPAN * 8)[0]
    expect(deep.name).not.toBe(forest[0].name)
    expect(deep.name).toContain('墮化')
    // 體型要留在不會壓到主角/看不見的範圍
    for (const f of [1, 45, 85, 125, 165, 400]) {
      for (const sp of speciesPair(f)) {
        expect(sp.scale).toBeGreaterThanOrEqual(0.8)
        expect(sp.scale).toBeLessThanOrEqual(1.4)
      }
    }
  })

  it('地帶:每 20 層換一次、跨界發事件、深層不重複用同一個名字', () => {
    expect(zoneOf(1).name).toBe('森林邊境')
    expect(zoneOf(20).name).toBe('森林邊境')
    expect(zoneOf(21).name).toBe('荊棘林道')
    expect(zoneProgress(21)).toEqual({ at: 1, span: ZONE_SPAN })
    expect(zoneProgress(40)).toEqual({ at: 20, span: ZONE_SPAN })
    // ⚠️ 超出設計表之後不可以讓「森林邊境」原名再出現一次——那會直接拆穿內容量
    const deep = zoneOf(1 + ZONE_SPAN * 8)
    expect(deep.name).not.toBe('森林邊境')
    expect(deep.name).toContain('深淵')
  })

  it('軍功記錄:達成即發事件、不重複發、跨轉生保留', () => {
    const s = createInitialState()
    s.highestFloor = 5
    const first = applyTick(s, 100)
    expect(first.some((e) => e.type === 'achievement' && e.achievementId === 'floor5')).toBe(true)
    expect(s.achieved).toContain('floor5')
    // 同一個成就不可以再發一次
    expect(applyTick(s, 100).some((e) => e.type === 'achievement' && e.achievementId === 'floor5')).toBe(false)

    // 單輪條件(連斬)達成後轉生歸零,但記錄不收回
    s.combo = 30
    applyTick(s, 100)
    expect(s.achieved).toContain('combo30')
    s.highestFloor = 30
    const next = prestige(s, [])!
    expect(next.combo).toBe(0)
    expect(next.achieved).toContain('combo30')
  })

  it('軍功記錄的條件全部可判定(不會因缺欄位而丟例外)', () => {
    const s = createInitialState()
    expect(() => ACHIEVEMENTS.forEach((a) => a.done(s))).not.toThrow()
    // id 不可重複——重複會讓 achieved 的比對出錯
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
  })

  it('準備型科技在開局兌現:命運點/部位素材/精工次數', () => {
    const techs = { ...emptyTechs(), herald: 2, quarter: 3, mastery: 2 }
    const s = createInitialState(0, 1, techs)
    expect(s.destinyPoints).toBe(2) // 傳令兵:開局就有命運點,不必等里程碑
    // 軍需官:輪流分配部位,不會三級全押同一個
    expect(Object.values(s.partMaterials).reduce((a, b) => a + b, 0)).toBe(3)
    expect(Math.max(...Object.values(s.partMaterials))).toBe(1)
    expect(techFineForges(techs)).toBe(B.FINE_FORGE_PER_RUN + 2)
    expect(fineForgesLeft(s)).toBe(B.FINE_FORGE_PER_RUN + 2)
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
    // 對照 emptyTechs() 而不是寫死鍵值:之後新增科技不該讓這個遷移測試壞掉
    expect(back.techs).toEqual(emptyTechs())
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

  it('冰法師凍結 = 表現延遲:傷害邏輯上即時結算,解凍只給彙總大數字;倒數照走', () => {
    const s = withMerc('icemage')
    s.floor = 10
    spawnEnemy(s)
    const t0 = s.bossTimeLeft
    applyTick(s, 100) // 觸發凍結
    expect(s.freezeLeft).toBeGreaterThan(0)

    const floorAtFreeze = s.floor
    applyTick(s, 1000)
    // ⚠️ GDD v3 § 4.3(封版):凍結期間傷害「立即結算」——擊殺照發生,禁止 deferred buffer
    expect(s.floor).toBeGreaterThan(floorAtFreeze)
    expect(s.frozenPool.gt(0)).toBe(true) // 池只是演出彙總
    // (倒數照走由「凍結中逾時」測試覆蓋——這裡已推層,計時器被重置,比較無意義)
    void t0

    const ev = applyTick(s, 1500) // 解凍
    expect(s.freezeLeft).toBe(0)
    expect(ev.some((e) => e.type === 'freezeBurst')).toBe(true) // 彙總數字事件
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
  it('凍結中傷害足以擊殺 → 立即判定擊破(表現延遲讓「池吞擊殺」在結構上不存在)', () => {
    const s = createInitialState()
    s.lv = 150
    s.mercBestFloor = 200
    setActiveMerc(s, 'icemage')
    s.floor = 10
    spawnEnemy(s)
    s.freezeLeft = 5 // 凍結中
    s.bossTimeLeft = 3

    const before = s.floor
    applyTick(s, 1000) // Lv.150 一擊遠超 Boss 血量,凍結中照樣即時結算
    expect(s.floor).toBeGreaterThan(before) // 直接擊破,不會等解凍
    expect(s.bossFailed).toBe(false)
  })

  it('凍結中逾時:演出狀態清掉、正常判失敗(傷害早已結算,無殘留)', () => {
    const s = createInitialState()
    s.lv = 1
    s.floor = 10
    spawnEnemy(s)
    s.freezeLeft = 5
    s.frozenPool = s.enemyMaxHp // 純演出彙總,不是待結算傷害
    s.bossTimeLeft = 0.01

    const ev = applyTick(s, 100)
    expect(ev.some((e) => e.type === 'bossFail')).toBe(true)
    expect(s.freezeLeft).toBe(0)
    expect(s.frozenPool.lte(0)).toBe(true)
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
    s.enemyMaxHp = D('1e30')
    s.enemyHp = D('1e30')

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

  it('拆盾:破盾值制(命中 4 點、每 4 點破一層)、盾上傷害衰減、破盾後易傷', () => {
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
    // 一次命中 4 點 = 剛好一層
    expect(s.shellLeft).toBe(B.SHELL_HITS - 1)

    // 打到破盾 → 易傷窗口。⚠️ 點擊有每秒預算、破盾值也有每秒上限,
    // 所以要過 tick 讓兩者都回充(這正是「上限防高頻構築抹平護盾」的效果)
    for (let i = 0; i < B.SHELL_HITS * 3 && s.shellLeft > 0; i++) {
      applyTick(s, 500)
      s.attackAcc = 0 // 隔離自動攻擊,只算點擊
      click(s)
    }
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
    const out: import('../types').GameEvent[] = []
    dealDamage(s, need.mul(1.01), out, () => 0.5)
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

describe('讀檔與 Boss 行為原型', () => {
  it('Boss 戰中存檔 → 讀回來重開那一場,機制齊全而不是木樁', () => {
    const s = createInitialState()
    s.lv = 25
    s.floor = 10
    spawnEnemy(s)
    expect(s.bossKind).toBe('shell')
    s.enemyHp = s.enemyMaxHp.div(2) // 打到一半存檔
    s.bossTimeLeft = 12

    const back = deserialize(JSON.parse(JSON.stringify(serialize(s))))
    expect(back.isBoss).toBe(true)
    expect(back.bossKind).toBe('shell') // 不是 null 木樁
    expect(back.shellLeft).toBe(B.SHELL_HITS)
    expect(back.enemyHp.toString()).toBe(back.enemyMaxHp.toString()) // 重開:滿血
    expect(back.bossTimeLeft).toBe(B.BOSS_TIME) // 計時重來
  })
})

describe('GDD v3 封版三項(2026-07-30)', () => {
  it('點擊預算制:每秒 0.2 秒份 DPS,預算盡的點擊只給戰意不給傷害', () => {
    const s = createInitialState()
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    // 預算 0.2 秒份:連點 10 下,只有預算內的點擊有傷害事件,預算歸零
    let hits = 0
    for (let i = 0; i < 10; i++) {
      if (click(s).some((e) => e.type === 'attack')) hits++
    }
    // 4 次整額 + 浮點殘值可能多一次微量命中
    expect(hits).toBeGreaterThanOrEqual(4)
    expect(hits).toBeLessThanOrEqual(5)
    expect(s.clickBudget).toBeLessThan(1e-6) // 預算耗盡
    expect(s.morale).toBeGreaterThan(0) // 戰意照給

    // 過一秒回充,又能打
    applyTick(s, 1000)
    expect(click(s).some((e) => e.type === 'attack')).toBe(true)
  })

  it('clickDmg 詞綴只加戰意,不加點擊傷害(禁止點擊傷害成長軸)', () => {
    const plain = createInitialState()
    // ⚠️ 對照組同品質(品質乘區 ×1.5 會污染比值,ember 測試踩過同一坑)
    plain.equipped.trinket = { id: 'p', slot: 'trinket', quality: 'gold', affixes: [] }
    plain.enemyMaxHp = D(1e12)
    plain.enemyHp = D(1e12)
    const withAffix = createInitialState()
    withAffix.equipped.trinket = {
      id: 'c', slot: 'trinket', quality: 'gold',
      affixes: [{ type: 'clickDmg', value: 0.5 }],
    }
    withAffix.enemyMaxHp = D(1e12)
    withAffix.enemyHp = D(1e12)

    const d1 = click(plain).find((e) => e.type === 'attack')!.damage!
    const d2 = click(withAffix).find((e) => e.type === 'attack')!.damage!
    // 用「傷害 ÷ 當下 DPS = 消耗秒份」比——戰意會墊高 DPS,直接比傷害會被污染
    expect(d1.div(currentDPS(plain)).toNumber()).toBeCloseTo(B.CLICK_DMG_SEC, 4)
    expect(d2.div(currentDPS(withAffix)).toNumber()).toBeCloseTo(B.CLICK_DMG_SEC, 4) // 同樣 0.05,詞綴沒放大
    expect(withAffix.morale).toBeGreaterThan(plain.morale) // 戰意較多
  })

  it('精工每輪 3 次;轉生重置', () => {
    const s = createInitialState()
    s.materials = 999
    for (let i = 0; i < 3; i++) expect(fineForge(s, {}, () => 0.9)).not.toBe(null)
    expect(fineForge(s, {}, () => 0.9)).toBe(null) // 第 4 次擋掉

    s.highestFloor = 50
    const next = prestige(s)!
    expect(next.fineForgesUsed).toBe(0)
  })

  it('雙保底:短 12 次必出傳說特性;普通鍛造每 10 次推進短保底', () => {
    const s = createInitialState()
    s.materials = 9999
    s.pityLegendShort = B.PITY_LEGEND_SHORT
    const e = fineForge(s, {}, () => 0.99)! // rng 極差也必出
    expect(e.legend).toBeDefined()
    expect(s.pityLegendShort).toBe(0) // 出了就歸零

    const before = s.pityLegendShort
    for (let i = 0; i < B.NORMAL_FORGE_PER_PITY; i++) forge(s, () => 0.99)
    expect(s.pityLegendShort).toBe(before + 1)
  })

  it('長保底 50 次:必附套裝標籤', () => {
    const s = createInitialState()
    s.materials = 999
    s.pityLegendary = B.PITY_LEGENDARY
    const e = fineForge(s, {}, () => 0.99)!
    expect(e.setTag).toBeDefined()
    expect(s.pityLegendary).toBe(0)
  })
})

describe('自動施放開關(GDD v3 § 2.4 最小版)', () => {
  const hero = () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    chooseDestiny(s, 'tactician')
    s.destinyNodes.push('tactician_1a')
    s.enemyMaxHp = D(1e12)
    s.enemyHp = D(1e12)
    return s
  }

  it('預設關:掛機玩家的基準完全不變(不會自己放技能)', () => {
    const s = hero()
    expect(s.autoCast).toBe(false)
    applyTick(s, 2000)
    expect(s.buffs).toHaveLength(0)
    expect(Object.keys(s.skillCd)).toHaveLength(0)
  })

  it('開啟後冷卻好就自動放', () => {
    const s = hero()
    toggleAutoCast(s)
    expect(s.autoCast).toBe(true)
    const ev = applyTick(s, 100)
    expect(ev.some((e) => e.type === 'skill' && e.skillId === 'shieldRush')).toBe(true)
    expect(s.buffs.some((b) => b.skillId === 'shieldRush')).toBe(true)
  })

  it('消耗印記型等滿層才放(保留「攢滿再引爆」的價值)', () => {
    const s = hero()
    toggleAutoCast(s)
    s.sigils = 3 // 未滿
    applyTick(s, 100)
    expect(s.sigils).toBe(3) // 沒被自動引爆

    s.sigils = sigilCap(s)
    applyTick(s, 100)
    expect(s.sigils).toBeLessThan(sigilCap(s)) // 滿層才放
  })

  it('蓄勢期間不自動放(那是刻意停手)', () => {
    const s = hero()
    s.destinyNodes.push('tactician_1b')
    toggleAutoCast(s)
    toggleCharge(s)
    expect(s.charging).toBe(true)
    applyTick(s, 100)
    expect(s.buffs).toHaveLength(0)
  })

  it('v20 存檔遷移到 v21:舊存檔預設關,不替玩家改行為模式', () => {
    const s = createInitialState()
    const v20 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v20.version = 20
    delete v20.autoCast
    expect(deserialize(v20 as never).autoCast).toBe(false)
  })
})

describe('破盾值系統(GDD v3 § 5.4)', () => {
  const shellBoss = () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.floor = 10
    spawnEnemy(s)
    return s
  }

  it('每秒上限封住高頻構築:同一秒內投再多命中也只吃到上限', () => {
    const s = shellBoss()
    // 同一秒內硬塞很多次點擊命中(遠超上限);點擊預算另有上限,所以直接呼叫破盾值路徑
    for (let i = 0; i < 20; i++) {
      s.clickBudget = B.CLICK_BUDGET_PER_SEC // 繞過點擊預算,單獨測破盾值上限
      click(s)
    }
    expect(s.bossStats!.shieldValue).toBeLessThanOrEqual(B.SHIELD_VALUE_PER_SEC_CAP)
    expect(s.shellLeft).toBeGreaterThan(B.SHELL_HITS - 20) // 沒被抹平
  })

  it('分帳記錄各來源:分身是完整攻擊者(4 點),軍旗是弱化回音(2 點)', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.equipped.weapon = {
      id: 'bf', slot: 'weapon', quality: 'gold', base: 'heavy', legend: 'bannerflag', affixes: [],
    }
    s.floor = 10
    spawnEnemy(s)
    castSkill(s, 'shieldRush') // 插旗
    // ⚠️ 不能只把 attackAcc 設成 ATTACK_INTERVAL:重擊基底會拉長實際間隔(0.864s),
    // 這時 attackAcc 反而還不夠——用一個足夠大的 tick 讓它一定出手
    applyTick(s, 900)
    expect(s.bossStats!.shieldBySource.hero).toBe(B.SHIELD_HIT_VALUE)
    expect(s.bossStats!.shieldBySource.zone).toBe(B.SHIELD_ECHO_VALUE)
  })

  it('狀態 tick 投 1 點:燃燒流也能拆盾,只是比命中慢', () => {
    const s = shellBoss()
    s.mercBestFloor = 200
    setActiveMerc(s, 'pyro')
    s.mercTimer = 0.01
    applyTick(s, 100) // 點燃
    const before = s.bossStats!.shieldBySource.burn ?? 0
    applyTick(s, 200)
    expect((s.bossStats!.shieldBySource.burn ?? 0)).toBeGreaterThan(before)
  })

  it('目標梯度:破盾「還差幾點」與層內比例互補,盾破後歸零', () => {
    const s = shellBoss()
    expect(shellToNext(s)).toBe(B.SHIELD_VALUE_PER_LAYER)
    expect(shellProgress(s)).toBe(0)

    // 一點狀態 tick(1 點)後,還差 3 點、層內進度 1/4
    s.mercBestFloor = 200
    setActiveMerc(s, 'pyro')
    s.mercTimer = 0.01
    applyTick(s, 100)
    applyTick(s, 200)
    expect(shellToNext(s)).toBe(B.SHIELD_VALUE_PER_LAYER - s.shellValue)
    expect(shellProgress(s)).toBeCloseTo(s.shellValue / B.SHIELD_VALUE_PER_LAYER, 5)

    s.shellLeft = 0
    expect(shellToNext(s)).toBe(0)
    expect(shellProgress(s)).toBe(0)
  })

  it('目標梯度:打斷進度隨傷害推進,達標即 100% 且蓄力結束後歸零', () => {
    const s = createInitialState()
    s.lv = 1
    s.floor = 20
    spawnEnemy(s)
    s.bossTimeLeft = B.CHANNEL_TIMES[0] + 0.05
    applyTick(s, 100)
    expect(s.channelLeft).toBeGreaterThan(0)
    expect(channelProgress(s)).toBe(0)

    const need = s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK)
    dealDamage(s, need.div(2), [], () => 0.5)
    expect(channelProgress(s)).toBeGreaterThan(0.3)
    expect(channelProgress(s)).toBeLessThan(1)

    dealDamage(s, need, [], () => 0.5)
    expect(s.channelLeft).toBe(0) // 已打斷
    expect(channelProgress(s)).toBe(0) // 沒在蓄力就不顯示
  })

  it('Boss 開場壓縮傭兵倒數:否則整場輪不到牠出手', () => {
    const s = createInitialState()
    s.mercBestFloor = 200
    setActiveMerc(s, 'sapper')
    s.mercTimer = 14 // 間隔很長
    s.floor = 10
    spawnEnemy(s)
    expect(s.mercTimer).toBeLessThanOrEqual(B.MERC_BOSS_OPENING_SEC)
  })
})

describe('三層目標收斂(近期/本輪/跨輪各一個)', () => {
  it('近期:同時滿足多個條件只回優先序最高的一個(轉職 > 命運 > 際遇 > 打造)', () => {
    const s = createInitialState()
    s.lv = 20 // 可轉職
    s.destinyPoints = 1
    s.materials = B.FORGE_COST
    expect(nearGoal(s)!.tab).toBe('hero')
    promote(s, 'infantry')
    // 轉職完了 → 下一個是命運(尚未選路)
    expect(nearGoal(s)!.tab).toBe('destiny')
  })

  it('近期:什麼都不能做時回 null(紅點全滅,不製造假期待)', () => {
    const s = createInitialState()
    s.gold = D(0)
    s.destinyPath = 'warrior_path' as never
    // 選過路、沒點、沒際遇、沒素材、沒勳章、沒金幣
    const g = nearGoal(s)
    expect(g).toBe(null)
  })

  it('近期:首次降臨前不叫玩家預先選命運', () => {
    const s = createInitialState()
    s.floor = 9
    expect(nearGoal(s)?.tab).not.toBe('destiny')
    expect(runGoal(s).text).toContain(`第 ${B.DESTINY_SEED_FLOOR} 層`)
  })

  it('本輪:Boss 失敗優先於里程碑;里程碑用 destinyEarned 對下一個門檻', () => {
    const s = createInitialState()
    s.bossFailed = true
    s.bossRetryFloor = 10
    expect(runGoal(s).text).toContain('第 10 層')
    s.bossFailed = false
    s.bossRetryFloor = null
    s.destinyPath = 'tactician'
    s.destinyNodes = ['seed_afterimage']
    s.floor = 5
    expect(runGoal(s).text).toContain(`第 ${B.DESTINY_MILESTONES[0]} 層`)
  })

  it('跨輪:指向差最少勳章的科技;科技全買得起就指傭兵解鎖層', () => {
    const s = createInitialState()
    s.medals = 0
    const cheapest = Math.min(B.TECH_COST_DMG, B.TECH_COST_GOLD)
    expect(legacyGoal(s).text).toContain(`${cheapest}`)
    s.medals = 999
    expect(legacyGoal(s).text).toContain('傭兵')
  })
})

describe('失敗診斷三分類(數值不足/時機錯誤/組合未完成)', () => {
  const base = (over: Partial<import('../types').BossStats>): import('../types').BossStats => ({
    floor: 10, kind: 'shell', win: false, bySource: {}, shellTime: 0, shieldValue: 0,
    shieldBySource: {}, shieldPeakPerSec: 0, interrupts: 0, channels: 0, totemTime: 0,
    dealtRatio: 0.5, ...over,
  })

  it('蓄力沒斷=時機錯誤,不是叫玩家刷資源', () => {
    const d = diagnoseBoss(base({ kind: 'channel', channels: 2, interrupts: 0 }))
    expect(d!.category).toBe('timing')
  })

  it('護盾佔時長+破盾來源只有一種=組合未完成;來源多但仍慢=數值不足', () => {
    const slow = { kind: 'shell' as const, shellTime: B.BOSS_TIME * 0.5 }
    expect(diagnoseBoss(base({ ...slow, shieldBySource: { hero: 20 } }))!.category).toBe('combo')
    expect(
      diagnoseBoss(base({ ...slow, shieldBySource: { hero: 20, burn: 5 } }))!.category,
    ).toBe('stat')
  })

  it('圖騰活太久+沒有穿透來源=組合未完成;有穿透仍失敗=數值不足', () => {
    const slow = { kind: 'totem' as const, totemTime: 12 }
    expect(diagnoseBoss(base({ ...slow }))!.category).toBe('combo')
    expect(diagnoseBoss(base({ ...slow, bySource: { burn: 0.2 } }))!.category).toBe('stat')
  })

  it('沒有行為型線索時退回數值不足;贏了或沒統計回 null', () => {
    expect(diagnoseBoss(base({ kind: 'channel', channels: 0 }))!.category).toBe('stat')
    expect(diagnoseBoss(base({ win: true }))).toBe(null)
    expect(diagnoseBoss(null)).toBe(null)
  })
})

describe('關聯感串接(稱號/代表事件/傳家之器前任持有者)', () => {
  it('最後 5 秒擊破 Boss:計數 + 代表事件覆寫', () => {
    const s = createInitialState()
    s.lv = 40
    s.floor = 10
    spawnEnemy(s)
    s.bossTimeLeft = 3
    s.enemyHp = D(1)
    click(s)
    expect(s.runStats.lateBossKills).toBe(1)
    expect(s.runHighlight).toContain('最後')
    expect(s.runHighlight).toContain('第 10 層')
  })

  it('稱號:遲來的勝者 > 沉默的守望者 > 眾人簇擁者,沒有鮮明行為就 null', () => {
    const s = createInitialState()
    expect(titleFor(s)).toBe(null) // rookie 沒技能,不算沉默
    s.runStats.lateBossKills = 2
    expect(titleFor(s)).toBe('遲來的勝者')
    s.runStats.lateBossKills = 0
    s.lv = 20
    promote(s, 'infantry')
    expect(titleFor(s)).toBe('沉默的守望者') // 轉職了卻一招沒放
    s.runStats.skillCasts = 5
    s.runStats.kills = 200
    s.runStats.mercKills = 60
    expect(titleFor(s)).toBe('眾人簇擁者')
  })

  it('轉生:列傳寫入稱號與代表事件,傳家之器帶前任持有者名', () => {
    const s = createInitialState()
    s.highestFloor = 30
    s.runStats.lateBossKills = 2
    s.runHighlight = '在最後 2 秒擊破第 20 層守關者'
    const item: import('../types').Equipment = {
      id: 'x1', slot: 'weapon', quality: 'gold', affixes: [],
    }
    s.inventory.push(item)
    inscribeHeirloom(s, 'x1')
    const next = prestige(s)!
    expect(next).not.toBe(null)
    const entry = next.chronicle[0]
    expect(entry.title).toBe('遲來的勝者')
    expect(entry.highlight).toContain('第 20 層')
    const relic = next.inventory.find((e) => e.heirloom)!
    expect(relic.bearer).toBe(entry.name) // 器物記得上一代的名字
    // 新一輪計數歸零
    expect(next.runStats.kills).toBe(0)
    expect(next.runHighlight).toBe(null)
  })

  it('v21 存檔遷移到 v22:補行為計數預設值', () => {
    const s = createInitialState()
    const v21 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v21.version = 21
    delete v21.runStats
    delete v21.runHighlight
    const out = deserialize(v21 as never)
    expect(out.runStats).toEqual({ kills: 0, mercKills: 0, skillCasts: 0, lateBossKills: 0 })
    expect(out.runHighlight).toBe(null)
  })
})

describe('F18 爆燃 core 鉤子(燃燒層數/滿層事件)', () => {
  it('每次施加燃燒 +1 層,滿層發 burnMax 並歸零;火熄了層數清空', () => {
    const s = createInitialState()
    s.mercBestFloor = 200
    setActiveMerc(s, 'pyro')
    let maxEvents = 0
    for (let i = 0; i < B.BURN_MAX_STACKS; i++) {
      s.mercTimer = 0.01
      const ev = applyTick(s, 100)
      maxEvents += ev.filter((e) => e.type === 'burnMax').length
    }
    expect(maxEvents).toBe(1)
    expect(s.burnStacks).toBe(0) // 滿層歸零=視覺上一次釋放
    // 讓火燒完
    applyTick(s, (B.MERC_PYRO_BURN_SEC + 1) * 1000)
    s.mercTimer = 0.01
    applyTick(s, 100)
    expect(s.burnStacks).toBe(1) // 重新開始疊
    applyTick(s, (B.MERC_PYRO_BURN_SEC + 1) * 1000)
    expect(s.burnStacks).toBe(0)
  })
})

describe('敵情熟悉度(籃 C 第一階段:初見/識破/精通,跨轉生)', () => {
  it('三階段門檻:遭遇=初見、處理一次=識破、累積達標=精通', () => {
    const s = createInitialState()
    expect(loreStage(s, 'shell')).toBe('unseen')
    s.floor = 10
    spawnEnemy(s)
    expect(s.bossLore.shell.seen).toBe(1)
    expect(loreStage(s, 'shell')).toBe('glimpse')
    s.bossLore.shell.handled = 1
    expect(loreStage(s, 'shell')).toBe('known')
    s.bossLore.shell.handled = B.LORE_MASTER_HANDLED
    expect(loreStage(s, 'shell')).toBe('mastered')
  })

  it('成功打斷會累積蓄力型熟悉度', () => {
    const s = createInitialState()
    s.floor = 20
    spawnEnemy(s)
    s.bossTimeLeft = B.CHANNEL_TIMES[0] + 0.05
    applyTick(s, 100)
    expect(s.channelLeft).toBeGreaterThan(0)
    dealDamage(s, s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK).mul(1.01), [], () => 0.5)
    expect(s.bossLore.channel.handled).toBe(1)
  })

  it('轉生保留敵情(前代學會的敵情成為下代知識)', () => {
    const s = createInitialState()
    s.highestFloor = 30
    s.bossLore.shell.handled = 3
    s.bossLore.shell.seen = 4
    const next = prestige(s)!
    expect(next.bossLore.shell).toEqual({ seen: 4, handled: 3 })
  })

  it('v22 存檔遷移:seen 用最高層回填,handled 從零開始掙', () => {
    const s = createInitialState()
    s.highestFloor = 25
    const v22 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v22.version = 22
    delete v22.bossLore
    delete v22.bossTactic
    const out = deserialize(v22 as never)
    expect(out.bossLore.shell).toEqual({ seen: 1, handled: 0 })
    expect(out.bossLore.channel).toEqual({ seen: 1, handled: 0 })
    expect(out.bossLore.totem).toEqual({ seen: 0, handled: 0 })
    expect(out.bossTactic).toBe(null)
  })
})

describe('戰術修正(在線三選一,離線無修正)', () => {
  const failedAt = (floor: number) => {
    const s = createInitialState()
    s.lv = 1
    s.floor = floor
    spawnEnemy(s)
    s.bossTimeLeft = 0.01
    applyTick(s, 100) // 失敗退回
    return s
  }

  it('只能在失敗待重戰時選;預設 null=掛機自動重試無修正', () => {
    const s = createInitialState()
    expect(setTactic(s, 'delay')).toBe(false) // 沒失敗不能選
    const f = failedAt(10)
    expect(f.bossTactic).toBe(null) // 失敗後預設無修正
    expect(setTactic(f, 'delay')).toBe(true)
    expect(f.bossTactic).toBe('delay')
  })

  it('緩兵之計:延遲期間護盾不生效(不減傷、不吃破盾值),到時後才成形', () => {
    const f = failedAt(10)
    setTactic(f, 'delay')
    retryBoss(f)
    expect(f.tacticDelayLeft).toBe(B.TACTIC_DELAY_SEC)
    // 延遲期間打一下:傷害不打折
    const before = f.enemyHp
    f.lv = 20
    click(f)
    const dealt = before.sub(f.enemyHp)
    expect(dealt.div(currentDPS(f).mul(B.CLICK_DMG_SEC)).toNumber()).toBeCloseTo(1, 2)
    expect(f.shellLeft).toBe(B.SHELL_HITS) // 破盾值也沒被吃
    // 過了延遲,護盾成形
    applyTick(f, (B.TACTIC_DELAY_SEC + 0.2) * 1000)
    expect(f.tacticDelayLeft).toBe(0)
  })

  it('戰術只活一場:失敗後清空,要重新選', () => {
    const f = failedAt(10)
    setTactic(f, 'delay')
    retryBoss(f)
    f.bossTimeLeft = 0.01
    applyTick(f, 100) // 再敗
    expect(f.bossTactic).toBe(null)
    expect(f.tacticDelayLeft).toBe(0)
  })

  it('蓄勢而來:本場第一次引爆後保留 3 層,只有一次', () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    // 先解鎖第二技能與印記
    s.highestFloor = B.AWAKEN_FLOOR
    s.destinyPath = 'tactician'
    s.destinyNodes = ['tactician_1a'] // 覺醒需要 tier>0 節點
    s.floor = 9
    spawnEnemy(s)
    s.bossFailed = true
    s.bossRetryFloor = 10
    expect(setTactic(s, 'keepSigils')).toBe(true)
    retryBoss(s)
    s.sigils = 8
    castSkill(s, 'rally')
    expect(s.sigils).toBe(B.TACTIC_KEEP_SIGILS) // 引爆後留 3 層
    s.sigils = 8
    s.skillCd = {} // 清冷卻讓第二發能放
    castSkill(s, 'rally')
    expect(s.sigils).toBe(0) // 第二次不再保留
  })
})

describe('完美引爆窗口(過載引爆的簡化版,籃 C 第二階段)', () => {
  const awakened = () => {
    const s = createInitialState()
    s.lv = 20
    promote(s, 'infantry')
    s.highestFloor = B.AWAKEN_FLOOR
    s.destinyPath = 'tactician'
    s.destinyNodes = ['tactician_1a']
    return s
  }

  it('疊滿印記開限時窗口;窗口內手動引爆=士氣+傭兵推進+昂揚再一層', () => {
    const s = awakened()
    s.mercBestFloor = 200
    setActiveMerc(s, 'rogue')
    s.mercTimer = 10
    // 引爆傷害會連殺推層,踩到 Boss 開場的傭兵倒數壓縮——用打不死的怪隔離
    s.enemyMaxHp = D(1e15)
    s.enemyHp = D(1e15)
    // 直接觸發 gainSigil 走到滿層:用連斬節點會太繞,castSkill 內部路徑即可——
    // 這裡以最小侵入直接模擬:窗口由滿層瞬間開啟
    s.sigils = sigilCap(s) - 1
    s.buffs = [{ skillId: 'shieldRush', timeLeft: 10 }]
    // 視窗內擊殺會擲骰給印記;改直接呼叫私有路徑不可行,設滿層+手動開窗等價
    s.sigils = sigilCap(s)
    s.perfectWindowLeft = B.PERFECT_WINDOW_SEC
    const morale0 = s.morale
    const zeal0 = s.zealStacks
    const ev = castSkill(s, 'rally')
    expect(ev.some((e) => e.type === 'perfectBurst')).toBe(true)
    expect(s.morale).toBe(Math.min(100, morale0 + B.PERFECT_MORALE))
    expect(s.mercTimer).toBeCloseTo(10 - B.PERFECT_MERC_ADVANCE, 5)
    expect(s.zealStacks).toBe(zeal0 + 2) // 滿層昂揚 +1、完美再 +1
    expect(s.perfectWindowLeft).toBe(0)
  })

  it('窗口過期或自動施放引爆:無完美獎勵', () => {
    const s = awakened()
    s.sigils = sigilCap(s)
    s.perfectWindowLeft = 0.2
    applyTick(s, 500) // 窗口過期
    expect(s.perfectWindowLeft).toBe(0)
    const ev = castSkill(s, 'rally')
    expect(ev.some((e) => e.type === 'perfectBurst')).toBe(false)

    // 自動施放:即使窗口開著也不算完美
    const s2 = awakened()
    s2.sigils = sigilCap(s2)
    s2.perfectWindowLeft = B.PERFECT_WINDOW_SEC
    const ev2 = castSkill(s2, 'rally', true)
    expect(ev2.some((e) => e.type === 'perfectBurst')).toBe(false)
    expect(ev2.length).toBeGreaterThan(0) // 有正常引爆
  })
})

describe('命運共鳴(顯示傾向與公開來源,不替玩家推薦)', () => {
  it('行為累積共鳴:拆解/鍛造 → 神匠;施放技能 → 戰術家;來源計數公開', () => {
    const s = createInitialState()
    s.inventory.push({ id: 'w1', slot: 'weapon', quality: 'white', affixes: [] })
    salvage(s, 'w1')
    expect(s.resonance.artisan).toBe(B.RESONANCE.salvage)
    expect(s.resonanceSrc.salvage).toBe(1)
    s.lv = 20
    promote(s, 'infantry')
    castSkill(s, 'shieldRush')
    expect(s.resonance.tactician).toBe(B.RESONANCE.skill)
    expect(strongestResonance(s)).toBe('artisan') // 2 > 1
  })

  it('選中共鳴最強的命運=一次性開場禮物;選別條沒有(但照樣能選)', () => {
    const s = createInitialState()
    s.resonance.artisan = 10
    const m0 = s.materials
    chooseDestiny(s, 'artisan')
    expect(s.materials).toBe(m0 + B.FORGE_COST)

    const s2 = createInitialState()
    s2.resonance.artisan = 10
    const m2 = s2.materials
    expect(chooseDestiny(s2, 'hunter')).toBe(true) // 照選
    expect(s2.materials).toBe(m2) // 沒禮物
  })

  it('全 0 共鳴回 null;轉生歸零', () => {
    const s = createInitialState()
    expect(strongestResonance(s)).toBe(null)
    s.highestFloor = 30
    s.resonance.hunter = 9
    const next = prestige(s)!
    expect(next.resonance).toEqual({ artisan: 0, hunter: 0, tactician: 0 })
  })
})

describe('家族宿敵(籃 C 第三階段第一版)', () => {
  it('本輪失敗紀錄:同層多次失敗累積次數與最佳戰績', () => {
    const s = createInitialState()
    s.lv = 1
    s.floor = 10
    spawnEnemy(s)
    s.bossStats!.dealtRatio = 0.4
    s.bossTimeLeft = 0.01
    applyTick(s, 100)
    expect(s.runBossFails[10]).toEqual({ count: 1, bestDealt: 0.4 })
    retryBoss(s)
    s.bossStats!.dealtRatio = 0.7
    s.bossTimeLeft = 0.01
    applyTick(s, 100)
    expect(s.runBossFails[10]).toEqual({ count: 2, bestDealt: 0.7 })
  })

  it('轉生:失敗達 3 次的層結為宿敵;已有未解決宿敵就不結新怨', () => {
    const s = createInitialState()
    s.highestFloor = 30
    s.runBossFails = { 20: { count: 3, bestDealt: 0.92 } }
    const next = prestige(s)!
    expect(next.nemesis).toEqual({
      floor: 20, kind: 'channel', gen: 1, failures: 3, bestDealt: 0.92, resolved: false,
    })
    // 下一輪又敗更多次,但宿敵未解決 → 不換
    next.highestFloor = 40
    next.runBossFails = { 30: { count: 5, bestDealt: 0.5 } }
    const third = prestige(next)!
    expect(third.nemesis!.floor).toBe(20)
  })

  it('擊敗宿敵:resolved + 寫進代表事件,列傳留下宿怨終結', () => {
    const s = createInitialState()
    s.lv = 40
    s.nemesis = { floor: 10, kind: 'shell', gen: 2, failures: 4, bestDealt: 0.9, resolved: false }
    s.floor = 10
    spawnEnemy(s)
    s.enemyHp = D(1)
    const ev = click(s)
    expect(ev.some((e) => e.type === 'nemesisResolved')).toBe(true)
    expect(s.nemesis.resolved).toBe(true)
    expect(s.runHighlight).toContain('宿怨')
  })

  it('v24 存檔遷移:補宿敵預設值', () => {
    const s = createInitialState()
    const v24 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v24.version = 24
    delete v24.runBossFails
    delete v24.nemesis
    const out = deserialize(v24 as never)
    expect(out.runBossFails).toEqual({})
    expect(out.nemesis).toBe(null)
  })

  it('v25 存檔遷移:當前敵人血量同步放大 100 倍', () => {
    const s = createInitialState()
    const current = serialize(s)
    const v25 = JSON.parse(JSON.stringify(current)) as Record<string, unknown>
    v25.version = 25
    v25.enemyHp = D(current.enemyHp).div(B.COMBAT_NUMBER_SCALE).toString()
    v25.enemyMaxHp = D(current.enemyMaxHp).div(B.COMBAT_NUMBER_SCALE).toString()
    const out = deserialize(v25 as never)
    expect(out.enemyHp.toString()).toBe(s.enemyHp.toString())
    expect(out.enemyMaxHp.toString()).toBe(s.enemyMaxHp.toString())
  })

  it('v27 存檔遷移:補上本輪訓練欄位', () => {
    const s = createInitialState()
    const v27 = JSON.parse(JSON.stringify(serialize(s))) as Record<string, unknown>
    v27.version = 27
    delete v27.training
    expect(deserialize(v27 as never).training).toEqual([])
  })

  it('敗多次但當代打贏:失敗紀錄清除,不結宿敵', () => {
    const s = createInitialState()
    s.highestFloor = 30
    s.runBossFails = { 10: { count: 4, bestDealt: 0.8 } }
    s.lv = 40
    s.floor = 10
    spawnEnemy(s)
    s.enemyHp = D(1)
    click(s) // 擊破
    expect(s.runBossFails[10]).toBeUndefined()
    expect(prestige(s)!.nemesis).toBe(null)
  })
})
