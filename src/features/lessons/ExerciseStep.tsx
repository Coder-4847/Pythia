import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Celebration } from '@/components/ui/Celebration'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Exercise } from '@/content/types'
import { getDraft, recordAttempt, saveDraft } from '@/data/repo'
import type { Attempt } from '@/data/schema'
import type { LessonShape, LessonSummary } from '@/engine/progress'
import { HintLadder } from '@/features/lessons/HintLadder'
import { TestPanel } from '@/features/lessons/TestPanel'
import { Workspace } from '@/features/lessons/Workspace'
import { useRunner } from '@/features/runtime/useRunner'
import { renderMarkdown } from '@/lib/markdown'
import type { TestReport } from '@/workers/protocol'

interface Props {
  lesson: LessonShape
  exercise: Exercise
  attempts: Attempt[]
  /** Called after every check with the lesson's fresh summary. */
  onChecked: (summary: LessonSummary, justCompleted: boolean, passed: boolean) => void
}

const AUTOSAVE_MS = 500

/** One exercise: prompt and hints on the left, editor, console and tests on the right. */
export function ExerciseStep({ lesson, exercise, attempts, onChecked }: Props) {
  const runner = useRunner()
  const [code, setCode] = useState<string | null>(null) // null until the saved draft is loaded
  const [hintLevel, setHintLevel] = useState(0)
  const [stdin, setStdin] = useState('')
  const [report, setReport] = useState<TestReport | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [celebration, setCelebration] = useState(0)
  const [confirmReset, setConfirmReset] = useState(false)
  const [editorKey, setEditorKey] = useState(0) // bump to force the editor to take a new document

  const passed = attempts.some((a) => a.exerciseId === exercise.id && a.passed)
  const latest = useRef({ code, hintLevel })
  useLayoutEffect(() => {
    latest.current = { code, hintLevel }
  })

  // Load the autosaved draft (or the starter) once per exercise.
  useEffect(() => {
    let cancelled = false
    void getDraft(lesson.id, exercise.id).then((draft) => {
      if (cancelled) return
      setCode(draft?.code ?? exercise.starter)
      setHintLevel(draft?.hintLevel ?? 0)
    })
    return () => {
      cancelled = true
    }
  }, [lesson.id, exercise.id, exercise.starter])

  // Autosave: shortly after the last keystroke or hint.
  useEffect(() => {
    if (code === null) return
    const timer = setTimeout(() => void saveDraft(lesson.id, exercise.id, code, hintLevel), AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [code, hintLevel, lesson.id, exercise.id])

  // Don't lose the last half-second of typing when leaving the step.
  useEffect(
    () => () => {
      const { code: c, hintLevel: h } = latest.current
      if (c !== null) void saveDraft(lesson.id, exercise.id, c, h)
    },
    [lesson.id, exercise.id],
  )

  const files = useCallback(() => [{ name: 'main.py', code: latest.current.code ?? '' }], [])

  const run = useCallback(() => {
    if (!runner.running) void runner.run(files(), 'main.py', stdin)
  }, [runner, files, stdin])

  const check = useCallback(async () => {
    if (runner.running || latest.current.code === null) return
    const source = latest.current.code
    const result = await runner.check(files(), 'main.py', exercise.tests)
    if (result.stopped) return
    setReport(result)
    const outcome = await recordAttempt({
      lesson,
      exerciseId: exercise.id,
      code: source,
      results: result.results.map(({ name, hidden, passed: ok }) => ({ name, hidden, passed: ok })),
      hintsUsed: latest.current.hintLevel,
    })
    setXpGained(outcome.attempt.xpAwarded)
    if (outcome.attempt.passed) setCelebration((n) => n + 1)
    onChecked(outcome.summary, outcome.justCompleted, outcome.attempt.passed)
  }, [runner, files, exercise, lesson, onChecked])

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section aria-label="Exercise" className="relative min-h-0 overflow-y-auto border-line px-6 py-6 lg:border-r">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Exercise</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight">{exercise.title}</h2>
        <div className="-mt-1">{renderMarkdown(exercise.prompt)}</div>

        <div className="relative">
          <TestPanel report={report} xpGained={xpGained} />
          {celebration > 0 && (
            <div key={celebration} className="absolute left-8 top-2 size-0">
              <Celebration />
            </div>
          )}
        </div>

        <HintLadder exercise={exercise} level={hintLevel} onLevel={setHintLevel} passed={passed} />
      </section>

      <div className="flex min-h-[32rem] min-w-0 flex-col lg:min-h-0">
        {code === null ? (
          <div className="flex-1" aria-busy />
        ) : (
          <Workspace
            docKey={`${exercise.id}:${editorKey}`}
            code={code}
            onCodeChange={setCode}
            runner={runner}
            onRun={run}
            onCheck={() => void check()}
            onReset={() => setConfirmReset(true)}
            stdin={stdin}
            onStdinChange={setStdin}
            goal={`${exercise.title}. ${exercise.prompt}`.slice(0, 500)}
            onHelp={(rung) => setHintLevel((level) => Math.max(level, rung))}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset to the starter code?"
        confirmLabel="Reset"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setCode(exercise.starter)
          setEditorKey((k) => k + 1)
          setReport(null)
          setConfirmReset(false)
        }}
      >
        Your current code for this exercise will be replaced. Your earlier attempts stay in the archive.
      </ConfirmDialog>
    </div>
  )
}
