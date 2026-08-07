import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Must match the repository name: GitHub Pages serves a project site from
// https://<user>.github.io/<repo>/, and this is what makes the CSS, images and
// video resolve. Wrong value here is the classic "site loads as unstyled text"
// failure. On a custom domain served from the root, this becomes '/'.
const BASE = '/AWDEAAA/'
const OUT_DIR = resolve(import.meta.dirname, 'dist')

const spaFallback = () => ({
  name: 'spa-404-fallback',
  closeBundle() {
    copyFileSync(resolve(OUT_DIR, 'index.html'), resolve(OUT_DIR, '404.html'))
  },
})

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss(), spaFallback()],
  server: { port: 5176 },
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
  },
})
