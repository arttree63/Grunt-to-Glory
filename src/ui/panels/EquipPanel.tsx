import { DMG_PER_LV } from '../../core/balance'
import {
  AFFIX_NAME,
  equipPower,
  QUALITY_NAME,
  QUALITIES,
  SALVAGE_RETURN,
  SLOT_NAME,
  SLOTS,
  score,
} from '../../core/equipment'
import type { Equipment } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

const qColor = (q: Equipment['quality']) => `var(--q-${q})`

function Affixes({ e }: { e: Equipment }) {
  return (
    <div className="affix">
      {e.affixes.map((a, i) => (
        <span key={i}>
          {i > 0 && ' / '}
          {AFFIX_NAME[a.type]} +{Math.round(a.value * 100)}%
        </span>
      ))}
    </div>
  )
}

export default function EquipPanel() {
  const s = useGameState()
  const equip = useGame((st) => st.equip)
  const unequip = useGame((st) => st.unequip)
  const salvage = useGame((st) => st.salvage)
  const salvageBelow = useGame((st) => st.salvageBelow)

  const power = equipPower(s.equipped)
  const equivLv = Math.log(power) / Math.log(DMG_PER_LV)

  return (
    <div>
      <h3>裝 備</h3>
      <div className="row">
        <span className="k">裝備戰力</span>
        <span className="v">
          ×{power.toFixed(2)}
          <small className="affix"> 相當於 +{Math.round(equivLv)} 級</small>
        </span>
      </div>
      {SLOTS.map((slot) => {
        const e = s.equipped[slot]
        return (
          <div className="row" key={slot}>
            <span className="k">{SLOT_NAME[slot]}</span>
            {e ? (
              <span className="v" style={{ color: qColor(e.quality) }}>
                {QUALITY_NAME[e.quality]}
                <button className="btn" style={{ marginLeft: 8, padding: '4px 8px' }} onClick={() => unequip(slot)}>
                  卸下
                </button>
              </span>
            ) : (
              <span className="v affix">空</span>
            )}
          </div>
        )
      })}

      <h3 style={{ marginTop: 16 }}>背 包({s.inventory.length})</h3>
      {s.inventory.length === 0 && <div className="empty">還沒有裝備,去鐵匠鋪鍛造一件</div>}
      {[...s.inventory]
        .sort((a, b) => score(b) - score(a))
        .map((e) => {
          const cur = s.equipped[e.slot]
          const better = !cur || score(e) > score(cur)
          return (
            <div className="card" key={e.id}>
              <div className="head">
                <b style={{ color: qColor(e.quality) }}>
                  {QUALITY_NAME[e.quality]}
                  {SLOT_NAME[e.slot]}
                  {better && <span style={{ color: '#6dc46d', fontSize: 11 }}> ▲更好</span>}
                </b>
                <span>
                  <button className="btn" style={{ padding: '5px 10px' }} onClick={() => equip(e.id)}>
                    裝備
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '5px 10px', marginLeft: 6 }}
                    onClick={() => salvage(e.id)}
                  >
                    分解 +{SALVAGE_RETURN[e.quality]}
                  </button>
                </span>
              </div>
              <Affixes e={e} />
            </div>
          )
        })}

      {s.inventory.length > 0 && (
        <div className="btn-row">
          <button className="btn" onClick={() => salvageBelow(QUALITIES.indexOf('green'))}>
            一鍵分解「精良」以下
          </button>
          <button className="btn" onClick={() => salvageBelow(QUALITIES.indexOf('blue'))}>
            分解「稀有」以下
          </button>
        </div>
      )}
    </div>
  )
}
