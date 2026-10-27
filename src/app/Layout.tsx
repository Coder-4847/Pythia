import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { START_PATH } from '@/app/paths'
import { Logo } from '@/components/brand/Logo'
import { buttonClass } from '@/components/ui/Button'
import { Toaster } from '@/components/ui/Toaster'
import { cn } from '@/lib/cn'
import { scrollToId } from '@/lib/scrollTo'
import { useTheme } from '@/stores/theme'

/** In-page sections of the landing page. Buttons, not anchors: `#` belongs to the hash router. */
const LANDING_NAV = [
  ['how', 'How it works'],
  ['curriculum', 'Curriculum'],
  ['playground', 'Playground'],
  ['faq', 'FAQ'],
] as const

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

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const onLanding = pathname === '/'
  // Workspace pages (editor + console) use the full window width.
  const wide = pathname.startsWith('/playground')
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
        <div className={cn('mx-auto flex h-16 w-full items-center justify-between px-6', wide ? 'max-w-none' : 'max-w-6xl')}>
          <Link to="/" aria-label="Pythia home" className="rounded-md">
            <Logo size={26} />
          </Link>
          {onLanding && (
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
          )}
          <div className="flex items-center gap-2">
            <Link to="/playground" className={cn(buttonClass('ghost', 'sm'), 'hidden sm:inline-flex')}>
              Playground
            </Link>
            <ThemeToggle />
            <Link to={START_PATH} className={buttonClass('primary', 'sm')}>
              Start coding
            </Link>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
