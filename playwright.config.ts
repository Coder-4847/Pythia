import { defineConfig, devices } from '@playwright/test'

const ENV = { VITE_PYODIDE_BASE: '/pyodide/' }

/**
 * Smoke tests run against production builds, served exactly as Pages would serve them.
 * Two builds: the default (accounts unconfigured: the guest-only experience) and one pointed at a
 * fake Supabase origin (see e2e/fakeSupabase.ts), used only by e2e/cloud.spec.ts.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', testIgnore: /cloud\.spec/, use: { ...devices['Desktop Chrome'] } },
    { name: 'cloud', testMatch: /cloud\.spec/, use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4174' } },
  ],
  webServer: [
    {
      // Python's core is served locally so the tests don't depend on a CDN.
      command: 'npm run pyodide:local && npm run build && npm run preview -- --port 4173 --strictPort',
      env: ENV,
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npx vite build --outDir dist-cloud && npx vite preview --outDir dist-cloud --port 4174 --strictPort',
      env: { ...ENV, VITE_SUPABASE_URL: 'https://fake.supabase.test', VITE_SUPABASE_ANON_KEY: 'anon-key-for-tests' },
      url: 'http://localhost:4174',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
