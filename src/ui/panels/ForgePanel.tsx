import { useState } from 'react'
import * as B from '../../core/balance'
import {
  AFFIX_NAME,
  forgeLevel,
  forgeUpgradeChance,
  QUALITY_NAME,
  score,
  SLOT_NAME,
  SLOTS,
} from '../../core/equipment'
import { canFineForge, pityLeft, pityLegendaryLeft } from '../../core/game'
import type { Equipment, Slot } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

export default function ForgePanel() {
  const s = useGameState()
  const forge = useGame((st) => st.forge)
  const fineForge = useGame((st) => st.fineForge)
  const equip = useGame((st) => st.equip)
  const [results, setResults] = useState<Equipment[]>([])
  const [mode, setMode] = useState<'normal' | 'fine'>('normal')
  const [slot, setSlot] = useState<Slot | null>(null)
  const [useElite, setUseElite] = useState(false)

  const fineOpts = { slot: slot ?? undefined, useElite }
  const canFine = canFineForge(s, fineOpts)

  const run = (times: number, fine: boolean) => {
    const out: Equipment[] = []
    for (let i = 0; i < times; i++) {
      const e = fine ? fineForge(fineOpts) : forge()
      if (!e) break
      out.push(e)
    }
    setResults(out.sort((a, b) => score(b) - score(a))) // 最高品質置頂
  }

  // 所見即所得預覽
  const preview = slot
    ? useElite
      ? `將獲得:${SLOT_NAME[slot]}(菁英以上)`
      : `將獲得:隨機${SLOT_NAME[slot]}`
    : useElite
      ? '將獲得:隨機裝備(菁英以上)'
      : '將獲得:隨機裝備'

  return (
    <div>
      <h3>鐵 匠 鋪</h3>

      <div className="row">
        <span className="k">怪物素材</span>
        <span className="v">{s.materials}</span>
      </div>
      <div className="row">
        <span className="k">菁英素材</span>
        <span className="v" style={{ color: s.eliteMaterials > 0 ? 'var(--q-purple)' : undefined }}>
          {s.eliteMaterials}
        </span>
      </div>
      <div className="row">
        <span className="k">部位素材</span>
        <span className="v affix">
          {SLOTS.filter((sl) => s.partMaterials[sl] > 0)
            .map((sl) => `${SLOT_NAME[sl]}×${s.partMaterials[sl]}`)
            .join(' ') || '無(每 10 層 Boss 掉落)'}
        </span>
      </div>
      <div className="row">
        <span className="k">鐵匠鋪等級</span>
        <span className="v">
          Lv.{forgeLevel(s.forgeCount)}
          <small className="affix"> 品質升階 +{Math.round(forgeUpgradeChance(s.forgeCount) * 100)}%</small>
        </span>
      </div>

      <div className="btn-row" style={{ marginBottom: 4 }}>
        <button className={`btn${mode === 'normal' ? ' primary' : ''}`} onClick={() => setMode('normal')}>
          普通鍛造
        </button>
        <button className={`btn${mode === 'fine' ? ' primary' : ''}`} onClick={() => setMode('fine')}>
          精工鍛造
        </button>
      </div>

      {mode === 'normal' ? (
        <>
          <div className="row">
            <span className="k">消耗</span>
            <span className="v affix">怪物素材 ×{B.FORGE_COST} → 隨機部位、隨機品質</span>
          </div>
          <div className="row">
            <span className="k">菁英保底</span>
            <span className="v">
              {pityLeft(s) === 0 ? (
                <b style={{ color: 'var(--q-purple)' }}>下次必出菁英以上</b>
              ) : (
                <>
                  還差 {pityLeft(s)} 次<small className="affix"> / {B.PITY_FORGE}</small>
                </>
              )}
            </span>
          </div>
          <div className="btn-row">
            <button className="btn primary" disabled={s.materials < B.FORGE_COST} onClick={() => run(1, false)}>
              開 錘
            </button>
            <button className="btn" disabled={s.materials < B.FORGE_COST * 10} onClick={() => run(10, false)}>
              十 連
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="row">
            <span className="k">鎖定部位</span>
            <span className="v affix">投入部位素材</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 8 }}>
            {SLOTS.map((sl) => {
              const own = s.partMaterials[sl]
              return (
                <button
                  key={sl}
                  className={`btn${slot === sl ? ' primary' : ''}`}
                  style={{ padding: '8px 2px', fontSize: 11, opacity: own > 0 ? 1 : 0.35 }}
                  disabled={own === 0}
                  onClick={() => setSlot(slot === sl ? null : sl)}
                >
                  {SLOT_NAME[sl]}
                  <br />
                  <small className="affix">{own}</small>
                </button>
              )
            })}
          </div>

          <button
            className={`btn${useElite ? ' primary' : ''}`}
            style={{ width: '100%', opacity: s.eliteMaterials > 0 ? 1 : 0.35 }}
            disabled={s.eliteMaterials === 0}
            onClick={() => setUseElite(!useElite)}
          >
            {useElite ? '● ' : '○ '}投入菁英素材(保證菁英以上)
          </button>

          <div className="card" style={{ marginTop: 10 }}>
            <b style={{ color: useElite ? 'var(--q-purple)' : 'var(--text-strong)' }}>{preview}</b>
            <div className="affix" style={{ marginTop: 4 }}>
              消耗:怪物素材 ×{B.FINE_FORGE_COST}
              {slot && ` + ${SLOT_NAME[slot]}素材 ×1`}
              {useElite && ' + 菁英素材 ×1'}
            </div>
          </div>

          <div className="row">
            <span className="k">傳奇保底</span>
            <span className="v">
              {pityLegendaryLeft(s) === 0 ? (
                <b style={{ color: 'var(--q-gold)' }}>下次必出傳奇以上</b>
              ) : (
                <>
                  還差 {pityLegendaryLeft(s)} 次<small className="affix"> / {B.PITY_LEGENDARY}</small>
                </>
              )}
            </span>
          </div>

          <div className="btn-row">
            <button className="btn primary" disabled={!canFine} onClick={() => run(1, true)}>
              精 工 開 錘
            </button>
            <button
              className="btn"
              disabled={!canFine || s.materials < B.FINE_FORGE_COST * 10}
              onClick={() => run(10, true)}
            >
              十 連
            </button>
          </div>
          {!canFine && <div className="empty">素材不足</div>}
        </>
      )}

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
    </div>
  )
}
