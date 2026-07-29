import daggerUrl from '../../../assets/visual/weapons/base-set/dagger.png'
import swordUrl from '../../../assets/visual/weapons/base-set/sword.png'
import woodUrl from '../../../assets/visual/weapons/base-set/wood.png'
import * as B from '../../core/balance'
import { fmt } from '../../core/format'
import { affordableLevels, bulkUpCost, upCost } from '../../core/formulas'
import { critRate, currentDPS, dpsBreakdown, goldPerSec } from '../../core/game'
import { availableJobs, JOBS, nextTierJobs } from '../../core/jobs'
import { SKILLS } from '../../core/skills'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { useHold } from '../useHold'

const WEAPON_ART = {
  wood: woodUrl,
  sword: swordUrl,
  dagger: daggerUrl,
}

export default function HeroPanel() {
  const s = useGameState()
  const buy = useGame((st) => st.buy)
  const promote = useGame((st) => st.promote)
  const job = JOBS[s.jobId]

  const cost1 = upCost(s.lv)
  const cost10 = bulkUpCost(s.lv, 10)
  const maxN = affordableLevels(s.lv, s.gold)
  const hold1 = useHold(() => buy(1))
  const nextJobs = nextTierJobs(s.jobId)
  const canPromote = availableJobs(s.jobId, s.lv)

  return (
    <div>
      <h3>英 雄</h3>
      <div className="hero-identity">
        <img
          className="hero-weapon"
          src={WEAPON_ART[job.look.weapon]}
          alt={`${job.name}武器`}
          draggable={false}
        />
        <div>
          <small>目前職業</small>
          <b>{job.name}</b>
          <span>{job.desc}</span>
        </div>
      </div>
      <div className="row">
        <span className="k">等級</span>
        <span className="v">Lv.{s.lv}</span>
      </div>
      <div className="row">
        <span className="k">DPS</span>
        <span className="v">{fmt(currentDPS(s))}/s</span>
      </div>
      <details style={{ margin: '2px 0 6px' }}>
        <summary className="affix" style={{ cursor: 'pointer', padding: '4px 0' }}>
          傷害來自哪裡?
        </summary>
        {dpsBreakdown(s).map((p) => (
          <div className="row" key={p.label} style={{ paddingLeft: 8 }}>
            <span className="k">{p.label}</span>
            <span className="v" style={{ color: p.mult > 1 ? 'var(--gold)' : 'var(--dim)' }}>
              ×{p.mult < 100 ? p.mult.toFixed(2) : fmt(p.mult)}
            </span>
          </div>
        ))}
        <div className="affix" style={{ padding: '6px 0 0 8px' }}>
          全部相乘 × 基礎 {B.BASE_DPS} = 目前 DPS
        </div>
      </details>
      <div className="row">
        <span className="k">暴擊率</span>
        <span className="v">{Math.round(critRate(s) * 100)}%</span>
      </div>
      <div className="row">
        <span className="k">金幣收益</span>
        <span className="v">{fmt(goldPerSec(s))}/s</span>
      </div>
      <div className="row">
        <span className="k">戰功勳章</span>
        <span className="v">{s.medals} 枚(到商店買科技)</span>
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

      <div className="empty" style={{ textAlign: 'left', lineHeight: 1.7 }}>
        天賦配點已由「命運」分頁的命運樹取代——那裡的選擇是機制而不是數值。
      </div>

      {nextJobs.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>
            轉 職
            {canPromote.length === 0 && `(Lv.${nextJobs[0].reqLv} 解鎖,還差 ${nextJobs[0].reqLv - s.lv} 級)`}
          </h3>
          {nextJobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="head">
                <b>{j.name}</b>
                <button
                  className="btn primary"
                  disabled={s.lv < j.reqLv}
                  onClick={() => promote(j.id)}
                >
                  轉職
                </button>
              </div>
              <div className="affix">{j.desc}</div>
              {j.skills.map((sk) => (
                <div className="affix" key={sk} style={{ color: 'var(--text)' }}>
                  {SKILLS[sk].icon} {SKILLS[sk].name}:{SKILLS[sk].desc}(冷卻 {SKILLS[sk].cd}s)
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
