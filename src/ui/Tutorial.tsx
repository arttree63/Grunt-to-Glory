import { useState } from 'react'
import * as B from '../core/balance'
import { sigilName } from '../core/game'
import { useGameState } from './useGameState'

const KEY = 'little-soldier-tutorial'
const TIP_KEY = 'little-soldier-tips'

/**
 * 開局只講**現在就會用到**的兩件事。
 * ⚠️ 原本一次倒四張,第 3、4 張講的是 3~10 分鐘後才碰到的東西,新手記不住;
 * 那兩件改成情境式提示(見 TIPS),在真的遇到時才出現。
 */
const STEPS = [
  {
    icon: '⚔️',
    title: '點畫面就是攻擊',
    body: '每點一下就是一次揮砍,直接造成傷害;連點還會累積「戰意」讓小兵打得更快。掛著不管也會自己推進。',
  },
  { icon: '🗡️', title: '金幣拿去升級', body: '英雄分頁按升級。等級是傷害的主要來源,長按可以連點。' },
]

/** 情境提示:條件成立時出現一次,看過就不再出現 */
const TIPS: Array<{ id: string; when: (s: ReturnType<typeof useGameState>) => boolean; text: string }> = [
  {
    id: 'boss',
    when: (s) => s.isBoss || s.bossFailed,
    text: `守關者是限時 ${B.BOSS_TIME} 秒的 DPS 檢定。打不過就退回前一層刷素材換裝,隨時可以再挑戰。`,
  },
  {
    id: 'forge',
    when: (s) => s.materials >= B.FORGE_COST,
    text: '素材夠了。怪只掉素材,裝備一律到「鐵匠鋪」自己鍛;投入部位素材就能鎖你要的部位。',
  },
  {
    id: 'destiny',
    when: (s) => s.destinyPoints > 0,
    text: '拿到命運點了。到「命運」分頁決定這一代要走哪條路——選的是機制,不是數值。',
  },
  {
    id: 'sigil',
    when: (s) => s.sigils > 0,
    text: '技能開始累積印記。第一個技能負責疊,第二個技能挑時機引爆,疊越多爆得越重。',
  },
  {
    id: 'legend',
    when: (s) => [...s.inventory, ...Object.values(s.equipped)].some((e) => e && (e.legend || e.setTag)),
    text: '你拿到會改變玩法的裝備了。傳說特性與套裝標籤不可重鑄,強度差不多,差別在「怎麼打」。',
  },
]

function seenTips(): string[] {
  try {
    return JSON.parse(localStorage.getItem(TIP_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** 開局兩張說明 + 情境提示。都存 localStorage,不佔存檔 */
export default function Tutorial() {
  const s = useGameState()
  const [done, setDone] = useState(() => localStorage.getItem(KEY) === '1')
  const [seen, setSeen] = useState<string[]>(seenTips)

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
              <span style={{ fontSize: 20 }}>{step.icon}</span>
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

  const tip = TIPS.find((t) => !seen.includes(t.id) && t.when(s))
  if (!tip) return null

  const dismiss = () => {
    const next = [...seen, tip.id]
    localStorage.setItem(TIP_KEY, JSON.stringify(next))
    setSeen(next)
  }

  return (
    <div
      className="retry"
      style={{ top: 'auto', bottom: 220, maxWidth: 300, cursor: 'pointer' }}
      onPointerDown={dismiss}
    >
      <div style={{ fontSize: 12, lineHeight: 1.6 }}>
        {tip.id === 'sigil' ? tip.text.replaceAll('印記', sigilName(s)) : tip.text}
      </div>
      <div className="tier3" style={{ marginTop: 4 }}>
        點一下關閉
      </div>
    </div>
  )
}
