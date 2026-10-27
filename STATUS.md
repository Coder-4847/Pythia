# Status

Honest running ledger: what is done, what is approximated, and what only you can do.

## Phase 3 — Pyodide runtime, editor, console, playground ✅

Done
- **Runtime** (`src/workers`, `src/features/runtime`): Pyodide in a module Web Worker, lazy-loaded when the
  playground opens. A small Python module (`pythia_runtime.py`) runs learner code, trims tracebacks to the
  learner's own frames (relative file names, failing line), streams stdout/stderr live, replaces `input()` and
  `sys.stdin`, and captures matplotlib figures as PNGs. Runtime logic lives in a worker-free `engine.ts`, so
  it is tested in Node against real Pyodide (13 tests).
- **input() and Stop** use SharedArrayBuffer + Atomics + Pyodide's interrupt buffer (`KeyboardInterrupt`),
  enabled by `coi-serviceworker`. Without isolation: input() reads lines typed in a console box beforehand, and
  Stop terminates and restarts the worker. If a polite interrupt isn't honoured within 1.5 s (e.g. a long NumPy
  call), the worker is restarted. Both modes are covered by Playwright.
- **Editor**: CodeMirror 6 with a token-driven theme (follows dark/light with no reconfiguration), Python
  language + autocomplete + 10 snippet templates, per-tab undo history, Ctrl/⌘+Enter to run, lazy-loaded Vim mode
  (selected via the settings store; the settings UI arrives in Phase 7).
- **Playground** (`#/playground`): multi-file tabs (add / rename with F2 or double-click / delete; files can import
  each other), console with inline `input()`, inline plots, micropip package install panel, 13-snippet library
  (the pure-Python ones are executed in a test, the scientific ones compile-checked), shareable links (code is
  deflate-compressed into `#/playground?c=…`, validated and size-bounded on load, confirmation before overwriting
  work), toasts, confirm dialog.
- 10 Playwright tests (landing + playground) and 35 unit tests, all green.

Approximated / caveats
- **Not verified in a browser here:** NumPy / pandas / matplotlib / scikit-learn loading and plot rendering, and
  micropip installs. The sandbox cannot reach the Pyodide CDN, so the e2e suite serves the Pyodide *core* locally
  (`npm run pyodide:local`). The matplotlib capture code (`_flush_figures`) and the package-loading path are written
  against Pyodide's documented API but have not been run end to end. Figures are captured when the program
  finishes (not at each `plt.show()`), which gives the same pictures in the same order.
- The playground's files and the editor settings live in memory until Phase 4 adds IndexedDB persistence, so a
  reload resets them (share links work meanwhile).
- `coi-serviceworker` and the Phase 9 PWA service worker both want the root scope. In Phase 9 they will be merged
  into one worker (cache + COOP/COEP headers) rather than registering two.
- The first visit reloads once while the isolation service worker installs.
- Pythia (bug prediction) is not in the playground yet — that is Phase 6.

## Phase 2 — landing page ✅

Done
- Hero: serif headline revealed word by word, and an editor that types a real off-by-one bug by itself,
  flags the line with a pulsing gutter marker, and has Pythia ask *"What do you expect `i` to be on the
  last loop?"* — then the "learner" fixes it, the console prints 55, and it loops. Reduced motion shows
  the asked state statically.
- Scroll-driven sections (GSAP ScrollTrigger + Lenis smooth scroll): how it works, curriculum path that
  draws as you scroll (7 tracks from `src/content/tracks.ts`), playground, progress preview (animated ring,
  counters, heatmap, bars), FAQ accordion, final CTA, footer. Magnetic CTA buttons.
- Section nav uses buttons + `scrollToId` (the `#` belongs to the hash router); skip link likewise.
- Playwright config + 3 smoke tests (hero demo, section nav, custom 404); wired into CI.
- Lighthouse 12 on the production build (simulated mobile, sandbox Chromium): performance 91, accessibility
  100, best practices 100, SEO 100. Main chunk 105 kB gzip; GSAP/Lenis and all below-the-fold sections load
  after the hero. Framer Motion runs through `LazyMotion` (`m.*`, strict).
- Found and fixed along the way: Lenis measured the page before the lazy sections mounted (nav scrolls stopped short); h1 words had no spaces for screen readers, low-contrast `dim` text,
  invalid list markup, 8px horizontal overflow on mobile.

Approximated / caveats
- The "Start coding" CTAs point at `/learn` (the curriculum), which doesn't exist until Phase 4; it shows the
  404 for now. The footer links (`/playground`, `/about`, `/changelog`, `/privacy`) are the same until their phases.
- The progress preview and the hero demo use sample/scripted data and are labelled as such.
- The landing page has no server-side rendering; first paint waits on the JS entry chunk.
- The FAQ states that the app works offline after first visit and that the AI layer is optional; both are
  delivered in later phases (PWA in 9, AI in 6).
- Lighthouse performance sits just over 90 and varies ±2 run to run.

## Phase 1 — scaffold, design system, logo, CI/CD ✅

Done
- Vite + React 19 + strict TypeScript, Tailwind 4 design tokens (dark default + light), self-hosted
  Geist / JetBrains Mono / Instrument Serif.
- Hand-coded SVG mark (serpent-bodied "P" with an eye counter) with animated draw-in, mono variant,
  favicon, mask icon, PNG icons and an OG card (`npm run brand`).
- UI primitives: Button, Card, ProgressRing/Bar, Skeleton, Kbd. Lazy routes with page transitions,
  HashRouter, custom 404.
- Production CSP injected at build time. Verified in Chromium against a `/Pythia/` base path with
  no console errors, in both themes.
- GitHub Actions: `ci.yml` (lint, typecheck, test, build) and `deploy.yml` (Pages, base path derived
  from the repo name).

Approximated / caveats
- The OG image falls back to a system serif because the rasteriser page doesn't load Instrument Serif.
- The landing page is a placeholder hero until Phase 2.
- The sandbox I build in cannot reach jsDelivr, so Pyodide-in-browser checks (Phase 3) use a locally
  served Pyodide core from npm; numpy/pandas/sklearn wheels cannot be verified in-browser here.

You need to do
- Enable GitHub Pages: repo **Settings → Pages → Source: GitHub Actions**. Merge to `main` to deploy.
