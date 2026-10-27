import { AnimatePresence, m } from 'framer-motion'
import { CodeText } from '@/components/ui/CodeText'
import { LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import type { Exercise } from '@/content/types'
import { renderInline, renderMarkdown } from '@/lib/markdown'
import { exerciseXp } from '@/engine/progress'

const RUNGS = [
  { label: 'Give me a nudge', title: 'A nudge' },
  { label: 'Ask me a guiding question', title: 'A question to think about' },
  { label: 'Show a concrete hint', title: 'A concrete hint' },
  { label: 'I’m stuck — explain it', title: 'The full explanation' },
] as const

interface Props {
  exercise: Exercise
  /** Highest rung revealed so far (0–4). */
  level: number
  onLevel: (level: number) => void
  /** Once passed, XP is locked in and the ladder is just a reference. */
  passed: boolean
}

/**
 * The hint ladder: nudge → question → concrete hint → full explanation. Each rung is opt-in,
 * and the cost is shown up front and kept small, because hints are help, not failure.
 */
export function HintLadder({ exercise, level, onLevel, passed }: Props) {
  const next = RUNGS[level]
  const cost = next && level < 4 ? exerciseXp(level + 1) - exerciseXp(level) : 0

  return (
    <section aria-label="Hints from Pythia" className="mt-8 rounded-2xl border border-line bg-surface/60 p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-gold">
        <LogoMark size={16} /> Pythia can help
      </div>

      <ol className="mt-3 space-y-3">
        <AnimatePresence initial={false}>
          {RUNGS.slice(0, level).map((rung, i) => (
            <m.li
              key={rung.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="rounded-xl border border-line bg-bg/50 p-3.5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">{rung.title}</p>
              {i < 3 ? (
                <p className="mt-1.5 text-[15px] leading-relaxed">{renderInline(exercise.hints[i]!, `hint${i}`)}</p>
              ) : (
                <div className="-mt-2">
                  {renderMarkdown(exercise.explanation)}
                  <details className="mt-4 rounded-lg border border-line">
                    <summary className="cursor-pointer px-3 py-2 text-sm text-muted">Show the reference solution</summary>
                    <pre className="overflow-x-auto border-t border-line px-3 py-2.5 font-mono text-[13px] leading-6">
                      <CodeText code={exercise.solution} />
                    </pre>
                  </details>
                </div>
              )}
            </m.li>
          ))}
        </AnimatePresence>
      </ol>

      {next && !passed ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm" variant={level === 3 ? 'secondary' : 'ghost'} onClick={() => onLevel(level + 1)}>
            {next.label}
          </Button>
          <span className="text-xs text-dim">
            {level < 3 ? `Costs ${-cost} XP.` : 'Costs a little XP, never your streak.'}
          </span>
        </div>
      ) : (
        level === 0 && <p className="mt-2 text-sm text-muted">Stuck? Hints unlock one step at a time.</p>
      )}
    </section>
  )
}
