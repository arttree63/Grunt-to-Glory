import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { fmt, fmtTime } from '../core/format'
import { upCost } from '../core/formulas'
import {
  BOSS_KIND_HINT,
  BOSS_KIND_NAME,
  bossGap,
  bossKindFor,
  channelProgress,
  chargeMult,
  comboMult,
  diagnoseBoss,
  DIAGNOSIS_NAME,
  loreStage,
  BOSS_LORE_GLIMPSE,
  BOSS_LORE_MASTERY,
  TACTICS,
  pendingMedals,
  shellToNext,
  sigilCap,
  sigilName,
} from '../core/game'
import { hasNode } from '../core/destiny'
import { SKILLS } from '../core/skills'
import { JOBS } from '../core/jobs'
import { nearGoal } from '../core/goals'
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
import { GameIcon } from './GameIcon'

type Tab = 'hero' | 'equip' | 'forge' | 'destiny' | 'journal' | 'legacy'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'hero', label: '英雄' },
  { id: 'equip', label: '裝備' },
  { id: 'forge', label: '鐵匠鋪' },
  { id: 'destiny', label: '命運' },
  { id: 'journal', label: '旅途' },
  { id: 'legacy', label: '傳承' },
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
  const setTactic = useGame((st) => st.setTactic)
  const target = s.bossRetryFloor
  if (target === null) return null

  // 用要挑戰的那層算差距,不是玩家現在 farm 的層
  const gap = bossGap(s, target)
  const ready = gap < 1
  const kind = bossKindFor(target)
  const stage = loreStage(s, kind)
  const diag = diagnoseBoss(s.lastBossStats)
  const nemesis = s.nemesis && !s.nemesis.resolved && s.nemesis.floor === target ? s.nemesis : null
  // 敵情熟悉度決定戰前預告的精度:初見只有模糊描述,識破給打法,精通給精確時點
  const kindLabel = stage === 'unseen' || stage === 'glimpse' ? '未知的守關者' : BOSS_KIND_NAME[kind]
  const kindHint =
    stage === 'unseen' || stage === 'glimpse'
      ? BOSS_LORE_GLIMPSE[kind]
      : stage === 'mastered'
        ? BOSS_LORE_MASTERY[kind]
        : BOSS_KIND_HINT[kind]
  // 戰術修正只在玩家在線盯著這面板時可選;掛機自動重試永遠無修正
  const tactics = TACTICS.filter(
    (t) =>
      (t.id !== 'keepSigils' || JOBS[s.jobId].awakenSkill) && (t.id !== 'mercFirst' || s.activeMerc),
  )
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
    <div className="boss-challenge-wrap">
      <button
        className={`boss-challenge${ready ? ' ready' : ''}`}
        onPointerDown={(e) => {
          e.stopPropagation()
          retryBoss()
        }}
      >
        <b>
          挑戰第 {target} 層 Boss
          <small style={{ marginLeft: 6, opacity: 0.85 }}>{nemesis ? '家族宿敵' : kindLabel}</small>
        </b>
        {/* 宿敵:前代戰績是最好的開場台詞——這是家族的事,不只是這一代的 */}
        {nemesis && (
          <small style={{ color: 'var(--boss-b)' }}>
            第 {nemesis.gen} 代曾 {nemesis.failures} 次敗於此,最佳戰績打掉 {Math.round(nemesis.bestDealt * 100)}% 血量——替家族終結這段宿怨
          </small>
        )}
        <small>{ready ? advice : `還差 ${gap.toFixed(1)} 倍 DPS・${advice}`}</small>
        <small style={{ opacity: 0.85 }}>{kindHint}</small>
        {/* 失敗診斷三分類:先講「該改打法還是刷資源」,再講一句怎麼做 */}
        {diag && (
          <small style={{ color: 'var(--gold)' }}>
            上一場・{DIAGNOSIS_NAME[diag.category]}:{diag.text}
          </small>
        )}
        {/* 失敗補償看不見就補償不到心情 */}
        {s.valiantStacks > 0 && (
          <small style={{ color: 'var(--gold)' }}>
            越戰越勇 ×{s.valiantStacks}・Boss 戰傷害 +{Math.round(s.valiantStacks * B.VALIANT_DMG * 100)}%
          </small>
        )}
      </button>
      {/* 戰術修正:在線三選一,只對下一次挑戰生效;不選=無修正(掛機自動重試走這條) */}
      <div className="tactic-row" onPointerDown={(e) => e.stopPropagation()}>
        {tactics.map((t) => (
          <button
            key={t.id}
            className={`tactic${s.bossTactic === t.id ? ' on' : ''}`}
            onPointerDown={(e) => {
              e.stopPropagation()
              setTactic(s.bossTactic === t.id ? null : t.id)
            }}
          >
            <b>{t.name}</b>
            <small>{t.desc}</small>
          </button>
        ))}
      </div>
      {s.bossTactic && <small className="tactic-note">只對下一次挑戰生效・再敗要重新選</small>}
    </div>
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
  // 紅點三層收斂:同時只亮一顆,由近期目標的優先序決定(core/goals.ts)
  const near = nearGoal(s)

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
            <div className="name">
              第 {s.floor} 層 守關者
              {s.nemesis && !s.nemesis.resolved && s.nemesis.floor === s.floor && '・家 族 宿 敵'}
            </div>
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

        {/* ⚠️ 狀態文字用固定槽位由下往上堆:46 / 74 / 102,兩個元件不可寫死同一個座標。
            多槽 buff 併成一行,總攻疊窗時不會佔掉三個槽位 */}
        {s.buffs.length > 0 && (
          <div
            className="retry"
            style={{
              top: 'auto',
              bottom: s.charging || s.chargeBurstLeft > 0 ? 102 : 46,
              pointerEvents: 'none',
              color: 'var(--morale-b)',
            }}
          >
            {s.buffs
              .map((b) => `${SKILLS[b.skillId].name} ${b.permanent ? '常駐' : `${b.timeLeft.toFixed(1)}s`}`)
              .join('・')}
          </div>
        )}

        {/* 印記層數:核心循環(疊→挑時機引爆)原本只在技能格角落 11px,戰鬥中看不到 */}
        {s.sigils > 0 && JOBS[s.jobId].awakenSkill && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 186, pointerEvents: 'none', color: 'var(--gold)', fontSize: 13 }}
          >
            {sigilName(s)} {s.sigils}/{sigilCap(s)}
            {/* 完美引爆窗口:滿層 1.5 秒內手動引爆給操作獎勵(掛機正常引爆不受影響) */}
            {s.perfectWindowLeft > 0 ? (
              <small style={{ color: 'var(--gold)', fontWeight: 700 }}> 金色窗口——現在引爆=完美!</small>
            ) : (
              <small className="affix"> 用第二技能引爆</small>
            )}
          </div>
        )}

        {/* Boss 目標梯度(goal-gradient):過程中就讓玩家看到「再多做一件事就會不同」,
            而不是失敗診斷才告訴他差多少。三種原型互斥,共用同一個槽位 */}
        {s.isBoss && s.shellLeft > 0 && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--boss-hp, #ff7a5c)', fontSize: 13 }}
          >
            護盾 ×{s.shellLeft}・還差 {shellToNext(s)} 點破下一層
            <div className="goal-bar">
              <div className="fill" style={{ width: `${(1 - shellToNext(s) / B.SHIELD_VALUE_PER_LAYER) * 100}%` }} />
            </div>
            <small className="affix">一次命中 {B.SHIELD_HIT_VALUE} 點・燃燒等狀態 {B.SHIELD_TICK_VALUE} 點</small>
          </div>
        )}
        {s.isBoss && s.channelLeft > 0 && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--gold)', fontSize: 14 }}
          >
            {channelProgress(s) >= 0.75 ? '就差一點——現在放!' : '蓄力中'} {s.channelLeft.toFixed(1)}s・打斷{' '}
            {Math.floor(channelProgress(s) * 100)}%
            <div className="goal-bar">
              <div
                className="fill gold"
                style={{ width: `${channelProgress(s) * 100}%` }}
              />
            </div>
            <small className="affix">
              還差 {fmt(s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK).sub(s.channelDamage))} 傷害即可打斷
            </small>
          </div>
        )}
        {s.isBoss && s.totemHp.gt(0) && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--boss-hp, #ff7a5c)', fontSize: 13 }}
          >
            圖騰 {Math.ceil(s.totemHp.div(s.totemMaxHp).toNumber() * 100)}%・倒數加速中
            <div className="goal-bar">
              <div className="fill" style={{ width: `${s.totemHp.div(s.totemMaxHp).toNumber() * 100}%` }} />
            </div>
            <small className="affix">燃燒/背刺可直打本體</small>
          </div>
        )}

        {s.conquestLeft > 0 && !s.isBoss && (
          <div
            className="retry"
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--gold)', fontSize: 13 }}
          >
            乘勝推進 ×{B.CONQUEST_MULT}・{s.conquestLeft.toFixed(0)}s
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
              <span><GameIcon name={t.id} size={19} /></span>
              {t.label}
              {near?.tab === t.id && <i className="dot" />}
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
