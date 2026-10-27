import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { TRACKS } from '@/content/tracks'
import { SectionHeading } from '@/features/landing/SectionHeading'
import { cn } from '@/lib/cn'

gsap.registerPlugin(ScrollTrigger)

/**
 * Seven tracks along a single path. The gold line draws as you scroll and each
 * node lights up when the line reaches it.
 */
export function CurriculumMap() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-path]',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-map]', start: 'top 60%', end: 'bottom 70%', scrub: 0.5 } },
      )
      gsap.utils.toArray<HTMLElement>('[data-node]').forEach((node) => {
        ScrollTrigger.create({
          trigger: node,
          start: 'top 62%',
          onEnter: () => node.setAttribute('data-lit', 'true'),
          onLeaveBack: () => node.removeAttribute('data-lit'),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="curriculum" ref={root} className="mx-auto w-full max-w-6xl px-6 py-28">
      <SectionHeading eyebrow="Curriculum" title={<>One path, <em className="text-gold">zero to ML.</em></>}>
        Seven tracks, each a set of short lessons with a concept, a worked example, exercises with real tests, and a quick checkpoint.
      </SectionHeading>

      <div data-map className="relative mt-16">
        <div className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-line md:left-1/2" />
        <div data-path className="absolute bottom-0 left-[1.1rem] top-0 w-px origin-top bg-gold md:left-1/2" />
        <ol className="space-y-8 md:space-y-0">
          {TRACKS.map((t, i) => {
            const left = i % 2 === 0
            return (
              <li key={t.id} data-node className={cn('group relative grid items-start md:grid-cols-2', i > 0 && 'md:-mt-14')}>
                <span
                  aria-hidden
                  className="absolute left-[1.1rem] top-6 z-10 size-3 -translate-x-1/2 rounded-full border-2 border-line-strong bg-bg transition-all duration-500 group-data-[lit=true]:scale-125 group-data-[lit=true]:border-gold group-data-[lit=true]:bg-gold md:left-1/2"
                />
                <div className={cn('pl-12 md:pl-0', left ? 'md:pr-14 md:text-right' : 'md:col-start-2 md:pl-14')}>
                  <div className="rounded-2xl border border-line bg-surface p-6 transition-colors duration-500 group-data-[lit=true]:border-gold/40">
                    <div className={cn('flex items-center gap-3', left && 'md:flex-row-reverse')}>
                      <span className="font-mono text-xs text-dim">TRACK {String(i + 1).padStart(2, '0')}</span>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[11px]',
                          t.status === 'full' ? 'border-ok/40 text-ok' : 'border-line-strong text-muted',
                        )}
                      >
                        {t.status === 'full' ? 'Complete' : 'Preview'}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-medium tracking-tight">{t.title}</h3>
                    <p className="mt-1.5 text-[15px] text-muted">{t.blurb}</p>
                    <ul className={cn('mt-4 flex flex-wrap gap-1.5', left && 'md:justify-end')}>
                      {t.topics.map((topic) => (
                        <li key={topic} className="rounded-md bg-raised px-2 py-1 font-mono text-[11.5px] text-muted">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
