import { motion, useReducedMotion } from 'framer-motion'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50'
const variants: Record<Variant, string> = {
  primary: 'bg-gold text-gold-ink hover:brightness-110',
  secondary: 'border border-line-strong bg-raised/60 text-fg hover:border-gold/60 hover:bg-raised',
  ghost: 'text-muted hover:bg-raised hover:text-fg',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-[13px]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
}

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<typeof motion.button>, 'ref'> {
  variant?: Variant
  size?: Size
}

/** Pill button with a spring press. Use <LinkButton> for navigation. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, ...props },
  ref,
) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      ref={ref}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})

/** Class string so links (react-router <Link>) can look like buttons. */
export function buttonClass(variant: Variant = 'secondary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}
