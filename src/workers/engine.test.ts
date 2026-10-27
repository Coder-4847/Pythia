// @vitest-environment node
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide } from 'pyodide'
import { createEngine, type Engine, type EngineHost } from '@/workers/engine'
import type { TestSpec } from '@/workers/protocol'

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

describe('engine.runTests', () => {
  const test = (code: string, tests: TestSpec[]) => engine.runTests([{ name: 'main.py', code }], 'main.py', tests)
  const call = (fn: string, args: unknown[], expected: unknown, extra: Partial<TestSpec> = {}): TestSpec =>
    ({ kind: 'call', name: `${fn}(${args.join(', ')})`, fn, args, expected, ...extra }) as TestSpec

  it('passes correct code and fails wrong code with a specific message', async () => {
    const report = await test('def add(a, b):\n    return a - b', [call('add', [2, 3], 5)])
    expect(report.results[0]).toMatchObject({ passed: false, expected: '5', got: '-1' })
    expect(report.results[0]?.message).toContain('`add(2, 3)` should return 5, but it returned -1')

    const ok = await test('def add(a, b):\n    return a + b', [call('add', [2, 3], 5)])
    expect(ok.results[0]?.passed).toBe(true)
  })

  it('explains a missing function and a forgotten return', async () => {
    const missing = await test('x = 1', [call('add', [1, 2], 3)])
    expect(missing.results[0]?.message).toContain("I can't find a function called `add`")
    const none = await test('def add(a, b):\n    a + b', [call('add', [1, 2], 3)])
    expect(none.results[0]?.message).toContain('returned `None`')
  })

  it('reports crashes inside the learner function with a line number', async () => {
    const report = await test('def f(x):\n    return 1 / x', [call('f', [0], 1)])
    expect(report.results[0]?.message).toMatch(/raised ZeroDivisionError.*line 2/)
  })

  it('hides details of hidden tests but still shows the author hint', async () => {
    const report = await test('def f(x):\n    return 1', [call('f', [2], 4, { hidden: true, hint: 'Try a bigger number.' })])
    expect(report.results[0]).toMatchObject({ hidden: true, passed: false, message: 'Try a bigger number.', expected: null, got: null })
  })

  it('checks printed output line by line, with scripted input()', async () => {
    const out: TestSpec = { kind: 'output', name: 'greets', stdin: ['Ada'], expected: 'Name? Hello, Ada!\n' }
    expect((await test('n = input("Name? ")\nprint(f"Hello, {n}!")', [out])).results[0]?.passed).toBe(true)
    const bad = await test('n = input("Name? ")\nprint("Hi " + n)', [out])
    expect(bad.results[0]?.message).toContain("Line 1 of the output should be 'Name? Hello, Ada!'")
    const eof = await test('input()\ninput()', [{ kind: 'output', name: 'x', stdin: ['a'], expected: '' }])
    expect(eof.results[0]?.message).toContain('EOFError')
  })

  it('checks variables and gives friendly messages', async () => {
    const t: TestSpec = { kind: 'var', name: 'age', variable: 'age', expected: 14 }
    expect((await test('age = 14', [t])).results[0]?.passed).toBe(true)
    expect((await test('age = 13', [t])).results[0]?.message).toBe('`age` should be 14, but it is 13.')
    expect((await test('x = 1', [t])).results[0]?.message).toContain("I don't see a variable called `age`")
  })

  it('does not accept True for 1, tolerates float rounding, and revives tuples and sets', async () => {
    expect((await test('x = True', [{ kind: 'var', name: 'x', variable: 'x', expected: 1 }])).results[0]?.passed).toBe(false)
    expect((await test('x = 0.1 + 0.2', [{ kind: 'var', name: 'x', variable: 'x', expected: 0.3 }])).results[0]?.passed).toBe(true)
    const shapes: TestSpec[] = [
      { kind: 'var', name: 't', variable: 't', expected: { $tuple: [1, 2] } },
      { kind: 'var', name: 's', variable: 's', expected: { $set: [1, 2] } },
    ]
    expect((await test('t = (1, 2)\ns = {2, 1}', shapes)).results.every((r) => r.passed)).toBe(true)
    expect((await test('t = [1, 2]\ns = {2, 1}', shapes)).results[0]?.passed).toBe(false)
  })

  it('runs custom check code against the learner namespace and printed output', async () => {
    const t: TestSpec = { kind: 'check', name: 'prints and defines', code: 'assert "hi" in out, "Print hi."\nassert ns["n"] == 3, "n should be 3"' }
    expect((await test('n = 3\nprint("hi")', [t])).results[0]?.passed).toBe(true)
    expect((await test('n = 3', [t])).results[0]?.message).toBe('Print hi.')
  })

  it('isolates tests from each other and reports syntax errors without running any', async () => {
    const counter = 'count = 0\ndef bump():\n    global count\n    count += 1\n    return count'
    const twice = [call('bump', [], 1), call('bump', [], 1)]
    expect((await test(counter, twice)).results.every((r) => r.passed)).toBe(true)
    const broken = await test('def f(:\n  pass', [call('f', [], 1)])
    expect(broken.error?.type).toBe('SyntaxError')
    expect(broken.results).toEqual([])
  })

  it('fails (not crashes) when the whole program raises at import time', async () => {
    const report = await test('raise ValueError("boom")', [call('f', [], 1)])
    expect(report.results[0]?.message).toContain('stopped with ValueError: boom on line 1')
  })
})
