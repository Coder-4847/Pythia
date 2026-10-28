import { useEffect, useState } from 'react'

/**
 * How ready the app is for use with no connection:
 * `unsupported` (no service worker), `preparing` (worker not in charge yet), `app` (pages saved,
 * Python not downloaded yet) or `ready` (both saved).
 */
export type OfflineStatus = 'unsupported' | 'preparing' | 'app' | 'ready'

export async function readOfflineStatus(): Promise<OfflineStatus> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || typeof caches === 'undefined') return 'unsupported'
  if (!navigator.serviceWorker.controller) return 'preparing'
  const names = await caches.keys()
  if (!names.some((n) => n.startsWith('pythia-shell-'))) return 'preparing'
  if (!names.includes('pythia-runtime-v1')) return 'app'
  const requests = await (await caches.open('pythia-runtime-v1')).keys()
  return requests.some((r) => r.url.includes('pyodide.asm.wasm')) ? 'ready' : 'app'
}

export const OFFLINE_TEXT: Record<OfflineStatus, string> = {
  unsupported: 'Not available in this browser. Pythia needs a connection.',
  preparing: 'Getting ready: the first visit saves the app on this device.',
  app: 'The app is saved. Run any Python code once, online, to save the Python runtime too.',
  ready: 'Ready. Lessons and the playground work without a connection.',
}

/** Re-checks every few seconds while mounted, since the caches fill in the background. */
export function useOfflineStatus(): OfflineStatus | null {
  const [status, setStatus] = useState<OfflineStatus | null>(null)
  useEffect(() => {
    let alive = true
    const check = () => void readOfflineStatus().then((s) => alive && setStatus(s)).catch(() => alive && setStatus('unsupported'))
    check()
    const timer = setInterval(check, 4000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])
  return status
}
