import type { Lesson } from '@/content/types'
import type { TestSpec } from '@/workers/protocol'

/** Identity function that gives authors full type-checking: `export default lesson({...})`. */
export const lesson = (l: Lesson): Lesson => l

interface Opts {
  hidden?: boolean
  hint?: string
  stdin?: string[]
  name?: string
  /** Keyword arguments for `call` / `callPrints`. */
  kwargs?: Record<string, unknown>
}

/** JSON can't express tuples or sets, so tests mark them and the Python runner revives them. */
export const tuple = (...items: unknown[]) => ({ $tuple: items })
export const setOf = (...items: unknown[]) => ({ $set: items })

const show = (value: unknown): string => {
  if (typeof value === 'object' && value !== null) {
    if ('$tuple' in value) return `(${(value.$tuple as unknown[]).map(show).join(', ')}${(value.$tuple as unknown[]).length === 1 ? ',' : ''})`
    if ('$set' in value) return `{${(value.$set as unknown[]).map(show).join(', ')}}`
  }
  return JSON.stringify(value) ?? 'None'
}

/** Call `fn(*args)` and compare the return value with `expected`. */
export const call = (fn: string, args: unknown[], expected: unknown, o: Opts = {}): TestSpec => ({
  kind: 'call',
  name: o.name ?? `${fn}(${args.map(show).join(', ')}) → ${show(expected)}`,
  fn,
  args,
  kwargs: o.kwargs,
  expected,
  hidden: o.hidden,
  hint: o.hint,
  stdin: o.stdin,
})

/** Run the program with `stdin` as input() answers and compare everything it prints. */
export const output = (stdin: string[], expected: string, o: Opts = {}): TestSpec => ({
  kind: 'output',
  name: o.name ?? (stdin.length ? `prints the right output for input ${stdin.map((s) => JSON.stringify(s)).join(', ')}` : 'prints the right output'),
  expected,
  stdin,
  hidden: o.hidden,
  hint: o.hint,
})

/** After running the program, the variable `name` must equal `expected`. */
export const variable = (name: string, expected: unknown, o: Opts = {}): TestSpec => ({
  kind: 'var',
  name: o.name ?? `${name} is ${show(expected)}`,
  variable: name,
  expected,
  hidden: o.hidden,
  hint: o.hint,
  stdin: o.stdin,
})

/**
 * Arbitrary Python check. It sees `ns` (the learner's globals), `out` (everything printed),
 * `src` (their source code), `fail(msg)` and `equal(a, b)`; a failed `assert` message is shown to the learner.
 */
export const check = (name: string, code: string, o: Opts = {}): TestSpec => ({
  kind: 'check',
  name,
  code,
  hidden: o.hidden,
  hint: o.hint,
  stdin: o.stdin,
})

/**
 * For programs that ask questions with input(): feed `stdin`, then require the *last* non-empty
 * line printed to equal `expected`. The learner's prompt wording can't make the test fail.
 */
export const lastLine = (stdin: string[], expected: string, o: Opts = {}): TestSpec =>
  check(
    o.name ?? `prints “${expected}” for input ${stdin.map((s) => JSON.stringify(s)).join(', ')}`,
    String.raw`lines = [l for l in out.splitlines() if l.strip()]
got = lines[-1].strip() if lines else "(nothing)"
assert got == ${JSON.stringify(expected)}, f"The last line your program prints should be {${JSON.stringify(expected)}!r}, but it is {got!r}."`,
    { ...o, stdin },
  )

type Swap = [from: string, to: string][]

/** A JSON value as a Python expression (`json.loads` of a quoted literal), safe for any content. */
const py = (value: unknown) => `json.loads(${JSON.stringify(JSON.stringify(value))})`

const RERUN_PRELUDE = (swaps: Swap) => String.raw`import contextlib, io, json
code = src
swaps = ${py(swaps)}
for old, new in swaps:
    assert old in code, f"Keep the line {old!r} as it is in the starter code."
    code = code.replace(old, new)
what = "; ".join(new for _, new in swaps)`

/**
 * Hidden-test helper: run the learner's program again with parts of the starter replaced
 * (e.g. `[['score = 85', 'score = 95']]`) and compare what it prints. Catches hard-coded answers.
 * The replaced text must exist in the starter, so learners must keep those lines.
 */
export const rerunOutput = (name: string, swaps: Swap, expected: string, o: Opts = {}): TestSpec =>
  check(
    name,
    String.raw`${RERUN_PRELUDE(swaps)}
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    exec(code, {"__name__": "__main__"})
got = buf.getvalue().strip()
want = ${py(expected.trim())}
assert got == want, f"With {what!r}, your program should print {want!r}, but it printed {got!r}."`,
    { hidden: true, hint: o.hint, stdin: o.stdin },
  )

/** Like `rerunOutput`, but checks the value of a variable afterwards. */
export const rerunVar = (name: string, swaps: Swap, variableName: string, expected: unknown, o: Opts = {}): TestSpec =>
  check(
    name,
    String.raw`${RERUN_PRELUDE(swaps)}
scope = {"__name__": "__main__"}
exec(code, scope)
got = scope.get(${py(variableName)}, "(not defined)")
want = ${py(expected)}
assert equal(got, want), f"With {what!r}, ${variableName} should be {want!r}, but it is {got!r}."`,
    { hidden: true, hint: o.hint, stdin: o.stdin },
  )

/**
 * Call a learner's function and compare what it **prints** (its return value is ignored).
 * For exercises like "write greet() so that it prints...".
 */
export const callPrints = (fn: string, args: unknown[], expected: string, o: Opts = {}): TestSpec => {
  const shown = `${fn}(${[...args.map((a) => JSON.stringify(a)), ...Object.entries(o.kwargs ?? {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`)].join(', ')})`
  return check(
    o.name ?? `${shown} prints ${JSON.stringify(expected.trim())}`,
    String.raw`import contextlib, io, json
name = ${py(fn)}
if name not in ns:
    fail(f"I can't find a function called {name}. Define it with def {name}(...):")
args = ${py(args)}
kwargs = ${py(o.kwargs ?? {})}
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    ns[name](*args, **kwargs)
got = buf.getvalue()
want = ${py(expected)}
assert got.strip() == want.strip(), f"Calling ${shown.replace(/"/g, "'")} should print {want.strip()!r}, but it printed {got.strip()!r}."`,
    { hidden: o.hidden, hint: o.hint },
  )
}
