// @vitest-environment node
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide } from 'pyodide'
import { createEngine, type Engine, type EngineHost } from '@/workers/engine'

/** Runs the real Python runtime module inside real Pyodide (core only; no CDN needed). */
let engine: Engine
let out: string[]
let err: string[]
let status: string[]
let answers: string[]
let cancelled = false

const host: EngineHost = {
  stdout: (t) => out.push(t),
  stderr: (t) => err.push(t),
  image: () => {},
  status: (t) => status.push(t),
  readLine: () => answers.shift() ?? null,
  wasCancelled: () => cancelled,
}

const run = (code: string, name = 'main.py') => engine.run([{ name, code }], name)
const text = () => out.join('')

beforeAll(async () => {
  const indexURL = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/'
  const py = await loadPyodide({ indexURL })
  engine = await createEngine(py, host)
}, 60_000)

describe('engine.run', () => {
  const reset = (...lines: string[]) => {
    out = []
    err = []
    status = []
    answers = lines
    cancelled = false
  }

  it('streams stdout and reports success', async () => {
    reset()
    const result = await run('for i in range(3):\n    print("n", i)')
    expect(result.ok).toBe(true)
    expect(text()).toBe('n 0\nn 1\nn 2\n')
  })

  it('reports errors with a trimmed traceback and the failing line', async () => {
    reset()
    const result = await run('x = 1\ny = 0\nprint(x / y)\n')
    expect(result.ok).toBe(false)
    expect(result.error).toMatchObject({ type: 'ZeroDivisionError', line: 3, file: 'main.py' })
    expect(result.error?.traceback).toContain('Traceback (most recent call last):')
    expect(result.error?.traceback).toContain('File "main.py", line 3')
    expect(result.error?.traceback).not.toContain('pythia_runtime')
  })

  it('reports syntax errors with a line number', async () => {
    reset()
    const result = await run('print("hi"\nx = 2\n')
    expect(result.ok).toBe(false)
    expect(result.error?.type).toBe('SyntaxError')
    expect(result.error?.line).toBeGreaterThan(0)
  })

  it('serves input() from the host, echoing the prompt first', async () => {
    reset('Ada', '36')
    const result = await run('name = input("Name? ")\nage = int(input())\nprint(name, age + 1)')
    expect(result.ok).toBe(true)
    expect(text()).toBe('Name? Ada 37\n')
  })

  it('raises EOFError when input runs out, KeyboardInterrupt when cancelled', async () => {
    reset()
    expect((await run('input()')).error?.type).toBe('EOFError')
    reset()
    cancelled = true
    expect((await run('input()')).error?.type).toBe('KeyboardInterrupt')
  })

  it('supports reading sys.stdin line by line', async () => {
    reset('a', 'b')
    await run('import sys\nfor line in sys.stdin:\n    print(line.strip().upper())')
    expect(text()).toBe('A\nB\n')
  })

  it('runs multi-file programs and forgets deleted modules between runs', async () => {
    reset()
    const files = [
      { name: 'main.py', code: 'import helper\nprint(helper.greet("Pythia"))' },
      { name: 'helper.py', code: 'def greet(n):\n    return f"hi {n}"' },
    ]
    expect((await engine.run(files, 'main.py')).ok).toBe(true)
    expect(text()).toBe('hi Pythia\n')

    reset()
    const second = await run('import helper')
    expect(second.error?.type).toBe('ModuleNotFoundError')
  })

  it('shows imported-module frames with relative file names', async () => {
    reset()
    const result = await engine.run(
      [
        { name: 'main.py', code: 'import bad\nbad.boom()' },
        { name: 'bad.py', code: 'def boom():\n    raise ValueError("no")' },
      ],
      'main.py',
    )
    expect(result.error).toMatchObject({ type: 'ValueError', file: 'bad.py', line: 2 })
    expect(result.error?.traceback).toContain('File "main.py", line 2')
  })

  it('treats sys.exit() as a normal finish', async () => {
    reset()
    expect((await run('import sys\nprint("bye")\nsys.exit(0)')).ok).toBe(true)
  })

  it('reports a failed install instead of throwing', async () => {
    // The test Pyodide has no micropip wheel, so this exercises the failure path.
    const result = await engine.install(['some-package'])
    expect(result.ok).toBe(false)
    expect(result.message).toContain("Couldn't install some-package")
  })

  it('does not leak variables between runs', async () => {
    reset()
    await run('leak = 1')
    expect((await run('print(leak)')).error?.type).toBe('NameError')
  })
})
