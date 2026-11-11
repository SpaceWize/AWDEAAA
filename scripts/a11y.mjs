// Builds the site WITHOUT any secrets (blank VITE_* overrides win over .env, so
// the tests always see the labelled sample data), then runs the Playwright suite.
import { spawnSync } from 'node:child_process'
const env = { ...process.env, VITE_GCAL_ID: '', VITE_GCAL_KEY: '', VITE_GDRIVE_FOLDER: '', VITE_GDRIVE_KEY: '', VITE_ACCOUNTS_BACKEND: '', VITE_SUPABASE_URL: '', VITE_SUPABASE_KEY: '', VITE_WAITLIST_URL: '', VITE_TURNSTILE_SITEKEY: '' }
const run = (cmd) => spawnSync(cmd, { stdio: 'inherit', shell: true, env }).status ?? 1
if (run('npm run build') !== 0) process.exit(1)
process.exit(run('npx playwright test'))
