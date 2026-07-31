import * as B from '../core/balance'
import { fmt } from '../core/format'
import { upCost } from '../core/formulas'
import {
  TRACKS,
  TRACK_NAME,
  critRate,
  currentDPS,
  defenseCut,
  dodgeRate,
  enduranceMax,
  enduranceRegen,
  trackMult,
  trackShare,
  trackTotal,
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
  body: { icon: 'legacy', main: '耐久上限', sub: '被動回血' },
  agility: { icon: 'gale', main: '爆擊率(全域)', sub: '迴避(整下閃掉威脅)' },
  magic: { icon: 'meteor', main: '魔法攻擊力', sub: 'MP 回復速度' },
  faith: { icon: 'judgement', main: '回血量(觸發式)', sub: 'debuff 抗性' },
}

export default function TrackPanel() {
  const s = useGameState()
  const setFocus = useGame((st) => st.setTrackFocus)
  const buy = useGame((st) => st.buy)
  const total = trackTotal(s)
  const cost = upCost(s.lv)
  const can = s.gold.gte(cost)

  return (
    <div className="track-panel">
      <div className="track-head">
        <span>操 練</span>
        <small>
          總點數 {total}・投一點 {fmt(cost)} 金
        </small>
      </div>

      {TRACKS.map((t) => {
        const info = TRACK_DESC[t]
        const pts = s.tracks[t]
        const share = trackShare(s, t)
        const mult = trackMult(s, t)
        const focused = s.trackFocus === t
        return (
          <button
            key={t}
            className={`track-card${focused ? ' focused' : ''}`}
            onPointerDown={() => setFocus(t)}
          >
            <div className="track-title">
              <GameIcon name={info.icon} size={16} />
              <b>{TRACK_NAME[t]}</b>
              <span className="pts">{pts} 點</span>
              {focused && <span className="focus-tag">主修</span>}
            </div>
            <div className="track-bar">
              <i style={{ width: `${Math.round(share * 100)}%` }} />
            </div>
            <small>
              {info.main} ×{mult.toFixed(2)}・{info.sub}
            </small>
          </button>
        )
      })}

      <button
        className={`btn primary track-invest${can ? ' can' : ''}`}
        onPointerDown={() => buy(1)}
        disabled={!can}
      >
        投一點進「{TRACK_NAME[s.trackFocus]}」・{fmt(cost)} 金
      </button>

      <div className="track-stats">
        <div className="row">
          <span className="k">攻擊力</span>
          <span className="v">{fmt(currentDPS(s))} / 秒</span>
        </div>
        <div className="row">
          <span className="k">耐久上限</span>
          <span className="v">{fmt(enduranceMax(s))}</span>
        </div>
        <div className="row">
          <span className="k">爆擊率</span>
          <span className="v">{Math.round(critRate(s) * 100)}%</span>
        </div>
        <div className="row">
          <span className="k">防禦力</span>
          <span className="v">減傷 {Math.round(defenseCut(s) * 100)}%</span>
        </div>
        <div className="row">
          <span className="k">迴避</span>
          <span className="v">{Math.round(dodgeRate(s) * 100)}%</span>
        </div>
        <div className="row">
          <span className="k">被動回血</span>
          <span className="v">每秒 {(enduranceRegen(s) * 100).toFixed(1)}%</span>
        </div>
      </div>
      <small className="track-note">
        全押一科 ×{(B.TRACK_MULT_BASE + B.TRACK_MULT_SPAN).toFixed(1)}、平均分配 ×1.0、完全不點 ×
        {B.TRACK_MULT_BASE.toFixed(1)}。退役重練會把點數全部收回重分配。
      </small>
    </div>
  )
}
