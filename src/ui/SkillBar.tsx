import { skillCooldown } from '../core/game'
import { hasNode } from '../core/destiny'
import { JOBS } from '../core/jobs'
import { SKILLS } from '../core/skills'
import type { SkillId } from '../core/types'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'

/**
 * 下一格要解鎖什麼。空格不是留白,是預告載體——
 * 「還有東西要來」和「內容沒做完」在畫面上是同一件事,差別只在有沒有寫出來。
 */
function nextUnlock(s: ReturnType<typeof useGameState>): string | null {
  const job = JOBS[s.jobId]
  if (job.tier === 0) return `Lv.${JOBS.infantry.reqLv} 轉職後解鎖`
  if (job.tier === 1) return `Lv.${JOBS.paladin.reqLv} 二轉後解鎖`
  return null
}

/** 技能列。冷卻用覆蓋層表示,最後一格是下一個解鎖的預告 */
export default function SkillBar() {
  const s = useGameState()
  const cast = useGame((st) => st.castSkill)
  const toggleCharge = useGame((st) => st.toggleCharge)
  const owned = JOBS[s.jobId].skills
  const preview = nextUnlock(s)
  const slots: Array<SkillId | null> = [...owned]

  return (
    <div className="skills">
      {hasNode(s, 'tactician_1b') && (
        <button
          className="skill"
          onClick={toggleCharge}
          title="蓄勢:暫停輸出累積層數,再按一次釋放爆發"
          style={{ color: s.charging ? 'var(--morale-b)' : undefined }}
        >
          {s.charging ? '⏸' : '⚡'}
        </button>
      )}
      {slots.map((id, i) => {
        if (!id) return <div className="skill locked" key={i} />
        const sk = SKILLS[id]
        const left = s.skillCd[id] ?? 0
        const ready = left <= 0
        const pct = ready ? 0 : left / skillCooldown(s, id)
        return (
          <button
            className="skill"
            key={id}
            onClick={() => cast(id)}
            disabled={!ready}
            title={`${sk.name}:${sk.desc}`}
            style={{ position: 'relative', overflow: 'hidden', opacity: ready ? 1 : 0.55 }}
          >
            {sk.icon}
            {!ready && (
              <>
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: `${pct * 100}%`,
                    background: '#0009',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#f0e8d8',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.ceil(left)}
                </span>
              </>
            )}
            {ready && s.buff?.skillId === id && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '2px solid var(--morale-b)',
                  borderRadius: 12,
                  pointerEvents: 'none',
                }}
              />
            )}
          </button>
        )
      })}

      {preview && (
        <div
          className="skill locked"
          style={{ fontSize: 9, lineHeight: 1.3, textAlign: 'center', padding: 4, opacity: 0.6 }}
        >
          {preview}
        </div>
      )}
    </div>
  )
}
