import type { AchievementIcon as Kind } from '@/engine/achievements'

/** Hand-drawn monoline glyphs on a 24-unit grid, in the same stroke style as the logo. */
const PATHS: Record<Kind, string> = {
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  check: 'M5 12.5 10 17.5 19 7',
  book: 'M5 5.5c2.5-1 5-1 7 .8 2-1.8 4.5-1.8 7-.8V18c-2.5-1-5-1-7 .8-2-1.8-4.5-1.8-7-.8ZM12 6.3V18.8',
  flame: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2.5 2C11 8.5 11 5.5 12 3Z',
  star: 'M12 4l2.4 5 5.4.7-4 3.7 1 5.4L12 16.2 7.2 18.8l1-5.4-4-3.7 5.4-.7Z',
  moon: 'M19 14.5A7.5 7.5 0 0 1 9.5 5 7.5 7.5 0 1 0 19 14.5Z',
  target: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 11.5v1',
  crown: 'M4 17 5.5 8l4 4L12 6l2.5 6 4-4L20 17ZM5 20h14',
  bolt: 'M13 3 6 13.5h5L10 21l8-11h-5.5Z',
  compass: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM15.5 8.5l-2 5-5 2 2-5Z',
}

export function AchievementIcon({ kind, className }: { kind: Kind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[kind]} />
    </svg>
  )
}
