import { useState } from 'react'
import { ALL_PATHS, DESTINY_NODES, DESTINY_PATHS, nextMilestone, pendingChoice } from '../../core/destiny'
import { QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import { heirloomCandidates, pendingMedals } from '../../core/game'
import { heirloomSlots } from '../../core/techs'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

/** 轉生 = 開始新的命運,所以入口放在命運頁 */
function PrestigeSection() {
  const s = useGameState()
  const prestige = useGame((st) => st.prestige)
  const [confirm, setConfirm] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const gain = pendingMedals(s)
  const candidates = heirloomCandidates(s)
  const slots = heirloomSlots(s.techs)

  return (
    <>
      <h3 style={{ marginTop: 16 }}>退 役 / 傳 承</h3>
      <div className="row">
        <span className="k">本代最高層數</span>
        <span className="v">{s.highestFloor} 層</span>
      </div>
      <div className="row">
        <span className="k">退役可得勳章</span>
        <span className="v" style={{ color: 'var(--gold)' }}>
          {gain} 枚
        </span>
      </div>

      {!confirm ? (
        <div className="btn-row">
          <button className="btn primary" disabled={gain <= 0} onClick={() => setConfirm(true)}>
            {gain > 0 ? `退役,讓下一代接棒(+${gain} 枚)` : '至少推進到 10 層才能退役'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="affix" style={{ marginBottom: 8, lineHeight: 1.7 }}>
            這一代的等級、金幣、素材與命運都會歸零,換得 {gain} 枚勳章與一段列傳。
            <br />
            可指定 {slots} 件裝備當傳家寶帶給下一代。
          </div>
          {candidates.slice(0, 8).map((e) => {
            const on = picked.includes(e.id)
            return (
              <button
                key={e.id}
                className="row"
                style={{ width: '100%', textAlign: 'left', opacity: on ? 1 : 0.6 }}
                onClick={() =>
                  setPicked(on ? picked.filter((id) => id !== e.id) : [...picked, e.id].slice(-slots))
                }
              >
                <span style={{ color: `var(--q-${e.quality})` }}>
                  {on ? '● ' : '○ '}
                  {QUALITY_NAME[e.quality]}
                  {SLOT_NAME[e.slot]}
                </span>
              </button>
            )
          })}
          <div className="btn-row">
            <button
              className="btn primary"
              onClick={() => {
                prestige(picked)
                setPicked([])
                setConfirm(false)
              }}
            >
              確認退役
            </button>
            <button className="btn" onClick={() => setConfirm(false)}>
              再想想
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function DestinyPanel() {
  const s = useGameState()
  const chooseDestiny = useGame((st) => st.chooseDestiny)
  const pickNode = useGame((st) => st.pickDestinyNode)

  // 還沒選路徑:這一輪要怎麼玩
  if (!s.destinyPath) {
    return (
      <div>
        <h3>命 運</h3>
        <div className="affix" style={{ marginBottom: 10, lineHeight: 1.7 }}>
          選擇這一代小兵的命運。每輪只能選一條,轉生後重新選。
        </div>
        {ALL_PATHS.map((p) => (
          <div className="card" key={p.id}>
            <div className="head">
              <b>
                {p.name} <small className="affix">{p.tagline}</small>
              </b>
              <button className="btn primary" onClick={() => chooseDestiny(p.id)}>
                選擇
              </button>
            </div>
            <div className="affix">{p.fantasy}</div>
            <div className="affix" style={{ color: 'var(--text)', marginTop: 4 }}>
              起始:{DESTINY_NODES[p.start].name} — {DESTINY_NODES[p.start].desc}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const path = DESTINY_PATHS[s.destinyPath]
  const choice = pendingChoice(s)
  const next = nextMilestone(s)

  return (
    <div>
      <h3>
        命 運・{path.name}
        {s.destinyPoints > 0 && <span style={{ color: 'var(--gold)' }}> ・{s.destinyPoints} 點待用</span>}
      </h3>

      {choice ? (
        <>
          <div className="affix" style={{ marginBottom: 8 }}>
            二選一,選了另一個本輪就不會再出現。
          </div>
          {choice.map((n) => (
            <div className="card" key={n.id}>
              <div className="head">
                <b>{n.name}</b>
                <button className="btn primary" onClick={() => pickNode(n.id)}>
                  選擇
                </button>
              </div>
              <div className="affix">{n.desc}</div>
            </div>
          ))}
        </>
      ) : (
        <div className="empty">
          {next !== null ? `推進到第 ${next} 層會獲得下一枚命運點` : '本輪命運已經走完'}
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>已走過的路</h3>
      {s.destinyNodes.map((id) => {
        const n = DESTINY_NODES[id]
        if (!n) return null
        return (
          <div className="row" key={id}>
            <span className="k">{n.tier === 0 ? '起始' : `第 ${n.tier} 個決策`}</span>
            <span className="v">{n.name}</span>
          </div>
        )
      })}

      <PrestigeSection />
    </div>
  )
}
