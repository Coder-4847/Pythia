import { AnimatePresence, m } from 'framer-motion'
import type { PyError, TestReport } from '@/workers/protocol'
import { cn } from '@/lib/cn'
import { renderInline } from '@/lib/markdown'

interface Props {
  report: TestReport | null
  /** XP earned by the check that produced `report`. */
  xpGained: number
}

function Mark({ pass }: { pass: boolean }) {
  return (
    <span
      aria-hidden
      className={cn('mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full text-[11px] font-bold', pass ? 'bg-ok/20 text-ok' : 'bg-bad/20 text-bad')}
    >
      {pass ? '✓' : '✕'}
    </span>
  )
}

function CodeProblem({ error }: { error: PyError }) {
  return (
    <div role="alert" className="rounded-xl border border-bad/40 bg-bad/10 p-3.5">
      <p className="text-sm font-medium text-bad">Python couldn’t run your code yet</p>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[12.5px] leading-5 text-bad">{error.traceback || error.message}</pre>
    </div>
  )
}

/** Friendly test results: what passed, what didn't, and specifically why. */
export function TestPanel({ report, xpGained }: Props) {
  if (!report) return null
  if (report.error) return <div className="mt-6"><CodeProblem error={report.error} /></div>
  if (report.stopped) return <p className="mt-6 text-sm text-dim">Check stopped.</p>

  const passed = report.results.filter((r) => r.passed).length
  const all = passed === report.results.length
  return (
    <section aria-label="Test results" className="mt-6">
      <m.p
        key={`${passed}/${report.results.length}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('text-sm font-medium', all ? 'text-ok' : 'text-muted')}
        aria-live="polite"
      >
        {all ? `All ${report.results.length} tests pass${xpGained > 0 ? ` · +${xpGained} XP` : ''}` : `${passed} of ${report.results.length} tests pass`}
      </m.p>
      <ul className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {report.results.map((r) => (
            <m.li
              key={r.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2.5 rounded-xl border border-line bg-surface/50 px-3 py-2.5"
            >
              <Mark pass={r.passed} />
              <div className="min-w-0 text-sm">
                <p className="font-mono text-[12.5px] text-fg">
                  {r.hidden ? <span className="rounded bg-raised px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-dim">hidden test</span> : r.name}
                </p>
                {!r.passed && r.message && <p className="mt-1.5 leading-relaxed text-muted">{renderInline(r.message, r.name)}</p>}
                {!r.passed && !r.hidden && r.expected !== null && r.got !== null && (
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
                    <dt className="text-dim">expected</dt>
                    <dd className="whitespace-pre-wrap break-words text-ok">{r.expected}</dd>
                    <dt className="text-dim">got</dt>
                    <dd className="whitespace-pre-wrap break-words text-bad">{r.got}</dd>
                  </dl>
                )}
              </div>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
