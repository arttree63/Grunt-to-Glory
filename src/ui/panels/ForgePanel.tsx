import { useState } from 'react'
import * as B from '../../core/balance'
import { AFFIX_NAME, QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import type { Equipment } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

export default function ForgePanel() {
  const s = useGameState()
  const forge = useGame((st) => st.forge)
  const equip = useGame((st) => st.equip)
  const [results, setResults] = useState<Equipment[]>([])

  const canForge = s.materials >= B.FORGE_COST
  const canForge10 = s.materials >= B.FORGE_COST * 10

  const doForge = (times: number) => {
    const out: Equipment[] = []
    for (let i = 0; i < times; i++) {
      const e = forge()
      if (!e) break
      out.push(e)
    }
    // 十連結果最高品質置頂
    setResults(out.sort((a, b) => b.quality.localeCompare(a.quality)))
  }

  return (
    <div>
      <h3>鐵 匠 鋪</h3>
      <div className="row">
        <span className="k">怪物素材</span>
        <span className="v">{s.materials}</span>
      </div>
      <div className="row">
        <span className="k">普通鍛造</span>
        <span className="v affix">素材 ×{B.FORGE_COST} → 隨機部位、隨機品質</span>
      </div>

      <div className="btn-row">
        <button className="btn primary" disabled={!canForge} onClick={() => doForge(1)}>
          開 錘
        </button>
        <button className="btn" disabled={!canForge10} onClick={() => doForge(10)}>
          十 連
        </button>
      </div>

      {results.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>鍛造結果</h3>
          {results.map((e) => (
            <div className="card" key={e.id}>
              <div className="head">
                <b style={{ color: `var(--q-${e.quality})` }}>
                  {QUALITY_NAME[e.quality]}
                  {SLOT_NAME[e.slot]}
                </b>
                <button className="btn" style={{ padding: '5px 10px' }} onClick={() => equip(e.id)}>
                  直接裝備
                </button>
              </div>
              <div className="affix">
                {e.affixes.map((a, i) => (
                  <span key={i}>
                    {i > 0 && ' / '}
                    {AFFIX_NAME[a.type]} +{Math.round(a.value * 100)}%
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <div className="empty">精工鍛造、部位/菁英素材、保底計數為 Phase 2 內容</div>
    </div>
  )
}
