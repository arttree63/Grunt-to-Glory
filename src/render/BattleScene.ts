import { AnimatedSprite, Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import hit1Url from '../../assets/visual/fx/hit-impact/impact-1.png'
import hit2Url from '../../assets/visual/fx/hit-impact/impact-2.png'
import hit3Url from '../../assets/visual/fx/hit-impact/impact-3.png'
import hit4Url from '../../assets/visual/fx/hit-impact/impact-4.png'
import slash1Url from '../../assets/visual/fx/slash-warm/slash-1.png'
import slash2Url from '../../assets/visual/fx/slash-warm/slash-2.png'
import slash3Url from '../../assets/visual/fx/slash-warm/slash-3.png'
import slash4Url from '../../assets/visual/fx/slash-warm/slash-4.png'
import goblin1Url from '../../assets/visual/monsters/forest-goblin/idle/idle-1.png'
import goblin2Url from '../../assets/visual/monsters/forest-goblin/idle/idle-2.png'
import goblin3Url from '../../assets/visual/monsters/forest-goblin/idle/idle-3.png'
import goblin4Url from '../../assets/visual/monsters/forest-goblin/idle/idle-4.png'
import imp1Url from '../../assets/visual/monsters/thorn-imp/idle/idle-1.png'
import imp2Url from '../../assets/visual/monsters/thorn-imp/idle/idle-2.png'
import imp3Url from '../../assets/visual/monsters/thorn-imp/idle/idle-3.png'
import imp4Url from '../../assets/visual/monsters/thorn-imp/idle/idle-4.png'
import boss1Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-1.png'
import boss2Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-2.png'
import boss3Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-3.png'
import boss4Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-4.png'
import boss5Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-5.png'
import boss6Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-6.png'
import boss7Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-7.png'
import boss8Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-8.png'
import boss9Url from '../../assets/visual/monsters/forest-ogre-boss/idle/idle-9.png'
import chest1Url from '../../assets/visual/events/chest-mimic/idle/idle-1.png'
import chest2Url from '../../assets/visual/events/chest-mimic/idle/idle-2.png'
import chest3Url from '../../assets/visual/events/chest-mimic/idle/idle-3.png'
import chest4Url from '../../assets/visual/events/chest-mimic/idle/idle-4.png'
import goldenGoblin1Url from '../../assets/visual/events/golden-goblin/idle/idle-1.png'
import goldenGoblin2Url from '../../assets/visual/events/golden-goblin/idle/idle-2.png'
import goldenGoblin3Url from '../../assets/visual/events/golden-goblin/idle/idle-3.png'
import goldenGoblin4Url from '../../assets/visual/events/golden-goblin/idle/idle-4.png'
import dog1Url from '../../assets/visual/mercenaries/old-hound/idle/idle-1.png'
import dog2Url from '../../assets/visual/mercenaries/old-hound/idle/idle-2.png'
import dog3Url from '../../assets/visual/mercenaries/old-hound/idle/idle-3.png'
import dog4Url from '../../assets/visual/mercenaries/old-hound/idle/idle-4.png'
import rogue1Url from '../../assets/visual/mercenaries/rogue/idle/idle-1.png'
import rogue2Url from '../../assets/visual/mercenaries/rogue/idle/idle-2.png'
import rogue3Url from '../../assets/visual/mercenaries/rogue/idle/idle-3.png'
import rogue4Url from '../../assets/visual/mercenaries/rogue/idle/idle-4.png'
import iceMage1Url from '../../assets/visual/mercenaries/ice-mage/idle/idle-1.png'
import iceMage2Url from '../../assets/visual/mercenaries/ice-mage/idle/idle-2.png'
import iceMage3Url from '../../assets/visual/mercenaries/ice-mage/idle/idle-3.png'
import iceMage4Url from '../../assets/visual/mercenaries/ice-mage/idle/idle-4.png'
import sapper1Url from '../../assets/visual/mercenaries/sapper/idle/idle-1.png'
import sapper2Url from '../../assets/visual/mercenaries/sapper/idle/idle-2.png'
import sapper3Url from '../../assets/visual/mercenaries/sapper/idle/idle-3.png'
import sapper4Url from '../../assets/visual/mercenaries/sapper/idle/idle-4.png'
import pyro1Url from '../../assets/visual/mercenaries/pyromancer/idle/idle-1.png'
import pyro2Url from '../../assets/visual/mercenaries/pyromancer/idle/idle-2.png'
import pyro3Url from '../../assets/visual/mercenaries/pyromancer/idle/idle-3.png'
import pyro4Url from '../../assets/visual/mercenaries/pyromancer/idle/idle-4.png'
import turret1Url from '../../assets/visual/props/sapper-turret/idle/idle-1.png'
import turret2Url from '../../assets/visual/props/sapper-turret/idle/idle-2.png'
import turret3Url from '../../assets/visual/props/sapper-turret/idle/idle-3.png'
import turret4Url from '../../assets/visual/props/sapper-turret/idle/idle-4.png'
import archmage1Url from '../../assets/visual/heroes/archmage/idle/idle-1.png'
import archmage2Url from '../../assets/visual/heroes/archmage/idle/idle-2.png'
import archmage3Url from '../../assets/visual/heroes/archmage/idle/idle-3.png'
import archmage4Url from '../../assets/visual/heroes/archmage/idle/idle-4.png'
import infantry1Url from '../../assets/visual/heroes/infantry/idle/idle-1.png'
import infantry2Url from '../../assets/visual/heroes/infantry/idle/idle-2.png'
import infantry3Url from '../../assets/visual/heroes/infantry/idle/idle-3.png'
import infantry4Url from '../../assets/visual/heroes/infantry/idle/idle-4.png'
import marshal1Url from '../../assets/visual/heroes/marshal/idle/idle-1.png'
import marshal2Url from '../../assets/visual/heroes/marshal/idle/idle-2.png'
import marshal3Url from '../../assets/visual/heroes/marshal/idle/idle-3.png'
import marshal4Url from '../../assets/visual/heroes/marshal/idle/idle-4.png'
import paladin1Url from '../../assets/visual/heroes/paladin/idle/idle-1.png'
import paladin2Url from '../../assets/visual/heroes/paladin/idle/idle-2.png'
import paladin3Url from '../../assets/visual/heroes/paladin/idle/idle-3.png'
import paladin4Url from '../../assets/visual/heroes/paladin/idle/idle-4.png'
import scout1Url from '../../assets/visual/heroes/scout/idle/idle-1.png'
import scout2Url from '../../assets/visual/heroes/scout/idle/idle-2.png'
import scout3Url from '../../assets/visual/heroes/scout/idle/idle-3.png'
import scout4Url from '../../assets/visual/heroes/scout/idle/idle-4.png'
import shadow1Url from '../../assets/visual/heroes/shadow/idle/idle-1.png'
import shadow2Url from '../../assets/visual/heroes/shadow/idle/idle-2.png'
import shadow3Url from '../../assets/visual/heroes/shadow/idle/idle-3.png'
import shadow4Url from '../../assets/visual/heroes/shadow/idle/idle-4.png'
import hero1Url from '../../assets/visual/rookie-soldier/idle/idle-1.png'
import hero2Url from '../../assets/visual/rookie-soldier/idle/idle-2.png'
import hero3Url from '../../assets/visual/rookie-soldier/idle/idle-3.png'
import hero4Url from '../../assets/visual/rookie-soldier/idle/idle-4.png'
import forestUrl from '../../assets/visual/scenes/forest-border-v1.png'
import type { BossKind, JobId, LegendId, MercId, SkillId } from '../core/types'

/**
 * 戰鬥演出層。只讀 snapshot 做畫面,不 import React / store 邏輯。
 * 構圖與回饋規格見 .claude/skills/clicker-ui/SKILL.md。
 */
/**
 * 演出層每幀讀的狀態快照。⚠️ core 不碰畫面,所以「畫面需要知道的東西」一律走這裡或事件,
 * 不可以讓 render 去 import 遊戲邏輯。新增欄位請保持扁平與便宜(每幀呼叫)。
 */
export interface BattleSnapshot {
  isBoss: boolean
  /** 突發事件種類,無事件為 null */
  event: 'chest' | 'goblin' | null
  morale: number
  jobId: JobId
  /** 帝國鐵壁 2 件的軍陣生效中(腳下多一圈) */
  formation: boolean

  // ── 以下是給「技能與傳說要有身分」用的(視覺缺口清單 § 一、§ 二)──
  /** 生效中的 buff 是哪一招 → 每招畫自己的持續期間效果 */
  buffSkill: SkillId | null
  /** 不退之壁:軍陣常駐(不倒數) */
  buffPermanent: boolean
  /** buff 剩餘秒數(常駐時為 Infinity) */
  buffLeft: number
  /** 印記層數與上限 → 主角頭上的 pips */
  sigils: number
  sigilMax: number
  /** 連斬層數 → 腳下環狀刻度 */
  combo: number
  /** 蓄勢中 / 已累積層數 → 武器蓄光 */
  charging: boolean
  chargeStacks: number
  /** 貪婪之眼:遺物弱點剩餘秒數 → Boss 身上的金色弱點 */
  relicLeft: number
  /** 失落軍旗:已儲存的爆發秒數 → 武器亮度 */
  bannerStored: number
  /** 戰術指揮官:下一招是指揮形態 → 技能格金框 */
  commandReady: boolean
  /** 身上的傳說(用來決定要不要畫該傳說的「觸發前提示」) */
  legends: LegendId[]
  /** Boss 剩餘秒數(<5 秒要畫邊緣警戒);非 Boss 為 null */
  bossTimeLeft: number | null
  /** 越戰越勇層數:Boss 入場時短暫紅光 */
  valiantStacks: number
  /** 倒轉沙漏已記錄的不同技能數 */
  hourglassSteps: number
  /** 有留存事件等待處理:路邊常駐路標 */
  encounterWaiting: boolean

  // ── v1.5 行為原型(演出:分身 / 軍旗 / 砲台 / 燃燒 / 凍結)──
  /** 出戰傭兵(null = 沒帶)。老獵犬沿用現有 dog sprite */
  activeMerc: MercId | null
  /** 雙生影刃:分身出場中(疾風連刺視窗 + 傳說) */
  cloneActive: boolean
  /** 熔火軍旗:軍旗剩餘秒數 */
  bannerLeft: number
  /** 砲台剩餘秒數 */
  zoneLeft: number
  /** 燃燒剩餘秒數(敵人身上的火) */
  burnLeft: number
  /** 燃燒層數(F18 爆燃圓:滿層前的接近提示) */
  burnStacks: number
  /** 凍結剩餘秒數(畫面褪色、敵人停格) */
  freezeLeft: number

  // ── Boss 行為原型(v1.7)。專屬演出見視覺缺口清單 § 六之三 ──
  bossKind: BossKind | null
  /** 拆盾:剩餘命中數(>0 畫盾殼) */
  shellLeft: number
  /** 當前這層護盾的累積比例 0~1(畫層碎裂進度) */
  shellProgress: number
  /** 蓄力:剩餘秒數(>0 畫蓄力條與警示) */
  channelLeft: number
  /** 打斷進度 0~1(畫 Boss 血條下的打斷條;越接近 1 越該催促) */
  channelProgress: number
  /** 圖騰血量比例(>0 畫圖騰實體) */
  totemRatio: number
}

const HERO_FRAME_MS = 180
const MOB_FRAME_MS = 200
const BOSS_FRAME_MS = 180
const EVENT_FRAME_MS = 180
const SLASH_FRAME_MS = 70
const HIT_FRAME_MS = 65

interface VisualAssets {
  background: Texture
  heroes: Record<JobId, Texture[]>
  goblin: Texture[]
  imp: Texture[]
  boss: Texture[]
  chest: Texture[]
  goldenGoblin: Texture[]
  mercenaries: Record<MercId, Texture[]>
  turret: Texture[]
  slash: Texture[]
  hit: Texture[]
}

const textureGroups = {
  heroes: {
    rookie: [hero1Url, hero2Url, hero3Url, hero4Url],
    infantry: [infantry1Url, infantry2Url, infantry3Url, infantry4Url],
    scout: [scout1Url, scout2Url, scout3Url, scout4Url],
    marshal: [marshal1Url, marshal2Url, marshal3Url, marshal4Url],
    paladin: [paladin1Url, paladin2Url, paladin3Url, paladin4Url],
    shadow: [shadow1Url, shadow2Url, shadow3Url, shadow4Url],
    archmage: [archmage1Url, archmage2Url, archmage3Url, archmage4Url],
    // 命運限定二轉:沿用同系通用二轉的素材(通用骨架 + 命運變體模組)
    forgewarden: [paladin1Url, paladin2Url, paladin3Url, paladin4Url],
    shadowvanguard: [shadow1Url, shadow2Url, shadow3Url, shadow4Url],
    relicarbiter: [archmage1Url, archmage2Url, archmage3Url, archmage4Url],
  } satisfies Record<JobId, string[]>,
  goblin: [goblin1Url, goblin2Url, goblin3Url, goblin4Url],
  imp: [imp1Url, imp2Url, imp3Url, imp4Url],
  boss: [boss1Url, boss2Url, boss3Url, boss4Url, boss5Url, boss6Url, boss7Url, boss8Url, boss9Url],
  chest: [chest1Url, chest2Url, chest3Url, chest4Url],
  goldenGoblin: [goldenGoblin1Url, goldenGoblin2Url, goldenGoblin3Url, goldenGoblin4Url],
  mercenaries: {
    hound: [dog1Url, dog2Url, dog3Url, dog4Url],
    rogue: [rogue1Url, rogue2Url, rogue3Url, rogue4Url],
    icemage: [iceMage1Url, iceMage2Url, iceMage3Url, iceMage4Url],
    sapper: [sapper1Url, sapper2Url, sapper3Url, sapper4Url],
    pyro: [pyro1Url, pyro2Url, pyro3Url, pyro4Url],
  } satisfies Record<MercId, string[]>,
  turret: [turret1Url, turret2Url, turret3Url, turret4Url],
  slash: [slash1Url, slash2Url, slash3Url, slash4Url],
  hit: [hit1Url, hit2Url, hit3Url, hit4Url],
}

async function loadTextures(urls: string[]): Promise<Texture[]> {
  const textures = await Promise.all(urls.map((url) => Assets.load<Texture>(url)))
  textures.forEach((texture) => {
    texture.source.scaleMode = 'nearest'
  })
  return textures
}

async function loadVisualAssets(): Promise<VisualAssets> {
  const [background, heroEntries, goblin, imp, boss, chest, goldenGoblin, mercEntries, turret, slash, hit] = await Promise.all([
    Assets.load<Texture>(forestUrl),
    Promise.all(
      Object.entries(textureGroups.heroes).map(async ([jobId, urls]) => {
        return [jobId, await loadTextures(urls)] as const
      }),
    ),
    loadTextures(textureGroups.goblin),
    loadTextures(textureGroups.imp),
    loadTextures(textureGroups.boss),
    loadTextures(textureGroups.chest),
    loadTextures(textureGroups.goldenGoblin),
    Promise.all(
      Object.entries(textureGroups.mercenaries).map(async ([mercId, urls]) => {
        return [mercId, await loadTextures(urls)] as const
      }),
    ),
    loadTextures(textureGroups.turret),
    loadTextures(textureGroups.slash),
    loadTextures(textureGroups.hit),
  ])
  background.source.scaleMode = 'nearest'
  const heroes = Object.fromEntries(heroEntries) as Record<JobId, Texture[]>
  const mercenaries = Object.fromEntries(mercEntries) as Record<MercId, Texture[]>
  return { background, heroes, goblin, imp, boss, chest, goldenGoblin, mercenaries, turret, slash, hit }
}

export class BattleScene {
  private app = new Application()
  private world = new Container()
  private bg: Sprite
  private mobLayer = new Container()
  private fieldLayer = new Container()
  private impactLayer = new Container()
  private dmgLayer = new Container()
  private overlayLayer = new Container()
  private hero = new Container()
  private heroAura = new Graphics()
  private formationFx = new Graphics()
  private heroStateFx = new Graphics()
  private fieldFx = new Graphics()
  private enemyStateFx = new Graphics()
  private overlayFx = new Graphics()
  private heroBody = new Container()
  private heroSprite: AnimatedSprite
  private afterimages: AnimatedSprite[] = []
  private cloneSprite: AnimatedSprite
  private heroJob: JobId = 'rookie'
  private slashFx: AnimatedSprite
  private mercSprite: AnimatedSprite
  private mercId: MercId = 'hound'
  private turretSprite: AnimatedSprite
  private timedFx: TimedFx[] = []

  private mobs: MobView[] = []
  private boss: BossView | null = null
  private eventView: EventView | null = null
  private shake = 0
  private zoom = 0
  private elapsed = 0
  private spawnTimer = 0
  private goldNumCooldown = 0
  private hitNumCooldown = 0
  private hitNumSlot = 0
  private W = 0
  private H = 0
  private destroyed = false
  /** 地面流線層:製造「小兵正在往前走」的前進感 */
  private groundLayer = new Container()
  private streaks: Array<Graphics & { _t: number; _x: number; _len: number }> = []
  private streakTimer = 0
  private critNumCooldown = 0
  private dust: Array<Graphics & { _t: number; _x: number }> = []
  private dustTimer = 0
  /** 進層時的加速衝刺(0~1,會衰減) */
  private marchBoost = 0
  private previousBuffSkill: SkillId | null = null
  private previousRelicLeft = 0
  private bossIntroLeft = 0
  private eventIntroLeft = 0
  private heroSwingLeft = 0
  private heroSwingDuration = 230
  private heroSwingSide = -1

  private constructor(
    private getSnap: () => BattleSnapshot,
    private assets: VisualAssets,
  ) {
    this.bg = new Sprite(assets.background)
    this.heroSprite = new AnimatedSprite(assets.heroes.rookie)
    this.cloneSprite = new AnimatedSprite(assets.heroes.rookie)
    this.slashFx = new AnimatedSprite(assets.slash)
    this.mercSprite = new AnimatedSprite(assets.mercenaries.hound)
    this.turretSprite = new AnimatedSprite(assets.turret)
  }

  static async create(el: HTMLElement, getSnap: () => BattleSnapshot): Promise<BattleScene> {
    const assets = await loadVisualAssets()
    const scene = new BattleScene(getSnap, assets)
    await scene.app.init({ resizeTo: el, backgroundAlpha: 0, antialias: false })
    el.appendChild(scene.app.canvas)
    scene.setup()
    return scene
  }

  private setup() {
    const { app, world } = this
    app.stage.addChild(world)
    this.mobLayer.sortableChildren = true
    world.addChild(
      this.bg,
      this.groundLayer,
      this.fieldLayer,
      this.mobLayer,
      this.enemyStateFx,
      this.impactLayer,
      this.hero,
      this.mercSprite,
      this.dmgLayer,
      this.overlayLayer,
    )
    this.fieldLayer.addChild(this.fieldFx, this.turretSprite)
    this.overlayLayer.addChild(this.overlayFx)
    this.hero.addChild(this.heroAura, this.formationFx, this.heroStateFx)

    for (let i = 0; i < 2; i++) {
      const ghost = new AnimatedSprite(this.assets.heroes.rookie)
      ghost.anchor.set(0.5, 233 / 256)
      ghost.animationSpeed = frameSpeed(HERO_FRAME_MS)
      ghost.alpha = 0.18 - i * 0.04
      ghost.tint = 0x75ddff
      ghost.visible = false
      ghost.play()
      this.afterimages.push(ghost)
      this.hero.addChild(ghost)
    }
    this.cloneSprite.anchor.set(0.5, 233 / 256)
    this.cloneSprite.animationSpeed = frameSpeed(HERO_FRAME_MS) * 1.15
    this.cloneSprite.alpha = 0.32
    this.cloneSprite.tint = 0x89b7ff
    this.cloneSprite.visible = false
    this.cloneSprite.play()
    this.hero.addChild(this.cloneSprite)
    this.hero.addChild(this.heroBody, this.slashFx)
    this.heroBody.addChild(this.heroSprite)

    this.heroSprite.anchor.set(0.5, 233 / 256)
    this.heroSprite.animationSpeed = frameSpeed(HERO_FRAME_MS)
    this.heroSprite.play()

    this.slashFx.anchor.set(0.5)
    this.slashFx.animationSpeed = frameSpeed(SLASH_FRAME_MS)
    this.slashFx.loop = false
    this.slashFx.visible = false
    this.slashFx.onComplete = () => {
      this.slashFx.visible = false
    }

    this.mercSprite.anchor.set(0.5, 233 / 256)
    this.mercSprite.animationSpeed = frameSpeed(HERO_FRAME_MS)
    this.mercSprite.play()

    this.turretSprite.anchor.set(0.5, 228 / 256)
    this.turretSprite.animationSpeed = frameSpeed(HERO_FRAME_MS)
    this.turretSprite.visible = false
    this.turretSprite.play()

    this.W = app.screen.width
    this.H = app.screen.height
    this.drawStatic()
    app.ticker.add(() => this.frame(app.ticker.deltaMS))
  }

  destroy() {
    this.destroyed = true
    this.streaks = []
    this.dust = []
    this.timedFx = []
    this.app.destroy(true, { children: true })
  }

  // ---------- 對外演出介面 ----------

  /**
   * 技能命中:比普通攻擊更重的演出(震屏 + 大字)。
   * ⚠️ 目前三招共用同一組演出 —— 技能身分要靠 `skillId` 分流(視覺缺口清單 § 一)。
   * `sigilsSpent` 是這一發吃掉的印記層數,可用來畫 N 道射線。
   */
  skillHit(text: string, skillId?: SkillId, sigilsSpent = 0) {
    if (this.destroyed) return
    const target = this.targetPoint()
    const sigilSkills: SkillId[] = ['rally', 'windMark', 'edict']
    if (skillId && sigilSkills.includes(skillId)) this.spawnSigilRays(Math.min(10, sigilsSpent), target)

    if (skillId === 'shieldRush' || skillId === 'bulwark') {
      this.spawnShieldWave()
      this.shake = 15
      this.zoom = 1.8
      this.spawnImpact(target.x, target.y, 1.05)
    } else if (skillId === 'gale' || skillId === 'shadowClone') {
      this.spawnGaleCuts(target)
      this.shake = 7
      this.zoom = 1.2
    } else if (skillId === 'judgement' || skillId === 'meteor' || skillId === 'edict') {
      this.spawnJudgement(target)
      this.shake = 12
      this.zoom = 2
    } else {
      this.shake = 9
      this.zoom = 1.6
    }

    if (this.getSnap().legends.includes('lostbanner')) this.spawnBannerColumn(target)
    if (skillId === 'edict' && this.getSnap().legends.includes('codexpage')) {
      this.spawnReturningSigils(Math.min(4, Math.ceil(sigilsSpent / 3)))
    }
    this.damageNum(target.x, target.y - 45, text, true, skillId === 'judgement' || skillId === 'edict')
  }

  /**
   * 傭兵招牌行為。⚠️ 目前只有一行提示——各傭兵的專屬演出見視覺缺口清單 § 6.2
   * (盜賊繞後拖影 / 冰晶與畫面褪色 / 砲台實體 / 燃燒粒子)。
   */
  onMercAct(mercId: MercId) {
    if (this.destroyed) return
    const names: Record<MercId, string> = {
      hound: '老獵犬叼回素材',
      rogue: '盜賊背刺',
      icemage: '冰法師凍結',
      sapper: '工兵架砲',
      pyro: '火術士點燃',
    }
    const target = this.targetPoint()
    if (mercId === 'rogue') this.spawnRogueDash(target)
    else if (mercId === 'icemage') this.spawnIceBurst(target)
    else if (mercId === 'sapper') this.spawnDeployPulse(this.W * 0.72, this.H * 0.75, 0xe5a64b)
    else if (mercId === 'pyro') this.spawnDeployPulse(target.x, target.y, 0xff6b2d)
    else this.spawnDeployPulse(this.mercSprite.x, this.mercSprite.y - 20, 0xd8bc78)
    this.notice(names[mercId])
  }

  /**
   * 冷卻被推進(追風者之靴的暴擊、倒轉沙漏的順序)。
   * ⚠️ 目前只有一行提示 —— 應該做成技能格冷卻條跳一格 + 腳下風紋(清單 F9 / F10)。
   */
  onCooldownAdvance(skillId: SkillId, seconds: number) {
    if (this.destroyed) return
    const snap = this.getSnap()
    if (snap.legends.includes('hourglass')) this.spawnHourglass(skillId)
    else this.spawnWindGlyph()
    this.notice(`冷卻 −${seconds.toFixed(1)}s`)
  }

  onFreezeStart() {
    if (this.destroyed) return
    this.spawnIceBurst(this.targetPoint())
  }

  onFreezeBurst(text: string) {
    if (this.destroyed) return
    const target = this.targetPoint()
    this.spawnIceBurst(target, true)
    this.damageNum(target.x, target.y - 50, text, true, true)
    this.shake = 13
  }

  onBurnTick(text: string) {
    if (this.destroyed || this.hitNumCooldown > 0) return
    const target = this.targetPoint()
    this.damageNum(target.x + 34, target.y - 35, text, false)
    this.hitNumCooldown = 160
  }

  onEncounter() {
    if (this.destroyed) return
    const x = this.W * 0.78
    const y = this.H * 0.58
    const fx = new Container() as TimedFx
    const g = new Graphics()
    g.rect(-4, -62, 8, 62).fill(0x5b3d2b)
    g.poly([0, -58, 55, -45, 0, -30]).fill({ color: 0xf0b44c, alpha: 0.9 })
    g.circle(0, 0, 18).fill({ color: 0xff8a3d, alpha: 0.25 })
    fx.addChild(g)
    fx.position.set(x, y)
    this.addTimedFx(fx, 1800, (node, p) => {
      node.alpha = Math.min(1, p * 5) * (1 - Math.max(0, (p - 0.7) / 0.3))
      node.y = y + (1 - Math.min(1, p * 4)) * 20
    }, this.fieldLayer)
    this.notice('旅途中發現岔路')
  }

  onLevelUp() {
    if (this.destroyed) return
    this.spawnHeroBurst(0xffd86b)
    this.notice('升 級')
  }

  onBannerStore() {
    if (this.destroyed) return
    this.spawnHeroBurst(0xffa53d)
    this.notice('收 旗')
  }

  onHeirloomRestored() {
    if (this.destroyed) return
    this.spawnHeroBurst(0xffdc78)
    this.notice('傳家之器・復原')
  }

  /** 一行提示(拿到命運點、素材、傳家之器復原…),不搶戰鬥焦點 */
  notice(text: string) {
    if (this.destroyed) return
    this.damageNum(this.W / 2, this.H * 0.24, text, false)
  }

  /** 事件中點擊換素材。⚠️ 不可複用金幣模板,會拼出「+素材 +1 金」 */
  onMaterial() {
    if (this.destroyed) return
    const target = this.eventView ?? this.frontMob()
    const x = target ? target.view.x : this.W / 2
    const y = target ? target.view.y : this.H * 0.45
    this.damageNum(x, y - 20, '素材 +1', false)
  }

  /** 揮砍一次(點擊或自動)。crit 走金字大字 */
  swing(dmgText: string, crit = false, source: AttackSource = 'hero') {
    if (this.destroyed) return
    const snap = this.getSnap()
    if (source === 'hero') {
      this.heroSwingDuration =
        snap.buffSkill === 'shieldRush' ? 320 : snap.buffSkill === 'gale' ? 145 : 230
      this.heroSwingLeft = this.heroSwingDuration
      this.heroSwingSide *= -1
      this.slashFx.visible = true
      this.slashFx.alpha = snap.buffSkill === 'gale' ? 0.72 : 1
      this.slashFx.tint = snap.morale >= 100 ? 0x8affe0 : 0xffffff
      this.slashFx.scale.y = snap.buffSkill === 'gale' ? 0.42 : 1
      this.slashFx.animationSpeed =
        snap.buffSkill === 'shieldRush' ? frameSpeed(95) : snap.buffSkill === 'gale' ? frameSpeed(48) : frameSpeed(SLASH_FRAME_MS)
      this.slashFx.gotoAndPlay(0)
      this.shake = Math.min(this.shake + (snap.buffSkill === 'shieldRush' ? 8 : 4), 13)
      this.zoom = snap.buffSkill === 'shieldRush' ? 1.5 : 1
    } else if (source === 'clone') {
      this.spawnCloneSlash()
    } else {
      const origin = source === 'zone' ? { x: this.W * 0.72, y: this.H * 0.73 } : { x: this.W * 0.27, y: this.H * 0.68 }
      this.spawnProjectile(origin, this.targetPoint(), source === 'zone' ? 0xff9a45 : 0xaee8ff)
    }

    if (this.eventView) {
      this.eventView.flash()
      this.spawnImpact(this.W / 2, this.H * 0.48, 0.56)
      this.sourceHitNum(this.W / 2, this.H * 0.42, dmgText, crit, source)
    } else if (this.boss) {
      this.boss.flash()
      this.boss.view.y += 6
      this.spawnImpact(
        this.W / 2 + (Math.random() - 0.5) * this.W * 0.3,
        this.H * 0.3,
        0.72,
      )
      this.sourceHitNum(this.W / 2, this.H * 0.34, dmgText, crit, source)
    } else {
      const target = this.frontMob()
      if (!target) {
        // 剛清完屏的那幾百毫秒還是會有出手,沒有 fallback 會變成「點了沒反應」
        this.spawnImpact(this.W / 2, this.H * 0.55, 0.5)
        this.sourceHitNum(this.W / 2, this.H * 0.5, dmgText, crit, source)
      }
      if (target) {
        target.flash()
        target.view.y -= 10
        const hit = target.hitPoint()
        this.spawnImpact(hit.x, hit.y, target.view.scale.x)
        this.sourceHitNum(target.view.x, target.view.y - target.view.height * 0.82, dmgText, crit, source)
      }
    }
  }

  /** core 回報擊殺 → 移除最前方的怪並跳金幣 */
  onKill(goldText: string) {
    if (this.destroyed) return
    let target = this.frontMob()
    // 邏輯擊殺速度可能快過視覺生成:補一隻已接近的,確保每次擊殺都有回饋
    if (!target) {
      target = this.createMob(0.8)
      this.mobLayer.addChild(target.view)
      target.layout(0, this.W, this.H)
      this.mobs.push(target)
    }
    // 高速擊殺時跳字會疊成一團 → 金幣跳字節流
    if (this.goldNumCooldown <= 0) {
      this.goldNumCooldown = 220
      this.damageNum(target.view.x, target.view.y, `+${goldText} 金`, false)
    }
    target.view.destroy()
    this.mobs = this.mobs.filter((m) => m !== target)
  }

  /** 目前畫面上還有幾個跳字(驗證用) */
  get floatingCount(): number {
    return this.dmgLayer.children.length
  }

  /** 換代/重置:清掉還在飄的跳字,否則上一輪的數字會混進新的一代 */
  clearNumbers() {
    if (this.destroyed) return
    for (let i = this.dmgLayer.children.length - 1; i >= 0; i--) this.dmgLayer.children[i].destroy()
    this.hitNumCooldown = 0
    this.critNumCooldown = 0
    this.goldNumCooldown = 0
  }

  onBossKill(heirloomLeft?: number) {
    if (this.destroyed) return
    this.damageNum(this.W / 2, this.H * 0.3, '擊 破 !', true)
    if (heirloomLeft && heirloomLeft > 0) this.notice(`傳家之器・再擊破 ${heirloomLeft} 個 Boss`)
    this.shake = 12
  }

  onEventKill(goldText: string, elite: boolean) {
    if (this.destroyed) return
    this.damageNum(this.W / 2, this.H * 0.42, `+${goldText} 金`, true)
    if (elite) this.damageNum(this.W / 2, this.H * 0.34, '菁英素材 +1', true)
    this.shake = 12
  }

  onEventEscape() {
    if (this.destroyed) return
    this.damageNum(this.W / 2, this.H * 0.42, '逃 走 了', false)
  }

  onBossFail() {
    if (this.destroyed) return
    this.damageNum(this.W / 2, this.H * 0.3, '撤 退', false)
  }

  // ---------- 內部 ----------

  private frontMob() {
    return this.mobs.filter((m) => m.t > 0.55).sort((a, b) => b.t - a.t)[0]
  }

  /**
   * 攻擊跳字。連續攻擊(尤其連點)會讓數字全部疊在同一點變成一團,
   * 所以節流 + 依序錯開位置;暴擊不節流,它本來就該被看見。
   */
  private hitNum(x: number, y: number, txt: string, crit: boolean) {
    const gale = this.getSnap().buffSkill === 'gale'
    // 點擊改為直接出手後跳字量翻倍,暴擊完全不節流會把 12 上限洗掉其他字
    if (crit) {
      if (this.critNumCooldown > 0) return
      this.critNumCooldown = 100
    } else {
      if (this.hitNumCooldown > 0) return
      this.hitNumCooldown = gale ? 120 : 160
    }
    // 點擊改為會直接出手後,跳字量幾乎翻倍 → 錯開位置從 3 格加到 5 格
    const slot = this.hitNumSlot++ % 5
    this.damageNum(x + (slot - 2) * 44, y - slot * 20, txt, crit, false, gale ? 0.75 : 1)
  }

  private sourceHitNum(x: number, y: number, txt: string, crit: boolean, source: AttackSource) {
    if (source === 'hero') {
      this.hitNum(x, y, txt, crit)
      return
    }
    const label = source === 'clone' ? '分身' : source === 'zone' ? '場地' : '傭兵'
    const offset = source === 'clone' ? -42 : source === 'zone' ? 42 : 0
    this.damageNum(x + offset, y + 16, `${label} ${txt}`, false)
  }

  private damageNum(x: number, y: number, txt: string, crit: boolean, holy = false, fontScale = 1) {
    // 同屏跳字上限,超過先移除最舊的
    while (this.dmgLayer.children.length >= 12) this.dmgLayer.children[0].destroy()
    const t = new Text({
      text: txt,
      style: {
        fontFamily: 'Arial Black, PingFang TC, sans-serif',
        fontSize: (holy ? 40 : crit ? 34 : 24) * fontScale,
        fontWeight: '900',
        fill: holy ? 0xffffff : crit ? 0xffd23e : 0xffffff,
        stroke: { color: holy ? 0xc78b18 : 0x000000, width: holy ? 7 : 5 },
      },
    })
    t.anchor.set(0.5)
    t.position.set(x + (Math.random() - 0.5) * 30, y)
    ;(t as FloatText)._vy = -2.4
    ;(t as FloatText)._life = 1
    this.dmgLayer.addChild(t)
  }

  private frame(ms: number) {
    if (this.destroyed) return
    const snap = this.getSnap()
    this.elapsed += ms
    this.goldNumCooldown -= ms
    this.hitNumCooldown -= ms
    this.critNumCooldown -= ms
    this.bossIntroLeft = Math.max(0, this.bossIntroLeft - ms)
    this.eventIntroLeft = Math.max(0, this.eventIntroLeft - ms)
    const resized = this.W !== this.app.screen.width || this.H !== this.app.screen.height
    this.W = this.app.screen.width
    this.H = this.app.screen.height
    if (resized) this.drawStatic()
    this.syncHeroJob(snap.jobId)
    this.syncMerc(snap.activeMerc)
    this.layoutCompanions()
    this.tickTimedFx(ms)

    // 突發事件出場 / 退場
    if (snap.event && this.eventView?.kind !== snap.event) {
      this.eventView?.view.destroy()
      this.clearMobs()
      const textures = snap.event === 'chest' ? this.assets.chest : this.assets.goldenGoblin
      this.eventView = new EventView(snap.event, textures)
      this.mobLayer.addChild(this.eventView.view)
      this.shake = 8
      this.eventIntroLeft = 260
      this.spawnDeployPulse(this.W / 2, this.H * 0.58, 0xffcf58)
    } else if (!snap.event && this.eventView) {
      this.eventView.view.destroy()
      this.eventView = null
    }
    if (this.eventView) this.eventView.layout(ms, this.W, this.H)

    // Boss 出場 / 退場
    if (snap.isBoss && !this.boss) {
      this.clearMobs()
      this.boss = new BossView(this.assets.boss)
      this.mobLayer.addChild(this.boss.view)
      this.shake = 12
      this.bossIntroLeft = 850
      this.spawnBossBanner()
    } else if (!snap.isBoss && this.boss) {
      this.boss.view.destroy()
      this.boss = null
    }

    if (this.boss) {
      this.boss.layout(ms, this.W, this.H, snap.freezeLeft > 0)
    } else if (!this.eventView) {
      // 一般層:持續湧怪,同屏上限 4
      this.spawnTimer -= ms
      if (this.spawnTimer <= 0 && this.mobs.length < 4) {
        const m = this.createMob()
        this.mobLayer.addChild(m.view)
        this.mobs.push(m)
        this.spawnTimer = 450 + Math.random() * 500
      }
      for (const m of this.mobs) m.layout(ms, this.W, this.H)
    }

    // 揮砍不再由渲染層自己計時,改由 core 的 attack 事件驅動,
    // 這樣血條每一格的下降都對得上一次揮砍(BattleCanvas 轉發)

    this.tickMarch(ms)
    this.tickDust(ms, !this.boss && !this.eventView)

    this.mercSprite.y = this.H * 0.895 + Math.sin(this.elapsed * 0.013 + 1) * 1.8

    // 背景微幅浮動:靜止的底圖會讓所有前進感被「背景完全不動」抵銷
    this.bg.y = this.H / 2 + Math.sin(this.elapsed * 0.0016) * 2 + this.marchBoost * this.H * 0.045
    this.drawAura(snap.morale)
    this.drawFormation(snap.formation, snap.buffSkill, snap.buffPermanent)
    this.drawHeroStates(snap)
    this.drawBattleStates(snap)
    this.layoutHero()
    this.tickHeroSwing(ms)

    if (
      (this.previousBuffSkill === 'shieldRush' || this.previousBuffSkill === 'bulwark') &&
      snap.buffSkill !== 'shieldRush' &&
      snap.buffSkill !== 'bulwark'
    ) this.spawnFormationBreak()
    this.previousBuffSkill = snap.buffSkill
    if (this.previousRelicLeft > 0 && snap.relicLeft <= 0) this.spawnRelicBreak()
    this.previousRelicLeft = snap.relicLeft

    // 傷害跳字
    for (let i = this.dmgLayer.children.length - 1; i >= 0; i--) {
      const t = this.dmgLayer.children[i] as FloatText
      t.y += t._vy
      t._vy += 0.06
      t._life -= ms / 900
      t.alpha = t._life
      if (t._life <= 0) t.destroy()
    }

    // 震屏 + zoom punch(只作用於 world,HTML UI 不受影響)
    this.world.position.set((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake)
    this.shake *= 0.86
    const z = 1 + this.zoom * 0.02
    this.zoom *= 0.85
    this.world.scale.set(z)
    this.world.pivot.set((this.W * (z - 1)) / 2 / z, (this.H * (z - 1)) / 2 / z)
  }

  /**
   * 前進感:地面流線由遠處(地平線)朝鏡頭加速掠過,用的是與怪物相同的深度曲線(t²),
   * 所以「地面往後退」與「怪物向前湧」看起來是同一個世界在動。
   * ⚠️ 純程式繪製,沒有新美術成本(逐幀動畫是禁用的)。
   */
  private tickMarch(ms: number) {
    const { W, H } = this
    // Boss 戰與突發事件都不前進:那兩個都是停下來處理的事,
    // 地面繼續流會變成寶箱怪定在原地卻像月球漫步
    const marching = !this.boss && !this.eventView
    // 進層時衝刺一下,推進被「看見」而不只是數字加一
    // 半衰期約 460ms:0.997 的話進層衝刺一眨眼就沒了,根本感知不到
    this.marchBoost *= Math.pow(0.9985, ms)
    const speed = marching ? (0.00045 + this.marchBoost * 0.0014) * ms : 0

    this.streakTimer -= ms
    if (marching && this.streakTimer <= 0 && this.streaks.length < 18) {
      this.streakTimer = 70 + Math.random() * 80
      const g = new Graphics() as (typeof this.streaks)[number]
      g._t = 0
      // 一半跑小徑(淺色地面痕),一半跑兩側(深色景物,掠過感最強的就是這些)
      const side = Math.random() < 0.55
      g._x = side ? (Math.random() < 0.5 ? -1 : 1) * (0.85 + Math.random() * 0.8) : (Math.random() - 0.5) * 0.8
      g._len = side ? 1.4 + Math.random() * 1.6 : 0.4 + Math.random() * 0.8
      this.groundLayer.addChild(g)
      this.streaks.push(g)
    }

    for (let i = this.streaks.length - 1; i >= 0; i--) {
      const g = this.streaks[i]
      g._t += speed * (1 + g._len * 0.25)
      if (g._t >= 1) {
        g.destroy()
        this.streaks.splice(i, 1)
        continue
      }
      const ease = g._t * g._t
      const side = Math.abs(g._x) > 0.8
      const y = H * (0.45 + (side ? 0.62 : 0.5) * ease)
      // 側邊係數壓到 0.8:1.15 會讓景物在 ease≈0.35 就飛出畫面,可見壽命只有三分之一
      const x = W * (0.5 + g._x * (0.08 + (side ? 0.8 : 0.5) * ease))
      const w = Math.max(1, W * (side ? 0.045 : 0.014) * (0.15 + ease))
      const h = Math.max(1, H * (side ? 0.11 : 0.024) * g._len * (0.12 + ease))
      const alpha = (side ? 0.14 : 0.09) + 0.3 * ease
      g.clear()
      g.rect(-w / 2, -h / 2, w, h).fill({ color: side ? 0x120c1a : 0xffffff, alpha })
      g.position.set(x, y)
    }
  }

  /**
   * 踏步塵土。⚠️ 前進感的主力其實是這個:
   * 腳邊在動比遠處在動好認得多,而且它跟身體的踏步相位同步,看起來才是「他在走」。
   */
  private tickDust(ms: number, marching: boolean) {
    const { W, H } = this
    this.dustTimer -= ms
    if (marching && this.dustTimer <= 0 && this.dust.length < 10) {
      // 與 heroBody 的踏步同一個相位來源(elapsed * 0.011),落地那一刻才揚塵
      this.dustTimer = 260 + Math.random() * 120
      const g = new Graphics() as (typeof this.dust)[number]
      g._t = 0
      g._x = (Math.random() - 0.5) * 0.09
      this.dust.push(g)
      this.groundLayer.addChild(g)
    }
    for (let i = this.dust.length - 1; i >= 0; i--) {
      const g = this.dust[i]
      g._t += ms / (marching ? 700 : 400)
      if (g._t >= 1) {
        g.destroy()
        this.dust.splice(i, 1)
        continue
      }
      const r = Math.min(W, H) * (0.012 + 0.03 * g._t)
      g.clear()
      g.circle(0, 0, r).fill({ color: 0xd8c9b0, alpha: 0.16 * (1 - g._t) })
      // 往鏡頭方向(下)並向後散,像被踩開的塵
      g.position.set(W * (0.5 + g._x) + g._x * W * 1.2 * g._t, H * (0.9 + 0.05 * g._t))
    }
  }

  /** 進到下一層:地面加速掠過 + 一點鏡頭推進,讓「往前」看得見 */
  onFloorUp() {
    if (this.destroyed) return
    this.marchBoost = 1
    this.zoom = Math.max(this.zoom, 0.6)
  }

  private clearMobs() {
    this.mobs.forEach((m) => m.view.destroy())
    this.mobs = []
  }

  private targetPoint() {
    if (this.eventView) return { x: this.eventView.view.x, y: this.eventView.view.y - this.eventView.view.height * 0.5 }
    if (this.boss) return { x: this.boss.view.x, y: this.H * 0.3 }
    const mob = this.frontMob()
    return mob?.hitPoint() ?? { x: this.W / 2, y: this.H * 0.48 }
  }

  private addTimedFx(
    fx: TimedFx,
    duration: number,
    tick: TimedFx['_tick'],
    layer: Container = this.impactLayer,
  ) {
    fx._age = 0
    fx._duration = duration
    fx._tick = tick
    layer.addChild(fx)
    this.timedFx.push(fx)
  }

  private tickTimedFx(ms: number) {
    for (let i = this.timedFx.length - 1; i >= 0; i--) {
      const fx = this.timedFx[i]
      fx._age += ms
      const p = Math.min(1, fx._age / fx._duration)
      fx._tick(fx, p, ms)
      if (p >= 1) {
        fx.destroy({ children: true })
        this.timedFx.splice(i, 1)
      }
    }
  }

  private spawnShieldWave() {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    g.arc(0, 0, 58, -2.55, -0.58).stroke({ width: 14, color: 0xd6dde0, alpha: 0.58 })
    g.arc(0, 0, 45, -2.55, -0.58).stroke({ width: 3, color: 0xffffff, alpha: 0.75 })
    fx.addChild(g)
    fx.position.set(this.W / 2, this.H * 0.75)
    fx.rotation = Math.PI / 2
    this.addTimedFx(fx, 180, (node, p) => {
      node.scale.set(0.45 + p * 2.15)
      node.alpha = 1 - p
      node.y -= 0.35
    })
  }

  private spawnGaleCuts(target: { x: number; y: number }) {
    for (let i = 0; i < 4; i++) {
      const fx = new Container() as TimedFx
      const g = new Graphics()
      g.roundRect(-42, -2, 84, 4, 2).fill({ color: 0xb9f5ff, alpha: 0.9 })
      fx.addChild(g)
      fx.position.set(target.x + (i - 1.5) * 22, target.y + (i % 2) * 24)
      fx.rotation = -0.7 + i * 0.38
      fx.scale.set(0.3)
      this.addTimedFx(fx, 260 + i * 45, (node, p) => {
        node.scale.x = 0.3 + Math.sin(Math.min(1, p * 2) * Math.PI / 2) * 1.25
        node.alpha = 1 - p
      })
    }
  }

  private spawnJudgement(target: { x: number; y: number }) {
    const rune = new Container() as TimedFx
    const circle = new Graphics()
    circle.circle(0, 0, 44).stroke({ width: 4, color: 0xffdf76, alpha: 0.85 })
    circle.circle(0, 0, 30).stroke({ width: 2, color: 0xffffff, alpha: 0.7 })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      circle.rect(Math.cos(a) * 35 - 3, Math.sin(a) * 35 - 3, 6, 6).fill({ color: 0xffdf76, alpha: 0.9 })
    }
    rune.addChild(circle)
    rune.position.set(target.x, target.y + 38)
    rune.scale.set(0.2)
    this.addTimedFx(rune, 720, (node, p) => {
      const intro = Math.min(1, p / 0.22)
      node.scale.set(0.2 + intro * 1.15)
      node.rotation += 0.035
      node.alpha = p < 0.68 ? 1 : (1 - p) / 0.32
    }, this.fieldLayer)

    const beam = new Container() as TimedFx
    const light = new Graphics()
    light.rect(-34, -this.H * 0.52, 68, this.H * 0.56).fill({ color: 0xfff6c8, alpha: 0.62 })
    light.rect(-12, -this.H * 0.55, 24, this.H * 0.6).fill({ color: 0xffffff, alpha: 0.9 })
    beam.addChild(light)
    beam.position.set(target.x, target.y + 30)
    beam.scale.x = 0.1
    this.addTimedFx(beam, 360, (node, p) => {
      node.scale.x = Math.min(1, p * 7)
      node.alpha = p < 0.52 ? 1 : (1 - p) / 0.48
    })

    const flash = new Container() as TimedFx
    const white = new Graphics()
    white.rect(0, 0, this.W, this.H).fill({ color: 0xffffff, alpha: 0.34 })
    flash.addChild(white)
    this.addTimedFx(flash, 90, (node, p) => {
      node.alpha = 1 - p
    }, this.overlayLayer)
  }

  private spawnSigilRays(count: number, target: { x: number; y: number }) {
    for (let i = 0; i < count; i++) {
      const fx = new Container() as TimedFx
      const ray = new Graphics()
      const spread = (i - (count - 1) / 2) * 9
      ray.moveTo(0, 0).lineTo(target.x - this.W / 2 + spread, target.y - this.H * 0.82)
        .stroke({ width: 3, color: 0xffd45a, alpha: 0.85 })
      fx.addChild(ray)
      fx.position.set(this.W / 2, this.H * 0.82)
      fx.alpha = 0
      this.addTimedFx(fx, 260 + i * 35, (node, p) => {
        const local = Math.max(0, p * 1.45 - i * 0.045)
        node.alpha = Math.sin(Math.min(1, local) * Math.PI)
      })
    }
  }

  private spawnReturningSigils(count: number) {
    for (let i = 0; i < count; i++) {
      const fx = new Container() as TimedFx
      const pip = new Graphics()
      pip.roundRect(-5, -4, 10, 8, 2).fill(0xffdd68)
      fx.addChild(pip)
      const start = this.targetPoint()
      fx.position.set(start.x, start.y)
      this.addTimedFx(fx, 520 + i * 50, (node, p) => {
        const q = p * p
        node.position.set(start.x + (this.W / 2 - start.x) * q, start.y + (this.H * 0.62 - start.y) * q - Math.sin(p * Math.PI) * 70)
        node.alpha = Math.sin(p * Math.PI)
      })
    }
  }

  private spawnWindGlyph() {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < 3; i++) {
      g.arc(-24 + i * 12, i * 9, 38 + i * 8, -2.7, -0.2)
        .stroke({ width: 3, color: 0x9beeff, alpha: 0.78 - i * 0.14 })
    }
    fx.addChild(g)
    fx.position.set(this.W / 2, this.H * 0.86)
    this.addTimedFx(fx, 340, (node, p) => {
      node.x = this.W / 2 + p * 45
      node.alpha = 1 - p
      node.scale.set(0.7 + p * 0.6)
    }, this.fieldLayer)
  }

  private spawnHourglass(skillId: SkillId) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    g.poly([-16, -22, 16, -22, -12, 0, 16, 22, -16, 22, 12, 0]).stroke({ width: 4, color: 0xf2c14e, alpha: 0.9 })
    g.poly([-9, -16, 9, -16, 0, -3]).fill({ color: 0xffdb69, alpha: 0.8 })
    fx.addChild(g)
    fx.position.set(this.W * 0.78, this.H * 0.72)
    this.addTimedFx(fx, 650, (node, p) => {
      node.rotation = p * Math.PI
      node.alpha = Math.sin(p * Math.PI)
      node.scale.set(0.75 + Math.sin(p * Math.PI) * 0.4)
    })
    void skillId
  }

  private spawnBannerColumn(target: { x: number; y: number }) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    g.rect(-18, -this.H * 0.48, 36, this.H * 0.52).fill({ color: 0xffb43c, alpha: 0.38 })
    g.rect(-5, -this.H * 0.5, 10, this.H * 0.55).fill({ color: 0xffefad, alpha: 0.72 })
    fx.addChild(g)
    fx.position.set(target.x, target.y + 20)
    this.addTimedFx(fx, 520, (node, p) => {
      node.scale.x = 0.45 + Math.sin(p * Math.PI) * 1.1
      node.alpha = 1 - p
    })
  }

  private spawnRogueDash(target: { x: number; y: number }) {
    const start = { x: this.W * 0.25, y: this.H * 0.72 }
    for (let i = 0; i < 3; i++) {
      const fx = new Container() as TimedFx
      const body = new Graphics()
      body.ellipse(0, -18, 10, 20).fill({ color: 0x7153a6, alpha: 0.6 - i * 0.12 })
      body.roundRect(-3, -42, 6, 28, 3).fill({ color: 0xc3a9ff, alpha: 0.7 })
      fx.addChild(body)
      fx.position.set(start.x, start.y)
      this.addTimedFx(fx, 640 + i * 60, (node, p) => {
        const q = p < 0.5 ? p * 2 : (1 - p) * 2
        node.position.set(start.x + (target.x + 55 - start.x) * q, start.y + (target.y - start.y) * q - Math.sin(p * Math.PI) * 32)
        node.alpha = Math.sin(p * Math.PI)
        node.scale.x = 0.6 + Math.abs(0.5 - p) * 1.2
      })
    }
  }

  private spawnIceBurst(target: { x: number; y: number }, shatter = false) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    const count = shatter ? 12 : 7
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const len = 24 + (i % 3) * 11
      g.poly([0, 0, Math.cos(a - 0.1) * len, Math.sin(a - 0.1) * len, Math.cos(a + 0.1) * len, Math.sin(a + 0.1) * len])
        .fill({ color: i % 2 ? 0xcff6ff : 0x6ecde8, alpha: 0.78 })
    }
    fx.addChild(g)
    fx.position.set(target.x, target.y)
    this.addTimedFx(fx, shatter ? 620 : 480, (node, p) => {
      node.scale.set(0.2 + p * (shatter ? 1.8 : 1))
      node.rotation += shatter ? 0.045 : 0.015
      node.alpha = 1 - p
    })
  }

  private spawnDeployPulse(x: number, y: number, color: number) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    g.circle(0, 0, 34).stroke({ width: 5, color, alpha: 0.8 })
    g.circle(0, 0, 16).fill({ color, alpha: 0.24 })
    fx.addChild(g)
    fx.position.set(x, y)
    this.addTimedFx(fx, 480, (node, p) => {
      node.scale.set(0.35 + p * 1.35)
      node.alpha = 1 - p
    }, this.fieldLayer)
  }

  private spawnCloneSlash() {
    const start = { x: this.W * 0.39, y: this.H * 0.75 }
    const target = this.targetPoint()
    this.spawnProjectile(start, target, 0x91c4ff, true)
  }

  private spawnProjectile(from: { x: number; y: number }, to: { x: number; y: number }, color: number, slash = false) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    if (slash) g.roundRect(-28, -3, 56, 6, 3).fill({ color, alpha: 0.88 })
    else {
      g.circle(0, 0, 8).fill({ color, alpha: 0.95 })
      g.circle(0, 0, 16).fill({ color, alpha: 0.18 })
    }
    fx.addChild(g)
    fx.position.set(from.x, from.y)
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    fx.rotation = angle
    this.addTimedFx(fx, 300, (node, p) => {
      const q = 1 - Math.pow(1 - p, 2)
      node.position.set(from.x + (to.x - from.x) * q, from.y + (to.y - from.y) * q)
      node.alpha = 1 - Math.max(0, (p - 0.78) / 0.22)
      node.scale.x = 0.7 + p * 1.2
    })
  }

  private spawnHeroBurst(color: number) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      g.moveTo(Math.cos(a) * 26, Math.sin(a) * 18)
        .lineTo(Math.cos(a) * 105, Math.sin(a) * 75)
        .stroke({ width: 4, color, alpha: 0.72 })
    }
    fx.addChild(g)
    fx.position.set(this.W / 2, this.H * 0.78)
    this.addTimedFx(fx, 720, (node, p) => {
      node.scale.set(0.25 + p * 1.15)
      node.alpha = 1 - p
      node.rotation += 0.01
    })
  }

  private spawnFormationBreak() {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      g.moveTo(Math.cos(a) * 55, Math.sin(a) * 20)
        .lineTo(Math.cos(a) * 92, Math.sin(a) * 35)
        .stroke({ width: 3, color: 0x9ca4aa, alpha: 0.7 })
    }
    fx.addChild(g)
    fx.position.set(this.W / 2, this.H * 0.86)
    this.addTimedFx(fx, 430, (node, p) => {
      node.scale.set(1 + p * 1.1)
      node.alpha = 1 - p
    }, this.fieldLayer)
  }

  private spawnRelicBreak() {
    const target = this.targetPoint()
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      g.poly([0, 0, Math.cos(a - 0.18) * 42, Math.sin(a - 0.18) * 42, Math.cos(a + 0.18) * 25, Math.sin(a + 0.18) * 25])
        .fill({ color: 0xffcf45, alpha: 0.82 })
    }
    fx.addChild(g)
    fx.position.set(target.x, target.y)
    this.addTimedFx(fx, 580, (node, p) => {
      node.scale.set(0.45 + p * 1.8)
      node.alpha = 1 - p
      node.rotation += 0.04
    })
  }

  private spawnBossBanner() {
    const fx = new Container() as TimedFx
    const panel = new Graphics()
    panel.poly([0, 0, this.W, 0, this.W * 0.92, 54, this.W * 0.08, 54])
      .fill({ color: 0x130a0a, alpha: 0.82 })
    panel.rect(this.W * 0.2, 50, this.W * 0.6, 2).fill({ color: 0xd54b38, alpha: 0.85 })
    const title = new Text({
      text: '首 領 來 襲',
      style: { fontFamily: 'Arial Black, PingFang TC, sans-serif', fontSize: 24, fontWeight: '900', fill: 0xffd4a3 },
    })
    title.anchor.set(0.5)
    title.position.set(this.W / 2, 27)
    fx.addChild(panel, title)
    fx.y = this.H * 0.14
    this.addTimedFx(fx, 1400, (node, p) => {
      node.alpha = Math.min(1, p * 7) * (1 - Math.max(0, (p - 0.72) / 0.28))
      node.x = (1 - Math.min(1, p * 5)) * -this.W * 0.22
    }, this.overlayLayer)
  }



  private createMob(startT = 0) {
    const textures = Math.random() < 0.55 ? this.assets.goblin : this.assets.imp
    return new MobView(textures, startT)
  }

  private spawnImpact(x: number, y: number, scale: number) {
    const impact = new AnimatedSprite(this.assets.hit)
    impact.anchor.set(0.5)
    impact.position.set(x, y)
    impact.scale.set(Math.max(0.2, scale))
    impact.animationSpeed = frameSpeed(HIT_FRAME_MS)
    impact.loop = false
    impact.onComplete = () => impact.destroy()
    this.impactLayer.addChild(impact)
    impact.play()
  }

  private drawStatic() {
    const { W, H, bg } = this
    bg.anchor.set(0.5)
    bg.position.set(W / 2, H / 2)
    bg.scale.set(Math.max(W / bg.texture.width, H / bg.texture.height))

    this.mercSprite.zIndex = 999
    this.layoutCompanions()
  }

  private layoutHero() {
    const { W, H } = this
    const s = Math.min(W, H * 0.62) / 300
    this.heroBody.scale.set(s * 0.96)
    this.afterimages.forEach((ghost, i) => {
      ghost.scale.set(s * 0.96)
      ghost.position.set(-15 - i * 15, 3 + i * 4)
    })
    this.cloneSprite.scale.set(s * 0.88)
    this.cloneSprite.position.set(-W * 0.105, -H * 0.015)
    this.hero.position.set(W / 2, H * 0.86)
    this.slashFx.position.set(0, -H * 0.12)
    this.slashFx.scale.set(s * 0.66)
  }

  private tickHeroSwing(ms: number) {
    const idleX = Math.sin(this.elapsed * 0.0055) * 1.8
    const idleY = Math.sin(this.elapsed * 0.003) * 3 + Math.sin(this.elapsed * 0.011) * 1.6

    if (this.heroSwingLeft <= 0) {
      this.heroBody.position.set(idleX, idleY)
      this.heroBody.rotation = 0
      this.heroBody.skew.x = 0
      this.slashFx.rotation = 0
      return
    }

    this.heroSwingLeft = Math.max(0, this.heroSwingLeft - ms)
    const progress = 1 - this.heroSwingLeft / this.heroSwingDuration
    const side = this.heroSwingSide
    let turn = 0
    let lunge = 0
    let lean = 0

    if (progress < 0.24) {
      const t = progress / 0.24
      turn = -0.16 * t
      lean = -4 * t
    } else if (progress < 0.58) {
      const t = 1 - (1 - (progress - 0.24) / 0.34) ** 3
      turn = -0.16 + 0.48 * t
      lunge = 18 * t
      lean = -4 + 13 * t
    } else {
      const t = (progress - 0.58) / 0.42
      const recover = (1 - t) ** 2
      turn = 0.32 * recover
      lunge = 18 * recover
      lean = 9 * recover
    }

    this.heroBody.position.set(idleX + side * lean, idleY - lunge)
    this.heroBody.rotation = side * turn
    this.heroBody.skew.x = side * turn * 0.14
    this.slashFx.rotation = side * (0.18 - progress * 0.42)
    this.slashFx.x += side * 10
  }

  private syncHeroJob(jobId: JobId) {
    if (jobId === this.heroJob) return
    this.heroJob = jobId
    this.heroSprite.textures = this.assets.heroes[jobId]
    this.heroSprite.gotoAndPlay(0)
    this.afterimages.forEach((ghost) => {
      ghost.textures = this.assets.heroes[jobId]
      ghost.gotoAndPlay(0)
    })
    this.cloneSprite.textures = this.assets.heroes[jobId]
    this.cloneSprite.gotoAndPlay(0)
  }

  private syncMerc(mercId: MercId | null) {
    this.mercSprite.visible = !!mercId
    if (!mercId || mercId === this.mercId) return
    this.mercId = mercId
    this.mercSprite.textures = this.assets.mercenaries[mercId]
    this.mercSprite.gotoAndPlay(0)
  }

  private layoutCompanions() {
    const ds = Math.min(this.W, this.H * 0.62) / 760
    const mercScale = this.mercId === 'hound' ? ds : ds * 2.6
    this.mercSprite.position.set(this.W / 2 - Math.min(this.W, this.H) * 0.24, this.H * 0.895)
    this.mercSprite.scale.set(mercScale)
    this.turretSprite.position.set(this.W * 0.72, this.H * 0.75)
    this.turretSprite.scale.set(ds)
  }

  private drawAura(morale: number) {
    this.heroAura.clear()
    if (morale <= 30) return
    const a = (morale / 100) * 0.5
    const r = 70 + Math.sin(this.elapsed * 0.01) * 6
    this.heroAura.ellipse(0, 6, r * 1.3, r * 0.5).fill({ color: 0x3fae9f, alpha: a * 0.25 })
    this.heroAura.ellipse(0, 6, r * 1.15, r * 0.42).stroke({ width: 3, color: 0x8affe0, alpha: a })
  }

  /** 軍陣:套裝 2 件生效時腳下的方陣圈,讓「套裝真的在運作」看得見 */
  private drawFormation(active: boolean, buffSkill: SkillId | null, permanent: boolean) {
    this.formationFx.clear()
    const shieldActive = buffSkill === 'shieldRush' || buffSkill === 'bulwark' || permanent
    if (!active && !shieldActive) return
    const pulse = 1 + Math.sin(this.elapsed * 0.004) * 0.03
    if (active) {
      this.formationFx
        .ellipse(0, 8, 96 * pulse, 34 * pulse)
        .stroke({ width: 2, color: 0xf2c14e, alpha: 0.5 })
      this.formationFx.ellipse(0, 8, 70 * pulse, 25 * pulse).stroke({ width: 1, color: 0xf2c14e, alpha: 0.3 })
    }
    if (shieldActive) {
      const turn = this.elapsed * 0.00035
      this.formationFx
        .ellipse(0, 8, 112 * pulse, 41 * pulse)
        .stroke({ width: permanent ? 5 : 3, color: permanent ? 0x5b646c : 0x929da4, alpha: permanent ? 0.68 : 0.52 })
      for (let i = 0; i < 6; i++) {
        const a = turn + (i / 6) * Math.PI * 2
        const x = Math.cos(a) * 92
        const y = 8 + Math.sin(a) * 31
        this.formationFx.poly([x - 7, y - 5, x + 7, y - 5, x + 9, y + 2, x, y + 9, x - 9, y + 2])
          .stroke({ width: 2, color: 0xc3cbd0, alpha: 0.62 })
      }
    }
  }

  private drawHeroStates(snap: BattleSnapshot) {
    this.heroStateFx.clear()
    const fullPulse = snap.sigils >= snap.sigilMax ? 0.72 + Math.sin(this.elapsed * 0.01) * 0.28 : 1
    const retained = snap.legends.includes('codexpage')
    const pipColor = retained ? 0xffd45d : 0x80dfef
    const pipCount = Math.min(15, snap.sigilMax)
    const shown = Math.min(pipCount, snap.sigils)
    const pipW = Math.min(9, 124 / Math.max(1, pipCount))
    for (let i = 0; i < pipCount; i++) {
      const x = (i - (pipCount - 1) / 2) * (pipW + 2)
      this.heroStateFx.roundRect(x - pipW / 2, -145, pipW, 8, 2)
        .fill({ color: i < shown ? pipColor : 0x20252b, alpha: i < shown ? fullPulse : 0.64 })
      this.heroStateFx.roundRect(x - pipW / 2, -145, pipW, 8, 2)
        .stroke({ width: retained && i < shown ? 2 : 1, color: i < shown ? (retained ? 0xffeeac : 0xc4f8ff) : 0x697078, alpha: 0.8 })
    }

    const comboCount = Math.min(12, snap.combo)
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI + (i / 11) * Math.PI
      const x = Math.cos(a) * 74
      const y = 13 + Math.sin(a) * 27
      this.heroStateFx.circle(x, y, i < comboCount ? 4 : 2.5)
        .fill({ color: i < comboCount ? 0x8affe0 : 0x293238, alpha: i < comboCount ? 0.8 : 0.45 })
    }

    const stored = Math.min(1, snap.bannerStored / 5)
    const charge = Math.min(1, snap.chargeStacks / 8)
    const glow = Math.max(stored, snap.charging ? 0.35 + charge * 0.65 : 0)
    if (glow > 0) {
      const pulse = 1 + Math.sin(this.elapsed * 0.012) * 0.1
      this.heroStateFx.circle(30, -82, 18 * pulse + glow * 16)
        .fill({ color: stored > charge ? 0xffb33f : 0x7ee8ff, alpha: 0.08 + glow * 0.15 })
      this.heroStateFx.circle(30, -82, 10 + glow * 12)
        .stroke({ width: 3, color: stored > charge ? 0xffd06b : 0xc8f8ff, alpha: 0.32 + glow * 0.42 })
    }

    if (snap.commandReady) {
      const pulse = 0.55 + Math.sin(this.elapsed * 0.009) * 0.2
      this.heroStateFx.ellipse(0, -70, 74, 102).stroke({ width: 4, color: 0xffd45d, alpha: pulse })
    }

    if (snap.legends.includes('hourglass')) {
      const x = 92
      const y = -96
      this.heroStateFx.poly([x - 12, y - 16, x + 12, y - 16, x - 8, y, x + 12, y + 16, x - 12, y + 16, x + 8, y])
        .stroke({ width: 2, color: 0xf2c14e, alpha: 0.72 })
      for (let i = 0; i < 3; i++) {
        this.heroStateFx.circle(x - 10 + i * 10, y + 25, 3.5)
          .fill({ color: i < snap.hourglassSteps ? 0xffd45d : 0x31343a, alpha: 0.85 })
      }
    }

    if (this.bossIntroLeft > 0 && snap.valiantStacks > 0) {
      const p = this.bossIntroLeft / 850
      this.heroStateFx.ellipse(0, -66, 64 + p * 28, 94 + p * 30)
        .fill({ color: 0xe64335, alpha: p * 0.18 })
      this.heroStateFx.ellipse(0, -66, 70 + p * 30, 100 + p * 34)
        .stroke({ width: 4, color: 0xff6554, alpha: p * 0.6 })
    }

    const galeActive = snap.buffSkill === 'gale' || snap.buffSkill === 'shadowClone'
    this.afterimages.forEach((ghost) => {
      ghost.visible = galeActive
      ghost.alpha = 0.14 + Math.sin(this.elapsed * 0.012 + ghost.x) * 0.04
    })
    this.cloneSprite.visible = snap.cloneActive
    this.cloneSprite.alpha = snap.cloneActive ? 0.28 + Math.sin(this.elapsed * 0.009) * 0.08 : 0
  }

  private drawBattleStates(snap: BattleSnapshot) {
    this.fieldFx.clear()
    this.enemyStateFx.clear()
    this.overlayFx.clear()
    const target = this.targetPoint()
    const pulse = 0.7 + Math.sin(this.elapsed * 0.012) * 0.22

    if (snap.bannerLeft > 0) {
      const x = this.W * 0.72
      const y = this.H * 0.75
      this.fieldFx.ellipse(x, y + 7, 42, 13).fill({ color: 0x130b08, alpha: 0.4 })
      this.fieldFx.rect(x - 3, y - 90, 6, 94).fill(0x3c2b22)
      this.fieldFx.poly([x, y - 86, x + 55, y - 70, x, y - 48]).fill({ color: 0xc94b32, alpha: 0.9 })
      this.fieldFx.circle(x, y - 56, 32 * pulse).fill({ color: 0xff7a32, alpha: 0.08 })
    }
    if (snap.zoneLeft > 0) {
      const x = this.W * 0.72
      const y = this.H * 0.75
      this.turretSprite.visible = true
      this.fieldFx.ellipse(x, y + 6, 38, 11).fill({ color: 0x090b0d, alpha: 0.42 })
      this.fieldFx.circle(x + 38, y - 46, 7 * pulse).fill({ color: 0xffb34d, alpha: 0.55 })
    } else this.turretSprite.visible = false

    if (snap.event) {
      const limitPulse = 1 + Math.sin(this.elapsed * 0.016) * 0.08
      this.fieldFx.circle(target.x, target.y + 55, 58 * limitPulse)
        .stroke({ width: 4, color: 0xffc14f, alpha: 0.7 })
      this.fieldFx.arc(target.x, target.y + 55, 68, -Math.PI / 2, -Math.PI / 2 + (this.elapsed * 0.002) % (Math.PI * 2))
        .stroke({ width: 5, color: 0xfff2b0, alpha: 0.8 })
    }

    if (snap.encounterWaiting && !snap.event && !snap.isBoss) {
      const x = this.W * 0.81
      const y = this.H * 0.58
      this.fieldFx.ellipse(x, y + 8, 30, 8).fill({ color: 0x080608, alpha: 0.32 })
      this.fieldFx.rect(x - 3, y - 58, 6, 66).fill({ color: 0x513725, alpha: 0.9 })
      this.fieldFx.poly([x, y - 55, x + 45, y - 46, x, y - 31])
        .fill({ color: 0xd69443, alpha: 0.82 })
      this.fieldFx.circle(x + 12, y - 43, 4 + Math.sin(this.elapsed * 0.008) * 1.2)
        .fill({ color: 0xffe29a, alpha: 0.75 })
    }

    if (snap.burnLeft > 0) {
      for (let i = 0; i < 7; i++) {
        const phase = (this.elapsed * 0.0015 + i / 7) % 1
        const x = target.x + Math.sin(i * 2.37) * 34 * (1 - phase * 0.35)
        const y = target.y + 34 - phase * 82
        const r = 4 + (1 - phase) * 8
        this.enemyStateFx.circle(x, y, r).fill({ color: i % 2 ? 0xffb23d : 0xff532b, alpha: (1 - phase) * 0.76 })
      }
      this.enemyStateFx.circle(target.x, target.y + 20, 44 * pulse)
        .stroke({ width: 3, color: 0xff682f, alpha: 0.45 })
    }

    if (snap.relicLeft > 0 && snap.isBoss) {
      this.enemyStateFx.circle(target.x + 36, target.y + 6, 18 * pulse).fill({ color: 0xffc926, alpha: 0.18 })
      this.enemyStateFx.circle(target.x + 36, target.y + 6, 12).stroke({ width: 4, color: 0xffd85c, alpha: 0.9 })
      this.enemyStateFx.moveTo(target.x + 27, target.y - 3).lineTo(target.x + 44, target.y + 14)
        .moveTo(target.x + 44, target.y - 3).lineTo(target.x + 27, target.y + 14)
        .stroke({ width: 3, color: 0xfff0a5, alpha: 0.9 })
    }

    if (snap.freezeLeft > 0) {
      this.overlayFx.rect(0, 0, this.W, this.H).fill({ color: 0xa9e9ff, alpha: 0.12 })
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        const x = target.x + Math.cos(a) * 62
        const y = target.y + Math.sin(a) * 48
        this.enemyStateFx.poly([x, y - 18, x + 7, y + 12, x - 7, y + 12])
          .fill({ color: 0xc8f5ff, alpha: 0.55 })
      }
    }

    if (this.bossIntroLeft > 0) {
      this.overlayFx.rect(0, 0, this.W, this.H)
        .fill({ color: 0x08040a, alpha: (this.bossIntroLeft / 850) * 0.34 })
    } else if (this.eventIntroLeft > 0) {
      this.overlayFx.rect(0, 0, this.W, this.H)
        .fill({ color: 0xffdf78, alpha: (this.eventIntroLeft / 260) * 0.16 })
    }

    if (snap.bossTimeLeft !== null && snap.bossTimeLeft < 5) {
      const a = 0.18 + Math.sin(this.elapsed * 0.018) * 0.12
      const w = Math.max(12, Math.min(this.W, this.H) * 0.035)
      this.overlayFx.rect(0, 0, this.W, w).fill({ color: 0xb31f1f, alpha: a })
      this.overlayFx.rect(0, this.H - w, this.W, w).fill({ color: 0xb31f1f, alpha: a })
      this.overlayFx.rect(0, 0, w, this.H).fill({ color: 0xb31f1f, alpha: a })
      this.overlayFx.rect(this.W - w, 0, w, this.H).fill({ color: 0xb31f1f, alpha: a })
    }
  }
}

type AttackSource = 'hero' | 'clone' | 'zone' | 'merc'

interface TimedFx extends Container {
  _age: number
  _duration: number
  _tick: (fx: TimedFx, progress: number, ms: number) => void
}

interface FloatText extends Text {
  _vy: number
  _life: number
}

function frameSpeed(frameMs: number): number {
  return 1000 / 60 / frameMs
}

/** 小怪:t 0(深處)→ 1(近戰位),深度感公式見 clicker-ui skill 第三節 */
class MobView {
  view: AnimatedSprite
  t: number
  private speed = 0.0016 + Math.random() * 0.0008
  private offset = (Math.random() - 0.5) * 0.26
  private flashLeft = 0

  constructor(textures: Texture[], startT = 0) {
    this.view = new AnimatedSprite(textures)
    this.t = startT
    this.view.anchor.set(0.5, 233 / 256)
    this.view.animationSpeed = frameSpeed(MOB_FRAME_MS) * (0.9 + Math.random() * 0.2)
    this.view.gotoAndPlay(Math.floor(Math.random() * textures.length))
  }

  flash() {
    this.flashLeft = 70
    this.view.tint = 0xffe8b0
  }

  hitPoint() {
    return {
      x: this.view.x,
      y: this.view.y - this.view.height * 0.56,
    }
  }

  layout(ms: number, W: number, H: number) {
    if (this.flashLeft > 0) {
      this.flashLeft -= ms
      if (this.flashLeft <= 0) this.view.tint = 0xffffff
    }
    if (this.t < 1) this.t = Math.min(1, this.t + this.speed * ms)
    const ease = this.t * this.t
    // 像素怪本體比原型向量怪高,近戰位略上移避免壓住主角頭盔
    const y = H * (0.44 + 0.22 * ease)
    const x = W * (0.5 + this.offset * (0.3 + 0.7 * ease))
    const sc = (0.25 + 0.95 * ease) * (Math.min(W, H) / 420) * 0.32
    this.view.position.set(x, y)
    this.view.scale.set(sc)
    this.view.zIndex = y
    this.view.alpha = Math.min(1, this.t * 6)
  }
}

/** 突發事件:寶箱怪 / 黃金哥布林,出現在近戰位、金色高亮 */
class EventView {
  view: AnimatedSprite
  private t = 0
  private flashLeft = 0

  constructor(
    public kind: 'chest' | 'goblin',
    textures: Texture[],
  ) {
    this.view = new AnimatedSprite(textures)
    this.view.anchor.set(0.5, 233 / 256)
    this.view.animationSpeed = frameSpeed(EVENT_FRAME_MS)
    this.view.play()
  }

  flash() {
    if (this.flashLeft > 0) return
    this.flashLeft = 70
    this.view.tint = 0xffffff
    this.view.alpha = 0.72
  }

  layout(ms: number, W: number, H: number) {
    if (this.flashLeft > 0) {
      this.flashLeft -= ms
      if (this.flashLeft <= 0) {
        this.view.tint = 0xffffff
        this.view.alpha = 1
      }
    }
    this.t += ms
    const s = Math.min(W, H) / 520
    // 放在小徑中段:不能低到跟主角背影重疊(主角永遠是焦點)
    this.view.position.set(W / 2, H * 0.56 + Math.sin(this.t * 0.006) * 3)
    this.view.scale.set(s * (1 + Math.sin(this.t * 0.012) * 0.04))
    this.view.zIndex = 500
  }
}

/** Boss:軀體超出畫面左右、上半屏俯壓 */
class BossView {
  view: AnimatedSprite
  private flashLeft = 0
  private entryAge = 0
  private frozen = false

  constructor(textures: Texture[]) {
    this.view = new AnimatedSprite(textures)
    this.view.anchor.set(0.5, 233 / 256)
    this.view.animationSpeed = frameSpeed(BOSS_FRAME_MS)
    this.view.play()
  }

  layout(ms: number, W: number, H: number, frozen: boolean) {
    this.entryAge += ms
    const entry = Math.min(1, this.entryAge / 520)
    const eased = 1 - Math.pow(1 - entry, 3)
    this.view.position.set(W / 2, H * (0.48 + 0.15 * eased))
    this.view.scale.set((W / 200) * (0.38 + eased * 0.62))
    if (this.frozen !== frozen) {
      this.frozen = frozen
      if (frozen) this.view.stop()
      else this.view.play()
    }
    if (frozen) this.view.tint = 0xbdefff
    this.view.zIndex = 300
    if (this.flashLeft > 0) {
      this.flashLeft -= ms
      if (this.flashLeft <= 0) {
        this.view.tint = frozen ? 0xbdefff : 0xffffff
        this.view.alpha = 1
      }
    }
  }

  flash() {
    if (this.flashLeft > 0) return
    this.flashLeft = 70
    this.view.tint = 0xfff0c8
    this.view.alpha = 0.72
  }
}
