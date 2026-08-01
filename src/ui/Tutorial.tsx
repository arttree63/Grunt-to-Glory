import { useEffect, useState } from 'react'
import * as B from '../core/balance'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import { GameIcon } from './GameIcon'

const KEY = 'little-soldier-tutorial'

/**
 * 開局只講**現在就會用到**的兩件事。
 * ⚠️ 原本一次倒四張,第 3、4 張講的是 3~10 分鐘後才碰到的東西,新手記不住;
 * 那兩件改成情境式提示(見 TIPS),在真的遇到時才出現。
 */
const STEPS = [
  {
    icon: 'hero' as const,
    title: '點畫面就是攻擊',
    body: '每點一下就是一次揮砍,直接造成傷害。掛著不管也會自己推進。',
  },
  {
    icon: 'charge' as const,
    title: '金幣拿去升級',
    body: '畫面下方的升級條買得起就會亮起來,長按可以連點。等級是傷害的主要來源。',
  },
]

/** 開局只保留兩張必要說明；情境規則由 Boss 聚光燈負責。 */
export default function Tutorial() {
  const [done, setDone] = useState(() => localStorage.getItem(KEY) === '1')
  const setUiLock = useGame((st) => st.setUiLock)

  useEffect(() => {
    setUiLock('modal:tutorial', !done)
    return () => setUiLock('modal:tutorial', false)
  }, [done, setUiLock])

  const close = () => {
    localStorage.setItem(KEY, '1')
    setDone(true)
  }

  if (!done) {
    return (
      <div className="modal-mask" onPointerDown={close}>
        <div className="modal" onPointerDown={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
          <h3 style={{ textAlign: 'center' }}>小 兵 的 故 事</h3>
          <p style={{ textAlign: 'center', marginBottom: 14 }}>從無名雜兵爬到傳奇英雄</p>
          {STEPS.map((step) => (
            <div key={step.title} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <span><GameIcon name={step.icon} /></span>
              <span>
                <b style={{ fontSize: 13 }}>{step.title}</b>
                <br />
                <small className="affix" style={{ lineHeight: 1.6 }}>
                  {step.body}
                </small>
              </span>
            </div>
          ))}
          <button className="btn primary" style={{ width: '100%' }} onClick={close}>
            開 打
          </button>
        </div>
      </div>
    )
  }

  return null
}

const SPOT_KEY = 'little-soldier-spotlights'

/**
 * 集中注意力式教學:機制**第一次出現的那一刻**全畫面壓暗、遊戲暫停(Boss 倒數也停,
 * 不偷玩家時間),只亮著該機制的 HUD(App 依 spotlight id 給對應元素 .spotlit)。
 * 規則在發生當下用看的學,不用事前文字解釋。每個 id 一生只出現一次。
 */
const SPOTS: Array<{ id: string; when: (s: ReturnType<typeof useGameState>) => boolean; text: string }> = [
  {
    id: 'boss30',
    when: (s) => s.isBoss,
    text: `守關者:${B.BOSS_TIME} 秒內打掉全部血量。失敗沒有懲罰,退回前一層備戰,隨時再來。`,
  },
  {
    id: 'shell',
    when: (s) => s.isBoss && s.shellLeft > 0,
    text: '這層護盾看「命中次數」,不看傷害大小——分身、傭兵、燃燒,每一下都算。',
  },
  {
    id: 'channel',
    when: (s) => s.isBoss && s.channelLeft > 0,
    text: 'Boss 在蓄力——湊滿打斷條就能打斷它。留一手爆發,就是留給這種時候。',
  },
  {
    id: 'totem',
    when: (s) => s.isBoss && s.totemHp.gt(0),
    text: '圖騰在加速倒數——優先點掉它。燃燒與盜賊背刺會無視圖騰,直打本體。',
  },
  {
    id: 'perfect',
    when: (s) => s.perfectWindowLeft > 0,
    text: '印記疊滿了——金色窗口內「手動」引爆=完美引爆,有額外獎勵。',
  },
]

export function SpotlightTeach() {
  const s = useGameState()
  const spotlight = useGame((st) => st.spotlight)
  const showSpotlight = useGame((st) => st.showSpotlight)
  const dismissSpotlight = useGame((st) => st.dismissSpotlight)
  const [seen, setSeen] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SPOT_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (spotlight) return
    const next = SPOTS.find((t) => !seen.includes(t.id) && t.when(s))
    if (next) showSpotlight(next.id)
  })

  const active = SPOTS.find((t) => t.id === spotlight)
  if (!active) return null

  const done = () => {
    const next = [...seen, active.id]
    localStorage.setItem(SPOT_KEY, JSON.stringify(next))
    setSeen(next)
    dismissSpotlight()
  }

  return (
    <div
      className="spot-dim"
      onPointerDown={(e) => {
        e.stopPropagation()
        done()
      }}
    >
      <div className="spot-card">
        <div>{active.text}</div>
        <div className="tier3" style={{ marginTop: 6 }}>
          點一下繼續
        </div>
      </div>
    </div>
  )
}
