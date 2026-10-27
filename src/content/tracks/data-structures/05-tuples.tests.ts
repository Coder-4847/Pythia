import { call, check, tuple, variable } from '@/content/helpers'

export default {
  e1: [
    variable('x', 3),
    variable('y', 4),
    check('works for another point', String.raw`ns2 = {}
exec(src.replace("(3, 4)", "(10, -2)"), ns2)
assert (ns2["x"], ns2["y"]) == (10, -2), "Unpack point instead of typing the numbers."`, { hidden: true }),
  ],
  e2: [
    variable('a', 'right'),
    variable('b', 'left'),
    check('does it in one line without temp', String.raw`assert "temp" not in src and "tmp" not in src, "Swap with unpacking; no temporary variable needed."
assert "a, b = b, a" in src.replace("(", "").replace(")", ""), "Use a, b = b, a"`, { hidden: true }),
  ],
  e3: [
    call('min_max', [[4, 9, 2, 7]], tuple(2, 9)),
    call('min_max', [[5]], tuple(5, 5), { hidden: true }),
    call('min_max', [[-3, -1, -8]], tuple(-8, -1), { hidden: true }),
  ],
  e4: [
    call('split_time', [135], tuple(2, 15)),
    call('split_time', [59], tuple(0, 59), { hidden: true }),
    call('split_time', [3600], tuple(60, 0), { hidden: true }),
  ],
}
