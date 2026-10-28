import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { afterLoadIdle } from '@/lib/idle'
import { isCloudConfigured } from '@/sync/config'
import { initTheme } from '@/stores/theme'
import '@/styles/index.css'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Load saved settings/files, then start saving changes. This waits for the page to finish loading
// and runs in its own chunk, so the database and schema code never delay the first paint (the theme
// is already applied from localStorage above). If IndexedDB is unavailable (some private modes) the
// app still works; it just doesn't remember anything.
let started = false
function loadSavedState() {
  if (started) return
  started = true
  void import('@/data/syncStores').then(({ hydrateStores, startWriteThrough }) =>
    hydrateStores()
      .catch((e) => console.warn('Could not load saved data:', e))
      .finally(() => {
        startWriteThrough()
        // Accounts are optional: when unconfigured, none of the cloud code is even downloaded.
        if (isCloudConfigured) void import('@/sync/manager').then((m) => m.startCloud()).catch((e) => console.warn('Cloud sync unavailable:', e))
      }),
  )
}
// Deep links to pages that use saved state start right away; the landing page waits for a quiet moment,
// or for the first click or key press, whichever comes first.
if (/^#\/.+/.test(window.location.hash)) loadSavedState()
else {
  afterLoadIdle(loadSavedState, 300)
  window.addEventListener('pointerdown', loadSavedState, { once: true, capture: true })
  window.addEventListener('keydown', loadSavedState, { once: true, capture: true })
}
