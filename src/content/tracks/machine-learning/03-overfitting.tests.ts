import { check } from '@/content/helpers'

const recipe = String.raw`from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.tree import DecisionTreeClassifier
def reference(depth):
    X, y = load_iris(return_X_y=True)
    Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=1)
    t = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(Xa, ya)
    return t.score(Xa, ya), t.score(Xb, yb)
def ref_cv(depth):
    X, y = load_iris(return_X_y=True)
    return cross_val_score(DecisionTreeClassifier(max_depth=depth, random_state=0), X, y, cv=5).mean()
`

export default {
  e1: [
    check('returns a pair of accuracies', `${recipe}
r = ns["scores"](3)
assert isinstance(r, tuple) and len(r) == 2, "Return a tuple (train_accuracy, test_accuracy)."
want = reference(3)
assert abs(r[0] - want[0]) < 1e-9 and abs(r[1] - want[1]) < 1e-9, f"For depth 3 expected {want}, got {r}."`),
    check('an unlimited tree memorises the training data', `${recipe}
train, test = ns["scores"](None)
assert train == 1.0, f"An unlimited tree should score 100% on its own training data, but got {train}."
assert test <= 1.0`, { hidden: true }),
    check('a stump cannot', `${recipe}
train, test = ns["scores"](1)
assert train < 0.8, f"A depth-1 tree is too simple to score well even on its training data, but got {train}."`, { hidden: true }),
    check('plain floats', `${recipe}
assert all(type(v) is float for v in ns["scores"](2))`, { hidden: true }),
  ],
  e2: [
    check('depth 1 has no overfitting gap', `${recipe}
g = ns["gap"](1)
a, b = reference(1)
assert abs(g - (a - b)) < 1e-9, f"For depth 1 expected {a - b:.4f}, got {g:.4f}."`),
    check('a deep tree has a gap', `${recipe}
g = ns["gap"](None)
a, b = reference(None)
assert abs(g - (a - b)) < 1e-9 and g > 0, f"A tree with no limit should do better on training than test data. Got {g:.4f}."`),
    check('train minus test, in that order', `${recipe}
a, b = reference(4)
assert abs(ns["gap"](4) - (a - b)) < 1e-9, "The gap is train accuracy minus test accuracy."`, { hidden: true }),
  ],
  e3: [
    check('mean cross-validated accuracy', `${recipe}
got, want = ns["cv_score"](3), ref_cv(3)
assert abs(got - want) < 1e-9, f"For depth 3 expected {want:.4f}, got {got:.4f}. Use cross_val_score(model, X, y, cv=5).mean()."`),
    check('another depth', `${recipe}
assert abs(ns["cv_score"](1) - ref_cv(1)) < 1e-9`, { hidden: true }),
    check('uses the whole dataset', `${recipe}
assert 0.9 < ns["cv_score"](4) <= 1.0`, { hidden: true }),
    check('uses cross_val_score', String.raw`assert "cross_val_score" in src and "cv=5" in src.replace(" ", ""), "Use cross_val_score(..., cv=5)."`, { hidden: true }),
  ],
  e4: [
    check('picks the best depth', `${recipe}
depths = [1, 2, 3, 4, 5]
best = ns["best_depth"](depths)
top = max(ref_cv(d) for d in depths)
assert best in depths and abs(ref_cv(best) - top) < 1e-9, f"best_depth returned {best}, whose score is not the highest."`),
    check('ties go to the smaller depth', `${recipe}
depths = [6, 7, 8, 9]
best = ns["best_depth"](depths)
top = max(ref_cv(d) for d in depths)
smallest = min(d for d in depths if abs(ref_cv(d) - top) < 1e-12)
assert best == smallest, f"Several depths tie; expected the smallest ({smallest}) but got {best}."`),
    check('works on one candidate', `${recipe}
assert ns["best_depth"]([3]) == 3`, { hidden: true }),
    check('order of the list does not matter', `${recipe}
assert ns["best_depth"]([5, 1, 3, 2]) == ns["best_depth"]([1, 2, 3, 5])`, { hidden: true }),
  ],
}
