import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store/gameStore'

/**
 * 結果揭曉。兩種形態:
 * - blocking(預設):全螢幕遮罩 + 暫停遊戲。給**玩家主動**的揭曉(開錘、際遇結算)——
 *   那是玩家自己按下去等結果,暫停是儀式感。
 * - 非 blocking:戰場上一張浮卡,不暫停、不吃戰場點擊。給**打死寶箱怪/黃金哥布林**——
 *   那是戰鬥中順手發生的事,原本每次擊殺全螢幕蓋 1.3 秒,是開局期最頻繁的非自願中斷。
 */
export default function ResultReveal({
  items,
  result,
  tone,
  onDone,
  blocking = true,
}: {
  items: string[]
  result: string
  tone?: string
  onDone: () => void
  blocking?: boolean
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
    if (blocking) setUiLock('modal:result', true)
    let index = 0
    intervalRef.current = setInterval(() => {
      index = (index + 1) % Math.max(1, items.length)
      setCurrent(items[index] ?? result)
    }, 80)
    const timer = setTimeout(settle, 920)
    return () => {
      if (blocking) setUiLock('modal:result', false)
      clearTimeout(timer)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (finishRef.current) clearTimeout(finishRef.current)
    }
  }, [result, setUiLock])

  const card = (
    <div
      className={`result-reveal${settled ? ' settled' : ''}${tone ? ` ${tone}` : ''}`}
      onPointerDown={(event) => {
        event.stopPropagation()
        if (settled) doneRef.current()
        else settle()
      }}
    >
      <small>{settled ? '結果揭曉' : '揭曉中'}</small>
      <b key={current}>{current}</b>
      <span>{settled ? '點一下關閉' : '點一下跳過'}</span>
    </div>
  )

  if (!blocking) return <div className="result-reveal-float">{card}</div>

  return (
    <div
      className="result-reveal-mask"
      onPointerDown={(event) => {
        event.stopPropagation()
        if (settled) doneRef.current()
        else settle()
      }}
    >
      {card}
    </div>
  )
}
