import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/ui/PageShell'
import { ProgressBar } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { updateProfile } from '@/data/repo'
import { useProfile } from '@/data/hooks'
import { useStats } from '@/data/useStats'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export const GOAL_CHOICES = [20, 40, 60, 100] as const

function Tile({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{label}</p>
      <p className="mt-2 font-serif text-4xl tracking-tight">{value}</p>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
    </div>
  )
}

/** Name and daily goal can be edited here and in Settings; both write the same profile record. */
export function ProfileFields() {
  const profile = useProfile()
  const [name, setName] = useState<string | null>(null)
  if (!profile) return <Skeleton className="h-24 w-full" />
  const shown = name ?? profile.displayName
  const commit = () => {
    const next = shown.trim().slice(0, 40) || 'Learner'
    setName(null)
    if (next !== profile.displayName) void updateProfile({ displayName: next })
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <label htmlFor="display-name" className="text-sm font-medium">
          Display name
        </label>
        <input
          id="display-name"
          value={shown}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="mt-2 h-10 w-full rounded-lg border border-line-strong bg-raised/60 px-3 text-sm outline-none focus:border-gold"
        />
        <p className="mt-1.5 text-xs text-dim">Only shown on this device.</p>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Daily goal</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOAL_CHOICES.map((g) => (
            <label
              key={g}
              className="cursor-pointer rounded-full border border-line-strong px-4 py-2 text-sm has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-gold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold"
            >
              <input type="radio" name="daily-goal" className="sr-only" checked={profile.dailyGoalXp === g} onChange={() => void updateProfile({ dailyGoalXp: g })} />
              {g} XP
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-dim">A passed exercise is worth up to 20 XP, so 40 is about two a day.</p>
      </fieldset>
    </div>
  )
}

export default function ProfilePage() {
  useDocumentTitle('Profile')
  const data = useStats()
  if (!data)
    return (
      <PageShell eyebrow="Profile" title="Profile">
        <Skeleton className="h-40 w-full" />
      </PageShell>
    )
  const { stats, displayName } = data
  return (
    <PageShell eyebrow="Profile" title={displayName} subtitle="Your progress lives in this browser. Nothing here is shared with anyone.">
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-serif text-3xl">Level {stats.level.level}</p>
          <p className="font-mono text-sm text-muted">
            {stats.level.into} / {stats.level.span} XP to the next
          </p>
        </div>
        <ProgressBar value={stats.level.percent} label={`Level ${stats.level.level} progress`} className="mt-4" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Total XP" value={stats.totalXp} />
        <Tile label="Current streak" value={stats.streak.current} note={`Longest: ${stats.streak.longest} ${stats.streak.longest === 1 ? 'day' : 'days'}`} />
        <Tile label="Lessons done" value={stats.lessonsCompleted} note={`${stats.lessonsStarted} started`} />
        <Tile label="Exercises passed" value={stats.exercisesPassed} note={`${stats.firstTryPasses} on the first try`} />
      </div>

      <section className="mt-10" aria-labelledby="prefs">
        <h2 id="prefs" className="font-serif text-2xl">
          About you
        </h2>
        <div className="mt-5 rounded-2xl border border-line bg-surface p-6">
          <ProfileFields />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-surface p-6" aria-labelledby="guest">
        <h2 id="guest" className="font-serif text-2xl">
          You’re learning as a guest
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          There’s no account: everything is saved on this device. To move to another browser or keep a backup, use{' '}
          <Link to="/settings" className="text-gold underline-offset-4 hover:underline">
            export in Settings
          </Link>
          . Optional cloud accounts are on the roadmap.
        </p>
      </section>
    </PageShell>
  )
}
