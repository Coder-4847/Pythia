import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export default function AboutPage() {
  useDocumentTitle('About')
  return (
    <PageShell eyebrow="About" title="Why Pythia asks instead of tells" narrow>
      <div className="flex items-center gap-4">
        <LogoMark size={56} />
        <p className="font-serif text-2xl italic text-muted">“Know thyself”, carved at Delphi.</p>
      </div>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
        <p>
          The oracle at Delphi never gave straight answers; it gave questions you had to live with. Pythia is named for her. It reads your Python before you run it, sees the bug that is about to bite, and asks the one question that points
          at it. It never hands you the fix.
        </p>
        <p>
          That is on purpose. Copy-pasting a correction feels like progress and teaches almost nothing. Finding the off-by-one yourself, with a nudge, is what makes the next one easy. So the hint ladder goes
          question, then nudge, then a concrete hint, and only then the explanation, with a small, honest XP cost for each rung.
        </p>
        <p>
          Everything runs in your browser. Python is real CPython compiled to WebAssembly, so <code className="font-mono text-fg">input()</code>, imports and multi-file programs behave the way they do on your own machine.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/learn" className={buttonClass('primary')}>
          Start learning
        </Link>
        <Link to="/privacy" className={buttonClass('secondary')}>
          What happens to my code?
        </Link>
      </div>
    </PageShell>
  )
}
