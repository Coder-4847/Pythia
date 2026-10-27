import { PageShell } from '@/components/ui/PageShell'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

interface Release {
  version: string
  title: string
  items: string[]
}

const RELEASES: Release[] = [
  {
    version: '0.1.0',
    title: 'First release',
    items: [
      'Python in the browser (CPython via WebAssembly) with input(), Stop and multi-file programs.',
      'Pythia: bug prediction before you run, the question → hint → explanation ladder, plain-English error translation, and an optional AI layer.',
      '28 lessons across Foundations and Data structures, each with tested exercises and a checkpoint.',
      'Dashboard, archive of every attempt with side-by-side comparison, achievements, statistics and settings.',
      'Command palette (Ctrl/⌘ K), keyboard shortcuts (?), light and dark themes, export / import of your data.',
    ],
  },
]

export default function ChangelogPage() {
  useDocumentTitle('Changelog')
  return (
    <PageShell eyebrow="Changelog" title="What’s new" narrow>
      <ol className="space-y-10">
        {RELEASES.map((r) => (
          <li key={r.version}>
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-3xl">{r.title}</h2>
              <span className="font-mono text-sm text-gold">v{r.version}</span>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted marker:text-dim">
              {r.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </PageShell>
  )
}
