import type { BaseType, JobId, LegendId, MechanicTag, SkillId, Slot } from './types'

/**
 * 傳說裝(裝備第三層):單件改變玩法,不是更大的數字。
 *
 * ⚠️ 兩件事寫在這裡免得下次又踩:
 * 1. 修訂案 v1.4 的傳說掛在「疾影穿刺 / 迴身追獵 / 元素裁決」上,那三個技能**不存在**——
 *    程式裡是盾牆突擊 / 疾風連刺 / 聖光審判 + 印記體系。這裡全部改掛實際技能。
 * 2. 「連鎖 / 擴散 / 彈射」需要多目標,現行引擎一次只有一個敵人,所以那類效果一律不做,
 *    改用能落地的關鍵字:儲存、轉化、順序、冷卻完成、遺物。
 *
 * power-neutral(§ 四):單件淨輸出增益上限 ±10%,差異來自「怎麼打」不是「打多少」。
 */
export interface Legend {
  id: LegendId
  name: string
  /** 固定部位 + 固定基底 = 白裝基底是打造入口(想要這件就得投對素材) */
  slot: Slot
  base: BaseType
  /** 推薦職業(null = 通用傳說)。⚠️ 只是標示,不擋打造——部位+基底才是打造入口 */
  jobs: JobId[] | null
  /** 玩家看到的一行:這件會怎麼改變我的玩法 */
  effect: string
  /** 機制關鍵字(13 個 enum,見 keywords.ts)。禁止自由字串 */
  tags: MechanicTag[]
  /** 這件會改到哪個技能(UI 直接顯示,玩家才知道它動了什麼) */
  affects: SkillId[]
  /** 適合的構築方向,鍛造結果頁顯示 */
  builds: string
}

export const LEGENDS: Record<LegendId, Legend> = {
  wall: {
    id: 'wall',
    name: '不退之壁',
    slot: 'body',
    base: 'guard',
    jobs: ['infantry', 'paladin', 'forgewarden'],
    effect: '盾牆突擊不再倒數結束,改為常駐軍陣;倍率降為原本的平均值,印記改為機率累積',
    tags: ['store', 'formation'],
    affects: ['shieldRush', 'bulwark'],
    builds: '陣地流 / 穩定輸出流',
  },
  windboots: {
    id: 'windboots',
    name: '追風者之靴',
    slot: 'boots',
    base: 'swift',
    jobs: ['scout', 'shadow', 'shadowvanguard'],
    effect: '暴擊不再只是傷害,還會推進第二技能的冷卻(每秒上限 3 次)',
    tags: ['cooldown_complete', 'mark'],
    affects: ['windMark'],
    builds: '暴擊流 / 高頻引爆流',
  },
  codexpage: {
    id: 'codexpage',
    name: '法典殘頁',
    slot: 'trinket',
    base: 'focus',
    jobs: ['marshal', 'archmage', 'relicarbiter'],
    effect: '引爆印記時保留三分之一不清空,但每枚威力降低——改為連續小引爆',
    tags: ['store', 'sequence'],
    affects: ['edict'],
    builds: '循環流 / 印記流',
  },
  hourglass: {
    id: 'hourglass',
    name: '倒轉沙漏',
    slot: 'head',
    base: 'focus',
    jobs: null,
    effect: '施放過三個不同技能後,立即推進冷卻最長那個技能的冷卻',
    tags: ['cooldown_complete', 'sequence'],
    affects: [],
    builds: '循環流 / 技能流',
  },
  greedeye: {
    id: 'greedeye',
    name: '貪婪之眼',
    slot: 'head',
    base: 'heavy',
    jobs: null,
    effect: '打造出菁英以上裝備後,下一場 Boss 開場數秒出現遺物弱點',
    tags: ['relic', 'mark'],
    affects: [],
    builds: '鍛造流 / Boss 檢定流',
  },
  lostbanner: {
    id: 'lostbanner',
    name: '失落軍旗',
    slot: 'weapon',
    base: 'guard',
    jobs: null,
    effect: '戰意滿檔不立刻爆發,改為儲存進軍旗,下次施放技能時一起釋放(總量不變)',
    tags: ['store', 'transform'],
    affects: [],
    builds: '節奏流 / 爆發流',
  },
  // ── v1.5 行為型傳說:合格門檻是「穿上之後畫面會多發生什麼」,不是數字 ──
  twinblade: {
    id: 'twinblade',
    name: '雙生影刃',
    slot: 'weapon',
    base: 'swift',
    jobs: ['scout', 'shadow', 'shadowvanguard'],
    effect: '疾風連刺期間召喚影分身同步攻擊——本體 70%、分身 30%,總量不變但變成雙行動者',
    tags: ['clone', 'afterimage'],
    affects: ['gale', 'shadowClone'],
    builds: '分身流 / 殘影流',
  },
  bannerflag: {
    id: 'bannerflag',
    name: '熔火軍旗',
    slot: 'weapon',
    base: 'heavy',
    jobs: ['infantry', 'paladin', 'forgewarden'],
    effect: '盾牆突擊在地上插下軍旗;軍旗存在期間,每次攻擊分出一道衝擊由軍旗位置打出(總量不變)',
    tags: ['zone', 'formation'],
    affects: ['shieldRush', 'bulwark'],
    builds: '陣地流 / 場地流',
  },
  ember: {
    id: 'ember',
    name: '裁決餘燼',
    slot: 'body',
    base: 'focus',
    jobs: ['marshal', 'archmage', 'relicarbiter'],
    effect: '聖光審判改為七成立即命中,三成化為燃燒在數秒內燒完(總量不變,敵人會持續冒火)',
    tags: ['status', 'transform'],
    affects: ['judgement', 'meteor'],
    builds: '狀態流 / 燃燒流',
  },
}

export const ALL_LEGENDS = Object.values(LEGENDS)

/**
 * 這個部位 + 基底能打出哪件傳說(打造入口:投對素材才有機會)。
 * ⚠️ 不依職業過濾:否則法警永遠打不出重裝系傳說,「基底是打造入口」這件事就不成立,
 * 而且職業核心傳說的效果對沒有對應技能的職業本來就是空的,不需要另外擋。
 */
export function legendFor(slot: Slot, base: BaseType | undefined): Legend | null {
  if (!base) return null
  return ALL_LEGENDS.find((l) => l.slot === slot && l.base === base) ?? null
}
