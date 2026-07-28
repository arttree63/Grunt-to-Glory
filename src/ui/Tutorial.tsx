import { useState } from 'react'

const KEY = 'little-soldier-tutorial'

const STEPS = [
  { icon: '⚔️', title: '點畫面就是攻擊', body: '小兵會自己打,點擊累積「戰意」讓他打得更快更痛。掛著不管也會推進。' },
  { icon: '🗡️', title: '金幣拿去升級', body: '英雄分頁按升級。等級是傷害的主要來源,長按可以連點。' },
  { icon: '👑', title: '每 10 層有 Boss', body: '限時 30 秒的 DPS 檢定。打不過就回頭刷素材、換裝,或退役傳承重來。' },
  { icon: '🔨', title: '怪只掉素材,裝備自己鍛', body: 'Boss 掉部位素材,寶箱怪掉菁英素材。到鐵匠鋪精工鍛造,想要哪個部位就鎖哪個。' },
]

/** 首次遊玩的四張說明。看過就不再出現(存 localStorage,不佔存檔) */
export default function Tutorial() {
  const [done, setDone] = useState(() => localStorage.getItem(KEY) === '1')
  if (done) return null

  const close = () => {
    localStorage.setItem(KEY, '1')
    setDone(true)
  }

  return (
    <div className="modal-mask" onPointerDown={close}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
        <h3 style={{ textAlign: 'center' }}>小 兵 的 故 事</h3>
        <p style={{ textAlign: 'center', marginBottom: 14 }}>從無名雜兵爬到傳奇英雄</p>
        {STEPS.map((s) => (
          <div key={s.title} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span>
              <b style={{ fontSize: 13 }}>{s.title}</b>
              <br />
              <small className="affix" style={{ lineHeight: 1.6 }}>
                {s.body}
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
