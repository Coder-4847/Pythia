import { call, check } from '@/content/helpers'

export default {
  e1: [
    call('unique_count', [[1, 2, 2, 3, 3, 3]], 3),
    call('unique_count', [[]], 0),
    call('unique_count', [['a', 'b', 'a']], 2, { hidden: true }),
    call('unique_count', [[5]], 1, { hidden: true }),
  ],
  e2: [
    call('common', [[3, 1, 2, 2], [2, 3, 4]], [2, 3]),
    call('common', [['a'], ['b']], []),
    call('common', [[], [1]], [], { hidden: true }),
    call('common', [[5, 5, 5], [5]], [5], { hidden: true, hint: 'No duplicates in the result.' }),
  ],
  e3: [
    call('only_in_first', [[1, 2, 3, 3], [3, 4]], [1, 2]),
    call('only_in_first', [[1], [1]], []),
    call('only_in_first', [['z', 'a'], []], ['a', 'z'], { hidden: true }),
    call('only_in_first', [[], [1]], [], { hidden: true }),
  ],
  e4: [
    call('has_duplicates', [[1, 2, 3]], false),
    call('has_duplicates', [[1, 2, 1]], true),
    call('has_duplicates', [[]], false, { hidden: true }),
    call('has_duplicates', [['a', 'b', 'c', 'a']], true, { hidden: true }),
    check('is a real boolean', String.raw`assert ns["has_duplicates"]([1, 1]) is True`, { hidden: true }),
  ],
}
