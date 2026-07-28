import { useState } from 'react'
import * as B from '../../core/balance'
import { QUALITY_POWER } from '../../core/balance'
import { QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import { heirloomCandidates, pendingMedals } from '../../core/game'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

export default function ShopPanel() {
  const s = useGameState()
  const prestige = useGame((st) => st.prestige)
  const [confirm, setConfirm] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const gain = pendingMedals(s)
  const candidates = heirloomCandidates(s)

  return (
    <div>
      <h3>退 役 / 傳 承</h3>
      <div className="row">
        <span className="k">本代最高層數</span>
        <span className="v">{s.highestFloor} 層</span>
      </div>
      <div className="row">
        <span className="k">退役可得勳章</span>
        <span className="v gold" style={{ color: 'var(--gold)' }}>
          {gain} 枚
        </span>
      </div>
      <div className="row">
        <span className="k">已有勳章</span>
        <span className="v">{s.medals} 枚</span>
      </div>
      <div className="row">
        <span className="k">勳章效果</span>
        <span className="v affix">
          每枚 傷害 +{B.MEDAL_DMG * 100}% / 開局 +{B.MEDAL_START_GOLD} 金
        </span>
      </div>
      <div className="row">
        <span className="k">第幾代</span>
        <span className="v">第 {s.runs + 1} 代</span>
      </div>

      {!confirm ? (
        <div className="btn-row">
          <button className="btn primary" disabled={gain <= 0} onClick={() => setConfirm(true)}>
            {gain > 0 ? `退役,傳承給下一代(+${gain} 枚)` : '至少推進到 10 層才能退役'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="affix" style={{ marginBottom: 8, lineHeight: 1.7 }}>
            退役後等級、金幣、素材歸零,換得 {gain} 枚戰功勳章永久加成。
            <br />
            可指定 {B.HEIRLOOM_SLOTS} 件裝備當「傳家寶」帶給下一代。
          </div>

          <h3 style={{ fontSize: 13, marginTop: 10 }}>選擇傳家寶</h3>
          {candidates.length === 0 && <div className="empty">沒有裝備可以傳承</div>}
          {candidates.slice(0, 8).map((e) => {
            const on = picked.includes(e.id)
            return (
              <button
                key={e.id}
                className="row"
                style={{ width: '100%', textAlign: 'left', opacity: on ? 1 : 0.6 }}
                onClick={() => setPicked(on ? [] : [e.id])}
              >
                <span style={{ color: `var(--q-${e.quality})` }}>
                  {on ? '● ' : '○ '}
                  {QUALITY_NAME[e.quality]}
                  {SLOT_NAME[e.slot]}
                </span>
                <span className="affix">×{QUALITY_POWER[e.quality]}</span>
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

      <div className="empty">勳章商店(兌換傭兵徽章、菁英素材、離線上限)為 Phase 2 內容</div>
    </div>
  )
}
