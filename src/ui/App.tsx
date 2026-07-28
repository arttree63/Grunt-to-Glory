import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { fmt, fmtTime } from '../core/format'
import { upCost } from '../core/formulas'
import { useGame } from '../store/gameStore'
import BattleCanvas from './BattleCanvas'
import EquipPanel from './panels/EquipPanel'
import ForgePanel from './panels/ForgePanel'
import HeroPanel from './panels/HeroPanel'
import MercPanel from './panels/MercPanel'
import ShopPanel from './panels/ShopPanel'
import { useGameState } from './useGameState'

type Tab = 'hero' | 'equip' | 'forge' | 'merc' | 'shop'

const TABS: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'hero', icon: '🗡️', label: '英雄' },
  { id: 'equip', icon: '🎽', label: '裝備' },
  { id: 'forge', icon: '🔨', label: '鐵匠鋪' },
  { id: 'merc', icon: '🐕', label: '傭兵' },
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

function Game() {
  const s = useGameState()
  const [tab, setTab] = useState<Tab | null>(null)
  const retryBoss = useGame((st) => st.retryBoss)
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
          </div>
          <div className="gold-box">
            <small>金幣</small>
            {fmt(s.gold)}
          </div>
        </div>

        {s.isBoss ? (
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

        {s.bossFailed && !s.isBoss && (
          <button
            className="retry"
            onPointerDown={(e) => {
              e.stopPropagation()
              retryBoss()
            }}
          >
            DPS 不足,已撤退 — 點此重新挑戰 Boss
          </button>
        )}

        <div className="morale">
          <div className="tag">戰 意</div>
          <div className="bar">
            <div className="fill" style={{ width: `${s.morale}%` }} />
          </div>
        </div>
      </BattleCanvas>

      <div className="bottom">
        <div className="skills">
          <div className="skill">⚔️</div>
          <div className="skill locked">🛡️</div>
          <div className="skill locked">🔥</div>
          <div className="skill locked">✨</div>
        </div>
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
            {tab === 'merc' && <MercPanel />}
            {tab === 'shop' && <ShopPanel />}
          </div>
        </>
      )}

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
