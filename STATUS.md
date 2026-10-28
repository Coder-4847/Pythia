# Status

Honest running ledger: what is done, what is approximated, and what only you can do.

## Phase 9 — content for tracks 3–7, offline, accessibility, performance, final QA ✅

Done
- **17 new lessons (67 exercises)**: Intermediate (exceptions, raising errors, classes, generators), Algorithms (recursion, binary
  search, sorting by hand, Big-O), Data science (NumPy, pandas, Matplotlib), Machine learning (linear regression, classification,
  overfitting), Projects (text adventure, expense tracker, sales dashboard). 45 lessons in all. Tracks 3–7 stay marked "Preview" and list
  their remaining lessons under "Coming next".
- **Verification of the scientific lessons.** NumPy, pandas, Matplotlib and scikit-learn can't be downloaded in my sandbox, so their reference
  solutions and starters run on a native Python 3.13 (numpy 2.5, pandas 3.1, scikit-learn 1.9, matplotlib 3.11) through the *same*
  `pythia_runtime.py` the browser loads (`scripts/native_check.py`). Tests are written to be robust to version drift (reference computed in
  the test, score ranges). CI installs the stack and sets `PYTHIA_NATIVE_PYTHON`.
- **Every runnable snippet is executed** (`src/content/runnables.test.ts`: 223 snippets across all lessons). This found a real bug in one of my
  new lessons (a snippet relied on code from the previous snippet). Snippets that fail on purpose are listed and must raise exactly that error.
  Pythia's own false-positive sweep also caught a rule firing on one of my solutions (`int(item)` on its own line), which I rewrote.
- **Offline / PWA.** One service worker (`public/sw.js`) now does both jobs: cross-origin isolation headers and caching. App shell precached
  (2.7 MB) *after* the page has loaded; Python runtime and wheels cached on first use; network-first pages; previous version kept for
  one generation. `coi-serviceworker` dependency removed. Browser test: load, run Python, go offline, reload, open a lesson, run Python.
  Settings → Offline tells the learner which state they are in.
- **Accessibility.** axe-core (WCAG 2.0/2.1 A and AA) over 15 pages in both themes is a test now. It found and I fixed: the search button's
  name not containing its visible text, text links distinguished by colour only, locked lesson cards faded below contrast, light-theme gold
  that fell just under 4.5:1 on tinted chips (darkened `#94640a → #855808`), and the Pythia settings button's name.
- **Performance.** Lighthouse (simulated mobile, headless Chromium, production build): accessibility 100, best practices 96, SEO 100,
  performance mostly **87–95** (typically 93; occasional runs 72–81). Cause of the spread: the first visit's one-time reload for
  cross-origin isolation and whether background chunks land inside the measurement window. Fixes this phase: saved-state loading, the
  achievement watcher and the offline precache all now wait until after load, and the 2.7 MB precache no longer competes with first paint.
- **Bug found by the accessibility test:** a theme picked in the first moments after load could be overwritten by the saved one; a theme the
  learner chose now always wins (unit tested).
- Tests: 1 001 unit/content tests, 34 Playwright tests (24 guest, 6 cloud, offline, 2 accessibility, plus the existing smoke test of
  landing → lesson → run → complete).

Approximated / caveats (the honest list, for the whole project)
- **Never run in a real browser against the real services:** the Pyodide CDN (I used a self-hosted core and a local mirror), packages
  loaded by `loadPackagesFromImports` (NumPy, pandas, Matplotlib, scikit-learn: the lessons are verified natively, not in Pyodide, so a
  Pyodide-specific difference would slip through), the live Claude call, Supabase (only a fake) and OAuth/email links.
- **Lesson quality has been machine-checked, not human-tested.** I verified that reference solutions pass, starters fail, hints don't leak, and
  every snippet runs; I did not sit through all 45 lessons as a beginner. Expect wording and difficulty fixes once real learners try them.
- Test runs have no timeout: a learner's infinite loop in an exercise would hang the tab until Stop (Stop works, but it is not automatic).
- The offline cache is browser-specific: it exists after a visit, is evicted if the browser clears site data, and Safari may evict it after
  about a week without use. Scientific packages are only available offline if the learner ran code importing them while online.
- Lighthouse numbers are lab numbers from a sandbox; real devices will differ.
- No analytics or error reporting exist, so I will not know when something breaks for a learner unless they tell you.
- Last-write-wins sync trusts device clocks (see Phase 8).

You need to do
- Everything in the earlier "You need to do" lists: enable Pages, deploy the Worker and set `VITE_AI_PROXY_URL`, create the Supabase project.
- Before launch, play through the lessons yourself or with a few real beginners; adjust hints and difficulty.

## Phase 8 — optional accounts and local-first sync ✅ (against a fake Supabase, not a live one)

Done
- **Works unconfigured.** Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` nothing account-related is downloaded or shown; the
  auth pages explain there is no account, and the Privacy page says nothing is uploaded. Configured, the Supabase SDK is its own
  lazily loaded chunk.
- **Auth:** sign up, sign in, forgot / reset password, GitHub and Google OAuth, continue as guest, sign out, delete account. PKCE
  flow (the default implicit flow returns tokens in `#…`, which the hash router would swallow). Plain-language errors; sign-in and
  reset never reveal whether an email has an account; passwords ≥ 8 characters.
- **Database:** `supabase/migrations/0001_records.sql`: one generic `records` table, Row Level Security on every operation, a
  last-write-wins trigger (a stale upsert is skipped, accepted writes get a new `seq`), `delete_my_account()`. **Run against real
  Postgres (PGlite) in unit tests**: cross-user read/write/update/delete are blocked, anon sees nothing, stale writes lose, tombstones
  are consistent. I checked the tests are not vacuous by removing RLS and the trigger and watching them fail.
- **Sync engine** (`src/sync/engine.ts`, injected `Remote`): Dexie v2 adds `outbox` and `meta` tables; hooks queue one entry per changed
  record; push in batches, pull by `seq` cursor with validation (every cloud row is re-parsed with its zod schema and its key checked);
  cloud-applied writes are muted so they don't echo back; deletes are tombstones; `reset` and replace-import are queued as deletions.
  14 unit tests simulate two devices and an in-memory cloud: convergence, newest edit wins both ways, deletion vs newer edit, offline
  queue, an edit made during an upload stays queued, 1 200-row paging, hostile or invalid rows dropped.
- **First sign-in:** a device with no progress simply follows the account. A device that already has progress is asked once: combine
  (newer wins per item), use the account's copy only, or not now (and can be turned on later from Profile).
- **UI:** header account menu with a live sync status (synced / syncing / offline with N pending / trouble), Profile "Your account"
  section, honest confirmation texts for reset and import when signed in.
- **Browser tests** (`e2e/cloud.spec.ts`, 6 tests) run the real production build against `e2e/fakeSupabase.ts`, an in-memory stand-in for
  GoTrue + the `records` table: sign-up/in errors, email-confirmation and reset messages, two-device propagation, all three first-sign-in
  answers, offline queue then recovery, server failure then recovery, sign-out keeps local data, delete account.
- Bug fixed on the way: a freshly auto-created default profile now has `updatedAt: 0` so it can never beat a profile the learner edited.

Approximated / caveats
- **Never run against a live Supabase project.** The SQL is tested on real Postgres and the browser client against a hand-written fake of
  GoTrue/PostgREST; where my fake and the real services differ (response shapes, error strings, rate limits), I won't know until you try it.
  Specifically unverified: OAuth round-trips, the confirmation / recovery email links (the PKCE `?code=` return and the
  `PASSWORD_RECOVERY` redirect), and `delete_my_account()` on Supabase itself.
- Last write wins by the *device's* clock; there is no live push (other devices see changes within about a minute or on "Sync now");
  `seq` is assigned in accept order, not commit order, so a concurrent writer could in theory be skipped until that item changes again.
- Opening an email-confirmation link on a different device confirms the address, but the learner has to sign in there.
- Playwright's Chromium dropped a body-less `204` answer to a cross-origin POST in my fake, so the fake answers `delete_my_account` with
  `200 null`; real PostgREST returns 204 for a void function, which browsers handle.
- No account-recovery path if a learner loses both their password and email access (standard for Supabase; nothing custom).

You need to do
- Create the Supabase project, run the migration, set URLs and providers, add the two repository secrets: DEPLOY.md section 3.

## Phase 7 — dashboard, archive, achievements, profile, stats, settings ✅

Done
- **Pure engines with tests** (`src/engine/stats.ts`, `achievements.ts`, `src/lib/diff.ts`, `fuzzy.ts`): streaks, daily-goal
  progress, an 18-week heatmap, 30-day XP, help-used distribution, per-track attempts and pass rate, and 19 achievements that
  reward habits and persistence, never speed. All derived from stored attempts, so every device computes the same numbers.
- **Pages** (all lazy routes): Dashboard (continue card, streak, goal ring, level, heatmap, tracks, recommended next, empty
  state), Archive (search by lesson *or the code you wrote*, status and track filters; per-lesson attempt timeline, view
  code, first-vs-latest diff), Achievements (a watcher stores unlocks in IndexedDB and shows one toast), Profile, Statistics
  (accessible SVG chart with a hidden data table), full Settings (theme, reduced motion, font size, Vim, Pythia intensity,
  AI switch, name, daily goal, plus export / import / reset), About, Privacy, Changelog.
- **Navigation**: new header (main links on desktop, everything in the menu on mobile), command palette (Ctrl/⌘ K: lessons,
  pages, actions; native `<dialog>`, ARIA combobox), shortcuts overlay (`?`).
- Bug found by the new e2e test and fixed: **theme changes were silently dropped** when another setting changed within 300 ms,
  because both shared one debounce; patches are now merged before the write (`src/data/syncStores.ts`).
- Visual fixes after screenshots: continue card broke on phones, settings pills had gold text on gold, header overflowed on mobile.
- Tests: 705 unit tests; 23 Playwright tests (5 new: every page renders without errors, empty states, palette and shortcuts,
  settings persist across reload, first attempt → dashboard / archive diff / achievement).

Approximated / caveats
- The Privacy page describes the app as it is today (local storage, optional AI proxy, jsDelivr for Pyodide, no analytics). Phase 8
  must update it when accounts exist.
- Profile says "guest, no account"; cloud accounts arrive in Phase 8.
- Achievements are only evaluated while the app is open; they are derived data, so an unlock is never lost, just recorded late.
- Accessibility audit of these pages: done in Phase 9 (automated). A screen-reader pass by a person has not been done.
- Statistics and the dashboard have only been looked at with one learner's worth of data (two attempts); heavy-use layouts are untested.

## Phase 6 — Pythia: local analysis, presentation, AI proxy ✅

Done
- **Local analysis** (`src/workers/pythia_analyze.py`, runs in the Pyodide worker, offline): `compile()`-level syntax errors
  translated into questions (9 patterns plus a fallback), **pyflakes** (vendored wheel, unpacked straight into Pyodide, no
  micropip or network needed) for undefined names, local-before-assignment, unused variables/imports and redefinitions, and
  **~20 beginner-trap rules**: off-by-one (`range(1, 10)` beside "1 to 10", `range(len(x) + 1)`, `x[i + 1]`,
  `while i <= len(x)`), `=` vs `==`, `is` with literals, a comparison used as a statement, mutating a list while looping,
  missing return, using the result of a function that returns nothing, wrong argument count, mutable default arguments,
  `/` where a whole number is needed, `//` in averages, divide by zero, shadowed built-ins, unreachable code,
  `input()` text used as a number, text + number, `x = x.append()`, a method named but not called, a discarded
  string-method result, an unused expression, loops that can never end.
- Every diagnostic carries a **question** (always ends in `?`), a concrete **hint** and a full **explanation**, plus a level
  (1 certain crash, 2 likely bug, 3 tidiness). **Quiet / Balanced / Chatty** show level 1 / ≤2 / ≤3.
- **Presentation**: a softly pulsing gutter dot and tinted line (they move with the text as you type), a card on hover,
  click or `Ctrl/⌘ + .`, ladder inside the card (question → hint → "I'm stuck"), "Not now", a live-region announcement for
  screen readers, and a status bar with the intensity menu and AI switch. In exercises, revealing a hint or the explanation
  counts toward the exercise's hint level (XP, never streak).
- **Error translation**: after a crash the console shows the raw traceback plus "In plain English": a headline and a guiding
  question for 25 families of errors (NameError, TypeError variants, IndexError, KeyError, ValueError, ZeroDivisionError,
  RecursionError, ModuleNotFoundError, EOFError, syntax and indentation errors, and more). Deterministic and offline.
- **AI layer**: the browser asks only when local checks found nothing for this exact code, after ~1.5 s idle, at most once per
  8 s and 20 times per 10 minutes, with an LRU cache by code+goal hash, abort on new typing, a 60 s silent back-off after any
  failure, and answers validated with zod (only questions with confidence ≥ 0.6 are shown; anything containing a code fence or
  no question mark is dropped). Without a proxy URL it never calls out.
- **Cloudflare Worker** (`worker/`): holds the Anthropic key as a secret, official `@anthropic-ai/sdk` streaming, SSE out,
  Origin allow-list, body/field size limits, per-IP per-minute and per-day limits (KV, with an in-memory fallback), upstream
  errors never forwarded, aborts the upstream call when the client disconnects, model name configurable (`MODEL`).
  `wrangler.toml` and `DEPLOY.md` (Pages + Worker) written.
- Tests: 228 analysis cases against real Pyodide (47 "should flag", 34 "must stay quiet", and a false-positive sweep over every
  lesson solution and worked example), 27 error-translation, 36 AI-client, Worker tests (validation, prompt-injection defanging, CORS, rate limits, upstream errors, streaming, abort), and 6 Playwright tests in a real browser.

Fixed along the way
- The gutter's invisible spacer was drawn as a dot too (caught by the e2e test counting dots).
- A hover card could vanish while the learner was reading it; it now pins on any interaction.

Approximated / caveats
- **The live AI call is untested.** I have no Anthropic key or network path to the API here. The Worker is tested with a fake
  streaming function and typechecks against the real SDK types; the request shape (`messages.stream`, `output_config.effort`)
  follows the SDK docs. The prompt, its tuning, and the real model's answers have never been run. Expect to adjust.
- **Default model is `claude-haiku-5-5`**, chosen by me for cost (Pythia may ask on every pause). It is one line in
  `worker/wrangler.toml`; sharper questions need a bigger model. This is your decision to make.
- Heuristic rules can be wrong. The sweep shows they stay quiet on all 28 lessons' correct code and the 34 near-miss
  examples, but real learners will write code I haven't seen. Level-2 rules are the most likely to misfire.
- Local analysis needs Python loaded, so for the first seconds after opening a page nothing is flagged. It also skips while a
  program is running.
- The `range-last` rule works from text in the program ("1 to 10"). Otherwise the AI layer is what notices intent mismatches.
- The AI proxy's rate limiting is a spend guard, not exact (see DEPLOY.md).
- Pythia is not attached to the small runnable snippets inside lesson text (by design, to keep lessons light).

## Phase 5 — Tracks 1 and 2 content ✅

Done
- **28 lessons, 113 exercises, 84 quiz questions**, all in the Markdown format from `CONTENT_GUIDE.md`.
  - *Foundations (16):* first program, variables, types, arithmetic, strings, string methods and f-strings, input/output,
    comparisons, if/elif/else, and/or/not, while, for/range, break/continue/nested loops, defining functions, return
    values, scope and default arguments.
  - *Data structures (12):* lists, list methods and slicing, looping over lists, sorting and zip, tuples and unpacking,
    dictionaries, looping over dictionaries, nested data, sets, list comprehensions, dict and set comprehensions,
    choosing the right container.
- Every exercise has visible and hidden tests, a 3-rung hint ladder, and a full explanation. Hidden tests re-run the
  learner's code with different values (`rerunOutput` / `rerunVar`), so hard-coding an answer doesn't pass.
- **The quality gate runs all of it in real Pyodide** (312 content tests): each reference solution passes every test,
  each starter fails at least one, hints 1–2 never contain a solution line, diagrams parse, structure rules hold.
- Test-runner additions: scripted `input()` echoes the answer and Enter like the console (so prompts and answers sit on
  separate lines), `lastLine` (ignores prompt wording), `rerunOutput`, `rerunVar`, `callPrints`, keyword arguments in
  `call`, and `dictOf` for dictionaries with non-string keys.
- 397 unit tests and 12 Playwright tests pass. The curriculum page shows all 28 lessons with progress states.

Fixed along the way
- A JSON `true` leaked into generated Python (helper now passes values through `json.loads`). Lesson 13 had a meaningless
  hidden test, removed.

Approximated / caveats
- I wrote and verified these lessons programmatically, but I have not played through every lesson by hand in the browser;
  only "Your first program" and "Variables" are covered end to end by Playwright. Expect small wording or difficulty
  tweaks once real learners try them.
- Difficulty is my judgement: some later exercises (e.g. `top_n`, `group_by_length`, the capstone) may be a stretch for
  true beginners; the hint ladder is the safety net.
- Tests cannot detect style (e.g. a learner who hard-codes a loop count that the hidden tests happen not to vary).
- Test runs still have no time limit (see Phase 4).

## Phase 4 — lessons, tests, progress, persistence, import/export ✅

Done
- **Content format** (`CONTENT_GUIDE.md`): a lesson is a Markdown file (concept, worked example, 2–5 exercises with
  starter/solution/3-rung hints/explanation, quiz) plus a `.tests.ts` file. A strict parser fails with file-named errors.
  Markdown renders to React elements (no HTML injection); `diagram` fences draw animated boxes / strips / flows.
- **Test runner** (in the Pyodide worker): `call` / `output` / `variable` / `check` tests, hidden tests, scripted `input()`,
  a fresh program run per test, float tolerance, `True != 1`, and generated friendly messages ("returned `None`: is there a
  `return`?", "line 2 of the output should be …"). 21 engine tests against real Pyodide.
- **Lesson page** (`#/lesson/:id`): Learn → Example → Exercises → Checkpoint stepper, editor + console + tests, hint ladder
  (nudge → question → concrete hint → "I'm stuck" explanation, each costing a little XP), live inline snippets, autosaved drafts,
  resume where you left off, celebration burst, completion screen.
- **Progress engine** (pure, 17 tests): XP (first pass only; hints cost 2 XP each, floor of 10), levels, streaks, per-day
  activity, lesson status/percent, soft "recommended later" locking, next-lesson recommendation.
- **IndexedDB (Dexie)** is the source of truth: profile, settings, lesson progress, attempts, drafts, quiz results, snippets,
  playground workspace, achievements. Settings and playground files now persist and hydrate at startup.
- **Export / import** (zod-validated, versioned, with a migration hook): preview table of what changes, merge (last-write-wins
  per item) or replace, atomic apply, size cap, readable errors; **Reset all data**. Lives on `#/settings` for now.
- **Curriculum page** (`#/learn`): continue card with progress ring, tracks → modules → lessons path with completed /
  in-progress / ready / recommended-later states, roadmap cards for empty tracks.
- Two real lessons ("Your first program", "Variables") in the new format. The content test runs every reference solution
  through the real runner and checks every starter fails.
- 106 unit tests, 12 Playwright tests (incl. landing → lesson → fail → hint → pass → quiz → complete → reload, and
  export → reset → import).

Fixed along the way
- My own first hint leaked the answer (caught by the content test). Duplicate `h1` on the completion screen. Inline code inside
  bold rendered with literal backticks. Lesson pages now warm up Python on open.

Approximated / caveats
- Only 2 of the ~30 Track 1–2 lessons exist; the other 28 are Phase 5. The curriculum shows modules once they have lessons.
- Lessons that need NumPy/pandas/etc. can't be executed by the Node content test (CDN wheels); they'll be verified with native
  Python instead (Phase 9).
- Test runs have no time limit: an infinite loop in a learner's solution is stopped with the Stop button (which restarts the
  worker if needed), not automatically.
- "Locked" is a recommendation only; every lesson can be opened.
- The Settings page currently contains only the data-management section (full settings arrive with Phase 7).
- Achievements table exists but nothing unlocks yet (Phase 7). Pythia hints in the lesson are the static ladder; live bug
  prediction is Phase 6.

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
