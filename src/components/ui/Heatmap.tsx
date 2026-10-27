import { cn } from '@/lib/cn'

export interface HeatCell {
  level: 0 | 1 | 2 | 3 | 4
  /** Shown as a native tooltip and read by screen readers. */
  label: string
}

const COLOR = [
  'var(--c-raised)',
  'color-mix(in srgb, var(--c-gold) 22%, var(--c-raised))',
  'color-mix(in srgb, var(--c-gold) 45%, var(--c-raised))',
  'color-mix(in srgb, var(--c-gold) 72%, var(--c-raised))',
  'var(--c-gold)',
]

/**
 * Activity grid: one column per week, seven rows (Monday first). `null` leaves a gap for days
 * that haven't happened yet. The summary is announced once; cells themselves are decorative.
 */
export function Heatmap({ weeks, summary, className }: { weeks: (HeatCell | null)[][]; summary: string; className?: string }) {
  return (
    <div role="img" aria-label={summary} className={cn('grid gap-[3px]', className)} style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
      {weeks.map((week, w) => (
        <div key={w} className="grid gap-[3px]" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
          {week.map((cell, d) =>
            cell ? (
              <span key={d} title={cell.label} className="aspect-square rounded-[3px]" style={{ background: COLOR[cell.level] }} />
            ) : (
              <span key={d} className="aspect-square" />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
