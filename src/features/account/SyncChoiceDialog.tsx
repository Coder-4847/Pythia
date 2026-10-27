import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { resolveChoice } from '@/sync/actions'
import { useCloud } from '@/sync/store'

/**
 * Shown once, the first time a device that already holds progress is signed in to an account.
 * Nothing is uploaded or replaced until the learner picks.
 */
export default function SyncChoiceDialog() {
  const choice = useCloud((s) => s.choice)
  const email = useCloud((s) => s.user?.email)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (choice && !d.open) d.showModal()
    if (!choice && d.open) d.close()
  }, [choice])

  const { lessons, attempts } = choice?.local ?? { lessons: 0, attempts: 0 }
  const summary = `${lessons} ${lessons === 1 ? 'lesson' : 'lessons'} and ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`

  return (
    <dialog
      ref={ref}
      aria-labelledby="sync-choice-title"
      onCancel={(e) => {
        e.preventDefault()
        void resolveChoice('later')
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-line-strong bg-raised p-6 text-fg shadow-pop backdrop:bg-black/60"
    >
      {choice && (
        <>
          <h2 id="sync-choice-title" className="font-serif text-3xl tracking-tight">
            {choice.cloudHasData ? 'Combine this device with your account?' : 'Save your progress to your account?'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This browser already holds {summary}.{' '}
            {choice.cloudHasData ? (
              <>
                <span className="text-fg">{email}</span> has saved progress too. Nothing happens until you choose.
              </>
            ) : (
              <>
                <span className="text-fg">{email}</span> has nothing saved yet. Uploading lets you continue on other devices.
              </>
            )}
          </p>
          <div className="mt-6 space-y-3">
            <Button variant="primary" className="w-full" onClick={() => void resolveChoice('merge')}>
              {choice.cloudHasData ? 'Combine both (recommended)' : 'Upload and sync'}
            </Button>
            {choice.cloudHasData && (
              <>
                <p className="text-xs text-dim">Combining keeps the newer version of anything that exists in both places.</p>
                <Button className="w-full" onClick={() => void resolveChoice('replace')}>
                  Use my account’s copy only
                </Button>
                <p className="text-xs text-dim">Replaces what’s in this browser. Export first in Settings if you want to keep it.</p>
              </>
            )}
            <Button variant="ghost" className="w-full" onClick={() => void resolveChoice('later')}>
              Not now
            </Button>
          </div>
        </>
      )}
    </dialog>
  )
}
