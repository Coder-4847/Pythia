import { check } from '@/content/helpers'

const gen = (fn: string, args: string, expected: string, hint = '') =>
  String.raw`import types
g = ns[${JSON.stringify(fn)}](${args})
assert isinstance(g, types.GeneratorType), "${fn}(...) should be a generator: use yield instead of building and returning a list."
got = list(g)
assert got == ${expected}, f"${fn}(${args.replace(/"/g, '\\"')}) should produce ${expected.replace(/"/g, '\\"')}, but produced {got!r}. ${hint}"`

const first = (fn: string, n: number, expected: string) =>
  String.raw`import itertools, types
g = ns[${JSON.stringify(fn)}]()
assert isinstance(g, types.GeneratorType), "${fn}() should be a generator function (use yield)."
got = list(itertools.islice(g, ${n}))
assert got == ${expected}, f"The first ${n} values should be ${expected}, but they are {got!r}."`

export default {
  e1: [
    check('countdown(3) → 3, 2, 1', gen('countdown', '3', '[3, 2, 1]')),
    check('countdown(0) yields nothing', gen('countdown', '0', '[]')),
    check('countdown(1)', gen('countdown', '1', '[1]'), { hidden: true }),
    check('countdown(6)', gen('countdown', '6', '[6, 5, 4, 3, 2, 1]'), { hidden: true }),
  ],
  e2: [
    check('multiples(3, 10)', gen('multiples', '3, 10', '[3, 6, 9]')),
    check('limit that is itself a multiple', gen('multiples', '5, 15', '[5, 10, 15]')),
    check('limit below the first multiple', gen('multiples', '7, 3', '[]'), { hidden: true }),
    check('multiples(1, 4)', gen('multiples', '1, 4', '[1, 2, 3, 4]'), { hidden: true }),
  ],
  e3: [
    check('first five squares', first('squares', 5, '[1, 4, 9, 16, 25]')),
    check('first ten squares', first('squares', 10, '[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]'), { hidden: true }),
    check('is resumable', String.raw`g = ns["squares"]()
a, b, c = next(g), next(g), next(g)
assert (a, b, c) == (1, 4, 9), f"Successive next() calls should give 1, 4, 9 but gave {(a, b, c)}."`, { hidden: true }),
  ],
  e4: [
    check('keeps words of at least the size', gen('long_words', '["a", "bear", "cat", "dingo"], 4', '["bear", "dingo"]')),
    check('size 1 keeps everything', gen('long_words', '["a", "bb"], 1', '["a", "bb"]'), { hidden: true }),
    check('nothing long enough', gen('long_words', '["a", "bb"], 5', '[]'), { hidden: true }),
    check('is a generator', String.raw`import types
assert isinstance(ns["long_words"](["x"], 1), types.GeneratorType), "Use yield so this is a generator."`, { hidden: true }),
  ],
}
