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
import type { JobId, LegendId, MercId, SkillId } from '../core/types'

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
  /** 凍結剩餘秒數(畫面褪色、敵人停格) */
  freezeLeft: number
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
  dog: Texture[]
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
  dog: [dog1Url, dog2Url, dog3Url, dog4Url],
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
  const [background, heroEntries, goblin, imp, boss, chest, goldenGoblin, dog, slash, hit] = await Promise.all([
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
    loadTextures(textureGroups.dog),
    loadTextures(textureGroups.slash),
    loadTextures(textureGroups.hit),
  ])
  background.source.scaleMode = 'nearest'
  const heroes = Object.fromEntries(heroEntries) as Record<JobId, Texture[]>
  return { background, heroes, goblin, imp, boss, chest, goldenGoblin, dog, slash, hit }
}

export class BattleScene {
  private app = new Application()
  private world = new Container()
  private bg: Sprite
  private mobLayer = new Container()
  private impactLayer = new Container()
  private dmgLayer = new Container()
  private hero = new Container()
  private heroAura = new Graphics()
  private formationFx = new Graphics()
  private heroBody = new Container()
  private heroSprite: AnimatedSprite
  private heroJob: JobId = 'rookie'
  private slashFx: AnimatedSprite
  private dog: AnimatedSprite

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

  private constructor(
    private getSnap: () => BattleSnapshot,
    private assets: VisualAssets,
  ) {
    this.bg = new Sprite(assets.background)
    this.heroSprite = new AnimatedSprite(assets.heroes.rookie)
    this.slashFx = new AnimatedSprite(assets.slash)
    this.dog = new AnimatedSprite(assets.dog)
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
    world.addChild(this.bg, this.groundLayer, this.mobLayer, this.impactLayer, this.hero, this.dog, this.dmgLayer)
    this.hero.addChild(this.heroAura, this.formationFx, this.heroBody, this.slashFx)
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

    this.dog.anchor.set(0.5, 233 / 256)
    this.dog.animationSpeed = frameSpeed(HERO_FRAME_MS)
    this.dog.play()

    this.W = app.screen.width
    this.H = app.screen.height
    this.drawStatic()
    app.ticker.add(() => this.frame(app.ticker.deltaMS))
  }

  destroy() {
    this.destroyed = true
    this.streaks = []
    this.dust = []
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
    void skillId
    void sigilsSpent
    this.shake = 9
    this.zoom = 1.6
    const y = this.boss ? this.H * 0.3 : this.H * 0.4
    this.damageNum(this.W / 2, y, text, true)
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
    this.notice(names[mercId])
  }

  /**
   * 冷卻被推進(追風者之靴的暴擊、倒轉沙漏的順序)。
   * ⚠️ 目前只有一行提示 —— 應該做成技能格冷卻條跳一格 + 腳下風紋(清單 F9 / F10)。
   */
  onCooldownAdvance(skillId: SkillId, seconds: number) {
    if (this.destroyed) return
    void skillId
    this.notice(`冷卻 −${seconds.toFixed(1)}s`)
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
  swing(dmgText: string, crit = false) {
    if (this.destroyed) return
    const snap = this.getSnap()
    this.slashFx.visible = true
    this.slashFx.alpha = 1
    this.slashFx.tint = snap.morale >= 100 ? 0x8affe0 : 0xffffff
    this.slashFx.gotoAndPlay(0)
    this.shake = Math.min(this.shake + 4, 9)
    this.zoom = 1

    if (this.eventView) {
      this.eventView.flash()
      this.spawnImpact(this.W / 2, this.H * 0.48, 0.56)
      this.hitNum(this.W / 2, this.H * 0.42, dmgText, crit)
    } else if (this.boss) {
      this.boss.flash()
      this.boss.view.y += 6
      this.spawnImpact(
        this.W / 2 + (Math.random() - 0.5) * this.W * 0.3,
        this.H * 0.3,
        0.72,
      )
      this.hitNum(this.W / 2, this.H * 0.34, dmgText, crit)
    } else {
      const target = this.frontMob()
      if (!target) {
        // 剛清完屏的那幾百毫秒還是會有出手,沒有 fallback 會變成「點了沒反應」
        this.spawnImpact(this.W / 2, this.H * 0.55, 0.5)
        this.hitNum(this.W / 2, this.H * 0.5, dmgText, crit)
      }
      if (target) {
        target.flash()
        target.view.y -= 10
        const hit = target.hitPoint()
        this.spawnImpact(hit.x, hit.y, target.view.scale.x)
        this.hitNum(target.view.x, target.view.y - target.view.height * 0.82, dmgText, crit)
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

  onBossKill() {
    if (this.destroyed) return
    this.damageNum(this.W / 2, this.H * 0.3, '擊 破 !', true)
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
    // 點擊改為直接出手後跳字量翻倍,暴擊完全不節流會把 12 上限洗掉其他字
    if (crit) {
      if (this.critNumCooldown > 0) return
      this.critNumCooldown = 100
    } else {
      if (this.hitNumCooldown > 0) return
      this.hitNumCooldown = 160
    }
    // 點擊改為會直接出手後,跳字量幾乎翻倍 → 錯開位置從 3 格加到 5 格
    const slot = this.hitNumSlot++ % 5
    this.damageNum(x + (slot - 2) * 44, y - slot * 20, txt, crit)
  }

  private damageNum(x: number, y: number, txt: string, crit: boolean) {
    // 同屏跳字上限,超過先移除最舊的
    while (this.dmgLayer.children.length >= 12) this.dmgLayer.children[0].destroy()
    const t = new Text({
      text: txt,
      style: {
        fontFamily: 'Arial Black, PingFang TC, sans-serif',
        fontSize: crit ? 34 : 24,
        fontWeight: '900',
        fill: crit ? 0xffd23e : 0xffffff,
        stroke: { color: 0x000000, width: 5 },
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
    const resized = this.W !== this.app.screen.width || this.H !== this.app.screen.height
    this.W = this.app.screen.width
    this.H = this.app.screen.height
    if (resized) this.drawStatic()
    this.syncHeroJob(snap.jobId)

    // 突發事件出場 / 退場
    if (snap.event && this.eventView?.kind !== snap.event) {
      this.eventView?.view.destroy()
      this.clearMobs()
      const textures = snap.event === 'chest' ? this.assets.chest : this.assets.goldenGoblin
      this.eventView = new EventView(snap.event, textures)
      this.mobLayer.addChild(this.eventView.view)
      this.shake = 8
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
    } else if (!snap.isBoss && this.boss) {
      this.boss.view.destroy()
      this.boss = null
    }

    if (this.boss) {
      this.boss.layout(ms, this.W, this.H)
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

    // 行進中的身體晃動:呼吸(慢)+ 走路踏步(快),再加一點左右擺
    this.heroBody.y = Math.sin(this.elapsed * 0.003) * 3 + Math.sin(this.elapsed * 0.011) * 1.6
    this.heroBody.x = Math.sin(this.elapsed * 0.0055) * 1.8
    this.dog.y = this.H * 0.895 + Math.sin(this.elapsed * 0.013 + 1) * 1.8

    // 背景微幅浮動:靜止的底圖會讓所有前進感被「背景完全不動」抵銷
    this.bg.y = this.H / 2 + Math.sin(this.elapsed * 0.0016) * 2
    this.drawAura(snap.morale)
    this.drawFormation(snap.formation)
    this.layoutHero()

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

    this.dog.position.set(W / 2 - Math.min(W, H) * 0.24, H * 0.895)
    this.dog.zIndex = 999
    const ds = Math.min(W, H * 0.62) / 760
    this.dog.scale.set(ds)
  }

  private layoutHero() {
    const { W, H } = this
    const s = Math.min(W, H * 0.62) / 300
    this.heroBody.scale.set(s * 0.96)
    this.hero.position.set(W / 2, H * 0.86)
    this.slashFx.position.set(0, -H * 0.12)
    this.slashFx.scale.set(s * 0.66)
  }

  private syncHeroJob(jobId: JobId) {
    if (jobId === this.heroJob) return
    this.heroJob = jobId
    this.heroSprite.textures = this.assets.heroes[jobId]
    this.heroSprite.gotoAndPlay(0)
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
  private drawFormation(active: boolean) {
    this.formationFx.clear()
    if (!active) return
    const pulse = 1 + Math.sin(this.elapsed * 0.004) * 0.03
    this.formationFx
      .ellipse(0, 8, 96 * pulse, 34 * pulse)
      .stroke({ width: 2, color: 0xf2c14e, alpha: 0.5 })
    this.formationFx.ellipse(0, 8, 70 * pulse, 25 * pulse).stroke({ width: 1, color: 0xf2c14e, alpha: 0.3 })
  }
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

  constructor(textures: Texture[]) {
    this.view = new AnimatedSprite(textures)
    this.view.anchor.set(0.5, 233 / 256)
    this.view.animationSpeed = frameSpeed(BOSS_FRAME_MS)
    this.view.play()
  }

  layout(ms: number, W: number, H: number) {
    this.view.position.set(W / 2, H * 0.63)
    this.view.scale.set(W / 200)
    this.view.zIndex = 300
    if (this.flashLeft > 0) {
      this.flashLeft -= ms
      if (this.flashLeft <= 0) {
        this.view.tint = 0xffffff
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
