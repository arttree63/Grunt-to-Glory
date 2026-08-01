import { useState } from 'react'
import * as B from '../../core/balance'
import { hasNode } from '../../core/destiny'
import { ENCOUNTERS } from '../../core/encounters'
import { legacyGoal, nearGoal, runGoal } from '../../core/goals'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import ResultReveal from '../ResultReveal'

/**
 * 旅途紀錄。留存事件不限時,掛機也不會錯過,回來再處理。
 * 命運相關的分支只放這裡。
 */
export default function JournalPanel() {
  const s = useGameState()
  const resolve = useGame((st) => st.resolveEncounter)
  const barter = useGame((st) => st.barterForDestiny)
  const [reveal, setReveal] = useState<string | null>(null)

  const canBarter =
    hasNode(s, 'hunter_2b') &&
    s.barterUsed < B.BARTER_MAX_PER_RUN &&
    s.eventKindsDone.length > 0 &&
    s.destinyPoints < B.DESTINY_POINT_CAP

  const near = nearGoal(s)
  const visibleNear = near?.tab === 'destiny' ? null : near

  return (
    <div>
      <h3>目 標</h3>
      {/* 「差一點」三層收斂:近期/本輪/跨輪各一個,其餘的「還差 N」留在各自面板裡 */}
      <div className="row">
        <span className="k">現在</span>
        <span className="v">{visibleNear ? visibleNear.text : '繼續推進,守關者見真章'}</span>
      </div>
      <div className="row">
        <span className="k">本輪</span>
        <span className="v">{runGoal(s).text}</span>
      </div>
      <div className="row">
        <span className="k">世代</span>
        <span className="v">{legacyGoal(s).text}</span>
      </div>

      <h3 style={{ marginTop: 16 }}>旅 途 紀 錄</h3>

      {s.routeBuff && (
        <div className="row">
          <span className="k">岔路增益</span>
          <span className="v" style={{ color: 'var(--gold)' }}>
            {s.routeBuff.kind === 'material' ? '素材' : '金幣'} ×{B.ROUTE_BUFF_MULT}
            <small className="affix"> 還剩 {s.routeBuff.floorsLeft} 層</small>
          </span>
        </div>
      )}

      {s.encounters.length === 0 && (
        <div className="empty">路上還沒遇到什麼。每隔約 {B.ENCOUNTER_EVERY_FLOORS} 層會有一次際遇,不限時、不會錯過。</div>
      )}

      {s.encounters.map((e) => {
        const enc = ENCOUNTERS[e.id]
        return (
          <div className="card" key={`${e.id}-${e.floor}`}>
            <div className="head">
              <b>{enc.name}</b>
              <small className="affix">第 {e.floor} 層</small>
            </div>
            <div className="affix" style={{ lineHeight: 1.7, marginBottom: 8 }}>
              {enc.text}
            </div>
            <div className="btn-row">
              {enc.choices.map((c) => (
                <button
                  key={c.id}
                  className="btn primary"
                  onClick={() => {
                    if (resolve(e.id, c.id)) setReveal(c.desc)
                  }}
                >
                  {c.label}
                  <br />
                  <small className="affix">{c.desc}</small>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {false && hasNode(s, 'hunter_2b') && (
        <>
          <h3 style={{ marginTop: 16 }}>命 運 交 易</h3>
          <div className="card">
            <div className="head">
              <b>用本輪的事件收穫換一枚命運點</b>
              <button className="btn primary" disabled={!canBarter} onClick={barter}>
                交易
              </button>
            </div>
            <div className="affix">
              交易會清空「本輪完成過的事件種類」(黃金路線的進度也會歸零),換來一枚命運點。
            </div>
            <div className="affix" style={{ marginTop: 4 }}>
              本輪已用 {s.barterUsed} / {B.BARTER_MAX_PER_RUN} 次
              {/* disabled 時一定要說出是哪個條件沒過,不然按鈕變灰玩家只會困惑 */}
              {s.barterUsed >= B.BARTER_MAX_PER_RUN
                ? '・本輪次數已用完'
                : s.eventKindsDone.length === 0
                  ? '・需要先完成一次事件'
                  : s.destinyPoints >= B.DESTINY_POINT_CAP
                    ? `・命運點已滿 ${B.DESTINY_POINT_CAP} 枚,先去命運頁花掉`
                    : ''}
            </div>
          </div>
        </>
      )}

      {reveal && (
        <ResultReveal
          items={['金幣', '怪物素材', '菁英素材', '路線增益']}
          result={reveal}
          tone="gold"
          onDone={() => setReveal(null)}
        />
      )}
    </div>
  )
}
