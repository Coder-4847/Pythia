import { m, useReducedMotion } from 'framer-motion'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends Omit<ComponentPropsWithoutRef<typeof m.div>, 'ref'> {
  /** Lift slightly on hover with spring physics. */
  interactive?: boolean
}

export function Card({ interactive = false, className, ...props }: CardProps) {
  const reduce = useReducedMotion()
  return (
    <m.div
      whileHover={interactive && !reduce ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={cn(
        'rounded-2xl border border-line bg-surface p-6 transition-colors duration-200',
        interactive && 'hover:border-line-strong',
        className,
      )}
      {...props}
    />
  )
}
