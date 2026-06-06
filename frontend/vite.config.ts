import { defineConfig, type Plugin } from 'vite'
import type { ViteDevServer, PreviewServer } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {
  createReadStream,
  existsSync,
  statSync,
  readdirSync,
  mkdirSync,
  copyFileSync,
} from 'fs'

const CURRICULUM_SRC = path.resolve(__dirname, '../curriculum')
const CURRICULUM_DEST = path.resolve(__dirname, 'dist/curriculum')

function copyDirRecursive(src: string, dest: string) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath  = path.join(src, entry)
    const destPath = path.join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

/** dev・preview 共通のカリキュラム配信ミドルウェア */
function attachCurriculumMiddleware(middlewares: ViteDevServer['middlewares']) {
  middlewares.use('/curriculum', (req, res, next) => {
    const filePath = path.join(CURRICULUM_SRC, req.url ?? '')
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      createReadStream(filePath).pipe(res)
    } else {
      next()
    }
  })
}

const curriculumPlugin: Plugin = {
  name: 'vite-plugin-curriculum',

  /** 開発サーバー：ソースから直接配信 */
  configureServer(server: ViteDevServer) {
    attachCurriculumMiddleware(server.middlewares)
  },

  /** プレビューサーバー：ビルド成果物を配信 */
  configurePreviewServer(server: PreviewServer) {
    attachCurriculumMiddleware(server.middlewares)
  },

  /** ビルド時：curriculum を dist へコピー */
  closeBundle() {
    if (existsSync(CURRICULUM_SRC)) {
      copyDirRecursive(CURRICULUM_SRC, CURRICULUM_DEST)
    }
  },
}

export default defineConfig({
  plugins: [react(), curriculumPlugin],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
