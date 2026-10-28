# Pythia: project memory

A single, detailed hand-over note. Read this first when you come back to the project (or when a new Claude
session picks it up). It says what exists, what was decided and why, **what is deliberately not being done**,
and how to resume. `STATUS.md` is the phase-by-phase honesty ledger; this file is the "state of the world" summary.

Last updated: 2026-10-28, after Phase 9 and the first deploy.

---

## 1. What Pythia is

A web app for learning Python from `print()` to machine learning. Its signature feature is a **Socratic tutor**:
it predicts bugs before the code is run and answers with a guiding *question*, never the fix. A hint ladder
(nudge → question → concrete hint → full explanation) costs a little XP at each rung.

- Static site, runs entirely in the browser, hosted on GitHub Pages.
- **Live:** https://coder-4847.github.io/Pythia/
- **Repo:** https://github.com/Coder-4847/Pythia
- Brand: near-black ink `#0B0D10`, one Delphi-gold accent, muted green/red; Geist (UI), JetBrains Mono (code),
  Instrument Serif (headlines); an original serpent-bodied "P" logo with an eye counter.

## 2. Where things stand

| | |
|---|---|
| Build phases | All 9 done (see `PLAN.md`, `STATUS.md`) |
| Deployed | Yes: GitHub Actions → Pages, run succeeded on commit `9ff260a` (28 Oct 2026) |
| Branches | `main` (what deploys) and `ccr-cb70d0e4-pzj003` (my working branch). They pointed at the same commit when deployed |
| Lessons | **45** in 7 tracks, **180** exercises, each with visible + hidden tests |
| Tests | ~1 000 unit/content tests + 34 Playwright tests, all passing at deploy time |
| Lighthouse (lab) | accessibility 100, best practices 96, SEO 100, performance mostly 87–95 (typical 93; some runs 72–81) |
| Real users | None yet. Nobody but the author has used it. |

### Curriculum

| Track | Lessons | State |
|---|---|---|
| Foundations | 16 | complete |
| Data structures | 12 | complete |
| Intermediate Python | 4 (exceptions, raising errors, classes, generators) | preview; "Coming next": modules/imports, files, inheritance, decorators, type hints, testing |
| Algorithms & problem solving | 4 (recursion, binary search, sorting by hand, Big-O) | preview; next: BFS/DFS, dynamic programming, hash tables, interview challenges |
| Data science | 3 (NumPy, pandas, Matplotlib) | preview; next: cleaning, joins, time series, statistics |
| Machine learning | 3 (linear regression, classification, overfitting) | preview; next: logistic regression, scaling, clustering, neural net from scratch, capstone |
| Projects | 3 (text adventure, expense tracker, sales dashboard) | preview; next: CLI to-do app, web scraper, end-to-end ML classifier |

The remaining lessons only exist as names in `src/content/tracks.ts` (`roadmap`); they are shown to learners as
"Coming next". Nothing is hidden behind them.

---

## 3. What is deliberately NOT being done (read this section carefully)

These are decisions, not oversights. Don't "fix" them unless the owner says so.

### 3.1 No sign-in, no accounts, no Supabase (owner decision, 28 Oct 2026)

- The owner said: *"forget supabase, I'm too lazy and coding remotely right now, no sign in needed."*
- **No Supabase project exists.** The two repository secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are
  **not set**, so the production build is **guest-only**: no "Sign in" link anywhere, `/#/signin` shows
  "No account needed", the Profile page says "You're learning as a guest", the Privacy page says nothing is uploaded.
- Progress lives **only in the learner's browser** (IndexedDB). It is per browser and per device. Moving it means
  **Settings → Export / Import** (a validated JSON file).
- The account code (`src/sync/*`, `src/features/auth`, `src/features/account`, `supabase/migrations/0001_records.sql`,
  `e2e/cloud.spec.ts`, `e2e/fakeSupabase.ts`) is **still in the repo but dormant**. It costs nothing when unconfigured
  (the Supabase SDK is a separate chunk that is never loaded). It was tested only against a hand-written **fake**
  Supabase and a Postgres-in-process (PGlite); it has **never touched a real Supabase project**. OAuth, confirmation
  emails and `delete_my_account()` are unverified for real.
- If the owner ever wants it: follow `DEPLOY.md` section 3 (create project, run the SQL, set redirect URLs and
  providers, add the two secrets, redeploy). If the owner wants it *gone*: delete the folders/files above, the
  `AccountMenu` import and `CloudRedirects` in `src/app/Layout.tsx`, `AccountSection` in the Profile page, the `/signin`
  etc. routes, `@supabase/supabase-js` and `@electric-sql/pglite` from `package.json`, the cloud project and second
  web server in `playwright.config.ts`, and the "Accounts" paragraph in the Privacy page. That is a cleanup commit.

### 3.2 The AI layer is OFF

- Pythia's **local analysis is on**: `compile()`-level syntax questions, a vendored **pyflakes**, and ~20 beginner-trap
  rules (off-by-one, `=` vs `==`, mutable default arguments, discarded results, …), all running offline in the Pyodide worker,
  plus the plain-English error translator after a crash.
- The **optional Claude layer is not deployed**: there is no Cloudflare Worker, no Anthropic API key, and
  `VITE_AI_PROXY_URL` is **not set**. The editor status bar says "AI layer not set up: local checks only".
- The Worker code exists and is tested with a mocked Anthropic call (`worker/`, `DEPLOY.md` section 2), but the **live
  Claude call has never been run**. When deployed, its default model is `claude-haiku-5-5` (a cost decision I made;
  change `MODEL` in `worker/wrangler.toml`).
- Nothing the learner types is ever sent anywhere in the current deployment.

### 3.3 Other things that do not exist

- **No analytics, no error reporting, no tracking, no cookies.** The owner will not know when something breaks for a learner
  unless they are told.
- **No custom domain.** It is served from `coder-4847.github.io/Pythia/` (base path `/Pythia/`, derived by the workflow from the repo name).
- **No server of any kind.** No database, no backend, no rate limiting (nothing to rate limit).
- **No pull requests were opened.** `main` was created by branching from the working branch; all history is linear.
- **No human beta test.** I never played the 45 lessons as a beginner. They are machine-checked, not human-tested.
- **No real-device testing.** Everything ran in headless Chromium in a Linux sandbox. Safari, Firefox and phones have not been tried
  (the service worker has a "credentialless" code path for Firefox/Safari that is untested).
- **No screen-reader pass by a person.** Only automated axe-core checks (clean in both themes).
- **Roadmap lessons are not written** (see the table above).
- **No per-exercise timeout** for learner code: an infinite loop in an exercise freezes the tab's Python until the learner presses Stop.
- **Scientific packages have not been run in a real browser** (see 6.2).

---

## 4. How it works (architecture in brief)

- **Stack:** Vite 8, React 19, strict TypeScript 6, Tailwind 4 (CSS-variable tokens, `data-theme`), Zustand, react-router
  `HashRouter` (deep links work on Pages without rewrites), Framer Motion in strict `LazyMotion` (`m.*` only), GSAP + Lenis
  lazily on the landing page, CodeMirror 6, Dexie 4, zod, `@fontsource` fonts.
- **Python:** Pyodide 314 (CPython 3.14) in a module **Web Worker**. `src/workers/engine.ts` is worker-free and tested in Node
  against real Pyodide. `input()` and Stop use `SharedArrayBuffer` + `Atomics`; without cross-origin isolation the console
  falls back to a pre-typed stdin box, and Stop restarts the worker.
- **Python runtime source:** by default downloaded from **jsDelivr** (`cdn.jsdelivr.net/pyodide/v<version>/full/`) on first run;
  NumPy/pandas/Matplotlib/scikit-learn load from the same CDN via `loadPackagesFromImports` when code imports them.
  `VITE_PYODIDE_BASE=/pyodide/` self-hosts the core (used only for local e2e; the deployed site uses the CDN).
- **One service worker (`public/sw.js`, registered by `public/coi-register.js`)** does two jobs: adds COOP/COEP headers so
  `SharedArrayBuffer` works on GitHub Pages (first visit reloads once), and caches for offline use (app shell precached ~2.7 MB a few
  seconds after load; Pyodide + wheels cached on first use; network-first pages). The old `coi-serviceworker` dependency is gone.
  The build plugin `serviceWorkerPlugin` in `vite.config.ts` fills the precache list and a build hash into the built `sw.js`.
  In `npm run dev` the worker only adds headers (no caching).
- **Data:** IndexedDB (Dexie) is the source of truth. Tables: profile, settings, lessonProgress, attempts, drafts, quizResults,
  snippets, workspace, achievements (+ `outbox` and `meta`, used only by the dormant sync). Schemas in `src/data/schema.ts` (zod);
  export/import in `src/data/exportImport.ts` (versioned, validated, merge or replace with a preview).
- **Progress engine** (`src/engine/*`, pure and unit-tested): XP (20 per first-pass exercise, −2 per hint rung, 10 floor for the full
  explanation, +5 per quiz answer, +10 lesson bonus), levels, streaks, daily goal, 18-week heatmap, 19 achievements.
- **Pythia analysis:** `src/workers/pythia_analyze.py` (rules, levels 1/2/3 ↔ Quiet/Balanced/Chatty) and `translateError.ts`.
- **Lessons:** Markdown + a `.tests.ts` companion per lesson under `src/content/tracks/<track>/`; parser `src/content/parseLesson.ts`;
  test kinds `call`, `output`, `var`, `check` (+ helpers). Hidden tests and scripted stdin supported. See `CONTENT_GUIDE.md`.
- **CSP** is injected at build time (`vite.config.ts`); it allows self, jsDelivr, PyPI/pythonhosted, and (only if configured)
  the AI proxy and Supabase origins.

### Folder map

```
.github/workflows/   ci.yml (PRs and non-main pushes), deploy.yml (push to main → Pages)
public/              sw.js, coi-register.js, manifest, icons, og.png, vendor/ (pyflakes wheel), 404.html
scripts/             native_check.py (scientific-lesson verifier), generate-brand-assets.mjs, self-host-pyodide.mjs
src/app/             Layout (header, palette, shortcuts), routes
src/components/      ui primitives, brand/Logo
src/content/         tracks/, modules.ts, tracks.ts, parseLesson.ts, helpers.ts, content + runnables tests
src/data/            Dexie db, schema, repo, exportImport, syncStores, hooks, useStats
src/engine/          progress, stats, achievements (pure)
src/features/        landing, lessons, curriculum, dashboard, archive, achievements, profile, stats, settings, playground,
                     editor, pythia, runtime, palette, help, about, auth*, account*  (* dormant: see 3.1)
src/sync/            dormant account sync (engine, manager, remote, store)  (see 3.1)
src/workers/         pyodide.worker.ts, engine.ts, pythia_runtime.py, pythia_analyze.py
supabase/migrations/ 0001_records.sql (dormant)
worker/              Cloudflare Worker AI proxy (not deployed; see 3.2)
e2e/                 landing, lesson, playground, pythia, app, offline, a11y (+ cloud, fakeSupabase: dormant)
```

---

## 5. Deployment (how it ships)

- Push to **`main`** → `.github/workflows/deploy.yml`: `npm ci` → set up Python 3.13 and install numpy/pandas/scikit-learn/matplotlib in
  a venv (sets `PYTHIA_NATIVE_PYTHON`) → `npm run lint` → `npm test` → `npm run build` → upload → deploy to Pages.
  The run takes about a minute and a half.
- `BASE_PATH` is derived automatically (`/Pythia/`). The `VITE_*` secrets are passed through but empty, so the build is guest/local-only.
- **Pages source must stay "GitHub Actions"** (it is; the deploy succeeded).
- `ci.yml` runs the same checks plus Playwright on every pull request and every push to a non-`main` branch. The deploy workflow does **not**
  run Playwright, only lint + unit/content tests + build.
- To redeploy without a change: Actions tab → "Deploy to GitHub Pages" → Run workflow.
- **Rollback:** revert the commit on `main` and push; the next run redeploys. A broken service worker on a learner's browser can be removed
  by visiting the site and clearing site data (or `navigator.serviceWorker.getRegistrations()…unregister()` in the console).

## 6. Verification: what was actually checked, and what was not

### 6.1 Checked
- Every reference solution passes its tests in real Pyodide (Node) and every starter fails at least one test.
- Hints 1–2 never contain a line of the solution. Every runnable snippet and worked example executes (`src/content/runnables.test.ts`; 6 snippets
  deliberately fail and are listed in `SHOWS_AN_ERROR`).
- Pythia's own rules produce no level-1/2 diagnostics on any reference solution (false-positive sweep).
- The SQL migration (RLS, last-write-wins) on a real Postgres engine (PGlite). The sync engine with two simulated devices.
- Playwright (production builds): landing → lesson → run → complete, playground (input, Stop, multi-file, share links), Pythia rules,
  dashboard/archive/achievements/settings, command palette, **offline after one visit**, axe accessibility in dark and light.

### 6.2 Not checked (be honest about these)
- **The live deployed site has not been opened by me** (my sandbox cannot reach `github.io`). Only the Actions run result is known.
  First thing to do next session: open the URL, run `print("hi")` in the playground, and open one lesson.
- **Pyodide from the real CDN** (I used a local copy of the core in tests).
- **NumPy, pandas, Matplotlib, scikit-learn inside Pyodide in a browser.** The 10 scientific lessons were verified on a *native* Python 3.13
  (numpy 2.5, pandas 3.1, scikit-learn 1.9, matplotlib 3.11) through the same test-runner file; Pyodide ships slightly different versions
  (numpy 2.4, pandas 3.0, scikit-learn 1.8, matplotlib 3.10). Tests are written to tolerate version drift, but a Pyodide-specific difference
  would not have been caught. Plots in the console were never seen for these lessons.
- The AI proxy against the real Anthropic API; Supabase for real; OAuth; email links.
- Safari/Firefox/mobile browsers; real-device performance; the first-visit reload on slow networks.
- Whether the lessons are *good* teaching (difficulty, hint quality, wording).

## 7. Known issues and sharp edges

- **First visit reloads once** (service worker takes over to enable `SharedArrayBuffer`). Lighthouse counts that as a redirect, which is why
  performance varies run to run.
- **Learner infinite loops** in an exercise's test run have no timeout (Stop works; it is manual).
- **Offline:** browsers may evict the cache (Safari after ~7 days unused). The Python runtime is only cached if the learner ran code once while
  online; scientific packages only if they ran code importing them while online. Settings → Offline reports which state the browser is in.
- **Deferred loading:** saved settings load after first paint on the landing page (or at first click/keypress). A theme picked in that window wins
  over the saved one (fixed and unit tested). Deep links to other pages load saved state immediately.
- **Lighthouse variance** is bimodal (about 90 vs about 73) depending on whether lazy chunks land inside the measurement window.
- The `Layout` header's account menu and `CloudRedirects` render nothing when accounts are unconfigured.
- Privacy page text must stay truthful: today it says local storage only, Pyodide comes from jsDelivr, no analytics, AI layer optional.
  Update it **whenever** AI or accounts are switched on.
- `STATUS.md` older phase entries contain statements that were true at the time (e.g. "coi-serviceworker", "Phase 9 will…"); the Phase 9 entry
  and this file are authoritative.

## 8. How to work on it

```bash
npm install
npm run dev                    # http://localhost:5173
npm run lint && npm run typecheck
npm test                       # unit + content tests (scientific lessons are skipped without PYTHIA_NATIVE_PYTHON)
python3 -m venv .venv-sci && .venv-sci/bin/pip install numpy pandas scikit-learn matplotlib
PYTHIA_NATIVE_PYTHON=.venv-sci/bin/python npm test     # the full gate, as CI runs it
npm run e2e                    # Playwright against production builds (:4173 guest, :4174 fake-Supabase)
```

Habits that worked:
- Write pure logic + tests first, then UI, then run lint/typecheck/unit/e2e, then look at a screenshot, then update `STATUS.md`, then commit.
- Playwright: the pulsing Pythia dot is "not stable", so force actions on it. Page transitions keep the old page mounted briefly, so wait for the new
  page before locating shared elements (`.cm-content`). The first visit reloads, so poll for `crossOriginIsolated`.
- Don't `pkill -f <pattern>` from a command that contains the pattern; use `fuser -k 4173/tcp`.
- Commit messages in this project end with the `Co-Authored-By` and `Claude-Session` trailers.

### Adding a lesson
1. `src/content/tracks/<track>/NN-slug.md` + `NN-slug.tests.ts` (format: `CONTENT_GUIDE.md`); add a module in `src/content/modules.ts` if needed.
2. Remove it from that track's `roadmap` list in `src/content/tracks.ts`.
3. `npm test` (with `PYTHIA_NATIVE_PYTHON` for science lessons). Snippets are independent: don't use names from an earlier block.
4. Play it in `npm run dev` as a beginner would.

## 9. Sensible next steps (none of them is required)

1. Open the live site and smoke-test it (see 6.2). Have 2–3 real beginners try the first lessons; fix hints and difficulty from what they do.
2. Write the roadmap lessons (files, modules, inheritance, decorators are the likeliest to be wanted next).
3. Optionally turn on the AI layer: deploy `worker/` (needs a Cloudflare account and an Anthropic key), set the `VITE_AI_PROXY_URL` secret, redeploy.
   Set a monthly spend limit in the Anthropic console first.
4. Optionally add lightweight, privacy-respecting error reporting so breakage is visible.
5. Either enable accounts (3.1) or delete the dormant account code to shrink the repo.
6. Add a per-test timeout for learner code (terminate and restart the worker after N seconds).

## 10. Key decisions and the reasons behind them

- **Local-first, static hosting:** zero running cost and no data custody. Accounts and AI are optional layers that degrade silently.
- **Hash routing:** GitHub Pages cannot rewrite URLs.
- **A service worker for isolation:** Pages cannot send COOP/COEP; without them `input()` and Stop cannot work properly.
- **Questions, not fixes:** the product's point. Hint rungs cost XP, never streak.
- **Reference solutions are executed in CI:** content cannot ship with a broken exercise.
- **Haiku as the AI default:** Pythia could ask on every typing pause, so per-call cost matters more than depth (only relevant if 3.2 changes).
- **Light-theme gold darkened to `#855808`** to pass 4.5:1 contrast on tinted chips.
