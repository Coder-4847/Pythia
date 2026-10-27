import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { LESSONS } from '@/content'
import { TRACKS } from '@/content/tracks'
import { db } from '@/data/db'
import { DEFAULT_PROFILE } from '@/data/schema'
import { localDate } from '@/engine/progress'
import { buildStats, type Stats } from '@/engine/stats'

const CATALOG = LESSONS.map((l) => ({ id: l.id, track: l.track }))
const TRACK_IDS = TRACKS.map((t) => t.id)

/** Live stats for the whole account. `undefined` until the first read finishes. */
export function useStats(): { stats: Stats; dailyGoalXp: number; displayName: string } | undefined {
  const raw = useLiveQuery(async () => {
    const [attempts, quizzes, progress, profile] = await Promise.all([db.attempts.toArray(), db.quizResults.toArray(), db.lessonProgress.toArray(), db.profile.get('me')])
    return { today: localDate(Date.now()), attempts, quizzes, progress, dailyGoalXp: profile?.dailyGoalXp ?? DEFAULT_PROFILE.dailyGoalXp, displayName: profile?.displayName ?? DEFAULT_PROFILE.displayName }
  }, [])
  return useMemo(
    () =>
      raw && {
        stats: buildStats({ ...raw, catalog: CATALOG, trackIds: TRACK_IDS }),
        dailyGoalXp: raw.dailyGoalXp,
        displayName: raw.displayName,
      },
    [raw],
  )
}
