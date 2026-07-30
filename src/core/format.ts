import { D, Decimal, type Num } from './decimal'

const SHORT = ['', 'K', 'M', 'B', 'T']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

/** 1.2K / 3.4M / 5.6B / 7.8T / aa, ab, ac… — UI 一律呼叫此函式,不得自行實作 */
export function fmt(v: Num, decimals = 1): string {
  const d = v instanceof Decimal ? v : D(v)
  if (d.lt(0)) return '-' + fmt(d.neg(), decimals)
  // 正值但不足 1 一律顯示 1:點擊預算(CLICK_DMG_SEC=0.05 秒份)、軍旗/分身分帳、
  // 顯示層暴擊拆分都會產生 <1 的量——「點了有打到」不允許跳出 0(clicker-ui § 五)
  if (d.gt(0) && d.lt(1)) return '1'
  // 1000 以下一律整數(金幣出現小數點會顯得廉價)
  if (d.lt(1000)) return String(Math.floor(d.toNumber()))
  const tier = Math.floor(d.log10() / 3)
  const mantissa = d.div(Decimal.pow(1000, tier)).toNumber()
  return mantissa.toFixed(decimals) + suffix(tier)
}

/** 戰鬥用整數格式。避免 HP、DPS、跳字出現小數點，百萬以下保留完整整數。 */
export function fmtCombat(v: Num): string {
  const d = v instanceof Decimal ? v : D(v)
  if (d.lt(0)) return '-' + fmtCombat(d.neg())
  if (d.gt(0) && d.lt(1)) return '1'
  if (d.lt(1_000_000)) return Math.floor(d.toNumber()).toLocaleString('en-US')
  const tier = Math.floor(d.log10() / 3)
  const mantissa = d.div(Decimal.pow(1000, tier)).floor().toString()
  return mantissa + suffix(tier)
}

function suffix(tier: number): string {
  if (tier < SHORT.length) return SHORT[tier]
  const i = tier - SHORT.length
  const first = Math.floor(i / 26)
  const second = i % 26
  return LETTERS[first] + LETTERS[second]
}

/** 秒數 → 1:05 / 12:03:04 */
export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`
}
