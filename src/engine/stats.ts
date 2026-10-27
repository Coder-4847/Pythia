import type { Attempt, LessonProgress, QuizResult } from '@/data/schema'
import { activityByDay, computeStreak, levelFromXp, localDate, totalXp, type LevelInfo, type Streak } from '@/engine/progress'

/** What the stats need to know about the curriculum (kept free of the content module). */
export interface CatalogEntry {
  id: string
  track: string
}

export interface HeatDay {
  date: string
  xp: number
  attempts: number
  /** 0 nothing · 1 practised, no XP · 2–4 increasing XP. */
  level: 0 | 1 | 2 | 3 | 4
}

export interface TrackProgress {
  trackId: string
  completed: number
  total: number
  percent: number
}

export interface Stats {
  totalXp: number
  level: LevelInfo
  streak: Streak
  activeDates: string[]
  todayXp: number
  /** 0–100, capped. */
  goalPercent: number
  /** Days (ever) on which the daily XP goal was reached. */
  goalDays: number
  /** Weeks of days, Monday first; `null` for days after today. */
  heatmap: (HeatDay | null)[][]
  xpByDay: { date: string; xp: number }[]
  attemptsTotal: number
  attemptsPassed: number
  exercisesPassed: number
  /** Exercises whose very first attempt passed. */
  firstTryPasses: number
  /** Exercises first passed with no hints at all. */
  hintFreeSolves: number
  /** First passes by hint rung used: index 0 (none) … 4 (full explanation). */
  helpUsed: number[]
  lessonsCompleted: number
  lessonsStarted: number
  trackProgress: TrackProgress[]
  /** Practised between midnight and 5 am at least once. */
  nightOwl: boolean
  /** Came back after a gap of a week or more. */
  returned: boolean
  /** Most attempts it took to pass a single exercise. */
  mostAttemptsToPass: number
  /** A lesson completed with a perfect checkpoint and no hints. */
  flawlessLessons: number
}

export const HEATMAP_WEEKS = 18

const parseDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, day)
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

function heatLevel(xp: number, attempts: number): HeatDay['level'] {
  if (attempts === 0) return 0
  if (xp === 0) return 1
  return xp <= 20 ? 2 : xp <= 60 ? 3 : 4
}

export interface StatsInput {
  attempts: Attempt[]
  quizzes: QuizResult[]
  progress: LessonProgress[]
  catalog: CatalogEntry[]
  trackIds: string[]
  dailyGoalXp: number
  /** Local date, YYYY-MM-DD. */
  today: string
}

/** Everything the dashboard, stats page and achievements need, from stored facts only. */
export function buildStats(input: StatsInput): Stats {
  const { attempts, quizzes, progress, catalog, trackIds, dailyGoalXp, today } = input
  const days = activityByDay(attempts, quizzes)
  const activeDates = [...days.keys()].sort()
  const completed = progress.filter((p) => p.status === 'completed')

  const byExercise = new Map<string, Attempt[]>()
  for (const a of attempts) byExercise.set(`${a.lessonId}/${a.exerciseId}`, [...(byExercise.get(`${a.lessonId}/${a.exerciseId}`) ?? []), a])

  let firstTryPasses = 0
  let hintFreeSolves = 0
  let mostAttemptsToPass = 0
  const helpUsed = [0, 0, 0, 0, 0]
  const hintFreeByLesson = new Map<string, boolean>()
  for (const [key, list] of byExercise) {
    const sorted = [...list].sort((a, b) => a.at - b.at)
    const passIndex = sorted.findIndex((a) => a.passed)
    if (passIndex === -1) continue
    const pass = sorted[passIndex]!
    if (passIndex === 0) firstTryPasses++
    if (pass.hintsUsed === 0) hintFreeSolves++
    helpUsed[pass.hintsUsed] = (helpUsed[pass.hintsUsed] ?? 0) + 1
    mostAttemptsToPass = Math.max(mostAttemptsToPass, passIndex + 1)
    const lessonId = key.split('/')[0]!
    hintFreeByLesson.set(lessonId, (hintFreeByLesson.get(lessonId) ?? true) && pass.hintsUsed === 0)
  }

  const flawlessLessons = completed.filter((p) => hintFreeByLesson.get(p.lessonId) === true && quizzes.some((q) => q.lessonId === p.lessonId && q.correct === q.total)).length

  // Heatmap: columns are weeks (Monday first), ending with the current week.
  const todayDate = parseDate(today)
  const thisMonday = addDays(todayDate, -((todayDate.getDay() + 6) % 7))
  const start = addDays(thisMonday, -7 * (HEATMAP_WEEKS - 1))
  const heatmap: (HeatDay | null)[][] = Array.from({ length: HEATMAP_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = localDate(addDays(start, w * 7 + d))
      if (date > today) return null
      const a = days.get(date) ?? { xp: 0, attempts: 0 }
      return { date, xp: a.xp, attempts: a.attempts, level: heatLevel(a.xp, a.attempts) }
    }),
  )
  const xpByDay = Array.from({ length: 30 }, (_, i) => {
    const date = localDate(addDays(todayDate, i - 29))
    return { date, xp: days.get(date)?.xp ?? 0 }
  })

  const gaps = activeDates.some((d, i) => i > 0 && (parseDate(d).getTime() - parseDate(activeDates[i - 1]!).getTime()) / 86_400_000 >= 8)
  const xp = totalXp(attempts, quizzes, completed.length)
  const todayXp = days.get(today)?.xp ?? 0

  return {
    totalXp: xp,
    level: levelFromXp(xp),
    streak: computeStreak(activeDates, today),
    activeDates,
    todayXp,
    goalPercent: Math.min(100, Math.round((todayXp / dailyGoalXp) * 100)),
    goalDays: [...days.values()].filter((d) => d.xp >= dailyGoalXp).length,
    heatmap,
    xpByDay,
    attemptsTotal: attempts.length,
    attemptsPassed: attempts.filter((a) => a.passed).length,
    exercisesPassed: [...byExercise.values()].filter((l) => l.some((a) => a.passed)).length,
    firstTryPasses,
    hintFreeSolves,
    helpUsed,
    lessonsCompleted: completed.length,
    lessonsStarted: progress.filter((p) => p.status !== 'not_started').length,
    trackProgress: trackIds.map((trackId) => {
      const ids = catalog.filter((c) => c.track === trackId).map((c) => c.id)
      const done = ids.filter((id) => completed.some((p) => p.lessonId === id)).length
      return { trackId, completed: done, total: ids.length, percent: ids.length ? Math.round((done / ids.length) * 100) : 0 }
    }),
    nightOwl: attempts.some((a) => new Date(a.at).getHours() < 5),
    returned: gaps,
    mostAttemptsToPass,
    flawlessLessons,
  }
}

export interface TrackAttempts {
  trackId: string
  attempts: number
  passed: number
  /** 0–100, or null when there are no attempts yet. */
  passRate: number | null
}

/** Attempts and pass rate per track, in the order of `trackIds`. Attempts at unknown lessons are ignored. */
export function attemptsByTrack(attempts: Attempt[], catalog: CatalogEntry[], trackIds: string[]): TrackAttempts[] {
  const trackOf = new Map(catalog.map((c) => [c.id, c.track]))
  const rows = new Map(trackIds.map((t) => [t, { attempts: 0, passed: 0 }]))
  for (const a of attempts) {
    const row = rows.get(trackOf.get(a.lessonId) ?? '')
    if (!row) continue
    row.attempts++
    if (a.passed) row.passed++
  }
  return trackIds.map((trackId) => {
    const r = rows.get(trackId)!
    return { trackId, ...r, passRate: r.attempts ? Math.round((r.passed / r.attempts) * 100) : null }
  })
}
