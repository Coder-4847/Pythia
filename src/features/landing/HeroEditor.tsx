import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { CodeText } from '@/components/ui/CodeText'

const BUGGY = 'total = 0\nfor i in range(1, 10):\n    total += i\nprint("Sum of 1 to 10:", total)'
const BUG_LINE = 2 // 1-based line that Pythia flags
const LINE_HEIGHT = 26

type Phase = 'typing' | 'flagged' | 'asked' | 'fixing' | 'solved'

/** The demo source with `range(1, <arg>)` swapped in. */
const withRange = (arg: string) => BUGGY.replace('range(1, 10)', `range(1, ${arg})`)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * The hero demo: an editor that types a classic off-by-one by itself, Pythia
 * flags the line before anything is run, asks a question, and the "learner"
 * finds the fix. Loops forever; under reduced motion it shows the asked state.
 */
export function HeroEditor() {
  const reduce = useReducedMotion()
  const [text, setText] = useState(reduce ? BUGGY : '')
  const [phase, setPhase] = useState<Phase>(reduce ? 'asked' : 'typing')

  useEffect(() => {
    if (reduce) return
    let cancelled = false
    const wait = async (ms: number) => {
      await sleep(ms)
      return !cancelled
    }

    async function type(from: string, add: string) {
      let current = from
      for (const ch of add) {
        current += ch
        setText(current)
        if (!(await wait(ch === '\n' ? 260 : 34 + Math.random() * 46))) return false
      }
      return true
    }

    async function loop() {
      while (!cancelled) {
        setText('')
        setPhase('typing')
        if (!(await wait(700)) || !(await type('', BUGGY))) return
        if (!(await wait(900))) return
        setPhase('flagged')
        if (!(await wait(1000))) return
        setPhase('asked')
        if (!(await wait(5200))) return
        setPhase('fixing')
        // The learner works it out: backspace the 10, type 11.
        for (const arg of ['1', '', '1', '11']) {
          setText(withRange(arg))
          if (!(await wait(arg === '' ? 420 : 220))) return
        }
        if (!(await wait(500))) return
        setPhase('solved')
        if (!(await wait(4800))) return
      }
    }
    void loop()
    return () => {
      cancelled = true
    }
  }, [reduce])

  const lines = text.split('\n')
  const flagged = phase === 'flagged' || phase === 'asked'

  return (
    <div className="relative w-full max-w-xl md:mb-24" aria-label="Animated demo: Pythia flags an off-by-one error in a loop">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--c-gold)_14%,transparent),transparent)]" />
      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-pop">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-3 font-mono text-xs text-dim">sum_to_ten.py</span>
        </div>

        {/* editor */}
        <div className="relative px-0 py-4 font-mono text-[13.5px]" aria-hidden>
          {lines.map((line, i) => {
            const n = i + 1
            const isBug = n === BUG_LINE && flagged
            return (
              <div
                key={n}
                className="flex items-center transition-colors duration-500"
                style={{
                  height: LINE_HEIGHT,
                  background: isBug ? 'color-mix(in srgb, var(--c-gold) 9%, transparent)' : 'transparent',
                }}
              >
                <span className="relative flex w-12 shrink-0 items-center justify-end pr-3 text-xs text-dim">
                  {isBug && (
                    <span
                      className="absolute left-3 size-2 rounded-full bg-gold"
                      style={{ animation: 'pulse-soft 1.6s ease-in-out infinite' }}
                    />
                  )}
                  {n}
                </span>
                <pre className="m-0 whitespace-pre">
                  <CodeText code={line} />
                  {i === lines.length - 1 && phase !== 'asked' && phase !== 'solved' && (
                    <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-gold" style={{ animation: 'pulse-soft 1s steps(2) infinite' }} />
                  )}
                </pre>
              </div>
            )
          })}
        </div>

        {/* console, shown once the learner has fixed the loop */}
        <AnimatePresence initial={false}>
          {phase === 'solved' && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-line bg-bg/60"
            >
              <p className="px-5 py-3 font-mono text-[13px] text-ok">Sum of 1 to 10: 55</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pythia card: overlaps the empty right side of the editor on wide screens, sits below on small ones. */}
      <div
        className="relative mt-3 md:absolute md:right-[-2.5rem] md:top-[calc(100%-1rem)] md:mt-0 md:w-[17.5rem]"
      >
        <AnimatePresence mode="wait">
          {(phase === 'asked' || phase === 'solved') && (
            <m.div
              key={phase}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="rounded-xl border border-gold/40 bg-raised p-4 shadow-pop"
              role="note"
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
                <LogoMark size={16} />
                Pythia · line {BUG_LINE}
              </div>
              <p className="mt-2.5 text-[15px] leading-snug text-fg">
                {phase === 'asked' ? (
                  <>
                    What do you expect <code className="rounded bg-bg px-1 font-mono text-[13px] text-gold">i</code> to be on the last loop?
                  </>
                ) : (
                  <>
                    Nice. What does the second argument of <code className="rounded bg-bg px-1 font-mono text-[13px] text-gold">range</code> mean now?
                  </>
                )}
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
