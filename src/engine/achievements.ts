import type { Stats } from '@/engine/stats'

export type AchievementIcon = 'spark' | 'check' | 'book' | 'flame' | 'star' | 'moon' | 'target' | 'crown' | 'bolt' | 'compass'

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: AchievementIcon
  /** Current value and the target it must reach. Progress shown on locked achievements. */
  measure: (s: Stats) => { value: number; target: number }
}

const atLeast = (pick: (s: Stats) => number, target: number) => (s: Stats) => ({ value: Math.min(pick(s), target), target })
const trackDone = (trackId: string) => (s: Stats) => {
  const t = s.trackProgress.find((p) => p.trackId === trackId)
  return { value: t?.completed ?? 0, target: Math.max(1, t?.total ?? 1) }
}

/**
 * Achievements are earned for habits and understanding, never for speed or for avoiding help.
 * Each is a pure function of the stats, so they can be re-derived (and backfilled after an import).
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-attempt', title: 'First steps', description: 'Check your first exercise.', icon: 'spark', measure: atLeast((s) => s.attemptsTotal, 1) },
  { id: 'first-pass', title: 'It works!', description: 'Pass your first exercise.', icon: 'check', measure: atLeast((s) => s.exercisesPassed, 1) },
  { id: 'first-lesson', title: 'Lesson learned', description: 'Complete a whole lesson.', icon: 'book', measure: atLeast((s) => s.lessonsCompleted, 1) },
  { id: 'five-lessons', title: 'Getting somewhere', description: 'Complete 5 lessons.', icon: 'book', measure: atLeast((s) => s.lessonsCompleted, 5) },
  { id: 'ten-lessons', title: 'On a roll', description: 'Complete 10 lessons.', icon: 'compass', measure: atLeast((s) => s.lessonsCompleted, 10) },
  { id: 'foundations', title: 'Solid foundations', description: 'Finish every lesson in Foundations.', icon: 'crown', measure: trackDone('foundations') },
  { id: 'data-structures', title: 'Well organised', description: 'Finish every lesson in Data structures.', icon: 'crown', measure: trackDone('data-structures') },
  { id: 'streak-3', title: 'Three in a row', description: 'Practise three days in a row.', icon: 'flame', measure: atLeast((s) => s.streak.longest, 3) },
  { id: 'streak-7', title: 'A week of Python', description: 'Practise seven days in a row.', icon: 'flame', measure: atLeast((s) => s.streak.longest, 7) },
  { id: 'streak-30', title: 'A habit formed', description: 'Practise thirty days in a row.', icon: 'flame', measure: atLeast((s) => s.streak.longest, 30) },
  { id: 'goal-getter', title: 'Goal getter', description: 'Reach your daily goal on 5 different days.', icon: 'target', measure: atLeast((s) => s.goalDays, 5) },
  { id: 'first-try', title: 'Straight shot', description: 'Pass 10 exercises on the very first check.', icon: 'bolt', measure: atLeast((s) => s.firstTryPasses, 10) },
  { id: 'self-reliant', title: 'Thinking it through', description: 'Solve 10 exercises without any hints.', icon: 'star', measure: atLeast((s) => s.hintFreeSolves, 10) },
  { id: 'stubborn', title: 'Stubborn in a good way', description: 'Pass an exercise after 5 or more attempts. Persistence beats talent.', icon: 'bolt', measure: atLeast((s) => s.mostAttemptsToPass, 5) },
  { id: 'flawless', title: 'Flawless', description: 'Complete a lesson with a perfect checkpoint and no hints.', icon: 'star', measure: atLeast((s) => s.flawlessLessons, 1) },
  { id: 'level-5', title: 'Level 5', description: 'Reach level 5.', icon: 'crown', measure: atLeast((s) => s.level.level, 5) },
  { id: 'level-10', title: 'Level 10', description: 'Reach level 10.', icon: 'crown', measure: atLeast((s) => s.level.level, 10) },
  { id: 'night-owl', title: 'Night owl', description: 'Practise between midnight and 5 am. (Sleep matters too.)', icon: 'moon', measure: atLeast((s) => (s.nightOwl ? 1 : 0), 1) },
  { id: 'comeback', title: 'Welcome back', description: 'Return after a week away. Everyone takes breaks.', icon: 'compass', measure: atLeast((s) => (s.returned ? 1 : 0), 1) },
]

export interface AchievementState {
  def: AchievementDef
  value: number
  target: number
  unlocked: boolean
}

export function evaluateAchievements(stats: Stats): AchievementState[] {
  return ACHIEVEMENTS.map((def) => {
    const { value, target } = def.measure(stats)
    return { def, value, target, unlocked: value >= target }
  })
}
