# Deploying Pythia

Pythia is a static site. Everything below the first section is **optional**: the app works fully
without the AI layer (Pythia falls back to its local checks) and without cloud sync.

| Part | Needed? | Where it runs |
|---|---|---|
| The site | yes | GitHub Pages |
| AI layer (Pythia asks smarter questions) | optional | Cloudflare Worker (holds your Anthropic key) |
| Accounts and sync | optional | Supabase (auth + one table with Row Level Security) |

---

## 1. GitHub Pages

1. Push the repository to GitHub (the workflow lives in `.github/workflows/deploy.yml`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Merge to `main`. The workflow lints, tests, builds and deploys. The site appears at
   `https://<owner>.github.io/<repo>/`.

The base path is derived from the repository name by the workflow (`/<repo>/`, or `/` for a
`<owner>.github.io` repository), so forks deploy without edits. Routing uses the URL hash, so deep
links such as `/#/lesson/variables` work without any server rewrite.

### Optional build-time settings

Add these under **Settings → Secrets and variables → Actions → Secrets** (they are baked into the
public bundle, so none of them may be secret; the names say "secrets" because the workflow reads them that way):

| Name | Value |
|---|---|
| `VITE_AI_PROXY_URL` | the Worker URL from section 2, no trailing slash |
| `VITE_SUPABASE_URL` | the project URL from section 3, like `https://abcd1234.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the project's `anon` public key from section 3 |

Leave unset to build in local-only mode.

### Python runtime

By default the Python runtime loads from the jsDelivr CDN (`https://cdn.jsdelivr.net/pyodide/v<version>/full/`),
the version matching the installed `pyodide` package. Learners' browsers cache it after the first visit.
To self-host instead, put a full Pyodide distribution on your site and build with
`VITE_PYODIDE_BASE=/pyodide/` (the URL must end with `/`). `npm run pyodide:local` copies only the
core interpreter (enough for pure Python, not for NumPy and friends).

### Cross-origin isolation

`input()` and the Stop button rely on `SharedArrayBuffer`, which needs cross-origin isolation. GitHub
Pages cannot send the required headers, so `public/coi-serviceworker.js` adds them. The first visit
reloads once while that service worker installs. Browsers that block service workers (some private
modes) still work: input is then typed into a box before running, and Stop restarts Python.

---

## 2. The AI layer (Cloudflare Worker)

The browser never sees your Anthropic API key. Pythia's idle-time questions go through a small
Worker (`worker/`) that holds the key, validates and rate-limits requests, and streams the answer back.

### What it does

- `POST /v1/pythia` with `{code, goal?, recentError?}` → Server-Sent Events (`data: {"t":"…"}`, then `data: {"done":true}`).
- Allows only the origins you list (`ALLOWED_ORIGINS`); rejects everything else with 403.
- Limits request size (8 000 characters of code) and rate per client IP (per minute and per day).
- Never logs or stores learners' code. Upstream error text is never forwarded to the browser.
- The model is told to ask at most one question and never to reveal the fix, and to treat the code as data.

### Deploy

You need a Cloudflare account and an [Anthropic API key](https://console.anthropic.com/).

```bash
cd worker
npm install

# 1. Allow your site. Edit wrangler.toml → ALLOWED_ORIGINS, e.g.
#    ALLOWED_ORIGINS = "https://<owner>.github.io,http://localhost:5173"
#    (origin only: scheme + host, no path, no trailing slash)

# 2. Store the key as a secret (it is never written to a file).
npx wrangler secret put ANTHROPIC_API_KEY

# 3. Optional but recommended: shared rate limiting across Worker instances.
npx wrangler kv namespace create RATE
#    paste the printed id into the commented [[kv_namespaces]] block in wrangler.toml and uncomment it

# 4. Deploy.
npx wrangler deploy
```

Wrangler prints the Worker URL, like `https://pythia-ai-proxy.<you>.workers.dev`. Put it in the
`VITE_AI_PROXY_URL` secret from section 1 (and in `.env.local` for development), then redeploy the site.

Local development: create `worker/.dev.vars` containing `ANTHROPIC_API_KEY=sk-ant-…`, run
`npx wrangler dev` in `worker/`, and set `VITE_AI_PROXY_URL=http://localhost:8787` in `.env.local`.

### Choosing the model and its cost

`MODEL` in `wrangler.toml` is any Claude 5.x model ID. It defaults to **`claude-haiku-5-5`**, chosen because
Pythia may ask a question every time a learner pauses typing, so cost per call matters more than depth
here. That default is a cost decision made for you: for sharper questions set `MODEL = "claude-sonnet-5-5"` or
`"claude-opus-5-5"` and redeploy. Check current prices before choosing.

Spend is bounded in three layers: the browser asks at most once every 8 s and 20 times per 10 minutes per tab,
only when the local checks found nothing, and caches answers per code version; the Worker limits each IP
(`RATE_LIMIT_PER_MIN`, default 12; `RATE_LIMIT_PER_DAY`, default 300); and a request carries at most 8 000
characters of code and asks for a short answer.

### Honest limits

- KV is eventually consistent and the counter is read-then-write, so rate limiting is a spend *guard*,
  not an exact guarantee. For strict limits use a Durable Object or Cloudflare's Rate Limiting rules.
- The `Origin` check stops other websites from using your proxy from a browser. It cannot stop someone
  calling it with a script that fakes the header, which is what the rate limits are for. Set a monthly
  spend limit in the Anthropic console as the final backstop.
- Learners' code is sent to Anthropic when the AI layer is on. The app lets them switch it off at any time
  (Pythia's status bar → intensity menu → AI layer), and the privacy page says so.

---

## 3. Accounts and sync (Supabase)

Accounts are optional. Without them the app is guest-only and loads none of the account code. With
them, a learner can sign in (email + password, GitHub or Google) and their progress follows them to
other devices. IndexedDB in the browser stays the source of truth; Supabase is a mirror.

### Create the project

1. Create a project at [supabase.com](https://supabase.com) (the free tier is plenty).
2. **SQL editor → New query**, paste the whole of `supabase/migrations/0001_records.sql`, **Run**. It creates
   one table (`records`), turns on Row Level Security so each signed-in user can only touch their own rows,
   adds the last-write-wins trigger, and adds `delete_my_account()` (used by the profile page's "Delete
   account" button). The migration is exercised against a real Postgres (PGlite) in `src/sync/migration.test.ts`.
3. **Authentication → URL configuration**
   - **Site URL**: your deployed site, with its base path, e.g. `https://<owner>.github.io/<repo>/`.
   - **Redirect URLs**: add the same URL, and `http://localhost:5173/` for development. The app returns to
     the site root after OAuth, email confirmation and password recovery, then routes the learner itself.
4. **Authentication → Sign In / Providers**
   - **Email** is on by default. Set the minimum password length to 8 to match the app. Leave "Confirm email" on
     (recommended); the app handles both settings.
   - **GitHub** / **Google** (optional): create an OAuth app with each provider, paste its client id and secret,
     and register the callback URL Supabase shows (`https://<ref>.supabase.co/auth/v1/callback`). An unconfigured
     provider shows the learner "That sign-in method isn't turned on for this site".
5. **Project settings → API**: copy the **Project URL** and the **anon public** key.

### Connect the site

- Production: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets (section 1) and redeploy.
- Development: put both in `.env.local`.

The anon key is public by design. What protects data is Row Level Security, not the key's secrecy. **Never** put
the `service_role` key in the app or in a `VITE_` variable.

### What syncs, and how

Everything a learner creates (progress, attempts with their code, quiz results, drafts, snippets, playground
files, achievements, name, goal, settings) is one row per item in `records`. Each browser keeps an outbox of
changes and uploads them after a short pause, when it comes back online, when the tab is shown again and
every minute; it downloads whatever has a newer server sequence number than the last time. For an item that
exists in both places, the newer `updatedAt` wins, and deletions travel as tombstones. The first time a device
that already holds progress signs in, the learner chooses to combine, to take the account's copy, or to wait.

### Honest limits

- **Last write wins by the device's clock.** A device with a badly wrong clock can overwrite or lose to
  another. Items are small and independent, so the damage is one item, never the whole account.
- **No live push.** Another device's change appears within about a minute (or at "Sync now"), not instantly.
- **Concurrent writers can skip a row in a pull.** The server numbers writes in the order they are accepted, not
  committed; two devices writing in the same instant could in theory make a third skip one until that item is
  changed again. It is cheap to repair with "Sync now" after a reset, and unlikely for a single learner.
- **Email limits.** Supabase's built-in mailer allows only a few messages per hour. For a real launch, configure
  custom SMTP (Authentication → SMTP Settings).
- **Opening a confirmation link on another device** confirms the email, but the learner then has to sign in
  there (the sign-in code from the link is tied to the browser that asked for it).
- Whoever administers the database can read what is stored. The privacy page says so.
- `delete_my_account()` removes the auth user and, through the foreign key, every row. It has been tested
  against Postgres in the unit tests and against a fake Supabase in the browser tests, but not against a live
  Supabase project.
