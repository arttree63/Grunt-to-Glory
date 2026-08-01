import type { SkillId, TrackId } from './types'

export type TrainingNodeKind = 'core' | 'active' | 'command' | 'legend'

export interface TrainingNode {
  level: 20 | 50 | 100 | 200
  name: string
  kind: TrainingNodeKind
  desc: string
  corps: string
  skillId: SkillId
}

export interface TrainingBranch {
  id: TrackId
  name: string
  role: string
  resource: string
  color: string
  nodes: TrainingNode[]
}

export interface FusionSkill {
  tracks: [TrackId, TrackId]
  name: string
  desc: string
  evolved: string
  final: string
}

export const TRAINING_BRANCHES: TrainingBranch[] = [
  {
    id: 'arms',
    name: '武藝',
    role: '單擊・破盾',
    resource: '軍勢',
    color: '#c85b45',
    nodes: [
      { level: 20, name: '重擊', kind: 'core', desc: '造成高額單次傷害，對格狀護盾有額外破盾值。', corps: '先鋒軍', skillId: 'armsHeavy' },
      { level: 50, name: '衝鋒', kind: 'active', desc: '英雄與先鋒軍一同發動三段突擊。', corps: '先鋒軍', skillId: 'armsCharge' },
      { level: 100, name: '先鋒號令', kind: 'command', desc: '命令精銳先鋒發動五段協同攻擊。', corps: '精銳先鋒', skillId: 'armsCommand' },
      { level: 200, name: '武神姿態', kind: 'legend', desc: '進入總攻姿態，大幅強化本人與軍團。', corps: '皇家近衛軍', skillId: 'armsLegend' },
    ],
  },
  {
    id: 'body',
    name: '體能',
    role: '格擋・生存',
    resource: '格擋層',
    color: '#4d83b5',
    nodes: [
      { level: 20, name: '格擋', kind: 'core', desc: '短時間大幅降低威脅傷害。', corps: '盾衛軍', skillId: 'bodyGuard' },
      { level: 50, name: '鐵壁', kind: 'active', desc: '展開減傷陣線並提高反擊傷害。', corps: '盾衛軍', skillId: 'bodyIronwall' },
      { level: 100, name: '盾衛號令', kind: 'command', desc: '全軍舉盾，回復 HP 並建立防禦陣線。', corps: '重盾軍', skillId: 'bodyCommand' },
      { level: 200, name: '不落要塞', kind: 'legend', desc: '大幅減傷、強化攻擊並立即回復 HP。', corps: '皇家鐵衛隊', skillId: 'bodyLegend' },
    ],
  },
  {
    id: 'agility',
    name: '身法',
    role: '迴避・多段',
    resource: '連擊',
    color: '#4b9b6b',
    nodes: [
      { level: 20, name: '翻滾', kind: 'core', desc: '短時間迴避威脅並提高暴擊率。', corps: '游擊兵', skillId: 'agilityRoll' },
      { level: 50, name: '疾走', kind: 'active', desc: '提高攻擊速度與暴擊率。', corps: '游擊兵', skillId: 'agilityHaste' },
      { level: 100, name: '游擊號令', kind: 'command', desc: '游擊兵發動八段攻擊，快速拆除護盾。', corps: '騎兵軍', skillId: 'agilityCommand' },
      { level: 200, name: '無影突襲', kind: 'legend', desc: '皇家影衛展開高速總攻。', corps: '皇家影衛', skillId: 'agilityLegend' },
    ],
  },
  {
    id: 'magic',
    name: '魔法',
    role: '範圍・元素',
    resource: '元素能量',
    color: '#8358ad',
    nodes: [
      { level: 20, name: '火球術', kind: 'core', desc: '造成範圍魔法爆發。', corps: '法師軍', skillId: 'magicFireball' },
      { level: 50, name: '元素爆發', kind: 'active', desc: '引爆元素能量，造成三段魔法傷害。', corps: '法師軍', skillId: 'magicBurst' },
      { level: 100, name: '法師號令', kind: 'command', desc: '全軍共同詠唱大型範圍法術。', corps: '元素法師團', skillId: 'magicCommand' },
      { level: 200, name: '禁咒', kind: 'legend', desc: '消耗大量 MP，造成最高級魔法爆發。', corps: '皇家法師團', skillId: 'magicLegend' },
    ],
  },
  {
    id: 'faith',
    name: '信仰',
    role: '治療・淨化',
    resource: '祝福',
    color: '#c6a244',
    nodes: [
      { level: 20, name: '治療術', kind: 'core', desc: '立即回復 25% HP。', corps: '祭司軍', skillId: 'faithHeal' },
      { level: 50, name: '神聖祝福', kind: 'active', desc: '回復 HP，並提高傷害與防禦。', corps: '祭司軍', skillId: 'faithBlessing' },
      { level: 100, name: '祭司號令', kind: 'command', desc: '全軍治療英雄並降下聖光攻擊。', corps: '神官團', skillId: 'faithCommand' },
      { level: 200, name: '聖域', kind: 'legend', desc: '大量治療，並展開攻防一體的聖域。', corps: '聖騎士團', skillId: 'faithLegend' },
    ],
  },
]

export const FUSION_SKILLS: FusionSkill[] = [
  { tracks: ['arms', 'body'], name: '盾牆衝鋒', desc: '武神姿態額外減少 20% 威脅傷害。', evolved: '減傷提高為 35%。', final: '減傷提高為 50%。' },
  { tracks: ['arms', 'agility'], name: '迅雷突擊', desc: '重擊追加 1 次獨立命中。', evolved: '追加命中提高為 2 次。', final: '追加命中提高為 3 次。' },
  { tracks: ['arms', 'magic'], name: '魔劍術', desc: '重擊傷害提高 15%。', evolved: '重擊傷害提高 30%。', final: '重擊傷害提高 45%。' },
  { tracks: ['arms', 'faith'], name: '聖光裁決', desc: '重擊同時回復 3% HP。', evolved: '回復提高為 6%。', final: '回復提高為 9%。' },
  { tracks: ['body', 'agility'], name: '鋼鐵游擊', desc: '翻滾期間額外減少 15% 威脅傷害。', evolved: '額外減傷提高為 30%。', final: '額外減傷提高為 45%。' },
  { tracks: ['body', 'magic'], name: '元素護盾', desc: '格擋時反擊 3 秒份傷害。', evolved: '反擊提高為 6 秒份。', final: '反擊提高為 9 秒份。' },
  { tracks: ['body', 'faith'], name: '不滅戰線', desc: '所有技能治療量提高 15%。', evolved: '治療提高 30%。', final: '治療提高 45%。' },
  { tracks: ['agility', 'magic'], name: '幻影法陣', desc: '元素爆發追加 2 次命中。', evolved: '追加命中提高為 4 次。', final: '追加命中提高為 6 次。' },
  { tracks: ['agility', 'faith'], name: '神行祝禱', desc: '翻滾同時回復 5% HP。', evolved: '回復提高為 10%。', final: '回復提高為 15%。' },
  { tracks: ['magic', 'faith'], name: '聖光領域', desc: '施放魔法技能時回復 3% HP。', evolved: '回復提高為 6%。', final: '回復提高為 9%。' },
]

export const TRAINING_BRANCH_NAME = Object.fromEntries(
  TRAINING_BRANCHES.map((branch) => [branch.id, branch.name]),
) as Record<TrackId, string>
