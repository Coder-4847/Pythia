import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { CodeText } from '@/components/ui/CodeText'
import { SectionHeading } from '@/features/landing/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    n: '01',
    title: 'You write',
    body: 'A real editor, real Python, running in a worker in your browser. No installs, no setup, no signup.',
    visual: (
      <pre className="font-mono text-[12.5px] leading-6">
        <CodeText code={'def average(nums):\n    return sum(nums) / len(nums)\n\nprint(average([]))'} />
      </pre>
    ),
  },
  {
    n: '02',
    title: 'Pythia notices',
    body: 'While you type, local rules and an optional AI layer look for the bugs beginners actually hit — before you press Run.',
    visual: (
      <div className="font-mono text-[12.5px] leading-6">
        <div className="flex items-center gap-3 rounded bg-gold/10 px-1">
          <span className="size-2 rounded-full bg-gold" style={{ animation: 'pulse-soft 1.6s ease-in-out infinite' }} />
          <span className="whitespace-pre"><CodeText code="    return sum(nums) / len(nums)" /></span>
        </div>
        <p className="mt-3 text-xs text-dim">Possible problem on line 2</p>
      </div>
    ),
  },
  {
    n: '03',
    title: 'You discover',
    body: 'You get a question, never the answer. Stuck? A ladder of hints is there, and the full explanation is one honest click away.',
    visual: (
      <div className="rounded-lg border border-gold/40 bg-raised p-3.5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-gold">
          <LogoMark size={14} /> Pythia
        </div>
        <p className="mt-2 text-sm leading-snug">What does <code className="font-mono text-gold">len(nums)</code> return when the list is empty?</p>
      </div>
    ),
  },
]

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="how" ref={root} className="mx-auto w-full max-w-6xl px-6 py-28">
      <SectionHeading eyebrow="How it works" title={<>A tutor that asks, <em className="text-gold">not tells.</em></>}>
        The best debugging lesson is the one you solve yourself. Pythia is built to get you most of the way there, then step aside.
      </SectionHeading>
      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <article key={s.n} data-step className="relative rounded-2xl border border-line bg-surface p-6">
            <span className="font-mono text-sm text-gold">{s.n}</span>
            <h3 className="mt-5 text-xl font-medium">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
            <div className="mt-6 rounded-xl border border-line bg-bg/60 p-4">{s.visual}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
