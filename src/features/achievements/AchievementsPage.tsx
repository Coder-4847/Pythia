import { useLiveQuery } from 'dexie-react-hooks'
import { PageShell } from '@/components/ui/PageShell'
import { ProgressBar } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { db } from '@/data/db'
import { useStats } from '@/data/useStats'
import { AchievementIcon } from '@/features/achievements/AchievementIcon'
import { evaluateAchievements } from '@/engine/achievements'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function AchievementsPage() {
  useDocumentTitle('Achievements')
  const data = useStats()
  const stored = useLiveQuery(() => db.achievements.toArray(), [])

  const states = data ? evaluateAchievements(data.stats) : null
  const unlockedAt = new Map((stored ?? []).map((a) => [a.id, a.unlockedAt]))
  const count = states?.filter((s) => s.unlocked).length ?? 0

  return (
    <PageShell
      eyebrow="Achievements"
      title="Little milestones"
      subtitle={states ? `${count} of ${states.length} unlocked. They reward habits and persistence, never speed.` : undefined}
    >
      {!states ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...states].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).map(({ def, value, target, unlocked }) => (
            <li
              key={def.id}
              className={cn('rounded-2xl border p-5 transition-colors', unlocked ? 'border-gold/40 bg-surface' : 'border-line bg-surface/40')}
            >
              <div className="flex items-start gap-4">
                <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl border', unlocked ? 'border-gold/50 bg-gold/10 text-gold' : 'border-line text-dim')}>
                  <AchievementIcon kind={def.icon} className="size-6" />
                </span>
                <div className="min-w-0">
                  <h2 className={cn('font-medium', !unlocked && 'text-muted')}>{def.title}</h2>
                  <p className="mt-0.5 text-sm text-muted">{def.description}</p>
                </div>
              </div>
              <div className="mt-4">
                {unlocked ? (
                  <p className="font-mono text-xs text-gold">
                    Unlocked{unlockedAt.get(def.id) ? ` ${new Date(unlockedAt.get(def.id)!).toLocaleDateString(undefined, { dateStyle: 'medium' })}` : ''}
                  </p>
                ) : (
                  <>
                    <div className="mb-1.5 flex justify-between font-mono text-xs text-dim">
                      <span>Locked</span>
                      <span>{value} / {target}</span>
                    </div>
                    <ProgressBar value={(value / target) * 100} label={`${def.title}: ${value} of ${target}`} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
