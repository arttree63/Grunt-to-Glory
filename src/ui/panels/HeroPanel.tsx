import daggerUrl from '../../../assets/visual/weapons/base-set/dagger.png'
import swordUrl from '../../../assets/visual/weapons/base-set/sword.png'
import woodUrl from '../../../assets/visual/weapons/base-set/wood.png'
import * as B from '../../core/balance'
import { fmt, fmtCombat } from '../../core/format'
import { affordableLevels, bulkUpCost, upCost } from '../../core/formulas'
import {
  activeLegends,
  availableSkills,
  critRate,
  currentDPS,
  destinyNode,
  destinyOutcome,
  dpsBreakdown,
  goldPerSec,
  isAwakened,
  bestFloorEver,
  revealStage,
  skillEvolve,
  setProgress,
  skillCooldown,
} from '../../core/game'
import { LEGENDS } from '../../core/legends'
import { ALL_MERCS, unlockedMercs } from '../../core/mercs'
import { SETS } from '../../core/sets'
import { DESTINY_PATHS } from '../../core/destiny'
import { availableJobs, destinySuffix, JOBS, nextTierJobs } from '../../core/jobs'
import { SKILLS } from '../../core/skills'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { useHold } from '../useHold'
import { BadgeIcon, GameIcon } from '../GameIcon'
import TrainingCard from '../TrainingChoice'
import TrackPanel from '../TrackPanel'

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
          {canPromote.length === 0 && `(總等級 ${JOBS.infantry.reqLv} 解鎖,還差 ${JOBS.infantry.reqLv - s.lv} 點操練)`}
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
                <GameIcon name={sk} size={15} /> {SKILLS[sk].name}:{SKILLS[sk].desc}
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
                <small className="affix">總等級 {j.reqLv}(還差 {j.reqLv - s.lv} 點操練)</small>
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
                  <GameIcon name={sk} size={15} /> {SKILLS[sk].name}:{SKILLS[sk].desc}
                </div>
              ))}
            {/* Lv.100 一次給三層:新主動 + 新被動 + 既有技能進化,第三層要在預覽時就看得到 */}
            {stage === 'full' && j.evolve && (
              <div className="affix" style={{ color: 'var(--gold)' }}>
                ▲ {j.evolve.name}:{j.evolve.desc}
              </div>
            )}
            {stage === 'named' && <div className="affix">接近總等級 {j.reqLv} 時會顯示完整能力</div>}
          </div>
        ))}
    </>
  )
}

/**
 * 能力四區(clicker-ui § 七之二)。⚠️ 這一塊之前整塊沒做,
 * 導致玩家轉職後**全遊戲沒有任何地方**能查自己的技能與被動在幹嘛
 * (技能說明只存在於技能列的 title,手機沒有 hover)。
 */
function AbilitySections() {
  const s = useGameState()
  const job = JOBS[s.jobId]
  const skills = availableSkills(s)
  const nodes = s.destinyNodes.map((id) => destinyNode(id)).filter(Boolean)
  const legends = activeLegends(s)
  const sets = setProgress(s).filter((p) => p.count >= 2)

  const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
    <>
      <div className="row" style={{ marginTop: 10 }}>
        <span className="k" style={{ color: 'var(--text-strong)' }}>{title}</span>
        <span className="v">{count}</span>
      </div>
      {children}
    </>
  )
  const Line = ({ name, desc, icon }: { name: string; desc: string; icon?: React.ReactNode }) => (
    <div style={{ padding: '2px 0 4px 8px' }}>
      <div className="icon-line" style={{ fontSize: 12, color: 'var(--text-strong)' }}>{icon}{name}</div>
      <div className="affix">{desc}</div>
    </div>
  )

  return (
    <>
      <Section title="主動技能" count={skills.length}>
        {skills.length === 0 && <div className="affix" style={{ paddingLeft: 8 }}>總等級 20 轉職後獲得第一個技能</div>}
        {skills.map((id) => {
          const evo = skillEvolve(s)
          return (
            <div key={id}>
              <Line
                name={SKILLS[id].name}
                icon={<GameIcon name={id} size={16} />}
                desc={`${SKILLS[id].desc}・冷卻 ${Math.round(skillCooldown(s, id))}s`}
              />
              {evo?.skill === id && (
                <div className="tier3" style={{ paddingLeft: 8, color: 'var(--gold)' }}>
                  ▲ {evo.name}:{evo.desc}
                </div>
              )}
            </div>
          )
        })}
        {JOBS[s.jobId].awakenSkill && !isAwakened(s) && (
          <div className="affix" style={{ paddingLeft: 8 }}>
            職業覺醒後解鎖第二技能:抵達第 {B.AWAKEN_FLOOR} 層 + 取得一個命運節點
          </div>
        )}
      </Section>

      <Section title="戰鬥法則" count={job.tier > 0 ? 1 : 0}>
        {job.tier > 0 ? (
          <Line name={job.name} desc={job.desc} />
        ) : (
          <div className="affix" style={{ paddingLeft: 8 }}>轉職後獲得職業的核心被動</div>
        )}
      </Section>

      <Section title="命運刻印" count={nodes.length}>
        {nodes.length === 0 && <div className="affix" style={{ paddingLeft: 8 }}>到「命運」分頁選一條路</div>}
        {nodes.map((n) => (
          <Line key={n!.id} name={n!.name} desc={n!.desc} />
        ))}
      </Section>

      <Section title="裝備機制" count={legends.length + sets.length}>
        {legends.length + sets.length === 0 && (
          <div className="affix" style={{ paddingLeft: 8 }}>
            傳說裝與套裝標籤會改變技能的運作方式,到鐵匠鋪精工鍛造
          </div>
        )}
        {legends.map((id) => (
          <Line key={id} name={LEGENDS[id].name} icon={<BadgeIcon kind="legend" />} desc={LEGENDS[id].effect} />
        ))}
        {sets.map((p) => (
          <Line
            key={p.tag}
            name={`${SETS[p.tag].name} ${p.count}/3`}
            icon={<BadgeIcon kind="set" />}
            desc={p.count >= 3 ? SETS[p.tag].three : SETS[p.tag].two}
          />
        ))}
      </Section>

      <Section title="傭兵" count={s.activeMerc ? 1 : 0}>
        <MercSection />
      </Section>

      <div className="affix" style={{ marginTop: 10 }}>
        天賦配點已由「命運」分頁取代——那裡的選擇是機制而不是數值。
      </div>
    </>
  )
}

/**
 * 傭兵區(v1.5 § 五):同時 1 隻、招牌行為 8~15 秒一次、傷害占比 ≤15%。
 * 解鎖走歷代最高層(跨轉生)——推進本身就是收集傭兵的進度。
 */
function MercSection() {
  const s = useGameState()
  const setMerc = useGame((st) => st.setActiveMerc)
  const unlocked = unlockedMercs(bestFloorEver(s))

  return (
    <>
      {ALL_MERCS.map((m) => {
        const owned = unlocked.includes(m.id)
        const active = s.activeMerc === m.id
        return (
          <div key={m.id} style={{ padding: '2px 0 4px 8px', opacity: owned ? 1 : 0.5 }}>
            <div className="row" style={{ border: 'none', padding: 0 }}>
              <span className="k" style={{ color: owned ? 'var(--text-strong)' : undefined }}>
                <span className="icon-line"><GameIcon name={m.id} size={17} />{m.name}</span>
                <small className="affix"> {m.archetype}型</small>
              </span>
              <span className="v">
                {owned ? (
                  <button
                    className={`btn${active ? ' primary' : ''}`}
                    style={{ padding: '6px 12px', minHeight: 32 }}
                    aria-label={`${m.name}${active ? '退場' : '出戰'}`}
                    onClick={() => setMerc(active ? null : m.id)}
                  >
                    {active ? '出戰中' : '出戰'}
                  </button>
                ) : (
                  <small className="affix">歷代最高到第 {m.unlockFloor} 層解鎖</small>
                )}
              </span>
            </div>
            <div className="tier3">{owned ? m.signature : '???'}</div>
          </div>
        )
      })}
      <div className="tier3" style={{ paddingLeft: 8 }}>
        同時只能帶 1 隻。傭兵每 8~15 秒發動一次招牌行為,不做普攻。
      </div>
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
  const canPromoteNow = availableJobs(s.jobId, s.lv, s.destinyPath).length > 0
  const roleLabel = job.tier === 0 ? '巡守型' : job.tier === 1 ? '轉職兵種' : '進階兵種'

  return (
    <div className="panel-page hero-page">
      <h3>英 雄</h3>
      <div className="hero-identity">
        <img
          className="hero-weapon"
          src={WEAPON_ART[job.look.weapon]}
          alt={`${job.name}武器`}
          draggable={false}
        />
        <div className="hero-copy">
          <small>目前職業</small>
          <div className="hero-name-line">
            <b>{job.name}</b>
            <span className="role-chip">{roleLabel}</span>
          </div>
          <div className="hero-level-line">
            <strong>總等級 {s.lv}</strong>
            <span>下一級 {fmt(cost1)} 金</span>
          </div>
          <span>{job.desc}</span>
        </div>
      </div>
      {/* ⚠️ 可轉職時置頂:曾經被四區能力+傭兵區推到兩屏之下,
          玩家到 Lv.20 開英雄頁看不到轉職,回報成「20 級不能轉職」 */}
      {canPromoteNow && <PromotionSection />}

      {/* 操練 = 等級(v4.1 § 3):五科分配是這一代最核心的決定,排在所有數值之前 */}
      <TrackPanel />

      {/* 操練令是本輪構築的一部分,排在原始數值之前;版位固定不隨待辦數移動 */}
      <TrainingCard />

      <div className="hero-stats">
        <div>
          <small>DPS</small>
          <b>{fmtCombat(currentDPS(s))}/s</b>
        </div>
        <div>
          <small>暴擊率</small>
          <b>{Math.round(critRate(s) * 100)}%</b>
        </div>
        <div>
          <small>金幣收益</small>
          <b>{fmt(goldPerSec(s))}/s</b>
        </div>
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
      <div className="medal-card">
        <span>
          <small>戰功勳章</small>
          <b>{s.medals} 枚</b>
        </span>
        <span>到「傳承」分頁的軍需處購買科技</span>
      </div>

      <div className="btn-row upgrade-row">
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

      <AbilitySections />

      {/* 沒有可轉職時,轉職預覽留在底部(逐步揭露用) */}
      {nextJobs.length > 0 && !canPromoteNow && <PromotionSection />}
    </div>
  )
}
