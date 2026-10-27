// @vitest-environment node
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide } from 'pyodide'
import { LESSONS } from '@/content'
import { createEngine, type Engine } from '@/workers/engine'
import type { Diagnostic } from '@/workers/protocol'

let engine: Engine
const analyze = (code: string) => engine.analyze(code)
const rules = (code: string) => analyze(code).map((d) => `${d.rule}@${d.line}`)

beforeAll(async () => {
  const indexURL = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/'
  const wheel = readFileSync('public/vendor/pyflakes-4.0.3-py2.py3-none-any.whl')
  engine = await createEngine(
    await loadPyodide({ indexURL }),
    { stdout: () => {}, stderr: () => {}, image: () => {}, status: () => {}, readLine: () => null, wasCancelled: () => false },
    wheel,
  )
}, 60_000)

/** [rule id, source, line the marker should land on] */
const POSITIVE: [string, string, number][] = [
  ['range-last', 'total = 0\nfor i in range(1, 10):\n    total += i\nprint("Sum of 1 to 10:", total)\n', 2],
  ['index-past-end', 'xs = [1, 2, 3]\nfor i in range(len(xs) + 1):\n    print(xs[i])\n', 2],
  ['index-past-end', 'xs = [1, 2, 3]\nfor i in range(len(xs)):\n    print(xs[i + 1])\n', 3],
  ['index-past-end', 'xs = [1, 2]\ni = 0\nwhile i <= len(xs):\n    print(xs[i])\n    i += 1\n', 3],
  ['useless-comparison', 'x = 3\nx == 5\n', 2],
  ['is-literal', 'x = 3\nif x is 3:\n    print(1)\n', 2],
  ['mutate-while-iterating', 'xs = [1, 2, 3, 4]\nfor x in xs:\n    if x % 2 == 0:\n        xs.remove(x)\n', 4],
  ['mutate-while-iterating', 'xs = [1]\nfor x in xs:\n    xs.append(x + 1)\n', 3],
  ['missing-return', 'def sign(n):\n    if n > 0:\n        return "pos"\n    elif n < 0:\n        return "neg"\n', 1],
  ['mutable-default', 'def add(x, items=[]):\n    items.append(x)\n    return items\n', 1],
  ['uses-none-result', 'def double(n):\n    print(n * 2)\n\nanswer = double(4)\n', 4],
  ['call-arity', 'def add(a, b):\n    return a + b\n\nprint(add(1))\n', 4],
  ['call-arity', 'def add(a, b):\n    return a + b\n\nprint(add(1, 2, 3))\n', 4],
  ['float-index', 'xs = [1, 2, 3, 4]\nprint(xs[len(xs) / 2])\n', 2],
  ['float-range', 'for i in range(10 / 2):\n    print(i)\n', 1],
  ['floor-average', 'total = 7\ncount = 2\naverage = total // count\n', 3],
  ['divide-by-zero', 'x = 5 / 0\n', 1],
  ['shadow-builtin', 'list = [1, 2]\nprint(list)\n', 1],
  ['shadow-builtin', 'def f(sum):\n    return sum\n', 1],
  ['unreachable', 'def f():\n    return 1\n    print("never")\n', 3],
  ['unreachable', 'for i in range(3):\n    break\n    print(i)\n', 3],
  ['input-is-text', 'age = input("Age? ")\nprint(age + 1)\n', 2],
  ['input-is-text', 'n = input()\nif n > 5:\n    print("big")\n', 2],
  ['input-is-text', 'n = input()\nfor i in range(n):\n    print(i)\n', 2],
  ['input-is-text', 'n = input()\nif n == 5:\n    print("five")\n', 2],
  ['text-plus-number', 'print("Age: " + 14)\n', 1],
  ['text-plus-number', 'score = 95\nprint("Score: " + score)\n', 2],
  ['assigns-none', 'xs = [3, 1]\nxs = xs.sort()\n', 2],
  ['assigns-none', 'xs = []\nxs = xs.append(1)\n', 2],
  ['method-not-called', 'name = "ada"\nshout = name.upper\n', 2],
  ['discarded-result', 'name = "ada"\nname.upper()\n', 2],
  ['discarded-result', 'xs = [1]\nlen(xs)\n', 2],
  ['useless-expression', 'a = 1\nb = 2\na + b\n', 3],
  ['infinite-loop', 'i = 0\nwhile i < 5:\n    print(i)\n', 2],
  ['infinite-loop', 'while True:\n    print("hi")\n', 1],
  ['undefined-name', 'print(totl)\n', 1],
  ['undefined-name', 'total = 1\nprint(Total)\n', 2],
  ['undefined-local', 'x = 1\ndef f():\n    print(x)\n    x = 2\n', 3],
  ['unused-variable', 'def f():\n    unused = 1\n    return 2\n', 2],
  ['unused-import', 'import os\nprint(1)\n', 1],
  ['syntax-colon', 'if True\n    print(1)\n', 1],
  ['syntax-string', 'print("hello)\n', 1],
  ['syntax-bracket', 'print("hi"\nx = 2\n', 1],
  ['syntax-assign-compare', 'x = 1\nif x = 1:\n    print(x)\n', 2],
  ['syntax-indent-missing', 'def f():\nprint(1)\n', 2],
  ['syntax-indent-extra', 'x = 1\n    y = 2\n', 2],
  ['syntax-print', 'print "hi"\n', 1],
]

describe('Pythia local analysis: it flags the bugs it should', () => {
  it.each(POSITIVE)('%s', (rule, code, line) => {
    const found = rules(code)
    expect(found, `expected ${rule}@${line} in ${JSON.stringify(found)}\n${code}`).toContain(`${rule}@${line}`)
  })
})

/** Correct code that resembles buggy code. None of these may be flagged at level 1 or 2. */
const NEGATIVE: [string, string][] = [
  ['range over a list index done right', 'xs = [1, 2, 3]\nfor i in range(len(xs)):\n    print(xs[i])\n'],
  ['looking ahead with a smaller range', 'xs = [1, 2, 3]\nfor i in range(len(xs) - 1):\n    print(xs[i + 1] - xs[i])\n'],
  ['range matching a 1 to 10 goal', 'for i in range(1, 11):\n    print(i)\nprint("1 to 10")\n'],
  ['comparison inside an if', 'x = 3\nif x == 3:\n    print(x)\n'],
  ['is None', 'x = None\nif x is None:\n    print(1)\n'],
  ['remove then break', 'xs = [1, 2, 3]\nfor x in xs:\n    if x == 2:\n        xs.remove(x)\n        break\n'],
  ['iterating over a copy', 'xs = [1, 2, 3]\nfor x in xs[:]:\n    xs.remove(x)\n'],
  ['returns on every path', 'def sign(n):\n    if n > 0:\n        return "pos"\n    elif n < 0:\n        return "neg"\n    else:\n        return "zero"\n'],
  ['explicit final return', 'def find(xs, t):\n    for x in xs:\n        if x == t:\n            return x\n    return None\n'],
  ['None default idiom', 'def add(x, items=None):\n    if items is None:\n        items = []\n    items.append(x)\n    return items\n'],
  ['function result used and returned', 'def double(n):\n    return n * 2\n\nanswer = double(4)\nprint(answer)\n'],
  ['print-only function not used as a value', 'def greet():\n    print("hi")\n\ngreet()\n'],
  ['default arguments allow a short call', 'def power(b, e=2):\n    return b ** e\n\nprint(power(3))\n'],
  ['keyword arguments', 'def greet(name, greeting="Hello"):\n    return greeting\n\nprint(greet(greeting="Hi", name="Ada"))\n'],
  ['floor division for an index', 'xs = [1, 2, 3, 4]\nprint(xs[len(xs) // 2])\n'],
  ['true division for an average', 'total = 7\ncount = 2\naverage = total / count\n'],
  ['converted input', 'age = int(input("Age? "))\nprint(age + 1)\n'],
  ['input kept as text', 'name = input("Name? ")\nprint("Hello, " + name)\n'],
  ['input reassigned before use', 'n = input()\nn = int(n)\nprint(n + 1)\n'],
  ['text plus str(number)', 'score = 95\nprint("Score: " + str(score))\n'],
  ['method called', 'name = "ada"\nshout = name.upper()\nprint(shout)\n'],
  ['method reference as key', 'scores = {"a": 1}\nprint(max(scores, key=scores.get))\nprint(sorted(["b", "A"], key=str.lower))\n'],
  ['result stored', 'name = "ada"\nname = name.upper()\n'],
  ['append on its own line', 'xs = []\nxs.append(1)\n'],
  ['loop updates its counter', 'i = 0\nwhile i < 5:\n    i += 1\n'],
  ['loop with break', 'while True:\n    answer = input()\n    if answer == "q":\n        break\n'],
  ['loop that reads input', 'answer = ""\nwhile answer != "q":\n    answer = input()\n'],
  ['loop changing a list', 'queue = [1, 2]\nwhile queue:\n    queue.pop()\n'],
  ['while on a method call condition', 'import random\nwhile random.random() < 0.5:\n    print("again")\n'],
  ['names defined in order', 'total = 1\nprint(total)\n'],
  ['a function defined later but called later', 'def f():\n    return g()\n\ndef g():\n    return 1\n\nprint(f())\n'],
  ['an f-string', 'name = "Ada"\nprint(f"Hi {name}")\n'],
  ['a docstring', 'def f():\n    """Say hi."""\n    return 1\n'],
  ['shadowing a safe name', 'total = 1\nitems = []\ncount = 0\n'],
]

describe('Pythia local analysis: it stays quiet on correct code', () => {
  it.each(NEGATIVE)('%s', (_name, code) => {
    const noisy = analyze(code).filter((d) => d.level <= 2)
    expect(noisy.map((d) => `${d.rule}@${d.line}`), code).toEqual([])
  })
})

describe('Pythia local analysis: shape and rules of engagement', () => {
  it('reports only the syntax problem when the code cannot be parsed', () => {
    const d = analyze('print("hi"\nx = totl\n')
    expect(d).toHaveLength(1)
    expect(d[0]).toMatchObject({ category: 'syntax', level: 1, source: 'local' })
  })

  it('lands the hero example on line 2 with the question from the landing page', () => {
    const [d] = analyze('total = 0\nfor i in range(1, 10):\n    total += i\nprint("Sum of 1 to 10:", total)\n')
    expect(d).toMatchObject({ line: 2, question: 'What do you expect `i` to be on the last loop?' })
  })

  it('gives every diagnostic a question, a hint, an explanation and a stable id', () => {
    for (const [, code] of POSITIVE) {
      for (const d of analyze(code)) {
        expect(d.question.trim().length, d.rule).toBeGreaterThan(10)
        expect(d.hint.trim().length, d.rule).toBeGreaterThan(10)
        expect(d.explanation.trim().length, d.rule).toBeGreaterThan(10)
        expect(d.id).toBe(`${d.rule}:${d.line}`)
        expect([1, 2, 3]).toContain(d.level)
      }
    }
  })

  it('asks questions: every first-rung message ends in a question mark', () => {
    for (const [, code] of POSITIVE) for (const d of analyze(code)) expect(d.question, `${d.rule}: ${d.question}`).toMatch(/\?$/)
  })

  it('returns at most one diagnostic per rule and line, sorted by line', () => {
    const d = analyze('list = [1]\nsum = 2\nmax = 3\n')
    const keys = d.map((x) => `${x.line}:${x.rule}`)
    expect(new Set(keys).size).toBe(keys.length)
    expect(d.map((x) => x.line)).toEqual([...d.map((x) => x.line)].sort((a, b) => a - b))
  })

  it('handles empty input and odd input without throwing', () => {
    expect(analyze('')).toEqual([])
    expect(analyze('# just a comment\n')).toEqual([])
    expect(() => analyze('x = ' + '('.repeat(50))).not.toThrow()
    expect(() => analyze('\u0000')).not.toThrow()
  })
})

describe('Pythia local analysis: false-positive sweep over the curriculum', () => {
  const clean: [string, string][] = LESSONS.flatMap((l) => [
    ...l.exercises.map((e): [string, string] => [`${l.id}/${e.id} solution`, e.solution]),
    [`${l.id} worked example`, l.example.code],
  ])

  it.each(clean)('%s raises no essential or helpful diagnostics', (_name, code) => {
    const noisy: Diagnostic[] = analyze(code).filter((d) => d.level <= 2)
    expect(noisy.map((d) => `${d.rule}@${d.line}: ${d.question}`)).toEqual([])
  })
})
