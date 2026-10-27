import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, buttonClass } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SyncStatus } from '@/features/account/SyncStatus'
import { deleteAccount, enableSync, signOut, syncNow } from '@/sync/actions'
import { useCloud } from '@/sync/store'
import { useToast } from '@/stores/toast'

/** Profile page: who you are signed in as, whether sync is on, and the way out. */
export function AccountSection() {
  const configured = useCloud((s) => s.configured)
  const ready = useCloud((s) => s.ready)
  const user = useCloud((s) => s.user)
  const phase = useCloud((s) => s.phase)
  const error = useCloud((s) => s.error)
  const show = useToast((s) => s.show)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const remove = async () => {
    setBusy(true)
    setProblem(null)
    const r = await deleteAccount()
    setBusy(false)
    setConfirming(false)
    if (r.ok) show('Your account and cloud data were deleted')
    else setProblem(r.error)
  }

  if (!configured)
    return (
      <section className="mt-10 rounded-2xl border border-line bg-surface p-6" aria-labelledby="acct">
        <h2 id="acct" className="font-serif text-2xl">
          You’re learning as a guest
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Everything is saved on this device, and accounts aren’t switched on for this copy of Pythia. To move to another browser or keep a backup, use{' '}
          <Link to="/settings" className="text-gold underline-offset-4 hover:underline">
            export in Settings
          </Link>
          .
        </p>
      </section>
    )

  if (!ready) return null

  if (!user)
    return (
      <section className="mt-10 rounded-2xl border border-line bg-surface p-6" aria-labelledby="acct">
        <h2 id="acct" className="font-serif text-2xl">
          You’re learning as a guest
        </h2>
        <p className="mt-2 max-w-2xl text-muted">Your progress is saved on this device. Create a free account to continue on your phone or another computer. It’s optional, and nothing changes if you skip it.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/signup" className={buttonClass('primary')}>
            Create an account
          </Link>
          <Link to="/signin" className={buttonClass('secondary')}>
            Sign in
          </Link>
        </div>
      </section>
    )

  return (
    <section className="mt-10 rounded-2xl border border-line bg-surface p-6" aria-labelledby="acct">
      <h2 id="acct" className="font-serif text-2xl">
        Your account
      </h2>
      <p className="mt-2 text-muted">
        Signed in as <span className="text-fg">{user.email}</span>
      </p>
      <SyncStatus className="mt-3 text-muted" />
      {error && (
        <p role="alert" className="mt-2 text-sm text-bad">
          {error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        {phase === 'paused' ? (
          <Button variant="primary" onClick={() => void enableSync()}>
            Turn on sync for this device
          </Button>
        ) : (
          <Button onClick={() => void syncNow()}>Sync now</Button>
        )}
        <Button variant="ghost" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-dim">Signing out keeps everything on this device. Changes you make while signed out are uploaded the next time you sign in.</p>

      <hr className="my-6 border-line" />
      <h3 className="font-medium text-bad">Delete my account</h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">Erases your account and everything saved in the cloud. What’s on this device stays until you reset it in Settings.</p>
      {problem && (
        <p role="alert" className="mt-2 text-sm text-bad">
          {problem}
        </p>
      )}
      <Button className="mt-4 border-bad/50 text-bad hover:border-bad" onClick={() => setConfirming(true)}>
        Delete account…
      </Button>
      <ConfirmDialog open={confirming} title="Delete your account?" confirmLabel={busy ? 'Deleting…' : 'Delete account'} destructive onCancel={() => setConfirming(false)} onConfirm={() => void remove()}>
        This permanently removes {user.email} and all progress stored in the cloud. It can’t be undone. Your data on this device isn’t touched.
      </ConfirmDialog>
    </section>
  )
}
