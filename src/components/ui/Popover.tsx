import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PopoverProps {
  /** Rendered inside the trigger button. */
  label: ReactNode
  ariaLabel: string
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  panelClassName?: string
}

/** A trigger button plus a floating panel; closes on outside click or Escape. */
export function Popover({ label, ariaLabel, children, align = 'left', panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[13px] text-muted transition-colors hover:border-gold/60 hover:text-fg"
      >
        {label}
      </button>
      {open && (
        <div
          id={panelId}
          className={cn(
            'absolute top-full z-30 mt-2 rounded-xl border border-line-strong bg-raised shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
