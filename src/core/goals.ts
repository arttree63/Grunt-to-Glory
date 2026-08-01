import * as B from './balance'
import { isBossFloor } from './formulas'
import { MERCS } from './mercs'
import { TRAINING_BRANCHES } from './trainingTree'
import { canBuyTech, TECHS } from './techs'
import { bestFloorEver, runStalled } from './game'
import type { GameState } from './types'

/**
 * 「差一點」三層收斂(蔡加尼克的反面:同屏超過十個「差一點」是雜訊)。
 * 每層同時只有一個目標:
 * - near:幾分鐘內就能做的事 → 唯一的 tab 紅點由它驅動
 * - run:本輪的下一個里程碑
 * - legacy:跨轉生的長期目標
 */
export type GoalTab = 'hero' | 'equip' | 'forge' | 'destiny' | 'journal' | 'legacy'

export interface Goal {
  text: string
  /** near 目標對應的分頁(紅點亮在這);run / legacy 不亮紅點 */
  tab: GoalTab | null
}

/** 近期:現在就能做的一件事。優先序 = 對玩法的影響大小,不是誰先觸發 */
export function nearGoal(s: GameState): Goal | null {
  // ⚠️ 最高優先:這一輪已經推不動了。原本這件事只寫在一顆叫玩家「挑戰第 N 層 Boss」
  // 的按鈕裡的第三行小字,而且要先輸過一次 Boss 才會渲染——等於沒講。
  // 目標曲線的最後一環(解放 → 期待下一輪)靠它接上。
  if (runStalled(s)) return { text: '這一代推不動了,可以退役換勳章', tab: 'legacy' }
  if (s.destinyPoints > 0) return { text: '有命運抉擇待決定', tab: 'destiny' }
  if (s.encounters.length > 0) return { text: '路上有際遇等著處理', tab: 'journal' }
  if (s.materials >= B.FORGE_COST) return { text: '素材夠打造一次', tab: 'forge' }
  if (TECHS.some((t) => canBuyTech(s.techs, s.medals, t.id)) || s.medals >= B.ELITE_MEDAL_COST)
    return { text: '勳章夠買永久強化', tab: 'legacy' }
  return null
}

/** 本輪:下一個里程碑 */
export function runGoal(s: GameState): Goal {
  if (s.bossFailed && s.bossRetryFloor !== null)
    // ⚠️ v4.1 起一般層也會失敗(耐久歸零),那裡沒有守關者——不加這道判斷就是對玩家說謊
    return {
      text: isBossFloor(s.bossRetryFloor)
        ? `重整旗鼓,再戰第 ${s.bossRetryFloor} 層守關者`
        : `重整旗鼓,再攻第 ${s.bossRetryFloor} 層`,
      tab: null,
    }
  if (!s.destinyPath && s.floor <= B.DESTINY_SEED_FLOOR)
    return { text: `擊破第 ${B.DESTINY_SEED_FLOOR} 層守關者,迎接首次命運降臨`, tab: null }
  const milestone = B.DESTINY_MILESTONES[s.destinyEarned]
  if (milestone !== undefined && s.floor <= milestone)
    return { text: `擊破第 ${milestone} 層守關者,進入命運抉擇`, tab: null }
  const focus = TRAINING_BRANCHES.find((branch) => branch.id === s.trackFocus)
  const nextSkill = focus?.nodes.find((node) => s.tracks[s.trackFocus] < node.level)
  if (focus && nextSkill)
    return { text: `${focus.name}再投入 ${nextSkill.level - s.tracks[s.trackFocus]} 點，解鎖「${nextSkill.name}」`, tab: null }
  // 沒有特定里程碑就指向下一個守關者
  const nextBoss = Math.floor(s.floor / 10) * 10 + 10
  return { text: `攻上第 ${nextBoss} 層守關者`, tab: null }
}

/** 跨輪:轉生也帶得走的目標 */
export function legacyGoal(s: GameState): Goal {
  // 最接近買得起的科技(差最少勳章的那個)
  const pending = TECHS.filter(
    (t) => (t.maxLevel === undefined || s.techs[t.id] < t.maxLevel) && s.medals < t.cost,
  ).sort((a, b) => a.cost - b.cost)[0]
  if (pending)
    return { text: `再攢 ${pending.cost - s.medals} 枚勳章買「${pending.name}」`, tab: null }
  const best = bestFloorEver(s)
  const nextMerc = Object.values(MERCS).filter((m) => m.unlockFloor > best).sort(
    (a, b) => a.unlockFloor - b.unlockFloor,
  )[0]
  if (nextMerc)
    return { text: `歷代最高抵達第 ${nextMerc.unlockFloor} 層,解鎖新傭兵`, tab: null }
  return { text: '轉生累積勳章,讓下一代更強', tab: null }
}
