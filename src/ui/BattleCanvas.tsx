import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ACHIEVEMENTS } from '../core/achievements'
import { zoneOf } from '../core/zones'
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
import { SKILLS } from '../core/skills'
import type { GameEvent, SkillId } from '../core/types'
import * as sfx from '../audio/sfx'
import { useGame } from '../store/gameStore'
import ResultReveal from './ResultReveal'

const EVENT_REVEAL_ITEMS = ['金幣', '怪物素材', '菁英素材', '部位素材']

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
  moraleBurst: 'burst',
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
}

/** 三系技能的音色。第二技能(引爆)另走 burst,因為那是機制成功層不是身分層 */
const SKILL_SFX: Partial<Record<SkillId, sfx.SfxName>> = {
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
        morale: s.morale,
        jobId: s.jobId,
        formation: ironwallActive(s),
        // 多槽 buff:buffSkill 維持「最新的那個」給 Codex 的分招演出用,不改契約
        buffSkill: s.buffs.at(-1)?.skillId ?? null,
        buffPermanent: !!s.buffs.at(-1)?.permanent,
        buffLeft: s.buffs.at(-1)?.timeLeft ?? 0,
        sigils: s.sigils,
        sigilMax: sigilCap(s),
        combo: s.combo,
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
        zealStacks: s.zealStacks,
        encounterWaiting: s.encounters.length > 0,
        activeMerc: s.activeMerc,
        cloneActive: critWindowActive(s) && activeLegends(s).includes('twinblade'),
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
        const click = e.source === 'click'
        const morale = click && (e.count ?? 0) > 0 ? `・戰意 +${Math.round(e.count!)}` : ''
        scene.swing(
          (e.pierce ? '穿透・' : '') + (crit ? '暴擊 ' : '') + (click ? '點擊 ' : '') + fmtCombat(shown) + morale,
          crit,
          e.source ?? 'hero',
        )
      } else if (e.type === 'clickFeedback') {
        const morale = Math.round(e.count ?? 0)
        scene.swing(morale > 0 ? `戰意 +${morale}` : '戰意已滿', false, 'click')
      } else if (e.type === 'moraleBurst') {
        scene.swing(`${e.via === 'lostbanner' ? '失落軍旗' : '戰意爆發'} ${fmtCombat(e.damage!)}`, true)
      } else if (e.type === 'skill') {
        // 技能直傷原本完全沒有演出:血條瞬空但畫面什麼都沒發生
        const name = SKILLS[e.skillId!].name
        // 三系各有自己的音色:關掉技能名稱也要聽得出剛剛放的是哪一招(GDD § 10.5 身分層)
        sfx.play((e.count ?? 0) > 0 ? 'burst' : SKILL_SFX[e.skillId!] ?? 'skillShield')
        // count = 消耗掉的印記層數,演出可以據此畫 N 道射線
        scene.skillHit(e.damage ? `${name} ${fmtCombat(e.damage)}` : name, e.skillId!, e.count ?? 0, e.via === 'ironwall')
        if (e.burnDamage) scene.onEmberConvert(fmtCombat(e.burnDamage))
      } else if (e.type === 'cooldownAdvance') {
        scene.onCooldownAdvance(e.skillId!, e.seconds ?? 0, e.via)
      } else if (e.type === 'zoneEnter') {
        // 進新地帶:一句地帶描述,讓推進有敘事而不只是數字往上跳
        scene.notice(`進入 ${zoneOf(e.floor!).name}`)
      } else if (e.type === 'achievement') {
        const a = ACHIEVEMENTS.find((x) => x.id === e.achievementId)
        if (a) scene.notice(`軍功記錄・${a.name}`)
      } else if (e.type === 'sigilGain') {
        scene.onSigilGain(e.count ?? 0, e.via)
      } else if (e.type === 'resonanceGain') {
        scene.onResonanceGain(e.count ?? 0)
      } else if (e.type === 'shellGain') {
        scene.onShellGain(e.count ?? 0, e.shellSource)
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
      } else if (e.type === 'zealGain') {
        scene.notice(`戰意昂揚 ×${e.count}(本輪傷害 +${e.count! * 2}%)`)
      } else if (e.type === 'mercAct') {
        scene.onMercAct(e.mercId!)
      } else if (e.type === 'freezeStart') {
        scene.onFreezeStart()
      } else if (e.type === 'freezeBurst') {
        scene.onFreezeBurst(`冰裂 ${fmtCombat(e.damage!)}`)
      } else if (e.type === 'burnTick') {
        // 穿透標記:圖騰在場時火仍燒進本體——規則讓玩家親眼看到,不用文字教
        scene.onBurnTick(`${e.pierce ? '穿透・' : ''}燃燒 ${fmtCombat(e.damage!)}`)
      } else if (e.type === 'nemesisResolved') {
        scene.skillHit('宿 怨 終 結 !')
      } else if (e.type === 'perfectBurst') {
        scene.skillHit('完 美 引 爆 !')
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
      <div className="canvas-host" ref={hostRef} />
      {eventReveal && (
        <ResultReveal
          items={EVENT_REVEAL_ITEMS}
          result={eventReveal.text}
          tone={eventReveal.tone}
          onDone={() => setEventReveal(null)}
        />
      )}
      {children}
    </div>
  )
}
