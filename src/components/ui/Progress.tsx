import { animate, m, useMotionValue, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useEffect } from 'react'
import { cn } from '@/lib/cn'

const clamp = (n: number) => Math.min(100, Math.max(0, n))

interface RingProps {
  /** 0–100 */
  value: number
  size?: number
  stroke?: number
  label?: string
  className?: string
  /** Show the percentage in the middle. */
  showValue?: boolean
}

/** Circular progress that eases from 0 to `value` and counts the number up. */
export function ProgressRing({ value, size = 96, stroke = 7, label, className, showValue = true }: RingProps) {
  const reduce = useReducedMotion()
  const target = clamp(value)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useMotionValue(reduce ? target : 0)
  const dash = useTransform(progress, (v) => circumference * (1 - v / 100))
  const text = useTransform(progress, (v) => `${Math.round(v)}%`)

  useEffect(() => {
    if (reduce) {
      progress.set(target)
      return
    }
    const controls = animate(progress, target, { duration: 1.1, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [target, reduce, progress])

  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(target)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--c-line)" strokeWidth={stroke} />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--c-gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dash }}
        />
      </svg>
      {showValue && (
        <m.span className="absolute font-mono text-sm tabular-nums text-fg">{text}</m.span>
      )}
    </div>
  )
}

interface BarProps {
  value: number
  label?: string
  tone?: 'gold' | 'ok'
  className?: string
}

/** Horizontal progress bar that fills with easing. */
export function ProgressBar({ value, label, tone = 'gold', className }: BarProps) {
  const reduce = useReducedMotion()
  const pct = clamp(value)
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-raised', className)}
    >
      <m.div
        className={cn('h-full rounded-full', tone === 'gold' ? 'bg-gold' : 'bg-ok')}
        initial={{ width: reduce ? `${pct}%` : 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
