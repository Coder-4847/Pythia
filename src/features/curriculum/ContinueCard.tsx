import { Link } from 'react-router-dom'
import { buttonClass } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/Progress'
import { LESSONS } from '@/content'
import type { LessonProgress } from '@/data/schema'
import { recommendNext } from '@/engine/progress'

type Progress = Map<string, LessonProgress>
const statusOf = (progress: Progress, id: string) => progress.get(id)?.status ?? 'not_started'

/** "Continue where you left off": the lesson in progress, or the next one to start. */
export function ContinueCard({ progress }: { progress: Progress }) {
  const next = recommendNext(LESSONS, (id) => statusOf(progress, id))
  const started = next ? statusOf(progress, next.id) === 'in_progress' : false
  const anyProgress = [...progress.values()].some((p) => p.status !== 'not_started')

  if (!next)
    return (
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="font-serif text-3xl">You’ve finished everything available.</p>
        <p className="mt-2 text-muted">More lessons are on the way. Meanwhile, the playground is always open.</p>
      </div>
    )
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-gold/30 bg-surface p-6 sm:flex-row sm:items-center sm:gap-6">
      <ProgressRing value={progress.get(next.id)?.percent ?? 0} size={92} label={`${next.title} progress`} />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">{started ? 'Continue where you left off' : anyProgress ? 'Up next' : 'Start here'}</p>
        <p className="mt-1.5 font-serif text-3xl tracking-tight sm:truncate">{next.title}</p>
        <p className="mt-1 text-sm text-muted">{next.summary}</p>
      </div>
      <Link to={`/lesson/${next.id}`} className={buttonClass('primary', 'lg')}>
        {started ? 'Continue' : 'Start'} →
      </Link>
    </div>
  )
}
