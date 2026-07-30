import { useState } from 'react'
import eliteMaterialUrl from '../../../assets/visual/items/core-resources/elite-material.png'
import monsterMaterialUrl from '../../../assets/visual/items/core-resources/monster-material.png'
import partMaterialUrl from '../../../assets/visual/items/core-resources/part-material.png'
import * as B from '../../core/balance'
import {
  AFFIX_NAME,
  BASE_DESC,
  BASE_NAME,
  BASE_TENDENCY,
  BASES,
  compareEquipment,
  forgeLevel,
  RELATION_NAME,
  forgeUpgradeChance,
  QUALITY_NAME,
  score,
  SLOT_NAME,
  SLOTS,
} from '../../core/equipment'
import { hasNode } from '../../core/destiny'
import {
  canFineForge,
  fineForgesLeft,
  forgeHeat,
  forgeHeatBonus,
  pityLeft,
  pityLegendaryLeft,
  pityShortLeft,
} from '../../core/game'
import { LEGENDS } from '../../core/legends'
import { SETS } from '../../core/sets'
import { SetTagBlock } from './EquipPanel'
import { SKILLS } from '../../core/skills'
import type { BaseType, Equipment, Slot } from '../../core/types'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { BadgeIcon, MechanicChips, QualityMark } from '../GameIcon'
import ResultReveal from '../ResultReveal'

/**
 * 鍛造結果:先講這件會怎麼改變玩法,戰力百分比放最後。
 * ⚠️ 只顯示綠箭頭的話,整套構築設計會退化成「數字大的就穿」(裝備規範 § 八)。
 */
function ForgeResult({
  e,
  equipped,
  onEquip,
}: {
  e: Equipment
  equipped: Record<Slot, Equipment | null>
  onEquip: () => void
}) {
  const legend = e.legend ? LEGENDS[e.legend] : null
  const diff = compareEquipment(e, equipped)
  // 換上這件之後會湊到幾件(玩家要看的是「換上會不會成套」,不是現在有幾件)
  const setAfter = e.setTag
    ? 1 + SLOTS.filter((sl) => sl !== e.slot && equipped[sl]?.setTag === e.setTag).length
    : 0
  return (
    <div className={`card quality-frame q-${e.quality}`} style={legend ? { borderColor: 'var(--q-gold)' } : undefined}>
      <div className="head">
        <b style={{ color: `var(--q-${e.quality})` }}>
          <QualityMark quality={e.quality} />
          {legend && <BadgeIcon kind="legend" />}
          {legend ? legend.name : `${QUALITY_NAME[e.quality]}${SLOT_NAME[e.slot]}`}
          {e.setTag && <small className="set-chip"><BadgeIcon kind="set" />{SETS[e.setTag].name}</small>}
        </b>
        <button className="btn" style={{ padding: '5px 10px' }} onClick={onEquip}>
          直接裝備
        </button>
      </div>

      {legend && (
        <>
          <div className="affix" style={{ color: 'var(--q-gold)', marginTop: 2 }}>
            核心特性:{legend.effect}
          </div>
          <div className="affix">
            標籤 <MechanicChips tags={legend.tags} />
            {legend.affects.length > 0 && `・影響技能 ${legend.affects.map((sk) => SKILLS[sk].name).join('、')}`}
          </div>
          <div className="affix">適合構築:{legend.builds}</div>
          <div className="affix" style={{ opacity: 0.75 }}>
            不可重鑄:傳說特性固定,重鑄只影響一般詞綴
          </div>
        </>
      )}
      <SetTagBlock e={e} count={setAfter} />
      {e.base && (
        <div className="affix">
          {BASE_NAME[e.base]}基底 — {BASE_DESC[e.base]}
        </div>
      )}
      <div className="affix">
        {QUALITY_NAME[e.quality]}
        {SLOT_NAME[e.slot]}・
        {e.affixes.map((a, i) => (
          <span key={i}>
            {i > 0 && ' / '}
            {AFFIX_NAME[a.type]} +{Math.round(a.value * 100)}%
          </span>
        ))}
      </div>

      <div className="affix" style={{ marginTop: 6, opacity: 0.9 }}>
        ── 與目前裝備比較 ──
        {diff.lost.map((t, i) => (
          <div key={`l${i}`}>將失去 {t}</div>
        ))}
        {diff.gained.map((t, i) => (
          <div key={`g${i}`} style={{ color: 'var(--text-strong)' }}>
            將獲得 {t}
          </div>
        ))}
        {/* 傳說不顯示戰力 %:它們是 power-neutral 的,顯示數字只會把玩家推回綠箭頭思維 */}
        {diff.powerDelta === undefined ? (
          <div style={{ color: 'var(--text-strong)' }}>{RELATION_NAME[diff.relation]}</div>
        ) : (
          <div>
            戰力 {diff.powerDelta >= 0 ? '+' : ''}
            {Math.round(diff.powerDelta * 100)}%
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 鍛造選項跨開合保留。⚠️ 放 module 變數而不是 state:
 * 面板切 tab 就整個卸載,玩家每輪都要重選「精工 + 部位 + 菁英 + 基底」四次點擊。
 * 這不進存檔,重開遊戲回預設即可。
 */
const sticky = {
  mode: 'normal' as 'normal' | 'fine',
  slot: null as Slot | null,
  useElite: false,
  allIn: false,
  base: null as BaseType | null,
}

export default function ForgePanel() {
  const s = useGameState()
  const forge = useGame((st) => st.forge)
  const fineForge = useGame((st) => st.fineForge)
  const equip = useGame((st) => st.equip)
  const [results, setResults] = useState<Equipment[]>([])
  const [pendingResults, setPendingResults] = useState<Equipment[]>([])
  const [revealQuality, setRevealQuality] = useState<Equipment['quality'] | null>(null)
  const [mode, setModeState] = useState<'normal' | 'fine'>(sticky.mode)
  const [slot, setSlotState] = useState<Slot | null>(sticky.slot)
  const [useElite, setUseEliteState] = useState(sticky.useElite)
  const [allIn, setAllInState] = useState(sticky.allIn)
  const [base, setBaseState] = useState<BaseType | null>(sticky.base)
  const setMode = (v: typeof mode) => (sticky.mode = v, setModeState(v))
  const setSlot = (v: Slot | null) => (sticky.slot = v, setSlotState(v))
  const setUseElite = (v: boolean) => (sticky.useElite = v, setUseEliteState(v))
  const setAllIn = (v: boolean) => (sticky.allIn = v, setAllInState(v))
  const setBase = (v: BaseType | null) => (sticky.base = v, setBaseState(v))

  const fineOpts = { slot: slot ?? undefined, useElite, base: base ?? undefined }
  const canFine = canFineForge(s, fineOpts)

  const run = (times: number, fine: boolean) => {
    const out: Equipment[] = []
    for (let i = 0; i < times; i++) {
      const e = fine ? fineForge(fineOpts) : forge({ allIn })
      if (!e) break
      out.push(e)
    }
    // 帶傳說特性者置頂,其餘依品質。玩家要先看到「會改變玩法的那一件」
    const sorted = out.sort((a, b) => Number(!!b.legend) - Number(!!a.legend) || score(b) - score(a))
    if (sorted.length === 0) return
    setResults([])
    setPendingResults(sorted)
    setRevealQuality(sorted[0].quality)
  }

  // 所見即所得預覽
  const preview = slot
    ? useElite
      ? `將獲得:${SLOT_NAME[slot]}(菁英以上)`
      : `將獲得:隨機${SLOT_NAME[slot]}`
    : useElite
      ? '將獲得:隨機裝備(菁英以上)'
      : '將獲得:隨機裝備'

  return (
    <div>
      <h3>鐵 匠 鋪</h3>
      {s.relicPending && (
        <div className="card" style={{ borderColor: 'var(--q-gold)', color: 'var(--gold)' }}>
          <BadgeIcon kind="legend" /> 貪婪之眼已鎖定：下場 Boss 將帶有遺物弱點
        </div>
      )}

      <div className="row">
        <span className="k resource-label">
          <img className="resource-icon" src={monsterMaterialUrl} alt="" />
          怪物素材
        </span>
        <span className="v">{s.materials}</span>
      </div>
      <div className="row">
        <span className="k resource-label">
          <img className="resource-icon" src={eliteMaterialUrl} alt="" />
          菁英素材
        </span>
        <span className="v" style={{ color: s.eliteMaterials > 0 ? 'var(--q-purple)' : undefined }}>
          {s.eliteMaterials}
          {s.eliteMaterials === 0 && (
            <small className="affix"> 寶箱怪 / 每日首殺 Boss / 傳承頁軍需處兌換</small>
          )}
        </span>
      </div>
      <div className="row">
        <span className="k resource-label">
          <img className="resource-icon" src={partMaterialUrl} alt="" />
          部位素材
        </span>
        <span className="v affix">
          {SLOTS.filter((sl) => s.partMaterials[sl] > 0)
            .map((sl) => `${SLOT_NAME[sl]}×${s.partMaterials[sl]}`)
            .join(' ') || '無(每 10 層 Boss 掉落)'}
        </span>
      </div>
      {hasNode(s, 'artisan_start') && (
        <div className="row">
          <span className="k">爐火</span>
          <span className="v" style={{ color: forgeHeat(s) > 0 ? 'var(--gold)' : undefined }}>
            {forgeHeat(s)} 層
            <small className="affix">
              {' '}
              品質升階 +{Math.round(forgeHeatBonus(s) * 100)}%・打造後清空
            </small>
          </span>
        </div>
      )}
      <div className="row">
        <span className="k">鐵匠鋪等級</span>
        <span className="v">
          Lv.{forgeLevel(s.forgeCount)}
          <small className="affix"> 品質升階 +{Math.round(forgeUpgradeChance(s.forgeCount) * 100)}%</small>
        </span>
      </div>

      <div className="btn-row" style={{ marginBottom: 4 }}>
        <button className={`btn${mode === 'normal' ? ' primary' : ''}`} onClick={() => setMode('normal')}>
          普通鍛造
        </button>
        <button className={`btn${mode === 'fine' ? ' primary' : ''}`} onClick={() => setMode('fine')}>
          精工鍛造
        </button>
      </div>

      {mode === 'normal' ? (
        <>
          <div className="row">
            <span className="k">消耗</span>
            <span className="v affix">怪物素材 ×{B.FORGE_COST} → 隨機部位、隨機品質</span>
          </div>
          <div className="row">
            <span className="k">菁英保底</span>
            <span className="v">
              {pityLeft(s) === 0 ? (
                <b style={{ color: 'var(--q-purple)' }}>下次必出菁英以上</b>
              ) : (
                <>
                  還差 {pityLeft(s)} 次<small className="affix"> / {B.PITY_FORGE}</small>
                </>
              )}
            </span>
          </div>
          {hasNode(s, 'artisan_1b') && (
            <button
              className={`btn${allIn ? ' primary' : ''}`}
              style={{ width: '100%', marginTop: 6 }}
              onClick={() => setAllIn(!allIn)}
            >
              {allIn ? '● ' : '○ '}孤注一擲(素材 ×{B.ALLIN_COST_MULT},品質下限 +1 階)
            </button>
          )}
          <div className="btn-row">
            <button
              className="btn primary"
              disabled={s.materials < B.FORGE_COST * (allIn ? B.ALLIN_COST_MULT : 1)}
              onClick={() => run(1, false)}
            >
              開 錘
            </button>
            <button className="btn" disabled={s.materials < B.FORGE_COST * 10} onClick={() => run(10, false)}>
              十 連
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="row">
            <span className="k">鎖定部位</span>
            <span className="v affix">投入部位素材</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 8 }}>
            {SLOTS.map((sl) => {
              const own = s.partMaterials[sl]
              return (
                <button
                  key={sl}
                  className={`btn${slot === sl ? ' primary' : ''}`}
                  style={{ padding: '8px 2px', fontSize: 11, opacity: own > 0 ? 1 : 0.35 }}
                  disabled={own === 0}
                  onClick={() => setSlot(slot === sl ? null : sl)}
                >
                  {SLOT_NAME[sl]}
                  <br />
                  <small className="affix">{own}</small>
                </button>
              )
            })}
          </div>

          <button
            className={`btn${useElite ? ' primary' : ''}`}
            style={{ width: '100%', opacity: s.eliteMaterials > 0 ? 1 : 0.35 }}
            disabled={s.eliteMaterials === 0}
            onClick={() => setUseElite(!useElite)}
          >
            {useElite ? '● ' : '○ '}投入菁英素材(保證菁英以上)
          </button>

          {/* 定向基底:白裝基底是傳說的入口,投對素材才打得出想要的那一系 */}
          {useElite && (
            <>
              <div className="row" style={{ marginTop: 8 }}>
                <span className="k">指定基底</span>
                <span className="v affix">決定這一錘可能出哪一系傳說</span>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 4 }}>
                {BASES.map((b) => (
                  <button
                    key={b}
                    className={`btn${base === b ? ' primary' : ''}`}
                    style={{ padding: '8px 2px', fontSize: 11 }}
                    onClick={() => setBase(base === b ? null : b)}
                  >
                    {BASE_NAME[b]}
                    <br />
                    <small className="affix">{BASE_TENDENCY[b]}</small>
                  </button>
                ))}
              </div>
              {base && <div className="affix">{BASE_DESC[base]}</div>}
            </>
          )}

          <div className="card" style={{ marginTop: 10 }}>
            <b style={{ color: useElite ? 'var(--q-purple)' : 'var(--text-strong)' }}>{preview}</b>
            <div className="affix" style={{ marginTop: 4 }}>
              消耗:怪物素材 ×{B.FINE_FORGE_COST}
              {slot && ` + ${SLOT_NAME[slot]}素材 ×1`}
              {useElite && ' + 菁英素材 ×1'}
            </div>
          </div>

          <div className="row">
            <span className="k">本輪精工</span>
            <span className="v">
              剩 {fineForgesLeft(s)} 次<small className="affix"> / {B.FINE_FORGE_PER_RUN}(每輪重置)</small>
            </span>
          </div>
          <div className="row">
            <span className="k">傳說保底</span>
            <span className="v">
              {pityShortLeft(s) === 0 ? (
                <b style={{ color: 'var(--q-gold)' }}>下次必出傳說特性</b>
              ) : (
                <>
                  還差 {pityShortLeft(s)} 次
                  <small className="affix"> / {B.PITY_LEGEND_SHORT}・普通鍛造每 10 次也推進</small>
                </>
              )}
            </span>
          </div>
          <div className="row">
            <span className="k">套裝保底</span>
            <span className="v">
              {pityLegendaryLeft(s) === 0 ? (
                <b style={{ color: 'var(--q-blue)' }}>下次必附套裝標籤</b>
              ) : (
                <>
                  還差 {pityLegendaryLeft(s)} 次<small className="affix"> / {B.PITY_LEGENDARY}</small>
                </>
              )}
            </span>
          </div>

          <div className="btn-row">
            <button className="btn primary" disabled={!canFine} onClick={() => run(1, true)}>
              精 工 開 錘
            </button>
            <button
              className="btn"
              disabled={!canFine || s.materials < B.FINE_FORGE_COST * 10}
              onClick={() => run(10, true)}
            >
              十 連
            </button>
          </div>
          {!canFine && (
            <div className="empty">
              {fineForgesLeft(s) === 0
                ? '本輪精工次數已用完,下一輪重置'
                : s.materials < B.FINE_FORGE_COST
                ? `還差怪物素材 ${B.FINE_FORGE_COST - s.materials}(打怪就會掉)`
                : slot && s.partMaterials[slot] < 1
                  ? `需要 1 個${SLOT_NAME[slot]}素材(每 10 層 Boss 掉落)`
                  : '需要 1 個菁英素材'}
            </div>
          )}
        </>
      )}

      {results.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>鍛造結果</h3>
          {results.map((e) => (
            <ForgeResult key={e.id} e={e} equipped={s.equipped} onEquip={() => equip(e.id)} />
          ))}
        </>
      )}

      {revealQuality && (
        <ResultReveal
          items={Object.values(QUALITY_NAME)}
          result={QUALITY_NAME[revealQuality]}
          tone={`q-${revealQuality}`}
          onDone={() => {
            setResults(pendingResults)
            setPendingResults([])
            setRevealQuality(null)
          }}
        />
      )}
    </div>
  )
}
