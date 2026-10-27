import { cn } from '@/lib/cn'

/** Placeholder block with a slow shimmer; sized entirely by className. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('relative overflow-hidden rounded-lg bg-raised', className)}
    >
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-fg/5 to-transparent"
        style={{ animation: 'shimmer 1.6s var(--ease-out-expo) infinite' }}
      />
    </div>
  )
}
