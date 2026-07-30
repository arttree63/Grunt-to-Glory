import { useEffect, useRef, type ReactNode } from 'react'
import { fmt } from '../core/format'
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
import { useGame } from '../store/gameStore'

export default function BattleCanvas({ children }: { children?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BattleScene | null>(null)

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

    const off = gameEvents.on((e) => {
      const scene = sceneRef.current
      if (!scene) return
      if (e.type === 'attack') {
        // 暴擊是以期望值內建在 DPS 裡的,個別攻擊不會真的暴擊。
        // 這裡把它拆回來只為了顯示:暴擊顯示大數字、普通顯示小數字,平均值不變。
        const s = useGame.getState().s
        const rate = Math.min(1, critRate(s))
        const crit = Math.random() < rate
        const base = e.damage!.div(critMultiplier(rate))
        const shown = crit ? base.mul(B.CRIT_MULT) : base
        scene.swing((crit ? '暴擊 ' : '') + fmt(shown), crit, e.source ?? 'hero')
      } else if (e.type === 'moraleBurst') {
        scene.swing(`${e.via === 'lostbanner' ? '失落軍旗' : '戰意爆發'} ${fmt(e.damage!)}`, true)
      } else if (e.type === 'skill') {
        // 技能直傷原本完全沒有演出:血條瞬空但畫面什麼都沒發生
        const name = SKILLS[e.skillId!].name
        // count = 消耗掉的印記層數,演出可以據此畫 N 道射線
        scene.skillHit(e.damage ? `${name} ${fmt(e.damage)}` : name, e.skillId!, e.count ?? 0, e.via === 'ironwall')
        if (e.burnDamage) scene.onEmberConvert(fmt(e.burnDamage))
      } else if (e.type === 'cooldownAdvance') {
        scene.onCooldownAdvance(e.skillId!, e.seconds ?? 0, e.via)
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
        scene.onFreezeBurst(`冰裂 ${fmt(e.damage!)}`)
      } else if (e.type === 'burnTick') {
        scene.onBurnTick(`燃燒 ${fmt(e.damage!)}`)
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
      else if (e.type === 'eventKill') scene.onEventKill(fmt(e.gold!), !!e.count)
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
      {children}
    </div>
  )
}
