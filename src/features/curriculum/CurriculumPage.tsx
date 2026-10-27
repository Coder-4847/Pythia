import { m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/Logo'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { lessonsInModule, lessonsInTrack, modulesInTrack, type CatalogLesson } from '@/content'
import { TRACKS, type TrackMeta } from '@/content/tracks'
import { useProgressMap } from '@/data/hooks'
import type { LessonProgress } from '@/data/schema'
import { lessonState, type LessonState } from '@/engine/progress'
import { ContinueCard } from '@/features/curriculum/ContinueCard'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

type Progress = Map<string, LessonProgress>
const statusOf = (progress: Progress, id: string) => progress.get(id)?.status ?? 'not_started'

function Node({ state, percent }: { state: LessonState; percent: number }) {
  if (state === 'in_progress') return <ProgressRing value={percent} size={28} stroke={3.5} showValue={false} label="In progress" />
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-7 place-items-center rounded-full border-2 text-xs',
        state === 'completed' && 'border-gold bg-gold text-gold-ink',
        state === 'available' && 'border-gold/60 bg-bg',
        state === 'locked' && 'border-line-strong bg-bg text-dim',
      )}
    >
      {state === 'completed' ? '✓' : state === 'locked' ? '·' : ''}
    </span>
  )
}

const STATE_LABEL: Record<LessonState, string> = { completed: 'Completed', in_progress: 'In progress', available: 'Ready', locked: 'Recommended later' }

function LessonRow({ lesson, state, percent, previous }: { lesson: CatalogLesson; state: LessonState; percent: number; previous: CatalogLesson | null }) {
  return (
    <li className="relative pl-12">
      <span className="absolute left-0 top-3.5 grid w-7 place-items-center">
        <Node state={state} percent={percent} />
      </span>
      <m.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
        <Link
          to={`/lesson/${lesson.id}`}
          className={cn(
            'block rounded-2xl border border-line px-4 py-3.5 transition-colors hover:border-line-strong hover:bg-surface',
            state === 'locked' && 'opacity-60 hover:opacity-100',
            state === 'completed' && 'bg-surface/40',
          )}
        >
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-[15px] font-medium">{lesson.title}</span>
            <span className="font-mono text-xs text-dim">
              {lesson.minutes} min · {lesson.exercises.length} exercises
            </span>
            <span className={cn('ml-auto font-mono text-[11px] uppercase tracking-wider', state === 'completed' ? 'text-ok' : state === 'in_progress' ? 'text-gold' : 'text-dim')}>
              {STATE_LABEL[state]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{lesson.summary}</p>
          {state === 'locked' && previous && <p className="mt-1.5 text-xs text-dim">Best after “{previous.title}” — but you can jump in any time.</p>}
        </Link>
      </m.div>
    </li>
  )
}

function TrackSection({ track, index, progress }: { track: TrackMeta; index: number; progress: Progress }) {
  const lessons = lessonsInTrack(track.id)
  const done = lessons.filter((l) => statusOf(progress, l.id) === 'completed').length
  const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0

  return (
    <section aria-labelledby={`track-${track.id}`} className="mt-16">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-dim">Track {String(index + 1).padStart(2, '0')}</p>
          <h2 id={`track-${track.id}`} className="mt-1 font-serif text-4xl tracking-tight">
            {track.title}
          </h2>
          <p className="mt-1 text-muted">{track.blurb}</p>
        </div>
        {lessons.length > 0 && (
          <div className="w-48">
            <div className="mb-1.5 flex justify-between font-mono text-xs text-muted">
              <span>
                {done}/{lessons.length} lessons
              </span>
              <span>{percent}%</span>
            </div>
            <ProgressBar value={percent} label={`${track.title} progress`} tone={percent === 100 ? 'ok' : 'gold'} />
          </div>
        )}
      </div>

      {lessons.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong p-6">
          <p className="font-medium">On the roadmap</p>
          <p className="mt-1 text-sm text-muted">Lessons for this track are being written. Planned topics:</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {track.topics.map((t) => (
              <li key={t} className="rounded-md bg-raised px-2 py-1 font-mono text-[11.5px] text-muted">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="relative mt-8">
          <div aria-hidden className="absolute bottom-6 left-[13px] top-6 w-px bg-line" />
          {modulesInTrack(track.id).map((module) => (
            <div key={module.id} className="mb-8 last:mb-0">
              <div className="mb-3 pl-12">
                <h3 className="text-lg font-medium">{module.title}</h3>
                <p className="text-sm text-dim">{module.blurb}</p>
              </div>
              <ul className="space-y-2.5">
                {lessonsInModule(module.id).map((lesson) => {
                  const previous = lesson.index > 0 ? lessons[lesson.index - 1]! : null
                  const state = lessonState(statusOf(progress, lesson.id), !previous || statusOf(progress, previous.id) === 'completed')
                  return <LessonRow key={lesson.id} lesson={lesson} state={state} percent={progress.get(lesson.id)?.percent ?? 0} previous={previous} />
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function CurriculumPage() {
  useDocumentTitle('Curriculum')
  const progress = useProgressMap()
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <div className="flex items-center gap-3">
        <LogoMark size={30} />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold">Curriculum</p>
      </div>
      <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">Your path</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Short lessons, real code, tests that explain themselves. Work through them in order, or jump to what you need.</p>

      <div className="mt-10">
        {progress ? <ContinueCard progress={progress} /> : <Skeleton className="h-36 w-full rounded-3xl" />}
      </div>

      {progress ? (
        TRACKS.map((track, i) => <TrackSection key={track.id} track={track} index={i} progress={progress} />)
      ) : (
        <div className="mt-16 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
    </div>
  )
}
