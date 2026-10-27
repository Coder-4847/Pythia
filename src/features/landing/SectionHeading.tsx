import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'

interface Props {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
}

export function SectionHeading({ eyebrow, title, children }: Props) {
  return (
    <div className="max-w-2xl">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">{title}</h2>
      </Reveal>
      {children && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-lg leading-relaxed text-muted">{children}</p>
        </Reveal>
      )}
    </div>
  )
}
