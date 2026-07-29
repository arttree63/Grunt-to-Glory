import { useEffect, useRef, useState } from 'react'
import * as B from '../core/balance'
import { isBossFloor } from '../core/formulas'
import { gameEvents } from '../store/events'
import { useGameState } from './useGameState'

/**
 * 本層進度:玩家先前看不出「這層還要殺幾隻」,只看得到當前那隻怪的血條,
 * 推進感因此很模糊。這裡把 killsInFloor 直接畫成點。
 */
export function FloorDots() {
  const s = useGameState()
  if (s.isBoss || s.event) return null

  const total = B.MOBS_PER_FLOOR
  const done = s.killsInFloor
  const nextIsBoss = isBossFloor(s.floor + 1)

  return (
    <div className="floor-dots">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < done ? 'on' : ''} />
      ))}
      <span>{nextIsBoss ? `${done}/${total}・下層 Boss` : `${done}/${total}`}</span>
    </div>
  )
}

/** 進層提示。高 DPS 時一秒會跳好幾層,所以節流,只顯示最新的層數 */
export function FloorToast() {
  const [floor, setFloor] = useState<number | null>(null)
  const lastShown = useRef(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    const off = gameEvents.on((e) => {
      if (e.type !== 'floorUp' || !e.floor) return
      const now = Date.now()
      if (now - lastShown.current < 700) return
      lastShown.current = now
      setFloor(e.floor)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setFloor(null), 900)
    })
    return () => {
      off()
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  if (floor === null) return null
  const boss = isBossFloor(floor)
  return (
    <div className={`floor-toast${boss ? ' boss' : ''}`} key={floor}>
      第 {floor} 層{boss && <small>守關者出現</small>}
    </div>
  )
}
