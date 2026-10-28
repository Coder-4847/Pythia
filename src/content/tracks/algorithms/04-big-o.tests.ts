import { call, check, tuple } from '@/content/helpers'

export default {
  e1: [
    call('count_pairs', [[5, 6, 7]], 3),
    call('count_pairs', [[]], 0),
    call('count_pairs', [[1]], 0, { hidden: true }),
    call('count_pairs', [[1, 2, 3, 4, 5]], 10, { hidden: true }),
    call('count_pairs', [Array(20).fill(0)], 190, { hidden: true }),
    check('really counts with loops', String.raw`assert src.count("for ") >= 2, "Use two nested loops and count inside them."`, { hidden: true }),
  ],
  e2: [
    call('has_duplicates', [[3, 8, 1, 9, 4, 8]], true),
    call('has_duplicates', [[1, 2, 3]], false),
    call('has_duplicates', [[]], false, { hidden: true }),
    call('has_duplicates', [['a', 'b', 'a']], true, { hidden: true }),
    call('has_duplicates', [[7]], false, { hidden: true }),
    check('uses a set and no nested loop', String.raw`assert "set" in src or "{" in src, "Remember what you have seen in a set."
assert src.count("for ") <= 1 and "range(" not in src, "One loop is enough when you use a set."`, { hidden: true }),
    check('handles a large list quickly', String.raw`import time
start = time.perf_counter()
assert ns["has_duplicates"](list(range(200_000))) is False
assert time.perf_counter() - start < 3, "That took too long: a set lookup is instant, so one pass should be quick."`, { hidden: true }),
  ],
  e3: [
    call('two_sum', [[2, 7, 11, 15], 9], tuple(0, 1)),
    call('two_sum', [[1, 2, 3], 100], null),
    call('two_sum', [[3, 3], 6], tuple(0, 1), { hidden: true }),
    call('two_sum', [[5, 1, 4, 9], 13], tuple(2, 3), { hidden: true }),
    call('two_sum', [[], 1], null, { hidden: true }),
    call('two_sum', [[4], 8], null, { hidden: true }),
    check('indexes are different and ordered', String.raw`i, j = ns["two_sum"]([6, 1, 6], 12)
assert i < j and i != j, "Return two different indexes with i < j."`, { hidden: true }),
  ],
  e4: [
    call('most_common', [['a', 'b', 'a', 'c']], 'a'),
    call('most_common', [[]], null),
    call('most_common', [[1, 2, 2, 1]], 1, { hidden: true }),
    call('most_common', [[5]], 5, { hidden: true }),
    call('most_common', [[3, 3, 2, 2, 2]], 2, { hidden: true }),
    check('does not call .count()', String.raw`assert ".count(" not in src, "Count with a dictionary in one pass instead of calling .count() repeatedly."`, { hidden: true }),
  ],
}
