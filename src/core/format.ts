import { D, Decimal, type Num } from './decimal'

const SHORT = ['', 'K', 'M', 'B', 'T']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

/** 1.2K / 3.4M / 5.6B / 7.8T / aa, ab, ac… — UI 一律呼叫此函式,不得自行實作 */
export function fmt(v: Num, decimals = 1): string {
  const d = v instanceof Decimal ? v : D(v)
  if (d.lt(0)) return '-' + fmt(d.neg(), decimals)
  // 1000 以下一律整數:金幣/傷害出現小數點會顯得廉價
  if (d.lt(1000)) return String(Math.floor(d.toNumber()))
  const tier = Math.floor(d.log10() / 3)
  const mantissa = d.div(Decimal.pow(1000, tier)).toNumber()
  return mantissa.toFixed(decimals) + suffix(tier)
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
