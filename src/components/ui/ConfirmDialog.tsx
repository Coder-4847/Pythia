import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  /** Style the confirm button as dangerous. */
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Modal confirmation on the native <dialog>: focus trap, Escape and inert backdrop come for free. */
export function ConfirmDialog({ open, title, children, confirmLabel, destructive, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-line-strong bg-raised p-6 text-fg shadow-pop backdrop:bg-black/60"
    >
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant={destructive ? 'secondary' : 'primary'}
          size="sm"
          className={destructive ? 'border-bad/60 text-bad hover:border-bad' : undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
