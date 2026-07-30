import { ZONE_SPAN, zoneIndex } from './zones'

/**
 * 敵 種。
 *
 * ⚠️ 為什麼需要這個:全遊戲只有**兩張小怪素材**(forest-goblin / thorn-imp),
 * 從第 1 層打到第 200 層看到的都是同兩隻。這是地帶染色之後僅次於場景的內容量瓶頸。
 *
 * 解法同樣**不加素材**:同一張圖用 tint + 尺寸 + 名字衍生成不同種族。
 * 玩家認得的「一種怪」= 顏色 + 體型 + 名字,三者都變就是另一種生物;
 * 逐幀重畫只是把同一件事做得更貴。
 *
 * ⚠️ 敵種**不帶任何數值**——HP 與金幣完全由層數決定(game-balance § 二)。
 * 它純粹是辨識度與世界感,動了數值就會牽動已驗證的曲線。
 */
export interface Species {
  name: string
  /** 用哪張基底素材 */
  sprite: 'goblin' | 'imp'
  /** 乘算色。這是「這是另一種生物」最強的訊號 */
  tint: number
  /** 體型倍率(對基準尺寸)。0.85~1.25 之間,超出會壓到主角或看不見 */
  scale: number
}

/**
 * 每個地帶兩種:一種走 goblin 基底(較壯)、一種走 imp 基底(較瘦)。
 * 順序對齊 `zones.ts` 的 ZONES,索引超出就循環——但名字前綴會由 `speciesOf` 加上深淵標記。
 */
const BY_ZONE: Array<[Species, Species]> = [
  [
    { name: '森林哥布林', sprite: 'goblin', tint: 0xffffff, scale: 1 },
    { name: '荊棘小鬼', sprite: 'imp', tint: 0xe8ffe0, scale: 0.9 },
  ],
  [
    { name: '林道劫掠者', sprite: 'goblin', tint: 0xd6e8b8, scale: 1.08 },
    { name: '毒刺魔', sprite: 'imp', tint: 0xc8e8a0, scale: 0.92 },
  ],
  [
    { name: '哨站叛兵', sprite: 'goblin', tint: 0xe8d4a8, scale: 1.05 },
    { name: '拾荒鬼', sprite: 'imp', tint: 0xd8c090, scale: 0.88 },
  ],
  [
    { name: '坑道穴魔', sprite: 'goblin', tint: 0x9fb4d8, scale: 1.15 },
    { name: '礦坑爬蟲', sprite: 'imp', tint: 0x8fa8c0, scale: 0.86 },
  ],
  [
    { name: '蝕骨食屍鬼', sprite: 'goblin', tint: 0x88b0a8, scale: 1.12 },
    { name: '洞窟蝠魔', sprite: 'imp', tint: 0x78a0a0, scale: 0.85 },
  ],
  [
    { name: '古堡守衛屍', sprite: 'goblin', tint: 0xc0a8d0, scale: 1.18 },
    { name: '牆縫魅影', sprite: 'imp', tint: 0xb098c8, scale: 0.9 },
  ],
  [
    { name: '血衛兵', sprite: 'goblin', tint: 0xe09090, scale: 1.2 },
    { name: '迴廊怨靈', sprite: 'imp', tint: 0xd08888, scale: 0.94 },
  ],
  [
    { name: '神殿石像兵', sprite: 'goblin', tint: 0xf0dCa8, scale: 1.25 },
    { name: '階梯守魂', sprite: 'imp', tint: 0xe8d0a0, scale: 0.96 },
  ],
]

/** 這一層有幾種怪(固定 2 種,交替出現) */
export const SPECIES_PER_ZONE = 2

/**
 * 這一層的敵種。同一層的怪只會是這兩種之一,`variant` 決定是哪一種。
 * ⚠️ 深層循環時名字要加「墮化」前綴——同 zones 的理由:原名再出現一次會拆穿內容量。
 */
export function speciesOf(floor: number, variant: number): Species {
  const zi = zoneIndex(floor)
  const pair = BY_ZONE[zi % BY_ZONE.length]
  const base = pair[Math.abs(variant) % SPECIES_PER_ZONE]
  const depth = Math.floor(zi / BY_ZONE.length)
  if (depth === 0) return base
  return {
    ...base,
    name: `墮化${base.name}`,
    // 越深越褪色:同一隻怪在深淵版本看起來更沉、更大
    tint: fade(base.tint, Math.min(0.5, depth * 0.18)),
    scale: Math.min(1.35, base.scale + depth * 0.06),
  }
}

/** 本層的兩種敵種(圖鑑/預告用) */
export function speciesPair(floor: number): Species[] {
  return [speciesOf(floor, 0), speciesOf(floor, 1)]
}

/** 往暗處褪色:r/g/b 各乘 (1-k) */
function fade(tint: number, k: number): number {
  const r = Math.round(((tint >> 16) & 255) * (1 - k))
  const g = Math.round(((tint >> 8) & 255) * (1 - k))
  const b = Math.round((tint & 255) * (1 - k))
  return (r << 16) | (g << 8) | b
}

/** 全部設計中的敵種數(用於「圖鑑有多少」這種內容量陳述) */
export const SPECIES_COUNT = BY_ZONE.length * SPECIES_PER_ZONE

/** 一個地帶跨幾層(re-export,讓消費端不必同時 import 兩個模組) */
export { ZONE_SPAN }
