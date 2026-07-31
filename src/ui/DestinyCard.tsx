import { useEffect, useState } from 'react'
import { DESTINY_NODES, interpretOf, pendingChoice } from '../core/destiny'
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
const SHOW_MS = 2800

const CHOICE_PRESENTATION: Record<string, { role: string; summary: string; tradeoff: string }> = {
  shade_swarm: {
    role: '命中型',
    summary: '讓戰場出現更多殘影，圍繞攻速與每次命中的效果構築。',
    tradeoff: '每 3 次生成・重演 1 次・命中更密',
  },
  shade_mirror: {
    role: '技能型',
    summary: '讓唯一的殘影記住你的技能，施放順序會成為主要決策。',
    tradeoff: '每 8 次生成・重演 3 次・替你轉冷卻',
  },
  shade_lure: {
    role: '背刺型',
    summary: '讓殘影負責擾亂敵人，主角轉而追求位置與背刺窗口。',
    tradeoff: '傷害減半・破綻翻倍・破盾 2→4 點',
  },
}

export default function DestinyCard() {
  const [reveal, setReveal] = useState<{ id: string; floor: number } | null>(null)
  const [pendingReveal, setPendingReveal] = useState<{ id: string; floor: number } | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const jobId = useGame((st) => st.s.jobId)
  useGame((st) => st.rev)
  const choice = pendingChoice(useGame.getState().s)
  const majorChoice = choice?.some((node) => node.kind === 'choice') ? choice : null
  const pickNode = useGame((st) => st.pickDestinyNode)
  const setUiLock = useGame((st) => st.setUiLock)

  useEffect(() => {
    const off = gameEvents.on((e) => {
      if (e.type !== 'destinyDescend' || !e.destinyNodeId) return
      setPendingReveal({ id: e.destinyNodeId, floor: e.floor ?? 0 })
      setLeaving(false)
    })
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    if (!pendingReveal) return
    const reveal = setTimeout(() => {
      setReveal(pendingReveal)
      setPendingReveal(null)
    }, 560)
    return () => clearTimeout(reveal)
  }, [pendingReveal])

  useEffect(() => {
    if (!reveal) return
    // 先做退場動畫再卸載,直接消失會像閃爍
    const fade = setTimeout(() => setLeaving(true), SHOW_MS - 400)
    const gone = setTimeout(() => setReveal(null), SHOW_MS)
    return () => {
      clearTimeout(fade)
      clearTimeout(gone)
    }
  }, [reveal])

  useEffect(() => {
    const active = !!majorChoice
    setUiLock('modal:destiny-choice', active)
    if (!active) setSelectedChoiceId(null)
    return () => setUiLock('modal:destiny-choice', false)
  }, [!!majorChoice, setUiLock])

  const node = reveal ? DESTINY_NODES[reveal.id] : null
  // 種子在不同職業下長成不同東西;還沒轉職時顯示種子本身
  const shown = node ? interpretOf(node, jobId) : null

  return (
    <>
      {shown && (
        <div
          className={`destiny-card-pop${leaving ? ' leaving' : ''}`}
          onPointerDown={(e) => {
            e.stopPropagation()
            setReveal(null)
          }}
        >
          <div className="destiny-card-rune" aria-hidden="true"><i /></div>
          <div className="destiny-card-copy">
            <div className="tag">命 運 降 臨</div>
            <div className="destiny-card-source">守關者戰利品・第 {reveal?.floor} 層</div>
            <div className="name">{shown.name}</div>
            <div className="desc">{shown.desc}</div>
          </div>
          <div className="destiny-card-result">已寫入本輪命運</div>
          <div className="hint">點一下關閉・完整說明在「命運」分頁</div>
          <div className="destiny-card-timer" />
        </div>
      )}
      {majorChoice && (
        <div
          className="destiny-chamber"
          role="dialog"
          aria-modal="true"
          aria-labelledby="destiny-choice-title"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="destiny-campfire" aria-hidden="true"><i /><i /><i /></div>
          <div className="destiny-chamber-kicker">第 30 層守關者已倒下</div>
          <div className="destiny-chamber-title" id="destiny-choice-title">命 運 之 間</div>
          <div className="destiny-chamber-sub">選擇殘影往後的角色。這次決定將完成本輪流派。</div>
          <div className="destiny-choice-grid">
            {majorChoice.map((item) => {
              const presentation = CHOICE_PRESENTATION[item.id]
              const selected = selectedChoiceId === item.id
              return (
                <button
                  className={`destiny-choice-card${selected ? ' selected' : ''}`}
                  key={item.id}
                  aria-pressed={selected}
                  onClick={() => setSelectedChoiceId(item.id)}
                >
                  <span className={`destiny-preview ${item.id}`}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="destiny-choice-copy">
                    <small>{presentation?.role ?? '命運方向'}</small>
                    <b>{item.name}</b>
                    <span>{presentation?.summary ?? item.desc}</span>
                    <em>{presentation?.tradeoff ?? '選擇後，本輪不可更改'}</em>
                  </span>
                </button>
              )
            })}
          </div>
          <div className="destiny-choice-confirm">
            <span>{selectedChoiceId ? '方向已選定，確認後不可更改。' : '先選一張命運卡，再確認。'}</span>
            <button
              className="btn primary"
              disabled={!selectedChoiceId}
              onClick={() => selectedChoiceId && pickNode(selectedChoiceId)}
            >
              接受這道命運
            </button>
          </div>
        </div>
      )}
    </>
  )
}
