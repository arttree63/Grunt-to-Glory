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
  const toggleAutoCast = useGame((st) => st.toggleAutoCast)
  const owned = availableSkills(s)
  const preview = nextUnlock(s)
  const slots: Array<SkillId | null> = [...owned]
  const [advancedSkill, setAdvancedSkill] = useState<SkillId | null>(null)
  const [detailSkill, setDetailSkill] = useState<SkillId | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressClick = useRef<SkillId | null>(null)

  useEffect(() => {
    const off = gameEvents.on((event) => {
      if (event.type !== 'cooldownAdvance' || !event.skillId) return
      setAdvancedSkill(event.skillId)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setAdvancedSkill(null), 900)
    })
    return () => {
      off()
      if (flashTimer.current) clearTimeout(flashTimer.current)
      if (holdTimer.current) clearTimeout(holdTimer.current)
    }
  }, [])

  const startInspect = (id: SkillId) => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    suppressClick.current = null
    holdTimer.current = setTimeout(() => {
      suppressClick.current = id
      setDetailSkill(id)
    }, 450)
  }

  const endInspect = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }

  // 總攻就緒:兩招以上全部轉好 → 整排金光,提示玩家「留著一起放」(v1.6)
  const allReady = owned.length >= 2 && owned.every((id) => (s.skillCd[id] ?? 0) <= 0)

  return (
    <div className={`skills${s.commandReady ? ' command-ready' : ''}${allReady ? ' all-ready' : ''}`}>
      {detailSkill && (
        <div className="skill-info" role="dialog" aria-label={`${SKILLS[detailSkill].name}技能說明`}>
          <div className="head">
            <b><GameIcon name={detailSkill} size={17} /> {SKILLS[detailSkill].name}</b>
            <button className="btn" onClick={() => setDetailSkill(null)}>關閉</button>
          </div>
          <div>{SKILLS[detailSkill].desc}</div>
          <small>
            冷卻 {Math.round(skillCooldown(s, detailSkill))} 秒
            {SKILLS[detailSkill].consumesSigils &&
              `・零印記也可施放：${B.SIGIL_BASE_BURST_SEC} 秒份傷害；每枚${SKILLS[detailSkill].sigilName}再加 ${B.SIGIL_BURST_SEC} 秒份`}
          </small>
          {SKILLS[detailSkill].consumesSigils && (
            <small>
              每 {B.PASSIVE_KILLS_PER_SIGIL} 次擊殺自然獲得 1 枚；第一技能視窗、命運與傭兵可加速累積
            </small>
          )}
        </div>
      )}
      {owned.length > 0 && (
        <button
          className={`skill skill-auto${s.autoCast ? ' is-on' : ''}`}
          onClick={toggleAutoCast}
          aria-label={s.autoCast ? '關閉自動施放' : '開啟自動施放'}
          title={
            s.autoCast
              ? '自動施放:開。冷卻好就放,消耗印記型等滿層'
              : '自動施放:關。技能要自己按'
          }
          style={{
            color: s.autoCast ? 'var(--gold)' : undefined,
            borderColor: s.autoCast ? 'var(--gold)' : undefined,
          }}
        >
          <GameIcon name={s.autoCast ? 'autoCast' : 'manualCast'} />
          <span style={{ fontSize: 9, display: 'block', marginTop: -2 }}>
            {s.autoCast ? '自動' : '手動'}
          </span>
        </button>
      )}
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
            onPointerDown={() => startInspect(id)}
            onPointerUp={endInspect}
            onPointerCancel={endInspect}
            onPointerLeave={endInspect}
            onContextMenu={(event) => {
              event.preventDefault()
              endInspect()
              setDetailSkill(id)
            }}
            onClick={() => {
              if (suppressClick.current === id) {
                suppressClick.current = null
                return
              }
              if (ready) cast(id)
            }}
            aria-disabled={!ready}
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
            {s.buffs.some((b) => b.skillId === id) && (
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
