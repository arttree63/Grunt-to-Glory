import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { fmt, fmtCombat, fmtTime } from '../core/format'
import { affordableLevels, upCost } from '../core/formulas'
import { techOfflineHours } from '../core/techs'
import {
  BOSS_KIND_HINT,
  BOSS_KIND_NAME,
  availableSkills,
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
  ironwallActive,
  setProgress,
  shellToNext,
  sigilCap,
  sigilName,
} from '../core/game'
import { hasNode } from '../core/destiny'
import { SKILLS } from '../core/skills'
import { SETS } from '../core/sets'
import { JOBS } from '../core/jobs'
import { nearGoal } from '../core/goals'
import { zoneOf, zoneProgress } from '../core/zones'
import { speciesPair } from '../core/enemies'
import { useGame } from '../store/gameStore'
import BattleCanvas from './BattleCanvas'
import { FloorDots, FloorToast } from './FloorProgress'
import SkillBar from './SkillBar'
import LevelBar from './LevelBar'
import Tutorial, { SpotlightTeach } from './Tutorial'
import EquipPanel from './panels/EquipPanel'
import ForgePanel from './panels/ForgePanel'
import HeroPanel from './panels/HeroPanel'
import DestinyPanel from './panels/DestinyPanel'
import JournalPanel from './panels/JournalPanel'
import LegacyPanel from './panels/LegacyPanel'
import { useGameState } from './useGameState'
import { BadgeIcon, GameIcon } from './GameIcon'

type Tab = 'hero' | 'equip' | 'forge' | 'destiny' | 'journal' | 'legacy'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'hero', label: '英雄' },
  { id: 'equip', label: '裝備' },
  { id: 'forge', label: '鍛造' },
  { id: 'destiny', label: '命運' },
  { id: 'journal', label: '旅途' },
  { id: 'legacy', label: '傳承' },
]



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
  const lastRun = useGame((st) => st.lastRun)
  const dismissOffline = useGame((st) => st.dismissOffline)
  const spot = useGame((st) => st.spotlight)
  const setUiLock = useGame((st) => st.setUiLock)

  useEffect(() => {
    setUiLock('panel', tab !== null)
    return () => setUiLock('panel', false)
  }, [setUiLock, tab])

  useEffect(() => {
    setUiLock('modal:app', !!offline || !!lastRun)
    return () => setUiLock('modal:app', false)
  }, [lastRun, offline, setUiLock])

  const hpRatio = s.enemyMaxHp.gt(0) ? s.enemyHp.div(s.enemyMaxHp).toNumber() : 0
  // 紅點三層收斂:同時只亮一顆,由近期目標的優先序決定(core/goals.ts)
  const near = nearGoal(s)
  const zone = zoneOf(s.floor)
  const zp = zoneProgress(s.floor)
  const species = speciesPair(s.floor)
  // 離線金幣換算成等級:報酬要能連到玩家下一個動作,不然只是一個大數字
  const offlineLevels = offline ? affordableLevels(s.lv, offline.gold) : 0
  const activeSets = setProgress(s).filter((set) => set.count >= 2)
  const [chipsOpen, setChipsOpen] = useState(false)

  // 主要機制卡:同時只有一張。優先序 = 時限緊迫度;聚光燈亮著的機制優先(卡要被照到)
  const mech = {
    channel: s.isBoss && s.channelLeft > 0,
    perfect: s.perfectWindowLeft > 0 && s.sigils > 0 && !!JOBS[s.jobId].awakenSkill,
    totem: s.isBoss && s.totemHp.gt(0),
    shell: s.isBoss && s.shellLeft > 0,
  }
  const primary: keyof typeof mech | null =
    spot && spot in mech && mech[spot as keyof typeof mech]
      ? (spot as keyof typeof mech)
      : mech.channel
        ? 'channel'
        : mech.perfect
          ? 'perfect'
          : mech.totem
            ? 'totem'
            : mech.shell
              ? 'shell'
              : null

  const flagStatus =
    s.bannerStored > 0
      ? {
          title: `失落軍旗・已儲 ${s.bannerStored.toFixed(1)}s`,
          detail: '下次施放技能時釋放',
          color: 'var(--gold)',
        }
      : s.bannerLeft > 0
        ? {
            title: `熔火軍旗・${s.bannerLeft.toFixed(1)}s`,
            detail: '攻擊追加軍旗回音・破盾 +2',
            color: 'var(--boss-b)',
          }
        : s.encounters.length > 0 && !s.event && !s.isBoss
          ? {
              title: '旅途旗標・有際遇待處理',
              detail: '到「旅途」分頁查看，不限時',
              color: '#f0b44c',
            }
          : null

  // 一般狀態全部收成 chip:超過 3 個折「+N」,點擊展開(clicker-ui § 七之五)
  const chips: Array<{ key: string; text: string; gold?: boolean }> = []
  for (const b of s.buffs)
    chips.push({
      key: `buff-${b.skillId}`,
      text: `${SKILLS[b.skillId].name} ${b.permanent ? '常駐' : `${b.timeLeft.toFixed(1)}s`}`,
    })
  if (s.sigils > 0 && JOBS[s.jobId].awakenSkill && primary !== 'perfect')
    chips.push({
      key: 'sigils',
      text: `${sigilName(s)} ${s.sigils}/${sigilCap(s)}`,
      gold: s.sigils >= Math.ceil(sigilCap(s) * 0.8),
    })
  if (s.combo > 0)
    chips.push({ key: 'combo', text: `連斬 ×${s.combo} +${Math.round((comboMult(s) - 1) * 100)}%`, gold: true })
  if (s.relicLeft > 0)
    chips.push({ key: 'relic', text: `遺物 ×${B.RELIC_MULT} ${s.relicLeft.toFixed(1)}s`, gold: true })
  if (flagStatus) chips.push({ key: 'flag', text: flagStatus.title, gold: true })
  if (s.charging || s.chargeBurstLeft > 0)
    chips.push({
      key: 'charge',
      text: s.charging
        ? `蓄勢 ${Math.floor(s.chargeStacks)} 層`
        : `爆發 ${s.chargeBurstLeft.toFixed(1)}s +${Math.round((chargeMult(s) - 1) * 100)}%`,
    })
  if (s.conquestLeft > 0 && !s.isBoss)
    chips.push({ key: 'conquest', text: `乘勝 ×${B.CONQUEST_MULT} ${s.conquestLeft.toFixed(0)}s`, gold: true })

  const hasSkills = availableSkills(s).length > 0

  return (
    <div
      className={`wrap${hasSkills ? ' has-skills' : ' no-skills'}${tab ? ' panel-open' : ''}${
        near && near.tab && tab !== near.tab ? ' has-next' : ''
      }`}
    >
      <BattleCanvas>
        <div className="topbar">
          <div className="stage-label">
            <small>
              戰場・{zone.name}
              <i className="zone-at">{zp.at}/{zp.span}</i>
            </small>
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
          <div className={`bossbar${spot === 'boss30' ? ' spotlit' : ''}`}>
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
          <div className="mobbar-wrap">
            {/* 本層住著什麼:同兩張素材衍生出的敵種名。內容量要看得見才算數 */}
            <div className="mob-name">{species.map((sp) => sp.name).join('・')}</div>
            <div className="mobbar">
              <div className="fill" style={{ width: `${Math.max(0, hpRatio) * 100}%` }} />
            </div>
          </div>
        )}

        <FloorToast />

        {activeSets.length > 0 && (
          <div className="set-overview">
            {activeSets.map((set) => {
              const state =
                set.tag === 'ironwall'
                  ? ironwallActive(s) ? '軍陣中' : set.count >= 3 ? '自動引爆待命' : '已啟動'
                  : s.commandReady ? '指揮就緒' : `${new Set(s.castOrder).size}/3 指令`
              return (
                <div className="set-status" key={set.tag}>
                  <BadgeIcon kind="set" />
                  <b>{SETS[set.tag].name}</b>
                  <span>{set.count}/3・{state}</span>
                </div>
              )
            })}
          </div>
        )}

        {hasNode(s, 'hunter_start') && !s.event && s.eventCooldown < B.OMEN_LEAD_SEC && (
          <div className="retry" style={{ top: 92, pointerEvents: 'none', color: 'var(--gold)' }}>
            不祥的預感…有什麼正在接近
          </div>
        )}

        {s.bossFailed && !s.isBoss && !s.event && <BossHint />}

        {/* 戰場狀態兩層制(clicker-ui § 七之五):同時只有一張主要機制卡,其餘收成 chip 列。
            聚光燈教學的 .spotlit 掛在主要機制卡上,所以優先選 spot 對應的機制 */}
        {primary === 'channel' && (
          <div
            className={`retry${spot === 'channel' ? ' spotlit' : ''}`}
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--gold)', fontSize: 14 }}
          >
            {channelProgress(s) >= 0.75 ? '就差一點——現在放!' : '蓄力中'} {s.channelLeft.toFixed(1)}s・打斷{' '}
            {Math.floor(channelProgress(s) * 100)}%
            <div className="goal-bar">
              <div className="fill gold" style={{ width: `${channelProgress(s) * 100}%` }} />
            </div>
            <small className="affix">
              還差 {fmtCombat(s.enemyMaxHp.mul(B.CHANNEL_HP_TO_BREAK).sub(s.channelDamage))} 傷害即可打斷
            </small>
          </div>
        )}
        {primary === 'perfect' && (
          <div
            className={`retry${spot === 'perfect' ? ' spotlit' : ''}`}
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--gold)', fontSize: 14 }}
          >
            金色窗口——現在引爆=完美!
            <div className="goal-bar">
              <div
                className="fill gold"
                style={{ width: `${(s.perfectWindowLeft / B.PERFECT_WINDOW_SEC) * 100}%` }}
              />
            </div>
            <small className="affix">
              {sigilName(s)} {s.sigils}/{sigilCap(s)}・手動引爆獲得完美獎勵
            </small>
          </div>
        )}
        {primary === 'totem' && (
          <div
            className={`retry${spot === 'totem' ? ' spotlit' : ''}`}
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--boss-hp, #ff7a5c)', fontSize: 13 }}
          >
            圖騰 {Math.ceil(s.totemHp.div(s.totemMaxHp).toNumber() * 100)}%・倒數加速中
            <div className="goal-bar">
              <div className="fill" style={{ width: `${s.totemHp.div(s.totemMaxHp).toNumber() * 100}%` }} />
            </div>
            <small className="affix">燃燒/背刺可直打本體</small>
          </div>
        )}
        {primary === 'shell' && (
          <div
            className={`retry${spot === 'shell' ? ' spotlit' : ''}`}
            style={{ top: 'auto', bottom: 214, pointerEvents: 'none', color: 'var(--boss-hp, #ff7a5c)', fontSize: 13 }}
          >
            護盾 ×{s.shellLeft}・還差 {shellToNext(s)} 點破下一層
            {/* 戰術延遲期間投點凍結:盾條直接灰掉,不讓玩家以為還在推進 */}
            <div className={`goal-bar${s.tacticDelayLeft > 0 ? ' frozen' : ''}`}>
              <div className="fill" style={{ width: `${(1 - shellToNext(s) / B.SHIELD_VALUE_PER_LAYER) * 100}%` }} />
            </div>
            <small className="affix">一次命中 {B.SHIELD_HIT_VALUE} 點・燃燒等狀態 {B.SHIELD_TICK_VALUE} 點</small>
          </div>
        )}

        {chips.length > 0 && (
          <div className="status-chips">
            {(chipsOpen ? chips : chips.slice(0, 3)).map((c) => (
              <span key={c.key} className={`chip${c.gold ? ' gold' : ''}`}>
                {c.text}
              </span>
            ))}
            {chips.length > 3 && (
              <span
                className="chip more"
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setChipsOpen(!chipsOpen)
                }}
              >
                {chipsOpen ? '收合' : `+${chips.length - 3}`}
              </span>
            )}
          </div>
        )}

        <div className="morale">
          <div className="tag">戰 意</div>
          <div className="bar">
            <div className="fill" style={{ width: `${s.morale}%` }} />
          </div>
        </div>

        <SpotlightTeach />
      </BattleCanvas>

      <div className="bottom">
        {/* 核心成長迴圈要在主畫面上按得到:金幣漲→亮起→按(對照點擊泰坦的商店即主畫面) */}
        <LevelBar />
        {/* 下一步行動提示:紅點只說「有事」,這條直接說「做什麼」,點了開正確分頁 */}
        {near && near.tab && tab !== near.tab && (
          <button className="next-step" onClick={() => setTab(near.tab as Tab)}>
            <span>下一步:{near.text}</span>
            <span className="go">前往 →</span>
          </button>
        )}
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
            {/* 由下拉出的面板要有可見的關閉方式:把手 + ×(點外側/再點分頁仍可關) */}
            <div className="panel-grip" onPointerDown={() => setTab(null)}>
              <i />
              <button className="x" aria-label="關閉">
                ×
              </button>
            </div>
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
              {/* 讓獎勵有意義:純數字看不出多寡,換算成「夠升幾級」才知道值不值得 */}
              {offlineLevels > 0 && (
                <>
                  <br />
                  <small style={{ color: 'var(--gold)' }}>夠升 {offlineLevels} 級</small>
                </>
              )}
              <br />
              {/* ⚠️ 上限要用 techOfflineHours(含營地帳篷),寫死基礎值會讓買了科技的玩家看不到生效 */}
              <small>(離線收益為線上的 6 折,上限 {techOfflineHours(s.techs)} 小時)</small>
            </p>
            {/* 撞到上限才是玩家真正需要知道的事,也是「營地帳篷」存在的理由 */}
            {offline.capped && (
              <p className="affix" style={{ color: 'var(--gold)', marginTop: -4 }}>
                已達上限——超過的時間沒有計入。到「傳承」的軍需處買「營地帳篷」可以延長。
              </p>
            )}
            <button className="btn primary" onClick={dismissOffline}>
              收 下
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
