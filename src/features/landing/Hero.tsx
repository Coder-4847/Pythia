import { m, useReducedMotion } from 'framer-motion'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { START_PATH } from '@/app/paths'
import { buttonClass } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { scrollToId } from '@/lib/scrollTo'
import { HeroEditor } from '@/features/landing/HeroEditor'

const WORDS = ['The', 'tutor', 'that', 'sees', 'your', 'bugs', 'coming.']

export function Hero() {
  const reduce = useReducedMotion()
  return (
    <section className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-24">
      <div>
        <m.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1 font-mono text-xs text-muted"
        >
          <span className="size-1.5 rounded-full bg-gold" /> Python, from print() to machine learning
        </m.p>
        <h1 className="font-serif text-[clamp(3.2rem,7.2vw,5.8rem)] leading-[0.98] tracking-tight">
          {WORDS.map((w, i) => (
            <Fragment key={i}>
            <span className="inline-block overflow-hidden px-[0.08em] pb-[0.14em] -mx-[0.08em] -mb-[0.14em] align-bottom">
              <m.span
                className={`inline-block ${w === 'bugs' ? 'italic text-gold' : ''}`}
                initial={reduce ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </m.span>
            </span>{' '}
            </Fragment>
          ))}
        </h1>
        <m.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-lg text-lg leading-relaxed text-muted"
        >
          Write real Python in your browser. Pythia reads along, predicts the bug before you run it, and asks the one
          question that helps you find it yourself.
        </m.p>
        <m.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnetic>
            <Link to={START_PATH} className={buttonClass('primary', 'lg')}>
              Start coding — no signup
              <span aria-hidden>→</span>
            </Link>
          </Magnetic>
          <button type="button" onClick={() => scrollToId('how')} className={buttonClass('ghost', 'lg')}>
            See how it works
          </button>
        </m.div>
        <p className="mt-6 text-sm text-dim">Free. Runs entirely in your browser. Your code stays with you.</p>
      </div>
      <m.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center lg:justify-end lg:pr-10"
      >
        <HeroEditor />
      </m.div>
    </section>
  )
}
