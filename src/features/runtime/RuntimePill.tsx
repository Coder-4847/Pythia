import { useRuntimeState } from '@/features/runtime/runtime'
import { cn } from '@/lib/cn'

/** Tiny status chip: is Python loaded, and which version. */
export function RuntimePill() {
  const { status, python, error } = useRuntimeState()
  const label =
    status === 'ready' ? `Python ${python}` : status === 'loading' ? 'Loading Python…' : status === 'error' ? 'Python unavailable' : 'Python idle'
  return (
    <span
      title={error ?? undefined}
      className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-dim"
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          status === 'ready' && 'bg-ok',
          status === 'loading' && 'bg-gold',
          status === 'error' && 'bg-bad',
          status === 'idle' && 'bg-line-strong',
        )}
        style={status === 'loading' ? { animation: 'pulse-soft 1.2s ease-in-out infinite' } : undefined}
      />
      {label}
    </span>
  )
}
