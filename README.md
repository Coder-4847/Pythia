# Pythia

> The AI Python tutor that sees your bugs coming.

Pythia teaches Python from `print()` to machine learning. You write real Python in the
browser; Pythia watches as you type, predicts likely bugs *before* you run the code, and
answers with a guiding **question — never the fix**.

Everything runs client-side. The static site deploys to GitHub Pages; the optional AI layer
and cloud sync light up only when you configure them.

> **Status:** under active construction — see [`STATUS.md`](STATUS.md) for what works today and
> [`PLAN.md`](PLAN.md) for the architecture and phases.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run lint
npm run build      # type-check + production build into dist/
```

Copy `.env.example` to `.env.local` to configure the optional AI proxy and Supabase.
Without them the app runs in guest, local-only mode.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` then production build (set `BASE_PATH=/repo/` for Pages) |
| `npm run preview` | Serve `dist/` (use the same `BASE_PATH`) |
| `npm test` | Vitest unit tests |
| `npm run e2e` | Playwright tests (guest build on :4173, plus a build wired to a fake Supabase on :4174) |
| `npm run brand` | Regenerate PNG icons and the OG image from the SVG mark |

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind 4 · Zustand · React Router (hash) ·
Framer Motion. Planned: CodeMirror 6, Pyodide in a Web Worker, Dexie, Supabase, a Cloudflare
Worker AI proxy. Details in [`PLAN.md`](PLAN.md).
