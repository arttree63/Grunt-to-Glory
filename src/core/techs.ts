import * as B from './balance'
import type { TechId, Techs } from './types'

export interface Tech {
  id: TechId
  name: string
  desc: string
  /** 每級成本(勳章),固定成本才能讓推進量逐輪穩定,見 game-balance skill 第四節 */
  cost: number
  maxLevel?: number
}

export const TECHS: Tech[] = [
  {
    id: 'valor',
    name: '軍功勳令',
    desc: `全局傷害 ×${B.TECH_DMG_MULT}`,
    cost: B.TECH_COST_DMG,
  },
  {
    id: 'supply',
    name: '後勤補給',
    desc: `金幣獲取 ×${B.TECH_GOLD_MULT}`,
    cost: B.TECH_COST_GOLD,
  },
  {
    id: 'legacy',
    name: '老兵餘蔭',
    desc: `開局資金 ×${B.TECH_START_GOLD_MULT}`,
    cost: B.TECH_COST_START,
  },
  {
    id: 'heirloom',
    name: '家族傳承',
    desc: '轉生可多帶 1 件傳家寶',
    cost: B.TECH_COST_HEIRLOOM,
    maxLevel: B.TECH_HEIRLOOM_MAX,
  },
  {
    id: 'camp',
    name: '營地帳篷',
    desc: `離線收益上限 +${B.TECH_OFFLINE_HOURS} 小時`,
    cost: B.TECH_COST_CAMP,
    maxLevel: B.TECH_CAMP_MAX,
  },
]

export const emptyTechs = (): Techs => ({ valor: 0, supply: 0, legacy: 0, camp: 0, heirloom: 0 })

/** 傳家寶欄位數:轉生時能帶走幾件裝備 */
export function heirloomSlots(techs: Techs): number {
  return B.HEIRLOOM_SLOTS + techs.heirloom
}

export function techById(id: TechId): Tech {
  return TECHS.find((t) => t.id === id)!
}

/** 全局傷害乘區 */
export function techDamageMult(techs: Techs): number {
  return B.TECH_DMG_MULT ** techs.valor
}

/** 金幣獲取乘區(第二乘區,專治中期停滯) */
export function techGoldMult(techs: Techs): number {
  return B.TECH_GOLD_MULT ** techs.supply
}

/** 開局資金 */
export function techStartGold(techs: Techs): number {
  return techs.legacy === 0 ? 0 : B.TECH_START_GOLD_BASE * B.TECH_START_GOLD_MULT ** (techs.legacy - 1)
}

/** 離線收益上限(小時) */
export function techOfflineHours(techs: Techs): number {
  return B.OFFLINE_CAP_HOURS + techs.camp * B.TECH_OFFLINE_HOURS
}

export function canBuyTech(techs: Techs, medals: number, id: TechId): boolean {
  const t = techById(id)
  if (t.maxLevel !== undefined && techs[id] >= t.maxLevel) return false
  return medals >= t.cost
}
