# Deploying Pythia

Pythia is a static site. Everything below the first section is **optional**: the app works fully
without the AI layer (Pythia falls back to its local checks) and without cloud sync.

| Part | Needed? | Where it runs |
|---|---|---|
| The site | yes | GitHub Pages |
| AI layer (Pythia asks smarter questions) | optional | Cloudflare Worker (holds your Anthropic key) |
| Accounts and sync | optional | Supabase (added in a later phase; see STATUS.md) |

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
