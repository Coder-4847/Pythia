import { AnimatePresence, m } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { lazy, Suspense } from 'react'
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
const Settings = lazy(() => import('@/features/settings/SettingsPage'))
const NotFound = lazy(() => import('@/features/misc/NotFoundPage'))

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
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/learn" element={<Curriculum />} />
              <Route path="/lesson/:id" element={<Lesson />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/design" element={<DesignSystem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </m.div>
      </AnimatePresence>
    </Layout>
  )
}
