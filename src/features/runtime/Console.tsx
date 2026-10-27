import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRuntimeState } from '@/features/runtime/runtime'
import type { ConsoleEntry } from '@/features/runtime/useRunner'
import { cn } from '@/lib/cn'

interface ConsoleProps {
  entries: ConsoleEntry[]
  running: boolean
  /** Non-null while the program waits in input(). */
  prompt: string | null
  onSubmitInput: (text: string) => void
  onClear: () => void
  /** Without cross-origin isolation, input() reads these pre-typed lines instead. */
  stdin: string
  onStdinChange: (text: string) => void
  /** Hide the header and cap the height, for inline snippets inside lesson text. */
  compact?: boolean
  className?: string
}

const TEXT_STYLE: Record<'stdout' | 'stderr' | 'stdin' | 'status' | 'info', string> = {
  stdout: 'text-fg',
  stderr: 'text-bad',
  stdin: 'text-gold',
  status: 'block text-dim italic',
  info: 'block text-dim',
}

/** Program output, plots, and an inline input() prompt. */
export function Console({ entries, running, prompt, onSubmitInput, onClear, stdin, onStdinChange, compact, className }: ConsoleProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [answer, setAnswer] = useState('')
  const isolated = useRuntimeState((s) => s.isolated)

  // Keep the newest output in view.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries, prompt])

  useEffect(() => {
    if (prompt !== null) inputRef.current?.focus()
  }, [prompt])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmitInput(answer)
    setAnswer('')
  }

  return (
    <section aria-label="Console" className={cn('flex min-h-0 flex-col bg-bg/60', className)}>
      {!compact && (
      <header className="flex items-center justify-between border-b border-line px-4 py-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">Console</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={running}
          className="rounded px-2 py-0.5 text-xs text-muted transition-colors hover:text-fg disabled:opacity-40"
        >
          Clear
        </button>
      </header>
      )}

      {!isolated && (
        <label className="block border-b border-line px-4 py-2 text-xs text-muted">
          Input for <code className="font-mono">input()</code>, one line per call
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            rows={2}
            className="mt-1.5 block w-full resize-y rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-[13px] text-fg"
          />
        </label>
      )}

      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        tabIndex={0}
        className={cn(
          'min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-6',
          compact && 'max-h-56',
        )}
      >
        {entries.length === 0 && !running && <p className="text-dim">{compact ? 'Output appears here.' : 'Press Run (Ctrl/⌘ + Enter) to see output here.'}</p>}
        {entries.map((entry) => {
          if (entry.kind === 'image')
            return <img key={entry.id} src={`data:image/png;base64,${entry.png}`} alt="Plot produced by your program" className="my-2 max-w-full rounded-lg bg-white" />
          if (entry.kind === 'error')
            return (
              <div key={entry.id} className="my-2 rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-bad">
                {entry.text}
              </div>
            )
          return (
            <span key={entry.id} className={TEXT_STYLE[entry.kind]}>
              {entry.text}
            </span>
          )
        })}
        {prompt !== null && (
          <form onSubmit={submit} className="inline-flex items-center align-baseline">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              aria-label={prompt ? `Answer for “${prompt}”` : 'Program input'}
              autoComplete="off"
              spellCheck={false}
              className="w-64 max-w-full border-b border-gold bg-transparent font-mono text-[13px] text-gold outline-none"
            />
          </form>
        )}
      </div>
    </section>
  )
}
