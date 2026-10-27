import { useState } from 'react'
import type { Lesson } from '@/content/types'
import { Workspace } from '@/features/lessons/Workspace'
import { useRunner } from '@/features/runtime/useRunner'
import { renderMarkdown } from '@/lib/markdown'

/** The worked example: read the walkthrough, then run and tinker with the code. */
export function ExampleStep({ example }: { example: Lesson['example'] }) {
  const runner = useRunner()
  const [code, setCode] = useState(example.code)
  const [stdin, setStdin] = useState('')
  const run = () => void runner.run([{ name: 'main.py', code }], 'main.py', stdin)

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section aria-label="Worked example" className="min-h-0 overflow-y-auto px-6 py-6 lg:border-r lg:border-line">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Worked example</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight">{example.title}</h2>
        <div className="-mt-1">{renderMarkdown(example.explanation)}</div>
      </section>
      <div className="flex min-h-[28rem] min-w-0 flex-col lg:min-h-0">
        <Workspace
          docKey="example"
          code={example.code}
          onCodeChange={setCode}
          runner={runner}
          onRun={run}
          onReset={undefined}
          stdin={stdin}
          onStdinChange={setStdin}
        />
      </div>
    </div>
  )
}
