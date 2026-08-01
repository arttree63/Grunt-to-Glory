import type { TrackId } from './types'

export type TrainingNodeKind = 'core' | 'active' | 'command' | 'legend'

export interface TrainingNode {
  level: 20 | 50 | 100 | 200
  name: string
  kind: TrainingNodeKind
  desc: string
  corps: string
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
      { level: 20, name: '重擊', kind: 'core', desc: '造成高額單次傷害，對格狀護盾有額外破盾值。', corps: '先鋒軍' },
      { level: 50, name: '衝鋒', kind: 'active', desc: '消耗部分軍勢，英雄與先鋒軍一同連續突擊。', corps: '先鋒軍' },
      { level: 100, name: '先鋒號令', kind: 'command', desc: '命令軍團協同攻擊，擊殺會返還少量軍勢。', corps: '精銳先鋒' },
      { level: 200, name: '武神姿態', kind: 'legend', desc: '軍勢全滿時進入總攻，強化本人與軍團。', corps: '皇家近衛軍' },
    ],
  },
  {
    id: 'body',
    name: '體能',
    role: '格擋・生存',
    resource: '格擋層',
    color: '#4d83b5',
    nodes: [
      { level: 20, name: '格擋', kind: 'core', desc: '抵消下一次威脅傷害，成功時建立一層格擋。', corps: '盾衛軍' },
      { level: 50, name: '鐵壁', kind: 'active', desc: '短時間提高減傷，每次受擊都讓盾衛軍反擊。', corps: '盾衛軍' },
      { level: 100, name: '盾衛號令', kind: 'command', desc: '盾衛軍代為承受一次威脅，成功後全軍反擊。', corps: '重盾軍' },
      { level: 200, name: '不落要塞', kind: 'legend', desc: '短時間內 HP 不低於 1，結束時依格擋次數回血。', corps: '皇家鐵衛隊' },
    ],
  },
  {
    id: 'agility',
    name: '身法',
    role: '迴避・多段',
    resource: '連擊',
    color: '#4b9b6b',
    nodes: [
      { level: 20, name: '翻滾', kind: 'core', desc: '閃避下一次威脅，成功後立刻追加一次反擊。', corps: '游擊兵' },
      { level: 50, name: '疾走', kind: 'active', desc: '短時間增加攻擊事件數，適合快速拆除格狀護盾。', corps: '游擊兵' },
      { level: 100, name: '游擊號令', kind: 'command', desc: '游擊兵製造多次命中，依連擊數增加攻擊段數。', corps: '騎兵軍' },
      { level: 200, name: '無影突襲', kind: 'legend', desc: '消耗全部連擊展開多段突襲，每段獨立判定暴擊。', corps: '皇家影衛' },
    ],
  },
  {
    id: 'magic',
    name: '魔法',
    role: '範圍・元素',
    resource: '元素能量',
    color: '#8358ad',
    nodes: [
      { level: 20, name: '火球術', kind: 'core', desc: '造成範圍爆發並附加燃燒，適合清理普通敵人。', corps: '法師軍' },
      { level: 50, name: '元素爆發', kind: 'active', desc: '消耗元素能量，依火或冰狀態產生不同效果。', corps: '法師軍' },
      { level: 100, name: '法師號令', kind: 'command', desc: '全軍共同詠唱，短暫延遲後造成大型範圍傷害。', corps: '元素法師團' },
      { level: 200, name: '禁咒', kind: 'legend', desc: '消耗全部 MP，依施放時的 MP 造成大型爆發。', corps: '皇家法師團' },
    ],
  },
  {
    id: 'faith',
    name: '信仰',
    role: '治療・淨化',
    resource: '祝福',
    color: '#c6a244',
    nodes: [
      { level: 20, name: '治療術', kind: 'core', desc: '回復 HP；滿血施放時，溢出治療轉為護盾。', corps: '祭司軍' },
      { level: 50, name: '神聖祝福', kind: 'active', desc: '提高治療與異常抗性，祭司軍同步進行治療。', corps: '祭司軍' },
      { level: 100, name: '祭司號令', kind: 'command', desc: '祭司軍治療英雄；滿血時改為聖光攻擊。', corps: '神官團' },
      { level: 200, name: '聖域', kind: 'legend', desc: '持續回血並淨化負面狀態，領域內敵人承受額外傷害。', corps: '聖騎士團' },
    ],
  },
]

export const FUSION_SKILLS: FusionSkill[] = [
  { tracks: ['arms', 'body'], name: '盾牆衝鋒', desc: '衝鋒時獲得格擋，成功格擋追加重擊。', evolved: '格擋反擊會返還軍勢。', final: '不落要塞期間，衝鋒不消耗軍勢。' },
  { tracks: ['arms', 'agility'], name: '迅雷突擊', desc: '重擊拆成多段，每次暴擊累積軍勢。', evolved: '衝鋒會保留目前一半連擊。', final: '武神姿態期間所有攻擊視為突襲。' },
  { tracks: ['arms', 'magic'], name: '魔劍術', desc: '重擊附帶目前元素，破盾後觸發元素爆發。', evolved: '軍勢滿層時不消耗元素能量。', final: '禁咒後的下一次重擊必定暴擊。' },
  { tracks: ['arms', 'faith'], name: '聖光裁決', desc: '重擊依本場治療量追加傷害。', evolved: '溢出治療會累積軍勢。', final: '聖域中的衝鋒會召集皇家近衛。' },
  { tracks: ['body', 'agility'], name: '鋼鐵游擊', desc: '閃避後獲得格擋，格擋後提高連擊。', evolved: '翻滾失敗時消耗一層格擋代替。', final: '三次交替觸發後自動發動游擊號令。' },
  { tracks: ['body', 'magic'], name: '元素護盾', desc: '格擋成功時釋放元素反擊。', evolved: '冰元素延長格擋，火元素提高反擊。', final: '不落要塞結束時引爆全部元素能量。' },
  { tracks: ['body', 'faith'], name: '不滅戰線', desc: '溢出治療轉為格擋，低血量時自動治療一次。', evolved: '盾衛號令同步淨化一個負面狀態。', final: '聖域期間格擋不會消失。' },
  { tracks: ['agility', 'magic'], name: '幻影法陣', desc: '多段攻擊累積元素能量，元素爆發增加段數。', evolved: '成功閃避會複製上一個元素法術。', final: '無影突襲的最後一擊引爆禁咒殘響。' },
  { tracks: ['agility', 'faith'], name: '神行祝禱', desc: '成功閃避觸發治療，滿血時改為提高暴擊。', evolved: '治療暴擊會增加連擊。', final: '聖域內第一次威脅必定迴避。' },
  { tracks: ['magic', 'faith'], name: '聖光領域', desc: '元素傷害會治療英雄並淨化負面狀態。', evolved: '治療術會保留目前元素狀態。', final: '禁咒與聖域同時存在時召集全軍。' },
]

export const TRAINING_BRANCH_NAME = Object.fromEntries(
  TRAINING_BRANCHES.map((branch) => [branch.id, branch.name]),
) as Record<TrackId, string>
