import type { ReactNode } from 'react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Kbd } from '@/components/ui/Kbd'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'

const SWATCHES = [
  ['bg', 'Ink'],
  ['surface', 'Surface'],
  ['raised', 'Raised'],
  ['line', 'Line'],
  ['fg', 'Paper'],
  ['muted', 'Muted'],
  ['gold', 'Delphi gold'],
  ['ok', 'Success'],
  ['bad', 'Error'],
] as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-dim">{title}</h2>
      {children}
    </section>
  )
}

/** Living reference for the design system: tokens, type, brand and primitives. */
export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-5xl tracking-tight">Design system</h1>
      <p className="mt-3 max-w-xl text-muted">Restrained and premium: ink, paper, one gold accent.</p>

      <Section title="Brand">
        <div className="flex flex-wrap items-center gap-10">
          <Logo size={44} animate />
          <LogoMark size={44} mono className="text-fg" />
          <LogoMark size={28} />
          <LogoMark size={16} />
        </div>
      </Section>

      <Section title="Colour">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {SWATCHES.map(([token, name]) => (
            <div key={token}>
              <div className="h-16 rounded-xl border border-line" style={{ background: `var(--c-${token})` }} />
              <p className="mt-2 text-xs text-muted">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <p className="font-serif text-6xl tracking-tight">Instrument Serif for headlines</p>
        <p className="mt-4 text-lg">Geist for the interface: calm, legible, quietly confident.</p>
        <p className="mt-4 font-mono text-sm text-muted">for i in range(10): print(i)  # JetBrains Mono</p>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg">Start learning</Button>
          <Button variant="primary">Run</Button>
          <Button>Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm" disabled>Disabled</Button>
          <span className="ml-2 text-sm text-muted">
            Command palette <Kbd>⌘</Kbd> <Kbd>K</Kbd>
          </span>
        </div>
      </Section>

      <Section title="Progress & loading">
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <ProgressRing value={72} label="Lesson progress" />
          <div className="space-y-4">
            <ProgressBar value={64} label="Foundations" />
            <ProgressBar value={100} tone="ok" label="Complete" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card interactive>
            <h3 className="font-medium">Interactive card</h3>
            <p className="mt-2 text-sm text-muted">Lifts on hover with spring physics.</p>
          </Card>
          <Card>
            <h3 className="font-medium">Static card</h3>
            <p className="mt-2 text-sm text-muted">Surface, hairline border, generous padding.</p>
          </Card>
        </div>
      </Section>
    </div>
  )
}
