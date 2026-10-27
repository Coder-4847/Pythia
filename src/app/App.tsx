import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/routes'
import { useSettings } from '@/stores/settings'
import { useEffect } from 'react'

/**
 * HashRouter keeps deep links working on GitHub Pages without server rewrites
 * (`/#/lesson/…` is always served by index.html).
 */
export function App() {
  const reducedMotion = useSettings((s) => s.reducedMotion)
  // The in-app setting overrides the OS preference in both directions.
  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion === 'on' ? 'reduced' : 'full'
  }, [reducedMotion])
  return (
    // `strict` makes any accidental full `motion.*` import fail loudly instead of bloating the bundle.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reducedMotion === 'on' ? 'always' : reducedMotion === 'off' ? 'never' : 'user'}>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </MotionConfig>
    </LazyMotion>
  )
}
