import { useEffect, useRef } from 'react'
import { Kbd } from '@/components/ui/Kbd'

/** Shown with the platform's own modifier key name. */
const mod = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'

const GROUPS: { title: string; items: [keys: string[], what: string][] }[] = [
  {
    title: 'Everywhere',
    items: [
      [[mod, 'K'], 'Open the command palette'],
      [['?'], 'Show this list'],
      [['Esc'], 'Close menus and dialogs'],
    ],
  },
  {
    title: 'In the editor',
    items: [
      [[mod, 'Enter'], 'Run the code'],
      [[mod, 'Shift', 'Enter'], 'Check your answer (in exercises)'],
      [[mod, '.'], 'Read Pythia’s question about the current line'],
      [['Tab'], 'Indent (and complete a suggestion)'],
      [[mod === '⌘' ? 'Shift Alt' : 'Ctrl', 'M'], 'Let Tab move focus out of the editor'],
      [[mod, 'Z'], 'Undo (each file has its own history)'],
      [[mod, 'F'], 'Search in the file'],
    ],
  },
  {
    title: 'In the playground',
    items: [
      [['F2'], 'Rename the selected file tab'],
      [['Double-click'], 'Rename a file tab'],
    ],
  },
]

/** Keyboard shortcut reference on the native <dialog> (focus trap and Esc for free). */
export default function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="shortcuts-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-line-strong bg-raised p-6 text-fg shadow-pop backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between">
        <h2 id="shortcuts-title" className="text-lg font-medium">Keyboard shortcuts</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface hover:text-fg">×</button>
      </div>
      <div className="mt-4 space-y-5">
        {GROUPS.map((g) => (
          <section key={g.title} aria-label={g.title}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{g.title}</h3>
            <dl className="mt-2 divide-y divide-line">
              {g.items.map(([keys, what]) => (
                <div key={what} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <dt className="text-muted">{what}</dt>
                  <dd className="flex shrink-0 gap-1">{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  )
}
