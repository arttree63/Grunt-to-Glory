import { useEffect, useRef, type ReactNode } from 'react'
import { fmt } from '../core/format'
import { currentDPS } from '../core/game'
import { JOBS } from '../core/jobs'
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
      const look = JOBS[s.jobId].look
      return {
        floor: s.floor,
        isBoss: s.isBoss,
        hpRatio: s.enemyMaxHp.gt(0) ? s.enemyHp.div(s.enemyMaxHp).toNumber() : 0,
        morale: s.morale,
        cape: look.cape,
        weapon: look.weapon,
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
      if (e.type === 'kill') scene.onKill(fmt(e.gold!))
      else if (e.type === 'bossKill') scene.onBossKill()
      else if (e.type === 'bossFail') scene.onBossFail()
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
