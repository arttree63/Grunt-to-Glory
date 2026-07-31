import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { attackInterval, pendingTrainingCount, trainingCount } from '../core/game'
import type { TrainingId } from '../core/types'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'

/**
 * 操練令。原本是 Lv.10/20/30/40/50 各彈一次的全螢幕 modal——實測開場 88 秒內連彈五次,
 * 每 15~20 秒打斷一次。被自己的頻率貶值:玩家只會想趕快關掉,隨手點第一顆。
 *
 * ⚠️ 決策重量不來自遮罩,來自「三條真的玩起來不一樣」。所以改成**不阻斷、不過期、可累積**:
 * 里程碑到了只記一筆待辦,玩家想選時再來英雄頁選,一次可以補選多筆。
 * 防隨手誤觸改用兩段式(選中 → 確認),與命運之間同一套語彙。
 *
 * 文案一律**先講你想怎麼打,再講數字**——第一次玩的玩家看到「攻擊間隔 ×1.12」
 * 是不會有任何感覺的。
 */
export const TRAINING_NAME: Record<TrainingId, string> = {
  heavy: '重擊操練',
  rapid: '疾攻操練',
  morale: '主動操練',
}

const TRAINING: Array<{
  id: TrainingId
  role: string
  lead: string
  desc: string
  result: string
}> = [
  {
    id: 'heavy',
    role: '單擊 / 爆發',
    lead: '一刀一刀,慢慢砍。',
    desc: '出手變慢,但每一下更重。你會盯著單擊數字打,也更適合抓背刺與爆發時機——代價是護盾層要拆比較久。',
    result: `攻擊間隔 ×${B.TRAINING_HEAVY_INTERVAL}・總 DPS 不變`,
  },
  {
    id: 'rapid',
    role: '命中 / 殘影',
    lead: '打得又快又碎。',
    desc: '出手變快,同樣的傷害切成更多次。護盾、殘影、每次命中才觸發的效果全部吃這個。',
    result: `攻擊間隔 ×${B.TRAINING_RAPID_INTERVAL}・總 DPS 不變`,
  },
]

/**
 * 英雄頁的「本輪操練」卡。有待辦時是三選一,沒有時是唯讀統計。
 * ⚠️ 版位固定,不隨 pending 移動:選完最後一次的瞬間整張卡在手指下方換位置,
 * 是最容易誤觸的時機。
 */
export default function TrainingCard() {
  const s = useGameState()
  const choose = useGame((state) => state.chooseTraining)
  const pending = pendingTrainingCount(s)
  const [picked, setPicked] = useState<TrainingId | null>(null)

  // 選完一次就清掉高亮,手指停在原地也不會連投同一條
  useEffect(() => {
    setPicked(null)
  }, [pending])

  return (
    <div className="card">
      <div className="head">
        <b>本輪操練</b>
        {pending > 0 ? (
          <small className="training-badge">可分配 {pending} 次</small>
        ) : (
          <small className="affix">
            {s.training.length} / {B.TRAINING_FLOORS.length}
          </small>
        )}
      </div>

      {pending > 0 && (
        <>
          <div className="affix" style={{ marginBottom: 8, lineHeight: 1.6 }}>
            你的戰鬥方式想偏向哪一邊?本輪共 {B.TRAINING_FLOORS.length} 次,選了不能改,轉生才會重來。
          </div>
          <div className="training-options">
            {TRAINING.map((item) => {
              const count = trainingCount(s, item.id)
              const on = picked === item.id
              return (
                <button
                  key={item.id}
                  className={`training-option training-option-${item.id}${on ? ' selected' : ''}`}
                  aria-pressed={on}
                  onClick={() => setPicked(on ? null : item.id)}
                >
                  <span className="training-rank">{count > 0 ? `已投入 ${count} 次` : '尚未投入'}</span>
                  <span className="training-role">{item.role}</span>
                  <b>{TRAINING_NAME[item.id]}</b>
                  <span className="training-lead">{item.lead}</span>
                  <span className="training-desc">{item.desc}</span>
                  <span className="training-result">{item.result}</span>
                </button>
              )
            })}
          </div>
          <div className="btn-row">
            <button className="btn primary" disabled={!picked} onClick={() => picked && choose(picked)}>
              {picked ? `投入${TRAINING_NAME[picked]}` : '先選一個方向'}
            </button>
          </div>
        </>
      )}

      {s.training.length === 0 && pending === 0 ? (
        <div className="affix">推進到第 {B.TRAINING_FLOORS[0]} 層開始,一路上可以分配 {B.TRAINING_FLOORS.length} 次操練方向。</div>
      ) : (
        s.training.length > 0 && (
          <>
            {(['heavy', 'rapid'] as TrainingId[]).map((id) => (
              <div className="row" key={id}>
                <span className="k">{TRAINING_NAME[id]}</span>
                <span className="v">×{trainingCount(s, id)}</span>
              </div>
            ))}
            <div className="affix" style={{ paddingTop: 6 }}>
              目前自動攻擊間隔 {attackInterval(s).toFixed(2)} 秒;攻速改變不會偷偷改掉總 DPS。
            </div>
          </>
        )
      )}
    </div>
  )
}
