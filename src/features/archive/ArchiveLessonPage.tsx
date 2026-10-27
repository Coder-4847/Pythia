import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buttonClass } from '@/components/ui/Button'
import { CodeText } from '@/components/ui/CodeText'
import { PageShell } from '@/components/ui/PageShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { getLesson } from '@/content'
import { useLessonData } from '@/data/hooks'
import type { Attempt } from '@/data/schema'
import NotFoundPage from '@/features/misc/NotFoundPage'
import { cn } from '@/lib/cn'
import { diffLines } from '@/lib/diff'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const HELP = ['No hints', 'A nudge', 'A question', 'A concrete hint', 'Full explanation']
const when = (ts: number) => new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function Code({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-bg/60 px-4 py-3 font-mono text-[13px] leading-6">
      <CodeText code={code} />
    </pre>
  )
}

function Diff({ before, after }: { before: string; after: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-bg/60 py-2 font-mono text-[13px] leading-6" aria-label="Changes from your first attempt to your latest">
      {diffLines(before, after).map((line, i) => (
        <div
          key={i}
          className={cn('px-4', line.kind === 'added' && 'bg-ok/10 text-ok', line.kind === 'removed' && 'bg-bad/10 text-bad line-through decoration-bad/40')}
        >
          <span aria-hidden className="mr-3 inline-block w-3 select-none text-dim">{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' '}</span>
          <span className="sr-only">{line.kind === 'added' ? 'added: ' : line.kind === 'removed' ? 'removed: ' : ''}</span>
          {line.text || ' '}
        </div>
      ))}
    </pre>
  )
}

function AttemptRow({ attempt, index }: { attempt: Attempt; index: number }) {
  const [open, setOpen] = useState(false)
  const passedTests = attempt.results.filter((r) => r.passed).length
  return (
    <li className="relative border-l border-line pl-5">
      <span aria-hidden className={cn('absolute -left-[5px] top-2 size-2.5 rounded-full', attempt.passed ? 'bg-ok' : 'bg-line-strong')} />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs text-dim">#{index + 1}</span>
        <span className="text-sm">{when(attempt.at)}</span>
        <span className={cn('rounded-full border px-2 py-0.5 text-[11px]', attempt.passed ? 'border-ok/40 text-ok' : 'border-line-strong text-muted')}>
          {attempt.passed ? 'Passed' : attempt.results.length ? `${passedTests} of ${attempt.results.length} tests` : "Didn't run"}
        </span>
        <span className="text-xs text-dim">{HELP[attempt.hintsUsed]}</span>
        {attempt.xpAwarded > 0 && <span className="font-mono text-xs text-gold">+{attempt.xpAwarded} XP</span>}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="ml-auto text-xs text-muted underline-offset-4 hover:text-fg hover:underline">
          {open ? 'Hide code' : 'View code'}
        </button>
      </div>
      {open && <div className="mt-2"><Code code={attempt.code} /></div>}
    </li>
  )
}

function ExerciseHistory({ title, attempts }: { title: string; attempts: Attempt[] }) {
  const [compare, setCompare] = useState(false)
  const sorted = [...attempts].sort((a, b) => a.at - b.at)
  const first = sorted[0]
  const latest = sorted[sorted.length - 1]
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-medium">{title}</h3>
        {sorted.length >= 2 && first && latest && first.code !== latest.code && (
          <button
            type="button"
            onClick={() => setCompare((c) => !c)}
            aria-pressed={compare}
            className={cn(buttonClass('secondary', 'sm'), compare && 'border-gold')}
          >
            Compare first and latest
          </button>
        )}
      </div>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-dim">Not attempted yet.</p>
      ) : (
        <>
          {compare && first && latest && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-dim">First attempt → latest attempt</p>
              <Diff before={first.code} after={latest.code} />
            </div>
          )}
          <ol className="mt-4 space-y-4">
            {sorted.map((a, i) => <AttemptRow key={a.id} attempt={a} index={i} />)}
          </ol>
        </>
      )}
    </section>
  )
}

/** One lesson's history: every attempt per exercise, with a diff of first versus latest. */
export default function ArchiveLessonPage() {
  const { id = '' } = useParams()
  const lesson = getLesson(id)
  const data = useLessonData(id)
  useDocumentTitle(lesson ? `${lesson.title} history` : undefined)
  if (!lesson) return <NotFoundPage />

  return (
    <PageShell
      eyebrow="Archive"
      title={lesson.title}
      subtitle={data?.progress?.status === 'completed' ? `Completed ${when(data.progress.completedAt ?? data.progress.updatedAt)}` : 'In progress'}
      actions={
        <div className="flex gap-2">
          <Link to="/archive" className={buttonClass('ghost', 'md')}>← Archive</Link>
          <Link to={`/lesson/${lesson.id}`} className={buttonClass('primary', 'md')}>Open lesson</Link>
        </div>
      }
    >
      {!data ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <div className="space-y-4">
          {lesson.exercises.map((e) => (
            <ExerciseHistory key={e.id} title={e.title} attempts={data.attempts.filter((a) => a.exerciseId === e.id)} />
          ))}
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="text-lg font-medium">Checkpoint</h3>
            <p className="mt-2 text-sm text-muted">
              {data.quiz ? `You got ${data.quiz.correct} of ${data.quiz.total} on ${when(data.quiz.completedAt)}.` : 'Not taken yet.'}
            </p>
          </section>
        </div>
      )}
    </PageShell>
  )
}
