import { Application, Container, Graphics, Text } from 'pixi.js'

/**
 * 戰鬥演出層。只讀 snapshot 做畫面,不 import React / store 邏輯。
 * 構圖與回饋規格見 .claude/skills/clicker-ui/SKILL.md。
 */
export interface BattleSnapshot {
  floor: number
  isBoss: boolean
  /** 突發事件種類,無事件為 null */
  event: 'chest' | 'goblin' | null
  hpRatio: number
  morale: number
  cape: number
  weapon: 'wood' | 'sword' | 'dagger'
  /** 一次自動揮砍的傷害顯示文字 */
  autoDmgText: string
}

const AUTO_SWING_MS = 800

export class BattleScene {
  private app = new Application()
  private world = new Container()
  private bg = new Graphics()
  private mobLayer = new Container()
  private dmgLayer = new Container()
  private hero = new Container()
  private heroAura = new Graphics()
  private heroBody = new Container()
  private cape = new Graphics()
  private torso = new Graphics()
  private head = new Graphics()
  private armPivot = new Container()
  private weapon = new Graphics()
  private slashFx = new Graphics()
  private dog = new Graphics()

  private mobs: MobView[] = []
  private boss: BossView | null = null
  private eventView: EventView | null = null
  private shake = 0
  private zoom = 0
  private elapsed = 0
  private spawnTimer = 0
  private autoTimer = 0
  private dogWag = 0
  private goldNumCooldown = 0
  private W = 0
  private H = 0
  private destroyed = false

  private constructor(private getSnap: () => BattleSnapshot) {}

  static async create(el: HTMLElement, getSnap: () => BattleSnapshot): Promise<BattleScene> {
    const scene = new BattleScene(getSnap)
    await scene.app.init({ resizeTo: el, backgroundAlpha: 0, antialias: true })
    el.appendChild(scene.app.canvas)
    scene.setup()
    return scene
  }

  private setup() {
    const { app, world } = this
    app.stage.addChild(world)
    this.mobLayer.sortableChildren = true
    world.addChild(this.bg, this.mobLayer, this.hero, this.dog, this.dmgLayer)
    this.hero.addChild(this.heroAura, this.heroBody, this.slashFx)
    this.heroBody.addChild(this.cape, this.torso, this.head, this.armPivot)
    this.armPivot.addChild(this.weapon)
    this.armPivot.rotation = 0.5

    this.W = app.screen.width
    this.H = app.screen.height
    this.drawStatic()
    app.ticker.add(() => this.frame(app.ticker.deltaMS))
  }

  destroy() {
    this.destroyed = true
    this.app.destroy(true, { children: true })
  }

  // ---------- 對外演出介面 ----------

  /** 揮砍一次(點擊或自動)。crit 走金字大字 */
  swing(dmgText: string, crit = false) {
    if (this.destroyed) return
    const snap = this.getSnap()
    this.armPivot.rotation = -1.5
    this.slashFx
      .clear()
      .arc(0, -40, 92, -2.4, -0.5)
      .stroke({ width: 9, color: snap.morale >= 100 ? 0x8affe0 : 0xfff0c0, alpha: 0.9 })
    this.slashFx.alpha = 1
    this.shake = Math.min(this.shake + 4, 9)
    this.zoom = 1

    if (this.eventView) {
      this.eventView.flash()
      this.damageNum(this.W / 2 + (Math.random() - 0.5) * 60, this.H * 0.42, dmgText, crit)
    } else if (this.boss) {
      this.boss.flash()
      this.boss.view.y += 6
      this.damageNum(this.W / 2 + (Math.random() - 0.5) * this.W * 0.4, this.H * 0.34, dmgText, crit)
    } else {
      const target = this.frontMob()
      if (target) {
        target.flash()
        target.view.y -= 10
        this.damageNum(target.view.x, target.view.y - 60 * target.view.scale.y, dmgText, crit)
      }
    }
  }

  /** core 回報擊殺 → 移除最前方的怪並跳金幣 */
  onKill(goldText: string) {
    if (this.destroyed) return
    let target = this.frontMob()
    // 邏輯擊殺速度可能快過視覺生成:補一隻已接近的,確保每次擊殺都有回饋
    if (!target) {
      target = new MobView(0.8)
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
    const resized = this.W !== this.app.screen.width || this.H !== this.app.screen.height
    this.W = this.app.screen.width
    this.H = this.app.screen.height
    if (resized) this.drawStatic()

    // 突發事件出場 / 退場
    if (snap.event && this.eventView?.kind !== snap.event) {
      this.eventView?.view.destroy()
      this.clearMobs()
      this.eventView = new EventView(snap.event)
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
      this.boss = new BossView(this.W, this.H)
      this.mobLayer.addChild(this.boss.view)
      this.shake = 12
    } else if (!snap.isBoss && this.boss) {
      this.boss.view.destroy()
      this.boss = null
    }

    if (this.boss) {
      this.boss.idle += ms * 0.002
      this.boss.view.y = this.H * 0.26 + Math.sin(this.boss.idle) * 8
    } else if (!this.eventView) {
      // 一般層:持續湧怪,同屏上限 4
      this.spawnTimer -= ms
      if (this.spawnTimer <= 0 && this.mobs.length < 4) {
        const m = new MobView()
        this.mobLayer.addChild(m.view)
        this.mobs.push(m)
        this.spawnTimer = 450 + Math.random() * 500
      }
      for (const m of this.mobs) m.layout(ms, this.W, this.H)
    }

    // 自動揮砍:掛機時主角仍在打
    this.autoTimer -= ms
    if (this.autoTimer <= 0) {
      this.autoTimer = AUTO_SWING_MS
      this.swing(snap.autoDmgText, false)
    }

    // 待機呼吸 + 揮臂回彈
    this.heroBody.y = Math.sin(this.elapsed * 0.003) * 3
    this.armPivot.rotation += (0.5 - this.armPivot.rotation) * 0.15
    this.slashFx.alpha *= 0.82

    this.drawAura(snap.morale)
    this.drawHero(snap)

    // 傭兵搖尾
    this.dogWag += ms * 0.01
    this.dog.rotation = Math.sin(this.dogWag) * 0.05

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

  private clearMobs() {
    this.mobs.forEach((m) => m.view.destroy())
    this.mobs = []
  }

  private drawStatic() {
    const { W, H, bg } = this
    bg.clear()
    // 天空帶狀漸層
    ;[0x241b33, 0x2d2140, 0x37294e].forEach((c, i) => {
      bg.rect(0, H * 0.13 * i, W, H * 0.14).fill(c)
    })
    // 遠山剪影
    bg.poly([0, H * 0.42, W * 0.2, H * 0.3, W * 0.4, H * 0.4, W * 0.62, H * 0.27, W * 0.85, H * 0.38, W, H * 0.33, W, H * 0.5, 0, H * 0.5]).fill(0x1c1528)
    // 地面
    bg.rect(0, H * 0.42, W, H * 0.58).fill(0x2b2135)
    // 小徑:梯形展開到腳下 → 視線引導
    bg.poly([W * 0.44, H * 0.42, W * 0.56, H * 0.42, W * 0.88, H, W * 0.12, H]).fill(0x3a2c46)
    // 徑上碎石
    for (let i = 0; i < 9; i++) {
      const t = i / 9
      const y = H * (0.46 + 0.5 * t * t)
      const s = 2 + 7 * t
      bg.ellipse(W * (0.5 + ((i % 3) - 1) * 0.09 * (0.4 + t)), y, s * 1.6, s * 0.7).fill(0x473557)
    }
    // 兩側樹影
    ;([[0.06, 0.4, 0.9], [0.94, 0.38, 1], [0.13, 0.55, 1.6], [0.9, 0.6, 1.9]] as const).forEach(([x, y, s]) => {
      bg.poly([W * x - 14 * s, H * y + 60 * s, W * x, H * y - 40 * s, W * x + 14 * s, H * y + 60 * s]).fill(0x171021)
    })

    this.dog.position.set(W / 2 - Math.min(W, H) * 0.24, H * 0.895)
    this.dog.zIndex = 999
    const ds = Math.min(W, H * 0.62) / 300
    this.dog.scale.set(ds)
    this.dog.clear()
    this.dog.ellipse(0, 0, 20, 13).fill(0xb08a5a)
    this.dog.circle(14, -10, 9).fill(0xb08a5a)
    this.dog.poly([8, -18, 12, -8, 16, -16]).fill(0x8a6a48)
    this.dog.poly([18, -18, 22, -8, 26, -16]).fill(0x8a6a48)
  }

  private drawHero(snap: BattleSnapshot) {
    const { W, H } = this
    const s = Math.min(W, H * 0.62) / 300
    this.heroBody.scale.set(s * 1.15)
    this.hero.position.set(W / 2, H * 0.86)

    // 披風(背面最顯眼的換裝件,轉職換色)
    this.cape.clear()
    this.cape.poly([-26, -46, 26, -46, 34, 52, 12, 44, 0, 56, -12, 44, -34, 52]).fill(snap.cape)
    this.cape.poly([-26, -46, 0, -40, -34, 52]).fill(darken(snap.cape))

    this.torso.clear()
    this.torso.roundRect(-24, -52, 48, 66, 10).fill(0x5a4a3a)
    this.torso.roundRect(-24, -52, 48, 14, 7).fill(0x6e5a45)
    this.torso.moveTo(0, -50).lineTo(0, 10).stroke({ width: 3, color: 0x3d3228 })

    this.head.clear()
    this.head.circle(0, -66, 15).fill(0xd8a878)
    this.head.roundRect(-16, -84, 32, 20, 9).fill(0x7a7f8a)
    this.head.rect(-16, -70, 32, 4).fill(0x9aa0ac)

    this.armPivot.position.set(20, -40)
    this.weapon.clear()
    this.weapon.roundRect(-4, 0, 9, 20, 4).fill(0xd8a878) // 手臂
    if (snap.weapon === 'wood') {
      this.weapon.roundRect(-2.5, 14, 6, 10, 2).fill(0x8a6a48)
      this.weapon.roundRect(-3.5, -46, 8, 62, 3).fill(0xb08a5a)
    } else if (snap.weapon === 'sword') {
      this.weapon.roundRect(-4, 14, 9, 10, 2).fill(0x4a4a52)
      this.weapon.roundRect(-4.5, -54, 10, 70, 3).fill(0xc8ccd8)
      this.weapon.rect(-1, -54, 2, 70).fill(0x8f96a8)
    } else {
      this.weapon.roundRect(-3, 12, 7, 9, 2).fill(0x3a3a42)
      this.weapon.poly([-4, 8, 4, 8, 1, -34, -1, -34]).fill(0xd8e0e8)
    }
  }

  private drawAura(morale: number) {
    this.heroAura.clear()
    if (morale <= 30) return
    const a = (morale / 100) * 0.5
    const r = 70 + Math.sin(this.elapsed * 0.01) * 6
    this.heroAura.ellipse(0, 6, r * 1.3, r * 0.5).fill({ color: 0x3fae9f, alpha: a * 0.25 })
    this.heroAura.ellipse(0, 6, r * 1.15, r * 0.42).stroke({ width: 3, color: 0x8affe0, alpha: a })
  }
}

interface FloatText extends Text {
  _vy: number
  _life: number
}

function darken(c: number): number {
  const r = Math.floor(((c >> 16) & 0xff) * 0.78)
  const g = Math.floor(((c >> 8) & 0xff) * 0.78)
  const b = Math.floor((c & 0xff) * 0.78)
  return (r << 16) | (g << 8) | b
}

/** 小怪:t 0(深處)→ 1(近戰位),深度感公式見 clicker-ui skill 第三節 */
class MobView {
  view = new Graphics()
  t: number
  private speed = 0.0016 + Math.random() * 0.0008
  private offset = (Math.random() - 0.5) * 0.26
  private hue = [0x6da05e, 0x5e8aa0, 0xa08a5e][Math.floor(Math.random() * 3)]
  private flashLeft = 0

  constructor(startT = 0) {
    this.t = startT
    this.draw(false)
  }

  private draw(flash: boolean) {
    const col = flash ? 0xffffff : this.hue
    const dark = flash ? 0xffffff : 0x2a2a2a
    const g = this.view
    g.clear()
    g.roundRect(-22, -34, 44, 44, 12).fill(col)
    g.circle(-9, -16, 4.5).fill(dark)
    g.circle(9, -16, 4.5).fill(dark)
    g.roundRect(-8, -6, 16, 4, 2).fill(dark)
    g.poly([-22, -34, -14, -46, -8, -34]).fill(col)
    g.poly([8, -34, 14, -46, 22, -34]).fill(col)
  }

  flash() {
    this.flashLeft = 70
    this.draw(true)
  }

  layout(ms: number, W: number, H: number) {
    if (this.flashLeft > 0) {
      this.flashLeft -= ms
      if (this.flashLeft <= 0) this.draw(false)
    }
    if (this.t < 1) this.t = Math.min(1, this.t + this.speed * ms)
    const ease = this.t * this.t
    const y = H * (0.44 + 0.27 * ease)
    const x = W * (0.5 + this.offset * (0.3 + 0.7 * ease))
    const sc = (0.25 + 0.95 * ease) * (Math.min(W, H) / 420)
    this.view.position.set(x, y)
    this.view.scale.set(sc)
    this.view.zIndex = y
    this.view.alpha = Math.min(1, this.t * 6)
  }
}

/** 突發事件:寶箱怪 / 黃金哥布林,出現在近戰位、金色高亮 */
class EventView {
  view = new Graphics()
  private t = 0
  private flashLeft = 0

  constructor(public kind: 'chest' | 'goblin') {
    this.draw(false)
  }

  private draw(flash: boolean) {
    const g = this.view
    g.clear()
    if (this.kind === 'chest') {
      const body = flash ? 0xffffff : 0x8a6a3a
      const trim = flash ? 0xffffff : 0xf2c14e
      g.roundRect(-34, -20, 68, 40, 6).fill(body)
      g.roundRect(-34, -34, 68, 20, 8).fill(trim) // 箱蓋
      g.rect(-6, -24, 12, 30).fill(trim) // 鎖扣
      g.circle(-14, -4, 4).fill(0x2a2a2a) // 眼
      g.circle(14, -4, 4).fill(0x2a2a2a)
    } else {
      const body = flash ? 0xffffff : 0x7ac46d
      const gold = flash ? 0xffffff : 0xf2c14e
      g.circle(0, -14, 22).fill(body) // 頭
      g.poly([-22, -20, -34, -34, -16, -30]).fill(body) // 耳
      g.poly([22, -20, 34, -34, 16, -30]).fill(body)
      g.circle(-8, -16, 4).fill(0x2a2a2a)
      g.circle(8, -16, 4).fill(0x2a2a2a)
      g.ellipse(0, 16, 20, 14).fill(gold) // 金袋
    }
  }

  flash() {
    if (this.flashLeft > 0) return
    this.flashLeft = 70
    this.draw(true)
  }

  layout(ms: number, W: number, H: number) {
    if (this.flashLeft > 0) {
      this.flashLeft -= ms
      if (this.flashLeft <= 0) this.draw(false)
    }
    this.t += ms
    const s = Math.min(W, H) / 300
    // 放在小徑中段:不能低到跟主角背影重疊(主角永遠是焦點)
    this.view.position.set(W / 2, H * 0.5 + Math.sin(this.t * 0.006) * 6)
    this.view.scale.set(s * (1 + Math.sin(this.t * 0.012) * 0.04))
    this.view.zIndex = 500
  }
}

/** Boss:軀體超出畫面左右、上半屏俯壓 */
class BossView {
  view = new Graphics()
  idle = 0
  private flashLeft = 0

  constructor(
    private W: number,
    private H: number,
  ) {
    this.draw(false)
    this.view.position.set(W / 2, H * 0.26)
  }

  private draw(flash: boolean) {
    const { W, H } = this
    const body = flash ? 0xffffff : 0x4a6a42
    const dark = flash ? 0xffffff : 0x1a1a1a
    const glow = flash ? 0xffffff : 0xc8384a
    const g = this.view
    g.clear()
    g.roundRect(-W * 0.62, -H * 0.3, W * 1.24, H * 0.46, 60).fill(body)
    g.roundRect(-W * 0.5, H * 0.05, 42, H * 0.22, 20).fill(0x3a5434)
    g.roundRect(W * 0.5 - 42, H * 0.05, 42, H * 0.22, 20).fill(0x3a5434)
    g.ellipse(-W * 0.15, 0, 30, 38).fill(dark)
    g.ellipse(W * 0.15, 0, 30, 38).fill(dark)
    g.circle(-W * 0.15, 6, 11).fill(glow)
    g.circle(W * 0.15, 6, 11).fill(glow)
    g.roundRect(-W * 0.1, H * 0.09, W * 0.2, 14, 7).fill(dark)
  }

  flash() {
    if (this.flashLeft > 0) return
    this.flashLeft = 70
    this.draw(true)
    setTimeout(() => {
      this.flashLeft = 0
      if (!this.view.destroyed) this.draw(false)
    }, 70)
  }
}
