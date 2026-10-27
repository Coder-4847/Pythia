import { m, useReducedMotion } from 'framer-motion'
import { useId } from 'react'

/**
 * The Pythia mark: a monoline serpent whose body is the stem of a "P" and whose
 * looping neck forms the bowl. The head (with a forked tongue) rests against the
 * stem, and the eye sits where the counter of the letter would be.
 *
 * The geometry is mirrored by hand in /public/favicon.svg and favicon-mono.svg.
 */
const STEM = 'M14 53 C14 58 21 58.5 22 53 C23 47 19 44 20.5 38 C21.5 33 22 30 22 25 V15'
const BOWL = 'M22 15 C22 9.5 27 7 34 7 C47 7 54 14 54 23 C54 32 47 38 37 38 C34 38 32 37.6 30 36.2'
const TONGUE = 'M30 36.2 L27 34.8 M30 36.2 L26.8 37.6'

interface LogoMarkProps {
  size?: number
  /** Draw the serpent in on mount. Honors reduced motion. */
  animate?: boolean
  /** Single-colour variant: everything uses currentColor, including the eye. */
  mono?: boolean
  className?: string
  title?: string
}

export function LogoMark({ size = 32, animate = false, mono = false, className, title }: LogoMarkProps) {
  const reduce = useReducedMotion()
  const draw = animate && !reduce
  const labelId = useId()
  const stroke = mono ? 'currentColor' : 'var(--c-gold)'
  const line = (delay: number, duration: number) =>
    draw
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration, delay, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {}

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke={stroke}
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-labelledby={title ? labelId : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title id={labelId}>{title}</title>}
      <m.path d={STEM} {...line(0, 0.9)} />
      <m.path d={BOWL} {...line(0.35, 1.1)} />
      <m.path d={TONGUE} strokeWidth={2} {...line(1.3, 0.35)} />
      <m.circle
        cx={36.5}
        cy={22.5}
        r={3.5}
        fill={stroke}
        stroke="none"
        {...(draw
          ? {
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { delay: 1.1, type: 'spring' as const, stiffness: 260, damping: 14 },
              style: { transformOrigin: '36.5px 22.5px' },
            }
          : {})}
      />
    </svg>
  )
}

interface LogoProps extends Omit<LogoMarkProps, 'size'> {
  size?: number
  /** Hide the wordmark and show the mark only. */
  markOnly?: boolean
}

/** Mark + "Pythia" wordmark set in the serif display face. */
export function Logo({ size = 28, markOnly = false, ...mark }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5 text-fg">
      <LogoMark size={size} {...mark} />
      {!markOnly && (
        <span className="font-serif leading-none tracking-tight" style={{ fontSize: size * 0.95 }}>
          Pythia
        </span>
      )}
    </span>
  )
}
