// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide } from 'pyodide'
import { LESSONS } from '@/content'
import { createEngine, type Engine } from '@/workers/engine'

/**
 * Every runnable snippet in a lesson (the "```python run" blocks and the worked example) is code a
 * learner will press Run on. This runs them all. A snippet that fails on purpose, to show what an
 * error looks like, is listed in SHOWS_AN_ERROR below, and then it must raise exactly that error.
 */
let engine: Engine
let reads = 0

/** A plausible answer to whatever the snippet asks, so snippets that read input() can run unattended. */
function answerFor(prompt: string): string | null {
  if (++reads > 40) return null // a snippet that never stops asking ends with EOF instead of hanging
  if (/quit|exit|stop|done/i.test(prompt)) return 'quit'
  if (/age|old|number|many|year|count|score|price|\bn\b|num|how much|first|second|height|width|minutes|amount|percent|bill|\bx\b|\by\b/i.test(prompt)) return '7'
  return 'Ada'
}

const needsPackages = (code: string) => /\b(numpy|pandas|matplotlib|sklearn|scipy)\b/.test(code)
const NATIVE_PYTHON = process.env.PYTHIA_NATIVE_PYTHON

beforeAll(async () => {
  const indexURL = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/'
  engine = await createEngine(await loadPyodide({ indexURL }), {
    stdout: () => {},
    stderr: () => {},
    image: () => {},
    status: () => {},
    readLine: answerFor,
    wasCancelled: () => false,
  })
}, 60_000)

function runNative(code: string): { ok: boolean; error?: { type: string; message: string } } {
  const script = `import sys, json, tempfile; sys.path.insert(0, 'src/workers'); import pythia_runtime as rt
req = json.load(sys.stdin); rt.USER_DIR = tempfile.mkdtemp(); rt.configure(lambda p: 'Ada', lambda: False, lambda png: None)
print(rt.run(json.dumps({'main.py': req['code']}), 'main.py'))`
  const out = execFileSync(NATIVE_PYTHON!, ['-c', script], { input: JSON.stringify({ code }), encoding: 'utf8', timeout: 120_000, maxBuffer: 20_000_000 })
  return JSON.parse(out.trim().split('\n').pop()!)
}

/** Snippets that fail on purpose, to show what an error looks like: `lesson-id:snippet-number` → the error they must raise. */
const SHOWS_AN_ERROR: Record<string, string> = {
  'data-types:3': 'TypeError',
  'scope-and-defaults:1': 'NameError',
  'tuples:2': 'TypeError',
  'dict-basics:4': 'KeyError',
  'try-except:1': 'ValueError',
  'raising-errors:1': 'ValueError',
}

const snippetsOf = (concept: string) => [...concept.matchAll(/```python run\n([\s\S]*?)```/g)].map((m) => m[1]!)

describe.each(LESSONS)('lesson $id runnable snippets', (lesson) => {
  const all = [...snippetsOf(lesson.concept).map((code, i) => [`concept snippet ${i + 1}`, code, SHOWS_AN_ERROR[`${lesson.id}:${i + 1}`]] as const), ['worked example', lesson.example.code, undefined] as const]
  it.each(all)('%s runs as the lesson says', async (_name, code, expected) => {
    reads = 0
    const native = needsPackages(code)
    if (native && !NATIVE_PYTHON) return
    const result = native ? runNative(code) : await engine.run([{ name: 'main.py', code }], 'main.py')
    if (expected) expect(result.error?.type, 'the snippet is marked to fail').toBe(expected)
    else expect(result.error ? `${result.error.type}: ${result.error.message}` : null, 'unexpected error').toBeNull()
  }, 120_000)
})
