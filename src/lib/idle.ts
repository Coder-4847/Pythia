/**
 * Run `task` once the page has finished loading and the browser has a quiet moment. For work that
 * must happen but should never compete with the first paint (reading saved settings, the
 * achievement watcher). `delay` is a floor in ms after the load event.
 */
export function afterLoadIdle(task: () => void, delay = 800): void {
  const go = () =>
    setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => task(), { timeout: 4000 })
      else task()
    }, delay)
  if (document.readyState === 'complete') go()
  else window.addEventListener('load', go, { once: true })
}
