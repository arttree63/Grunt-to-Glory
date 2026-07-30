import * as B from './balance'

/**
 * 地 帶(zone)。
 *
 * ⚠️ 這個系統存在的理由:原本整個遊戲**只有一張場景圖**,而地圖名稱每 100 層才換一次——
 * 玩家推到第 150 層仍看著同一片森林,還會看到「地底城」的字蓋在森林圖上。
 * 40 分鐘的首輪從頭到尾長一樣,這是「試玩版感」最直觀的來源。
 *
 * 解法**不是加美術**(違反「程式繪製、禁止逐幀素材」的成本原則),而是:
 * 每 `ZONE_SPAN` 層換一個地帶,由 render 用 `tint`/`fog` 對同一張底圖做色調重繪。
 * 同一張圖 + 不同色溫與霧氣 = 看得出「換地方了」,成本是零張新圖。
 *
 * ⚠️ 地帶**不帶任何數值**:不改 HP、不改金幣、不改掉落。它是純粹的空間感與里程碑,
 * 動到數值就會牽動已驗證的成長曲線(game-balance § 二)。
 */
export interface Zone {
  name: string
  /** 底圖色調(乘算)。暖→冷、亮→暗,對應「越深越險」 */
  tint: number
  /** 霧氣濃度 0~1:render 疊一層同色薄霧,越深越濃 */
  fog: number
  /** 一句地帶描述,進場時顯示——讓推進有敘事而不只是數字 */
  flavor: string
}

/** 幾層換一個地帶。20 層 = 兩個守關者,早期約 1~2 分鐘一次,節奏剛好 */
export const ZONE_SPAN = 20

const ZONES: Zone[] = [
  { name: '森林邊境', tint: 0xffffff, fog: 0, flavor: '新兵的第一段路。樹影很淺,還看得見天。' },
  { name: '荊棘林道', tint: 0xd8e8c8, fog: 0.06, flavor: '樹變密了,腳下全是刺。這裡開始沒有回頭路。' },
  { name: '廢棄哨站', tint: 0xe8d8b8, fog: 0.12, flavor: '前一批駐軍留下的柵欄還在,人不在了。' },
  { name: '地底坑道', tint: 0x9aa8c8, fog: 0.2, flavor: '光是從裂縫漏下來的。空氣有鐵鏽味。' },
  { name: '蝕骨洞窟', tint: 0x88a0a8, fog: 0.28, flavor: '水滴聲比腳步聲響。牆上的刻痕不像人留的。' },
  { name: '古堡外牆', tint: 0xb8a0c0, fog: 0.22, flavor: '石牆高得看不到頂,旗幟褪成了灰。' },
  { name: '血色迴廊', tint: 0xd09090, fog: 0.3, flavor: '地毯的紅不是染的。腳步聲在這裡會回來找你。' },
  { name: '神殿階梯', tint: 0xe0d0a0, fog: 0.18, flavor: '往上的階梯沒有盡頭。愈亮愈冷。' },
]

/** 這一層屬於第幾個地帶(0 起算) */
export function zoneIndex(floor: number): number {
  return Math.floor(Math.max(0, floor - 1) / ZONE_SPAN)
}

/**
 * 這一層的地帶。超出設計表之後循環使用色調,但名字接「深淵 N 層」——
 * ⚠️ 不可以讓玩家看到「森林邊境」在第 300 層再出現一次,那會直接拆穿內容量。
 */
export function zoneOf(floor: number): Zone {
  const i = zoneIndex(floor)
  if (i < ZONES.length) return ZONES[i]
  const base = ZONES[i % ZONES.length]
  const depth = Math.floor(i / ZONES.length)
  return { ...base, name: `深淵 ${depth} 層・${base.name}`, fog: Math.min(0.45, base.fog + depth * 0.05) }
}

/** 這一層在本地帶走到哪(1..ZONE_SPAN),給主畫面的地帶進度用 */
export function zoneProgress(floor: number): { at: number; span: number } {
  return { at: ((Math.max(1, floor) - 1) % ZONE_SPAN) + 1, span: ZONE_SPAN }
}

/** 進入新地帶的那一層(整除點)。用來判定要不要播進場演出 */
export function isZoneEntry(floor: number): boolean {
  return floor > 1 && (floor - 1) % ZONE_SPAN === 0
}

/** 下一個守關者還有幾層(地帶進度旁邊一起顯示,兩種節奏都看得到) */
export function toNextBoss(floor: number): number {
  return B.BOSS_EVERY - ((floor - 1) % B.BOSS_EVERY) - 1
}
