import { useEffect, useRef } from 'react'

/** 長按連點:150ms 間隔加速(升級按鈕慣例) */
export function useHold(fn: () => void, interval = 150) {
  const fnRef = useRef(fn)
  fnRef.current = fn
  const timer = useRef<number | null>(null)

  const stop = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }

  useEffect(() => stop, [])

  return {
    onPointerDown: () => {
      fnRef.current()
      stop()
      timer.current = window.setInterval(() => fnRef.current(), interval)
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  }
}
