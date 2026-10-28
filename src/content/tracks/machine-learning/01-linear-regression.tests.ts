import { call, check } from '@/content/helpers'

export default {
  e1: [
    check('a perfect line y = 2x + 1', String.raw`slope, icpt = ns["fit_line"]([1, 2, 3, 4], [3, 5, 7, 9])
assert (slope, icpt) == (2.0, 1.0), f"The data is exactly y = 2x + 1, so expected (2.0, 1.0), got {(slope, icpt)}."`),
    check('noisy data matches NumPy', String.raw`import numpy as np
xs, ys = [1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1]
m, b = np.polyfit(xs, ys, 1)
slope, icpt = ns["fit_line"](xs, ys)
assert (slope, icpt) == (round(m, 2), round(b, 2)), f"Expected {(round(m, 2), round(b, 2))}, got {(slope, icpt)}."`),
    check('returns plain floats', String.raw`slope, icpt = ns["fit_line"]([0, 1, 2], [5, 5, 5])
assert type(slope) is float and type(icpt) is float, f"Convert with float(): got {type(slope).__name__} and {type(icpt).__name__}."`, { hidden: true }),
    check('negative slope', String.raw`assert ns["fit_line"]([0, 1, 2], [4, 2, 0]) == (-2.0, 4.0)`, { hidden: true }),
    check('uses scikit-learn', String.raw`assert "LinearRegression" in src, "Use LinearRegression from scikit-learn."`, { hidden: true }),
  ],
  e2: [
    call('predict_price', [100], 300),
    call('predict_price', [60], 180),
    call('predict_price', [0], 0, { hidden: true }),
    call('predict_price', [200], 600, { hidden: true }),
    check('uses scikit-learn', String.raw`assert "LinearRegression" in src and ".fit(" in src and ".predict(" in src, "Create a LinearRegression, fit it, then predict."`, { hidden: true }),
  ],
  e3: [
    call('mean_squared_error', [[3, 5, 7], [2, 5, 9]], 5 / 3),
    call('mean_squared_error', [[1, 2], [1, 2]], 0),
    call('mean_squared_error', [[0], [4]], 16, { hidden: true }),
    call('mean_squared_error', [[1, 1, 1, 1], [0, 2, 0, 2]], 1, { hidden: true }),
    check('no library', String.raw`assert "sklearn" not in src and "numpy" not in src, "Write it yourself with a loop or sum()."`, { hidden: true }),
  ],
  e4: [
    call('r_squared', [[1, 2, 3], [1, 2, 3]], 1),
    call('r_squared', [[1, 2, 3], [2, 2, 2]], 0),
    call('r_squared', [[1, 2, 3, 4], [1.1, 1.9, 3.2, 3.8]], 0.98, { hidden: true }),
    call('r_squared', [[2, 4], [4, 2]], -3, { hidden: true }),
    check('no library', String.raw`assert "sklearn" not in src and "numpy" not in src, "Write it yourself."`, { hidden: true }),
  ],
}
