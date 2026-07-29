import { useState } from 'react'
import * as B from '../../core/balance'
import { forgeLevel, QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import { fmt } from '../../core/format'
import { matrixKey, matrixOutcome, pityLegendaryLeft, SAVE_VERSION } from '../../core/game'
import { DESTINY_PATHS } from '../../core/destiny'
import { ALL_LEGENDS } from '../../core/legends'
import { KEYWORD_NAME } from '../../core/keywords'
import { BASE_NAME } from '../../core/equipment'
import { destinySuffix, JOBS } from '../../core/jobs'
import {
  canBuyTech,
  TECHS,
  techDamageMult,
  techGoldMult,
  techOfflineHours,
  techStartGold,
} from '../../core/techs'
import type { DestinyPathId, JobId, TechId, Techs } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'

function techSummary(techs: Techs, id: TechId): string {
  if (id === 'valor') return `傷害 ×${techDamageMult(techs).toFixed(2)}`
  if (id === 'supply') return `金幣 ×${techGoldMult(techs).toFixed(2)}`
  if (id === 'legacy') return `開局 ${fmt(techStartGold(techs))} 金`
  if (id === 'camp') return `離線上限 ${techOfflineHours(techs)} 小時`
  return `轉生可帶 ${B.HEIRLOOM_SLOTS + techs.heirloom} 件`
}

/**
 * 傳承頁。把散落各處的跨輪資產集中在一處——
 * 資料庫有保存不等於玩家感覺得到累積。
 */
/**
 * 傳說圖鑑:歷代鍛出過哪些傳說(跨轉生)。
 * 未取得**不顯示問號**,顯示剪影 + 線索(部位 + 基底 + 機制方向)——
 * 製造目標,不是讓玩家面對一頁 ???(content-design § 六)。
 */
function LegendCodex() {
  const s = useGameState()
  const seen = s.legendsSeen

  return (
    <>
      <div className="affix" style={{ marginBottom: 6 }}>
        已收錄 {seen.length} / {ALL_LEGENDS.length}。精工鍛造出傳奇以上、部位與基底對上就有機會附帶。
      </div>
      {ALL_LEGENDS.map((l) => {
        const got = seen.includes(l.id)
        return (
          <div key={l.id} style={{ padding: '3px 0', opacity: got ? 1 : 0.55 }}>
            <div className="row" style={{ border: 'none', padding: 0 }}>
              <span className="k" style={{ color: got ? 'var(--q-gold)' : 'var(--dim)' }}>
                {got ? l.name : '？？？'}
              </span>
              <span className="v tier3">
                {BASE_NAME[l.base]}
                {SLOT_NAME[l.slot]}
              </span>
            </div>
            <div className="tier3">
              {got
                ? l.effect
                : `與「${l.tags.map((t) => KEYWORD_NAME[t]).join('、')}」有關——用${BASE_NAME[l.base]}基底精工鍛造${SLOT_NAME[l.slot]}`}
            </div>
          </div>
        )
      })}
    </>
  )
}

const TIER1: JobId[] = ['infantry', 'scout', 'marshal']
const PATHS: DestinyPathId[] = ['artisan', 'tactician', 'hunter']

/**
 * 命運 × 職業矩陣:跨輪的長期目標地圖。
 * ⚠️ 未達成的格子**不顯示問號**,顯示「走哪個組合會到這裡」的線索
 * (content-design § 六:製造目標,不要讓玩家面對一頁問號)。
 */
function JobMatrix() {
  const s = useGameState()
  const done = Object.keys(s.jobMatrix).length

  return (
    <>
      <div className="affix" style={{ marginBottom: 8 }}>
        已解鎖 {done} / {TIER1.length * PATHS.length} 種組合。二轉由「一轉職業 + 本輪命運」共同決定。
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {TIER1.map((t1) =>
          PATHS.map((path) => {
            const key = matrixKey(t1, path)
            const gen = s.jobMatrix[key]
            const outcome = matrixOutcome(t1, path)
            const job = outcome ? JOBS[outcome] : null
            const unique = !!job?.requiresDestiny
            return (
              <div
                key={key}
                className="card"
                style={{ margin: 0, padding: 8, opacity: gen ? 1 : 0.55 }}
              >
                <div className="tier3">
                  {JOBS[t1].name} × {DESTINY_PATHS[path].name}
                </div>
                <div
                  className="tier2"
                  style={{ color: gen ? (unique ? 'var(--gold)' : 'var(--text-strong)') : 'var(--dim)' }}
                >
                  {gen
                    ? `${job?.name}${unique ? '' : destinySuffix(path)}`
                    : unique
                      ? '命運限定二轉・尚未走到'
                      : '尚未走到'}
                </div>
                <div className="tier3">
                  {gen ? `第 ${gen} 代達成` : `走這個組合到 Lv.${JOBS.paladin.reqLv}`}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </>
  )
}

/**
 * 設定。放在傳承頁而不是新開分頁——底部已經六格,再加會把觸控目標壓更小。
 * 重置是不可逆的破壞性操作,所以要二次確認並寫清楚會失去什麼。
 */
function SettingsSection() {
  const reset = useGame((st) => st.reset)
  const [confirm, setConfirm] = useState(false)
  const [tutorialReset, setTutorialReset] = useState(false)

  return (
    <>
      <div className="btn-row">
        <button
          className="btn"
          style={{ minHeight: 44 }}
          onClick={() => {
            localStorage.removeItem('little-soldier-tutorial')
            localStorage.removeItem('little-soldier-tips')
            setTutorialReset(true)
          }}
        >
          重看新手說明
          <br />
          <small className="affix">{tutorialReset ? '下次重整就會再出現' : '開場說明與情境提示'}</small>
        </button>
        <button className="btn" style={{ minHeight: 44 }} onClick={() => setConfirm(true)}>
          重置全部進度
          <br />
          <small className="affix">連同代數與圖鑑</small>
        </button>
      </div>
      <div className="tier3" style={{ marginTop: 6 }}>
        存檔版本 v{SAVE_VERSION}・存在這台裝置的瀏覽器裡,換裝置不會跟著走
      </div>

      {confirm && (
        <div className="modal-mask" onPointerDown={() => setConfirm(false)}>
          <div className="modal" onPointerDown={(e) => e.stopPropagation()}>
            <h3>重 置 全 部 進 度</h3>
            <p>
              會清掉<b>所有東西</b>:目前這一代、歷代代數、戰功勳章與科技、傳承圖鑑、歷代列傳、
              傳家之器。
              <br />
              這個動作無法復原,也沒有備份。
            </p>
            <div className="btn-row">
              <button className="btn" style={{ minHeight: 44 }} onPointerDown={() => setConfirm(false)}>
                取消
              </button>
              <button
                className="btn primary"
                style={{ minHeight: 44 }}
                onPointerDown={() => {
                  reset()
                  setConfirm(false)
                }}
              >
                確定全部清除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

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

      <h3 style={{ marginTop: 16 }}>軍 需 處</h3>
      <div className="affix" style={{ marginBottom: 8 }}>
        勳章在這裡花掉。科技等級永久保留,每級乘算。
      </div>
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
          還沒有登錄任何裝備。走神匠命運選擇「傳家之器」節點,本代最好的裝備會留進圖鑑。
          想讓某一件跨代回來,到「裝備」分頁把它銘刻為傳家之器。
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
      <h3 style={{ marginTop: 16 }}>傳 說 圖 鑑</h3>
      <LegendCodex />

      <h3 style={{ marginTop: 16 }}>命 運 × 職 業</h3>
      <JobMatrix />

      <h3 style={{ marginTop: 16 }}>設 定</h3>
      <SettingsSection />

    </div>
  )
}
