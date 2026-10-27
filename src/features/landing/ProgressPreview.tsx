import { Heatmap, type HeatCell } from '@/components/ui/Heatmap'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Counter } from '@/components/ui/Counter'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/features/landing/SectionHeading'

/** Deterministic pseudo-activity so the preview is stable between renders and screenshots. */
const SAMPLE_WEEKS: HeatCell[][] = Array.from({ length: 18 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const i = w * 7 + d
    const v = Math.sin(i * 12.9898) * 43758.5453
    const r = v - Math.floor(v)
    const level = i < 40 ? (r > 0.7 ? 1 : 0) : r > 0.35 ? Math.min(4, Math.ceil(r * 4 * (i / 126 + 0.4))) : 0
    return { level: level as HeatCell['level'], label: 'Sample data' }
  }),
)

export function ProgressPreview() {
  return (
    <section id="progress" className="mx-auto w-full max-w-6xl px-6 py-28">
      <SectionHeading eyebrow="Progress" title={<>See yourself <em className="text-gold">getting better.</em></>}>
        Streaks, XP and a heatmap that rewards showing up. Hints cost a sliver of XP at most, and never your streak.
      </SectionHeading>

      <Reveal y={30} className="mt-14">
        <div className="grid gap-4 rounded-3xl border border-line bg-surface p-5 md:grid-cols-[1.1fr_1fr] md:p-7" aria-label="Sample dashboard preview">
          <div className="space-y-4">
            <div className="flex items-center gap-6 rounded-2xl border border-line bg-bg/50 p-5">
              <ProgressRing value={68} size={104} label="Sample lesson progress" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-dim">Continue where you left off</p>
                <p className="mt-1.5 text-lg font-medium">Loops · for and range</p>
                <p className="text-sm text-muted">Exercise 3 of 4</p>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-bg/50 p-5">
              <Heatmap weeks={SAMPLE_WEEKS} summary="Sample activity heatmap for the last 18 weeks" />
              <p className="mt-3 text-xs text-dim">Last 18 weeks · sample data</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Day streak', 12, undefined],
                ['XP', 2480, undefined],
                ['Level', 7, undefined],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-2xl border border-line bg-bg/50 p-4">
                  <Counter value={value as number} className="font-serif text-4xl tabular-nums" />
                  <p className="mt-1 text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col justify-around gap-5 rounded-2xl border border-line bg-bg/50 p-5">
              {[
                ['Foundations', 82, 'gold'],
                ['Data structures', 35, 'gold'],
                ['Intermediate Python', 6, 'gold'],
              ].map(([label, value, tone]) => (
                <div key={label as string}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-mono text-muted">{value}%</span>
                  </div>
                  <ProgressBar value={value as number} tone={tone as 'gold'} label={`${label} progress`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
