import { upCost } from '../core/formulas'
import { fmt } from '../core/format'
import { goldPerSec, TRACK_NAME } from '../core/game'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import { useHold } from './useHold'
import trainingIconUrl from '../../assets/visual/ui/library-20260801/nav-equip.png'

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
      <span className="level-icon"><img src={trainingIconUrl} alt="" aria-hidden="true" /></span>
      <div
        className={`lvl-main${can ? ' can' : ''}`}
      >
        <span className="txt">
          <b>操練 {TRACK_NAME[s.trackFocus]} {s.tracks[s.trackFocus]} → {s.tracks[s.trackFocus] + 1}</b>
          <small>提升主要戰鬥能力。</small>
        </span>
        <span className="cost">
          {fmt(cost)} 金
          {!can && wait > 0 && <small> ・約 {wait < 60 ? `${Math.ceil(wait)} 秒` : `${Math.ceil(wait / 60)} 分`}</small>}
        </span>
      </div>
      <button
        className={`lvl-max${can ? ' can' : ''}`}
        {...hold}
        aria-label={`強化${TRACK_NAME[s.trackFocus]}`}
      >
        強化
      </button>
    </div>
  )
}
