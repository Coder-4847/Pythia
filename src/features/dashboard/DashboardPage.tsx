import { Link } from 'react-router-dom'
import { Heatmap, type HeatCell } from '@/components/ui/Heatmap'
import { buttonClass } from '@/components/ui/Button'
import { Counter } from '@/components/ui/Counter'
import { PageShell } from '@/components/ui/PageShell'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Reveal } from '@/components/ui/Reveal'
import { Skeleton } from '@/components/ui/Skeleton'
import { LESSONS } from '@/content'
import { TRACKS } from '@/content/tracks'
import { useProgressMap } from '@/data/hooks'
import { useStats } from '@/data/useStats'
import { ContinueCard } from '@/features/curriculum/ContinueCard'
import type { Stats } from '@/engine/stats'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

function Tile({ label, children, note }: { label: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{label}</p>
      <div className="mt-3">{children}</div>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  )
}

const toCell = (d: NonNullable<Stats['heatmap'][number][number]>): HeatCell => ({
  level: d.level,
  label: d.attempts ? `${d.date}: ${d.xp} XP, ${d.attempts} ${d.attempts === 1 ? 'check' : 'checks'}` : `${d.date}: no activity`,
})

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const data = useStats()
  const progress = useProgressMap()

  if (!data || !progress)
    return (
      <PageShell eyebrow="Dashboard" title="Welcome back">
        <div className="space-y-4" role="status" aria-label="Loading your dashboard">
          <Skeleton className="h-36 w-full rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </PageShell>
    )

  const { stats, dailyGoalXp, displayName } = data
  const isNew = stats.attemptsTotal === 0
  const recommended = LESSONS.filter((l) => progress.get(l.id)?.status !== 'completed').slice(0, 4)
  const goalMet = stats.todayXp >= dailyGoalXp
  const heat = stats.heatmap.map((week) => week.map((d) => (d ? toCell(d) : null)))
  const activeDays = stats.heatmap.flat().filter((d) => d && d.attempts > 0).length

  return (
    <PageShell
      eyebrow="Dashboard"
      title={displayName !== 'Learner' ? `Welcome back, ${displayName}` : 'Welcome back'}
      subtitle={isNew ? 'Your first lesson takes about eight minutes. Everything you do shows up here.' : undefined}
    >
      <Reveal>
        <ContinueCard progress={progress} />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Streak" note={stats.streak.longest > 0 ? `Longest: ${stats.streak.longest} ${stats.streak.longest === 1 ? 'day' : 'days'}` : 'Practise today to start one'}>
            <p className="font-serif text-5xl tabular-nums">
              <Counter value={stats.streak.current} />
              <span className="ml-2 text-lg text-muted">{stats.streak.current === 1 ? 'day' : 'days'}</span>
            </p>
          </Tile>
          <Tile label="Today’s goal" note={goalMet ? 'Goal reached. Anything more is a bonus.' : `${Math.max(0, dailyGoalXp - stats.todayXp)} XP to go`}>
            <div className="flex items-center gap-4">
              <ProgressRing value={stats.goalPercent} size={64} stroke={6} label="Daily goal progress" showValue={false} />
              <p className="font-serif text-4xl tabular-nums">
                {stats.todayXp}
                <span className="text-lg text-muted"> / {dailyGoalXp} XP</span>
              </p>
            </div>
          </Tile>
          <Tile label={`Level ${stats.level.level}`} note={`${stats.level.span - stats.level.into} XP to level ${stats.level.level + 1}`}>
            <p className="font-serif text-5xl tabular-nums">
              <Counter value={stats.totalXp} />
              <span className="ml-2 text-lg text-muted">XP</span>
            </p>
            <ProgressBar value={stats.level.percent} label="Progress to next level" className="mt-3" />
          </Tile>
          <Tile label="Lessons" note={`${stats.exercisesPassed} exercises passed`}>
            <p className="font-serif text-5xl tabular-nums">
              <Counter value={stats.lessonsCompleted} />
              <span className="ml-2 text-lg text-muted">/ {LESSONS.length}</span>
            </p>
          </Tile>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <section aria-labelledby="activity-h" className="h-full rounded-2xl border border-line bg-surface p-5">
            <h2 id="activity-h" className="text-lg font-medium">Activity</h2>
            <p className="text-sm text-muted">{activeDays} active {activeDays === 1 ? 'day' : 'days'} in the last 18 weeks</p>
            <Heatmap weeks={heat} summary={`Activity over the last 18 weeks: ${activeDays} active days`} className="mt-4" />
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section aria-labelledby="tracks-h" className="h-full rounded-2xl border border-line bg-surface p-5">
            <h2 id="tracks-h" className="text-lg font-medium">Tracks</h2>
            <ul className="mt-4 space-y-4">
              {TRACKS.map((track) => {
                const p = stats.trackProgress.find((t) => t.trackId === track.id)
                return (
                  <li key={track.id}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className={p && p.total ? '' : 'text-dim'}>{track.title}</span>
                      <span className="font-mono text-xs text-muted">{p && p.total ? `${p.completed}/${p.total}` : 'roadmap'}</span>
                    </div>
                    <ProgressBar value={p?.percent ?? 0} label={`${track.title} progress`} tone={p?.percent === 100 ? 'ok' : 'gold'} />
                  </li>
                )
              })}
            </ul>
          </section>
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="next-h" className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 id="next-h" className="text-lg font-medium">Recommended next</h2>
            <Link to="/learn" className="text-sm text-muted hover:text-fg">All lessons →</Link>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {recommended.map((l) => (
              <li key={l.id}>
                <Link to={`/lesson/${l.id}`} className="block rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                  <p className="font-medium">{l.title}</p>
                  <p className="mt-1 text-sm text-muted">{l.summary}</p>
                  <p className="mt-2 font-mono text-xs text-dim">{l.minutes} min · {l.exercises.length} exercises</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {isNew && (
        <p className="mt-10 text-center text-muted">
          Nothing here yet.{' '}
          <Link to="/learn" className={buttonClass('primary', 'sm', 'ml-2')}>Start your first lesson</Link>
        </p>
      )}
    </PageShell>
  )
}
