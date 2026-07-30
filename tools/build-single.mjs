// 產出外網試玩用的單一 HTML(dist/single/index.html)。
// 流程:壓縮 src 有 import 到的圖片 → vite 單檔建置 → git 還原原始圖片。
// 圖片不壓的話單檔會超過 8MB,壓完約 2.8MB。
import sharp from 'sharp'
import { statSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })

// 資產目錄有未提交變更時直接停,避免 git checkout 把使用者的修改洗掉
if (run('git status --porcelain -- assets').trim()) {
  console.error('assets/ 有未提交的變更,先 commit 或 stash 再跑 build:single')
  process.exit(1)
}

const imported = run(
  `grep -rho "from '[^']*assets/visual[^']*'" src | sed "s/from '//;s/'//" | sed 's|\\.\\./||g' | sort -u`
).trim().split('\n')

try {
  let before = 0
  let after = 0
  for (const rel of imported) {
    const orig = statSync(rel).size
    before += orig
    const meta = await sharp(rel).metadata()
    let pipe = sharp(rel)
    if (meta.width > 768) pipe = pipe.resize({ width: 768 })
    const buf = await pipe.png({ palette: true, quality: 80, compressionLevel: 9 }).toBuffer()
    if (buf.length < orig) writeFileSync(rel, buf)
    after += Math.min(buf.length, orig)
  }
  console.log(`圖片壓縮:${(before / 1e6).toFixed(2)}MB → ${(after / 1e6).toFixed(2)}MB`)
  execSync('npx vite build --config vite.single.config.ts', { stdio: 'inherit' })
} finally {
  execSync('git checkout -- assets')
}
