import { AnimatedSprite, Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import * as B from '../core/balance'
import hit1Url from '../../assets/visual/fx/hit-impact/impact-1.png'
import hit2Url from '../../assets/visual/fx/hit-impact/impact-2.png'
import hit3Url from '../../assets/visual/fx/hit-impact/impact-3.png'
import hit4Url from '../../assets/visual/fx/hit-impact/impact-4.png'
import slash1Url from '../../assets/visual/fx/slash-warm/slash-1.png'
import slash2Url from '../../assets/visual/fx/slash-warm/slash-2.png'
import slash3Url from '../../assets/visual/fx/slash-warm/slash-3.png'
import slash4Url from '../../assets/visual/fx/slash-warm/slash-4.png'
import armsHeavy1Url from '../../assets/visual/skills/arms-heavy-v5/attack-1.png'
import armsHeavy2Url from '../../assets/visual/skills/arms-heavy-v5/attack-2.png'
import armsHeavy3Url from '../../assets/visual/skills/arms-heavy-v5/attack-3.png'
import armsHeavy4Url from '../../assets/visual/skills/arms-heavy-v5/attack-4.png'
import armsHeavy5Url from '../../assets/visual/skills/arms-heavy-v5/attack-5.png'
import armsHeavy6Url from '../../assets/visual/skills/arms-heavy-v5/attack-6.png'
import armsHeavy7Url from '../../assets/visual/skills/arms-heavy-v5/attack-7.png'
import armsHeavy8Url from '../../assets/visual/skills/arms-heavy-v5/attack-8.png'
import armsHeavy9Url from '../../assets/visual/skills/arms-heavy-v5/attack-9.png'
import armsHeavy10Url from '../../assets/visual/skills/arms-heavy-v5/attack-10.png'
import armsHeavy11Url from '../../assets/visual/skills/arms-heavy-v5/attack-11.png'
import armsHeavy12Url from '../../assets/visual/skills/arms-heavy-v5/attack-12.png'
import armsCharge1Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-1.png'
import armsCharge2Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-2.png'
import armsCharge3Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-3.png'
import armsCharge4Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-4.png'
import armsCharge5Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-5.png'
import armsCharge6Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-6.png'
import armsCharge7Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-7.png'
import armsCharge8Url from '../../assets/visual/skills/arms-charge-fx-v1/charge-8.png'
import vanguardIdle1Url from '../../assets/visual/army/vanguard/idle/idle-1.png'
import vanguardIdle2Url from '../../assets/visual/army/vanguard/idle/idle-2.png'
import vanguardIdle3Url from '../../assets/visual/army/vanguard/idle/idle-3.png'
import vanguardIdle4Url from '../../assets/visual/army/vanguard/idle/idle-4.png'
import vanguardCharge1Url from '../../assets/visual/army/vanguard/charge/charge-1.png'
import vanguardCharge2Url from '../../assets/visual/army/vanguard/charge/charge-2.png'
import vanguardCharge3Url from '../../assets/visual/army/vanguard/charge/charge-3.png'
import vanguardCharge4Url from '../../assets/visual/army/vanguard/charge/charge-4.png'
import vanguardCharge5Url from '../../assets/visual/army/vanguard/charge/charge-5.png'
import vanguardCharge6Url from '../../assets/visual/army/vanguard/charge/charge-6.png'
import shieldGuardIdle1Url from '../../assets/visual/army/shield-guard/idle/idle-1.png'
import shieldGuardIdle2Url from '../../assets/visual/army/shield-guard/idle/idle-2.png'
import shieldGuardIdle3Url from '../../assets/visual/army/shield-guard/idle/idle-3.png'
import shieldGuardIdle4Url from '../../assets/visual/army/shield-guard/idle/idle-4.png'
import shieldGuardBrace1Url from '../../assets/visual/army/shield-guard/brace/brace-1.png'
import shieldGuardBrace2Url from '../../assets/visual/army/shield-guard/brace/brace-2.png'
import shieldGuardBrace3Url from '../../assets/visual/army/shield-guard/brace/brace-3.png'
import shieldGuardBrace4Url from '../../assets/visual/army/shield-guard/brace/brace-4.png'
import shieldGuardBrace5Url from '../../assets/visual/army/shield-guard/brace/brace-5.png'
import shieldGuardBrace6Url from '../../assets/visual/army/shield-guard/brace/brace-6.png'
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
import type { ArmyUnitType, BossKind, JobId, LegendId, MercId, SkillId } from '../core/types'

const cc0SpellModules = import.meta.glob('../../assets/visual/vfx/cc0-spells/**/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function cc0SpellSequence(folder: string): string[] {
  const frameNumber = (path: string) => Number(path.match(/_(\d+)\.png$/)?.[1] ?? 0)
  return Object.entries(cc0SpellModules)
    .filter(([path]) => path.includes(`/cc0-spells/${folder}/`))
    .sort(([a], [b]) => frameNumber(a) - frameNumber(b))
    .map(([, url]) => url)
}

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
  jobId: JobId
  /** 帝國鐵壁 2 件的軍陣生效中(腳下多一圈) */
  formation: boolean

  // ── 以下是給「技能與傳說要有身分」用的(視覺缺口清單 § 一、§ 二)──
  /** 生效中的 buff 是哪一招 → 每招畫自己的持續期間效果 */
  buffSkill: SkillId | null
  /** 仍在生效的體能反擊技能；不受後續其他系 buff 覆蓋。 */
  bodyBuffSkill: SkillId | null
  /** 不退之壁:軍陣常駐(不倒數) */
  buffPermanent: boolean
  /** buff 剩餘秒數(常駐時為 Infinity) */
  buffLeft: number
  /** 舊版印記層數與上限，保留給既有技能演出。 */
  sigils: number
  sigilMax: number
  /** 軍勢進度與已部署士兵。 */
  armyMomentum: number
  armyUnits: number
  armyFormation: ArmyUnitType[]
  /** 連斬層數 → 腳下環狀刻度 */
  combo: number
  trackArms: number
  trackBody: number
  trackAgility: number
  trackMagic: number
  trackFaith: number
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
  /** 戰術指揮官 2 件:共用三段施放順序提示 */
  commanderTracking: boolean
  /** 印記滿層後的完美引爆窗口 */
  perfectWindowLeft: number

  // ── v1.5 行為原型(演出:分身 / 軍旗 / 砲台 / 燃燒 / 凍結)──
  /** 出戰傭兵(null = 沒帶)。老獵犬沿用現有 dog sprite */
  activeMerc: MercId | null
  /** 雙生影刃:分身出場中(疾風連刺視窗 + 傳說) */
  cloneActive: boolean
  // ── 殘影(命運種子「殘留之影」)。⚠️ 與 cloneActive 是兩個不同的東西 ──
  /** 殘影正在場上 */
  afterimageActive: boolean
  /** 殘影還要重演幾次普攻 */
  afterimageLeft: number
  /** 同步步伐改造:殘影變成破綻產生器,外觀要看得出不同 */
  afterimageSync: boolean
  /** 殘影留下的背刺窗口 */
  backstabReady: boolean
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
  /** 地帶底圖色調(乘算)。同一張場景圖靠色溫變成不同區域,成本是零張新圖 */
  zoneTint: number
  /** 地帶霧氣濃度 0~1(越深越濃) */
  zoneFog: number
  /** 本層的兩種敵種(名字/色/體型)。同兩張素材衍生,不新增逐幀資產 */
  species: Array<{ name: string; sprite: 'goblin' | 'imp'; tint: number; scale: number }>
  /** 圖騰血量比例(>0 畫圖騰實體) */
  totemRatio: number
}

const HERO_FRAME_MS = 180
const MOB_FRAME_MS = 200
const BOSS_FRAME_MS = 180
const EVENT_FRAME_MS = 180
const SLASH_FRAME_MS = 70
const HIT_FRAME_MS = 65
const SKILL_FRAME_MS = 120
// 蓄力較慢、斬擊加速，命中幀刻意多停一拍。
const ARMS_HEAVY_FRAME_MS = [115, 90, 58, 48, 52, 58, 105, 82, 72, 80, 96, 125]

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
  armsHeavy: Texture[]
  armsCharge: Texture[]
  vanguardIdle: Texture[]
  vanguardCharge: Texture[]
  shieldGuardIdle: Texture[]
  shieldGuardBrace: Texture[]
  spellSword: Texture[]
  spellFireball: Texture[]
  spellColumn: Texture[]
  spellEnergy: Texture[]
  spellDark: Texture[]
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
  armsHeavy: [
    armsHeavy1Url, armsHeavy2Url, armsHeavy3Url, armsHeavy4Url, armsHeavy5Url, armsHeavy6Url,
    armsHeavy7Url, armsHeavy8Url, armsHeavy9Url, armsHeavy10Url, armsHeavy11Url, armsHeavy12Url,
  ],
  armsCharge: [armsCharge1Url, armsCharge2Url, armsCharge3Url, armsCharge4Url, armsCharge5Url, armsCharge6Url, armsCharge7Url, armsCharge8Url],
  vanguardIdle: [vanguardIdle1Url, vanguardIdle2Url, vanguardIdle3Url, vanguardIdle4Url],
  vanguardCharge: [vanguardCharge1Url, vanguardCharge2Url, vanguardCharge3Url, vanguardCharge4Url, vanguardCharge5Url, vanguardCharge6Url],
  shieldGuardIdle: [shieldGuardIdle1Url, shieldGuardIdle2Url, shieldGuardIdle3Url, shieldGuardIdle4Url],
  shieldGuardBrace: [shieldGuardBrace1Url, shieldGuardBrace2Url, shieldGuardBrace3Url, shieldGuardBrace4Url, shieldGuardBrace5Url, shieldGuardBrace6Url],
  spellSword: cc0SpellSequence('sword-fire'),
  spellFireball: cc0SpellSequence('fireball'),
  spellColumn: cc0SpellSequence('light-column'),
  spellEnergy: cc0SpellSequence('energy-ball'),
  spellDark: cc0SpellSequence('dark-burst'),
}

/**
 * 標題畫面期間就先把整組戰場貼圖抓下來(86 張、約 5.4MB)。
 *
 * ⚠️ 不先抓的話,玩家按下「開始」看到的是**空戰場**:BattleScene.create 是串行的
 * 「等貼圖 → 等 PIXI init → 才 appendChild canvas」,這段期間 HUD 數字都在、戰場什麼都沒有。
 * 抓完的貼圖進 PIXI 的 Assets 快取,create 內再呼叫一次 loadVisualAssets 就是直接命中。
 */
export const BATTLE_TEXTURE_URLS: string[] = [
  forestUrl,
  ...Object.values(textureGroups.heroes).flat(),
  ...textureGroups.goblin,
  ...textureGroups.imp,
  ...textureGroups.boss,
  ...textureGroups.chest,
  ...textureGroups.goldenGoblin,
  ...Object.values(textureGroups.mercenaries).flat(),
  ...textureGroups.turret,
  ...textureGroups.slash,
  ...textureGroups.hit,
  ...textureGroups.armsHeavy,
  ...textureGroups.armsCharge,
  ...textureGroups.vanguardIdle,
  ...textureGroups.vanguardCharge,
  ...textureGroups.shieldGuardIdle,
  ...textureGroups.shieldGuardBrace,
  ...textureGroups.spellSword,
  ...textureGroups.spellFireball,
  ...textureGroups.spellColumn,
  ...textureGroups.spellEnergy,
  ...textureGroups.spellDark,
]

export function warmBattleTextures(onProgress?: (ratio: number) => void): Promise<unknown> {
  return Assets.load(BATTLE_TEXTURE_URLS, onProgress)
}

async function loadTextures(urls: string[]): Promise<Texture[]> {
  const textures = await Promise.all(urls.map((url) => Assets.load<Texture>(url)))
  textures.forEach((texture) => {
    texture.source.scaleMode = 'nearest'
  })
  return textures
}

async function loadVisualAssets(): Promise<VisualAssets> {
  const [background, heroEntries, goblin, imp, boss, chest, goldenGoblin, mercEntries, turret, slash, hit, armsHeavy, armsCharge, vanguardIdle, vanguardCharge, shieldGuardIdle, shieldGuardBrace, spellSword, spellFireball, spellColumn, spellEnergy, spellDark] = await Promise.all([
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
    loadTextures(textureGroups.armsHeavy),
    loadTextures(textureGroups.armsCharge),
    loadTextures(textureGroups.vanguardIdle),
    loadTextures(textureGroups.vanguardCharge),
    loadTextures(textureGroups.shieldGuardIdle),
    loadTextures(textureGroups.shieldGuardBrace),
    loadTextures(textureGroups.spellSword),
    loadTextures(textureGroups.spellFireball),
    loadTextures(textureGroups.spellColumn),
    loadTextures(textureGroups.spellEnergy),
    loadTextures(textureGroups.spellDark),
  ])
  background.source.scaleMode = 'nearest'
  armsHeavy.forEach((texture) => { texture.source.scaleMode = 'linear' })
  armsCharge.forEach((texture) => { texture.source.scaleMode = 'linear' })
  ;[vanguardIdle, vanguardCharge, shieldGuardIdle, shieldGuardBrace].flat().forEach((texture) => { texture.source.scaleMode = 'linear' })
  ;[spellSword, spellFireball, spellColumn, spellEnergy, spellDark]
    .flat()
    .forEach((texture) => { texture.source.scaleMode = 'linear' })
  const heroes = Object.fromEntries(heroEntries) as Record<JobId, Texture[]>
  const mercenaries = Object.fromEntries(mercEntries) as Record<MercId, Texture[]>
  return {
    background, heroes, goblin, imp, boss, chest, goldenGoblin, mercenaries, turret, slash, hit,
    armsHeavy, armsCharge, vanguardIdle, vanguardCharge, shieldGuardIdle, shieldGuardBrace,
    spellSword, spellFireball, spellColumn, spellEnergy, spellDark,
  }
}

export class BattleScene {
  private app = new Application()
  private world = new Container()
  private bg: Sprite
  /** 地帶霧層:疊在底圖上的同色薄霧,越深的地帶越濃 */
  private zoneFog: Graphics
  /** 目前實際套用的地帶色/霧(往目標值補間,切地帶時不瞬變) */
  private zoneCur = { r: 1, g: 1, b: 1, fog: 0 }
  private mobLayer = new Container()
  private fieldLayer = new Container()
  private armyLayer = new Container()
  private impactLayer = new Container()
  private dmgLayer = new Container()
  private overlayLayer = new Container()
  private hero = new Container()
  private formationFx = new Graphics()
  private heroStateFx = new Graphics()
  private fieldFx = new Graphics()
  private enemyStateFx = new Graphics()
  private overlayFx = new Graphics()
  private formationLabel = new Text({
    text: '',
    style: {
      fontFamily: 'Arial Black, PingFang TC, sans-serif',
      fontSize: 12,
      fontWeight: '900',
      fill: 0xffdf83,
      stroke: { color: 0x24180c, width: 3 },
    },
  })
  private heroBody = new Container()
  private heroSprite: AnimatedSprite
  private afterimages: AnimatedSprite[] = []
  private cloneSprite: AnimatedSprite
  private heroJob: JobId = 'rookie'
  private slashFx: AnimatedSprite
  private mercSprite: AnimatedSprite
  private armySprites: AnimatedSprite[] = []
  private armySpriteTypes: ArmyUnitType[] = Array(B.ARMY_UNIT_MAX).fill('vanguard')
  private armyEntranceMs = [0, 0, 0, 0, 0]
  private mercId: MercId | null = null
  private turretSprite: AnimatedSprite
  private timedFx: TimedFx[] = []

  private mobs: MobView[] = []
  private boss: BossView | null = null
  private eventView: EventView | null = null
  private shake = 0
  /** 主角受擊紅閃剩餘秒數 */
  private heroHurtLeft = 0
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
  private leaves: Array<Graphics & {
    _t: number
    _lifeMs: number
    _startX: number
    _startY: number
    _drift: number
    _spin: number
    _depth: number
    _phase: number
  }> = []
  private leafTimer = 0
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
  private afterimageVisualActive = false
  private afterimageSpawnLeft = 0
  private afterimageExitLeft = 0
  private afterimageReplayLeft = 0

  private constructor(
    private getSnap: () => BattleSnapshot,
    private assets: VisualAssets,
  ) {
    this.bg = new Sprite(assets.background)
    this.zoneFog = new Graphics()
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
      this.zoneFog,
      this.groundLayer,
      this.fieldLayer,
      this.mobLayer,
      this.enemyStateFx,
      this.impactLayer,
      this.armyLayer,
      this.hero,
      this.mercSprite,
      this.dmgLayer,
      this.overlayLayer,
    )
    this.fieldLayer.addChild(this.fieldFx, this.turretSprite)
    for (let i = 0; i < B.ARMY_UNIT_MAX; i++) {
      const unit = new AnimatedSprite(this.assets.vanguardIdle)
      unit.anchor.set(0.5, 228 / 256)
      unit.animationSpeed = frameSpeed(HERO_FRAME_MS)
      unit.visible = false
      unit.play()
      this.armySprites.push(unit)
      this.armyLayer.addChild(unit)
    }
    this.overlayLayer.addChild(this.overlayFx)
    this.formationLabel.anchor.set(0.5)
    this.formationLabel.position.set(0, 27)
    this.hero.addChild(this.formationFx, this.heroStateFx, this.formationLabel)

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
    this.leaves = []
    this.timedFx = []
    this.app.destroy(true, { children: true })
  }

  // ---------- 對外演出介面 ----------

  /**
   * 技能命中:比普通攻擊更重的演出(震屏 + 大字)。
   * ⚠️ 目前三招共用同一組演出 —— 技能身分要靠 `skillId` 分流(視覺缺口清單 § 一)。
   * `resourceSpent` 是這一發吃掉的印記或士兵數量。
   */
  skillHit(text: string, skillId?: SkillId, resourceSpent = 0) {
    if (this.destroyed) return
    const target = this.targetPoint()
    const sigilSkills: SkillId[] = ['rally', 'windMark', 'edict']
    if (skillId && sigilSkills.includes(skillId)) this.spawnSigilRays(Math.min(10, resourceSpent), target)

    if (skillId === 'armsHeavy') {
      this.spawnSkillAnimation(this.assets.armsHeavy, target)
      this.shake = 14
      this.zoom = 1.8
    } else if (skillId === 'armsCharge') {
      this.spawnChargeAnimation(target)
      this.shake = 10
      this.zoom = 1.5
    } else if (skillId === 'armsCommand') {
      this.spawnArmyCommand(target, Math.max(1, resourceSpent))
      this.spawnCommandCuts(target, Math.max(1, resourceSpent), 0xff6b45)
      this.shake = 13
      this.zoom = 1.7
    } else if (skillId === 'armsLegend') {
      this.spawnHeroAura(0xd94a32, 4)
      this.shake = 12
      this.zoom = 1.8
    } else if (skillId === 'bodyGuard') {
      this.spawnHeroWard(1, 0x82c8ff)
      this.spawnDefenseFormation(1, 0x82c8ff)
      this.playShieldGuardFormation(B.ARMY_UNIT_MAX)
      this.shake = 4
      this.zoom = 0.8
    } else if (skillId === 'bodyIronwall') {
      this.spawnHeroWard(2, 0x6fa9db)
      this.spawnDefenseFormation(2, 0x6fa9db)
      this.playShieldGuardFormation(B.ARMY_UNIT_MAX)
      this.shake = 7
      this.zoom = 1
    } else if (skillId === 'bodyCommand') {
      this.spawnHeroWard(3, 0x9edcff)
      this.spawnDefenseFormation(3, 0x9edcff)
      this.playShieldGuardFormation(B.ARMY_UNIT_MAX)
      this.shake = 9
      this.zoom = 1.2
    } else if (skillId === 'bodyLegend') {
      this.spawnHeroWard(4, 0xd8efff)
      this.spawnDefenseFormation(4, 0xd8efff)
      this.playShieldGuardFormation(B.ARMY_UNIT_MAX)
      this.shake = 13
      this.zoom = 1.6
    } else if (skillId === 'agilityRoll') {
      this.spawnHeroDash(2, 0x84e4a7)
      this.shake = 4
      this.zoom = 0.8
    } else if (skillId === 'agilityHaste') {
      this.spawnHeroDash(3, 0x56d989)
      this.spawnHeroAura(0x67df98, 1)
      this.shake = 5
      this.zoom = 1
    } else if (skillId === 'agilityCommand') {
      this.spawnCommandCuts(target, 8, 0x7cf0bc)
      this.spawnGaleCuts(target)
      this.shake = 9
      this.zoom = 1.3
    } else if (skillId === 'agilityLegend') {
      this.spawnHeroDash(5, 0x4fe58a)
      this.spawnCommandCuts(target, 12, 0xb3ffd3)
      this.shake = 11
      this.zoom = 1.5
    } else if (skillId === 'magicFireball') {
      this.spawnMagicProjectile(this.assets.spellFireball, target, 0xff8a35)
      this.shake = 8
      this.zoom = 1.2
    } else if (skillId === 'magicBurst') {
      this.spawnTextureBurst(this.assets.spellEnergy, target, 820, 1.65, 0xc676ff)
      this.spawnElementBursts(target, 3)
      this.shake = 11
      this.zoom = 1.6
    } else if (skillId === 'magicCommand') {
      this.spawnElementBursts(target, 5)
      this.spawnTextureBurst(this.assets.spellColumn, target, 920, 1.05, 0xb996ff)
      this.shake = 13
      this.zoom = 1.8
    } else if (skillId === 'magicLegend') {
      this.spawnTextureBurst(this.assets.spellDark, target, 1100, 2.7, 0xc56cff)
      this.spawnTextureBurst(this.assets.spellColumn, target, 1050, 1.35, 0xe6c8ff, 130)
      this.shake = 17
      this.zoom = 2.2
    } else if (skillId === 'faithHeal') {
      this.spawnTextureBurst(this.assets.spellColumn, this.heroPoint(), 760, 0.72, 0xffdf74)
      this.spawnHeroBurst(0xffe28a)
      this.shake = 4
      this.zoom = 0.8
    } else if (skillId === 'faithBlessing') {
      this.spawnSanctuary(1)
      this.spawnHeroAura(0xffd86e, 2)
      this.shake = 5
      this.zoom = 1
    } else if (skillId === 'faithCommand') {
      this.spawnSanctuary(2)
      this.spawnJudgement(target)
      this.shake = 11
      this.zoom = 1.6
    } else if (skillId === 'faithLegend') {
      this.spawnSanctuary(4)
      this.spawnTextureBurst(this.assets.spellColumn, this.heroPoint(), 1100, 1.1, 0xffe490)
      this.shake = 13
      this.zoom = 1.8
    } else if (skillId === 'shieldRush' || skillId === 'bulwark') {
      this.spawnShieldWave(target)
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

    if (skillId) this.spawnFusionAccents(skillId, target)

    if (this.getSnap().legends.includes('lostbanner')) this.spawnBannerColumn(target)
    if (skillId === 'edict' && this.getSnap().legends.includes('codexpage')) {
      this.spawnReturningSigils(Math.min(4, Math.ceil(resourceSpent / 3)))
    }
    if (text) {
      const damageY = this.boss ? target.y + 12 : target.y - 45
      this.damageNum(
        target.x,
        damageY,
        text,
        true,
        skillId === 'judgement' || skillId === 'edict',
      )
    }
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
    else if (mercId === 'icemage') this.spawnIceSeal(target)
    else if (mercId === 'sapper') this.spawnSapperDeploy()
    else if (mercId === 'pyro') this.spawnPyroIgnite(target)
    else this.spawnHoundFetch(target)
    this.notice(names[mercId])
  }

  /**
   * 冷卻被推進(追風者之靴的暴擊、倒轉沙漏的順序)。
   * ⚠️ 目前只有一行提示 —— 應該做成技能格冷卻條跳一格 + 腳下風紋(清單 F9 / F10)。
   */
  onCooldownAdvance(skillId: SkillId, seconds: number, via?: string) {
    if (this.destroyed) return
    if (via === 'hourglass') this.spawnHourglass(skillId)
    else this.spawnWindGlyph()
    const source = via === 'hourglass' ? '倒轉沙漏' : via === 'windboots' ? '追風者之靴' : '技能回轉'
    this.notice(`${source}・冷卻 −${seconds.toFixed(1)}s`)
  }

  onSigilGain(count: number, via?: string) {
    if (this.destroyed) return
    const source: Record<string, string> = {
      window: '視窗擊殺',
      chance: '不退之壁',
      combo: '連斬',
      hunter: '尋寶獵人',
      edict: '法令',
      rogue: '盜賊背刺',
      battle: '戰鬥累積',
    }
    this.spawnHeroBurst(0x86e8ff)
    this.notice(`${source[via ?? ''] ?? '印記'}・印記 +${count}`)
  }

  onResonanceGain(count: number) {
    if (this.destroyed) return
    this.spawnHeroBurst(0xb995ff)
    this.notice(`命運共鳴 +${count}`)
  }

  onShellGain(count: number, source?: string) {
    if (this.destroyed) return
    const target = this.targetPoint()
    const label = source === 'banner' ? '軍旗' : source === 'burn' ? '燃燒' : source === 'skill' ? '技能' : '命中'
    this.damageNum(target.x + 54, target.y + 18, `${label}・破盾 +${count}`, false)
  }

  onEmberConvert(damage: string) {
    if (this.destroyed) return
    this.notice(`裁決餘燼・${damage} 轉為燃燒`)
  }

  onRelicPrimed() {
    if (this.destroyed) return
    this.spawnHeroBurst(0xffcf45)
    this.notice('貪婪之眼・下場 Boss 帶弱點')
  }

  onFreezeStart() {
    if (this.destroyed) return
    this.spawnIceBurst(this.targetPoint())
  }

  onFreezeBurst(text: string) {
    if (this.destroyed) return
    const target = this.targetPoint()
    for (const child of this.dmgLayer.children) {
      const number = child as FloatText
      if (!number._frozen) continue
      number._frozen = false
      number._life = 1
      number._vy = -3.8 - Math.random() * 1.8
    }
    this.spawnIceBurst(target, true)
    this.damageNum(target.x, target.y - 50, text, true, true)
    this.shake = 13
  }

  onBurnTick(text: string) {
    if (this.destroyed || this.hitNumCooldown > 0) return
    const target = this.targetPoint()
    this.damageNum(target.x + 34, target.y - 35, text, false, false, 1, this.getSnap().freezeLeft > 0)
    this.hitNumCooldown = 160
  }

  onBurnMax() {
    if (this.destroyed) return
    const target = this.targetPoint()
    const fx = new Container() as TimedFx
    const ring = new Graphics()
    ring.circle(0, 0, 42).fill({ color: 0xff5a27, alpha: 0.28 })
    ring.circle(0, 0, 38).stroke({ width: 12, color: 0xffb33b, alpha: 0.9 })
    ring.circle(0, 0, 22).stroke({ width: 5, color: 0xfff0a0, alpha: 0.9 })
    fx.addChild(ring)
    fx.position.set(target.x, target.y + 12)
    this.addTimedFx(fx, 520, (node, p) => {
      node.scale.set(0.35 + p * 3.2)
      node.alpha = 1 - p
    })
    this.shake = 15
    this.zoom = 2
    this.damageNum(target.x, target.y - 55, '燃燒滿層・爆燃！', true)
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

  onAfterimageSpawn() {
    if (this.destroyed) return
    this.afterimageVisualActive = true
    this.afterimageSpawnLeft = 420
    this.afterimageExitLeft = 0
    this.spawnHeroBurst(0x77d9ff)
  }

  /** 每次命中只回收一顆小光點，不跳文字，讓累積原因可見但不吵。 */
  onArmyGain() {
    if (this.destroyed) return
    const from = this.targetPoint()
    const to = { x: this.W / 2, y: this.H * 0.82 }
    const fx = new Container() as TimedFx
    const spark = new Graphics()
    spark.circle(0, 0, 3).fill({ color: 0xffd16a, alpha: 0.95 })
    spark.circle(0, 0, 7).fill({ color: 0xf5a83d, alpha: 0.16 })
    fx.addChild(spark)
    this.addTimedFx(fx, 380, (node, p) => {
      const q = 1 - (1 - p) ** 3
      node.position.set(from.x + (to.x - from.x) * q, from.y + (to.y - from.y) * q)
      node.alpha = 1 - p * 0.35
    }, this.impactLayer)
  }

  onArmySummon(total: number) {
    if (this.destroyed || total <= 0) return
    const index = Math.min(B.ARMY_UNIT_MAX - 1, total - 1)
    this.armyEntranceMs[index] = 520
    const pos = this.armySlot(index)
    this.spawnDeployPulse(pos.x, pos.y - 12, 0xe8b754)
  }

  onArmyAssist(count: number, damageText: string) {
    if (this.destroyed || count <= 0) return
    const snap = this.getSnap()
    for (let i = 0; i < Math.min(count, this.armySprites.length); i++) {
      this.playArmyAction(this.armySprites[i], i, snap.armyFormation[i] ?? 'vanguard')
    }
    const target = this.targetPoint()
    this.spawnImpact(target.x, target.y, 0.52 + Math.min(0.32, count * 0.05))
    if (damageText) this.damageNum(target.x, target.y - 42, damageText, false)
  }

  /** 反擊只播放已部署盾衛兵，英雄本人的盾波則永遠存在。 */
  onRetaliate(guards: number, damageText: string, skillId: SkillId) {
    if (this.destroyed) return
    this.playShieldGuardFormation(Math.max(1, guards))
    const target = this.targetPoint()
    this.spawnRetaliationWave(target, skillId, guards)
    if (damageText) this.damageNum(target.x, target.y - 44, damageText, false)
    this.shake = Math.max(this.shake, 5 + Math.min(5, guards))
    this.zoom = Math.max(this.zoom, 0.8 + guards * 0.12)
  }

  onDestinyDescend() {
    if (this.destroyed) return
    const from = this.targetPoint()
    const to = { x: this.W / 2, y: this.H * 0.72 }
    const fx = new Container() as TimedFx
    const shade = new Graphics()
    const rune = new Graphics()
    shade.rect(0, 0, this.W, this.H).fill({ color: 0x080513, alpha: 0.72 })
    rune.poly([0, -18, 15, -7, 10, 13, -10, 13, -15, -7])
      .stroke({ width: 4, color: 0xd9b8ff, alpha: 0.95 })
    rune.circle(0, 0, 7).fill({ color: 0xffe8a6, alpha: 0.9 })
    fx.addChild(shade, rune)
    rune.position.set(from.x, from.y)
    this.addTimedFx(fx, 720, (_node, p) => {
      const q = 1 - (1 - p) ** 3
      shade.alpha = Math.sin(Math.PI * p) * 0.58
      rune.position.set(from.x + (to.x - from.x) * q, from.y + (to.y - from.y) * q)
      rune.rotation += 0.06
      rune.scale.set(0.7 + Math.sin(Math.PI * p) * 0.8)
      if (p > 0.68) {
        const flash = (p - 0.68) / 0.32
        rune.alpha = 1 - flash
        rune.scale.set(1.35 + flash * 2.5)
      }
    }, this.overlayLayer)
    this.shake = Math.max(this.shake, 6)
    this.zoom = Math.max(this.zoom, 1.2)
  }

  onZoneEnter(name: string, flavor: string) {
    if (this.destroyed) return
    const fx = new Container() as TimedFx
    const panel = new Graphics()
    const title = new Text({
      text: name,
      style: {
        fontFamily: 'Arial Black, PingFang TC, sans-serif',
        fontSize: 25,
        fontWeight: '900',
        fill: 0xffedc0,
        stroke: { color: 0x160d20, width: 5 },
        letterSpacing: 4,
      },
    })
    const desc = new Text({
      text: flavor,
      style: {
        fontFamily: 'PingFang TC, sans-serif',
        fontSize: 12,
        fill: 0xd8d0df,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: Math.min(420, this.W * 0.78),
      },
    })
    panel.roundRect(-Math.min(240, this.W * 0.43), -40, Math.min(480, this.W * 0.86), 88, 12)
      .fill({ color: 0x100b19, alpha: 0.82 })
      .stroke({ width: 1, color: 0xbda66e, alpha: 0.72 })
    title.anchor.set(0.5)
    desc.anchor.set(0.5)
    desc.y = 25
    fx.addChild(panel, title, desc)
    fx.position.set(this.W / 2, this.H * 0.22)
    this.addTimedFx(fx, 2600, (node, p) => {
      const fadeIn = Math.min(1, p * 7)
      const fadeOut = 1 - Math.max(0, (p - 0.76) / 0.24)
      node.alpha = fadeIn * fadeOut
      node.y = this.H * 0.22 + (1 - fadeIn) * 18
    }, this.overlayLayer)
    this.marchBoost = 1
  }

  /**
   * 主角挨了場上威脅一下:震屏 + 主角閃紅。
   * ⚠️ 沒有攻擊幀素材(怪物只有 idle 四張),所以「誰打的」不演,只演「你被打到了」——
   * 血條在掉但畫面毫無反應,玩家會以為是 bug。
   */
  threatHit() {
    if (this.destroyed) return
    this.shake = 6
    this.heroSprite.tint = 0xff6a6a
    this.heroHurtLeft = 0.25
  }

  notice(_text: string) {
    // 戰鬥提示已退場；事件仍保留圖像與音效回饋。
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
    if (source === 'hero' || source === 'click') {
      this.heroSwingDuration =
        snap.buffSkill === 'shieldRush' ? 320 : snap.buffSkill === 'gale' ? 145 : 230
      this.heroSwingLeft = this.heroSwingDuration
      this.heroSwingSide *= -1
      this.slashFx.visible = true
      this.slashFx.alpha = snap.buffSkill === 'gale' ? 0.72 : 1
      this.slashFx.tint = 0xffffff
      this.slashFx.scale.y = snap.buffSkill === 'gale' ? 0.42 : 1
      this.slashFx.animationSpeed =
        snap.buffSkill === 'shieldRush' ? frameSpeed(95) : snap.buffSkill === 'gale' ? frameSpeed(48) : frameSpeed(SLASH_FRAME_MS)
      this.slashFx.gotoAndPlay(0)
      this.shake = Math.min(this.shake + (snap.buffSkill === 'shieldRush' ? 8 : 4), 13)
      this.zoom = snap.buffSkill === 'shieldRush' ? 1.5 : 1
    } else if (source === 'clone') {
      if (this.afterimageVisualActive) this.spawnAfterimageReplay()
      else this.spawnCloneSlash()
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
    const frozen = this.getSnap().freezeLeft > 0
    if (source === 'hero' || source === 'click') {
      if (frozen) this.damageNum(x, y, txt, crit, false, 0.82, true)
      else this.hitNum(x, y, txt, crit)
      return
    }
    const offset = source === 'clone' ? -42 : source === 'zone' ? 42 : 0
    this.damageNum(x + offset, y + 16, txt, false, false, 1, frozen)
  }

  private damageNum(
    x: number,
    y: number,
    txt: string,
    crit: boolean,
    holy = false,
    fontScale = 1,
    frozen = false,
    notice = false,
  ) {
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
    t.position.set(x + (notice ? 0 : (Math.random() - 0.5) * 30), y)
    ;(t as FloatText)._vy = notice ? -0.45 : -2.4
    ;(t as FloatText)._life = 1
    ;(t as FloatText)._lifeMs = notice ? 1800 : 900
    ;(t as FloatText)._frozen = frozen
    ;(t as FloatText)._notice = notice
    ;(t as FloatText)._minY = this.boss && !notice ? Math.max(128, this.H * 0.28) : -Infinity
    if (frozen) {
      t.tint = 0xb9edff
      t.alpha = 0.78
    }
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
    this.tickLeaves(ms, snap.zoneFog)
    this.tickDust(ms, !this.boss && !this.eventView)

    this.mercSprite.y = this.H * 0.895 + Math.sin(this.elapsed * 0.013 + 1) * 1.8

    // 背景微幅浮動:靜止的底圖會讓所有前進感被「背景完全不動」抵銷
    this.bg.y = this.H / 2 + Math.sin(this.elapsed * 0.0016) * 2 + this.marchBoost * this.H * 0.045
    this.applyZone(snap, ms)
    this.drawFormation(snap.formation, snap.bodyBuffSkill ?? snap.buffSkill, snap.buffPermanent)
    this.drawHeroStates(snap)
    this.drawBattleStates(snap)
    this.layoutHero()
    this.layoutArmy(snap, ms)
    this.tickHeroSwing(ms)
    this.tickAfterimage(ms, snap)

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
      if (!t._frozen) {
        t.y = Math.max(t._minY, t.y + t._vy)
        t._vy += 0.06
        t._life -= ms / t._lifeMs
        t.alpha = t._life
      } else {
        t.alpha = 0.7 + Math.sin(this.elapsed * 0.012 + i) * 0.12
      }
      if (t._life <= 0) t.destroy()
    }

    // 主角受擊紅閃退場
    if (this.heroHurtLeft > 0) {
      this.heroHurtLeft -= ms / 1000
      if (this.heroHurtLeft <= 0) this.heroSprite.tint = 0xffffff
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

  /** 地帶環境粒子:淺層是葉片,地底是粉塵,深層是灰燼。 */
  private tickLeaves(ms: number, zoneFog: number) {
    const { W, H } = this
    const quietScene = !!this.boss || !!this.eventView
    this.leafTimer -= ms
    if (this.leafTimer <= 0 && this.leaves.length < 9) {
      this.leafTimer = (quietScene ? 1050 : 680) + Math.random() * 620
      const leaf = new Graphics() as (typeof this.leaves)[number]
      const kind = zoneFog < 0.16 ? 'leaf' : zoneFog < 0.27 ? 'dust' : 'ash'
      const palette = kind === 'leaf'
        ? [0xc58a3d, 0xa96032, 0xd1a454, 0x7f7738]
        : kind === 'dust'
          ? [0xb7aaa0, 0x8d8990, 0xc8bcae, 0x747986]
          : [0x8e7e82, 0xb2a2a0, 0x6f6872, 0xc0aaa4]
      const color = palette[Math.floor(Math.random() * palette.length)]
      if (kind === 'leaf') {
        leaf.poly([-7, 0, -1, -4, 7, -1, 1, 4])
          .fill({ color, alpha: 0.9 })
          .stroke({ width: 1, color: 0xf1c879, alpha: 0.38 })
        leaf.moveTo(-5, 0).lineTo(5, -1).stroke({ width: 1, color: 0x5b3b23, alpha: 0.45 })
      } else if (kind === 'dust') {
        leaf.circle(0, 0, 3 + Math.random() * 4).fill({ color, alpha: 0.72 })
      } else {
        leaf.roundRect(-2, -6, 4, 12, 2).fill({ color, alpha: 0.78 })
      }
      leaf._t = 0
      leaf._lifeMs = (kind === 'ash' ? 5200 : 4300) + Math.random() * 3400
      leaf._startX = W * (0.05 + Math.random() * 0.9)
      leaf._startY = H * (0.06 + Math.random() * 0.42)
      leaf._drift = (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.14)
      leaf._spin = (Math.random() < 0.5 ? -1 : 1) * (2.2 + Math.random() * 4.2)
      leaf._depth = 0.35 + Math.random() * 0.65
      leaf._phase = Math.random() * Math.PI * 2
      leaf.scale.set(0.35 + leaf._depth * 0.55)
      this.leaves.push(leaf)
      this.groundLayer.addChild(leaf)
    }

    for (let i = this.leaves.length - 1; i >= 0; i--) {
      const leaf = this.leaves[i]
      leaf._t += ms / leaf._lifeMs
      if (leaf._t >= 1) {
        leaf.destroy()
        this.leaves.splice(i, 1)
        continue
      }
      const sway = Math.sin(leaf._phase + leaf._t * Math.PI * 5)
      const travel = leaf._t * leaf._t
      leaf.position.set(
        leaf._startX + W * leaf._drift * leaf._t + sway * (8 + leaf._depth * 12),
        leaf._startY + H * (0.2 + leaf._depth * 0.48) * travel,
      )
      leaf.rotation = leaf._phase + leaf._t * leaf._spin
      leaf.skew.x = sway * 0.28
      const envelope = Math.min(1, leaf._t * 7) * Math.min(1, (1 - leaf._t) * 6)
      leaf.alpha = envelope * (0.16 + leaf._depth * 0.22 + zoneFog * 0.18) * (quietScene ? 0.58 : 1)
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
    if (this.boss) return { x: this.boss.view.x, y: Math.max(176, this.H * 0.38) }
    const mob = this.frontMob()
    return mob?.hitPoint() ?? { x: this.W / 2, y: this.H * 0.48 }
  }

  private heroPoint() {
    return { x: this.hero.x, y: this.hero.y - this.H * 0.075 }
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

  private spawnTextureBurst(
    textures: Texture[],
    point: { x: number; y: number },
    duration: number,
    scale: number,
    tint = 0xffffff,
    delay = 0,
  ) {
    const fx = new Container() as TimedFx
    const sprite = new AnimatedSprite(textures)
    sprite.anchor.set(0.5)
    sprite.tint = tint
    sprite.scale.set(scale * Math.min(1.12, this.W / 390))
    sprite.gotoAndStop(0)
    fx.addChild(sprite)
    fx.position.set(point.x, point.y)
    this.addTimedFx(fx, duration + delay, (node) => {
      const local = Math.max(0, Math.min(1, (node._age - delay) / duration))
      sprite.visible = node._age >= delay
      sprite.gotoAndStop(Math.min(textures.length - 1, Math.floor(local * textures.length)))
      node.alpha = local > 0.82 ? (1 - local) / 0.18 : Math.min(1, local * 8)
    })
  }

  private spawnMagicProjectile(textures: Texture[], target: { x: number; y: number }, tint: number) {
    const start = this.heroPoint()
    const fx = new Container() as TimedFx
    const sprite = new AnimatedSprite(textures)
    sprite.anchor.set(0.5)
    sprite.tint = tint
    sprite.scale.set(Math.min(1.05, this.W / 420))
    sprite.gotoAndStop(0)
    fx.addChild(sprite)
    fx.position.set(start.x, start.y)
    fx.rotation = Math.atan2(target.y - start.y, target.x - start.x)
    let impacted = false
    this.addTimedFx(fx, 760, (node, p) => {
      const travel = 1 - (1 - p) ** 3
      node.position.set(start.x + (target.x - start.x) * travel, start.y + (target.y - start.y) * travel)
      node.scale.set(0.72 + p * 0.45)
      sprite.gotoAndStop(Math.min(textures.length - 1, Math.floor(p * textures.length)))
      node.alpha = p > 0.86 ? (1 - p) / 0.14 : 1
      if (!impacted && p >= 0.76) {
        impacted = true
        this.spawnImpact(target.x, target.y, 1.15)
      }
    })
  }

  private spawnHeroWard(level: number, color: number) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < Math.min(4, level + 1); i++) {
      const radius = 48 + i * 13
      g.arc(0, 0, radius, Math.PI * 1.03, Math.PI * 1.97)
        .stroke({ width: Math.max(2, 8 - i * 1.5), color, alpha: 0.82 - i * 0.12 })
    }
    g.poly([-25, -45, 25, -45, 36, -12, 0, 26, -36, -12])
      .fill({ color, alpha: 0.15 + level * 0.035 })
      .stroke({ width: 3, color: 0xffffff, alpha: 0.7 })
    fx.addChild(g)
    const point = this.heroPoint()
    fx.position.set(point.x, point.y + 18)
    this.addTimedFx(fx, 900 + level * 90, (node, p) => {
      const intro = 1 - (1 - Math.min(1, p * 5)) ** 3
      node.scale.set(0.45 + intro * (0.72 + level * 0.08))
      node.alpha = p < 0.7 ? 1 : (1 - p) / 0.3
    }, this.fieldLayer)
  }

  /** 體能四招共用同一套盾陣語彙，再以層級增加陣線寬度與重量。 */
  private spawnDefenseFormation(level: number, color: number) {
    const fx = new Container() as TimedFx
    const ground = new Graphics()
    const wall = new Graphics()
    const segments = 2 + level
    ground.ellipse(0, 28, 58 + level * 24, 16 + level * 3)
      .fill({ color: 0x18334a, alpha: 0.24 })
      .stroke({ width: 2 + level * 0.5, color, alpha: 0.48 })
    for (let i = 0; i < segments; i++) {
      const x = (i - (segments - 1) / 2) * 28
      const y = Math.abs(i - (segments - 1) / 2) * 3
      wall.poly([x - 11, y - 25, x + 11, y - 25, x + 15, y - 5, x, y + 12, x - 15, y - 5])
        .fill({ color: i % 2 === 0 ? 0x294a62 : 0x1b3448, alpha: 0.58 })
        .stroke({ width: 2.2, color: i % 2 === 0 ? 0xf2f7fa : color, alpha: 0.82 })
      wall.moveTo(x, y - 20).lineTo(x, y + 4)
        .stroke({ width: 1.4, color: 0xffffff, alpha: 0.52 })
    }
    if (level >= 3) {
      wall.moveTo(-segments * 16, 18).lineTo(segments * 16, 18)
        .stroke({ width: 6, color, alpha: 0.42 })
      wall.moveTo(-segments * 14, 18).lineTo(segments * 14, 18)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.72 })
    }
    fx.addChild(ground, wall)
    fx.position.set(this.W / 2, this.H * 0.79)
    const duration = 760 + level * 120
    this.addTimedFx(fx, duration, (node, p) => {
      const brace = 1 - (1 - Math.min(1, p / 0.24)) ** 3
      const hold = p < 0.68 ? 1 : (1 - p) / 0.32
      node.scale.set(0.72 + brace * (0.26 + level * 0.035), 1.22 - brace * 0.22)
      node.alpha = Math.max(0, hold) * Math.min(1, p * 8)
      wall.y = (1 - brace) * 22
      ground.scale.x = 0.45 + brace * 0.55
    }, this.fieldLayer)
  }

  private spawnRetaliationWave(target: { x: number; y: number }, skillId: SkillId, guards: number) {
    this.spawnShieldWave(target)
    const tier = skillId === 'bodyLegend' ? 4 : skillId === 'bodyCommand' ? 3 : skillId === 'bodyIronwall' ? 2 : 1
    const lines = Math.max(1, Math.min(5, guards || 1))
    const start = this.heroPoint()
    for (let i = 0; i < lines; i++) {
      const fx = new Container() as TimedFx
      const g = new Graphics()
      const width = 22 + tier * 3
      g.poly([-width, -10, 4, -4, width, 0, 4, 4, -width, 10])
        .fill({ color: i % 2 ? 0x8bc8ed : 0xe9f7ff, alpha: 0.64 })
      g.moveTo(-width + 4, 0).lineTo(width - 2, 0)
        .stroke({ width: 2.5, color: 0xffffff, alpha: 0.92 })
      fx.addChild(g)
      const offset = (i - (lines - 1) / 2) * 12
      fx.position.set(start.x + offset, start.y + 12)
      fx.rotation = Math.atan2(target.y - start.y, target.x - start.x)
      const delay = i * 55
      let impacted = false
      this.addTimedFx(fx, 560 + delay, (node) => {
        const local = Math.max(0, Math.min(1, (node._age - delay) / 560))
        const travel = 1 - (1 - local) ** 3
        node.visible = node._age >= delay
        node.position.set(
          start.x + offset + (target.x - start.x - offset) * travel,
          start.y + 12 + (target.y - start.y - 12) * travel,
        )
        node.scale.set(0.45 + travel * (0.75 + tier * 0.1), 0.7 + travel * 0.3)
        node.alpha = local > 0.8 ? (1 - local) / 0.2 : Math.min(1, local * 7)
        if (!impacted && local >= 0.78) {
          impacted = true
          this.spawnImpact(target.x + offset * 0.35, target.y, 0.55 + tier * 0.12)
        }
      })
    }
  }

  private spawnHeroAura(color: number, intensity: number) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < 8 + intensity * 2; i++) {
      const a = (i / (8 + intensity * 2)) * Math.PI * 2
      g.moveTo(Math.cos(a) * 30, Math.sin(a) * 18)
        .lineTo(Math.cos(a) * (66 + intensity * 9), Math.sin(a) * (42 + intensity * 6))
        .stroke({ width: 2 + (i % 3), color, alpha: 0.5 + (i % 2) * 0.18 })
    }
    g.ellipse(0, 18, 58 + intensity * 8, 18 + intensity * 2)
      .stroke({ width: 4, color: 0xffffff, alpha: 0.65 })
    fx.addChild(g)
    const point = this.heroPoint()
    fx.position.set(point.x, point.y + 14)
    this.addTimedFx(fx, 940, (node, p) => {
      node.scale.set(0.35 + p * 1.25)
      node.rotation = p * 0.32
      node.alpha = Math.sin(p * Math.PI)
    }, this.fieldLayer)
  }

  private spawnHeroDash(copies: number, color: number) {
    const fx = new Container() as TimedFx
    const textures = this.assets.heroes[this.heroJob]
    for (let i = copies; i >= 0; i--) {
      const rider = new AnimatedSprite(textures)
      rider.anchor.set(0.5, 233 / 256)
      rider.animationSpeed = frameSpeed(HERO_FRAME_MS)
      rider.scale.set(this.heroBody.scale.x, this.heroBody.scale.y)
      rider.tint = i === 0 ? 0xffffff : color
      rider.alpha = i === 0 ? 1 : 0.36 - i * 0.035
      rider.position.set((i - copies / 2) * 22, Math.abs(i - copies / 2) * 5)
      rider.play()
      fx.addChild(rider)
    }
    const point = this.heroPoint()
    fx.position.set(point.x, point.y + this.H * 0.075)
    this.addTimedFx(fx, 700, (node, p) => {
      node.x = point.x + Math.sin(p * Math.PI * 2) * (22 + copies * 8)
      node.scale.set(1 + Math.sin(p * Math.PI) * 0.12, 1 - Math.sin(p * Math.PI) * 0.08)
      node.alpha = p > 0.75 ? (1 - p) / 0.25 : 1
    })
  }

  private spawnCommandCuts(target: { x: number; y: number }, count: number, color: number) {
    for (let i = 0; i < count; i++) {
      const fx = new Container() as TimedFx
      const g = new Graphics()
      const length = 54 + (i % 4) * 14
      g.moveTo(-length / 2, 0).lineTo(length / 2, 0)
        .stroke({ width: 5, color, alpha: 0.78 })
      g.moveTo(-length / 3, -3).lineTo(length / 2, -3)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.9 })
      fx.addChild(g)
      fx.position.set(target.x - 34 + (i % 4) * 22, target.y - 52 + (i % 5) * 24)
      fx.rotation = -0.9 + (i % 5) * 0.38
      const delay = i * 42
      this.addTimedFx(fx, 500 + delay, (node) => {
        const local = Math.max(0, Math.min(1, (node._age - delay) / 500))
        node.visible = node._age >= delay
        node.scale.set(0.2 + local * 1.65, 0.65 + local * 0.35)
        node.alpha = Math.sin(local * Math.PI)
      })
    }
  }

  private armySlot(index: number) {
    const slots = [
      { x: -0.21, y: 0.845 },
      { x: 0.21, y: 0.845 },
      { x: -0.36, y: 0.88 },
      { x: 0.36, y: 0.88 },
      { x: 0, y: 0.91 },
    ]
    const slot = slots[index] ?? slots[0]
    return { x: this.W * (0.5 + slot.x), y: this.H * slot.y }
  }

  private layoutArmy(snap: BattleSnapshot, ms: number) {
    const baseScale = Math.min(this.W, this.H * 0.62) / 490
    for (let i = 0; i < this.armySprites.length; i++) {
      const unit = this.armySprites[i]
      const desiredType = snap.armyFormation[i] === 'shieldGuard' ? 'shieldGuard' : 'vanguard'
      if (this.armySpriteTypes[i] !== desiredType) this.setArmyIdle(unit, i, desiredType)
      const active = i < snap.armyUnits
      unit.visible = active
      if (!active) continue
      this.armyEntranceMs[i] = Math.max(0, this.armyEntranceMs[i] - ms)
      const slot = this.armySlot(i)
      const entrance = 1 - this.armyEntranceMs[i] / 520
      const eased = 1 - (1 - Math.max(0, entrance)) ** 3
      const bob = Math.sin(this.elapsed * 0.008 + i * 1.3) * 1.5
      unit.position.set(slot.x, slot.y + (1 - eased) * 34 + bob)
      unit.alpha = Math.min(1, eased * 2.5) * (i < 2 ? 0.94 : 0.86)
      const pop = entrance < 1 ? 1 + Math.sin(Math.min(1, entrance) * Math.PI) * 0.1 : 1
      unit.scale.set(baseScale * pop * (desiredType === 'shieldGuard' ? 0.8 : 0.92))
    }
  }

  private armyIdleTextures(type: ArmyUnitType) {
    return type === 'shieldGuard' ? this.assets.shieldGuardIdle : this.assets.vanguardIdle
  }

  private armyActionTextures(type: ArmyUnitType) {
    return type === 'shieldGuard' ? this.assets.shieldGuardBrace : this.assets.vanguardCharge
  }

  private setArmyIdle(unit: AnimatedSprite, index: number, type: ArmyUnitType) {
    this.armySpriteTypes[index] = type
    unit.textures = this.armyIdleTextures(type)
    unit.loop = true
    unit.animationSpeed = frameSpeed(HERO_FRAME_MS)
    unit.onComplete = undefined
    unit.gotoAndPlay(0)
  }

  private playArmyAction(unit: AnimatedSprite, index: number, type: ArmyUnitType) {
    this.armySpriteTypes[index] = type
    unit.textures = this.armyActionTextures(type)
    unit.loop = false
    unit.animationSpeed = frameSpeed(type === 'shieldGuard' ? 105 : 95)
    unit.onComplete = () => {
      this.setArmyIdle(unit, index, this.armySpriteTypes[index])
    }
    unit.gotoAndPlay(0)
  }

  private playShieldGuardFormation(limit: number) {
    const snap = this.getSnap()
    let played = 0
    for (let i = 0; i < Math.min(snap.armyUnits, this.armySprites.length); i++) {
      if ((snap.armyFormation[i] ?? 'vanguard') !== 'shieldGuard') continue
      this.playArmyAction(this.armySprites[i], i, 'shieldGuard')
      played++
      if (played >= limit) break
    }
  }

  private spawnArmyCommand(target: { x: number; y: number }, count: number) {
    const total = Math.min(B.ARMY_UNIT_MAX, count)
    const scale = Math.min(this.W, this.H * 0.62) / 490
    const snap = this.getSnap()
    for (let i = 0; i < total; i++) {
      const start = this.armySlot(i)
      const delay = i * 90
      const fx = new Container() as TimedFx
      const type = snap.armyFormation[i] === 'shieldGuard' ? 'shieldGuard' : 'vanguard'
      const unit = new AnimatedSprite(this.armyActionTextures(type))
      unit.anchor.set(0.5, 228 / 256)
      unit.animationSpeed = frameSpeed(90)
      unit.scale.set(scale * (type === 'shieldGuard' ? 0.8 : 0.92))
      unit.play()
      fx.addChild(unit)
      fx.position.set(start.x, start.y)
      let impacted = false
      this.addTimedFx(fx, 760 + delay, (node) => {
        const local = Math.max(0, Math.min(1, (node._age - delay) / 760))
        const travel = local * local * (3 - 2 * local)
        node.visible = node._age >= delay
        node.position.set(
          start.x + (target.x - start.x) * travel,
          start.y + (target.y + 20 - start.y) * travel,
        )
        node.alpha = local > 0.82 ? (1 - local) / 0.18 : Math.min(1, local * 8)
        node.scale.set(1 + Math.sin(local * Math.PI) * 0.12)
        if (!impacted && local >= 0.76) {
          impacted = true
          this.spawnImpact(target.x + (i - (total - 1) / 2) * 9, target.y + 12, 0.72)
        }
      }, this.impactLayer)
    }
  }

  private spawnElementBursts(target: { x: number; y: number }, count: number) {
    const colors = [0xff774a, 0x7bdcff, 0xc57cff, 0xf6d86b, 0x76e3a2]
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      this.spawnTextureBurst(
        this.assets.spellEnergy,
        { x: target.x + Math.cos(angle) * 48, y: target.y + Math.sin(angle) * 36 },
        650,
        0.75 + (i % 2) * 0.18,
        colors[i % colors.length],
        i * 70,
      )
    }
  }

  private spawnSanctuary(level: number) {
    const fx = new Container() as TimedFx
    const g = new Graphics()
    for (let i = 0; i < 2 + level; i++) {
      g.ellipse(0, 16, 42 + i * 17, 14 + i * 5)
        .stroke({ width: Math.max(2, 6 - i * 0.7), color: i % 2 ? 0xffffff : 0xffd867, alpha: 0.82 - i * 0.09 })
    }
    g.moveTo(0, -62 - level * 8).lineTo(0, 42)
      .stroke({ width: 7 + level * 2, color: 0xffefae, alpha: 0.5 })
    g.moveTo(-20, -18).lineTo(20, -18)
      .stroke({ width: 5, color: 0xffffff, alpha: 0.82 })
    fx.addChild(g)
    const point = this.heroPoint()
    fx.position.set(point.x, point.y + 22)
    this.addTimedFx(fx, 980 + level * 100, (node, p) => {
      const intro = Math.min(1, p * 5)
      node.scale.set(0.35 + intro * (0.72 + level * 0.08))
      node.alpha = p < 0.72 ? 1 : (1 - p) / 0.28
      node.rotation = Math.sin(p * Math.PI * 2) * 0.035
    }, this.fieldLayer)
  }

  private fusionVisualStage(a: number, b: number) {
    const level = Math.min(a, b)
    return level >= 200 ? 3 : level >= 100 ? 2 : level >= 50 ? 1 : 0
  }

  private spawnFusionAccents(skillId: SkillId, target: { x: number; y: number }) {
    const snap = this.getSnap()
    const armsBody = this.fusionVisualStage(snap.trackArms, snap.trackBody)
    const armsAgility = this.fusionVisualStage(snap.trackArms, snap.trackAgility)
    const armsMagic = this.fusionVisualStage(snap.trackArms, snap.trackMagic)
    const armsFaith = this.fusionVisualStage(snap.trackArms, snap.trackFaith)
    const bodyAgility = this.fusionVisualStage(snap.trackBody, snap.trackAgility)
    const bodyMagic = this.fusionVisualStage(snap.trackBody, snap.trackMagic)
    const bodyFaith = this.fusionVisualStage(snap.trackBody, snap.trackFaith)
    const agilityMagic = this.fusionVisualStage(snap.trackAgility, snap.trackMagic)
    const agilityFaith = this.fusionVisualStage(snap.trackAgility, snap.trackFaith)
    const magicFaith = this.fusionVisualStage(snap.trackMagic, snap.trackFaith)

    if (skillId === 'armsHeavy') {
      if (armsAgility) this.spawnCommandCuts(target, armsAgility, 0x8ef0bf)
      if (armsMagic) this.spawnTextureBurst(this.assets.spellEnergy, target, 520, 0.55 + armsMagic * 0.12, 0xba7cff)
      if (armsFaith) this.spawnHeroBurst(0xffdc78)
    }
    if (skillId === 'armsLegend' && armsBody) this.spawnHeroWard(armsBody, 0x9bd7ff)
    if (skillId === 'bodyGuard' && bodyMagic)
      this.spawnTextureBurst(this.assets.spellEnergy, target, 560, 0.5 + bodyMagic * 0.12, 0x82d5ff)
    if (skillId === 'agilityRoll') {
      if (bodyAgility) this.spawnHeroWard(bodyAgility, 0x91d4ff)
      if (agilityFaith) this.spawnHeroBurst(0xffdf7d)
    }
    if (skillId === 'magicBurst' && agilityMagic)
      this.spawnCommandCuts(target, agilityMagic * 2, 0x95f5d0)
    if (skillId.startsWith('magic') && magicFaith) this.spawnHeroBurst(0xffe38c)
    if (skillId.startsWith('faith') && bodyFaith) this.spawnHeroWard(bodyFaith, 0xffe5a0)
  }

  private spawnShieldWave(target: { x: number; y: number }) {
    const brace = new Container() as TimedFx
    const braceRing = new Graphics()
    braceRing.ellipse(0, 0, 92, 31).stroke({ width: 7, color: 0x9ca8af, alpha: 0.62 })
    braceRing.ellipse(0, 0, 66, 22).stroke({ width: 2, color: 0xe7edf0, alpha: 0.82 })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      braceRing.poly([
        Math.cos(a) * 68,
        Math.sin(a) * 23,
        Math.cos(a - 0.12) * 82,
        Math.sin(a - 0.12) * 28,
        Math.cos(a + 0.12) * 82,
        Math.sin(a + 0.12) * 28,
      ]).fill({ color: 0xcbd3d7, alpha: 0.48 })
    }
    brace.addChild(braceRing)
    brace.position.set(this.W / 2, this.H * 0.85)
    this.addTimedFx(brace, 360, (node, p) => {
      const windup = Math.min(1, p / 0.48)
      node.scale.set(1.35 - windup * 0.6)
      node.alpha = p < 0.5 ? 0.35 + windup * 0.65 : (1 - p) / 0.5
      node.rotation = p * 0.18
    }, this.fieldLayer)

    const fx = new Container() as TimedFx
    const g = new Graphics()
    g.arc(0, 0, 64, -2.55, -0.58).stroke({ width: 18, color: 0x78868f, alpha: 0.34 })
    g.arc(0, 0, 58, -2.55, -0.58).stroke({ width: 11, color: 0xd6dde0, alpha: 0.72 })
    g.arc(0, 0, 48, -2.55, -0.58).stroke({ width: 3, color: 0xffffff, alpha: 0.92 })
    g.poly([-20, -43, 20, -43, 28, -13, 0, 15, -28, -13])
      .fill({ color: 0xaeb9bf, alpha: 0.26 })
      .stroke({ width: 3, color: 0xf2f6f7, alpha: 0.7 })
    fx.addChild(g)
    fx.position.set(this.W / 2, this.H * 0.75)
    fx.rotation = Math.PI / 2
    const start = { x: this.W / 2, y: this.H * 0.75 }
    this.addTimedFx(fx, 430, (node, p) => {
      const travel = 1 - (1 - p) ** 3
      node.position.set(
        start.x + (target.x - start.x) * travel,
        start.y + (target.y - start.y) * travel,
      )
      node.scale.set(0.5 + travel * 1.55, 0.7 + travel * 0.55)
      node.alpha = p < 0.72 ? 1 : (1 - p) / 0.28
    })

    const shock = new Container() as TimedFx
    const shockRing = new Graphics()
    for (let i = 0; i < 3; i++) {
      shockRing.arc(0, 0, 34 + i * 13, -2.9, -0.25)
        .stroke({ width: 7 - i * 1.5, color: i === 0 ? 0xffffff : 0xaebac0, alpha: 0.78 - i * 0.16 })
    }
    shock.addChild(shockRing)
    shock.position.set(target.x, target.y + 16)
    this.addTimedFx(shock, 520, (node, p) => {
      const delayed = Math.max(0, (p - 0.38) / 0.62)
      node.scale.set(0.3 + delayed * 2.1)
      node.alpha = delayed > 0 ? 1 - delayed : 0
    })
  }

  private spawnGaleCuts(target: { x: number; y: number }) {
    const wind = new Container() as TimedFx
    const windRing = new Graphics()
    for (let i = 0; i < 4; i++) {
      windRing.arc(0, 0, 34 + i * 10, -2.75 + i * 0.12, 0.25 + i * 0.16)
        .stroke({ width: 4 - i * 0.55, color: 0x9beeff, alpha: 0.72 - i * 0.12 })
    }
    wind.addChild(windRing)
    wind.position.set(target.x, target.y + 8)
    this.addTimedFx(wind, 620, (node, p) => {
      node.rotation = -0.35 + p * 1.2
      node.scale.set(0.45 + p * 1.65)
      node.alpha = Math.sin(p * Math.PI)
    })

    for (let i = 0; i < 7; i++) {
      const fx = new Container() as TimedFx
      const g = new Graphics()
      const length = 68 + (i % 3) * 22
      g.poly([-length / 2, 0, length / 2, -5, length / 2 - 14, 4, -length / 2, 2])
        .fill({ color: i % 2 ? 0x75dff3 : 0xd8fbff, alpha: 0.58 })
      g.moveTo(-length / 2 + 8, 0).lineTo(length / 2 - 8, -2)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.94 })
      fx.addChild(g)
      const side = i % 2 === 0 ? -1 : 1
      const delay = i * 0.075
      const startX = target.x - side * 46
      const startY = target.y - 58 + i * 18
      fx.position.set(startX, startY)
      fx.rotation = -0.82 + i * 0.27
      this.addTimedFx(fx, 620, (node, p) => {
        const local = Math.max(0, Math.min(1, (p - delay) / (0.46 - delay * 0.25)))
        const snap = 1 - (1 - local) ** 4
        node.x = startX + side * snap * 92
        node.scale.set(0.25 + snap * 1.1, 0.6 + snap * 0.4)
        node.alpha = local > 0 ? Math.sin(local * Math.PI) : 0
      })
    }
  }

  private spawnJudgement(target: { x: number; y: number }) {
    const rune = new Container() as TimedFx
    const outer = new Graphics()
    const inner = new Graphics()
    outer.circle(0, 0, 50).stroke({ width: 4, color: 0xffdf76, alpha: 0.9 })
    outer.circle(0, 0, 42).stroke({ width: 1, color: 0xfff3b0, alpha: 0.66 })
    inner.circle(0, 0, 28).stroke({ width: 3, color: 0xffffff, alpha: 0.76 })
    inner.moveTo(-22, 0).lineTo(22, 0).moveTo(0, -22).lineTo(0, 22)
      .stroke({ width: 2, color: 0xffe488, alpha: 0.78 })
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      outer.poly([
        Math.cos(a) * 39,
        Math.sin(a) * 39,
        Math.cos(a - 0.1) * 51,
        Math.sin(a - 0.1) * 51,
        Math.cos(a + 0.1) * 51,
        Math.sin(a + 0.1) * 51,
      ]).fill({ color: 0xffdf76, alpha: 0.88 })
    }
    rune.addChild(outer, inner)
    rune.position.set(target.x, target.y + 38)
    rune.scale.set(0.2)
    this.addTimedFx(rune, 920, (node, p) => {
      const intro = 1 - (1 - Math.min(1, p / 0.2)) ** 3
      node.scale.set(0.2 + intro * 1.22)
      outer.rotation = p * 2.2
      inner.rotation = -p * 3.1
      node.alpha = p < 0.72 ? 1 : (1 - p) / 0.28
    }, this.fieldLayer)

    const beam = new Container() as TimedFx
    const light = new Graphics()
    light.poly([-48, 0, -18, -this.H * 0.58, 18, -this.H * 0.58, 48, 0])
      .fill({ color: 0xffdf76, alpha: 0.3 })
    light.rect(-27, -this.H * 0.6, 54, this.H * 0.64).fill({ color: 0xfff0a8, alpha: 0.5 })
    light.rect(-9, -this.H * 0.62, 18, this.H * 0.67).fill({ color: 0xffffff, alpha: 0.96 })
    for (let i = 0; i < 5; i++) {
      light.circle(-36 + i * 18, -18 - (i % 2) * 13, 5 + (i % 3) * 2)
        .fill({ color: 0xffef9c, alpha: 0.78 })
    }
    beam.addChild(light)
    beam.position.set(target.x, target.y + 30)
    beam.scale.x = 0.1
    this.addTimedFx(beam, 680, (node, p) => {
      const local = Math.max(0, Math.min(1, (p - 0.13) / 0.87))
      const strike = Math.min(1, local * 7)
      node.scale.x = 0.08 + strike * 0.92
      node.scale.y = 0.92 + Math.sin(local * Math.PI) * 0.08
      node.alpha = local < 0.62 ? (local > 0 ? 1 : 0) : (1 - local) / 0.38
    })

    const flash = new Container() as TimedFx
    const white = new Graphics()
    white.rect(0, 0, this.W, this.H).fill({ color: 0xfff8df, alpha: 0.3 })
    flash.addChild(white)
    this.addTimedFx(flash, 360, (node, p) => {
      const local = Math.max(0, (p - 0.2) / 0.8)
      node.alpha = local > 0 ? (1 - local) * 0.9 : 0
    }, this.overlayLayer)

    const seal = new Container() as TimedFx
    const sealFx = new Graphics()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      sealFx.moveTo(Math.cos(a) * 22, Math.sin(a) * 12)
        .lineTo(Math.cos(a) * 82, Math.sin(a) * 38)
        .stroke({ width: 3, color: i % 2 ? 0xffffff : 0xffcf55, alpha: 0.7 })
    }
    seal.addChild(sealFx)
    seal.position.set(target.x, target.y + 40)
    this.addTimedFx(seal, 820, (node, p) => {
      const local = Math.max(0, (p - 0.16) / 0.84)
      node.scale.set(0.3 + local * 1.7)
      node.rotation = local * 0.45
      node.alpha = local > 0 ? 1 - local : 0
    }, this.fieldLayer)
  }

  private spawnSigilRays(count: number, target: { x: number; y: number }) {
    for (let i = 0; i < count; i++) {
      const fx = new Container() as TimedFx
      const ray = new Graphics()
      const spread = (i - (count - 1) / 2) * 9
      const dx = target.x - this.W / 2 + spread
      const dy = target.y - this.H * 0.82
      ray.circle(0, 0, 7).fill({ color: 0xffe074, alpha: 0.82 })
      ray.moveTo(0, 0).lineTo(dx, dy)
        .stroke({ width: 7, color: 0xffb938, alpha: 0.22 })
      ray.moveTo(0, 0).lineTo(dx, dy)
        .stroke({ width: 2.5, color: 0xfff0a3, alpha: 0.96 })
      ray.circle(dx, dy, 8).fill({ color: 0xffffff, alpha: 0.82 })
      fx.addChild(ray)
      fx.position.set(this.W / 2, this.H * 0.82)
      fx.alpha = 0
      const delay = i * 0.045
      this.addTimedFx(fx, 620, (node, p) => {
        const local = Math.max(0, Math.min(1, (p - delay) / 0.48))
        const travel = 1 - (1 - local) ** 3
        node.scale.set(0.12 + travel * 0.88)
        node.alpha = local > 0 ? Math.sin(local * Math.PI) : 0
      })
    }

    if (count > 0) {
      const focus = new Container() as TimedFx
      const ring = new Graphics()
      ring.circle(0, 0, 20).stroke({ width: 6, color: 0xffd45a, alpha: 0.78 })
      ring.circle(0, 0, 8).fill({ color: 0xffffff, alpha: 0.85 })
      focus.addChild(ring)
      focus.position.set(target.x, target.y)
      this.addTimedFx(focus, 720, (node, p) => {
        const local = Math.max(0, (p - 0.32) / 0.68)
        node.scale.set(0.2 + local * 2.2)
        node.alpha = local > 0 ? 1 - local : 0
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

  private spawnHoundFetch(target: { x: number; y: number }) {
    const start = { x: this.mercSprite.x, y: this.mercSprite.y - 28 }
    const fetch = new Container() as TimedFx
    const trail = new Graphics()
    trail.moveTo(0, 0).bezierCurveTo(
      (target.x - start.x) * 0.35,
      -70,
      (target.x - start.x) * 0.72,
      target.y - start.y - 45,
      target.x - start.x,
      target.y - start.y,
    ).stroke({ width: 5, color: 0xe8c477, alpha: 0.34 })
    for (let i = 0; i < 5; i++) {
      const x = i * 22
      trail.circle(x - 4, -2 - (i % 2) * 5, 4).fill({ color: 0xf4d999, alpha: 0.62 })
      trail.circle(x + 3, -7 - (i % 2) * 5, 2.5).fill({ color: 0xf4d999, alpha: 0.5 })
    }
    fetch.addChild(trail)
    fetch.position.set(start.x, start.y)
    this.addTimedFx(fetch, 760, (node, p) => {
      node.alpha = Math.sin(p * Math.PI)
      node.scale.set(0.7 + p * 0.5)
    }, this.fieldLayer)

    const loot = new Container() as TimedFx
    const token = new Graphics()
    token.circle(0, 0, 11).fill({ color: 0xc59243, alpha: 0.95 })
    token.circle(0, 0, 7).stroke({ width: 2, color: 0xffe5a1, alpha: 0.9 })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      token.moveTo(Math.cos(a) * 14, Math.sin(a) * 14)
        .lineTo(Math.cos(a) * 25, Math.sin(a) * 25)
        .stroke({ width: 2, color: 0xffefad, alpha: 0.7 })
    }
    loot.addChild(token)
    loot.position.set(target.x, target.y)
    this.addTimedFx(loot, 880, (node, p) => {
      const local = Math.max(0, (p - 0.2) / 0.8)
      const arc = Math.sin(local * Math.PI) * 58
      node.position.set(
        target.x + (start.x - target.x) * local,
        target.y + (start.y - target.y) * local - arc,
      )
      node.rotation = local * Math.PI * 3
      node.alpha = local > 0 ? Math.sin(local * Math.PI) : 0
      node.scale.set(0.45 + Math.sin(local * Math.PI) * 0.75)
    })
  }

  private spawnRogueDash(target: { x: number; y: number }) {
    const start = { x: this.W * 0.25, y: this.H * 0.72 }
    for (let i = 0; i < 4; i++) {
      const fx = new Container() as TimedFx
      const body = new Graphics()
      body.ellipse(0, -18, 11, 22).fill({ color: 0x4d326e, alpha: 0.66 - i * 0.1 })
      body.roundRect(-3, -44, 6, 30, 3).fill({ color: 0xd2b5ff, alpha: 0.76 - i * 0.08 })
      body.moveTo(-15, -7).lineTo(16, -35).stroke({ width: 3, color: 0xf2e7ff, alpha: 0.74 })
      fx.addChild(body)
      fx.position.set(start.x, start.y)
      const delay = i * 0.04
      this.addTimedFx(fx, 760, (node, p) => {
        const local = Math.max(0, Math.min(1, (p - delay) / (1 - delay)))
        const q = local < 0.5 ? local * 2 : (1 - local) * 2
        node.position.set(start.x + (target.x + 55 - start.x) * q, start.y + (target.y - start.y) * q - Math.sin(p * Math.PI) * 32)
        node.alpha = local > 0 ? Math.sin(local * Math.PI) * (1 - i * 0.12) : 0
        node.scale.x = 0.55 + Math.abs(0.5 - local) * 1.35
      })
    }

    const slash = new Container() as TimedFx
    const blades = new Graphics()
    blades.moveTo(-52, -34).lineTo(52, 34).stroke({ width: 11, color: 0x6e3ea0, alpha: 0.3 })
    blades.moveTo(-52, -34).lineTo(52, 34).stroke({ width: 3, color: 0xf0ddff, alpha: 0.96 })
    blades.moveTo(46, -39).lineTo(-46, 39).stroke({ width: 9, color: 0x6e3ea0, alpha: 0.26 })
    blades.moveTo(46, -39).lineTo(-46, 39).stroke({ width: 2.5, color: 0xffffff, alpha: 0.9 })
    slash.addChild(blades)
    slash.position.set(target.x + 42, target.y - 4)
    this.addTimedFx(slash, 760, (node, p) => {
      const local = Math.max(0, (p - 0.34) / 0.66)
      const snap = 1 - (1 - local) ** 4
      node.scale.set(0.2 + snap * 1.3)
      node.alpha = local > 0 ? 1 - local : 0
    })
  }

  private spawnIceSeal(target: { x: number; y: number }) {
    const seal = new Container() as TimedFx
    const ice = new Graphics()
    ice.circle(0, 0, 50).stroke({ width: 4, color: 0x9feaff, alpha: 0.8 })
    ice.circle(0, 0, 34).stroke({ width: 2, color: 0xe8fbff, alpha: 0.72 })
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ice.moveTo(0, 0).lineTo(Math.cos(a) * 45, Math.sin(a) * 45)
        .stroke({ width: 3, color: 0xcaf6ff, alpha: 0.72 })
      ice.poly([
        Math.cos(a) * 26,
        Math.sin(a) * 26,
        Math.cos(a - 0.16) * 38,
        Math.sin(a - 0.16) * 38,
        Math.cos(a + 0.16) * 38,
        Math.sin(a + 0.16) * 38,
      ]).fill({ color: 0x8be4f7, alpha: 0.38 })
    }
    seal.addChild(ice)
    seal.position.set(target.x, target.y + 18)
    this.addTimedFx(seal, 860, (node, p) => {
      const lock = 1 - (1 - Math.min(1, p * 3.2)) ** 3
      node.scale.set(1.65 - lock * 0.65)
      node.rotation = -0.45 + p * 0.9
      node.alpha = p < 0.62 ? lock : (1 - p) / 0.38
    })
  }

  private spawnSapperDeploy() {
    const x = this.W * 0.72
    const y = this.H * 0.75
    this.spawnDeployPulse(x, y, 0xe5a64b)
    const rig = new Container() as TimedFx
    const gear = new Graphics()
    gear.circle(0, 0, 28).stroke({ width: 7, color: 0x7e6950, alpha: 0.8 })
    gear.circle(0, 0, 11).stroke({ width: 4, color: 0xf0c36d, alpha: 0.9 })
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      gear.roundRect(Math.cos(a) * 31 - 5, Math.sin(a) * 31 - 4, 10, 8, 2)
        .fill({ color: 0xc69243, alpha: 0.86 })
    }
    for (let i = 0; i < 7; i++) {
      const a = -2.7 + i * 0.42
      gear.moveTo(Math.cos(a) * 20, Math.sin(a) * 20)
        .lineTo(Math.cos(a) * (42 + (i % 2) * 14), Math.sin(a) * (42 + (i % 2) * 14))
        .stroke({ width: 3, color: 0xffdd82, alpha: 0.78 })
    }
    rig.addChild(gear)
    rig.position.set(x, y - 24)
    this.addTimedFx(rig, 820, (node, p) => {
      node.rotation = p * Math.PI * 2.5
      node.scale.set(1.5 - Math.min(1, p * 3) * 0.55)
      node.alpha = p < 0.68 ? 1 : (1 - p) / 0.32
    })
  }

  private spawnPyroIgnite(target: { x: number; y: number }) {
    const spiral = new Container() as TimedFx
    const flame = new Graphics()
    for (let i = 0; i < 14; i++) {
      const a = i * 0.72
      const r = 8 + i * 4.2
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r * 0.68
      flame.circle(x, y, 4 + (i % 3) * 1.8)
        .fill({ color: i % 3 === 0 ? 0xfff09a : i % 2 ? 0xffa238 : 0xff5428, alpha: 0.82 })
    }
    flame.circle(0, 0, 22).fill({ color: 0xff632f, alpha: 0.24 })
    spiral.addChild(flame)
    spiral.position.set(target.x, target.y + 14)
    this.addTimedFx(spiral, 900, (node, p) => {
      const ignite = 1 - (1 - Math.min(1, p * 2.4)) ** 3
      node.rotation = -0.8 + p * 3.8
      node.scale.set(0.25 + ignite * 1.25)
      node.alpha = p < 0.68 ? 1 : (1 - p) / 0.32
      node.y = target.y + 14 - Math.sin(p * Math.PI) * 22
    })

    const scorch = new Container() as TimedFx
    const mark = new Graphics()
    mark.circle(0, 0, 42).stroke({ width: 5, color: 0xb43724, alpha: 0.58 })
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      mark.moveTo(Math.cos(a) * 18, Math.sin(a) * 12)
        .lineTo(Math.cos(a) * 44, Math.sin(a) * 28)
        .stroke({ width: 3, color: 0xff7b32, alpha: 0.62 })
    }
    scorch.addChild(mark)
    scorch.position.set(target.x, target.y + 42)
    this.addTimedFx(scorch, 1100, (node, p) => {
      node.scale.set(0.45 + p * 1.2)
      node.rotation = p * 0.35
      node.alpha = (1 - p) * 0.8
    }, this.fieldLayer)
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
      node.rotation = p * (shatter ? 2.4 : 0.8)
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

  private spawnAfterimageReplay() {
    const target = this.targetPoint()
    const side = target.x >= this.W / 2 ? 1 : -1
    const start = { x: target.x + side * Math.min(90, this.W * 0.18), y: target.y + 62 }
    const sync = this.getSnap().afterimageSync
    const fx = new Container() as TimedFx
    const cut = new Graphics()
    cut.roundRect(-34, -3, 68, 6, 3).fill({
      color: sync ? 0x8d76bf : 0x79dcff,
      alpha: sync ? 0.56 : 0.9,
    })
    cut.roundRect(-52, -1, 104, 2, 1).fill({
      color: sync ? 0xb39bdd : 0xd8f8ff,
      alpha: sync ? 0.35 : 0.68,
    })
    fx.addChild(cut)
    fx.position.set(start.x, start.y)
    fx.rotation = Math.atan2(target.y - start.y, target.x - start.x)
    this.addTimedFx(fx, 360, (node, p) => {
      if (p < 0.28) {
        node.alpha = 0
        return
      }
      const q = (p - 0.28) / 0.72
      const travel = 1 - (1 - q) ** 3
      node.alpha = Math.min(1, q * 7) * (1 - Math.max(0, (q - 0.74) / 0.26))
      node.position.set(start.x + (target.x - start.x) * travel, start.y + (target.y - start.y) * travel)
      node.scale.x = 0.75 + q * 1.45
    })
    this.afterimageReplayLeft = 280
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
    // 本層兩種敵種交替:同一層看得到兩種生物,換層就整組換掉
    const sp = this.getSnap().species[Math.random() < 0.55 ? 0 : 1]
    const textures = sp.sprite === 'goblin' ? this.assets.goblin : this.assets.imp
    return new MobView(textures, startT, sp.tint, sp.scale)
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

  private spawnChargeAnimation(target: { x: number; y: number }) {
    const duration = this.assets.armsCharge.length * SKILL_FRAME_MS
    const charge = new Container() as TimedFx
    const trail = new AnimatedSprite(this.assets.armsCharge)
    const heroTextures = this.assets.heroes[this.heroJob]
    const riders = [0, 1, 2, 3, 4].map((index) => {
      const rider = new AnimatedSprite(heroTextures)
      rider.anchor.set(0.5, 233 / 256)
      rider.animationSpeed = frameSpeed(HERO_FRAME_MS)
      rider.scale.set(this.heroBody.scale.x, this.heroBody.scale.y)
      rider.alpha = index === 0 ? 1 : 0
      rider.tint = index === 0 ? 0xffffff : index < 3 ? 0xff7657 : 0xb62b2b
      rider.play()
      return rider
    })

    trail.anchor.set(0.5)
    trail.animationSpeed = frameSpeed(SKILL_FRAME_MS)
    trail.scale.set(Math.min(this.W * 0.62, this.H * 0.42) / 256)
    trail.loop = false
    trail.play()
    charge.addChild(trail, riders[2], riders[1], riders[0])

    const startX = this.hero.x - this.W * 0.05
    const startY = this.hero.y - this.H * 0.1
    const endX = target.x + this.W * 0.035
    const endY = target.y + Math.min(30, this.H * 0.045)
    const distance = Math.hypot(endX - startX, endY - startY) || 1
    const trailX = (startX - endX) / distance
    const trailY = (startY - endY) / distance
    let impacted = false
    this.heroBody.visible = false

    this.addTimedFx(charge, duration, (node, p) => {
      const dash = Math.max(0, Math.min(1, (p - 0.2) / 0.52))
      let travel = dash < 1 ? dash * dash * (3 - 2 * dash) : 1
      if (p > 0.84) travel -= Math.sin(Math.min(1, (p - 0.84) / 0.16) * Math.PI) * 0.035
      node.position.set(startX + (endX - startX) * travel, startY + (endY - startY) * travel)

      const fade = p > 0.88 ? Math.max(0, 1 - (p - 0.88) / 0.12) : 1
      const crouch = p < 0.2 ? p / 0.2 : 1
      const stretch = p > 0.68 ? Math.max(0, 1 - (p - 0.68) / 0.16) : 1
      riders.forEach((rider, index) => {
        const wake = index * (12 + 5 * stretch)
        rider.position.set(trailX * wake + 10, trailY * wake + 8)
        rider.rotation = -0.1 * crouch
        rider.scale.set(
          this.heroBody.scale.x * (1 + 0.13 * crouch),
          this.heroBody.scale.y * (1 - 0.15 * crouch),
        )
        rider.alpha = index === 0
          ? Math.min(1, p * 8) * fade
          : dash > index * 0.055 ? (0.44 - index * 0.075) * stretch * fade : 0
      })

      if (!impacted && p >= 0.72) {
        impacted = true
        this.spawnImpact(endX, endY, 1.35)
        if (this.boss) this.boss.flash()
        else if (this.eventView) this.eventView.flash()
        else this.frontMob()?.flash()
        this.shake = Math.max(this.shake, 15)
      }

      if (p >= 0.96) this.heroBody.visible = true
    })
  }

  private spawnSkillAnimation(textures: Texture[], target: { x: number; y: number }) {
    const skill = new AnimatedSprite(
      textures.map((texture, index) => ({ texture, time: ARMS_HEAVY_FRAME_MS[index] ?? 80 })),
    )
    skill.anchor.set(0.5)
    skill.position.set(target.x, target.y + Math.min(28, this.H * 0.04))
    skill.scale.set(Math.min(this.W * 0.68, this.H * 0.45) / 256)
    skill.loop = false
    skill.onFrameChange = (frame) => {
      if (frame !== 6) return
      if (this.boss) this.boss.flash()
      else if (this.eventView) this.eventView.flash()
      else this.frontMob()?.flash()
      this.shake = Math.max(this.shake, 16)
    }
    skill.onComplete = () => skill.destroy()
    this.impactLayer.addChild(skill)
    skill.play()
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
    this.heroBody.scale.set(s * 0.84)
    this.afterimages.forEach((ghost, i) => {
      ghost.scale.set(s * 0.84)
      if (i > 0) ghost.position.set(-20 - i * 14, 4 + i * 4)
    })
    this.cloneSprite.scale.set(s * 0.77)
    this.cloneSprite.position.set(-W * 0.105, -H * 0.015)
    this.hero.position.set(W / 2, H * 0.86)
    this.slashFx.position.set(0, -H * 0.12)
    this.slashFx.scale.set(s * 0.66)
  }

  private tickAfterimage(ms: number, snap: BattleSnapshot) {
    const ghost = this.afterimages[0]
    const trail = this.afterimages[1]
    if (snap.afterimageActive && !this.afterimageVisualActive) this.onAfterimageSpawn()
    if (!snap.afterimageActive && this.afterimageVisualActive && this.afterimageSpawnLeft <= 0 && this.afterimageExitLeft <= 0) {
      this.afterimageExitLeft = 380
    }

    this.afterimageSpawnLeft = Math.max(0, this.afterimageSpawnLeft - ms)
    this.afterimageReplayLeft = Math.max(0, this.afterimageReplayLeft - ms)
    if (this.afterimageExitLeft > 0) {
      this.afterimageExitLeft = Math.max(0, this.afterimageExitLeft - ms)
      if (this.afterimageExitLeft === 0) this.afterimageVisualActive = false
    }

    ghost.visible = this.afterimageVisualActive
    if (!ghost.visible) return
    const target = this.targetPoint()
    const side = target.x >= this.W / 2 ? 1 : -1
    const endX = target.x - this.W / 2 + side * Math.min(88, this.W * 0.18)
    const endY = target.y + 72 - this.H * 0.86
    const spawnP = 1 - this.afterimageSpawnLeft / 420
    const peel = Math.max(0, Math.min(1, spawnP))
    ghost.position.set(endX * peel, endY * peel)
    ghost.tint = snap.afterimageSync ? 0x9e84cf : 0x72dcff
    ghost.alpha = (snap.afterimageSync ? 0.26 : 0.42) * Math.min(1, peel * 2)
    ghost.rotation = 0
    ghost.skew.x = 0

    if (this.afterimageReplayLeft > 0) {
      const p = 1 - this.afterimageReplayLeft / 280
      if (p > 0.34) {
        const swing = Math.sin(((p - 0.34) / 0.66) * Math.PI)
        ghost.rotation = -side * swing * 0.34
        ghost.skew.x = side * swing * 0.18
        ghost.position.x -= side * swing * 16
      }
    }

    if (this.afterimageExitLeft > 0) {
      const p = 1 - this.afterimageExitLeft / 380
      ghost.position.x -= side * p * 72
      ghost.scale.x *= 1 + p * 1.7
      ghost.scale.y *= 1 - p * 0.35
      ghost.alpha *= 1 - p
      trail.visible = true
      trail.position.copyFrom(ghost.position)
      trail.scale.copyFrom(ghost.scale)
      trail.tint = ghost.tint
      trail.alpha = ghost.alpha * 0.42
    }
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
    if (!mercId) {
      this.mercId = null
      return
    }
    if (mercId === this.mercId) return
    this.mercId = mercId
    this.mercSprite.textures = this.assets.mercenaries[mercId]
    this.mercSprite.gotoAndPlay(0)
    this.layoutCompanions()
  }

  private layoutCompanions() {
    const ds = Math.min(this.W, this.H * 0.62) / 760
    const mercScale = this.mercId === 'hound' ? ds * 0.84 : ds * 2.2
    this.mercSprite.position.set(this.W / 2 - Math.min(this.W, this.H) * 0.24, this.H * 0.895)
    this.mercSprite.scale.set(mercScale)
    this.turretSprite.position.set(this.W * 0.72, this.H * 0.75)
    this.turretSprite.scale.set(ds)
  }

  /**
   * 地帶色調:同一張底圖靠色溫與霧氣變成不同區域(成本是零張新圖)。
   * ⚠️ 一定要補間——瞬間變色會像 bug,慢慢滲透才像「走進另一個地方」。
   * 怪物只吃一半的 tint:全套會讓怪看起來像貼在別的世界上。
   */
  private applyZone(snap: BattleSnapshot, ms: number) {
    const t = snap.zoneTint
    const target = { r: ((t >> 16) & 255) / 255, g: ((t >> 8) & 255) / 255, b: (t & 255) / 255, fog: snap.zoneFog }
    // 時間常數 500ms → 約 1.2 秒走完九成。太快像閃爍,太慢玩家不會發現自己換了地方
    const k = Math.min(1, ms / 500)
    this.zoneCur.r += (target.r - this.zoneCur.r) * k
    this.zoneCur.g += (target.g - this.zoneCur.g) * k
    this.zoneCur.b += (target.b - this.zoneCur.b) * k
    this.zoneCur.fog += (target.fog - this.zoneCur.fog) * k

    const { r, g, b, fog } = this.zoneCur
    const pack = (rr: number, gg: number, bb: number) =>
      (Math.round(rr * 255) << 16) | (Math.round(gg * 255) << 8) | Math.round(bb * 255)
    this.bg.tint = pack(r, g, b)
    // ⚠️ 小怪不在這裡統一染色:每隻怪有自己的敵種色(MobView.baseTint),
    // 在這裡覆寫會把敵種辨識度洗掉,而且會蓋掉受擊閃白與凍結色

    this.zoneFog.clear()
    if (fog > 0.01) {
      this.zoneFog.rect(0, 0, this.W, this.H).fill({ color: pack(r * 0.55, g * 0.55, b * 0.62), alpha: fog })
    }
  }

  /** 軍陣:套裝 2 件生效時腳下的方陣圈,讓「套裝真的在運作」看得見 */
  private drawFormation(active: boolean, buffSkill: SkillId | null, permanent: boolean) {
    this.formationFx.clear()
    const shieldActive =
      buffSkill === 'shieldRush' ||
      buffSkill === 'bulwark' ||
      buffSkill === 'bodyGuard' ||
      buffSkill === 'bodyIronwall' ||
      buffSkill === 'bodyCommand' ||
      buffSkill === 'bodyLegend' ||
      permanent
    this.formationLabel.visible = active || shieldActive
    this.formationLabel.text = permanent ? '不退軍陣' : active ? '帝國軍陣' : ''
    this.formationLabel.alpha = permanent ? 0.95 : 0.72
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
      if (permanent) {
        this.formationFx.ellipse(0, 8, 116 * pulse, 43 * pulse)
          .fill({ color: 0x263038, alpha: 0.28 })
        this.formationFx.poly([-15, -4, 15, -4, 18, 9, 0, 23, -18, 9])
          .fill({ color: 0x727e86, alpha: 0.34 })
          .stroke({ width: 3, color: 0xd0d7db, alpha: 0.72 })
      }
      this.formationFx
        .ellipse(0, 8, 112 * pulse, 41 * pulse)
        .stroke({ width: permanent ? 7 : 3, color: permanent ? 0x56636c : 0x929da4, alpha: permanent ? 0.82 : 0.52 })
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
      if (stored > 0) {
        this.heroStateFx.moveTo(38, -112).lineTo(38, -62)
          .stroke({ width: 4, color: 0x6c4b2e, alpha: 0.9 })
        this.heroStateFx.poly([40, -109, 67, -101, 40, -88])
          .fill({ color: 0xf2c14e, alpha: 0.65 + stored * 0.3 })
      }
    }

    if (snap.commandReady) {
      const pulse = 0.55 + Math.sin(this.elapsed * 0.009) * 0.2
      this.heroStateFx.ellipse(0, -70, 74, 102).stroke({ width: 4, color: 0xffd45d, alpha: pulse })
    }

    if (snap.legends.includes('hourglass') || snap.commanderTracking) {
      const x = 92
      const y = -96
      if (snap.legends.includes('hourglass')) {
        this.heroStateFx.poly([x - 12, y - 16, x + 12, y - 16, x - 8, y, x + 12, y + 16, x - 12, y + 16, x + 8, y])
          .stroke({ width: 2, color: 0xf2c14e, alpha: 0.72 })
      } else {
        this.heroStateFx.poly([x - 14, y - 12, x + 14, y - 12, x + 14, y + 12, x - 14, y + 12])
          .stroke({ width: 2, color: 0x8fe5ff, alpha: 0.78 })
        this.heroStateFx.moveTo(x - 7, y - 5).lineTo(x + 7, y - 5)
          .moveTo(x - 7, y + 1).lineTo(x + 7, y + 1)
          .moveTo(x - 7, y + 7).lineTo(x + 3, y + 7)
          .stroke({ width: 2, color: 0xc8f6ff, alpha: 0.78 })
      }
      for (let i = 0; i < 3; i++) {
        this.heroStateFx.circle(x - 10 + i * 10, y + 25, 3.5)
          .fill({ color: i < snap.hourglassSteps ? (snap.commanderTracking ? 0x8fe5ff : 0xffd45d) : 0x31343a, alpha: 0.85 })
      }
    }

    if (snap.isBoss && snap.valiantStacks > 0) {
      const p = 0.7 + Math.sin(this.elapsed * 0.004) * 0.12
      this.heroStateFx.ellipse(0, -66, 70 + p * 10, 100 + p * 12)
        .fill({ color: 0xe64335, alpha: 0.08 + Math.min(0.12, snap.valiantStacks * 0.012) })
      this.heroStateFx.ellipse(0, -66, 74 + p * 12, 104 + p * 14)
        .stroke({ width: 3, color: 0xff6554, alpha: 0.3 + Math.min(0.25, snap.valiantStacks * 0.02) })
    }

    if (snap.perfectWindowLeft > 0) {
      const ratio = Math.min(1, snap.perfectWindowLeft / B.PERFECT_WINDOW_SEC)
      const radius = 42 + ratio * 54
      this.heroStateFx.circle(0, -72, radius)
        .stroke({ width: 5, color: 0xffdb58, alpha: 0.42 + (1 - ratio) * 0.45 })
      this.heroStateFx.arc(0, -72, radius - 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
        .stroke({ width: 3, color: 0xfff2aa, alpha: 0.9 })
    }

    const galeActive = snap.buffSkill === 'gale' || snap.buffSkill === 'shadowClone'
    const galeGhost = this.afterimages[1]
    if (this.afterimageExitLeft <= 0) {
      galeGhost.visible = galeActive
      galeGhost.alpha = galeActive ? 0.14 + Math.sin(this.elapsed * 0.012 + galeGhost.x) * 0.04 : 0
      galeGhost.tint = 0x75ddff
    }
    this.cloneSprite.visible = snap.cloneActive
    this.cloneSprite.alpha = snap.cloneActive ? 0.28 + Math.sin(this.elapsed * 0.009) * 0.08 : 0
  }

  private drawBattleStates(snap: BattleSnapshot) {
    this.fieldFx.clear()
    this.enemyStateFx.clear()
    this.overlayFx.clear()
    const target = this.targetPoint()
    const pulse = 0.7 + Math.sin(this.elapsed * 0.012) * 0.22

    if (snap.backstabReady) {
      const markX = target.x + 42
      const markY = target.y - 16
      const color = snap.afterimageSync ? 0xc0a0ed : 0x83e5ff
      this.enemyStateFx.circle(markX, markY, 21 * pulse)
        .fill({ color, alpha: 0.12 })
        .stroke({ width: 3, color, alpha: 0.82 })
      this.enemyStateFx.moveTo(markX - 9, markY - 9).lineTo(markX + 9, markY + 9)
        .moveTo(markX + 9, markY - 9).lineTo(markX - 9, markY + 9)
        .stroke({ width: 4, color: 0xf2e9ff, alpha: 0.9 })
    }

    if (snap.bannerLeft > 0) {
      const x = this.W * 0.72
      const y = this.H * 0.75
      const life = Math.min(1, snap.bannerLeft / 5)
      const lean = (1 - life) * 20
      this.fieldFx.ellipse(x, y + 7, 42, 13).fill({ color: 0x130b08, alpha: 0.4 })
      this.fieldFx.moveTo(x, y + 4).lineTo(x + lean, y - 90)
        .stroke({ width: 6, color: 0x3c2b22, alpha: 0.45 + life * 0.55 })
      this.fieldFx.poly([x + lean, y - 86, x + lean + 55, y - 70, x + lean + 2, y - 48])
        .fill({ color: 0xc94b32, alpha: 0.35 + life * 0.55 })
      this.fieldFx.circle(x + lean, y - 56, 32 * pulse * (0.65 + life * 0.35))
        .fill({ color: 0xff7a32, alpha: 0.03 + life * 0.08 })
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

    if (snap.burnLeft > 0) {
      const fireLife = Math.min(1, snap.burnLeft / 5)
      for (let i = 0; i < 7; i++) {
        const phase = (this.elapsed * 0.0015 + i / 7) % 1
        const x = target.x + Math.sin(i * 2.37) * 34 * (1 - phase * 0.35) * (0.55 + fireLife * 0.45)
        const y = target.y + 34 - phase * (34 + fireLife * 48)
        const r = (3 + (1 - phase) * 8) * (0.45 + fireLife * 0.55)
        this.enemyStateFx.circle(x, y, r)
          .fill({ color: i % 2 ? 0xffb23d : 0xff532b, alpha: (1 - phase) * (0.25 + fireLife * 0.51) })
      }
      this.enemyStateFx.circle(target.x, target.y + 20, 44 * pulse * (0.7 + fireLife * 0.3))
        .stroke({ width: 3, color: 0xff682f, alpha: 0.18 + fireLife * 0.27 })
      for (let i = 0; i < 5; i++) {
        this.enemyStateFx.circle(target.x - 20 + i * 10, target.y - 68, i < snap.burnStacks ? 4.5 : 3.5)
          .fill({ color: i < snap.burnStacks ? 0xff7a32 : 0x3c2822, alpha: 0.9 })
          .stroke({ width: 1, color: i < snap.burnStacks ? 0xffd36c : 0x795043, alpha: 0.9 })
      }
    }

    if (snap.relicLeft > 0 && snap.isBoss) {
      this.enemyStateFx.circle(target.x + 36, target.y + 6, 18 * pulse).fill({ color: 0xffc926, alpha: 0.18 })
      this.enemyStateFx.circle(target.x + 36, target.y + 6, 12).stroke({ width: 4, color: 0xffd85c, alpha: 0.9 })
      this.enemyStateFx.moveTo(target.x + 27, target.y - 3).lineTo(target.x + 44, target.y + 14)
        .moveTo(target.x + 44, target.y - 3).lineTo(target.x + 27, target.y + 14)
        .stroke({ width: 3, color: 0xfff0a5, alpha: 0.9 })
    }

    if (snap.freezeLeft > 0) {
      const freezeRatio = Math.min(1, snap.freezeLeft / 2)
      const crack = 1 - freezeRatio
      this.overlayFx.rect(0, 0, this.W, this.H).fill({ color: 0xa9e9ff, alpha: 0.12 })
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        const x = target.x + Math.cos(a) * 62
        const y = target.y + Math.sin(a) * 48
        this.enemyStateFx.poly([x, y - 18, x + 7, y + 12, x - 7, y + 12])
          .fill({ color: 0xc8f5ff, alpha: 0.55 })
        if (crack > i / 10) {
          this.enemyStateFx.moveTo(target.x, target.y)
            .lineTo(target.x + Math.cos(a) * (24 + crack * 42), target.y + Math.sin(a) * (18 + crack * 32))
            .stroke({ width: 2, color: 0xeffcff, alpha: 0.42 + crack * 0.42 })
        }
      }
      this.enemyStateFx.arc(target.x, target.y + 4, 72, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * freezeRatio)
        .stroke({ width: 4, color: 0x9beaff, alpha: 0.84 })
    }

    if (snap.isBoss && snap.channelLeft > 0) {
      const barW = Math.min(260, this.W * 0.52)
      const x = (this.W - barW) / 2
      const y = this.H * 0.43
      this.enemyStateFx.roundRect(x, y, barW, 14, 7).fill({ color: 0x170c0c, alpha: 0.82 })
      this.enemyStateFx.roundRect(x + 2, y + 2, (barW - 4) * snap.channelProgress, 10, 5)
        .fill({ color: snap.channelProgress > 0.72 ? 0x6de3a2 : 0xffb34d, alpha: 0.95 })
      for (let i = 1; i < 4; i++) {
        this.enemyStateFx.rect(x + (barW * i) / 4, y, 2, 14).fill({ color: 0xffffff, alpha: 0.24 })
      }
    }

    if (snap.totemRatio > 0) {
      const x = this.W * 0.2
      const y = this.H * 0.58
      const barW = 78
      this.fieldFx.ellipse(x, y + 12, 34, 10).fill({ color: 0x080508, alpha: 0.42 })
      this.fieldFx.poly([x, y - 72, x + 20, y - 48, x + 12, y + 8, x - 12, y + 8, x - 20, y - 48])
        .fill({ color: 0x63334f, alpha: 0.92 })
        .stroke({ width: 3, color: 0xe08cba, alpha: 0.72 })
      this.fieldFx.circle(x, y - 45, 12 * pulse).fill({ color: 0xff70b6, alpha: 0.28 })
      this.fieldFx.roundRect(x - barW / 2, y + 20, barW, 9, 4).fill({ color: 0x1d1118, alpha: 0.9 })
      this.fieldFx.roundRect(x - barW / 2 + 2, y + 22, (barW - 4) * snap.totemRatio, 5, 2)
        .fill({ color: snap.totemRatio < 0.3 ? 0xff725f : 0xff82bd, alpha: 0.96 })
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

type AttackSource = 'hero' | 'click' | 'clone' | 'zone' | 'merc'

interface TimedFx extends Container {
  _age: number
  _duration: number
  _tick: (fx: TimedFx, progress: number, ms: number) => void
}

interface FloatText extends Text {
  _vy: number
  _life: number
  _lifeMs: number
  _frozen: boolean
  _notice: boolean
  _minY: number
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

  constructor(
    textures: Texture[],
    startT = 0,
    /** 敵種色:受擊閃白與解凍後要回到這個色,不是回到純白 */
    private baseTint = 0xffffff,
    private sizeMult = 1,
  ) {
    this.view = new AnimatedSprite(textures)
    this.view.tint = baseTint
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
      if (this.flashLeft <= 0) this.view.tint = this.baseTint
    }
    if (this.t < 1) this.t = Math.min(1, this.t + this.speed * ms)
    const ease = this.t * this.t
    // 像素怪本體比原型向量怪高,近戰位略上移避免壓住主角頭盔
    const y = H * (0.44 + 0.22 * ease)
    const x = W * (0.5 + this.offset * (0.3 + 0.7 * ease))
    const sc = (0.25 + 0.95 * ease) * (Math.min(W, H) / 420) * 0.32 * this.sizeMult
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

/** Boss:比主角大一級，但完整留在戰場內，不遮住關卡與血條 */
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
    const finalScale = Math.min(W / 410, 1)
    const scale = finalScale * (0.62 + eased * 0.38)
    const safeTop = Math.max(112, H * 0.24)
    // 以素材腳底錨點反推位置，任何戰場高度都讓頭頂落在敵人資訊列下方。
    this.view.position.set(W / 2, safeTop + 233 * scale)
    this.view.scale.set(scale)
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
