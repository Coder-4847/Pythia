import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
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

/**
 * Fills the service worker's precache list from what the build emitted. The Python runtime
 * (public/pyodide, when self-hosted) is left out: it is large and cached when first used.
 */
function serviceWorkerPlugin(): Plugin {
  let outDir = 'dist'
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory() ? walk(full) : [full]
    })
  return {
    name: 'pythia-sw',
    apply: 'build',
    configResolved: (config) => {
      outDir = config.build.outDir
    },
    closeBundle() {
      const files = walk(outDir)
        .map((f) => relative(outDir, f).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && f !== '404.html' && !f.startsWith('pyodide/') && !f.endsWith('.map') && !f.startsWith('vendor/README'))
        .sort()
      const hash = createHash('sha1')
      for (const f of files) hash.update(f).update(readFileSync(join(outDir, f)))
      const build = hash.digest('hex').slice(0, 12)
      const source = readFileSync(join(outDir, 'sw.js'), 'utf8')
      writeFileSync(join(outDir, 'sw.js'), source.replace("'__PRECACHE__'", JSON.stringify(files)).replace("'__BUILD__'", JSON.stringify(build)))
    },
  }
}

const pyodideVersion = (JSON.parse(readFileSync('node_modules/pyodide/package.json', 'utf8')) as { version: string }).version

export default defineConfig(({ mode }) => ({
  // CI derives BASE_PATH from the repository name (e.g. "/Pythia/") for project Pages sites.
  base: process.env.BASE_PATH ?? '/',
  // The CDN path of the Python runtime is derived from the installed `pyodide` package.
  define: { __PYODIDE_VERSION__: JSON.stringify(pyodideVersion) },
  worker: { format: 'es' },
  plugins: [react(), tailwindcss(), cspPlugin(process.env), serviceWorkerPlugin()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2022', sourcemap: mode !== 'production' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'worker/src/**/*.test.ts'],
  },
}))
