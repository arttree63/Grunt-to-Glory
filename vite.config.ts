import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
