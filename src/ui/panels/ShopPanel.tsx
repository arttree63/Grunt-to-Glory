import { useState } from 'react'
import * as B from '../../core/balance'
import { QUALITY_POWER } from '../../core/balance'
import { QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import { heirloomCandidates, pendingMedals } from '../../core/game'
import {
  canBuyTech,
  heirloomSlots,
  TECHS,
  techDamageMult,
  techGoldMult,
  techOfflineHours,
  techStartGold,
} from '../../core/techs'
import type { TechId, Techs } from '../../core/types'
import { fmt } from '../../core/format'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

/** 科技目前的實際效果文字 */
function techSummary(techs: Techs, id: TechId): string {
  if (id === 'valor') return `傷害 ×${techDamageMult(techs).toFixed(2)}`
  if (id === 'supply') return `金幣 ×${techGoldMult(techs).toFixed(2)}`
  if (id === 'legacy') return `開局 ${fmt(techStartGold(techs))} 金`
  return `離線上限 ${techOfflineHours(techs)} 小時`
}

export default function ShopPanel() {
  const s = useGameState()
  const prestige = useGame((st) => st.prestige)
  const buyTech = useGame((st) => st.buyTech)
  const buyElite = useGame((st) => st.buyElite)
  const [confirm, setConfirm] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const gain = pendingMedals(s)
  const candidates = heirloomCandidates(s)
  const slots = heirloomSlots(s.techs)

  return (
    <div>
      <h3>退 役 / 傳 承</h3>
      <div className="row">
        <span className="k">本代最高層數</span>
        <span className="v">{s.highestFloor} 層</span>
      </div>
      <div className="row">
        <span className="k">退役可得勳章</span>
        <span className="v gold" style={{ color: 'var(--gold)' }}>
          {gain} 枚
        </span>
      </div>
      <div className="row">
        <span className="k">已有勳章</span>
        <span className="v">{s.medals} 枚</span>
      </div>
      <div className="row">
        <span className="k">第幾代</span>
        <span className="v">第 {s.runs + 1} 代</span>
      </div>

      <h3 style={{ marginTop: 16 }}>勳 章 科 技</h3>
      <div className="affix" style={{ marginBottom: 8 }}>
        科技等級永久保留,每級乘算。
      </div>
      {TECHS.map((t) => {
        const lv = s.techs[t.id]
        const maxed = t.maxLevel !== undefined && lv >= t.maxLevel
        const affordable = canBuyTech(s.techs, s.medals, t.id)
        return (
          <div className="card" key={t.id}>
            <div className="head">
              <b>
                {t.name} <small className="affix">Lv.{lv}</small>
              </b>
              <button className="btn primary" disabled={!affordable} onClick={() => buyTech(t.id)}>
                {maxed ? '已滿級' : `${t.cost} 勳章`}
              </button>
            </div>
            <div className="affix">
              {t.desc}
              {lv > 0 && <b style={{ color: 'var(--gold)' }}> → 目前 {techSummary(s.techs, t.id)}</b>}
            </div>
          </div>
        )
      })}

      {!confirm ? (
        <div className="btn-row">
          <button className="btn primary" disabled={gain <= 0} onClick={() => setConfirm(true)}>
            {gain > 0 ? `退役,傳承給下一代(+${gain} 枚)` : '至少推進到 10 層才能退役'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="affix" style={{ marginBottom: 8, lineHeight: 1.7 }}>
            退役後等級、金幣、素材歸零,換得 {gain} 枚戰功勳章永久加成。
            <br />
            可指定 {slots} 件裝備當「傳家寶」帶給下一代{s.techs.heirloom > 0 && '(家族傳承科技已擴充)'}。
          </div>

          <h3 style={{ fontSize: 13, marginTop: 10 }}>選擇傳家寶</h3>
          {candidates.length === 0 && <div className="empty">沒有裝備可以傳承</div>}
          {candidates.slice(0, 8).map((e) => {
            const on = picked.includes(e.id)
            return (
              <button
                key={e.id}
                className="row"
                style={{ width: '100%', textAlign: 'left', opacity: on ? 1 : 0.6 }}
                onClick={() =>
                  setPicked(on ? picked.filter((id) => id !== e.id) : [...picked, e.id].slice(-slots))
                }
              >
                <span style={{ color: `var(--q-${e.quality})` }}>
                  {on ? '● ' : '○ '}
                  {QUALITY_NAME[e.quality]}
                  {SLOT_NAME[e.slot]}
                </span>
                <span className="affix">×{QUALITY_POWER[e.quality]}</span>
              </button>
            )
          })}

          <div className="btn-row">
            <button
              className="btn primary"
              onClick={() => {
                prestige(picked)
                setPicked([])
                setConfirm(false)
              }}
            >
              確認退役
            </button>
            <button className="btn" onClick={() => setConfirm(false)}>
              再想想
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="head">
          <b>
            菁英素材 <small className="affix">目前 {s.eliteMaterials} 個</small>
          </b>
          <button className="btn primary" disabled={s.medals < B.ELITE_MEDAL_COST} onClick={buyElite}>
            {B.ELITE_MEDAL_COST} 勳章
          </button>
        </div>
        <div className="affix">精工鍛造投入後保證菁英以上品質</div>
      </div>

      <div className="empty">傭兵徽章兌換為 Phase 2 內容</div>
    </div>
  )
}
