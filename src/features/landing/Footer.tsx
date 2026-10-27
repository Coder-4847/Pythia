import { Link } from 'react-router-dom'
import { START_PATH } from '@/app/paths'
import { Logo } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { Reveal } from '@/components/ui/Reveal'

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-8 py-20 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side_at_50%_0%,color-mix(in_srgb,var(--c-gold)_16%,transparent),transparent)]" />
          <h2 className="relative font-serif text-5xl tracking-tight sm:text-6xl">What will you build first?</h2>
          <p className="relative mx-auto mt-4 max-w-md text-muted">Your first print() is thirty seconds away.</p>
          <div className="relative mt-9">
            <Magnetic>
              <Link to={START_PATH} className={buttonClass('primary', 'lg')}>Start coding — no signup</Link>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo size={24} />
          <p className="mt-4 text-sm text-muted">The AI Python tutor that sees your bugs coming.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-12 text-sm">
          <ul className="space-y-2.5">
            <li className="font-mono text-xs uppercase tracking-[0.16em] text-dim">Learn</li>
            <li><Link className="text-muted hover:text-fg" to={START_PATH}>Curriculum</Link></li>
            <li><Link className="text-muted hover:text-fg" to="/playground">Playground</Link></li>
          </ul>
          <ul className="space-y-2.5">
            <li className="font-mono text-xs uppercase tracking-[0.16em] text-dim">Pythia</li>
            <li><Link className="text-muted hover:text-fg" to="/about">About</Link></li>
            <li><Link className="text-muted hover:text-fg" to="/changelog">Changelog</Link></li>
            <li><Link className="text-muted hover:text-fg" to="/privacy">Privacy</Link></li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-dim">© {new Date().getFullYear()} Pythia. Built for curious people.</p>
    </footer>
  )
}
