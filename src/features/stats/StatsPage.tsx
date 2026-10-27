import { useLiveQuery } from 'dexie-react-hooks'
import { PageShell } from '@/components/ui/PageShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { LESSONS } from '@/content'
import { TRACKS } from '@/content/tracks'
import { db } from '@/data/db'
import { useStats } from '@/data/useStats'
import { attemptsByTrack } from '@/engine/stats'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const CATALOG = LESSONS.map((l) => ({ id: l.id, track: l.track }))
const TRACK_IDS = TRACKS.map((t) => t.id)
const HELP_LABELS = ['No hints', 'A nudge', 'A question', 'A concrete hint', 'The explanation']

const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-')
  return `${Number(d)}/${Number(m)}`
}

function Panel({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-line bg-surface p-6">
      <h2 id={id} className="font-serif text-2xl">
        {title}
      </h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** Thirty days of XP as an SVG bar chart. The chart is drawn for sighted users; the table is for everyone else. */
function XpChart({ days }: { days: { date: string; xp: number }[] }) {
  const max = Math.max(20, ...days.map((d) => d.xp))
  const W = 600
  const H = 120
  const bar = W / days.length
  const total = days.reduce((s, d) => s + d.xp, 0)
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label={`XP earned per day over the last 30 days: ${total} in total`}>
        <line x1="0" x2={W} y1={H} y2={H} stroke="var(--c-line-strong)" />
        {[0.5, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - f * (H - 14)} y2={H - f * (H - 14)} stroke="var(--c-line)" strokeDasharray="3 4" />
        ))}
        <text x="0" y="10" fontSize="8" fill="var(--c-dim)" fontFamily="var(--font-mono)">
          {max} XP
        </text>
        {days.map((d, i) => {
          const h = d.xp ? Math.max(3, (d.xp / max) * (H - 14)) : 0
          return (
            <g key={d.date}>
              <title>{`${d.date}: ${d.xp} XP`}</title>
              {d.xp > 0 && <rect x={i * bar + 3} y={H - h} width={bar - 6} height={h} rx="2" fill="var(--c-gold)" />}
              {(i === 0 || i === 14 || i === days.length - 1) && (
                <text x={i * bar + bar / 2} y={H + 16} fontSize="8" textAnchor={i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle'} fill="var(--c-dim)" fontFamily="var(--font-mono)">
                  {shortDate(d.date)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <table className="sr-only">
        <caption>XP per day, last 30 days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>XP</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default function StatsPage() {
  useDocumentTitle('Statistics')
  const data = useStats()
  const attempts = useLiveQuery(() => db.attempts.toArray(), [])
  if (!data || !attempts)
    return (
      <PageShell eyebrow="Statistics" title="Statistics">
        <Skeleton className="h-64 w-full" />
      </PageShell>
    )
  const { stats } = data
  const byTrack = attemptsByTrack(attempts, CATALOG, TRACK_IDS)
  const helpTotal = stats.helpUsed.reduce((a, b) => a + b, 0)
  const passRate = stats.attemptsTotal ? Math.round((stats.attemptsPassed / stats.attemptsTotal) * 100) : null

  return (
    <PageShell
      eyebrow="Statistics"
      title="How you’re doing"
      subtitle={
        stats.attemptsTotal
          ? `${stats.attemptsTotal} checks so far, ${passRate}% of them passing. Struggling is normal; it’s where the learning happens.`
          : 'Run a few exercises and your numbers will appear here.'
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Panel id="xp-chart" title="XP, last 30 days" note={`${stats.activeDates.length} active ${stats.activeDates.length === 1 ? 'day' : 'days'} in total.`}>
            <XpChart days={stats.xpByDay} />
          </Panel>
        </div>

        <Panel id="help" title="How much help you needed" note="For each exercise you’ve passed, the most help you used before the first pass.">
          {helpTotal === 0 ? (
            <p className="text-sm text-muted">Nothing passed yet.</p>
          ) : (
            <ul className="space-y-3">
              {HELP_LABELS.map((label, i) => {
                const n = stats.helpUsed[i] ?? 0
                return (
                  <li key={label}>
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-mono text-muted">
                        {n} <span className="text-dim">({Math.round((n / helpTotal) * 100)}%)</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised" aria-hidden>
                      <div className="h-full rounded-full bg-gold" style={{ width: `${(n / helpTotal) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel id="tracks" title="By track" note="Checks run and how many passed.">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Attempts and pass rate per track</caption>
              <thead className="font-mono text-[11px] uppercase tracking-wider text-dim">
                <tr>
                  <th className="py-2 pr-3 font-medium">Track</th>
                  <th className="px-3 py-2 font-medium">Lessons</th>
                  <th className="px-3 py-2 font-medium">Checks</th>
                  <th className="py-2 pl-3 font-medium">Pass rate</th>
                </tr>
              </thead>
              <tbody>
                {byTrack.map((row) => {
                  const track = TRACKS.find((t) => t.id === row.trackId)!
                  const progress = stats.trackProgress.find((t) => t.trackId === row.trackId)
                  return (
                    <tr key={row.trackId} className="border-t border-line">
                      <td className="py-2.5 pr-3">{track.title}</td>
                      <td className="px-3 py-2.5 font-mono text-muted">{progress && progress.total ? `${progress.completed}/${progress.total}` : '–'}</td>
                      <td className="px-3 py-2.5 font-mono">{row.attempts}</td>
                      <td className="py-2.5 pl-3 font-mono">{row.passRate === null ? <span className="text-dim">–</span> : `${row.passRate}%`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel id="habits" title="Habits">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted">Longest streak</dt>
              <dd className="mt-1 font-serif text-3xl">{stats.streak.longest}</dd>
            </div>
            <div>
              <dt className="text-muted">Days you hit your goal</dt>
              <dd className="mt-1 font-serif text-3xl">{stats.goalDays}</dd>
            </div>
            <div>
              <dt className="text-muted">Solved with no hints</dt>
              <dd className="mt-1 font-serif text-3xl">{stats.hintFreeSolves}</dd>
            </div>
            <div>
              <dt className="text-muted">Most tries on one exercise</dt>
              <dd className="mt-1 font-serif text-3xl">{stats.mostAttemptsToPass || '–'}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </PageShell>
  )
}
