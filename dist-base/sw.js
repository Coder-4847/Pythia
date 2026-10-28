/*
 * Pythia's service worker. It does two jobs for a static site:
 *
 *  1. Cross-origin isolation. GitHub Pages can't send COOP/COEP headers, and Python's input()
 *     and Stop button need SharedArrayBuffer, which needs them. So this worker adds the headers
 *     to the responses it serves (the idea, and the credentialless fallback for Firefox/Safari,
 *     come from coi-serviceworker by Guido Zuidhof, MIT).
 *  2. Offline. The app shell is cached at install; the Python runtime (fetched from a CDN on
 *     first use) is cached the first time it loads. After one visit the app works with no network.
 *
 * `__PRECACHE__` and `__BUILD__` are filled in by the build (see vite.config.ts). Served
 * unprocessed by the dev server they are left as-is, and the worker only adds headers.
 */
const PRECACHE = ["apple-touch-icon.png","assets/AboutPage-D2vMlivU.js","assets/AchievementWatcher-CQ8wdOV_.js","assets/AchievementsPage-BLhcZ-RQ.js","assets/AnimatePresence-D1aBXjg9.js","assets/ArchiveLessonPage-CVAl5L1U.js","assets/ArchivePage-oZPmgsMb.js","assets/AuthPage-CXiZG7v9.js","assets/BelowTheFold-S6FxzqJF.js","assets/Button-MV_Ex9TS.js","assets/ChangelogPage-mVahPZ0c.js","assets/CodeText-Da3cH6-9.js","assets/CommandPalette-BO9NzPQh.js","assets/ConfirmDialog-DABfnmBa.js","assets/ContinueCard-BBsSd6Pd.js","assets/Counter-DeLBtGXz.js","assets/CurriculumPage-CePpMWby.js","assets/DashboardPage-M9Eg4xO7.js","assets/DesignSystemPage-C3YMceZ4.js","assets/Kbd-q3Eufi8k.js","assets/LessonPage-4DmhSYiQ.js","assets/Logo-CvRSoI3h.js","assets/Magnetic-D_o9Zzz4.js","assets/NotFoundPage-DZx-1TQN.js","assets/NotFoundPage-nWTQ0L9e.js","assets/PageShell-Dr484ObL.js","assets/PlaygroundPage-DeWbleV3.js","assets/Popover-DAb1_hVb.js","assets/PrivacyPage-Bt4-U8kF.js","assets/ProfilePage-BjrVcXdB.js","assets/ProfilePage-DGWPMAP6.js","assets/Progress-mSHw8ExT.js","assets/Reveal-BTujqMXU.js","assets/SettingsPage-yuI-GrE5.js","assets/ShortcutsOverlay-D61rcToW.js","assets/Skeleton-BWM5Mdol.js","assets/StatsPage-DPE5ooZ5.js","assets/StorageNotice-CqIjFimg.js","assets/SyncChoiceDialog-BM1g_aRu.js","assets/SyncStatus-DGpZrKxi.js","assets/achievements-BspWSv-c.js","assets/actions-Dtua1BgN.js","assets/authErrors-DSfnZ2Oi.js","assets/chunk-OB3PAWPO-Cg04Slvu.js","assets/cn-hZG6twJP.js","assets/config-BgcAtsH9.js","assets/content-CiaagJWL.js","assets/db-ZNituXpP.js","assets/dexie-react-hooks-BX1qp_-5.js","assets/dist-BMlKYrt2.js","assets/dist-CQ1ae8mH.js","assets/dist-CTOaXH3b.js","assets/engine-CmIpu5qS.js","assets/esm-DRLbRRa-.js","assets/geist-cyrillic-ext-wght-normal-DjL33-gN.woff2","assets/geist-cyrillic-wght-normal-BEAKL7Jp.woff2","assets/geist-latin-ext-wght-normal-DC-KSUi6.woff2","assets/geist-latin-wght-normal-BgDaEnEv.woff2","assets/geist-vietnamese-wght-normal-6IgcOCM7.woff2","assets/gsap-DJcgZmGr.js","assets/hooks-BUXvpdWb.js","assets/index-BMYU4xmE.css","assets/index-aGFxm_LH.js","assets/instrument-serif-latin-400-normal-BVbkICAY.woff","assets/instrument-serif-latin-400-normal-DnYpCC2O.woff2","assets/instrument-serif-latin-ext-400-normal-C2je3j2s.woff2","assets/instrument-serif-latin-ext-400-normal-CFCUzsTy.woff","assets/is-html-element-DvgHo_1h.js","assets/jetbrains-mono-cyrillic-wght-normal-D73BlboJ.woff2","assets/jetbrains-mono-greek-wght-normal-Bw9x6K1M.woff2","assets/jetbrains-mono-latin-ext-wght-normal-DBQx-q_a.woff2","assets/jetbrains-mono-latin-wght-normal-B9CIFXIH.woff2","assets/jetbrains-mono-vietnamese-wght-normal-Bt-aOZkq.woff2","assets/jsx-runtime-BOy446NO.js","assets/manager-ze_7f6Yf.js","assets/preload-helper-Bqc_b8Lw.js","assets/progress-CaFoxffu.js","assets/pyodide.worker-DWKKhGwT.js","assets/react-CsDhp_Ag.js","assets/react-DvXU6kJ2.js","assets/repo-RStq0xlU.js","assets/schema-C3yY_BTH.js","assets/schemas-DuWPd2Ii.js","assets/scrollTo-LxEzfXVp.js","assets/settings-iHJv5R9I.js","assets/smoothScroll-Dup0dLCc.js","assets/store-BsMhyBBx.js","assets/store-CMtJYrV6.js","assets/syncStores-B9KE-zAZ.js","assets/syncStores-D-DQD-Ja.js","assets/theme-Bfd4EhXO.js","assets/toast-DD9KEb2Z.js","assets/tracks-vPQWD_Am.js","assets/use-computed-Bmb5qW7j.js","assets/useDocumentTitle-CEqXlWwB.js","assets/useReducedMotion-CMRDp9Wq.js","assets/useRunner-r5SzAX1u.js","assets/useStats-D-37APVV.js","coi-register.js","favicon-mono.svg","favicon.svg","icon-192.png","icon-512.png","icon-maskable-512.png","index.html","manifest.webmanifest","og.png","robots.txt","vendor/pyflakes-4.0.3-py2.py3-none-any.whl"]
const BUILD = "52c92ef9fafa"
const OFFLINE = Array.isArray(PRECACHE) // false in dev, where Vite serves this file as written

const SHELL_PREFIX = 'pythia-shell-'
const SHELL = SHELL_PREFIX + BUILD
const RUNTIME = 'pythia-runtime-v1'
/** Large, versioned, immutable downloads: cache on first use, then never ask the network again. */
const RUNTIME_PATTERNS = [/^https:\/\/cdn\.jsdelivr\.net\/pyodide\//, /^https:\/\/(pypi\.org|files\.pythonhosted\.org)\//]

let credentialless = false

// Installing is instant: the heavy downloads wait until the page has finished loading and asks for
// them (see `precache` below), so saving the app for offline never competes with showing it.
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()))

/** Save every file of this build that isn't saved yet. Safe to run again: it only fetches what's missing. */
async function precache() {
  if (!OFFLINE) return
  const cache = await caches.open(SHELL)
  const have = new Set((await cache.keys()).map((r) => r.url))
  const missing = PRECACHE.map((path) => new URL(path, self.registration.scope).href).filter((href) => !have.has(href))
  // Eight at a time: quick, but gentle on a slow connection.
  for (let i = 0; i < missing.length; i += 8) {
    await Promise.all(
      missing.slice(i, i + 8).map(async (href) => {
        // `reload` bypasses the HTTP cache so a fresh deploy never saves a stale file.
        const response = await fetch(new Request(href, { cache: 'reload' }))
        if (response.ok) await cache.put(href, response)
      }),
    )
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Keep the previous shell too, so a tab that is still open on the old version can finish
      // lazily loading its chunks after a deploy has removed them from the server.
      const shells = (await caches.keys()).filter((k) => k.startsWith(SHELL_PREFIX) && k !== SHELL)
      const stale = shells.slice(0, Math.max(0, shells.length - 1))
      await Promise.all(stale.map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data) return
  if (data.type === 'coepCredentialless') credentialless = Boolean(data.value)
  if (data.type === 'precache') event.waitUntil(precache().catch(() => {}))
  if (data.type === 'deregister') {
    self.registration
      .unregister()
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((c) => c.navigate(c.url)))
  }
})

/** Add the headers that make the page cross-origin isolated. */
function isolate(response) {
  if (!response || response.status === 0 || response.type === 'opaque') return response
  const headers = new Headers(response.headers)
  headers.set('Cross-Origin-Embedder-Policy', credentialless ? 'credentialless' : 'require-corp')
  if (!credentialless) headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

const cacheable = (response) => response && (response.ok || response.type === 'opaque') && response.status !== 206

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request, { ignoreVary: true })
  if (hit) return isolate(hit)
  const response = await fetch(request)
  if (cacheable(response)) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone()).catch(() => {})
  }
  return isolate(response)
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME)
  const hit = await cache.match(request)
  const refresh = fetch(request)
    .then((response) => {
      if (cacheable(response)) cache.put(request, response.clone()).catch(() => {})
      return response
    })
    .catch(() => undefined)
  return isolate(hit ?? (await refresh) ?? Response.error())
}

/** Pages: the network when there is one (so a deploy shows up), the saved shell when there isn't. */
async function navigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL)
      cache.put(new URL('index.html', self.registration.scope), response.clone()).catch(() => {})
    }
    return isolate(response)
  } catch (error) {
    const saved = await caches.match(new URL('index.html', self.registration.scope).href)
    if (saved) return isolate(saved)
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return
  if (request.method !== 'GET' || request.headers.has('range')) return

  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin

  if (!OFFLINE) {
    // Development: just isolate same-origin responses.
    if (!sameOrigin) return
    event.respondWith(fetch(request).then(isolate))
    return
  }

  if (sameOrigin) {
    if (request.mode === 'navigate') return void event.respondWith(navigation(request))
    const path = url.pathname.slice(new URL(self.registration.scope).pathname.length)
    // Hashed build output never changes under its name; the Python core and wheels are big and versioned.
    if (path.startsWith('assets/') || path.startsWith('pyodide/') || path.startsWith('vendor/')) return void event.respondWith(cacheFirst(request, path.startsWith('assets/') ? SHELL : RUNTIME))
    return void event.respondWith(staleWhileRevalidate(request))
  }
  if (RUNTIME_PATTERNS.some((p) => p.test(request.url))) return void event.respondWith(cacheFirst(request, RUNTIME))
  // Anything else cross-origin (the AI proxy, Supabase) goes straight to the network, untouched.
})
