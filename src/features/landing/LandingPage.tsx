import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'

/** Phase 1 shell. The full scroll-driven landing page arrives in phase 2. */
export default function LandingPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center">
      <LogoMark size={88} animate />
      <h1 className="mt-10 font-serif text-6xl leading-[1.02] tracking-tight sm:text-7xl">
        The tutor that sees your bugs coming.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Write real Python in your browser. Pythia asks the question that helps you find the bug yourself.
      </p>
      <Link to="/design" className={buttonClass('primary', 'lg', 'mt-10')}>
        See the design system
      </Link>
    </section>
  )
}
