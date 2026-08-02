import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ACHIEVEMENTS } from '../core/achievements'
import { zoneOf } from '../core/zones'
import { hasNode } from '../core/destiny'
import { speciesPair } from '../core/enemies'
import { fmt, fmtCombat } from '../core/format'
import * as B from '../core/balance'
import { critMultiplier } from '../core/formulas'
import {
  activeLegends,
  channelProgress,
  critRate,
  critWindowActive,
  heirloomRepairLeft,
  ironwallActive,
  setCount,
  shellProgress,
  sigilCap,
} from '../core/game'
import { BattleScene, type BattleSnapshot } from '../render/BattleScene'
import { gameEvents } from '../store/events'
import { MERCS } from '../core/mercs'
import type { GameEvent, SkillId } from '../core/types'
import * as sfx from '../audio/sfx'
import { useGame } from '../store/gameStore'
import ResultReveal from './ResultReveal'

const EVENT_REVEAL_ITEMS = ['金幣', '怪物素材', '菁英素材', '部位素材']
const PAUSED_DESTINY_EVENTS = new Set<GameEvent['type']>(['destinyDescend', 'destinyPoint', 'resonanceGain'])

/**
 * 事件 → 音效對照(GDD § 10.5 六層優先序)。
 * attack / skill 需要額外資訊(暴擊、哪一招),在各自分支裡另外播。
 */
const EVENT_SFX: Partial<Record<GameEvent['type'], sfx.SfxName>> = {
  kill: 'kill',
  eventKill: 'gold',
  bossKill: 'bossKill',
  nemesisResolved: 'bossKill',
  bossFail: 'fail',
  threatHit: 'hit',
  dodge: 'tap',
  enduranceDown: 'fail',
  channelFailed: 'fail',
  eventEscape: 'fail',
  levelUp: 'levelUp',
  shellBreak: 'shellBreak',
  interrupted: 'interrupt',
  channelStart: 'channel',
  totemSpawn: 'channel',
  eventSpawn: 'channel',
  achievement: 'achievement',
  destinyPoint: 'achievement',
  perfectBurst: 'perfect',
  burnMax: 'burst',
  freezeStart: 'freeze',
  freezeBurst: 'shellBreak',
  forge: 'forge',
  weaponEvolve: 'legendForge',
  heirloomRestored: 'legendForge',
  partDrop: 'gold',
  eliteDrop: 'gold',
  clickMaterial: 'tap',
  floorUp: 'levelUp',
  zoneEnter: 'bossKill',
  destinyDescend: 'legendForge',
  afterimageSpawn: 'skillGale',
  retaliate: 'skillShield',
}

/** 三系技能的音色。第二技能(引爆)另走 burst,因為那是機制成功層不是身分層 */
const SKILL_SFX: Partial<Record<SkillId, sfx.SfxName>> = {
  armsHeavy: 'skillGale',
  armsCharge: 'skillGale',
  armsCommand: 'skillGale',
  armsLegend: 'skillShield',
  bodyGuard: 'skillShield',
  bodyIronwall: 'skillShield',
  bodyCommand: 'skillShield',
  bodyLegend: 'skillShield',
  agilityRoll: 'skillGale',
  agilityHaste: 'skillGale',
  agilityCommand: 'skillGale',
  agilityLegend: 'skillGale',
  magicFireball: 'skillHoly',
  magicBurst: 'skillHoly',
  magicCommand: 'skillHoly',
  magicLegend: 'skillHoly',
  faithHeal: 'skillHoly',
  faithBlessing: 'skillHoly',
  faithCommand: 'skillHoly',
  faithLegend: 'skillHoly',
  shieldRush: 'skillShield',
  bulwark: 'skillShield',
  rally: 'skillShield',
  gale: 'skillGale',
  windMark: 'skillGale',
  shadowClone: 'skillGale',
  judgement: 'skillHoly',
  edict: 'skillHoly',
  meteor: 'skillHoly',
}

export default function BattleCanvas({ children }: { children?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BattleScene | null>(null)
  const [eventReveal, setEventReveal] = useState<{ text: string; tone: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const snapshot = (): BattleSnapshot => {
      const s = useGame.getState().s
      return {
        isBoss: s.isBoss,
        event: s.event?.kind ?? null,
        jobId: s.jobId,
        formation: ironwallActive(s),
        // 多槽 buff:buffSkill 維持「最新的那個」給 Codex 的分招演出用,不改契約
        buffSkill: s.buffs.at(-1)?.skillId ?? null,
        bodyBuffSkill: [...s.buffs].reverse().find((buff) => buff.skillId.startsWith('body'))?.skillId ?? null,
        buffPermanent: !!s.buffs.at(-1)?.permanent,
        buffLeft: s.buffs.at(-1)?.timeLeft ?? 0,
        sigils: s.sigils,
        sigilMax: sigilCap(s),
        armyMomentum: s.armyMomentum,
        armyUnits: s.armyUnits,
        armyFormation: s.armyFormation,
        combo: s.combo,
        trackArms: s.tracks.arms,
        trackBody: s.tracks.body,
        trackAgility: s.tracks.agility,
        trackMagic: s.tracks.magic,
        trackFaith: s.tracks.faith,
        charging: s.charging,
        chargeStacks: s.chargeStacks,
        relicLeft: s.relicLeft,
        bannerStored: s.bannerStored,
        commandReady: s.commandReady,
        legends: activeLegends(s),
        bossTimeLeft: s.isBoss ? s.bossTimeLeft : null,
        bossKind: s.bossKind,
        shellLeft: s.shellLeft,
        shellProgress: shellProgress(s),
        channelLeft: s.channelLeft,
        channelProgress: channelProgress(s),
        // 地帶:render 用 tint/fog 對同一張底圖做色調重繪(見 Codex 文件「地帶染色」)
        zoneTint: zoneOf(s.floor).tint,
        zoneFog: zoneOf(s.floor).fog,
        // 敵種:同兩張素材靠 tint + 體型 + 名字衍生成不同生物(見 core/enemies.ts)
        species: speciesPair(s.floor),
        totemRatio: s.totemMaxHp.gt(0) ? s.totemHp.div(s.totemMaxHp).toNumber() : 0,
        valiantStacks: s.valiantStacks,
        hourglassSteps: new Set(s.castOrder).size,
        commanderTracking: setCount(s, 'commander') >= 2,
        perfectWindowLeft: s.perfectWindowLeft,
        activeMerc: s.activeMerc,
        cloneActive: critWindowActive(s) && activeLegends(s).includes('twinblade'),
        // ── 殘影(命運種子)。⚠️ 與 twinblade 的 cloneActive 是兩回事,不要共用同一個 sprite ──
        /** 殘影正在場上(還有重演次數) */
        afterimageActive: s.afterimageLeft > 0,
        /** 還要重演幾次 */
        afterimageLeft: s.afterimageLeft,
        /** 同步步伐:殘影從傷害來源變成破綻產生器,外觀應該看得出不同 */
        afterimageSync: hasNode(s, 'shade_sync'),
        /** 殘影留下的背刺窗口:主角下一擊無視圖騰 */
        backstabReady: s.backstabReady,
        bannerLeft: s.bannerLeft,
        zoneLeft: s.zoneLeft,
        burnLeft: s.burnLeft,
        burnStacks: s.burnStacks,
        freezeLeft: s.freezeLeft,
      }
    }

    BattleScene.create(hostRef.current!, snapshot).then((scene) => {
      if (cancelled) {
        scene.destroy()
        return
      }
      sceneRef.current = scene
      if (import.meta.env.DEV) (window as unknown as { __scene: BattleScene }).__scene = scene
    })

    // 第一次手勢解鎖 AudioContext(瀏覽器擋自動播放),解鎖完就把自己拆掉
    const onFirstGesture = () => {
      sfx.unlock()
      window.removeEventListener('pointerdown', onFirstGesture)
    }
    window.addEventListener('pointerdown', onFirstGesture)

    const off = gameEvents.on((e) => {
      const scene = sceneRef.current
      if (!scene) return
      if (PAUSED_DESTINY_EVENTS.has(e.type)) return
      // 音效走對照表統一派送,不散進下面三十個分支(漏一個就少一個音,對不出來)
      const named = EVENT_SFX[e.type]
      if (named) sfx.play(named)
      if (e.type === 'attack') {
        // 暴擊是以期望值內建在 DPS 裡的,個別攻擊不會真的暴擊。
        // 這裡把它拆回來只為了顯示:暴擊顯示大數字、普通顯示小數字,平均值不變。
        const s = useGame.getState().s
        const rate = Math.min(1, critRate(s))
        const crit = Math.random() < rate
        const base = e.damage!.div(critMultiplier(rate))
        const shown = crit ? base.mul(B.CRIT_MULT) : base
        sfx.play(crit ? 'crit' : 'hit')
        scene.swing(fmtCombat(shown), crit, e.source ?? 'hero')
      } else if (e.type === 'clickFeedback') {
        return
      } else if (e.type === 'skill') {
        // 技能直傷原本完全沒有演出:血條瞬空但畫面什麼都沒發生
        // 三系各有自己的音色:關掉技能名稱也要聽得出剛剛放的是哪一招(GDD § 10.5 身分層)
        sfx.play((e.count ?? 0) > 0 ? 'burst' : SKILL_SFX[e.skillId!] ?? 'skillShield')
        // count = 消耗掉的印記層數,演出可以據此畫 N 道射線
        // 多段技:每一段跳自己的數字,總和等於實際傷害(不是各段都印總額)
        const hitN = e.hits ?? 1
        const perHit = e.damage && hitN > 1 ? fmtCombat(e.damage.div(hitN)) : ''
        scene.skillHit(
          e.damage ? fmtCombat(e.damage) : '',
          e.skillId!,
          e.count ?? 0,
          hitN,
          e.auto ?? false,
          perHit,
        )
      } else if (e.type === 'cooldownAdvance') {
        scene.onCooldownAdvance(e.skillId!, e.seconds ?? 0, e.via)
      } else if (e.type === 'zoneEnter') {
        const zone = zoneOf(e.floor!)
        scene.onZoneEnter(zone.name, zone.flavor)
      } else if (e.type === 'destinyDescend') {
        scene.onDestinyDescend()
      } else if (e.type === 'afterimageSpawn') {
        scene.onAfterimageSpawn()
      } else if (e.type === 'achievement') {
        const a = ACHIEVEMENTS.find((x) => x.id === e.achievementId)
        if (a) scene.notice(`軍功記錄・${a.name}`)
      } else if (e.type === 'sigilGain') {
        scene.onSigilGain(e.count ?? 0, e.via)
      } else if (e.type === 'armyGain') {
        scene.onArmyGain()
      } else if (e.type === 'armySummon') {
        scene.onArmySummon(e.count ?? 0)
      } else if (e.type === 'armyAssist') {
        scene.onArmyAssist(e.count ?? 0, e.damage ? fmtCombat(e.damage) : '')
      } else if (e.type === 'retaliate') {
        scene.onRetaliate(e.count ?? 0, e.damage ? fmtCombat(e.damage) : '', e.skillId!)
      } else if (e.type === 'resonanceGain') {
        scene.onResonanceGain(e.count ?? 0)
      } else if (e.type === 'shellGain') {
        scene.onShellGain(e.count ?? 0, e.shellSource)
      } else if (e.type === 'mercUnlock') {
        // 四次解鎖以前完全靜默(unlockedMercs 是純推導,沒有任何事件)。
        // 用 skillHit 的大字而不是一行 notice:一輪只有 4 次,它是「拿到新東西」不是「+1 素材」
        scene.skillHit(`新 戰 友 ・ ${MERCS[e.mercId!].name}`)
        scene.notice(`到「英雄」分頁帶上他・${MERCS[e.mercId!].signature}`)
      } else if (e.type === 'freezeCapped') {
        scene.notice('凍結上限・本場已用盡')
      } else if (e.type === 'relicPrimed') {
        scene.onRelicPrimed()
      } else if (e.type === 'shellBreak') {
        scene.skillHit('破 盾 !')
      } else if (e.type === 'channelStart') {
        scene.notice('Boss 蓄力中——打斷它!')
      } else if (e.type === 'interrupted') {
        scene.skillHit('打 斷 !')
      } else if (e.type === 'channelFailed') {
        scene.notice('Boss 硬化了')
      } else if (e.type === 'totemSpawn') {
        scene.notice('圖騰出現・倒數加速')
      } else if (e.type === 'totemDown') {
        scene.notice('圖騰擊破')
      } else if (e.type === 'mercAct') {
        scene.onMercAct(e.mercId!)
      } else if (e.type === 'freezeStart') {
        scene.onFreezeStart()
      } else if (e.type === 'freezeBurst') {
        scene.onFreezeBurst(fmtCombat(e.damage!))
      } else if (e.type === 'burnTick') {
        scene.onBurnTick(fmtCombat(e.damage!))
      } else if (e.type === 'nemesisResolved') {
        scene.skillHit('宿 怨 終 結 !')
      } else if (e.type === 'perfectBurst') {
        scene.skillHit('完 美 引 爆 !')
      } else if (e.type === 'threatHit') {
        scene.threatHit()
      } else if (e.type === 'dodge') {
        scene.notice('迴 避')
      } else if (e.type === 'enduranceDown') {
        scene.notice('耐久見底・戰線潰散')
      } else if (e.type === 'burnMax') {
        scene.onBurnMax()
      } else if (e.type === 'bannerStore') {
        scene.onBannerStore()
      } else if (e.type === 'heirloomRestored') {
        scene.onHeirloomRestored()
      } else if (e.type === 'destinyPoint') {
        scene.notice('獲得命運點')
      } else if (e.type === 'partDrop') {
        scene.notice('部位素材 +1')
      } else if (e.type === 'eliteDrop') {
        scene.notice('菁英素材 +1')
      } else if (e.type === 'weaponEvolve') {
        scene.notice('武器進化')
      } else if (e.type === 'clickMaterial') {
        scene.onMaterial()
      } else if (e.type === 'encounter') {
        scene.onEncounter()
      } else if (e.type === 'levelUp') {
        scene.onLevelUp()
      } else if (e.type === 'runReset') scene.clearNumbers()
      else if (e.type === 'kill') scene.onKill(fmt(e.gold!))
      else if (e.type === 'floorUp') scene.onFloorUp()
      else if (e.type === 'bossKill') {
        const s = useGame.getState().s
        const hasBrokenHeirloom = [...s.inventory, ...Object.values(s.equipped)].some((item) => item?.broken)
        scene.onBossKill(hasBrokenHeirloom ? heirloomRepairLeft(s) : undefined)
      }
      else if (e.type === 'bossFail') scene.onBossFail()
      else if (e.type === 'eventKill') {
        const elite = !!e.count
        const gold = fmt(e.gold!)
        setEventReveal({
          text: elite ? `菁英素材 +1・${gold} 金` : `${gold} 金`,
          tone: elite ? 'q-purple' : 'gold',
        })
        scene.onEventKill(gold, elite)
      }
      else if (e.type === 'eventEscape') scene.onEventEscape()
    })

    return () => {
      cancelled = true
      off()
      sceneRef.current?.destroy()
      sceneRef.current = null
    }
  }, [])

  // 點擊整個戰鬥畫面 = 攻擊(非按鈕)。
  // 揮砍動畫統一由 core 的 attack 事件驅動,這裡只負責告訴 core「玩家點了」,
  // 否則會出現動畫揮了但血條沒動的落差。
  const onPointerDown = () => useGame.getState().click()

  return (
    <div className="stage" onPointerDown={onPointerDown}>
      {/* 定位寫死在這裡而不是只靠 styles.css:PIXI 的 resizeTo 是掛載當下量這個元素,
          樣式表若還沒到(非阻塞載入),量到 0 高的戰場會永久空白,而且不會自己修正 */}
      <div className="canvas-host" ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      {eventReveal && (
        <ResultReveal
          items={EVENT_REVEAL_ITEMS}
          result={eventReveal.text}
          tone={eventReveal.tone}
          blocking={false}
          onDone={() => setEventReveal(null)}
        />
      )}
      {children}
    </div>
  )
}
