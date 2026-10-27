import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useCloud, type SyncPhase } from '@/sync/store'

const ago = (t: number, now: number) => {
  const s = Math.max(0, Math.round((now - t) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s} seconds ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} ${m === 1 ? 'minute' : 'minutes'} ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} ${h === 1 ? 'hour' : 'hours'} ago` : new Date(t).toLocaleDateString()
}

export function syncLabel(phase: SyncPhase, pending: number, lastSyncAt: number | null, now = Date.now()): string {
  switch (phase) {
    case 'syncing':
      return 'Syncing…'
    case 'offline':
      return pending ? `Offline: ${pending} ${pending === 1 ? 'change' : 'changes'} will sync when you’re back` : 'Offline'
    case 'error':
      return 'Sync is having trouble. Your work is safe on this device.'
    case 'paused':
      return 'Sync is off for this device'
    case 'idle':
      return pending ? 'Waiting to sync…' : lastSyncAt ? `Synced ${ago(lastSyncAt, now)}` : 'Up to date'
    default:
      return 'Not signed in'
  }
}

/** The one-line sync state, kept current while visible. */
export function SyncStatus({ className }: { className?: string }) {
  const { phase, pending, lastSyncAt } = useCloud()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(t)
  }, [])
  return (
    <p className={cn('flex items-center gap-2 text-sm', className)} role="status">
      <span
        aria-hidden
        className={cn('size-2 rounded-full', phase === 'idle' && !pending ? 'bg-ok' : phase === 'error' ? 'bg-bad' : phase === 'syncing' ? 'animate-pulse bg-gold' : 'bg-dim')}
      />
      {syncLabel(phase, pending, lastSyncAt, now)}
    </p>
  )
}
