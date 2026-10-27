import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { QuizQuestion } from '@/content/types'
import { saveQuiz } from '@/data/repo'
import type { QuizResult } from '@/data/schema'
import type { LessonShape, LessonSummary } from '@/engine/progress'
import { cn } from '@/lib/cn'
import { renderInline } from '@/lib/markdown'

interface Props {
  lesson: LessonShape
  questions: QuizQuestion[]
  previous: QuizResult | undefined
  onSaved: (summary: LessonSummary, justCompleted: boolean) => void
}

/** The checkpoint: a few multiple-choice questions. Retakes are free; the best XP is kept. */
export function QuizStep({ lesson, questions, previous, onSaved }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map((_, i) => previous?.answers[i] ?? null))
  const [checked, setChecked] = useState(Boolean(previous && previous.total === questions.length))

  const complete = answers.every((a) => a !== null)
  const correct = answers.filter((a, i) => a === questions[i]!.answer).length

  const submit = async () => {
    setChecked(true)
    const { summary, justCompleted } = await saveQuiz(lesson, answers as number[], correct)
    onSaved(summary, justCompleted)
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Checkpoint</p>
      <h2 className="mt-2 font-serif text-3xl tracking-tight">Quick check</h2>
      <p className="mt-2 text-muted">No pressure: retake it as often as you like.</p>

      <ol className="mt-8 space-y-10">
        {questions.map((q, qi) => (
          <li key={q.id}>
            <p id={`${q.id}-label`} className="text-lg font-medium leading-snug">
              {qi + 1}. {renderInline(q.question, q.id)}
            </p>
            <div role="radiogroup" aria-labelledby={`${q.id}-label`} className="mt-3 space-y-2">
              {q.options.map((option, oi) => {
                const selected = answers[qi] === oi
                const isAnswer = checked && oi === q.answer
                const isWrong = checked && selected && oi !== q.answer
                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={checked}
                    onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                      !checked && (selected ? 'border-gold bg-gold/10' : 'border-line hover:border-line-strong hover:bg-surface'),
                      isAnswer && 'border-ok/60 bg-ok/10',
                      isWrong && 'border-bad/60 bg-bad/10',
                      checked && !isAnswer && !isWrong && 'border-line opacity-60',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('grid size-5 shrink-0 place-items-center rounded-full border text-[11px]', selected ? 'border-gold bg-gold text-gold-ink' : 'border-line-strong', isAnswer && 'border-ok bg-ok text-bg', isWrong && 'border-bad bg-bad text-bg')}
                    >
                      {isAnswer ? '✓' : isWrong ? '✕' : ''}
                    </span>
                    <span className="text-[15px]">{renderInline(option, `${q.id}-${oi}`)}</span>
                  </button>
                )
              })}
            </div>
            {checked && (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                <span className="font-medium text-fg">{answers[qi] === q.answer ? 'Right. ' : 'Not quite. '}</span>
                {renderInline(q.explanation, `${q.id}-ex`)}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 flex items-center gap-4">
        {checked ? (
          <>
            <p className="text-lg">
              You got <span className="font-semibold text-gold">{correct}</span> of {questions.length}.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setChecked(false)
                setAnswers(questions.map(() => null))
              }}
            >
              Try again
            </Button>
          </>
        ) : (
          <Button variant="primary" disabled={!complete} onClick={() => void submit()}>
            Check my answers
          </Button>
        )}
      </div>
    </div>
  )
}
