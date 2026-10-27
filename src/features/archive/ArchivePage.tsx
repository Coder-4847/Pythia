import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/ui/PageShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { LESSONS } from '@/content'
import { TRACKS } from '@/content/tracks'
import { db } from '@/data/db'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

type StatusFilter = 'all' | 'completed' | 'in_progress'
const STATUS: [StatusFilter, string][] = [
  ['all', 'All'],
  ['completed', 'Completed'],
  ['in_progress', 'In progress'],
]

const date = (ts: number) => new Date(ts).toLocaleDateString(undefined, { dateStyle: 'medium' })

/** Everything you've worked on, searchable by lesson or by the code you wrote. */
export default function ArchivePage() {
  useDocumentTitle('Archive')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [track, setTrack] = useState('all')

  const data = useLiveQuery(async () => ({ progress: await db.lessonProgress.toArray(), attempts: await db.attempts.toArray() }), [])

  const rows = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return LESSONS.flatMap((lesson) => {
      const progress = data.progress.find((p) => p.lessonId === lesson.id)
      if (!progress || progress.status === 'not_started') return []
      if (status !== 'all' && progress.status !== status) return []
      if (track !== 'all' && lesson.track !== track) return []
      const attempts = data.attempts.filter((a) => a.lessonId === lesson.id)
      const inCode = q !== '' && attempts.some((a) => a.code.toLowerCase().includes(q))
      const inText = `${lesson.title} ${lesson.summary}`.toLowerCase().includes(q)
      if (q && !inText && !inCode) return []
      return [{ lesson, progress, attempts: attempts.length, xp: attempts.reduce((n, a) => n + a.xpAwarded, 0), matchedCode: inCode && !inText }]
    }).sort((a, b) => b.progress.updatedAt - a.progress.updatedAt)
  }, [data, query, status, track])

  return (
    <PageShell eyebrow="Archive" title="Everything you’ve done" subtitle="Revisit a lesson, see how your solutions changed, and compare your first try with your latest.">
      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-64">
          <span className="sr-only">Search lessons and your code</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, or code you’ve written…"
            className="w-full rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm outline-none placeholder:text-dim focus:border-gold"
          />
        </label>
        <div role="radiogroup" aria-label="Status" className="flex gap-1">
          {STATUS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={status === id}
              onClick={() => setStatus(id)}
              className={cn('rounded-full border px-3.5 py-1.5 text-sm transition-colors', status === id ? 'border-gold bg-gold/10 text-fg' : 'border-line text-muted hover:border-line-strong')}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Track</span>
          <select value={track} onChange={(e) => setTrack(e.target.value)} className="rounded-full border border-line-strong bg-surface px-4 py-2 text-sm outline-none focus:border-gold">
            <option value="all">All tracks</option>
            {TRACKS.filter((t) => t.status === 'full' || LESSONS.some((l) => l.track === t.id)).map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8" aria-live="polite">
        {!data ? (
          <div className="space-y-3" role="status" aria-label="Loading">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
            <p className="font-serif text-3xl">{data.progress.length === 0 ? 'Nothing here yet' : 'No lessons match'}</p>
            <p className="mt-2 text-muted">{data.progress.length === 0 ? 'Lessons you start will appear here, with every attempt you make.' : 'Try a different search or filter.'}</p>
            {data.progress.length === 0 && <Link to="/learn" className="mt-5 inline-block text-gold underline underline-offset-4">Start a lesson</Link>}
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ lesson, progress, attempts, xp, matchedCode }) => (
              <li key={lesson.id}>
                <Link to={`/archive/${lesson.id}`} className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:border-line-strong">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-muted">
                      {TRACKS.find((t) => t.id === lesson.track)?.title} · {matchedCode ? 'matches code you wrote' : lesson.summary}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-dim">{attempts} {attempts === 1 ? 'attempt' : 'attempts'} · {xp} XP</p>
                  <p className={cn('font-mono text-[11px] uppercase tracking-wider', progress.status === 'completed' ? 'text-ok' : 'text-gold')}>
                    {progress.status === 'completed' ? `Completed ${date(progress.completedAt ?? progress.updatedAt)}` : 'In progress'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
