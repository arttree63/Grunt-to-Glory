import * as B from './balance'
import { ALL_LEGENDS } from './legends'
import type { GameState } from './types'

/**
 * 軍 功 記 錄(成就)。
 *
 * ⚠️ 為什麼要有這個系統,而它為什麼**不給任何數值獎勵**:
 * 1. **早期解鎖節奏**:開局前三分鐘除了「升級」沒有任何新東西,而對照組(點擊泰坦)
 *    第一分鐘就給你五六次解鎖。成就把玩家本來就會達成的里程碑變成看得見的事件。
 * 2. **清單即內容目錄**:未達成的條目照樣顯示(不藏),玩家掃一眼就知道這遊戲裡有
 *    套裝、傳說、宿敵、命運三路、五種傭兵——這是「這不是試玩版」最便宜的證據。
 * 3. **不給獎勵是刻意的**:給勳章會動到已驗證的轉生曲線(game-balance § 四),
 *    給素材會動到鍛造節奏。成就的價值放在「知道自己走到哪」,不放在強度。
 *
 * 跨轉生保留(存進 `achieved`)。判定一律用「已經存在的狀態欄位」,不新增計數器——
 * 新增計數器就要處理遷移與歸零時機,不值得。
 */
export interface Achievement {
  id: string
  name: string
  /** 達成條件的白話說明。未達成時照樣顯示 = 內容預告 */
  desc: string
  group: '推進' | '戰鬥' | '鍛造' | '構築' | '傳承'
  done: (s: GameState) => boolean
}

/** 已裝備 + 背包裡帶某個套裝標籤的件數(成就用,不看是否啟動) */
function setPieces(s: GameState, tag: string): number {
  return [...s.inventory, ...Object.values(s.equipped)].filter((e) => e?.setTag === tag).length
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── 推進:開局前幾分鐘就會連續達成,負責建立「一直有東西解鎖」的節奏 ──
  { id: 'floor5', name: '踏上戰場', desc: '推進到第 5 層', group: '推進', done: (s) => s.highestFloor >= 5 },
  {
    id: 'boss1',
    name: '第一個守關者',
    desc: `擊破任一守關者(每 ${B.BOSS_EVERY} 層一個)`,
    group: '推進',
    done: (s) => s.bossKills >= 1,
  },
  { id: 'floor25', name: '老兵的資格', desc: `推進到第 ${B.AWAKEN_FLOOR} 層(第二技能的門檻)`, group: '推進', done: (s) => s.mercBestFloor >= B.AWAKEN_FLOOR },
  { id: 'floor50', name: '深入敵境', desc: '推進到第 50 層', group: '推進', done: (s) => s.mercBestFloor >= 50 },
  { id: 'floor100', name: '百層之上', desc: '推進到第 100 層', group: '推進', done: (s) => s.mercBestFloor >= 100 },
  { id: 'floor150', name: '無人抵達之處', desc: '推進到第 150 層', group: '推進', done: (s) => s.mercBestFloor >= 150 },

  // ── 戰鬥 ──
  { id: 'kill100', name: '百人斬', desc: '單輪擊殺 100 隻', group: '戰鬥', done: (s) => s.runStats.kills >= 100 },
  { id: 'boss10', name: '守關者剋星', desc: '累積擊破 10 個守關者', group: '戰鬥', done: (s) => s.bossKills >= 10 },
  { id: 'boss50', name: '關卡屠夫', desc: '累積擊破 50 個守關者', group: '戰鬥', done: (s) => s.bossKills >= 50 },
  { id: 'combo30', name: '連斬如流', desc: '連斬達到 30 層', group: '戰鬥', done: (s) => s.combo >= 30 },
  {
    id: 'lore',
    name: '知己知彼',
    desc: '三種守關者原型(拆盾/蓄力/圖騰)各處理過一次',
    group: '戰鬥',
    done: (s) => s.bossLore.shell.handled > 0 && s.bossLore.channel.handled > 0 && s.bossLore.totem.handled > 0,
  },
  // ⚠️ 原為「戰意昂揚疊到 10 層」。戰意 2026-08-02 完全移除,改判軍團規模——
  // 軍功記錄要指向**還存在**的系統,否則會變成永遠達不成的死條目
  { id: 'zeal', name: '全軍待命', desc: '單場把軍團部署到滿編', group: '戰鬥', done: (s) => s.armyUnits >= 5 },
  {
    id: 'nemesis',
    name: '宿怨終結',
    desc: '擊敗一個家族宿敵(同一層敗多次後結怨)',
    group: '戰鬥',
    done: (s) => !!s.nemesis?.resolved,
  },

  // ── 鍛造 ──
  { id: 'forge1', name: '初次開錘', desc: '鍛造一件裝備', group: '鍛造', done: (s) => s.forgeCount >= 1 },
  { id: 'forge100', name: '鐵匠鋪常客', desc: '累積鍛造 100 次', group: '鍛造', done: (s) => s.forgeCount >= 100 },
  {
    id: 'purple',
    name: '菁英出爐',
    desc: '打造出史詩(紫)以上品質',
    group: '鍛造',
    done: (s) => [...s.inventory, ...Object.values(s.equipped), ...s.codex].some((e) => e && (e.quality === 'purple' || e.quality === 'gold' || e.quality === 'crimson')),
  },
  {
    id: 'crimson',
    name: '神兵利器',
    desc: '打造出神器(暗紅)品質',
    group: '鍛造',
    done: (s) => [...s.inventory, ...Object.values(s.equipped), ...s.codex].some((e) => e?.quality === 'crimson'),
  },
  {
    id: 'fullgear',
    name: '全副武裝',
    desc: '五個部位同時穿滿裝備',
    group: '鍛造',
    done: (s) => Object.values(s.equipped).every((e) => !!e),
  },

  // ── 構築:清單本身就在告訴玩家「這遊戲有傳說/套裝/命運三路」 ──
  { id: 'legend1', name: '第一件傳說', desc: '取得任一件帶傳說特性的裝備', group: '構築', done: (s) => s.legendsSeen.length >= 1 },
  {
    id: 'legendhalf',
    name: '傳說收藏家',
    desc: `見過 ${Math.ceil(ALL_LEGENDS.length / 2)} 種傳說特性`,
    group: '構築',
    done: (s) => s.legendsSeen.length >= Math.ceil(ALL_LEGENDS.length / 2),
  },
  {
    id: 'legendall',
    name: '傳說大全',
    desc: `見過全部 ${ALL_LEGENDS.length} 種傳說特性`,
    group: '構築',
    done: (s) => s.legendsSeen.length >= ALL_LEGENDS.length,
  },
  {
    id: 'set2',
    name: '成套的力量',
    desc: '湊齊同一套裝標籤 2 件',
    group: '構築',
    done: (s) => setPieces(s, 'ironwall') >= 2 || setPieces(s, 'commander') >= 2,
  },
  {
    id: 'set3',
    name: '完整軍陣',
    desc: '湊齊同一套裝標籤 3 件(套裝效果全開)',
    group: '構築',
    done: (s) => setPieces(s, 'ironwall') >= 3 || setPieces(s, 'commander') >= 3,
  },
  { id: 'awaken', name: '職業覺醒', desc: '解鎖第二技能(印記體系)', group: '構築', done: (s) => Object.keys(s.jobMatrix).length > 0 && s.destinyNodes.length > 0 && s.mercBestFloor >= B.AWAKEN_FLOOR },
  {
    id: 'destinyfull',
    name: '命運已定',
    desc: '單輪點滿一條命運路線的所有節點',
    group: '構築',
    done: (s) => s.destinyNodes.length >= 4,
  },
  {
    id: 'merc',
    name: '不再獨行',
    desc: '解鎖第二名傭兵(歷代最高第 30 層)',
    group: '構築',
    done: (s) => s.mercBestFloor >= 30,
  },
  {
    id: 'mercall',
    name: '整支小隊',
    desc: '解鎖全部五名傭兵(歷代最高第 120 層)',
    group: '構築',
    done: (s) => s.mercBestFloor >= 120,
  },

  // ── 傳承 ──
  { id: 'prestige1', name: '讓下一代接棒', desc: '完成第一次退役', group: '傳承', done: (s) => s.runs >= 1 },
  { id: 'prestige5', name: '第五代小兵', desc: '完成 5 次退役', group: '傳承', done: (s) => s.runs >= 5 },
  { id: 'tech10', name: '軍需充足', desc: '軍需處科技合計 10 級', group: '傳承', done: (s) => Object.values(s.techs).reduce((a, b) => a + b, 0) >= 10 },
  { id: 'heirloom', name: '家族之物', desc: '讓一件傳家之器修復完成', group: '傳承', done: (s) => [...s.inventory, ...Object.values(s.equipped)].some((e) => e?.heirloom && !e.broken) },
  { id: 'codex', name: '傳承圖鑑', desc: '圖鑑登錄 3 件裝備', group: '傳承', done: (s) => s.codex.length >= 3 },
  {
    id: 'alljobs',
    name: '走過每一條路',
    desc: '歷代當過 6 種以上職業',
    group: '傳承',
    done: (s) => Object.keys(s.jobMatrix).length >= 6,
  },
]

export const ACHIEVEMENT_GROUPS = ['推進', '戰鬥', '鍛造', '構築', '傳承'] as const

/**
 * 回傳這一 tick 新達成的成就 id。
 * ⚠️ 只掃「還沒拿到的」,拿到就不再判定——條件裡有幾個是單輪狀態(連斬/昂揚/擊殺數),
 * 轉生後會歸零,已達成的不可以被收回。
 */
export function newAchievements(s: GameState): string[] {
  const got: string[] = []
  for (const a of ACHIEVEMENTS) {
    if (s.achieved.includes(a.id)) continue
    if (a.done(s)) got.push(a.id)
  }
  return got
}
