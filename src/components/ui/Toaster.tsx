import { AnimatePresence, m } from 'framer-motion'
import { useToast } from '@/stores/toast'

export function Toaster() {
  const toasts = useToast((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="rounded-full border border-line-strong bg-raised px-4 py-2 text-sm shadow-pop"
          >
            {t.text}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
