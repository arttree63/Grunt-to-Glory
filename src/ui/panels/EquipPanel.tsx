import { DMG_PER_LV } from '../../core/balance'
import {
  AFFIX_NAME,
  BASE_DESC,
  BASE_NAME,
  compareEquipment,
  equipPower,
  RELATION_NAME,
  QUALITY_NAME,
  SALVAGE_RETURN,
  SLOT_NAME,
  SLOTS,
  score,
} from '../../core/equipment'
import { hasNode } from '../../core/destiny'
import {
  heirloomRepairLeft,
  inscribedItem as inscribed,
  protectedFromBulkSalvage,
  setCount,
} from '../../core/game'
import { LEGENDS } from '../../core/legends'
import { SETS } from '../../core/sets'
import { KEYWORD_NAME } from '../../core/keywords'
import { activeLegends, setProgress } from '../../core/game'
import type { Equipment, MechanicTag, Quality } from '../../core/types'
import { useEffect, useState } from 'react'
import { QUALITIES as Q } from '../../core/equipment'
import { DEVOUR_GROWTH as B_DEVOUR } from '../../core/balance'
import { useGame } from '../../store/gameStore'
import { useGameState } from '../useGameState'
import { BadgeIcon, MechanicChips, MechanicIcon, QualityMark } from '../GameIcon'

/** 觸控目標下限 44px(手機誤觸「分解」會永久失去裝備) */
const TOUCH = { padding: '10px 12px', minHeight: 44 } as const

const qColor = (q: Equipment['quality']) => `var(--q-${q})`

/**
 * 套裝標籤區。未啟動的效果也要顯示(淡色),
 * 只拿到一件的玩家才知道值得繼續蒐集(UI 規格 § 6.4)。
 */
export function SetTagBlock({ e, count }: { e: Equipment; count: number }) {
  if (!e.setTag) return null
  const set = SETS[e.setTag]
  return (
    <div className="set-block">
      <div className="tier1">
        <span className="set-chip"><BadgeIcon kind="set" />{set.name}</span> 已裝備 {count}/3
      </div>
      <div className="tier2">{count >= 2 ? '✓ ' : <><BadgeIcon kind="lock" /> 未啟動 </>}2 件 {set.two}</div>
      <div className="tier2">{count >= 3 ? '✓ ' : <><BadgeIcon kind="lock" /> 未啟動 </>}3 件 {set.three}</div>
      {count < 3 && <div className="tier3">還需任意 {3 - count} 件帶「{set.name}」標籤的裝備</div>}
    </div>
  )
}

function Affixes({
  e,
  setTagCount,
  repairLeft,
}: {
  e: Equipment
  setTagCount: number
  repairLeft: number
}) {
  const legend = e.legend ? LEGENDS[e.legend] : null
  return (
    <>
      {legend && (
        <>
          <div className="tier1" style={{ color: 'var(--q-gold)' }}>
            <BadgeIcon kind="legend" /> {legend.name}
          </div>
          <div className="tier2" style={{ color: 'var(--q-gold)' }}>
            {legend.effect}
          </div>
          <div className="tier3">
            標籤 <MechanicChips tags={legend.tags} />・不可重鑄
          </div>
        </>
      )}
      {e.base && (
        <div className="tier2">
          <b style={{ color: 'var(--text-strong)' }}>{BASE_NAME[e.base]}基底</b>
          <span className="tier3"> {BASE_DESC[e.base]}</span>
        </div>
      )}
      {e.heirloom && (
        <div className="affix" style={{ color: 'var(--gold)' }}>
          <BadgeIcon kind="heirloom" /> <b>{e.bearer ? `${e.bearer}的傳家之器` : '傳家之器'}</b>
          {e.broken ? `・殘缺版,再擊破 ${repairLeft} 個 Boss 修復` : '・轉生後必定回來'}
        </div>
      )}
      <SetTagBlock e={e} count={setTagCount} />
      <div className="tier2">
        {e.affixes.map((a, i) => (
          <span key={i}>
            {i > 0 && ' / '}
            {AFFIX_NAME[a.type]} +{Math.round(a.value * 100)}%
          </span>
        ))}
      </div>
    </>
  )
}

/** 卡片標題用的名稱:傳說 > 品質 + 部位 */
function itemLabel(e: Equipment) {
  return e.legend ? LEGENDS[e.legend].name : `${QUALITY_NAME[e.quality]}${SLOT_NAME[e.slot]}`
}

/**
 * 目前構築摘要(UI 規格 § 四):由裝備標籤**自動產生**,非玩家手動設定,最多四項。
 * 玩家要看得見「這輪在玩什麼」——散在五格裝備上的機制,這裡收成一句話。
 */
function BuildSummary() {
  const s = useGameState()
  const parts: string[] = []
  for (const id of activeLegends(s)) parts.push(LEGENDS[id].builds.split(' / ')[0])
  for (const p of setProgress(s)) parts.push(`${SETS[p.tag].name} ${p.count}/3`)
  // 基底傾向:同基底 ≥3 件才算成形
  const bases = SLOTS.map((sl) => s.equipped[sl]?.base).filter(Boolean)
  for (const b of ['swift', 'heavy', 'guard', 'focus'] as const) {
    if (bases.filter((x) => x === b).length >= 3) parts.push(`${BASE_NAME[b]}基底 ×${bases.filter((x) => x === b).length}`)
  }

  return (
    <div className="card" style={{ marginBottom: 8, padding: 8 }}>
      <div className="tier3">目前構築</div>
      {parts.length > 0 ? (
        <div className="tier1" style={{ color: 'var(--text-strong)' }}>{parts.slice(0, 4).join(' · ')}</div>
      ) : (
        <div className="tier2" style={{ color: 'var(--dim)' }}>
          尚未形成主要構築
          <div className="tier3">傳說裝與同標籤套裝會改變技能的運作方式,到鐵匠鋪精工鍛造</div>
        </div>
      )}
    </div>
  )
}

/** 背包篩選(UI 規格 § 五):詞綴回答「我缺什麼數值」,關鍵字回答「我想玩什麼機制」,兩排分開 */
type RarityFilter = 'all' | 'legend' | 'set' | Quality

export default function EquipPanel() {
  const s = useGameState()
  const [rarity, setRarity] = useState<RarityFilter>('all')
  const [kw, setKw] = useState<MechanicTag | null>(null)
  const inscribe = useGame((st) => st.inscribeHeirloom)
  const lastSalvage = useGame((st) => st.lastSalvage)
  // 不可逆操作一律二次確認,用遊戲內樣式而不是原生 confirm
  const [confirmSalvage, setConfirmSalvage] = useState<Equipment | null>(null)
  const [confirmDevour, setConfirmDevour] = useState<Equipment | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Equipment['slot'] | null>(null)
  const equip = useGame((st) => st.equip)
  const unequip = useGame((st) => st.unequip)
  const salvage = useGame((st) => st.salvage)
  const salvageEquipped = useGame((st) => st.salvageEquipped)
  const salvageBelow = useGame((st) => st.salvageBelow)
  const setUiLock = useGame((st) => st.setUiLock)

  const devour = useGame((st) => st.devourWeapon)
  const canDevour = hasNode(s, 'artisan_2a') && !!s.equipped.weapon
  const power = equipPower(s.equipped)
  const equivLv = Math.log(power) / Math.log(DMG_PER_LV)

  const itemTags = (e: Equipment): MechanicTag[] => [
    ...(e.legend ? LEGENDS[e.legend].tags : []),
    ...(e.setTag ? SETS[e.setTag].tags : []),
  ]
  // 關鍵字篩選只列背包裡真的有的,不列一整排空按鈕
  const kwOptions = [...new Set(s.inventory.flatMap(itemTags))]
  const filtered = s.inventory.filter((e) => {
    if (rarity === 'legend' && !e.legend) return false
    if (rarity === 'set' && !e.setTag) return false
    if (rarity !== 'all' && rarity !== 'legend' && rarity !== 'set' && e.quality !== rarity) return false
    if (kw && !itemTags(e).includes(kw)) return false
    return true
  })

  useEffect(() => {
    setUiLock('modal:equip', !!confirmSalvage || !!confirmDevour)
    return () => setUiLock('modal:equip', false)
  }, [confirmDevour, confirmSalvage, setUiLock])

  return (
    <div>
      <h3>裝 備</h3>
      <BuildSummary />
      <div className="row">
        <span className="k">裝備戰力</span>
        <span className="v">
          ×{power.toFixed(2)}
          <small className="affix"> 相當於 +{Math.round(equivLv)} 級</small>
        </span>
      </div>
      {SLOTS.map((slot) => {
        const e = s.equipped[slot]
        return (
          <div key={slot}>
            <div className="row">
              <span className="k">{SLOT_NAME[slot]}</span>
              {e ? (
                <span className="v" style={{ color: qColor(e.quality) }}>
                  <QualityMark quality={e.quality} />
                  {e.base && <small className="affix">{BASE_NAME[e.base]} </small>}
                  {e.legend ? LEGENDS[e.legend].name : QUALITY_NAME[e.quality]}
                  {e.setTag && <small className="set-chip"><BadgeIcon kind="set" />{SETS[e.setTag].name}</small>}
                  {e.heirloom && <small style={{ color: 'var(--gold)' }}> <BadgeIcon kind="heirloom" />傳家之器</small>}
                  {(e.growth ?? 1) > 1 && (
                    <small style={{ color: 'var(--gold)' }}> +{Math.round(((e.growth ?? 1) - 1) * 100)}%</small>
                  )}
                  <button
                    className={`btn${selectedSlot === slot ? ' primary' : ''}`}
                    style={{ marginLeft: 8, padding: '6px 9px', minHeight: 32 }}
                    onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  >
                    {selectedSlot === slot ? '收起' : '詳情'}
                  </button>
                </span>
              ) : (
                <span className="v affix">空</span>
              )}
            </div>
            {e && selectedSlot === slot && (
              <div className={`card quality-frame q-${e.quality}`} style={{ marginTop: 4 }}>
                <div className="head">
                  <b style={{ color: qColor(e.quality) }}>
                    <QualityMark quality={e.quality} />
                    {e.legend && <BadgeIcon kind="legend" />}
                    {itemLabel(e)}
                  </b>
                  <small className="affix">已裝備</small>
                </div>
                <Affixes
                  e={e}
                  setTagCount={e.setTag ? setCount(s, e.setTag) : 0}
                  repairLeft={heirloomRepairLeft(s)}
                />
                <div className="btn-row" style={{ flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    style={TOUCH}
                    onClick={() => {
                      unequip(slot)
                      setSelectedSlot(null)
                    }}
                  >
                    卸下
                  </button>
                  <button
                    className="btn"
                    style={{ ...TOUCH, color: 'var(--gold)' }}
                    onClick={() => {
                      const cur = inscribed(s)
                      if (cur && cur.id !== e.id && !confirm(`要改銘刻這件嗎?原本的「${itemLabel(cur)}」會失去傳家之器身分。`))
                        return
                      inscribe(e.id)
                    }}
                  >
                    {e.heirloom ? '已銘刻' : '銘刻'}
                  </button>
                  <button className="btn" style={TOUCH} onClick={() => setConfirmSalvage(e)}>
                    分解 +{SALVAGE_RETURN[e.quality]}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <h3 style={{ marginTop: 16 }}>背 包({s.inventory.length})</h3>
      {s.inventory.length > 3 && (
        <>
          <div className="btn-row" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 2 }}>
            {(
              [
                ['all', '全部'],
                ['legend', '傳說'],
                ['set', '套裝'],
                ...Q.map((q) => [q, QUALITY_NAME[q]] as const),
              ] as Array<[RarityFilter, string]>
            ).map(([f, label]) => (
              <button
                key={f}
                className={`btn${rarity === f ? ' primary' : ''}`}
                style={{ padding: '6px 10px', minHeight: 32, fontSize: 11 }}
                onClick={() => setRarity(f)}
              >
                {f === 'legend' && <BadgeIcon kind="legend" />}
                {f === 'set' && <BadgeIcon kind="set" />}
                {Q.includes(f as Quality) && <QualityMark quality={f as Quality} />}
                {label}
              </button>
            ))}
          </div>
          {kwOptions.length > 0 && (
            <div className="btn-row" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
              {kwOptions.map((t) => (
                <button
                  key={t}
                  className={`btn${kw === t ? ' primary' : ''}`}
                  style={{ padding: '6px 10px', minHeight: 32, fontSize: 11 }}
                  onClick={() => setKw(kw === t ? null : t)}
                >
                  <MechanicIcon tag={t} />{KEYWORD_NAME[t]}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {s.inventory.length === 0 && <div className="empty">還沒有裝備,去鐵匠鋪鍛造一件</div>}
      {s.inventory.length > 0 && filtered.length === 0 && (
        <div className="empty">沒有符合篩選的裝備</div>
      )}
      {filtered
        .sort((a, b) => score(b) - score(a))
        .map((e) => {
          const cur = s.equipped[e.slot]
          const better = !cur || score(e) > score(cur)
          const diff = compareEquipment(e, s.equipped)
          return (
            <div className={`card quality-frame q-${e.quality}`} key={e.id}>
              <div className="head">
                <b style={{ color: qColor(e.quality) }}>
                  <QualityMark quality={e.quality} />
                  {e.legend && <BadgeIcon kind="legend" />}
                  {e.legend ? LEGENDS[e.legend].name : `${QUALITY_NAME[e.quality]}${SLOT_NAME[e.slot]}`}
                  {better && !e.legend && <span style={{ color: '#6dc46d', fontSize: 11 }}> ▲更好</span>}
                </b>
                <span>
                  <button className="btn" style={TOUCH} onClick={() => equip(e.id)}>
                    裝備
                  </button>
                  <button
                    className="btn"
                    style={{ ...TOUCH, marginLeft: 6 }}
                    onClick={() =>
                      // 傳說 / 套裝件 / 傳家之器分解不可逆,先問一次
                      protectedFromBulkSalvage(e) ? setConfirmSalvage(e) : salvage(e.id)
                    }
                  >
                    分解 +{SALVAGE_RETURN[e.quality]}
                  </button>
                  {/* 同時只能有一件:銘刻新的會取代舊的,所以要二次確認 */}
                  <button
                    className="btn"
                    style={{ ...TOUCH, marginLeft: 6, color: 'var(--gold)' }}
                    onClick={() => {
                      const cur = inscribed(s)
                      if (cur && cur.id !== e.id && !confirm(`要改銘刻這件嗎?原本的「${itemLabel(cur)}」會失去傳家之器身分。`))
                        return
                      inscribe(e.id)
                    }}
                  >
                    {e.heirloom ? '已銘刻' : '銘刻'}
                  </button>
                  {canDevour && e.slot === 'weapon' && (
                    <button
                      className="btn"
                      style={{ ...TOUCH, marginLeft: 6, color: 'var(--gold)' }}
                      onClick={() => setConfirmDevour(e)}
                    >
                      餵給武器
                    </button>
                  )}
                </span>
              </div>
              <Affixes
                e={e}
                setTagCount={e.setTag ? setCount(s, e.setTag) : 0}
                repairLeft={heirloomRepairLeft(s)}
              />
              {/* 機制得失放在戰力之上(UI 規格 § 八) */}
              {(diff.lost.length > 0 || diff.gained.length > 0) && (
                <details className="compare tier3" style={{ marginTop: 4 }}>
                  <summary>
                    換裝比較:
                    {diff.powerDelta === undefined
                      ? RELATION_NAME[diff.relation]
                      : `戰力 ${diff.powerDelta >= 0 ? '+' : ''}${Math.round(diff.powerDelta * 100)}%`}
                  </summary>
                  {diff.lost.map((t, i) => (
                    <div key={`l${i}`}>將失去 {t}</div>
                  ))}
                  {diff.gained.map((t, i) => (
                    <div key={`g${i}`} style={{ color: 'var(--text-strong)' }}>
                      將獲得 {t}
                    </div>
                  ))}
                </details>
              )}
            </div>
          )
        })}

      {lastSalvage && lastSalvage.count + lastSalvage.protectedCount > 0 && (
        <div className="affix" style={{ marginTop: 8, color: 'var(--gold)' }}>
          分解 {lastSalvage.count} 件,+{lastSalvage.materials} 素材
          {lastSalvage.protectedCount > 0 &&
            `(已保留 ${lastSalvage.protectedCount} 件傳說 / 套裝 / 傳家之器)`}
        </div>
      )}
      {s.inventory.length > 0 && (
        <div className="btn-row">
          <button className="btn" style={TOUCH} onClick={() => salvageBelow(Q.indexOf('green'))}>
            一鍵分解「精良」以下
          </button>
          <button className="btn" style={TOUCH} onClick={() => salvageBelow(Q.indexOf('blue'))}>
            分解「稀有」以下
          </button>
        </div>
      )}
      {confirmDevour && (
        <div className="modal-mask" onPointerDown={() => setConfirmDevour(null)}>
          <div className="modal" onPointerDown={(ev) => ev.stopPropagation()}>
            <h3>餵 給 武 器</h3>
            <p>
              「{itemLabel(confirmDevour)}」會被吃掉,換取身上武器 +{Math.round(B_DEVOUR * 100)}% 永久成長。
              <br />
              這個動作不可復原。
            </p>
            <div className="btn-row">
              <button className="btn" style={TOUCH} onPointerDown={() => setConfirmDevour(null)}>
                取消
              </button>
              <button
                className="btn primary"
                style={TOUCH}
                onPointerDown={() => {
                  devour(confirmDevour.id)
                  setConfirmDevour(null)
                }}
              >
                吞噬
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSalvage && (
        <div className="modal-mask" onPointerDown={() => setConfirmSalvage(null)}>
          <div className="modal" onPointerDown={(ev) => ev.stopPropagation()}>
            <h3>確 認 分 解</h3>
            <p>
              「{itemLabel(confirmSalvage)}」
              {confirmSalvage.heirloom
                ? '是你的傳家之器,分解後不會再回到下一代。'
                : confirmSalvage.legend
                  ? '帶著傳說特性,分解後這個玩法就沒了。'
                  : '帶著套裝標籤,分解後套裝進度會退回。'}
              <br />
              分解只返還 {SALVAGE_RETURN[confirmSalvage.quality]} 素材,無法復原。
            </p>
            <div className="btn-row">
              <button className="btn" style={TOUCH} onPointerDown={() => setConfirmSalvage(null)}>
                取消
              </button>
              <button
                className="btn primary"
                style={TOUCH}
                onPointerDown={() => {
                  const equipped = s.equipped[confirmSalvage.slot]
                  if (equipped?.id === confirmSalvage.id) salvageEquipped(confirmSalvage.slot)
                  else salvage(confirmSalvage.id)
                  setSelectedSlot(null)
                  setConfirmSalvage(null)
                }}
              >
                仍要分解
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
