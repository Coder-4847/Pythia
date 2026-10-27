import { describe, expect, it } from 'vitest'
import type { Attempt, LessonProgress, QuizResult } from '@/data/schema'
import { evaluateAchievements } from '@/engine/achievements'
import { attemptsByTrack, buildStats, HEATMAP_WEEKS, type StatsInput } from '@/engine/stats'
import { diffLines } from '@/lib/diff'

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()
let n = 0
const attempt = (lessonId: string, exerciseId: string, at: number, o: Partial<Attempt> = {}): Attempt => ({
  id: `a${n++}`,
  lessonId,
  exerciseId,
  code: 'x',
  at,
  passed: false,
  results: [],
  hintsUsed: 0,
  xpAwarded: 0,
  updatedAt: at,
  ...o,
})
const done = (lessonId: string): LessonProgress => ({ lessonId, status: 'completed', percent: 100, step: 0, startedAt: 1, completedAt: 2, updatedAt: 2 })
const quiz = (lessonId: string, correct: number, total = 3, at = day(2026, 1, 5)): QuizResult => ({ lessonId, answers: [], correct, total, xpAwarded: correct * 5, completedAt: at, updatedAt: 1 })

const base: StatsInput = {
  attempts: [],
  quizzes: [],
  progress: [],
  catalog: [
    { id: 'a', track: 't1' },
    { id: 'b', track: 't1' },
    { id: 'c', track: 't2' },
  ],
  trackIds: ['t1', 't2'],
  dailyGoalXp: 40,
  today: '2026-01-14', // a Wednesday
}

describe('buildStats', () => {
  it('is all zeros for a brand new learner', () => {
    const s = buildStats(base)
    expect(s).toMatchObject({ totalXp: 0, todayXp: 0, goalPercent: 0, attemptsTotal: 0, lessonsCompleted: 0, nightOwl: false, returned: false })
    expect(s.level.level).toBe(1)
    expect(s.streak).toEqual({ current: 0, longest: 0 })
    expect(s.trackProgress).toEqual([
      { trackId: 't1', completed: 0, total: 2, percent: 0 },
      { trackId: 't2', completed: 0, total: 1, percent: 0 },
    ])
  })

  it('computes XP, goal progress, streak and track progress from facts', () => {
    const s = buildStats({
      ...base,
      attempts: [
        attempt('a', 'e1', day(2026, 1, 13), { passed: true, xpAwarded: 20 }),
        attempt('a', 'e2', day(2026, 1, 14), { passed: true, xpAwarded: 18, hintsUsed: 1 }),
        attempt('a', 'e2', day(2026, 1, 14, 9), { passed: false }),
      ],
      quizzes: [quiz('a', 3, 3, day(2026, 1, 12))],
      progress: [done('a')],
    })
    expect(s.totalXp).toBe(20 + 18 + 15 + 10)
    expect(s.todayXp).toBe(18)
    expect(s.goalPercent).toBe(45)
    expect(s.streak.current).toBe(3) // 12th (quiz), 13th and 14th
    expect(s.trackProgress[0]).toMatchObject({ completed: 1, percent: 50 })
    expect(s.exercisesPassed).toBe(2)
    expect(s.helpUsed).toEqual([1, 1, 0, 0, 0])
    expect(s.hintFreeSolves).toBe(1)
  })

  it('counts first-try passes and the attempts it took to pass', () => {
    const s = buildStats({
      ...base,
      attempts: [
        attempt('a', 'e1', day(2026, 1, 10), { passed: true }),
        attempt('a', 'e2', day(2026, 1, 10, 13)),
        attempt('a', 'e2', day(2026, 1, 10, 14)),
        attempt('a', 'e2', day(2026, 1, 10, 15), { passed: true }),
      ],
    })
    expect(s.firstTryPasses).toBe(1)
    expect(s.mostAttemptsToPass).toBe(3)
  })

  it('lays out the heatmap in weeks starting Monday, ending today, with future days empty', () => {
    const s = buildStats({ ...base, attempts: [attempt('a', 'e1', day(2026, 1, 14), { passed: true, xpAwarded: 20 })] })
    expect(s.heatmap).toHaveLength(HEATMAP_WEEKS)
    const last = s.heatmap[HEATMAP_WEEKS - 1]!
    expect(last.map((d) => d?.date)).toEqual(['2026-01-12', '2026-01-13', '2026-01-14', undefined, undefined, undefined, undefined])
    expect(last[2]).toMatchObject({ xp: 20, level: 2 })
    expect(last[1]).toMatchObject({ level: 0 })
    expect(s.heatmap[0]![0]!.date).toBe('2025-09-15') // 17 weeks before the current week's Monday
  })

  it('gives a 30-day XP series ending today', () => {
    const s = buildStats({ ...base, attempts: [attempt('a', 'e1', day(2026, 1, 14), { xpAwarded: 20 })] })
    expect(s.xpByDay).toHaveLength(30)
    expect(s.xpByDay[29]).toEqual({ date: '2026-01-14', xp: 20 })
    expect(s.xpByDay[0]!.date).toBe('2025-12-16')
  })

  it('detects night practice, comebacks and flawless lessons', () => {
    const s = buildStats({
      ...base,
      attempts: [
        attempt('a', 'e1', day(2026, 1, 1, 2), { passed: true }),
        attempt('a', 'e2', day(2026, 1, 12, 12), { passed: true }),
      ],
      quizzes: [quiz('a', 3, 3, day(2026, 1, 1))],
      progress: [done('a')],
    })
    expect(s.nightOwl).toBe(true)
    expect(s.returned).toBe(true)
    expect(s.flawlessLessons).toBe(1)
  })

  it('does not call a lesson flawless if a hint was used', () => {
    const s = buildStats({ ...base, attempts: [attempt('a', 'e1', day(2026, 1, 1), { passed: true, hintsUsed: 2 })], quizzes: [quiz('a', 3, 3)], progress: [done('a')] })
    expect(s.flawlessLessons).toBe(0)
  })
})

describe('achievements', () => {
  const state = (input: Partial<StatsInput>) => Object.fromEntries(evaluateAchievements(buildStats({ ...base, ...input })).map((a) => [a.def.id, a]))

  it('unlocks nothing for a new learner but reports progress toward each', () => {
    const all = state({})
    expect(Object.values(all).some((a) => a.unlocked)).toBe(false)
    expect(all['five-lessons']).toMatchObject({ value: 0, target: 5 })
  })

  it('unlocks as the facts arrive', () => {
    const all = state({
      attempts: [attempt('a', 'e1', day(2026, 1, 14), { passed: true, xpAwarded: 20 })],
      progress: [done('a'), done('b')],
    })
    expect(all['first-attempt']!.unlocked).toBe(true)
    expect(all['first-pass']!.unlocked).toBe(true)
    expect(all['first-lesson']!.unlocked).toBe(true)
    expect(all['five-lessons']).toMatchObject({ unlocked: false, value: 2, target: 5 })
  })

  it('finishing every lesson of a track unlocks its achievement', () => {
    expect(evaluateAchievements(buildStats({ ...base, trackIds: ['foundations'], catalog: [{ id: 'a', track: 'foundations' }], progress: [done('a')] })).find((a) => a.def.id === 'foundations')!.unlocked).toBe(true)
  })

  it('rewards persistence, not just speed', () => {
    const attempts = [1, 2, 3, 4].map((i) => attempt('a', 'e1', day(2026, 1, 14, 8 + i))).concat(attempt('a', 'e1', day(2026, 1, 14, 20), { passed: true }))
    expect(state({ attempts })['stubborn']!.unlocked).toBe(true)
  })

  it('has unique ids', () => {
    const ids = evaluateAchievements(buildStats(base)).map((a) => a.def.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('diffLines', () => {
  it('marks added, removed and unchanged lines', () => {
    expect(diffLines('a\nb\nc', 'a\nc\nd')).toEqual([
      { kind: 'same', text: 'a' },
      { kind: 'removed', text: 'b' },
      { kind: 'same', text: 'c' },
      { kind: 'added', text: 'd' },
    ])
  })

  it('handles identical, empty and fully different input', () => {
    expect(diffLines('x', 'x')).toEqual([{ kind: 'same', text: 'x' }])
    expect(diffLines('', '').every((l) => l.kind === 'same')).toBe(true)
    expect(diffLines('a', 'b').map((l) => l.kind)).toEqual(['removed', 'added'])
  })
})

describe('attemptsByTrack', () => {
  it('groups attempts by track and computes a pass rate', () => {
    const attempts = [attempt('a', 'e1', 1), attempt('a', 'e1', 2, { passed: true }), attempt('c', 'e1', 3, { passed: true }), attempt('zzz', 'e1', 4)]
    expect(attemptsByTrack(attempts, base.catalog, base.trackIds)).toEqual([
      { trackId: 't1', attempts: 2, passed: 1, passRate: 50 },
      { trackId: 't2', attempts: 1, passed: 1, passRate: 100 },
    ])
  })

  it('reports no pass rate before any attempt', () => {
    expect(attemptsByTrack([], base.catalog, base.trackIds)[0]!.passRate).toBeNull()
  })
})
