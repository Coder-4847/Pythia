import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'

/** A 404 in Pythia's voice: it answers with a question. */
export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <LogoMark size={72} animate />
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-dim">404</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">This page isn’t where you expected.</h1>
      <p className="mt-4 text-muted">What did you type in the address bar — and what did you mean to find?</p>
      <Link to="/" className={buttonClass('primary', 'md', 'mt-8')}>
        Back to the start
      </Link>
    </section>
  )
}
