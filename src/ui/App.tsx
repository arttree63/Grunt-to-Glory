import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { fmt, fmtTime } from '../core/format'
import { upCost } from '../core/formulas'
import { bossGap, chargeMult, comboMult, pendingMedals, sigilCap, sigilName } from '../core/game'
import { hasNode } from '../core/destiny'
import { SKILLS } from '../core/skills'
import { canBuyTech, TECHS } from '../core/techs'
import { useGame } from '../store/gameStore'
import BattleCanvas from './BattleCanvas'
import { FloorDots, FloorToast } from './FloorProgress'
import SkillBar from './SkillBar'
import Tutorial from './Tutorial'
import EquipPanel from './panels/EquipPanel'
import ForgePanel from './panels/ForgePanel'
import HeroPanel from './panels/HeroPanel'
import DestinyPanel from './panels/DestinyPanel'
import JournalPanel from './panels/JournalPanel'
import LegacyPanel from './panels/LegacyPanel'
import { useGameState } from './useGameState'

type Tab = 'hero' | 'equip' | 'forge' | 'destiny' | 'journal' | 'legacy'

const TABS: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'hero', icon: '🗡️', label: '英雄' },
  { id: 'equip', icon: '🎽', label: '裝備' },
  { id: 'forge', icon: '🔨', label: '鐵匠鋪' },
  { id: 'destiny', icon: '🌿', label: '命運' },
  { id: 'journal', icon: '📖', label: '旅途' },
  { id: 'legacy', icon: '🏅', label: '傳承' },
]

const MAPS = ['森林邊境', '地底城', '古堡', '神殿']
const mapName = (floor: number) => MAPS[Math.floor((floor - 1) / 100) % MAPS.length]

export default function App() {
  const init = useGame((st) => st.init)
  const loaded = useGame((st) => st.loaded)
  useEffect(() => {
    void init()
  }, [init])

  if (!loaded) return <div className="wrap" />
  return <Game />
}

/** Boss 失敗後常駐的挑戰按鈕:說清楚差多少、該做什麼、要挑戰第幾層 */
function BossHint() {
  const s = useGameState()
  const retryBoss = useGame((st) => st.retryBoss)
  const target = s.bossRetryFloor
  if (target === null) return null

  // 用要挑戰的那層算差距,不是玩家現在 farm 的層
  const gap = bossGap(s, target)
  const ready = gap < 1
  const advice = ready
    ? '現在打得過了'
    : s.materials >= B.FORGE_COST
      ? '素材夠了,去鐵匠鋪換裝'
      : s.gold.gte(upCost(s.lv))
        ? '金幣夠了,先買等級'
        : pendingMedals(s) > 0
          ? '這代到極限了,可考慮退役'
          : '在這層多打幾輪'

  return (
    <button
      className={`boss-challenge${ready ? ' ready' : ''}`}
      onPointerDown={(e) => {
        e.stopPropagation()
        retryBoss()
      }}
    >
      <b>挑戰第 {target} 層 Boss</b>
      <small>{ready ? advice : `還差 ${gap.toFixed(1)} 倍 DPS・${advice}`}</small>
      {/* 失敗補償看不見就補償不到心情 */}
      {s.valiantStacks > 0 && (
        <small style={{ color: 'var(--gold)' }}>
          越戰越勇 ×{s.valiantStacks}・Boss 戰傷害 +{Math.round(s.valiantStacks * B.VALIANT_DMG * 100)}%
        </small>
      )}
    </button>
  )
}

/** 轉生結算:證明這一代沒有白玩,並預告下一輪快碰到什麼 */
function RunSummary() {
  const entry = useGame((st) => st.lastRun)
  const dismiss = useGame((st) => st.dismissRunSummary)
  const s = useGameState()
  if (!entry) return null

  return (
    <div className="modal-mask" onPointerDown={dismiss}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
        <h3 style={{ textAlign: 'center' }}>
          第 {entry.gen} 代・{entry.name}
        </h3>
        <p style={{ textAlign: 'center', lineHeight: 1.8 }}>
          {entry.jobPath}
          {entry.destiny && ` ・ ${entry.destiny}命運`}
          <br />
          抵達第 {entry.floor} 層
          {entry.heirloom && (
            <>
              <br />以「{entry.heirloom}」留下傳家之器
            </>
          )}
          <br />
          <span style={{ color: 'var(--dim)' }}>{entry.epitaph}</span>
        </p>

        <h3 style={{ fontSize: 13, marginTop: 6 }}>本代帶來的永久變化</h3>
        <div className="row">
          <span className="k">戰功勳章</span>
          <span className="v" style={{ color: 'var(--gold)' }}>
            +{entry.medalsGained}
          </span>
        </div>
        <div className="row">
          <span className="k">鐵匠鋪經驗</span>
          <span className="v">+{entry.forgeGained} 次鍛造</span>
        </div>
        {entry.codexGained > 0 && (
          <div className="row">
            <span className="k">新增圖鑑</span>
            <span className="v">+{entry.codexGained} 件</span>
          </div>
        )}
        <div className="row">
          <span className="k">列傳</span>
          <span className="v">+1 名</span>
        </div>

        <div className="affix" style={{ marginTop: 10, lineHeight: 1.7 }}>
          下一個目標:{nextGoal(s)}
        </div>

        <button className="btn primary" style={{ width: '100%', marginTop: 12 }} onClick={dismiss}>
          下一代出發
        </button>
      </div>
    </div>
  )
}

/** 每輪結束至少給一個「已經快到了」的目標 */
function nextGoal(s: ReturnType<typeof useGameState>): string {
  if (s.medals >= B.ELITE_MEDAL_COST) return '勳章夠換一塊菁英素材了,精工鍛造保證出菁英以上'
  if (s.medals >= 8) return '勳章夠買「家族傳承」,到傳承頁的軍需處買,下一代可以多帶一件裝備'
  if (s.medals >= 3) return '勳章夠買第一級科技,傷害或金幣擇一'
  if (s.codex.length === 0) return '走神匠命運選「傳家之器」,本代最好的裝備會留進圖鑑'
  return '換一條命運試試,職業會走向不同的結果'
}

function Game() {
  const s = useGameState()
  const [tab, setTab] = useState<Tab | null>(null)
  const offline = useGame((st) => st.offline)
  const dismissOffline = useGame((st) => st.dismissOffline)

  const hpRatio = s.enemyMaxHp.gt(0) ? s.enemyHp.div(s.enemyMaxHp).toNumber() : 0
  const canUpgrade = s.gold.gte(upCost(s.lv))
  // 傳承頁其實就是商店(勳章科技 + 兌換),但沒有紅點玩家不會自己去翻
  const canBuyAnything =
    TECHS.some((t) => canBuyTech(s.techs, s.medals, t.id)) || s.medals >= B.ELITE_MEDAL_COST

  return (
    <div className="wrap">
      <BattleCanvas>
        <div className="topbar">
          <div className="stage-label">
            <small>戰場・{mapName(s.floor)}</small>
            <b>第 {s.floor} 層</b>
            <FloorDots />
          </div>
          <div className="gold-box">
            <small>金幣</small>
            {fmt(s.gold)}
          </div>
        </div>

        {s.event ? (
          <div className="bossbar">
            <div className="name" style={{ color: 'var(--gold)' }}>
              {s.event.kind === 'chest' ? '寶 箱 怪' : '黃 金 哥 布 林'}
            </div>
            <div className="bar">
              <div
                className="fill"
                style={{
                  width: `${Math.max(0, s.event.hp.div(s.event.maxHp).toNumber()) * 100}%`,
                  background: 'linear-gradient(90deg,#f2c14e,#fff0c0)',
                }}
              />
            </div>
            <div className="timer danger">{s.event.timeLeft.toFixed(1)}</div>
          </div>
        ) : s.isBoss ? (
          <div className="bossbar">
            <div className="name">第 {s.floor} 層 守關者</div>
            <div className="bar">
              <div className="fill" style={{ width: `${Math.max(0, hpRatio) * 100}%` }} />
            </div>
            <div className={`timer${s.bossTimeLeft < 5 ? ' danger' : ''}`}>{s.bossTimeLeft.toFixed(1)}</div>
          </div>
        ) : (
          <div className="mobbar">
            <div className="fill" style={{ width: `${Math.max(0, hpRatio) * 100}%` }} />
          </div>
        )}

        <FloorToast />

        {hasNode(s, 'hunter_start') && !s.event && s.eventCooldown < B.OMEN_LEAD_SEC && (
          <div className="retry" style={{ top: 92, pointerEvents: 'none', color: 'var(--gold)' }}>
            不祥的預感…有什麼正在接近
          </div>
        )}

        {s.bossFailed && !s.isBoss && !s.event && <BossHint />}

        {s.combo > 0 && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 74, pointerEvents: 'none', color: 'var(--gold)', fontSize: 13 }}
          >
            連斬 ×{s.combo}
            <small className="affix"> 傷害 +{Math.round((comboMult(s) - 1) * 100)}%</small>
          </div>
        )}

        {(s.charging || s.chargeBurstLeft > 0) && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 46, pointerEvents: 'none', color: 'var(--morale-b)', fontSize: 13 }}
          >
            {s.charging
              ? `蓄勢中 ${Math.floor(s.chargeStacks)} 層(暫停輸出)`
              : `爆發 ${s.chargeBurstLeft.toFixed(1)}s・傷害 +${Math.round((chargeMult(s) - 1) * 100)}%`}
          </div>
        )}

        {/* ⚠️ 狀態文字用固定槽位由下往上堆:46 / 74 / 102,兩個元件不可寫死同一個座標 */}
        {s.buff && (
          <div
            className="retry"
            style={{
              top: 'auto',
              bottom: s.charging || s.chargeBurstLeft > 0 ? 102 : 46,
              pointerEvents: 'none',
              color: 'var(--morale-b)',
            }}
          >
            {SKILLS[s.buff.skillId].name} {s.buff.permanent ? '常駐中' : `生效中 ${s.buff.timeLeft.toFixed(1)}s`}
          </div>
        )}

        {/* 印記層數:核心循環(疊→挑時機引爆)原本只在技能格角落 11px,戰鬥中看不到 */}
        {s.sigils > 0 && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 186, pointerEvents: 'none', color: 'var(--gold)', fontSize: 13 }}
          >
            {sigilName(s)} {s.sigils}/{sigilCap(s)}
            <small className="affix"> 用第二技能引爆</small>
          </div>
        )}

        {s.relicLeft > 0 && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 130, pointerEvents: 'none', color: 'var(--gold)', fontSize: 13 }}
          >
            遺物弱點 ×{B.RELIC_MULT}・{s.relicLeft.toFixed(1)}s
          </div>
        )}

        {s.bannerStored > 0 && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 158, pointerEvents: 'none', color: 'var(--gold)', fontSize: 13 }}
          >
            軍旗 儲 {s.bannerStored.toFixed(1)}s
            <small className="affix"> 下次施放技能時釋放</small>
          </div>
        )}

        <div className="morale">
          <div className="tag">戰 意</div>
          <div className="bar">
            <div className="fill" style={{ width: `${s.morale}%` }} />
          </div>
        </div>
      </BattleCanvas>

      <div className="bottom">
        <SkillBar />
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(tab === t.id ? null : t.id)}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.id === 'hero' && canUpgrade && <i className="dot" />}
              {t.id === 'forge' && s.materials >= B.FORGE_COST && <i className="dot" />}
              {t.id === 'destiny' && (s.destinyPoints > 0 || !s.destinyPath) && <i className="dot" />}
              {t.id === 'journal' && s.encounters.length > 0 && <i className="dot" />}
              {t.id === 'legacy' && canBuyAnything && <i className="dot" />}
            </button>
          ))}
        </div>
      </div>

      {tab && (
        <>
          <div className="panel-mask" onPointerDown={() => setTab(null)} />
          <div className="panel">
            {tab === 'hero' && <HeroPanel />}
            {tab === 'equip' && <EquipPanel />}
            {tab === 'forge' && <ForgePanel />}
            {tab === 'destiny' && <DestinyPanel />}
            {tab === 'journal' && <JournalPanel />}
            {tab === 'legacy' && <LegacyPanel />}
          </div>
        </>
      )}

      <RunSummary />

      <Tutorial />

      {offline && (
        <div className="modal-mask" onPointerDown={dismissOffline}>
          <div className="modal" onPointerDown={(e) => e.stopPropagation()}>
            <h3>離 線 收 益</h3>
            <p>
              你離開了 {fmtTime(offline.seconds)}
              <br />
              小兵持續作戰,帶回 <b style={{ color: 'var(--gold)' }}>{fmt(offline.gold)}</b> 金幣
              <br />
              <small>(離線收益為線上的 6 折,上限 {B.OFFLINE_CAP_HOURS} 小時)</small>
            </p>
            <button className="btn primary" onClick={dismissOffline}>
              收 下
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
