import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '@/data/db'
import type { Attempt, LessonProgress, QuizResult } from '@/data/schema'

/** All lesson progress rows by lesson id. `undefined` while the first read is in flight. */
export function useProgressMap(): Map<string, LessonProgress> | undefined {
  const rows = useLiveQuery(() => db.lessonProgress.toArray(), [])
  return useMemo(() => (rows ? new Map(rows.map((r) => [r.lessonId, r])) : undefined), [rows])
}

export interface LessonData {
  progress: LessonProgress | undefined
  attempts: Attempt[]
  quiz: QuizResult | undefined
}

/** Everything stored about one lesson, kept live as the learner works. */
export function useLessonData(lessonId: string): LessonData | undefined {
  return useLiveQuery(async () => {
    const [progress, attempts, quiz] = await Promise.all([
      db.lessonProgress.get(lessonId),
      db.attempts.where('lessonId').equals(lessonId).toArray(),
      db.quizResults.get(lessonId),
    ])
    return { progress, attempts, quiz }
  }, [lessonId])
}

/** Every attempt and quiz result, for stats across lessons. */
export function useAllActivity(): { attempts: Attempt[]; quizzes: QuizResult[] } | undefined {
  return useLiveQuery(async () => ({ attempts: await db.attempts.toArray(), quizzes: await db.quizResults.toArray() }), [])
}
