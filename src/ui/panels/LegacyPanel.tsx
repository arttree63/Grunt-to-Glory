import * as B from '../../core/balance'
import { forgeLevel, QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import { fmt } from '../../core/format'
import { pityLegendaryLeft } from '../../core/game'
import {
  canBuyTech,
  TECHS,
  techDamageMult,
  techGoldMult,
  techOfflineHours,
  techStartGold,
} from '../../core/techs'
import type { TechId, Techs } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

function techSummary(techs: Techs, id: TechId): string {
  if (id === 'valor') return `傷害 ×${techDamageMult(techs).toFixed(2)}`
  if (id === 'supply') return `金幣 ×${techGoldMult(techs).toFixed(2)}`
  if (id === 'legacy') return `開局 ${fmt(techStartGold(techs))} 金`
  if (id === 'camp') return `離線上限 ${techOfflineHours(techs)} 小時`
  return `傳家寶 ${B.HEIRLOOM_SLOTS + techs.heirloom} 件`
}

/**
 * 傳承頁。把散落各處的跨輪資產集中在一處——
 * 資料庫有保存不等於玩家感覺得到累積。
 */
export default function LegacyPanel() {
  const s = useGameState()
  const buyTech = useGame((st) => st.buyTech)
  const buyElite = useGame((st) => st.buyElite)

  const bestFloor = Math.max(s.highestFloor, ...s.chronicle.map((c) => c.floor), 0)

  return (
    <div>
      <h3>傳 承</h3>
      <div className="row">
        <span className="k">現在是第幾代</span>
        <span className="v">第 {s.runs + 1} 代</span>
      </div>
      <div className="row">
        <span className="k">歷代最高層</span>
        <span className="v">{bestFloor} 層</span>
      </div>
      <div className="row">
        <span className="k">戰功勳章</span>
        <span className="v" style={{ color: 'var(--gold)' }}>
          {s.medals} 枚
        </span>
      </div>
      <div className="row">
        <span className="k">鐵匠鋪</span>
        <span className="v">
          Lv.{forgeLevel(s.forgeCount)}
          <small className="affix"> 累積鍛造 {s.forgeCount} 次</small>
        </span>
      </div>
      <div className="row">
        <span className="k">傳奇保底</span>
        <span className="v">
          還差 {pityLegendaryLeft(s)} 次<small className="affix"> / {B.PITY_LEGENDARY}</small>
        </span>
      </div>
      <div className="row">
        <span className="k">傳承圖鑑</span>
        <span className="v">{s.codex.length} 件</span>
      </div>

      <h3 style={{ marginTop: 16 }}>勳 章 科 技</h3>
      <div className="affix" style={{ marginBottom: 8 }}>科技等級永久保留,每級乘算。</div>
      {TECHS.map((t) => {
        const lv = s.techs[t.id]
        const maxed = t.maxLevel !== undefined && lv >= t.maxLevel
        return (
          <div className="card" key={t.id}>
            <div className="head">
              <b>
                {t.name} <small className="affix">Lv.{lv}</small>
              </b>
              <button
                className="btn primary"
                disabled={!canBuyTech(s.techs, s.medals, t.id)}
                onClick={() => buyTech(t.id)}
              >
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

      <div className="card">
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

      <h3 style={{ marginTop: 16 }}>傳 承 圖 鑑</h3>
      {s.codex.length === 0 ? (
        <div className="empty">
          還沒有登錄任何裝備。走神匠命運選擇「傳家之器」,本代最好的裝備會留進圖鑑,
          未來輪迴有機會以殘缺版本重現。
        </div>
      ) : (
        <div className="grid">
          {s.codex.map((e) => (
            <div className="card" key={e.id} style={{ marginBottom: 0 }}>
              <b style={{ color: `var(--q-${e.quality})`, fontSize: 13 }}>
                {QUALITY_NAME[e.quality]}
                {SLOT_NAME[e.slot]}
              </b>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>歷 代 列 傳</h3>
      {s.chronicle.length === 0 ? (
        <div className="empty">第一代還在路上。每一代退役後,都會在這裡留下一段紀錄。</div>
      ) : (
        s.chronicle.map((c) => (
          <div className="card" key={c.gen}>
            <div className="head">
              <b>
                第 {c.gen} 代・{c.name}
              </b>
              <small className="affix">{c.floor} 層</small>
            </div>
            <div className="affix" style={{ lineHeight: 1.8 }}>
              {c.jobPath}
              {c.destiny && ` ・ ${c.destiny}命運`}
              <br />
              {c.heirloom && (
                <>
                  以「{c.heirloom}」留下傳家之器
                  <br />
                </>
              )}
              {c.epitaph}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
