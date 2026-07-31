import * as B from '../core/balance'
import {
  availableSkills,
  isApexSkill,
  mpCost,
  sigilPerStackSeconds,
  skillCooldown,
  skillReady,
} from '../core/game'
import { hasNode } from '../core/destiny'
import { SKILLS } from '../core/skills'
import type { SkillId } from '../core/types'
import { gameEvents } from '../store/events'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import { GameIcon } from './GameIcon'
import { useEffect, useRef, useState } from 'react'

/** 技能列。冷卻用覆蓋層表示；未解鎖技能留在英雄頁預告，不占用戰鬥操作區。 */
export default function SkillBar() {
  const s = useGameState()
  const cast = useGame((st) => st.castSkill)
  const toggleCharge = useGame((st) => st.toggleCharge)
  const toggleAutoCast = useGame((st) => st.toggleAutoCast)
  const owned = availableSkills(s)
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
  const allReady = owned.length >= 2 && owned.every((id) => skillReady(s, id))
  if (owned.length === 0 && !hasNode(s, 'tactician_1b')) return null

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
            {isApexSkill(s, detailSkill)
              ? `冷卻 ${Math.round(skillCooldown(s, detailSkill))} 秒`
              : `法力 ${Math.round(mpCost(s, detailSkill))}・保底冷卻 ${B.MP_MIN_CD} 秒`}
            {SKILLS[detailSkill].consumesSigils &&
              `・零印記也可施放：${B.SIGIL_BASE_BURST_SEC} 秒份傷害；每枚${SKILLS[detailSkill].sigilName}再加 ${sigilPerStackSeconds(s).toFixed(1)} 秒份`}
          </small>
          {SKILLS[detailSkill].consumesSigils && (
            <small>
              每 {B.PASSIVE_KILLS_PER_SIGIL} 次擊殺自然獲得 1 枚；第一技能視窗、命運與傭兵可加速累積
            </small>
          )}
        </div>
      )}
      {/* 施放模式是戰鬥設定,不是技能:改扁平開關,不與技能格同視覺權重(UX 回饋 P1-6) */}
      {owned.length > 0 && (
        <button
          className={`skill-mode${s.autoCast ? ' is-on' : ''}`}
          onClick={toggleAutoCast}
          aria-label={s.autoCast ? '關閉自動施放' : '開啟自動施放'}
          title={s.autoCast ? '自動施放:開。冷卻好就放,消耗印記型等滿層' : '自動施放:關。技能要自己按'}
        >
          <GameIcon name={s.autoCast ? 'autoCast' : 'manualCast'} size={13} />
          <span className={`opt${!s.autoCast ? ' on' : ''}`}>手動</span>
          <span className={`opt${s.autoCast ? ' on' : ''}`}>自動</span>
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
        // v4.1:前三格吃 MP、頂點技能吃 CD —— 一律問 core 的 skillReady,UI 不自己判
        const ready = skillReady(s, id)
        const apex = isApexSkill(s, id)
        const cost = mpCost(s, id)
        const pct = apex
          ? left > 0 ? left / skillCooldown(s, id) : 0
          : Math.max(left > 0 ? left / B.MP_MIN_CD : 0, cost > 0 ? Math.max(0, 1 - s.mp / cost) : 0)
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
                  {apex || left > 0 ? Math.ceil(left) : `缺 ${Math.ceil(cost - s.mp)}`}
                </span>
              </>
            )}
            {/* 長按查說明的可發現性:右下角一顆小 i(手機沒有 hover,title 不算載體) */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: 3,
                bottom: 1,
                fontSize: 9,
                fontStyle: 'italic',
                fontFamily: 'serif',
                color: 'var(--dim2, #9a8fb0)',
                pointerEvents: 'none',
              }}
            >
              i
            </span>
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
    </div>
  )
}
