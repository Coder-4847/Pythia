import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { getLesson, neighbours, type CatalogLesson } from '@/content'
import { touchLesson } from '@/data/repo'
import { runtime } from '@/features/runtime/runtime'
import { useLessonData, type LessonData } from '@/data/hooks'
import { LESSON_BONUS_XP, summarizeLesson, type LessonShape, type LessonSummary } from '@/engine/progress'
import { Diagram } from '@/features/lessons/Diagram'
import { ExampleStep } from '@/features/lessons/ExampleStep'
import { ExerciseStep } from '@/features/lessons/ExerciseStep'
import { LessonComplete } from '@/features/lessons/LessonComplete'
import { QuizStep } from '@/features/lessons/QuizStep'
import { RunnableSnippet } from '@/features/lessons/RunnableSnippet'
import { cn } from '@/lib/cn'
import { renderMarkdown } from '@/lib/markdown'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import NotFoundPage from '@/features/misc/NotFoundPage'

export const shapeOf = (lesson: CatalogLesson): LessonShape => ({
  id: lesson.id,
  exerciseIds: lesson.exercises.map((e) => e.id),
  quizLength: lesson.quiz.length,
})

type StepKind = { kind: 'learn' } | { kind: 'example' } | { kind: 'exercise'; index: number } | { kind: 'quiz' }

function buildSteps(lesson: CatalogLesson): { kind: StepKind; label: string }[] {
  return [
    { kind: { kind: 'learn' }, label: 'Learn' },
    { kind: { kind: 'example' }, label: 'Example' },
    ...lesson.exercises.map((e, index) => ({ kind: { kind: 'exercise', index } as StepKind, label: `Exercise ${index + 1}`, title: e.title })),
    { kind: { kind: 'quiz' }, label: 'Checkpoint' },
  ]
}

function Stepper({ steps, current, doneFlags, onGo }: { steps: { label: string }[]; current: number; doneFlags: boolean[]; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Lesson steps" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {steps.map((s, i) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onGo(i)}
          aria-current={i === current ? 'step' : undefined}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors',
            i === current ? 'border-gold bg-gold/10 text-fg' : 'border-transparent text-muted hover:bg-raised hover:text-fg',
          )}
        >
          <span
            aria-hidden
            className={cn('grid size-4 place-items-center rounded-full text-[10px] font-bold', doneFlags[i] ? 'bg-ok text-bg' : i === current ? 'bg-gold text-gold-ink' : 'bg-line-strong text-dim')}
          >
            {doneFlags[i] ? '✓' : i + 1}
          </span>
          {s.label}
          {doneFlags[i] && <span className="sr-only"> (done)</span>}
        </button>
      ))}
    </nav>
  )
}

function LessonView({ lesson, data }: { lesson: CatalogLesson; data: LessonData }) {
  const shape = useMemo(() => shapeOf(lesson), [lesson])
  const steps = useMemo(() => buildSteps(lesson), [lesson])
  const summary = summarizeLesson(shape, data.attempts, data.quiz, Boolean(data.progress))
  const { prev, next } = neighbours(lesson.id)

  // Resume where the learner left off (a finished lesson reopens at the start).
  const [step, setStep] = useState(() => {
    const saved = data.progress
    return saved && saved.status !== 'completed' ? Math.min(saved.step, steps.length - 1) : 0
  })
  const [view, setView] = useState<'steps' | 'complete'>('steps')
  useDocumentTitle(lesson.title)

  useEffect(() => {
    void touchLesson(lesson.id, step)
  }, [lesson.id, step])

  // Warm up Python while the learner reads, so the first Run is instant.
  useEffect(() => {
    void runtime.ensureReady().catch(() => {})
  }, [])

  const go = useCallback((i: number) => {
    setView('steps')
    setStep(Math.max(0, Math.min(steps.length - 1, i)))
  }, [steps.length])

  const finishIfComplete = useCallback((_summary: LessonSummary, justCompleted: boolean) => {
    // Let the pass celebration play before moving to the summary.
    if (justCompleted) setTimeout(() => setView('complete'), 1400)
  }, [])

  const exerciseDone = (id: string) => data.attempts.some((a) => a.exerciseId === id && a.passed)
  // Learn and Example count as done once the learner has moved past them.
  const doneFlags = steps.map((s, i) =>
    s.kind.kind === 'exercise' ? exerciseDone(lesson.exercises[s.kind.index]!.id) : s.kind.kind === 'quiz' ? summary.quizDone : i < step,
  )
  const lessonXp = data.attempts.reduce((n, a) => n + a.xpAwarded, 0) + (data.quiz?.xpAwarded ?? 0) + LESSON_BONUS_XP

  const current = steps[step]!.kind
  const hooks = {
    runnable: (code: string, key: string) => <RunnableSnippet code={code} id={`${lesson.id}:${key}`} />,
    diagram: (json: string, key: string) => <Diagram key={key} json={json} />,
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <header className="border-b border-line px-4 pb-2 pt-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/learn" className="text-sm text-muted hover:text-fg" aria-label="Back to the curriculum">
            ← Curriculum
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium">{lesson.title}</h1>
          <span className="hidden font-mono text-xs text-dim sm:inline">{lesson.minutes} min</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0 && view === 'steps'}>
              Back
            </Button>
            <Button size="sm" variant="secondary" onClick={() => go(step + 1)} disabled={step === steps.length - 1 && view === 'steps'}>
              Next
            </Button>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="w-full sm:w-44">
            <ProgressBar value={summary.percent} label="Lesson progress" tone={summary.percent === 100 ? 'ok' : 'gold'} />
          </div>
          <Stepper steps={steps} current={step} doneFlags={doneFlags} onGo={go} />
        </div>
      </header>

      {view === 'complete' ? (
        <LessonComplete lesson={lesson} xp={lessonXp} next={next} onReview={() => go(0)} />
      ) : current.kind === 'learn' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="mx-auto w-full max-w-3xl px-6 py-10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">{lesson.minutes} minute lesson</p>
            <h2 className="mt-2 font-serif text-5xl tracking-tight">{lesson.title}</h2>
            <p className="mt-3 text-lg text-muted">{lesson.summary}</p>
            <div>{renderMarkdown(lesson.concept, hooks)}</div>
            <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
              <span className="text-sm text-dim">{prev ? `Previous: ${prev.title}` : 'First lesson'}</span>
              <Button variant="primary" onClick={() => go(1)}>
                See a worked example →
              </Button>
            </div>
          </article>
        </div>
      ) : current.kind === 'example' ? (
        <ExampleStep example={lesson.example} />
      ) : current.kind === 'exercise' ? (
        <ExerciseStep
          key={lesson.exercises[current.index]!.id}
          lesson={shape}
          exercise={lesson.exercises[current.index]!}
          attempts={data.attempts.filter((a) => a.exerciseId === lesson.exercises[current.index]!.id)}
          onChecked={finishIfComplete}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <QuizStep key={data.quiz?.updatedAt ?? 'new'} lesson={shape} questions={lesson.quiz} previous={data.quiz} onSaved={finishIfComplete} />
        </div>
      )}
    </div>
  )
}

export default function LessonPage() {
  const { id = '' } = useParams()
  const lesson = getLesson(id)
  const data = useLessonData(id)
  if (!lesson) return <NotFoundPage />
  if (!data)
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-16" role="status" aria-label="Loading lesson">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    )
  return <LessonView key={lesson.id} lesson={lesson} data={data} />
}

