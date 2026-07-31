import { useState } from 'react'
import { ALL_PATHS, DESTINY_NODES, DESTINY_PATHS, nextMilestone, pendingChoice } from '../../core/destiny'
import { QUALITY_NAME, SLOT_NAME } from '../../core/equipment'
import * as B from '../../core/balance'
import { heirloomCandidates, pendingMedals, RESONANCE_SRC_NAME, strongestResonance } from '../../core/game'
import { LEGENDS } from '../../core/legends'
import { SETS } from '../../core/sets'
import { heirloomSlots, TECHS } from '../../core/techs'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { BadgeIcon, GameIcon, QualityMark } from '../GameIcon'

/**
 * 退役/轉生入口。2026-07-31 移到傳承頁頂部(UX 回饋方案 A):
 * 命運=本輪構築,傳承=結束本輪與永久成長,分類才對得上玩家直覺。
 * 元件留在這檔(相依 heirloomCandidates 等 import),由 LegacyPanel import。
 */
export function PrestigeSection() {
  const s = useGameState()
  const prestige = useGame((st) => st.prestige)
  const [confirm, setConfirm] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const gain = pendingMedals(s)
  const candidates = heirloomCandidates(s)
  const slots = heirloomSlots(s.techs)
  // 再推幾層就多一枚勳章 —— 「差一點」比「你還早」有用得多
  const toNext = B.MEDAL_PER_FLOORS - (s.highestFloor % B.MEDAL_PER_FLOORS)
  // 首輪拿不到最便宜的科技(3 枚)就退役,等於白白丟掉這一代
  const cheapest = Math.min(...TECHS.map((t) => t.cost))
  const tooEarly = s.runs === 0 && gain < cheapest

  return (
    <>
      <h3 style={{ marginTop: 16 }}>退 役 / 傳 承</h3>
      <div className="row">
        <span className="k">本代最高層數</span>
        <span className="v">{s.highestFloor} 層</span>
      </div>
      <div className="row">
        <span className="k">退役可得勳章</span>
        <span className="v" style={{ color: 'var(--gold)' }}>
          {gain} 枚
        </span>
      </div>

      {gain > 0 && (
        <div className="affix" style={{ marginBottom: 6 }}>
          再推進 {toNext} 層(到第 {s.highestFloor + toNext} 層)就多一枚勳章。
          {tooEarly && (
            <div style={{ color: 'var(--gold)', marginTop: 4 }}>
              現在退役只有 {gain} 枚,最便宜的科技要 {cheapest} 枚 —— 通常再推一段更划算。
            </div>
          )}
        </div>
      )}

      {!confirm ? (
        <div className="btn-row">
          <button className="btn primary" disabled={gain <= 0} onClick={() => setConfirm(true)}>
            {gain > 0 ? `退役,讓下一代接棒(+${gain} 枚)` : '至少推進到 10 層才能退役'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="affix" style={{ marginBottom: 8, lineHeight: 1.7 }}>
            這一代的等級、金幣、素材與命運都會歸零,換得 {gain} 枚勳章與一段列傳。
            <br />
            可指定 {slots} 件裝備完整帶給下一代;
            <b>銘刻的傳家之器另計</b>,會以殘缺版回來,打贏 {B.HEIRLOOM_REPAIR_BOSSES} 個 Boss 後修復。
          </div>
          <div className="affix" style={{ marginBottom: 4 }}>
            已選 {picked.length}/{slots} 件
          </div>
          {candidates.slice(0, 10).map((e) => {
            const on = picked.includes(e.id)
            const full = !on && picked.length >= slots
            return (
              <button
                key={e.id}
                className="row"
                style={{ width: '100%', textAlign: 'left', opacity: on ? 1 : full ? 0.3 : 0.6 }}
                disabled={full} // 滿了就擋住,不要靜默把最舊的選擇換掉
                onClick={() => setPicked(on ? picked.filter((id) => id !== e.id) : [...picked, e.id])}
              >
                <span style={{ color: `var(--q-${e.quality})` }}>
                  {on ? '● ' : '○ '}
                  <QualityMark quality={e.quality} />
                  {/* 兩件「傳奇武器」分不出誰是誰:傳說名與套裝標籤才是玩家在挑的東西 */}
                  {e.legend && <BadgeIcon kind="legend" />}
                  {e.legend ? LEGENDS[e.legend].name : `${QUALITY_NAME[e.quality]}${SLOT_NAME[e.slot]}`}
                  {e.setTag && <small className="set-chip"><BadgeIcon kind="set" />{SETS[e.setTag].name}</small>}
                  {e.heirloom && <small style={{ color: 'var(--gold)' }}> <BadgeIcon kind="heirloom" />傳家之器</small>}
                </span>
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
    </>
  )
}

export default function DestinyPanel() {
  const s = useGameState()
  const chooseDestiny = useGame((st) => st.chooseDestiny)
  const pickNode = useGame((st) => st.pickDestinyNode)

  // 還沒選路徑:這一輪要怎麼玩
  if (!s.destinyPath) {
    const strongest = strongestResonance(s)
    const srcLines = (Object.keys(s.resonanceSrc) as Array<keyof typeof s.resonanceSrc>)
      .filter((k) => s.resonanceSrc[k] > 0)
      .map((k) => `${RESONANCE_SRC_NAME[k]} ×${s.resonanceSrc[k]}`)
    return (
      <div className="panel-page destiny-page">
        <h3>命 運</h3>
        <div className="affix" style={{ marginBottom: 10, lineHeight: 1.7 }}>
          選擇這一代小兵的命運。每輪只能選一條,轉生後重新選。
        </div>
        {ALL_PATHS.map((p) => (
          <div className="card destiny-card" key={p.id}>
            <div className="head">
              <div className="destiny-title">
                <GameIcon name="destiny" size={30} />
                <b>
                  {p.name} <small className="affix">{p.tagline}</small>
                {/* 共鳴是傾向的呈現,不是推薦——三條照選 */}
                {strongest === p.id && (
                  <small style={{ marginLeft: 6, color: 'var(--gold)' }}>
                    共鳴 {s.resonance[p.id]}・較強共鳴,選它有開場禮物
                  </small>
                )}
                {strongest !== p.id && s.resonance[p.id] > 0 && (
                  <small className="affix" style={{ marginLeft: 6 }}>共鳴 {s.resonance[p.id]}</small>
                )}
                </b>
              </div>
              <button className="btn primary" onClick={() => chooseDestiny(p.id)}>
                選擇
              </button>
            </div>
            <div className="affix">{p.fantasy}</div>
            <div className="affix" style={{ color: 'var(--text)', marginTop: 4 }}>
              起始:{DESTINY_NODES[p.start].name} — {DESTINY_NODES[p.start].desc}
            </div>
          </div>
        ))}
        {strongest && (
          <div className="affix" style={{ lineHeight: 1.7 }}>
            你在本次旅途中,與{DESTINY_PATHS[strongest].name}命運產生了較強共鳴。
            {srcLines.length > 0 && <>來源:{srcLines.join('、')}</>}
            <br />
            開場禮物(一次性):神匠=足夠鍛造一次的素材/尋寶=下一個事件立刻接近/戰術家=連斬起步 {B.RESONANCE_GIFT_COMBO} 層
          </div>
        )}
      </div>
    )
  }

  const path = DESTINY_PATHS[s.destinyPath]
  const choice = pendingChoice(s)
  const next = nextMilestone(s)

  return (
    <div className="panel-page destiny-page">
      <h3>
        命 運・{path.name}
        {s.destinyPoints > 0 && <span style={{ color: 'var(--gold)' }}> ・{s.destinyPoints} 點待用</span>}
      </h3>

      {choice ? (
        <>
          <div className="affix" style={{ marginBottom: 8 }}>
            {choice.length} 選 1,選了其他的本輪就不會再出現。
          </div>
          {choice.map((n) => (
            <div className="card" key={n.id}>
              <div className="head">
                <b>{n.name}</b>
                <button className="btn primary" onClick={() => pickNode(n.id)}>
                  選擇
                </button>
              </div>
              <div className="affix">{n.desc}</div>
            </div>
          ))}
        </>
      ) : (
        <div className="empty">
          {next !== null ? `推進到第 ${next} 層會獲得下一枚命運點` : '本輪命運已經走完'}
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>已走過的路</h3>
      {s.destinyNodes.map((id) => {
        const n = DESTINY_NODES[id]
        if (!n) return null
        return (
          <div key={id} style={{ padding: '4px 0' }}>
            <div className="row" style={{ border: 'none', padding: 0 }}>
              <span className="k">{n.tier === 0 ? '起始' : `第 ${n.tier} 個決策`}</span>
              <span className="v">{n.name}</span>
            </div>
            {/* 只列名稱的話,玩家過幾層就忘了自己選到什麼效果 */}
            <div className="tier3" style={{ paddingLeft: 8 }}>{n.desc}</div>
          </div>
        )
      })}

      {/* 退役入口已移到傳承頁(方案 A);這裡留一行指路,不留第二個入口 */}
      <div className="affix" style={{ marginTop: 16 }}>
        想結束這一輪?退役入口在「傳承」分頁。
      </div>
    </div>
  )
}
