import Decimal from 'break_infinity.js'

export type Num = Decimal | number | string

export { Decimal }
export const D = (v: Num): Decimal => new Decimal(v)
export const ZERO = new Decimal(0)
export const ONE = new Decimal(1)
