import { useState } from 'react'
import { fmt } from '../core/format'
import { upCost } from '../core/formulas'
import {
  TRACKS,
  TRACK_NAME,
  trackMult,
  trackShare,
} from '../core/game'
import type { TrackId } from '../core/types'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import { GameIcon } from './GameIcon'

/**
 * 操練 = 等級(v4.1 § 3)。**沒有獨立角色等級**:五科點數的總和就是總等級。
 *
 * ⚠️ 分配走的是**有界乘區**不是指數(見 balance.TRACK_MULT_BASE):
 * 這款成長是指數的,讓分配去改指數的話,全押一科與平均分配在第 300 層會差好幾百萬倍。
 * 現在平均分配 = ×1.0(= 改版前的曲線)、全押一科 = ×2.6、完全不點 = ×0.6。
 *
 * 玩家在這裡做的唯一決定是「主修哪一科」——主畫面的投入條會把點數投進去。
 */
const TRACK_DESC: Record<TrackId, { icon: 'hero' | 'legacy' | 'gale' | 'meteor' | 'judgement'; main: string; sub: string }> = {
  arms: { icon: 'hero', main: '攻擊力', sub: '防禦力(減少場上威脅的傷害)' },
  body: { icon: 'legacy', main: '生命上限', sub: '被動回血' },
  agility: { icon: 'gale', main: '爆擊率(全域)', sub: '迴避(整下閃掉威脅)' },
  magic: { icon: 'meteor', main: '魔法攻擊力', sub: 'MP 回復速度' },
  faith: { icon: 'judgement', main: '回血量(觸發式)', sub: 'debuff 抗性' },
}

export default function TrackPanel() {
  const s = useGameState()
  const setFocus = useGame((st) => st.setTrackFocus)
  const buy = useGame((st) => st.buy)
  const [pending, setPending] = useState<TrackId | null>(null)
  const cost = upCost(s.lv)
  const can = s.gold.gte(cost)

  const confirm = () => {
    if (!pending || !can) return
    setFocus(pending)
    buy(1)
    setPending(null)
  }

  return (
    <div className="track-panel">
      <div className={`track-head${pending ? ' pending' : ''}`}>
        <span>{pending ? '待 確 認' : '操 練 配 點'}</span>
        <small>{pending ? `${TRACK_NAME[pending]} +1` : `每點 ${fmt(cost)} 金`}</small>
      </div>

      {TRACKS.map((t) => {
        const info = TRACK_DESC[t]
        const pts = s.tracks[t]
        const share = trackShare(s, t)
        const mult = trackMult(s, t)
        const focused = s.trackFocus === t
        const queued = pending === t
        return (
          <div
            key={t}
            className={`track-card${focused ? ' focused' : ''}${queued ? ' pending' : ''}`}
          >
            <div className="track-title">
              <GameIcon name={info.icon} size={16} />
              <b>{TRACK_NAME[t]}</b>
              <span className="pts">{pts + (queued ? 1 : 0)} 點</span>
              <button
                className="track-plus"
                onClick={() => setPending(queued ? null : t)}
                aria-label={`${queued ? '取消' : '增加'}${TRACK_NAME[t]}一點`}
              >
                +
              </button>
            </div>
            <div className="track-bar">
              <i style={{ width: `${queued ? Math.max(8, Math.round(share * 100)) : Math.round(share * 100)}%` }} />
            </div>
            <small>
              {info.main} ×{mult.toFixed(2)}・{info.sub}
            </small>
          </div>
        )
      })}

      <div className="track-confirm-row">
        <span>{pending ? `${fmt(cost)} 金` : '先選擇一項能力'}</span>
        <button
          className={`track-confirm${pending && can ? ' can' : ''}`}
          onClick={confirm}
          disabled={!pending || !can}
        >
          確認加點
        </button>
      </div>
    </div>
  )
}
