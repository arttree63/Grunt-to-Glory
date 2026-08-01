import { Fragment, useState } from 'react'
import * as B from '../../core/balance'
import { fmt, fmtCombat } from '../../core/format'
import {
  activeLegends,
  availableSkills,
  critRate,
  currentDPS,
  destinyNode,
  destinyOutcome,
  dpsBreakdown,
  equippedSkills,
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
import {
  FUSION_SKILLS,
  TRAINING_BRANCHES,
  TRAINING_BRANCH_NAME,
  type TrainingNodeKind,
} from '../../core/trainingTree'
import type { SkillId } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { BadgeIcon, GameIcon } from '../GameIcon'
import TrackPanel from '../TrackPanel'

type HeroView = 'training' | 'blueprint' | 'mercs'

const HERO_VIEWS: Array<{ id: HeroView; label: string; icon: 'hero' | 'judgement' | 'hound' }> = [
  { id: 'training', label: '操練加點', icon: 'hero' },
  { id: 'blueprint', label: '技能樹藍圖', icon: 'judgement' },
  { id: 'mercs', label: '傭兵', icon: 'hound' },
]

const NODE_KIND_NAME: Record<TrainingNodeKind, string> = {
  core: '核心技能',
  active: '主動技能',
  command: '軍團號令',
  legend: '傳奇技能',
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

      <div className="affix" style={{ marginTop: 10 }}>
        天賦配點已由「命運」分頁取代——那裡的選擇是機制而不是數值。
      </div>
    </>
  )
}

// 舊轉職資料保留供存檔相容，不再呈現在玩家介面。
void PromotionSection
void AbilitySections

function SkillTreeBlueprint() {
  const s = useGameState()
  const toggleEquip = useGame((state) => state.toggleSkillEquip)
  const equipped = equippedSkills(s)
  const [replacementSkill, setReplacementSkill] = useState<SkillId | null>(null)
  const skillMeta = (id: SkillId) => TRAINING_BRANCHES
    .flatMap((branch) => branch.nodes.map((node, rowIndex) => ({ branch, node, rowIndex })))
    .find((item) => item.node.skillId === id)

  const replaceEquipped = (current: SkillId) => {
    if (!replacementSkill) return
    toggleEquip(current)
    toggleEquip(replacementSkill)
    setReplacementSkill(null)
  }

  return (
    <div className="training-tree">
      <div className="tree-intro">
        <b>傳 奇 指 揮 官・操 練 樹</b>
        <span>單項達 20／50／100／200 解鎖。學會可以通吃，上場主動技能最多 5 個。</span>
      </div>

      <section className="skill-loadout" aria-label="目前上場技能">
        <div className="skill-loadout-head">
          <b>上 場 技 能</b>
          <span>{equipped.length}/5・點技能格可卸下</span>
        </div>
        <div className="skill-loadout-slots">
          {Array.from({ length: 5 }, (_, index) => {
            const id = equipped[index]
            if (!id) return <div className="loadout-slot empty" key={index}><b>{index + 1}</b><span>空位</span></div>
            const meta = skillMeta(id)!
            return (
              <button
                className={`loadout-slot branch-${meta.branch.id}`}
                style={{ '--branch-color': meta.branch.color } as React.CSSProperties}
                onClick={() => toggleEquip(id)}
                aria-label={`卸下第 ${index + 1} 格 ${meta.node.name}`}
                key={id}
              >
                <span className={`loadout-skill-icon skill-${meta.branch.id}-${meta.rowIndex}`} aria-hidden="true" />
                <b>{index + 1}</b>
                <span>{meta.node.name}</span>
              </button>
            )
          })}
        </div>
        {replacementSkill && (() => {
          const incoming = skillMeta(replacementSkill)!
          return (
            <div className="loadout-replace" role="dialog" aria-label="選擇替換技能">
              <div>
                <b>替換成「{incoming.node.name}」</b>
                <span>請選擇要換掉的技能</span>
              </div>
              <div className="loadout-replace-actions">
                {equipped.map((id, index) => (
                  <button onClick={() => replaceEquipped(id)} key={id}>{index + 1}・{skillMeta(id)!.node.name}</button>
                ))}
                <button className="cancel" onClick={() => setReplacementSkill(null)}>取消</button>
              </div>
            </div>
          )
        })()}
      </section>

      <div className="training-tree-scroll" aria-label="五系操練技能樹，可左右滑動">
        <div className="training-matrix">
          <div className="matrix-corner">階級</div>
          {TRAINING_BRANCHES.map((branch) => {
            const points = s.tracks[branch.id]
            const next = branch.nodes.find((node) => points < node.level)
            return (
              <header
                className={`matrix-branch branch-${branch.id}`}
                style={{ '--branch-color': branch.color } as React.CSSProperties}
                key={branch.id}
              >
                <span className={`tree-branch-icon branch-icon-${branch.id}`} aria-hidden="true" />
                <b>{branch.name}</b>
                <small>{branch.role}</small>
                <strong>{points} 點</strong>
                <div className="branch-progress" aria-label={`${branch.name} ${points} 點`}>
                  <i style={{ width: `${Math.min(100, (points / 200) * 100)}%` }} />
                </div>
                <em>{next ? `差 ${next.level - points} 點` : '已完成'}</em>
              </header>
            )
          })}

          {[20, 50, 100, 200].map((level, rowIndex) => (
            <Fragment key={level}>
              <div className="matrix-level">
                <b>Lv.{level}</b>
                <span>{rowIndex === 0 ? '基礎解鎖' : rowIndex === 1 ? '進階強化' : rowIndex === 2 ? '軍團號令' : '傳奇覺醒'}</span>
              </div>
              {TRAINING_BRANCHES.map((branch) => {
                const node = branch.nodes[rowIndex]
                const points = s.tracks[branch.id]
                const unlocked = B.SKILL_LAB_MODE || points >= node.level
                const isEquipped = equipped.includes(node.skillId)
                const equipFull = equipped.length >= 5 && !isEquipped
                return (
                  <article
                    className={`matrix-node branch-${branch.id}${unlocked ? ' unlocked' : ''}${isEquipped ? ' equipped' : ''}`}
                    style={{ '--branch-color': branch.color } as React.CSSProperties}
                    key={`${branch.id}-${level}`}
                  >
                    <span className={`tree-skill-icon skill-${branch.id}-${rowIndex}`} aria-hidden="true" />
                    <small>{NODE_KIND_NAME[node.kind]}</small>
                    <b>{node.name}</b>
                    <p>{node.desc}</p>
                    <em>{node.level === 20 ? '解鎖' : '進化'}：{node.corps}</em>
                    {unlocked ? (
                      <button
                        className={`node-equip${isEquipped ? ' equipped' : ''}`}
                        onClick={() => {
                          if (isEquipped || !equipFull) toggleEquip(node.skillId)
                          else setReplacementSkill(node.skillId)
                        }}
                      >
                        {isEquipped
                          ? `第 ${equipped.indexOf(node.skillId) + 1} 格・卸下`
                          : equipFull
                            ? '選擇替換'
                            : `裝備到第 ${equipped.length + 1} 格`}
                      </button>
                    ) : (
                      <span className="node-state">{points}/{node.level}</span>
                    )}
                  </article>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="fusion-head">
        <b>共 鳴 技 能</b>
        <span>兩項各達 50 解鎖、100 進化、200 完成最終共鳴；不占主動技能格。</span>
      </div>
      <div className="fusion-grid">
        {FUSION_SKILLS.map((fusion) => {
          const level = Math.min(s.tracks[fusion.tracks[0]], s.tracks[fusion.tracks[1]])
          const stage = level >= 200 ? 3 : level >= 100 ? 2 : level >= 50 ? 1 : 0
          const nextLevel = stage === 0 ? 50 : stage === 1 ? 100 : stage === 2 ? 200 : null
          return (
            <article className={`fusion-card stage-${stage}`} key={fusion.name}>
              <div className="fusion-pair">
                <span className={`mini-branch branch-dot-${fusion.tracks[0]}`} aria-label={TRAINING_BRANCH_NAME[fusion.tracks[0]]} />
                <i>＋</i>
                <span className={`mini-branch branch-dot-${fusion.tracks[1]}`} aria-label={TRAINING_BRANCH_NAME[fusion.tracks[1]]} />
              </div>
              <b>{fusion.name}</b>
              <p>{fusion.desc}</p>
              {stage >= 2 && <small>進化：{fusion.evolved}</small>}
              {stage >= 3 && <small className="final">最終：{fusion.final}</small>}
              <em>{nextLevel ? `兩項各 ${nextLevel} 解鎖下一階・目前 ${level}` : '最終共鳴已完成'}</em>
            </article>
          )
        })}
      </div>
    </div>
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
  const [view, setView] = useState<HeroView>('training')

  return (
    <div className="panel-page hero-page">
      <h3>英 雄</h3>

      <div className="hero-subtabs" role="tablist" aria-label="英雄功能">
        {HERO_VIEWS.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? 'active' : ''}
            role="tab"
            aria-selected={view === item.id}
            onClick={() => setView(item.id)}
          >
            <GameIcon name={item.icon} size={19} />
            {item.label}
          </button>
        ))}
      </div>

      {view === 'training' && (
        <div className="hero-tab-panel" role="tabpanel">
          <TrackPanel />

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
            {dpsBreakdown(s).filter((p) => !p.label.startsWith('戰意')).map((p) => (
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
        </div>
      )}

      {view === 'blueprint' && (
        <div className="hero-tab-panel" role="tabpanel">
          <SkillTreeBlueprint />
        </div>
      )}

      {view === 'mercs' && (
        <div className="hero-tab-panel merc-tab-panel" role="tabpanel">
          <MercSection />
        </div>
      )}
    </div>
  )
}
