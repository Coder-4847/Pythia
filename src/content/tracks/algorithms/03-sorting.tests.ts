import { call, check } from '@/content/helpers'

const noBuiltins = check('does not cheat with sorted() or .sort()', String.raw`assert "sorted(" not in src and ".sort(" not in src, "Do the sorting yourself: no sorted() or .sort()."`, { hidden: true })
const keepsInput = (fn: string) =>
  check('leaves the original list alone', String.raw`data = [3, 1, 2]
ns["${fn}"](data)
assert data == [3, 1, 2], "Return a new list: don't change the list you were given."`, { hidden: true })

export default {
  e1: [
    call('selection_sort', [[5, 2, 9, 1, 5, 6]], [1, 2, 5, 5, 6, 9]),
    call('selection_sort', [[]], []),
    call('selection_sort', [[1]], [1], { hidden: true }),
    call('selection_sort', [[3, 2, 1]], [1, 2, 3], { hidden: true }),
    call('selection_sort', [[2, -1, 0, -5]], [-5, -1, 0, 2], { hidden: true }),
    call('selection_sort', [[1, 1, 1]], [1, 1, 1], { hidden: true }),
    noBuiltins,
    keepsInput('selection_sort'),
  ],
  e2: [
    call('insertion_sort', [[5, 2, 9, 1, 5, 6]], [1, 2, 5, 5, 6, 9]),
    call('insertion_sort', [[]], []),
    call('insertion_sort', [[4, 3]], [3, 4], { hidden: true }),
    call('insertion_sort', [[1, 2, 3]], [1, 2, 3], { hidden: true }),
    call('insertion_sort', [[9, 8, 7, 6, 5, 4]], [4, 5, 6, 7, 8, 9], { hidden: true }),
    noBuiltins,
    keepsInput('insertion_sort'),
  ],
  e3: [
    call('merge', [[1, 4, 9], [2, 3, 10, 11]], [1, 2, 3, 4, 9, 10, 11]),
    call('merge', [[], [1, 2]], [1, 2]),
    call('merge', [[1, 2], []], [1, 2], { hidden: true }),
    call('merge', [[], []], [], { hidden: true }),
    call('merge', [[1, 1, 2], [1, 3]], [1, 1, 1, 2, 3], { hidden: true }),
    call('merge', [[5], [1, 2, 3]], [1, 2, 3, 5], { hidden: true }),
    noBuiltins,
  ],
  e4: [
    call('is_sorted', [[1, 2, 2, 7]], true),
    call('is_sorted', [[3, 1, 2]], false),
    call('is_sorted', [[]], true),
    call('is_sorted', [[5]], true, { hidden: true }),
    call('is_sorted', [[1, 3, 2, 4]], false, { hidden: true }),
    call('is_sorted', [[2, 1]], false, { hidden: true }),
    check('does not just compare with sorted()', String.raw`import re
assert not re.search(r"(?<![\w.])sorted\(", src) and ".sort(" not in src, "Check the pairs yourself instead of sorting."`, { hidden: true }),
  ],
}
