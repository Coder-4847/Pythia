import { domAnimation, LazyMotion } from 'framer-motion'
import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/routes'

/**
 * HashRouter keeps deep links working on GitHub Pages without server rewrites
 * (`/#/lesson/…` is always served by index.html).
 */
export function App() {
  return (
    // `strict` makes any accidental full `motion.*` import fail loudly instead of bloating the bundle.
    <LazyMotion features={domAnimation} strict>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </LazyMotion>
  )
}
