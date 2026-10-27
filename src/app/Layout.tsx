import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { START_PATH } from '@/app/paths'
import { Logo } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'
import { Kbd } from '@/components/ui/Kbd'
import { Popover } from '@/components/ui/Popover'
import { Toaster } from '@/components/ui/Toaster'
import { AccountMenu } from '@/features/account/AccountMenu'
import { useCloud } from '@/sync/store'
import { useToast } from '@/stores/toast'
import { cn } from '@/lib/cn'
import { scrollToId } from '@/lib/scrollTo'
import { useTheme } from '@/stores/theme'

// Overlays and the achievement watcher pull in the curriculum, so they load after first paint.
const CommandPalette = lazy(() => import('@/features/palette/CommandPalette'))
const ShortcutsOverlay = lazy(() => import('@/features/help/ShortcutsOverlay'))
const AchievementWatcher = lazy(() => import('@/features/achievements/AchievementWatcher'))
const SyncChoiceDialog = lazy(() => import('@/features/account/SyncChoiceDialog'))

/** Primary navigation between the app's areas. */
const APP_NAV = [
  ['/dashboard', 'Dashboard'],
  ['/learn', 'Learn'],
  ['/playground', 'Playground'],
  ['/archive', 'Archive'],
] as const

/** Secondary pages, reached from the account menu. */
const MORE_NAV = [
  ['/profile', 'Profile'],
  ['/stats', 'Statistics'],
  ['/achievements', 'Achievements'],
  ['/settings', 'Settings'],
] as const

/** In-page sections of the landing page. Buttons, not anchors: `#` belongs to the hash router. */
const LANDING_NAV = [
  ['how', 'How it works'],
  ['curriculum', 'Curriculum'],
  ['playground', 'Playground'],
  ['faq', 'FAQ'],
] as const

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.closest('.cm-editor') !== null)

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        {theme === 'dark' ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  )
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(buttonClass('ghost', 'sm'), 'hidden md:inline-flex', isActive && 'bg-raised text-fg')

function MenuLinks({ items, close }: { items: readonly (readonly [string, string])[]; close: () => void }) {
  return (
    <>
      {items.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          onClick={close}
          className={({ isActive }) => cn('block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface', isActive ? 'text-gold' : 'text-fg')}
        >
          {label}
        </NavLink>
      ))}
    </>
  )
}

/** Sends people where they expect after an email link or OAuth redirect brings them back to the site. */
function CloudRedirects() {
  const navigate = useNavigate()
  const show = useToast((s) => s.show)
  const user = useCloud((s) => s.user)
  const recovery = useCloud((s) => s.recovery)
  const returned = useCloud((s) => s.returned)
  const set = useCloud((s) => s.set)
  useEffect(() => {
    if (recovery) navigate('/reset', { replace: true })
  }, [recovery, navigate])
  useEffect(() => {
    if (user && returned && !recovery) {
      set({ returned: false })
      show(`Signed in as ${user.email}`)
      navigate('/dashboard', { replace: true })
    }
  }, [user, returned, recovery, navigate, set, show])
  return null
}

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const onLanding = pathname === '/'
  // Workspace pages (editor + console) use the full window width.
  const wide = pathname.startsWith('/playground') || pathname.startsWith('/lesson/')
  const [palette, setPalette] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const configured = useCloud((s) => s.configured)
  const signedIn = useCloud((s) => s.user !== null)
  const hasChoice = useCloud((s) => s.choice !== null)
  const openPalette = useCallback(() => setPalette(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      } else if (e.key === '?' && !isTyping(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShortcuts(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-gold-ink"
      >
        Skip to content
      </button>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <div className={cn('mx-auto flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6', wide ? 'max-w-none' : 'max-w-6xl')}>
          <div className="flex items-center gap-2">
            <Link to="/" aria-label="Pythia home" className="rounded-md">
              <Logo size={26} />
            </Link>
          </div>

          {onLanding ? (
            <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
              {LANDING_NAV.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToId(id)}
                  className="rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:bg-raised hover:text-fg"
                >
                  {label}
                </button>
              ))}
            </nav>
          ) : (
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {APP_NAV.map(([to, label]) => (
                <NavLink key={to} to={to} className={linkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open the command palette"
              className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-dim transition-colors hover:border-line-strong hover:text-muted lg:flex"
            >
              Search <Kbd>{typeof navigator !== 'undefined' && /Mac/.test(navigator.platform) ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </button>
            <ThemeToggle />
            <AccountMenu />
            {onLanding ? (
              <>
                <Link to="/dashboard" className={cn(buttonClass('ghost', 'sm'), 'hidden sm:inline-flex')}>
                  Dashboard
                </Link>
                <Link to={START_PATH} className={buttonClass('primary', 'sm')}>
                  Start coding
                </Link>
              </>
            ) : null}
            <Popover
              ariaLabel="Menu"
              align="right"
              label={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              }
              panelClassName="w-52 p-1.5"
            >
              {(close) => (
                <nav aria-label="More">
                  <div className="md:hidden">
                    <MenuLinks items={APP_NAV} close={close} />
                    <hr className="my-1.5 border-line" />
                  </div>
                  {configured && !signedIn && <MenuLinks items={[['/signin', 'Sign in']]} close={close} />}
                  <MenuLinks items={MORE_NAV} close={close} />
                  <hr className="my-1.5 border-line" />
                  <button
                    type="button"
                    onClick={() => {
                      close()
                      setShortcuts(true)
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface"
                  >
                    Keyboard shortcuts
                  </button>
                  <MenuLinks items={[['/about', 'About'], ['/changelog', 'Changelog'], ['/privacy', 'Privacy']]} close={close} />
                </nav>
              )}
            </Popover>
          </div>
        </div>
      </header>
      {configured && <CloudRedirects />}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Toaster />
      <Suspense fallback={null}>
        <AchievementWatcher />
        {hasChoice && <SyncChoiceDialog />}
        {palette && <CommandPalette open={palette} onClose={() => setPalette(false)} />}
        {shortcuts && <ShortcutsOverlay open={shortcuts} onClose={() => setShortcuts(false)} />}
      </Suspense>
    </div>
  )
}
