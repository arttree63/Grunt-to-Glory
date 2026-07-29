import { useEffect, useRef, type ReactNode } from 'react'
import { fmt } from '../core/format'
import * as B from '../core/balance'
import { critMultiplier } from '../core/formulas'
import { attackInterval, critRate, currentDPS } from '../core/game'
import { BattleScene, type BattleSnapshot } from '../render/BattleScene'
import { gameEvents } from '../store/events'
import { useGame } from '../store/gameStore'

export default function BattleCanvas({ children }: { children?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BattleScene | null>(null)

  useEffect(() => {
    let cancelled = false
    const snapshot = (): BattleSnapshot => {
      const s = useGame.getState().s
      return {
        floor: s.floor,
        isBoss: s.isBoss,
        event: s.event?.kind ?? null,
        hpRatio: s.enemyMaxHp.gt(0) ? s.enemyHp.div(s.enemyMaxHp).toNumber() : 0,
        morale: s.morale,
        jobId: s.jobId,
        autoDmgText: fmt(currentDPS(s).mul(attackInterval(s))),
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
        scene.swing((crit ? '暴擊 ' : '') + fmt(shown), crit)
      } else if (e.type === 'moraleBurst') {
        scene.swing('戰意爆發 ' + fmt(e.damage!), true)
      } else if (e.type === 'clickMaterial') {
        scene.onKill('素材 +1')
      } else if (e.type === 'runReset') scene.clearNumbers()
      else if (e.type === 'kill') scene.onKill(fmt(e.gold!))
      else if (e.type === 'bossKill') scene.onBossKill()
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
