import daggerUrl from '../../../assets/visual/weapons/base-set/dagger.png'
import swordUrl from '../../../assets/visual/weapons/base-set/sword.png'
import woodUrl from '../../../assets/visual/weapons/base-set/wood.png'
import * as B from '../../core/balance'
import { fmt } from '../../core/format'
import { affordableLevels, bulkUpCost, upCost } from '../../core/formulas'
import { critRate, currentDPS, destinyOutcome, dpsBreakdown, goldPerSec, revealStage } from '../../core/game'
import { DESTINY_PATHS } from '../../core/destiny'
import { availableJobs, destinySuffix, JOBS, nextTierJobs } from '../../core/jobs'
import { SKILLS } from '../../core/skills'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { useHold } from '../useHold'

const WEAPON_ART = {
  wood: woodUrl,
  sword: swordUrl,
  dagger: daggerUrl,
}

/** 二轉逐步揭露:輪廓 → 傾向亮起 → 揭露名稱 → 完整預覽 → 可轉職 */
function PromotionSection() {
  const s = useGameState()
  const promote = useGame((st) => st.promote)
  const stage = revealStage(s)
  const outcomes = destinyOutcome(s)
  const canPromote = availableJobs(s.jobId, s.lv, s.destinyPath)
  const suffix = destinySuffix(s.destinyPath)
  const destinyName = s.destinyPath ? DESTINY_PATHS[s.destinyPath].name : null

  // 一轉尚未完成:照舊列出可選職業
  if (JOBS[s.jobId].tier === 0) {
    return (
      <>
        <h3 style={{ marginTop: 16 }}>
          轉 職
          {canPromote.length === 0 && `(Lv.${JOBS.infantry.reqLv} 解鎖,還差 ${JOBS.infantry.reqLv - s.lv} 級)`}
        </h3>
        {nextTierJobs(s.jobId).map((j) => (
          <div className="card" key={j.id}>
            <div className="head">
              <b>{j.name}</b>
              <button className="btn primary" disabled={s.lv < j.reqLv} onClick={() => promote(j.id)}>
                轉職
              </button>
            </div>
            <div className="affix">{j.desc}</div>
            {j.skills.map((sk) => (
              <div className="affix" key={sk} style={{ color: 'var(--text)' }}>
                {SKILLS[sk].icon} {SKILLS[sk].name}:{SKILLS[sk].desc}
              </div>
            ))}
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <h3 style={{ marginTop: 16 }}>二 轉 之 路</h3>

      {stage === 'outline' && (
        <div className="card">
          <div className="affix" style={{ lineHeight: 1.8 }}>
            此職業會因本輪命運,發展出不同的二轉可能。
            <br />
            <span style={{ color: 'var(--dim)' }}>???　???　???</span>
            <br />
            取得命運節點後,方向會開始顯現。
          </div>
        </div>
      )}

      {stage === 'leaning' && (
        <div className="card">
          <div className="affix" style={{ lineHeight: 1.8 }}>
            你的{JOBS[s.jobId].name}正在受到<b style={{ color: 'var(--gold)' }}>{destinyName}命運</b>影響。
            <br />
            <span style={{ color: 'var(--dim)' }}>未知職業:輪廓正在成形</span>
            <br />
            再取得一個命運節點,就會知道自己會變成什麼。
          </div>
        </div>
      )}

      {(stage === 'named' || stage === 'full') &&
        outcomes.map((j) => (
          <div className="card" key={j.id}>
            <div className="head">
              <b style={{ color: j.requiresDestiny ? 'var(--gold)' : undefined }}>
                {j.name}
                {!j.requiresDestiny && suffix}
              </b>
              {s.lv >= j.reqLv ? (
                <button className="btn primary" onClick={() => promote(j.id)}>
                  轉職
                </button>
              ) : (
                <small className="affix">Lv.{j.reqLv}(還差 {j.reqLv - s.lv} 級)</small>
              )}
            </div>
            {j.requiresDestiny && (
              <div className="affix" style={{ color: 'var(--gold)' }}>
                {destinyName}命運限定
              </div>
            )}
            <div className="affix">{j.desc}</div>
            {stage === 'full' &&
              j.skills.map((sk) => (
                <div className="affix" key={sk} style={{ color: 'var(--text)' }}>
                  {SKILLS[sk].icon} {SKILLS[sk].name}:{SKILLS[sk].desc}
                </div>
              ))}
            {stage === 'named' && <div className="affix">接近 Lv.{j.reqLv} 時會顯示完整能力</div>}
          </div>
        ))}
    </>
  )
}

export default function HeroPanel() {
  const s = useGameState()
  const buy = useGame((st) => st.buy)
  const job = JOBS[s.jobId]

  const cost1 = upCost(s.lv)
  const cost10 = bulkUpCost(s.lv, 10)
  const maxN = affordableLevels(s.lv, s.gold)
  const hold1 = useHold(() => buy(1))
  const nextJobs = nextTierJobs(s.jobId)

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

      {nextJobs.length > 0 && <PromotionSection />}
    </div>
  )
}
