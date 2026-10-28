# Pythia

> The AI Python tutor that sees your bugs coming.

Pythia teaches Python from `print()` to machine learning. You write real Python in the browser; Pythia
watches as you type, predicts likely bugs *before* you run the code, and answers with a guiding
**question, never the fix**. A hint ladder (nudge → question → concrete hint → explanation) costs a little
XP at each rung, so asking for help is allowed but never free.

Everything runs client-side and ships as a static site on GitHub Pages. The AI layer and cloud sync are
optional and light up only when you configure them; without them the app is complete.

**Status:** all nine build phases are done. See [`STATUS.md`](STATUS.md) for exactly what is verified, what
is approximated and what only you can do (Supabase project, deploying the Worker, enabling Pages).

## What's in it

- **Python in your browser.** CPython (Pyodide) in a Web Worker: `input()` that waits for you, a Stop button
  that really stops, multi-file programs, and Matplotlib plots in the console. NumPy, pandas, Matplotlib and
  scikit-learn load from the Pyodide CDN the first time a program imports them.
- **Pythia.** About 20 local bug-prediction rules plus pyflakes run offline in the worker; an optional Claude
  layer (through a Cloudflare Worker that holds your API key) asks smarter questions when the local checks are
  quiet. After a crash the console translates the error into plain English and a question.
- **A curriculum of 45 lessons across seven tracks.** Foundations (16) and Data structures (12) are complete;
  Intermediate (4), Algorithms (4), Data science (3), Machine learning (3) and Projects (3) are working previews
  with their remaining lessons on a visible roadmap. Every exercise has visible and hidden tests that run in the
  browser, and every reference solution is verified in CI.
- **Your progress.** XP, levels, streaks, a daily goal, an activity heatmap, 19 achievements, an archive of every
  attempt with first-vs-latest diffs, statistics, export/import (validated, merge or replace, with a preview).
- **Works offline** after one visit (a service worker saves the app and the Python runtime) and can be installed
  as an app.
- **Optional accounts** (Supabase): email/password, GitHub and Google, with local-first last-write-wins sync.
- Command palette (Ctrl/⌘ K), keyboard shortcuts (`?`), light and dark themes, reduced-motion support,
  WCAG 2.1 AA checked by automated tests in both themes.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + content tests (see "Testing" for the scientific lessons)
npm run lint
npm run build      # type-check + production build into dist/
npm run e2e        # Playwright against production builds
```

Copy `.env.example` to `.env.local` to configure the optional AI proxy and Supabase. Without them the app
runs in guest, local-only mode.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (the service worker only adds isolation headers here; no caching) |
| `npm run build` | `tsc -b`, then the production build; set `BASE_PATH=/repo/` for a project Pages site |
| `npm run preview` | Serve `dist/` |
| `npm test` | Vitest: unit tests, the content quality gate, the SQL migration on a real Postgres (PGlite) |
| `npm run e2e` | Playwright: guest build on :4173, plus a build wired to a fake Supabase on :4174 |
| `npm run brand` | Regenerate PNG icons and the OG image from the SVG mark |
| `npm run pyodide:local` | Copy the Python core into `public/pyodide` for a CDN-free build (`VITE_PYODIDE_BASE=/pyodide/`) |

## Testing

| What | Where | Notes |
|---|---|---|
| Pure logic: progress, stats, achievements, import/export, sync engine, AI client, Pythia rules | `src/**/*.test.ts` | fast |
| Every lesson: structure, hints, reference solutions, starters, and every runnable snippet | `src/content/*.test.ts` | runs real Pyodide in Node |
| Scientific lessons (NumPy, pandas, scikit-learn, Matplotlib) | same files | need `PYTHIA_NATIVE_PYTHON`, see [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) |
| The Supabase migration: RLS, last-write-wins | `src/sync/migration.test.ts` | PGlite, no Docker |
| The AI proxy Worker | `worker/src/worker.test.ts` | |
| End to end: landing → lesson → run → complete, Pythia, playground, accounts, offline, accessibility | `e2e/*.spec.ts` | production builds |

## Architecture in one paragraph

Vite + React 19 + strict TypeScript, Tailwind 4 design tokens, Zustand, a hash router (so deep links work on
GitHub Pages with no rewrites), Framer Motion in strict `LazyMotion` mode, GSAP/Lenis lazily on the landing page.
CodeMirror 6 for editing. Python runs in a Web Worker (`src/workers/engine.ts` is worker-free and tested in
Node). Dexie (IndexedDB) is the source of truth; Supabase, when configured, is a mirror reached only through
`src/sync`. Lessons are Markdown plus a TypeScript tests file. Details and the folder map are in [`PLAN.md`](PLAN.md).

## Documents

- [`DEPLOY.md`](DEPLOY.md): GitHub Pages, the AI Worker, Supabase, offline behaviour.
- [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md): how to write a lesson, and the quality gate.
- [`STATUS.md`](STATUS.md): the honest ledger, phase by phase.
- [`PLAN.md`](PLAN.md): architecture and phases.

## Licence notes

The pyflakes wheel in `public/vendor` is MIT licensed (see its README). The service worker's isolation trick
is adapted from `coi-serviceworker` (MIT). Fonts are Geist, JetBrains Mono and Instrument Serif via
`@fontsource` (SIL OFL).
