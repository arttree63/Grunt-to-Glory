import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store/gameStore'

export default function ResultReveal({
  items,
  result,
  tone,
  onDone,
}: {
  items: string[]
  result: string
  tone?: string
  onDone: () => void
}) {
  const [current, setCurrent] = useState(items[0] ?? result)
  const [settled, setSettled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finishRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doneRef = useRef(onDone)
  const setUiLock = useGame((st) => st.setUiLock)
  doneRef.current = onDone

  const settle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (finishRef.current) clearTimeout(finishRef.current)
    setCurrent(result)
    setSettled(true)
    finishRef.current = setTimeout(() => doneRef.current(), 360)
  }

  useEffect(() => {
    setUiLock('modal:result', true)
    let index = 0
    intervalRef.current = setInterval(() => {
      index = (index + 1) % Math.max(1, items.length)
      setCurrent(items[index] ?? result)
    }, 80)
    const timer = setTimeout(settle, 920)
    return () => {
      setUiLock('modal:result', false)
      clearTimeout(timer)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (finishRef.current) clearTimeout(finishRef.current)
    }
  }, [result, setUiLock])

  return (
    <div
      className="result-reveal-mask"
      onPointerDown={(event) => {
        event.stopPropagation()
        if (settled) doneRef.current()
        else settle()
      }}
    >
      <div className={`result-reveal${settled ? ' settled' : ''}${tone ? ` ${tone}` : ''}`}>
        <small>{settled ? '結果揭曉' : '揭曉中'}</small>
        <b key={current}>{current}</b>
        <span>{settled ? '點一下關閉' : '點一下跳過'}</span>
      </div>
    </div>
  )
}
