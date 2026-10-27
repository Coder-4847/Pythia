import type { Attempt, LessonProgress, QuizResult } from '@/data/schema'

/**
 * The progress engine: pure functions that turn stored facts (attempts, quiz results) into
 * XP, levels, streaks and lesson status. Nothing here touches the database or the clock, so it
 * is easy to test and the same facts always produce the same numbers on every device.
 */

/** The parts of a lesson the engine needs; keeps it independent of the content module. */
export interface LessonShape {
  id: string
  exerciseIds: string[]
  quizLength: number
}

// ───────────── XP ─────────────
export const EXERCISE_XP = 20
/** XP lost per hint rung used (rungs 1–3). Gentle by design. */
export const HINT_COST = 2
/** Reading the full explanation costs a little more, but never below this floor. */
export const EXPLANATION_FLOOR_XP = 10
export const QUIZ_XP_PER_CORRECT = 5
export const LESSON_BONUS_XP = 10

/** XP for passing an exercise for the first time, given the highest hint rung used (0–4). */
export function exerciseXp(hintsUsed: number): number {
  if (hintsUsed >= 4) return EXPLANATION_FLOOR_XP
  return EXERCISE_XP - HINT_COST * Math.max(0, hintsUsed)
}

/** XP an attempt earns: only the first pass of an exercise counts, so retrying never farms XP. */
export function xpForAttempt(previous: Attempt[], passed: boolean, hintsUsed: number): number {
  if (!passed || previous.some((a) => a.passed)) return 0
  return exerciseXp(hintsUsed)
}

export const quizXp = (correct: number) => correct * QUIZ_XP_PER_CORRECT

// ───────────── levels ─────────────
/** Total XP needed to reach `level` (level 1 = 0 XP, 2 = 100, 3 = 300, 4 = 600, …). */
export const xpForLevel = (level: number) => 50 * level * (level - 1)

export interface LevelInfo {
  level: number
  /** XP earned within the current level. */
  into: number
  /** XP the current level spans. */
  span: number
  /** 0–100 progress toward the next level. */
  percent: number
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  const start = xpForLevel(level)
  const span = xpForLevel(level + 1) - start
  return { level, into: xp - start, span, percent: Math.round(((xp - start) / span) * 100) }
}

// ───────────── per-exercise and per-lesson summaries ─────────────
export interface ExerciseSummary {
  exerciseId: string
  attemptCount: number
  passed: boolean
  /** Hint rung in force when the exercise was first passed (0 if never passed). */
  hintsAtPass: number
  xp: number
  firstAttempt: Attempt | null
  latestAttempt: Attempt | null
}

export function summarizeExercise(exerciseId: string, all: Attempt[]): ExerciseSummary {
  const attempts = all.filter((a) => a.exerciseId === exerciseId).sort((a, b) => a.at - b.at)
  const firstPass = attempts.find((a) => a.passed)
  return {
    exerciseId,
    attemptCount: attempts.length,
    passed: Boolean(firstPass),
    hintsAtPass: firstPass?.hintsUsed ?? 0,
    xp: attempts.reduce((sum, a) => sum + a.xpAwarded, 0),
    firstAttempt: attempts[0] ?? null,
    latestAttempt: attempts[attempts.length - 1] ?? null,
  }
}

export interface LessonSummary {
  passedExercises: number
  totalExercises: number
  quizDone: boolean
  /** 0–100: every exercise and the checkpoint are equal units. */
  percent: number
  status: LessonProgress['status']
  /** First step index that is not finished (0 = concept, 1 = example, 2.. exercises, last = quiz). */
  nextStep: number
}

/** Lesson step layout: [concept, example, ...exercises, checkpoint]. */
export const stepCount = (lesson: LessonShape) => 2 + lesson.exerciseIds.length + 1

export function summarizeLesson(lesson: LessonShape, attempts: Attempt[], quiz: QuizResult | undefined, started: boolean): LessonSummary {
  const mine = attempts.filter((a) => a.lessonId === lesson.id)
  const passed = lesson.exerciseIds.filter((id) => mine.some((a) => a.exerciseId === id && a.passed))
  const quizDone = Boolean(quiz && quiz.total === lesson.quizLength)
  const units = lesson.exerciseIds.length + 1
  const done = passed.length + (quizDone ? 1 : 0)
  const complete = done === units
  const firstOpen = lesson.exerciseIds.findIndex((id) => !passed.includes(id))
  return {
    passedExercises: passed.length,
    totalExercises: lesson.exerciseIds.length,
    quizDone,
    percent: Math.round((done / units) * 100),
    status: complete ? 'completed' : started || done > 0 || mine.length > 0 ? 'in_progress' : 'not_started',
    nextStep: complete ? 0 : firstOpen >= 0 ? 2 + firstOpen : stepCount(lesson) - 1,
  }
}

// ───────────── XP totals and activity ─────────────
/** XP that comes from finishing a lesson, awarded once per completed lesson. */
export const lessonBonus = (completed: boolean) => (completed ? LESSON_BONUS_XP : 0)

export function totalXp(attempts: Attempt[], quizzes: QuizResult[], completedLessons: number): number {
  return attempts.reduce((s, a) => s + a.xpAwarded, 0) + quizzes.reduce((s, q) => s + q.xpAwarded, 0) + completedLessons * LESSON_BONUS_XP
}

/** Local calendar date as YYYY-MM-DD (the learner's day, not UTC's). */
export function localDate(ts: number | Date): string {
  const d = typeof ts === 'number' ? new Date(ts) : ts
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export interface DayActivity {
  xp: number
  attempts: number
}

/** Activity per local day. Quiz XP counts on the day the checkpoint was completed. */
export function activityByDay(attempts: Attempt[], quizzes: QuizResult[]): Map<string, DayActivity> {
  const days = new Map<string, DayActivity>()
  const bump = (ts: number, xp: number, count: number) => {
    const key = localDate(ts)
    const cur = days.get(key) ?? { xp: 0, attempts: 0 }
    days.set(key, { xp: cur.xp + xp, attempts: cur.attempts + count })
  }
  for (const a of attempts) bump(a.at, a.xpAwarded, 1)
  for (const q of quizzes) bump(q.completedAt, q.xpAwarded, 1)
  return days
}

const dayBefore = (date: string) => {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  return localDate(new Date(y, m - 1, d - 1))
}

export interface Streak {
  current: number
  longest: number
}

/**
 * Consecutive active days. A streak is still alive today if the learner was active yesterday,
 * so it only breaks once a whole day passes with nothing.
 */
export function computeStreak(activeDates: Iterable<string>, today: string): Streak {
  const set = new Set(activeDates)
  let current = 0
  let cursor = set.has(today) ? today : dayBefore(today)
  while (set.has(cursor)) {
    current++
    cursor = dayBefore(cursor)
  }
  let longest = 0
  for (const date of set) {
    if (set.has(dayBefore(date))) continue // only start counting at a run's first day
    let run = 0
    let c = date
    // Walk forward by testing successive days.
    const [y, m, d] = date.split('-').map(Number) as [number, number, number]
    for (let n = 0; set.has(c); n++) {
      run++
      c = localDate(new Date(y, m - 1, d + n + 1))
    }
    longest = Math.max(longest, run)
  }
  return { current, longest }
}

// ───────────── curriculum state ─────────────
export type LessonState = 'completed' | 'in_progress' | 'available' | 'locked'

/**
 * `locked` is a recommendation, not a wall: it means "the lesson before this one isn't done yet".
 * The UI still lets learners open it.
 */
export function lessonState(status: LessonProgress['status'], previousCompleted: boolean): LessonState {
  if (status === 'completed') return 'completed'
  if (status === 'in_progress') return 'in_progress'
  return previousCompleted ? 'available' : 'locked'
}

/** The lesson to suggest next: one in progress, else the first not-yet-completed in order. */
export function recommendNext<T extends { id: string }>(ordered: T[], status: (id: string) => LessonProgress['status']): T | null {
  return ordered.find((l) => status(l.id) === 'in_progress') ?? ordered.find((l) => status(l.id) !== 'completed') ?? null
}
