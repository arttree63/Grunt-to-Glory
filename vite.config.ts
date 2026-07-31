import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 讓 styles.css 不擋首次繪製。
 *
 * 建置時 vite 會在 <head> 注入 <link rel="stylesheet">,而外部樣式表**會擋掉整份文件的第一次繪製**:
 * 線上版實測 first-paint 卡在 2664ms(CSS 1580ms 才到、JS 又接著佔住主執行緒),
 * 那段時間連內嵌樣式的標題畫面都畫不出來——玩家看到的就是一片黑。
 * 換成 preload + onload 改 rel:下載優先度一樣高,但不再擋繪製;沒有 JS 時走 noscript 退路。
 */
function nonBlockingCss(): Plugin {
  return {
    name: 'non-blocking-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<link rel="stylesheet"([^>]*)>/g,
          (tag, attrs) =>
            `<link rel="preload" as="style" data-app-css${attrs} onload="this.onload=null;this.rel='stylesheet'"><noscript>${tag}</noscript>`,
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), nonBlockingCss()],
  base: './', // CrazyGames 需相對路徑
  server: {
    // 手機試玩用的臨時通道(npx cloudflared tunnel --url http://localhost:5180)。
    // 只放行這個網域,不用 allowedHosts: true
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
    outDir: 'dist/client',
  },
})
