import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { hydrateStores, startWriteThrough } from '@/data/syncStores'
import { initTheme } from '@/stores/theme'
import '@/styles/index.css'

initTheme()
// Load saved settings/files, then start saving changes. If IndexedDB is unavailable
// (some private modes) the app still works; it just doesn't remember anything.
hydrateStores()
  .catch((e) => console.warn('Could not load saved data:', e))
  .finally(startWriteThrough)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
