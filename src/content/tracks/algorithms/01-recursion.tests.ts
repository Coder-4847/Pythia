import { call, check } from '@/content/helpers'

const recursive = (fn: string) =>
  check('calls itself', String.raw`assert src.count("${fn}(") >= 2, "A recursive function calls itself: ${fn} should appear inside its own body."`, { hidden: true })

export default {
  e1: [
    call('sum_to', [0], 0),
    call('sum_to', [5], 15),
    call('sum_to', [1], 1, { hidden: true }),
    call('sum_to', [100], 5050, { hidden: true }),
    recursive('sum_to'),
  ],
  e2: [
    call('count_digits', [7], 1),
    call('count_digits', [2024], 4),
    call('count_digits', [0], 1),
    call('count_digits', [100000], 6, { hidden: true }),
    recursive('count_digits'),
    check('does not convert to text', String.raw`assert "str(" not in src and "len(" not in src, "Do it with arithmetic only: no str() or len()."`, { hidden: true }),
  ],
  e3: [
    call('reverse', ['abc'], 'cba'),
    call('reverse', [''], ''),
    call('reverse', ['a'], 'a', { hidden: true }),
    call('reverse', ['Pythia'], 'aihtyP', { hidden: true }),
    recursive('reverse'),
    check('no slicing shortcut', String.raw`assert "[::-1]" not in src and "reversed(" not in src, "Use recursion instead of the built-in shortcuts."`, { hidden: true }),
  ],
  e4: [
    call('flatten', [[1, [2, [3, 4]], 5]], [1, 2, 3, 4, 5]),
    call('flatten', [[]], []),
    call('flatten', [[[], [[]]]], [], { hidden: true }),
    call('flatten', [[['a'], 'b']], ['a', 'b'], { hidden: true }),
    call('flatten', [[1, 2, 3]], [1, 2, 3], { hidden: true }),
    recursive('flatten'),
    check('does not change its input', String.raw`data = [1, [2, [3]]]
ns["flatten"](data)
assert data == [1, [2, [3]]], "flatten should build a new list and leave the original alone."`, { hidden: true }),
  ],
}
