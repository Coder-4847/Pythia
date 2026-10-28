# Pythia — Plan

Pythia is an AI Python tutor that predicts bugs before you run the code and answers with
a guiding question, never the fix. Everything runs client-side where possible and ships as
a static site on GitHub Pages.

## Architecture

```
┌────────────────────────── browser ──────────────────────────┐
│  React UI (Vite, TS strict, Tailwind, Zustand, HashRouter)   │
│    ├─ Editor (CodeMirror 6) ── diagnostics/gutter ◄──┐       │
│    ├─ Pythia engine ─────────────────────────────────┤       │
│    │    layer 1: local rules (worker: compile, pyflakes, AST)│
│    │    layer 2: AI (idle 1.5 s, hash cache, throttle)──┐    │
│    ├─ Runtime client ──postMessage──► Pyodide Worker    │    │
│    │      (SharedArrayBuffer via the sw.js worker:      │    │
│    │       input() + interrupt; fallback = restart)     │    │
│    ├─ Progress engine (pure TS) ◄─► Dexie (IndexedDB)   │    │
│    └─ Sync (Supabase, LWW per item, offline queue)      │    │
└─────────────────────────────────────────────────────────┼────┘
                                                          ▼
                    Cloudflare Worker (holds Anthropic key, SSE, rate limit)
```

Principles

- **Local-first.** Dexie is the source of truth. Supabase/AI are optional and the app
  degrades silently when they are missing.
- **Content is data.** Lessons are typed TS modules (`src/content/**`) validated at build
  time by a Vitest test; format documented in `CONTENT_GUIDE.md`.
- **Pure core, thin UI.** Progress engine, analysis rules, export/import and test-result
  formatting are pure functions with unit tests.
- **User code only runs in the worker.** Strict CSP, all rendered markdown sanitised.

## Folder structure

```
.github/workflows/      deploy.yml (build+test+Pages), ci.yml
public/                 favicons, manifest, sw.js (isolation + offline), OG image
worker/                 Cloudflare Worker (AI proxy) + wrangler.toml
supabase/migrations/    SQL + RLS
src/
  app/                  router, layout, providers, route transitions
  components/ui/        design-system primitives (Button, Card, Ring, ...)
  components/brand/     Logo, Wordmark, animated mark
  features/
    landing/            hero, scroll sections
    editor/             CodeMirror setup, theme, Pythia extensions
    runtime/            worker client, console, plots
    pythia/             analysis rules, AI client, hint ladder, traceback translator
    lessons/            lesson page, runner, quiz
    curriculum/         track map
    dashboard/ archive/ achievements/ profile/ settings/ playground/ auth/
  content/              tracks/<track>/<module>/<lesson>.ts
  data/                 Dexie schema, migrations, repositories, export/import (zod)
  engine/               progress, XP/levels, streaks, achievements (pure)
  sync/                 Supabase client, queue, LWW merge
  stores/               Zustand stores
  styles/               tokens.css, tailwind layers
  workers/              pyodide.worker.ts
e2e/                    Playwright smoke test
```

## Phases

| # | Scope | Exit criteria |
|---|-------|---------------|
| 1 | Scaffold, design tokens, logo, CI/CD to Pages | `build`, `lint`, `test` green; shell renders in browser |
| 2 | Landing page (auto-typing hero, scroll sections) | Visual check; reduced-motion variant |
| 3 | Pyodide worker, editor, console, playground | Run code, input(), plots, stop |
| 4 | Lesson engine, test runner, progress, autosave, export/import | Unit tests for engine + import/export |
| 5 | Tracks 1–2 content (~30 lessons with tests) | Every reference solution passes its tests (verified in Pyodide) |
| 6 | Pythia local rules → AI proxy | Rule unit tests; worker + deploy docs |
| 7 | Dashboard, archive, achievements, profile, stats, settings | Visual check |
| 8 | Supabase auth + sync | SQL + RLS; works unconfigured |
| 9 | Tracks 3–7 sample content, PWA, a11y/perf, final QA | Playwright smoke green |

## Honesty ledger

Tracked in `STATUS.md` at the end of each phase: what is done, what is approximated, and
what the owner must do (Supabase project, GitHub secrets, Worker deploy, enabling Pages).
