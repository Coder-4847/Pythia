import { m } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { parseDiagram, type DiagramSpec } from '@/features/lessons/diagram'
import { cn } from '@/lib/cn'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

function Frame({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <figure className="mt-6 rounded-2xl border border-line bg-surface/60 p-5">
      {children}
      {caption && <figcaption className="mt-4 text-center text-xs text-dim">{caption}</figcaption>}
    </figure>
  )
}

function Body({ spec }: { spec: DiagramSpec }) {
  const reduce = useReducedMotion()
  const motionProps = {
    variants: container,
    initial: reduce ? 'show' : 'hidden',
    whileInView: 'show',
    viewport: { once: true, margin: '-10% 0px' },
  } as const

  if (spec.type === 'boxes')
    return (
      <m.ul {...motionProps} className="flex flex-wrap justify-center gap-4">
        {spec.items.map((it) => (
          <m.li key={it.name} variants={item} className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-sm text-gold">{it.name}</span>
            <span className="grid min-h-12 min-w-20 place-items-center rounded-xl border border-line-strong bg-bg px-4 py-2 font-mono text-[15px]">{it.value}</span>
            {it.note && <span className="text-xs text-dim">{it.note}</span>}
          </m.li>
        ))}
      </m.ul>
    )

  if (spec.type === 'strip')
    return (
      <m.ol {...motionProps} className="flex justify-center overflow-x-auto pb-1">
        {spec.cells.map((cell, i) => {
          const lit = spec.highlight?.includes(i)
          return (
            <m.li key={i} variants={item} className="flex flex-col items-center">
              <span
                className={cn(
                  'grid h-12 min-w-14 place-items-center border border-line-strong px-3 font-mono text-[15px] transition-colors first:rounded-l-xl last:rounded-r-xl',
                  lit ? 'border-gold bg-gold/15 text-gold' : 'bg-bg',
                  i > 0 && '-ml-px',
                )}
              >
                {cell}
              </span>
              <span className="mt-1.5 font-mono text-xs text-dim">{i}</span>
              {spec.negative && <span className="font-mono text-xs text-dim/70">{i - spec.cells.length}</span>}
            </m.li>
          )
        })}
      </m.ol>
    )

  return (
    <m.ol {...motionProps} className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
      {spec.steps.map((step, i) => (
        <m.li key={i} variants={item} className="flex flex-col items-center gap-2 sm:flex-row">
          <span className="rounded-xl border border-line-strong bg-bg px-4 py-2.5 text-center">
            <span className="block font-mono text-[13px]">{step.label}</span>
            {step.detail && <span className="mt-0.5 block text-xs text-dim">{step.detail}</span>}
          </span>
          {i < spec.steps.length - 1 && (
            <span aria-hidden className="text-gold">
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </span>
          )}
        </m.li>
      ))}
    </m.ol>
  )
}

/** Renders a ```diagram fence. Invalid JSON shows a visible error instead of breaking the lesson. */
export function Diagram({ json }: { json: string }) {
  const spec = parseDiagram(json)
  if (!spec) return <p role="alert" className="mt-4 rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">This diagram could not be drawn (invalid diagram data).</p>
  return (
    <Frame caption={spec.caption}>
      <Body spec={spec} />
    </Frame>
  )
}
