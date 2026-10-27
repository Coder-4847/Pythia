import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/routes'

/**
 * HashRouter keeps deep links working on GitHub Pages without server rewrites
 * (`/#/lesson/…` is always served by index.html).
 */
export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
