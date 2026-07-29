import { useEffect, useRef, type ReactNode } from 'react'
import { fmt } from '../core/format'
import * as B from '../core/balance'
import { critRate, currentDPS } from '../core/game'
import { BattleScene, type BattleSnapshot } from '../render/BattleScene'
import { gameEvents } from '../store/events'
import { useGame } from '../store/gameStore'

const AUTO_SWING_SEC = 0.8

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
        autoDmgText: fmt(currentDPS(s).mul(AUTO_SWING_SEC)),
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
        // 揮砍與傷害由同一個事件驅動,血條每一格下降都對得上一次攻擊
        const s = useGame.getState().s
        const crit = Math.random() < critRate(s)
        scene.swing((crit ? '暴擊 ' : '') + fmt(currentDPS(s).mul(B.ATTACK_INTERVAL).mul(crit ? 3 : 1)), crit)
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

  // 點擊整個戰鬥畫面 = 攻擊(非按鈕)
  const onPointerDown = () => {
    const st = useGame.getState()
    st.click()
    const s = st.s
    const crit = Math.random() < 0.18
    const dmg = currentDPS(s).mul(AUTO_SWING_SEC).mul(crit ? 3 : 1)
    sceneRef.current?.swing((crit ? '暴擊 ' : '') + fmt(dmg), crit)
  }

  return (
    <div className="stage" onPointerDown={onPointerDown}>
      <div className="canvas-host" ref={hostRef} />
      {children}
    </div>
  )
}
