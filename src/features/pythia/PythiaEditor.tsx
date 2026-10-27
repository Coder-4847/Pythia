import { AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Popover } from '@/components/ui/Popover'
import { CodeEditor } from '@/features/editor/CodeEditor'
import { aiConfigured } from '@/features/pythia/aiClient'
import type { PythiaHandlers } from '@/features/pythia/editorExtension'
import { PythiaCard, type Rung } from '@/features/pythia/PythiaCard'
import { usePythia, type AiStatus } from '@/features/pythia/usePythia'
import { cn } from '@/lib/cn'
import { useSettings, type Keybindings } from '@/stores/settings'

interface Props {
  docKey: string
  /** Current text of this document (used until the learner types in this tab). */
  initialValue: string
  onChange: (value: string) => void
  onRun?: () => void
  onCheck?: () => void
  fontSize: number
  keybindings: Keybindings
  ariaLabel: string
  className?: string
  /** Lesson goal or exercise prompt: context for the AI layer. */
  goal?: string
  lastError?: { type: string; message: string } | null
  /** Called when the learner reveals a hint (3) or the explanation (4), so exercises can track help used. */
  onHelp?: (rung: 3 | 4) => void
}

type Anchor = { left: number; top?: number; bottom?: number }

const INTENSITIES = [
  ['quiet', 'Quiet', 'Only things that will certainly crash'],
  ['balanced', 'Balanced', 'Likely bugs too'],
  ['chatty', 'Chatty', 'Everything, including tidiness'],
] as const

const AI_LABEL: Record<AiStatus, string> = {
  'not-configured': 'AI layer not set up: local checks only',
  off: 'AI is off',
  idle: 'AI is on',
  thinking: 'Pythia is thinking…',
  unavailable: 'AI unreachable: using local checks',
}

/** An editor with Pythia attached: gutter dots, the question card, and a quiet status bar. */
export function PythiaEditor({ docKey, initialValue, onChange, onRun, onCheck, fontSize, keybindings, ariaLabel, className, goal, lastError, onHelp }: Props) {
  const { pythiaIntensity, aiEnabled, set } = useSettings()
  const wrapper = useRef<HTMLDivElement>(null)
  const [typed, setTyped] = useState<{ key: string; code: string } | null>(null)
  const code = typed?.key === docKey ? typed.code : initialValue
  const { diagnostics: found, aiStatus } = usePythia({ code, goal, lastError })

  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [rungs, setRungs] = useState<Record<string, Rung>>({})
  const [cardState, setCard] = useState<{ line: number; anchor: Anchor; pinned: boolean; docKey: string } | null>(null)
  // A card belongs to the document it was opened in; switching tabs closes it.
  const card = cardState?.docKey === docKey ? cardState : null
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const diagnostics = useMemo(() => found.filter((d) => !dismissed.has(d.id)), [found, dismissed])
  const active = card ? diagnostics.find((d) => d.line === card.line) : undefined

  const anchorFrom = useCallback((rect: DOMRect | null): Anchor => {
    const box = wrapper.current?.getBoundingClientRect()
    if (!rect || !box) return { left: 12, bottom: 44 }
    return { left: Math.min(Math.max(rect.right - box.left + 10, 8), Math.max(8, box.width - 344)), top: Math.max(8, rect.bottom - box.top + 6) }
  }, [])

  const handlers: PythiaHandlers = {
    onHover(line, rect) {
      clearTimeout(hideTimer.current)
      if (line === null) {
        hideTimer.current = setTimeout(() => setCard((c) => (c?.pinned ? c : null)), 250)
        return
      }
      setCard((c) => (c?.pinned ? c : { line, anchor: anchorFrom(rect), pinned: false, docKey }))
    },
    onSelect(line, rect) {
      setCard((c) => (c?.line === line && c.pinned ? null : { line, anchor: anchorFrom(rect), pinned: true, docKey }))
    },
    onKeyboard(line, rect) {
      const target = diagnostics.find((d) => d.line === line) ?? diagnostics[0]
      if (target) setCard({ line: target.line, anchor: anchorFrom(rect), pinned: true, docKey })
    },
  }

  // Screen readers hear about Pythia's first question; the text only changes when that question does.
  const first = diagnostics[0]
  const announcement = first ? `Pythia has a question about line ${first.line}. Press Control or Command and period to read it.` : ''

  return (
    <div ref={wrapper} className={cn('relative flex min-h-0 flex-col', className)}>
      <CodeEditor
        docKey={docKey}
        initialValue={initialValue}
        onChange={(value) => {
          setTyped({ key: docKey, code: value })
          onChange(value)
        }}
        onRun={onRun}
        onCheck={onCheck}
        fontSize={fontSize}
        keybindings={keybindings}
        ariaLabel={ariaLabel}
        diagnostics={diagnostics}
        pythiaHandlers={handlers}
        className="min-h-0 flex-1"
      />

      <AnimatePresence>
        {card && active && (
          <PythiaCard
            key={active.id}
            diagnostic={active}
            rung={rungs[active.id] ?? 2}
            countsAsHelp={Boolean(onHelp)}
            onReveal={(rung) => {
              setRungs((r) => ({ ...r, [active.id]: rung }))
              setCard((c) => (c ? { ...c, pinned: true } : c)) // the learner is reading it: keep it open
              onHelp?.(rung)
            }}
            onDismiss={() => {
              setDismissed((s) => new Set(s).add(active.id))
              setCard(null)
            }}
            onClose={() => setCard(null)}
            style={{ left: card.anchor.left, top: card.anchor.top, bottom: card.anchor.bottom }}
            onPointerEnter={() => clearTimeout(hideTimer.current)}
            onPointerLeave={() => !card.pinned && setCard(null)}
          />
        )}
      </AnimatePresence>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="flex items-center gap-3 border-t border-line px-3 py-1.5 text-xs text-dim">
        <span
          aria-hidden
          className={cn('size-1.5 rounded-full', diagnostics.length ? 'bg-gold' : 'bg-line-strong')}
          style={diagnostics.length ? { animation: 'pulse-soft 1.6s ease-in-out infinite' } : undefined}
        />
        {diagnostics.length ? (
          <button
            type="button"
            onClick={() => setCard({ line: diagnostics[0]!.line, anchor: { left: 12, bottom: 44 }, pinned: true, docKey })}
            className="rounded text-gold hover:underline"
          >
            Pythia has {diagnostics.length === 1 ? 'a question' : `${diagnostics.length} questions`} · line {diagnostics[0]!.line}
          </button>
        ) : (
          <span>Pythia is watching</span>
        )}
        <span className="hidden sm:inline">{AI_LABEL[aiStatus]}</span>
        <div className="ml-auto">
          <Popover ariaLabel="Pythia settings" align="right" label={<span className="text-xs">{INTENSITIES.find(([id]) => id === pythiaIntensity)![1]} ▾</span>} panelClassName="bottom-full top-auto mb-2 mt-0 w-72 p-3">
            {() => (
              <div>
                <p className="text-sm font-medium">How chatty should Pythia be?</p>
                <div role="radiogroup" aria-label="Pythia intensity" className="mt-2 space-y-1">
                  {INTENSITIES.map(([id, label, blurb]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={pythiaIntensity === id}
                      onClick={() => set({ pythiaIntensity: id })}
                      className={cn('flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors', pythiaIntensity === id ? 'border-gold bg-gold/10' : 'border-line hover:border-line-strong')}
                    >
                      <span className="text-sm text-fg">{label}</span>
                      <span className="text-xs text-dim">{blurb}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 border-t border-line pt-3">
                  <label className={cn('flex items-center justify-between gap-3 text-sm', !aiConfigured && 'opacity-60')}>
                    <span>
                      AI layer
                      <span className="block text-xs text-dim">{aiConfigured ? 'Sends your code to Pythia’s AI when you pause' : 'Not set up on this site: local checks only'}</span>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={aiEnabled}
                      disabled={!aiConfigured}
                      onChange={(e) => set({ aiEnabled: e.target.checked })}
                      className="size-4 accent-[var(--c-gold)]"
                    />
                  </label>
                </div>
              </div>
            )}
          </Popover>
        </div>
      </div>
    </div>
  )
}
