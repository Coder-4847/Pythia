import { defineConfig, devices } from '@playwright/test'

/** Smoke tests run against the production build, served exactly as Pages would serve it. */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Python's core is served locally so the tests don't depend on a CDN.
    command: 'npm run pyodide:local && npm run build && npm run preview -- --port 4173 --strictPort',
    env: { VITE_PYODIDE_BASE: '/pyodide/' },
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
