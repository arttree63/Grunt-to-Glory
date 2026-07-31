import { useEffect, useState } from 'react'
import { DESTINY_NODES, interpretOf } from '../core/destiny'
import { gameEvents } from '../store/events'
import { useGame } from '../store/gameStore'

/**
 * 命運降臨小卡。
 *
 * ⚠️ 這是**小事件的呈現方式,不是大抉擇的**——兩者刻意不同:
 * - 降臨:戰場上一張卡、命運名 + 一句話、**不暫停遊戲**、自動消失。
 *   隨機命運沒有選擇需求,不該強迫玩家停下來讀完再繼續。
 * - 大抉擇(第 30/60/90 層):進命運頁三選一,那才值得暫停。
 *
 * 先前只用一行 Pixi notice,混在其他提示裡幾乎看不見——
 * 看不見的功能等於沒有功能。
 */
const SHOW_MS = 4200

export default function DestinyCard() {
  const [nodeId, setNodeId] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const jobId = useGame((st) => st.s.jobId)

  useEffect(() => {
    const off = gameEvents.on((e) => {
      if (e.type !== 'destinyDescend' || !e.destinyNodeId) return
      setNodeId(e.destinyNodeId)
      setLeaving(false)
    })
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    if (!nodeId) return
    // 先做退場動畫再卸載,直接消失會像閃爍
    const fade = setTimeout(() => setLeaving(true), SHOW_MS - 400)
    const gone = setTimeout(() => setNodeId(null), SHOW_MS)
    return () => {
      clearTimeout(fade)
      clearTimeout(gone)
    }
  }, [nodeId])

  if (!nodeId) return null
  const node = DESTINY_NODES[nodeId]
  if (!node) return null
  // 種子在不同職業下長成不同東西;還沒轉職時顯示種子本身
  const shown = interpretOf(node, jobId)

  return (
    <div
      className={`destiny-card-pop${leaving ? ' leaving' : ''}`}
      onPointerDown={(e) => {
        e.stopPropagation()
        setNodeId(null)
      }}
    >
      <div className="tag">命 運 降 臨</div>
      <div className="name">{shown.name}</div>
      <div className="desc">{shown.desc}</div>
      <div className="hint">點一下關閉・完整說明在「命運」分頁</div>
    </div>
  )
}
