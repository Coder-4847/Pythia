import { describe, expect, it } from 'vitest'
import type { Attempt, QuizResult } from '@/data/schema'
import {
  activityByDay,
  computeStreak,
  EXERCISE_XP,
  exerciseXp,
  lessonState,
  levelFromXp,
  localDate,
  recommendNext,
  summarizeExercise,
  summarizeLesson,
  totalXp,
  xpForAttempt,
  xpForLevel,
  type LessonShape,
} from '@/engine/progress'

const lesson: LessonShape = { id: 'L', exerciseIds: ['e1', 'e2'], quizLength: 2 }
let n = 0
const attempt = (exerciseId: string, passed: boolean, o: Partial<Attempt> = {}): Attempt => ({
  id: `a${n++}`,
  lessonId: 'L',
  exerciseId,
  code: 'x',
  at: new Date(2026, 0, 5, 12).getTime() + n,
  passed,
  results: [],
  hintsUsed: 0,
  xpAwarded: 0,
  updatedAt: 1,
  ...o,
})
const quiz = (o: Partial<QuizResult> = {}): QuizResult => ({
  lessonId: 'L',
  answers: [0, 1],
  correct: 2,
  total: 2,
  xpAwarded: 10,
  completedAt: new Date(2026, 0, 5, 13).getTime(),
  updatedAt: 1,
  ...o,
})

describe('XP', () => {
  it('rewards unaided solves fully and charges a little per hint rung', () => {
    expect(exerciseXp(0)).toBe(EXERCISE_XP)
    expect(exerciseXp(1)).toBe(18)
    expect(exerciseXp(3)).toBe(14)
  })

  it('never drops below a floor, even after the full explanation', () => {
    expect(exerciseXp(4)).toBe(10)
    expect(exerciseXp(4)).toBeGreaterThan(0)
  })

  it('only the first pass earns XP, so retries cannot farm it', () => {
    expect(xpForAttempt([], false, 0)).toBe(0)
    expect(xpForAttempt([], true, 1)).toBe(18)
    expect(xpForAttempt([attempt('e1', true, { xpAwarded: 18 })], true, 0)).toBe(0)
  })

  it('totals attempts, quizzes and lesson bonuses', () => {
    expect(totalXp([attempt('e1', true, { xpAwarded: 20 })], [quiz()], 1)).toBe(20 + 10 + 10)
  })
})

describe('levels', () => {
  it('grows thresholds quadratically', () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 100, 300, 600])
  })

  it('reports level and progress within the level', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, into: 0, percent: 0 })
    expect(levelFromXp(150)).toMatchObject({ level: 2, into: 50, span: 200, percent: 25 })
    expect(levelFromXp(300).level).toBe(3)
  })
})

describe('summaries', () => {
  it('summarizes an exercise: first pass decides hints, XP sums', () => {
    const s = summarizeExercise('e1', [
      attempt('e1', false),
      attempt('e1', true, { hintsUsed: 2, xpAwarded: 16 }),
      attempt('e1', true, { hintsUsed: 0, xpAwarded: 0 }),
      attempt('e2', true),
    ])
    expect(s).toMatchObject({ attemptCount: 3, passed: true, hintsAtPass: 2, xp: 16 })
    expect(s.firstAttempt?.passed).toBe(false)
  })

  it('tracks lesson percent and sends the learner to the first open step', () => {
    const none = summarizeLesson(lesson, [], undefined, false)
    expect(none).toMatchObject({ status: 'not_started', percent: 0, nextStep: 2 })

    const half = summarizeLesson(lesson, [attempt('e1', true)], undefined, true)
    expect(half).toMatchObject({ status: 'in_progress', percent: 33, passedExercises: 1, nextStep: 3 })

    const readyForQuiz = summarizeLesson(lesson, [attempt('e1', true), attempt('e2', true)], undefined, true)
    expect(readyForQuiz).toMatchObject({ percent: 67, nextStep: 4 }) // [concept, example, e1, e2, quiz]

    const done = summarizeLesson(lesson, [attempt('e1', true), attempt('e2', true)], quiz(), true)
    expect(done).toMatchObject({ status: 'completed', percent: 100, quizDone: true })
  })

  it('ignores a quiz result whose length no longer matches the lesson', () => {
    expect(summarizeLesson(lesson, [attempt('e1', true), attempt('e2', true)], quiz({ total: 3 }), true).quizDone).toBe(false)
  })

  it('counts failed attempts as having started', () => {
    expect(summarizeLesson(lesson, [attempt('e1', false)], undefined, false).status).toBe('in_progress')
  })
})

describe('streaks', () => {
  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-01-03', '2026-01-04', '2026-01-05'], '2026-01-05')).toEqual({ current: 3, longest: 3 })
  })

  it('keeps the streak alive until the day is over', () => {
    expect(computeStreak(['2026-01-03', '2026-01-04'], '2026-01-05').current).toBe(2)
    expect(computeStreak(['2026-01-03', '2026-01-04'], '2026-01-06').current).toBe(0)
  })

  it('tracks the longest run separately and handles month/year boundaries', () => {
    const dates = ['2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-10']
    expect(computeStreak(dates, '2026-01-10')).toEqual({ current: 1, longest: 4 })
  })

  it('handles no activity', () => {
    expect(computeStreak([], '2026-01-05')).toEqual({ current: 0, longest: 0 })
  })
})

describe('activity', () => {
  it('buckets XP and attempts by local day', () => {
    const day = activityByDay([attempt('e1', true, { xpAwarded: 20 }), attempt('e1', false)], [quiz()])
    expect(day.get('2026-01-05')).toEqual({ xp: 30, attempts: 3 })
    expect(localDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('curriculum state', () => {
  it('locks only untouched lessons whose predecessor is unfinished', () => {
    expect(lessonState('not_started', false)).toBe('locked')
    expect(lessonState('not_started', true)).toBe('available')
    expect(lessonState('in_progress', false)).toBe('in_progress')
    expect(lessonState('completed', false)).toBe('completed')
  })

  it('recommends the lesson in progress, else the first unfinished one', () => {
    const lessons = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const status = (m: Record<string, 'completed' | 'in_progress' | 'not_started'>) => (id: string) => m[id] ?? 'not_started'
    expect(recommendNext(lessons, status({ a: 'completed', b: 'not_started', c: 'in_progress' }))?.id).toBe('c')
    expect(recommendNext(lessons, status({ a: 'completed' }))?.id).toBe('b')
    expect(recommendNext(lessons, status({ a: 'completed', b: 'completed', c: 'completed' }))).toBeNull()
  })
})
