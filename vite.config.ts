import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Content-Security-Policy, injected into the production build only (Vite's dev
 * server needs inline scripts for HMR). Pyodide needs `wasm-unsafe-eval`; the
 * Python runtime and wheels are fetched from jsDelivr / PyPI; the optional AI
 * proxy and Supabase origins come from build-time env vars.
 */
function cspPlugin(env: NodeJS.ProcessEnv): Plugin {
  const extraConnect = [env.VITE_AI_PROXY_URL, env.VITE_SUPABASE_URL]
    .filter((u): u is string => Boolean(u))
    .map((u) => new URL(u).origin)
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net`,
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self' data:`,
    `img-src 'self' data: blob:`,
    `worker-src 'self' blob:`,
    `connect-src 'self' https://cdn.jsdelivr.net https://pypi.org https://files.pythonhosted.org ${extraConnect.join(' ')}`.trim(),
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')
  return {
    name: 'pythia-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
    ],
  }
}

export default defineConfig(({ mode }) => ({
  // CI derives BASE_PATH from the repository name (e.g. "/Pythia/") for project Pages sites.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), cspPlugin(process.env)],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2022', sourcemap: mode !== 'production' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
}))
