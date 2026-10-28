import { AnimatePresence, m } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '@/app/Layout'
import { Skeleton } from '@/components/ui/Skeleton'
import Landing from '@/features/landing/LandingPage'

// The landing page ships in the entry chunk (it is the first paint for most visitors, and a lazy
// import would add a network round trip). Every other page is its own chunk.
const DesignSystem = lazy(() => import('@/features/design/DesignSystemPage'))
const Playground = lazy(() => import('@/features/playground/PlaygroundPage'))
const Curriculum = lazy(() => import('@/features/curriculum/CurriculumPage'))
const Lesson = lazy(() => import('@/features/lessons/LessonPage'))
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'))
const Archive = lazy(() => import('@/features/archive/ArchivePage'))
const ArchiveLesson = lazy(() => import('@/features/archive/ArchiveLessonPage'))
const Achievements = lazy(() => import('@/features/achievements/AchievementsPage'))
const Profile = lazy(() => import('@/features/profile/ProfilePage'))
const Stats = lazy(() => import('@/features/stats/StatsPage'))
const About = lazy(() => import('@/features/about/AboutPage'))
const Privacy = lazy(() => import('@/features/about/PrivacyPage'))
const Changelog = lazy(() => import('@/features/about/ChangelogPage'))
const Auth = lazy(() => import('@/features/auth/AuthPage'))
const Settings = lazy(() => import('@/features/settings/SettingsPage'))
const NotFound = lazy(() => import('@/features/misc/NotFoundPage'))

const CHUNK_ERROR = /dynamically imported module|importing a module script|loading chunk|failed to fetch/i

/**
 * A page that throws (or a script that fails to download, e.g. a stale copy after a new deploy) must
 * never leave a blank screen: say what happened, and reload once automatically for the stale-script case.
 */
class PageErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page failed to render:', error, info.componentStack)
    try {
      if (CHUNK_ERROR.test(error.message) && !sessionStorage.getItem('pythia.chunk-reload')) {
        sessionStorage.setItem('pythia.chunk-reload', '1')
        window.location.reload()
      }
    } catch {
      /* storage blocked: show the message instead */
    }
  }
  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <section role="alert" className="mx-auto w-full max-w-xl px-6 py-24">
        <h1 className="font-serif text-4xl tracking-tight">This page didn’t load.</h1>
        <p className="mt-3 text-muted">Something went wrong while opening it. Reloading usually fixes it; if it doesn’t, please tell whoever runs this site what is written below.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-xs text-muted">{error.name}: {error.message}</pre>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-ink">
          Reload
        </button>
      </section>
    )
  }
}

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-6 py-24" role="status" aria-label="Loading">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export function AppRoutes() {
  const location = useLocation()
  const reduce = useReducedMotion()
  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <PageErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/learn" element={<Curriculum />} />
              <Route path="/lesson/:id" element={<Lesson />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/archive/:id" element={<ArchiveLesson />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/signin" element={<Auth mode="signin" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="/forgot" element={<Auth mode="forgot" />} />
              <Route path="/reset" element={<Auth mode="reset" />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/design" element={<DesignSystem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </PageErrorBoundary>
        </m.div>
      </AnimatePresence>
    </Layout>
  )
}
