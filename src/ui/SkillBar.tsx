import * as B from '../core/balance'
import { availableSkills, isAwakened, skillCooldown } from '../core/game'
import { DESTINY_NODES } from '../core/destiny'
import { hasNode } from '../core/destiny'
import { JOBS } from '../core/jobs'
import { SKILLS } from '../core/skills'
import type { SkillId } from '../core/types'
import { gameEvents } from '../store/events'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import { BadgeIcon, GameIcon } from './GameIcon'
import { useEffect, useRef, useState } from 'react'

/**
 * 下一格要解鎖什麼。空格不是留白,是預告載體——
 * 「還有東西要來」和「內容沒做完」在畫面上是同一件事,差別只在有沒有寫出來。
 */
function nextUnlock(s: ReturnType<typeof useGameState>): string | null {
  const job = JOBS[s.jobId]
  if (job.tier === 0) return `Lv.${JOBS.infantry.reqLv} 轉職後解鎖`
  if (job.awakenSkill && !isAwakened(s)) {
    // 職業覺醒的雙條件,把還差什麼講清楚
    const needFloor = s.highestFloor < B.AWAKEN_FLOOR
    const needNode = !s.destinyNodes.some((id) => (DESTINY_NODES[id]?.tier ?? 0) > 0)
    if (needFloor && needNode) return `第 ${B.AWAKEN_FLOOR} 層 + 一個命運節點`
    if (needFloor) return `再推進到第 ${B.AWAKEN_FLOOR} 層`
    if (needNode) return '取得第一個命運節點'
  }
  if (job.tier === 1) return `Lv.${JOBS.paladin.reqLv} 二轉後解鎖`
  return null
}

/** 技能列。冷卻用覆蓋層表示,最後一格是下一個解鎖的預告 */
export default function SkillBar() {
  const s = useGameState()
  const cast = useGame((st) => st.castSkill)
  const toggleCharge = useGame((st) => st.toggleCharge)
  const owned = availableSkills(s)
  const preview = nextUnlock(s)
  const slots: Array<SkillId | null> = [...owned]
  const [advancedSkill, setAdvancedSkill] = useState<SkillId | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const off = gameEvents.on((event) => {
      if (event.type !== 'cooldownAdvance' || !event.skillId) return
      setAdvancedSkill(event.skillId)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setAdvancedSkill(null), 360)
    })
    return () => {
      off()
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [])

  return (
    <div className={`skills${s.commandReady ? ' command-ready' : ''}`}>
      {hasNode(s, 'tactician_1b') && (
        <button
          className="skill"
          onClick={toggleCharge}
          title="蓄勢:暫停輸出累積層數,再按一次釋放爆發"
          style={{ color: s.charging ? 'var(--morale-b)' : undefined }}
        >
          <GameIcon name={s.charging ? 'pause' : 'charge'} />
          <span style={{ fontSize: 9, display: 'block', marginTop: -2 }}>蓄勢</span>
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
            className={`skill${advancedSkill === id ? ' cooldown-advanced' : ''}`}
            key={id}
            onClick={() => cast(id)}
            disabled={!ready}
            aria-label={sk.name}
            title={`${sk.name}:${sk.desc}`}
            style={{ position: 'relative', overflow: 'hidden', opacity: ready ? 1 : 0.55 }}
          >
            <GameIcon name={id} />
            {sk.consumesSigils && s.sigils > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--gold)',
                }}
              >
                {s.sigils}
              </span>
            )}
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
            {/* ⚠️ 不能加 ready:一般技能的持續時間短於冷卻,加了等於 buff 期間永遠不亮 */}
            {s.buff?.skillId === id && (
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
          <BadgeIcon kind="lock" />
          {preview}
        </div>
      )}
    </div>
  )
}
