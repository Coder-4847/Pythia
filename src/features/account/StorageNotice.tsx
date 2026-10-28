import { useState } from 'react'
import { Link } from 'react-router-dom'
import { storage } from '@/data/db'

/**
 * Shown only when this browser won't let Pythia save anything (private modes, blocked site data,
 * some in-app browsers). Everything still works, but progress lasts until the tab is closed.
 */
export default function StorageNotice() {
  const [hidden, setHidden] = useState(false)
  if (storage.persistent || hidden) return null
  return (
    <div role="status" className="border-b border-gold/40 bg-gold/10 px-4 py-2.5 text-center text-sm">
      This browser is blocking storage, so your progress is only kept until you close this tab. Allow site data for this page, or{' '}
      <Link to="/settings" className="font-medium text-fg underline underline-offset-4">
        export your progress in Settings
      </Link>{' '}
      before you leave.{' '}
      <button type="button" onClick={() => setHidden(true)} className="ml-1 rounded px-1.5 text-muted underline underline-offset-4 hover:text-fg">
        Dismiss
      </button>
    </div>
  )
}
