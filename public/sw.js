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
const PRECACHE = '__PRECACHE__'
const BUILD = '__BUILD__'
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
