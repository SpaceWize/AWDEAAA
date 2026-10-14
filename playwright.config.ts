import { defineConfig } from '@playwright/test'

const PORT = 4180
// CI uses Playwright's own chromium; locally reuse an installed Chrome/Edge.
const channel = process.env.CI ? undefined : (process.env.A11Y_CHANNEL ?? 'chrome')

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, channel },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/AWDEAAA/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
