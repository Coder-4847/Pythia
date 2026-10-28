import { check } from '@/content/helpers'

export default {
  e1: [
    check('evens is 2, 4, …, 20', String.raw`import numpy as np
assert "evens" in ns, "Create a variable called evens."
assert np.array_equal(ns["evens"], np.arange(2, 21, 2)), f"evens should be the even numbers 2 to 20, but it is {ns['evens']!r}."`),
    check('tens is each of those times 10', String.raw`import numpy as np
assert "tens" in ns, "Create a variable called tens."
assert np.array_equal(ns["tens"], np.arange(2, 21, 2) * 10), f"tens should be 20, 40, …, 200, but it is {ns['tens']!r}."`),
    check('they are NumPy arrays', String.raw`import numpy as np
assert isinstance(ns["evens"], np.ndarray) and isinstance(ns["tens"], np.ndarray), "Use NumPy arrays (np.arange), not lists."`, { hidden: true }),
    check('no loop needed', String.raw`assert "for " not in src, "You can do this without a loop."`, { hidden: true }),
  ],
  e2: [
    check('mean 0 and spread 1', String.raw`import numpy as np
r = ns["standardise"](np.array([1.0, 2.0, 3.0, 4.0, 5.0]))
assert np.allclose(r.mean(), 0) and np.allclose(r.std(), 1), f"The result should have mean 0 and standard deviation 1, got mean {r.mean():.3f} and std {r.std():.3f}."`),
    check('known values', String.raw`import numpy as np
r = ns["standardise"](np.array([10.0, 20.0]))
assert np.allclose(r, [-1.0, 1.0]), f"standardise([10, 20]) should be [-1, 1], got {r!r}."`),
    check('does not change its input', String.raw`import numpy as np
a = np.array([3.0, 5.0, 9.0])
ns["standardise"](a)
assert np.array_equal(a, [3.0, 5.0, 9.0]), "Return a new array; don't modify the one you were given."`, { hidden: true }),
    check('returns an array', String.raw`import numpy as np
assert isinstance(ns["standardise"](np.array([1.0, 2.0, 4.0])), np.ndarray)`, { hidden: true }),
  ],
  e3: [
    check('keeps the values above the mean', String.raw`import numpy as np
r = ns["above_average"](np.array([1, 2, 3, 10]))
assert np.array_equal(r, [10]), f"Only 10 is above the mean (4.0); got {r!r}."`),
    check('several values', String.raw`import numpy as np
r = ns["above_average"](np.array([72, 95, 58, 88, 64]))
assert np.array_equal(r, [95, 88]), f"The mean is 75.4, so expected [95, 88]; got {r!r}."`),
    check('all equal: nothing is above the mean', String.raw`import numpy as np
r = ns["above_average"](np.array([5, 5, 5]))
assert len(r) == 0, f"Nothing is above the mean when all values are equal; got {r!r}."`, { hidden: true }),
    check('order is preserved', String.raw`import numpy as np
assert list(ns["above_average"](np.array([9, 1, 8, 2, 7]))) == [9, 8, 7]`, { hidden: true }),
    check('uses a mask, not a loop', String.raw`assert "for " not in src, "Use a boolean mask instead of a loop."`, { hidden: true }),
  ],
  e4: [
    check('row totals and column means', String.raw`import numpy as np
rows, cols = ns["table_stats"](np.array([[1, 2, 3], [4, 5, 6]]))
assert np.array_equal(rows, [6, 15]), f"The row totals should be [6, 15], got {rows!r}."
assert np.allclose(cols, [2.5, 3.5, 4.5]), f"The column means should be [2.5, 3.5, 4.5], got {cols!r}."`),
    check('a different shape', String.raw`import numpy as np
rows, cols = ns["table_stats"](np.array([[10, 0], [0, 10], [5, 5]]))
assert np.array_equal(rows, [10, 10, 10]) and np.allclose(cols, [5, 5]), f"Got {rows!r} and {cols!r}."`, { hidden: true }),
    check('returns two 1D arrays', String.raw`import numpy as np
rows, cols = ns["table_stats"](np.ones((2, 4)))
assert rows.shape == (2,) and cols.shape == (4,), f"Expected shapes (2,) and (4,), got {rows.shape} and {cols.shape}."`, { hidden: true }),
  ],
}
