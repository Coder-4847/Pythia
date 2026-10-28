// Registers the service worker (sw.js, next to this file) and, on the very first visit, reloads once
// so the page is served with the headers that enable SharedArrayBuffer. See sw.js for why.
;(() => {
  const sw = navigator.serviceWorker
  if (!sw || !window.isSecureContext) return
  // Firefox and Safari need the "credentialless" flavour of isolation; Chromium uses require-corp.
  const credentialless = !(window.chrome || window.netscape)
  const reload = () => {
    // A couple of times per tab session at most: if a browser can't be isolated, don't loop.
    try {
      const done = Number(sessionStorage.getItem('pythia.coi-reloads') || 0)
      if (done >= 2) return
      sessionStorage.setItem('pythia.coi-reloads', String(done + 1))
    } catch {
      /* sessionStorage blocked: reload anyway, below */
    }
    window.location.reload()
  }
  if (sw.controller) sw.controller.postMessage({ type: 'coepCredentialless', value: credentialless })
  const url = new URL('sw.js', document.currentScript.src).href
  sw.register(url).then(
    (registration) => {
      // Already installed but not in charge of this page (e.g. a hard refresh): reload to be served by it.
      if (registration.active && !sw.controller && window.crossOriginIsolated === false) reload()
    },
    (error) => console.warn('Service worker not registered:', error),
  )
  // The first install claims the page once it has activated: tell it which isolation flavour to use,
  // then reload so this page is served through it (and so isolated). The same happens after an update.
  sw.addEventListener('controllerchange', () => {
    sw.controller?.postMessage({ type: 'coepCredentialless', value: credentialless })
    if (window.crossOriginIsolated === false) reload()
  })

  // Once the page is up and the browser is idle, ask the worker to save the app for offline use.
  const askToPrecache = () => {
    const worker = sw.controller
    if (worker) worker.postMessage({ type: 'precache' })
  }
  const whenIdle = () => (window.requestIdleCallback ? window.requestIdleCallback(askToPrecache, { timeout: 8000 }) : setTimeout(askToPrecache, 3000))
  window.addEventListener('load', () => setTimeout(whenIdle, 5000))
  sw.addEventListener('controllerchange', () => setTimeout(whenIdle, 5000))
})()
