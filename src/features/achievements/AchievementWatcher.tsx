import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef } from 'react'
import { db } from '@/data/db'
import { useStats } from '@/data/useStats'
import { evaluateAchievements } from '@/engine/achievements'
import { useToast } from '@/stores/toast'

/**
 * Invisible: whenever the learner's activity changes, record newly earned achievements and
 * say so (one toast, however many unlocked at once, so an import can't spam the screen).
 */
export default function AchievementWatcher() {
  const data = useStats()
  const stored = useLiveQuery(() => db.achievements.toArray(), [])
  const show = useToast((s) => s.show)
  const writing = useRef(new Set<string>())

  useEffect(() => {
    if (!data || !stored) return
    const have = new Set(stored.map((a) => a.id))
    for (const id of have) writing.current.delete(id) // saved: stop guarding it (so a reset can re-earn it later)
    const fresh = evaluateAchievements(data.stats).filter((a) => a.unlocked && !have.has(a.def.id) && !writing.current.has(a.def.id))
    if (!fresh.length) return
    const now = Date.now()
    for (const a of fresh) writing.current.add(a.def.id)
    void db.achievements.bulkPut(fresh.map((a) => ({ id: a.def.id, unlockedAt: now, updatedAt: now })))
    show(fresh.length === 1 ? `Achievement unlocked: ${fresh[0]!.def.title}` : `${fresh.length} achievements unlocked`)
  }, [data, stored, show])

  return null
}
