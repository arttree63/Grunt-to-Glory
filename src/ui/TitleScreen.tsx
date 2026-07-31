import { useEffect, useState } from 'react'
import { bestFloorEver } from '../core/game'
import { JOBS } from '../core/jobs'
import { warmBattleTextures } from '../render/BattleScene'
import { useGame } from '../store/gameStore'
import { useGameState } from './useGameState'
import titleArt from '../../assets/visual/scenes/title-v1.webp'

/**
 * 進場標題畫面 = loading 畫面。
 *
 * ⚠️ 樣式**內嵌在 index.html 的 <head>**,不在 styles.css:
 * 這個畫面必須在 JS bundle 下載完之前就長對,而 styles.css 是非阻塞載入的(見 vite.config.ts)。
 * 這裡渲染的標記與 index.html 裡的靜態首屏完全一致 → React 掛載時原地接手,畫面不跳。
 * 改樣式請去 index.html,不要在 styles.css 另開一份(會漂移)。
 */
export default function TitleScreen({
  ready,
  onStart,
  caption,
}: {
  /** 讀檔完成才亮出開始鍵 */
  ready?: boolean
  onStart?: () => void
  /** 轉生/重置沿用同一畫面:只播文案,不給按鈕 */
  caption?: string
}) {
  const [artOn, setArtOn] = useState(false)
  const [progress, setProgress] = useState(0)
  const [warmed, setWarmed] = useState(false)
  // styles.css 是非阻塞載入的(vite.config.ts),它還沒到就放人進遊戲的話,
  // PIXI 會在沒有版面的容器上量尺寸 → 戰場永久 0 高。dev 沒有那個 link(樣式由 JS 注入),直接視為就緒
  const [cssReady, setCssReady] = useState(() => !document.querySelector('link[data-app-css]'))
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[data-app-css]')
    // ⚠️ 樣式表幾乎一定比 JS 早有結果,load/error 早在這個 effect 掛上之前就燒掉了,
    // 所以要先看「已完成」的痕跡:成功會把 rel 換成 stylesheet(link.sheet 也會有值),
    // 失敗由 vite 注入的 onerror 留下 cssFailed。只靠監聽會在失敗時永遠等不到。
    if (!link || link.rel === 'stylesheet' || link.sheet || link.dataset.cssFailed) {
      setCssReady(true)
      return
    }
    const on = () => setCssReady(true)
    link.addEventListener('load', on)
    link.addEventListener('error', on)
    // 再加一道保險絲:任何沒預料到的時序都不可以把玩家鎖在標題畫面
    const fuse = setTimeout(on, 8_000)
    return () => {
      clearTimeout(fuse)
      link.removeEventListener('load', on)
      link.removeEventListener('error', on)
    }
  }, [])

  // 這個畫面要蓋住的是「整段載入」,不只是讀存檔:貼圖沒抓完就放人進去,
  // 玩家看到的會是 HUD 都在、戰場一片空(見 BattleScene.warmBattleTextures 的註解)
  useEffect(() => {
    if (caption) return // 轉生/重置沿用同一畫面,貼圖早就在快取裡
    let alive = true
    // 抓不到圖不能把玩家關在門外:失敗或太久都照樣放行,場景晚一點自己補上
    const fuse = setTimeout(() => {
      if (alive) setWarmed(true)
    }, 12_000)
    void warmBattleTextures((r) => {
      if (alive) setProgress(r)
    })
      .catch(() => {})
      .finally(() => {
        if (alive) setWarmed(true)
      })
    return () => {
      alive = false
      clearTimeout(fuse)
    }
  }, [caption])

  const showStart = ready && warmed && cssReady && !caption

  return (
    <div className={`title-screen${artOn ? ' art-on' : ''}`}>
      <div className="title-stage">
        <div className="title-scene">
          <img
            className={`title-art${artOn ? ' on' : ''}`}
            src={titleArt}
            alt="小兵的故事"
            // 靜態首屏已經抓過這張圖,換 React 版時多半是 cache 命中、onLoad 不會再觸發,
            // 所以掛上去當下就要看 complete,否則畫面會倒退回「只有營火」的替身
            ref={(el) => {
              if (el?.complete) setArtOn(true)
            }}
            onLoad={() => setArtOn(true)}
          />
          <div className="title-fallback">
            <div className="title-flame" />
            <h1 className="title-name">小 兵 的 故 事</h1>
          </div>
          <div className="title-veil" />
        </div>
        <div className="title-panel">
          {showStart ? <StartMenu onStart={onStart} /> : <Marching caption={caption} progress={progress} />}
        </div>
      </div>
    </div>
  )
}

/** 有進度就走實際百分比,沒有(轉生/重置)就維持原本的行軍動畫 */
function Marching({ caption, progress = 0 }: { caption?: string; progress?: number }) {
  const det = !caption && progress > 0
  return (
    <>
      <div className={`title-bar${det ? ' det' : ''}`}>
        <i style={det ? { width: `${Math.round(progress * 100)}%` } : undefined} />
      </div>
      <small>{caption ?? '整 裝 行 軍 中'}</small>
    </>
  )
}

/** 有存檔=繼續旅途,沒有=開始遊戲。老玩家多給一行「我上次走到哪」 */
function StartMenu({ onStart }: { onStart?: () => void }) {
  const hasSave = useGame((st) => st.hasSave)
  const s = useGameState()

  return (
    <>
      <button className="title-start" onPointerDown={onStart}>
        {hasSave ? '繼 續 旅 途' : '開 始 遊 戲'}
      </button>
      {hasSave && (
        <span className="title-meta">
          第 {s.runs + 1} 代・最深 第 {bestFloorEver(s)} 層・{JOBS[s.jobId].name}
        </span>
      )}
    </>
  )
}
