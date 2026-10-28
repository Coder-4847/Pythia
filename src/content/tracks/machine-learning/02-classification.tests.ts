import { call, check } from '@/content/helpers'

export default {
  e1: [
    check('returns four pieces of the right size', String.raw`from sklearn.datasets import load_iris
X, y = load_iris(return_X_y=True)
parts = ns["split"](X, y)
assert len(parts) == 4, "Return X_train, X_test, y_train, y_test."
X_train, X_test, y_train, y_test = parts
assert len(X_train) == len(y_train) == 112 and len(X_test) == len(y_test) == 38, f"With test_size=0.25 of 150 flowers expected 112 and 38, got {len(X_train)} and {len(X_test)}."`),
    check('matches the reference split', String.raw`from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np
X, y = load_iris(return_X_y=True)
want = train_test_split(X, y, test_size=0.25, random_state=0)
got = ns["split"](X, y)
assert all(np.array_equal(a, b) for a, b in zip(want, got)), "Use test_size=0.25 and random_state=0 so the split is the same as the reference."`, { hidden: true }),
    check('works on small data too', String.raw`parts = ns["split"](list(range(8)), list(range(8)))
assert len(parts[1]) == 2 and len(parts[0]) == 6`, { hidden: true }),
  ],
  e2: [
    call('accuracy', [[1, 0, 1, 1], [1, 1, 1, 0]], 0.5),
    call('accuracy', [[1, 2], [1, 2]], 1.0),
    call('accuracy', [[], []], 0.0),
    call('accuracy', [[0, 0, 0], [1, 1, 1]], 0.0, { hidden: true }),
    call('accuracy', [['a', 'b', 'b'], ['a', 'b', 'a']], 2 / 3, { hidden: true }),
    check('no library', String.raw`assert "sklearn" not in src and "numpy" not in src, "Write it yourself."`, { hidden: true }),
  ],
  e3: [
    check('a sensible accuracy for k = 3', String.raw`acc = ns["knn_accuracy"](3)
assert isinstance(acc, float), f"Return a float, not {type(acc).__name__}."
assert 0.9 <= acc <= 1.0, f"k-NN does well on iris (over 90%), but your function returned {acc:.3f}."`),
    check('different k', String.raw`for k in (1, 5, 11):
    acc = ns["knn_accuracy"](k)
    assert 0.85 <= acc <= 1.0, f"k={k} should also score highly, but got {acc:.3f}."`, { hidden: true }),
    check('scores on held-out data, not the training data', String.raw`import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
X, y = load_iris(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42)
want = KNeighborsClassifier(n_neighbors=1).fit(Xa, ya).score(Xb, yb)
got = ns["knn_accuracy"](1)
assert abs(got - want) < 1e-9, f"With k=1 expected {want:.4f} (scored on the test set), but got {got:.4f}. Did you score on the training data?"`, { hidden: true }),
  ],
  e4: [
    check('a setosa', String.raw`r = ns["predict_species"]([5.1, 3.5, 1.4, 0.2])
assert r == "setosa", f"Expected 'setosa', got {r!r}."`),
    check('a virginica', String.raw`r = ns["predict_species"]([6.5, 3.0, 5.8, 2.2])
assert r == "virginica", f"Expected 'virginica', got {r!r}."`),
    check('a versicolor', String.raw`r = ns["predict_species"]([5.9, 2.8, 4.3, 1.3])
assert r == "versicolor", f"Expected 'versicolor', got {r!r}."`, { hidden: true }),
    check('returns plain text', String.raw`assert type(ns["predict_species"]([5.0, 3.4, 1.5, 0.2])) is str`, { hidden: true }),
  ],
}
