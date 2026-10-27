import { AnimatePresence, m } from 'framer-motion'
import { useId, useState } from 'react'
import { SectionHeading } from '@/features/landing/SectionHeading'
import { cn } from '@/lib/cn'

const ITEMS = [
  ['Is Pythia free?', 'Yes. The learning experience is free, and guest mode is fully featured. You can create an account later to sync progress across devices.'],
  ['Do I need an account?', 'No. Open the site and start coding. Your progress is saved in your browser; sign in only if you want it on more than one device.'],
  ['Does Pythia just give me the answer?', 'Never by default. Pythia asks guiding questions, then offers a ladder of hints. The full explanation only appears if you click “I’m stuck”.'],
  ['Does my code leave my browser?', 'Python runs in a Web Worker on your machine. The instant checks are local too. If the optional AI layer is on, a snippet is sent to our proxy for analysis when you pause typing; switch it off in Settings for local-only mode.'],
  ['Which Python is this?', 'CPython compiled to WebAssembly via Pyodide, with NumPy, pandas, matplotlib and scikit-learn available, and micropip for pure-Python packages.'],
  ['Does it work offline?', 'After your first visit, the app and the Python runtime are cached so lessons keep working without a connection. The optional AI layer needs the network; local analysis does not.'],
] as const

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium transition-colors hover:text-gold"
        >
          {q}
          <span aria-hidden className={cn('font-mono text-xl text-gold transition-transform duration-300', open && 'rotate-45')}>+</span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 leading-relaxed text-muted">{a}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-4xl px-6 py-28">
      <SectionHeading eyebrow="FAQ" title={<>Good <em className="text-gold">questions.</em></>} />
      <div className="mt-12 border-t border-line">
        {ITEMS.map(([q, a]) => (
          <Item key={q} q={q} a={a} />
        ))}
      </div>
    </section>
  )
}
