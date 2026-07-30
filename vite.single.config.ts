import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 單檔打包:把 JS/CSS/圖片全部內嵌進一個 index.html,
// 方便丟到任何靜態空間(或 claude.ai Artifact)當外網試玩版。
// 用法:npm run build:single(會先壓縮圖片,結束後自動還原原始資產)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'dist/single',
    emptyOutDir: true,
    assetsInlineLimit: 100000000, // 全部內嵌
  },
})
