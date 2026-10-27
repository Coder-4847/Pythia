import { m } from 'framer-motion'
import { useMemo } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * A short gold burst: particles fly out from the centre of the parent and fade, with a soft glow.
 * Mount it (with a changing `key`) when something worth celebrating happens. Renders nothing
 * under reduced motion. The layout is deterministic, so screenshots and tests are stable.
 */
export function Celebration({ size = 'small' }: { size?: 'small' | 'large' }) {
  const reduce = useReducedMotion()
  const count = size === 'large' ? 28 : 14
  const reach = size === 'large' ? 170 : 90
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.2
        const distance = reach * (0.6 + ((i * 37) % 10) / 25)
        return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, s: 4 + ((i * 7) % 5), d: (i % 5) * 0.03 }
      }),
    [count, reach],
  )
  if (reduce) return null
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      <m.span
        className="absolute size-24 rounded-full bg-gold/30 blur-2xl"
        initial={{ opacity: 0.9, scale: 0.4 }}
        animate={{ opacity: 0, scale: size === 'large' ? 4 : 2.5 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {particles.map((p, i) => (
        <m.span
          key={i}
          className="absolute rounded-full bg-gold"
          style={{ width: p.s, height: p.s }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.9, delay: p.d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </span>
  )
}
