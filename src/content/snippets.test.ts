// @vitest-environment node
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide } from 'pyodide'
import { createEngine, type Engine } from '@/workers/engine'
import { SNIPPETS } from '@/content/snippets'

let engine: Engine
let stdout = ''

beforeAll(async () => {
  const indexURL = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/'
  engine = await createEngine(await loadPyodide({ indexURL }), {
    stdout: (t) => (stdout += t),
    stderr: () => {},
    image: () => {},
    status: () => {},
    readLine: () => '7',
    wasCancelled: () => false,
  })
}, 60_000)

describe('built-in snippets', () => {
  it('have unique ids', () => {
    expect(new Set(SNIPPETS.map((s) => s.id)).size).toBe(SNIPPETS.length)
  })

  // Snippets that need scientific packages are only syntax-checked here: those wheels come
  // from the Pyodide CDN, which unit tests don't hit. Everything else is actually executed.
  for (const snippet of SNIPPETS) {
    it(`${snippet.id} ${snippet.needs ? 'compiles' : 'runs'}`, async () => {
      stdout = ''
      const code = snippet.needs ? `compile(${JSON.stringify(snippet.code)}, "snippet", "exec")` : snippet.code
      const result = await engine.run([{ name: 'main.py', code }], 'main.py')
      expect(result.error?.traceback).toBeUndefined()
      expect(result.ok).toBe(true)
      if (!snippet.needs) expect(stdout.length).toBeGreaterThan(0)
    })
  }
})
