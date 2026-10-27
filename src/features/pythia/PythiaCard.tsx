import { m } from 'framer-motion'
import { LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { renderInline } from '@/lib/markdown'
import type { Diagnostic } from '@/workers/protocol'

export type Rung = 2 | 3 | 4

interface Props {
  diagnostic: Diagnostic
  /** 2 = question only, 3 = hint shown, 4 = full explanation shown. */
  rung: Rung
  onReveal: (rung: 3 | 4) => void
  onDismiss: () => void
  onClose: () => void
  /** When true, revealing help is counted against the exercise (a little XP, never a streak). */
  countsAsHelp: boolean
  style?: React.CSSProperties
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

/**
 * The little card that opens from the gutter dot: a guiding question first, then a hint, then
 * the full explanation, each opt-in. It is a non-modal dialog so keyboard users can reach it.
 */
export function PythiaCard({ diagnostic: d, rung, onReveal, onDismiss, onClose, countsAsHelp, style, onPointerEnter, onPointerLeave }: Props) {
  return (
    <m.div
      role="dialog"
      aria-label={`Pythia, about line ${d.line}`}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="absolute z-30 w-[min(21rem,calc(100%-1.5rem))] rounded-xl border border-gold/40 bg-raised p-4 shadow-pop"
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
        <LogoMark size={16} />
        Pythia · line {d.line}
        {d.source === 'ai' && <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] tracking-wider">AI</span>}
        <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid size-6 place-items-center rounded text-base normal-case text-dim hover:bg-surface hover:text-fg">
          ×
        </button>
      </div>

      <p className="mt-2.5 text-[15px] leading-snug text-fg">{renderInline(d.question, 'q')}</p>

      {rung >= 3 && (
        <p className="mt-3 border-l-2 border-gold/50 pl-3 text-sm leading-relaxed text-muted">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Hint </span>
          {renderInline(d.hint, 'h')}
        </p>
      )}
      {rung >= 4 && (
        <p className="mt-3 border-l-2 border-gold/50 pl-3 text-sm leading-relaxed text-muted">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">Explanation </span>
          {renderInline(d.explanation, 'e')}
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {rung === 2 && (
          <Button size="sm" variant="secondary" onClick={() => onReveal(3)}>
            Give me a hint
          </Button>
        )}
        {rung === 3 && (
          <Button size="sm" variant="ghost" onClick={() => onReveal(4)}>
            I’m stuck — explain
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Not now
        </Button>
        {countsAsHelp && rung === 2 && <span className="text-[11px] text-dim">Hints cost a little XP</span>}
      </div>
    </m.div>
  )
}
