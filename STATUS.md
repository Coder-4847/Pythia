# Status

Honest running ledger: what is done, what is approximated, and what only you can do.

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
