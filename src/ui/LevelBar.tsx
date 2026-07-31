import { upCost } from '../core/formulas'
import { fmt } from '../core/format'
import { goldPerSec, TRACK_NAME } from '../core/game'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import { useHold } from './useHold'

/**
 * 主畫面常駐升級條。放置型的核心迴圈是「金幣漲 → 買得起 → 按下去」,
 * 那顆按鈕原本藏在英雄分頁裡,主畫面只剩看戰鬥——這是本作最像試玩版的地方
 * (對照組:點擊泰坦的商店就是主畫面本身,隨時有東西可買)。
 *
 * 買不起時不隱藏,改顯示「還要幾秒」——等待本身也是期待感的一部分。
 */
export default function LevelBar() {
  const s = useGameState()
  const buy = useGame((st) => st.buy)
  const hold = useHold(() => buy(1))

  const cost = upCost(s.lv)
  const can = s.gold.gte(cost)
  // 還差多少秒買得起:用目前金幣收益推算,讓等待有終點(不是無限期的灰按鈕)
  const perSec = goldPerSec(s)
  const wait = can || perSec.lte(0) ? 0 : cost.sub(s.gold).div(perSec).toNumber()

  return (
    <div className="level-bar">
      <button
        className={`lvl-main${can ? ' can' : ''}`}
        // ⚠️ 事件一律掛上,不要用 `can ? hold : {}`:長按到一半金幣用盡時 can 會翻成 false,
        // React 把 onPointerUp/Leave 拆掉 → 連點的 interval 永遠停不下來,
        // 之後金幣一夠就會自動把點數投進主修(玩家沒按任何東西)。買不起時 core 自己會擋
        {...hold}
        aria-label={`投一點進${TRACK_NAME[s.trackFocus]}`}
      >
        <span className="txt">
          操練 <b>{TRACK_NAME[s.trackFocus]}</b> {s.tracks[s.trackFocus]} → {s.tracks[s.trackFocus] + 1}
        </span>
        <span className="cost">
          {fmt(cost)} 金
          {!can && wait > 0 && <small> ・約 {wait < 60 ? `${Math.ceil(wait)} 秒` : `${Math.ceil(wait / 60)} 分`}</small>}
        </span>
      </button>
      <button
        className={`lvl-max${s.gold.gte(cost) ? ' can' : ''}`}
        onClick={() => buy('max')}
        aria-label="用現有金幣把點數全部投進主修"
      >
        全投
      </button>
    </div>
  )
}
