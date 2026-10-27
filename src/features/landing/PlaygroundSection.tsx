import { m, useReducedMotion } from 'framer-motion'
import { CodeText } from '@/components/ui/CodeText'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/features/landing/SectionHeading'

const FEATURES = [
  ['Multi-file tabs', 'Split code across files and import between them.'],
  ['A real console', 'input() works. Stop actually stops.'],
  ['Inline plots', 'Matplotlib figures render right under your code.'],
  ['Any package', 'NumPy, pandas, scikit-learn built in; micropip for the rest.'],
  ['Shareable links', 'Your code is compressed into the URL. No server involved.'],
  ['Pythia, too', 'Same bug-spotting questions in free code.'],
] as const

const CODE = 'import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 6.28, 200)\nplt.plot(x, np.sin(x))\nplt.show()'
const WAVE = Array.from({ length: 60 }, (_, i) => {
  const x = 12 + (i / 59) * 216
  const y = 60 - Math.sin((i / 59) * Math.PI * 2) * 38
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
}).join(' ')

export function PlaygroundSection() {
  const reduce = useReducedMotion()
  return (
    <section id="playground" className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-28 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <SectionHeading eyebrow="Playground" title={<>Free code, <em className="text-gold">no friction.</em></>}>
          When you want to just try something, open the playground. Same engine, same Pythia, no lesson in the way.
        </SectionHeading>
        <ul className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {FEATURES.map(([title, body], i) => (
            <li key={title} className="list-none">
              <Reveal delay={i * 0.05}>
                <h3 className="text-[15px] font-medium">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <Reveal y={30}>
        <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-pop">
          <div className="flex border-b border-line text-xs">
            <span className="border-b-2 border-gold px-4 py-3 font-mono text-fg">wave.py</span>
            <span className="px-4 py-3 font-mono text-dim">notes.py</span>
            <span className="ml-auto px-4 py-3 font-mono text-dim">▶ Run</span>
          </div>
          <pre className="m-0 overflow-x-auto px-5 py-4 font-mono text-[12.5px] leading-6" aria-label="Example code">
            <CodeText code={CODE} />
          </pre>
          <div className="border-t border-line bg-bg/50 p-4">
            <svg viewBox="0 0 240 120" className="w-full" role="img" aria-label="A sine wave plotted by matplotlib">
              <rect x="0.5" y="0.5" width="239" height="119" rx="6" fill="none" stroke="var(--c-line)" />
              <line x1="12" y1="60" x2="228" y2="60" stroke="var(--c-line-strong)" strokeDasharray="2 3" />
              <m.path
                d={WAVE}
                fill="none"
                stroke="var(--c-gold)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: '-20% 0px' }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </svg>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
