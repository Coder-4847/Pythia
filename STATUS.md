# Status

Honest running ledger: what is done, what is approximated, and what only you can do.

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
- Found and fixed along the way: h1 words had no spaces for screen readers, low-contrast `dim` text,
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
