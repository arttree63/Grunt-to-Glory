import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { fmt, fmtTime } from '../core/format'
import { upCost } from '../core/formulas'
import { bossGap, pendingMedals } from '../core/game'
import { hasNode } from '../core/destiny'
import { SKILLS } from '../core/skills'
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
import ShopPanel from './panels/ShopPanel'
import { useGameState } from './useGameState'

type Tab = 'hero' | 'equip' | 'forge' | 'destiny' | 'journal' | 'shop'

const TABS: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'hero', icon: '🗡️', label: '英雄' },
  { id: 'equip', icon: '🎽', label: '裝備' },
  { id: 'forge', icon: '🔨', label: '鐵匠鋪' },
  { id: 'destiny', icon: '🌿', label: '命運' },
  { id: 'journal', icon: '📖', label: '旅途' },
  { id: 'shop', icon: '🏅', label: '商店' },
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
    </button>
  )
}

function Game() {
  const s = useGameState()
  const [tab, setTab] = useState<Tab | null>(null)
  const offline = useGame((st) => st.offline)
  const dismissOffline = useGame((st) => st.dismissOffline)

  const hpRatio = s.enemyMaxHp.gt(0) ? s.enemyHp.div(s.enemyMaxHp).toNumber() : 0
  const canUpgrade = s.gold.gte(upCost(s.lv))

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

        {s.buff && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 46, pointerEvents: 'none', color: 'var(--morale-b)' }}
          >
            {SKILLS[s.buff.skillId].name} 生效中 {s.buff.timeLeft.toFixed(1)}s
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
            {tab === 'shop' && <ShopPanel />}
          </div>
        </>
      )}

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
