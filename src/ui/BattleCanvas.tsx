import { useEffect, useRef, type ReactNode } from 'react'
import { fmt } from '../core/format'
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
    })

    const off = gameEvents.on((e) => {
      const scene = sceneRef.current
      if (!scene) return
      if (e.type === 'attack') {
        // 揮砍、跳字、血條都來自同一個事件,數字就是這一擊的實際傷害
        const crit = Math.random() < critRate(useGame.getState().s)
        scene.swing((crit ? '暴擊 ' : '') + fmt(e.damage!), crit)
      } else if (e.type === 'kill') scene.onKill(fmt(e.gold!))
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
