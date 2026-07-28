import { fmt } from '../../core/format'
import { affordableLevels, bulkUpCost, upCost } from '../../core/formulas'
import { currentDPS, goldPerSec } from '../../core/game'
import { JOBS, TIER1_JOBS } from '../../core/jobs'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { useHold } from '../useHold'

export default function HeroPanel() {
  const s = useGameState()
  const buy = useGame((st) => st.buy)
  const promote = useGame((st) => st.promote)
  const job = JOBS[s.jobId]

  const cost1 = upCost(s.lv)
  const cost10 = bulkUpCost(s.lv, 10)
  const maxN = affordableLevels(s.lv, s.gold)
  const hold1 = useHold(() => buy(1))

  return (
    <div>
      <h3>英 雄</h3>
      <div className="row">
        <span className="k">職業</span>
        <span className="v">{job.name}</span>
      </div>
      <div className="row">
        <span className="k">等級</span>
        <span className="v">Lv.{s.lv}</span>
      </div>
      <div className="row">
        <span className="k">DPS</span>
        <span className="v">{fmt(currentDPS(s))}/s</span>
      </div>
      <div className="row">
        <span className="k">金幣收益</span>
        <span className="v">{fmt(goldPerSec(s))}/s</span>
      </div>
      <div className="row">
        <span className="k">戰功勳章</span>
        <span className="v">
          {s.medals} 枚(傷害 +{s.medals * 5}%)
        </span>
      </div>

      <div className="btn-row">
        <button className="btn primary" disabled={s.gold.lt(cost1)} {...hold1}>
          升級 ×1
          <br />
          <small className="affix">{fmt(cost1)} 金</small>
        </button>
        <button className="btn" disabled={s.gold.lt(cost10)} onClick={() => buy(10)}>
          ×10
          <br />
          <small className="affix">{fmt(cost10)} 金</small>
        </button>
        <button className="btn" disabled={maxN === 0} onClick={() => buy('max')}>
          最大 ×{maxN}
          <br />
          <small className="affix">花光金幣</small>
        </button>
      </div>

      {s.jobId === 'rookie' && (
        <>
          <h3 style={{ marginTop: 16 }}>轉 職{s.lv < 20 && `(Lv.20 解鎖,還差 ${20 - s.lv} 級)`}</h3>
          {TIER1_JOBS.map((id) => (
            <div className="card" key={id}>
              <div className="head">
                <b>{JOBS[id].name}</b>
                <button className="btn primary" disabled={s.lv < JOBS[id].reqLv} onClick={() => promote(id)}>
                  轉職
                </button>
              </div>
              <div className="affix">{JOBS[id].desc}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
