import { call, check } from '@/content/helpers'

const sorted = [2, 5, 8, 12, 16, 23, 38]

export default {
  e1: [
    call('binary_search', [sorted, 23], 5),
    call('binary_search', [sorted, 7], -1),
    call('binary_search', [sorted, 2], 0, { hidden: true }),
    call('binary_search', [sorted, 38], 6, { hidden: true }),
    call('binary_search', [[], 1], -1, { hidden: true }),
    call('binary_search', [[4], 4], 0, { hidden: true }),
    check('does not scan the whole list', String.raw`class Counting(list):
    reads = 0
    def __getitem__(self, i):
        Counting.reads += 1
        return list.__getitem__(self, i)
big = Counting(range(0, 2000, 2))
assert ns["binary_search"](big, 1998) == 999
assert Counting.reads <= 40, f"Binary search should look at about 11 items in a list of 1000, but yours looked at {Counting.reads}."`, { hidden: true }),
  ],
  e2: [
    call('contains', [sorted, 16], true),
    call('contains', [sorted, 17], false),
    call('contains', [[], 1], false, { hidden: true }),
    call('contains', [sorted, 38], true, { hidden: true }),
    check('does not use in', String.raw`assert " in items" not in src and "in items" not in src, "Use binary search, not the in operator."`, { hidden: true }),
  ],
  e3: [
    call('first_at_least', [[1, 3, 3, 8], 3], 1),
    call('first_at_least', [[1, 3], 10], 2),
    call('first_at_least', [[5, 6, 7], 1], 0, { hidden: true }),
    call('first_at_least', [[], 4], 0, { hidden: true }),
    call('first_at_least', [[2, 2, 2, 2], 2], 0, { hidden: true }),
    call('first_at_least', [[1, 4, 9, 16], 5], 2, { hidden: true }),
  ],
  e4: [
    call('count_guesses', [37, 1, 100], 3),
    call('count_guesses', [1, 1, 100], 6),
    call('count_guesses', [7, 7, 7], 1, { hidden: true }),
    call('count_guesses', [100, 1, 100], 7, { hidden: true }),
    call('count_guesses', [99, 1, 100], 6, { hidden: true }),
    call('count_guesses', [50, 1, 100], 1, { hidden: true }),
  ],
}
