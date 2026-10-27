import type { Lesson } from '@/content/types'
import type { TestSpec } from '@/workers/protocol'

/** Identity function that gives authors full type-checking: `export default lesson({...})`. */
export const lesson = (l: Lesson): Lesson => l

interface Opts {
  hidden?: boolean
  hint?: string
  stdin?: string[]
  name?: string
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
