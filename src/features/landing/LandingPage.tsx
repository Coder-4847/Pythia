import { useReducedMotion } from '@/lib/useReducedMotion'
import { lazy, Suspense, useEffect } from 'react'
import { Hero } from '@/features/landing/Hero'

// Everything below the fold (and GSAP with it) loads after the hero has painted.
const BelowTheFold = lazy(() => import('@/features/landing/BelowTheFold'))

/** The marketing page: smooth-scrolled, with GSAP scroll-driven sections. */
export default function LandingPage() {
  const reduce = useReducedMotion()
  useEffect(() => {
    // GSAP + Lenis stay out of the critical path: they load once the hero is up.
    let stop = () => {}
    let cancelled = false
    void import('@/lib/smoothScroll').then(({ startSmoothScroll }) => {
      if (!cancelled) stop = startSmoothScroll(reduce)
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [reduce])

  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <BelowTheFold />
      </Suspense>
    </>
  )
}
