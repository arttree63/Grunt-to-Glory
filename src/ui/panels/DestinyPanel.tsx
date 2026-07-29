import { ALL_PATHS, DESTINY_NODES, DESTINY_PATHS, nextMilestone, pendingChoice } from '../../core/destiny'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

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

      <div className="empty">節點效果實作中(第一批僅完成命運樹框架與決策流程)</div>
    </div>
  )
}
