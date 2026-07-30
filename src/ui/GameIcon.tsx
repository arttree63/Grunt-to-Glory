import type { MechanicTag, Quality } from '../core/types'

type IconName =
  | 'hero'
  | 'equip'
  | 'forge'
  | 'destiny'
  | 'journal'
  | 'legacy'
  | 'charge'
  | 'pause'
  | 'autoCast'
  | 'manualCast'
  | 'shieldRush'
  | 'gale'
  | 'judgement'
  | 'bulwark'
  | 'shadowClone'
  | 'meteor'
  | 'rally'
  | 'windMark'
  | 'edict'
  | 'hound'
  | 'rogue'
  | 'icemage'
  | 'sapper'
  | 'pyro'

export function GameIcon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'game-icon',
    'aria-hidden': true,
  }

  if (name === 'shieldRush' || name === 'bulwark' || name === 'equip') {
    return <svg {...common}><path d="M12 2 20 5v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5l8-3Z" /><path d="M12 5v13M7 9h10" /></svg>
  }
  if (name === 'gale' || name === 'shadowClone' || name === 'hero' || name === 'rogue') {
    return <svg {...common}><path d="m4 20 4-4M7 17l10-10 2-4-4 2L5 15M14 6l4 4M3 21h6" /></svg>
  }
  if (name === 'judgement' || name === 'meteor') {
    return <svg {...common}><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19" /><circle cx="12" cy="12" r="4" /></svg>
  }
  if (name === 'rally') {
    return <svg {...common}><path d="M6 22V3M7 4h11l-3 4 3 4H7M3 22h7" /></svg>
  }
  if (name === 'windMark') {
    return <svg {...common}><path d="M3 8h11c3 0 3-4 0-4-1.4 0-2.2.7-2.5 1.6M3 12h16c3 0 3 4 0 4-1.3 0-2.1-.6-2.5-1.5M3 16h8" /></svg>
  }
  if (name === 'edict' || name === 'journal') {
    return <svg {...common}><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V3Z" /><path d="M8 7h8M8 11h8M8 15h5M5 19a2 2 0 0 1 2-2h12" /></svg>
  }
  if (name === 'forge' || name === 'sapper') {
    return <svg {...common}><path d="m14 4 6 6-3 3-6-6 3-3ZM12 9 4 17v3h3l8-8M3 21h10" /></svg>
  }
  if (name === 'destiny') {
    return <svg {...common}><path d="M12 22V10M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 10c4 0 7-2.5 7-7-4 0-7 2.5-7 7Z" /></svg>
  }
  if (name === 'legacy') {
    return <svg {...common}><circle cx="12" cy="9" r="6" /><path d="m8 14-2 8 6-3 6 3-2-8M9 9l2 2 4-4" /></svg>
  }
  if (name === 'charge') {
    return <svg {...common}><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" /></svg>
  }
  if (name === 'pause') {
    return <svg {...common}><path d="M8 5v14M16 5v14" /></svg>
  }
  if (name === 'autoCast') {
    return (
      <svg {...common}>
        <path d="M19.2 7.2A8 8 0 0 0 5.5 5.6L3 8" />
        <path d="M3 4v4h4" />
        <path d="M4.8 16.8a8 8 0 0 0 13.7 1.6L21 16" />
        <path d="M21 20v-4h-4" />
        <path d="m12 7 1.2 3.1L16.5 12l-3.3 1.9L12 17l-1.2-3.1L7.5 12l3.3-1.9L12 7Z" />
      </svg>
    )
  }
  if (name === 'manualCast') {
    return (
      <svg {...common}>
        <path d="M8.5 11.5V6.8a1.5 1.5 0 0 1 3 0v3.7-5a1.5 1.5 0 0 1 3 0v5-3a1.5 1.5 0 0 1 3 0v4-2a1.5 1.5 0 0 1 3 0v4.2c0 4.6-3 7.3-7.4 7.3h-.8c-2 0-3.7-.9-4.9-2.4L3.8 14a1.7 1.7 0 0 1 2.5-2.3l2.2 2.1v-2.3Z" />
        <path d="M5 4.5 3.5 3M5 8H2.5M8 4V1.5" />
      </svg>
    )
  }
  if (name === 'hound') {
    return <svg {...common}><path d="M5 9 3 5l5 2h8l5-2-2 5v8H7V10M8 18l-2 4M16 18l2 4" /><circle cx="9" cy="12" r=".8" fill="currentColor" /><circle cx="15" cy="12" r=".8" fill="currentColor" /></svg>
  }
  if (name === 'icemage') {
    return <svg {...common}><path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10M12 2l-2 3M12 2l2 3M12 22l-2-3M12 22l2-3" /></svg>
  }
  if (name === 'pyro') {
    return <svg {...common}><path d="M13 2c1 5-3 6-1 10 1-2 3-3 4-5 3 3 5 7 3 11-2 5-12 5-14-1-1-4 2-8 5-11 0 4 1 5 3 6" /></svg>
  }
  return <svg {...common}><path d="M12 2 4 8v10l8 4 8-4V8l-8-6ZM8 12h8M12 8v8" /></svg>
}

const TAG_MARK: Record<MechanicTag, string> = {
  repeat: '複',
  delay: '延',
  mark: '印',
  afterimage: '殘',
  copy: '摹',
  store: '儲',
  transform: '轉',
  chain: '鏈',
  spread: '擴',
  cooldown_complete: '冷',
  sequence: '序',
  relic: '遺',
  formation: '陣',
  clone: '分',
  status: '態',
  zone: '域',
  displace: '移',
}

export function MechanicIcon({ tag }: { tag: MechanicTag }) {
  return <span className="mechanic-icon" aria-hidden="true">{TAG_MARK[tag]}</span>
}

export function BadgeIcon({ kind }: { kind: 'legend' | 'set' | 'heirloom' | 'lock' }) {
  return <span className={`badge-icon ${kind}`} aria-hidden="true" />
}

const QUALITY_MARK: Record<Quality, string> = {
  white: '白',
  green: '精',
  blue: '稀',
  purple: '史',
  gold: '傳',
  crimson: '神',
}

export function QualityMark({ quality }: { quality: Quality }) {
  return <span className={`quality-mark q-${quality}`} aria-label={`${QUALITY_MARK[quality]}品質`}>{QUALITY_MARK[quality]}</span>
}
