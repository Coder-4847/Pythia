import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface Props {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  /** Right-aligned actions beside the title. */
  actions?: ReactNode
  /** Narrower reading width for text-heavy pages. */
  narrow?: boolean
  children: ReactNode
}

/** The standard page frame: eyebrow, serif title, optional subtitle and actions. */
export function PageShell({ eyebrow, title, subtitle, actions, narrow, children }: Props) {
  return (
    <div className={cn('mx-auto w-full px-6 py-12 sm:py-14', narrow ? 'max-w-3xl' : 'max-w-6xl')}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
          <h1 className="mt-2 font-serif text-5xl tracking-tight sm:text-6xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-lg text-muted">{subtitle}</p>}
        </div>
        {actions}
      </header>
      <div className="mt-10">{children}</div>
    </div>
  )
}
