import { Link } from 'react-router-dom'
import { buttonClass } from '@/components/ui/Button'
import { Popover } from '@/components/ui/Popover'
import { SyncStatus } from '@/features/account/SyncStatus'
import { signOut, syncNow } from '@/sync/actions'
import { useCloud } from '@/sync/store'

/** Header control: "Sign in" for guests, an account popover once signed in. Renders nothing when accounts aren't configured. */
export function AccountMenu() {
  const configured = useCloud((s) => s.configured)
  const ready = useCloud((s) => s.ready)
  const user = useCloud((s) => s.user)
  const phase = useCloud((s) => s.phase)
  if (!configured || !ready) return null
  if (!user)
    return (
      <Link to="/signin" className={buttonClass('ghost', 'sm', 'hidden sm:inline-flex')}>
        Sign in
      </Link>
    )
  const initial = (user.email[0] ?? '?').toUpperCase()
  return (
    <Popover
      ariaLabel={`Account: ${user.email}`}
      align="right"
      panelClassName="w-80 p-4"
      label={
        <>
          <span aria-hidden className="grid size-5 place-items-center rounded-full bg-gold text-[11px] font-semibold text-gold-ink">
            {initial}
          </span>
          <span aria-hidden className={phase === 'error' ? 'size-1.5 rounded-full bg-bad' : phase === 'offline' ? 'size-1.5 rounded-full bg-dim' : 'hidden'} />
        </>
      }
    >
      {(close) => (
        <div>
          <p className="truncate text-sm font-medium">{user.email}</p>
          <SyncStatus className="mt-2 text-muted" />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => void syncNow()} className={buttonClass('secondary', 'sm')}>
              Sync now
            </button>
            <Link to="/profile" onClick={close} className={buttonClass('ghost', 'sm')}>
              Account
            </Link>
            <button
              type="button"
              onClick={() => {
                close()
                void signOut()
              }}
              className={buttonClass('ghost', 'sm')}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </Popover>
  )
}
