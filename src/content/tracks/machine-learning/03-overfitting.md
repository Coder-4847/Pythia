---
id: overfitting
module: ml-first-models
title: Overfitting
minutes: 22
goal: Recognise overfitting from the gap between training and test scores, and tune a model with cross-validation.
summary: A model that memorises its homework fails the exam. Learn to see it coming.
---

# Concept

A model can be **too good at the training data**. If it's flexible enough, it will memorise every quirk and every bit of noise, and then do worse on anything new. That's **overfitting**.

A **decision tree** is a good way to see it: it asks a series of yes/no questions about the features. You control how many questions deep it may go with `max_depth`.

```python run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

for depth in (1, 2, 3, None):
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    print(depth, round(tree.score(X_train, y_train), 3), round(tree.score(X_test, y_test), 3))
```

Each row shows the depth limit, then the accuracy on the **training** set and on the **test** set. `None` means no limit at all.

```diagram
{"type":"flow","caption":"Under-fit, good fit, over-fit","steps":[{"label":"too simple","detail":"low train score, low test score: underfitting"},{"label":"just right","detail":"both scores high and close together"},{"label":"too flexible","detail":"train near 100%, test lower: overfitting"}]}
```

### Reading the gap

- **Both scores low:** the model is too simple (*underfitting*). Give it more freedom.
- **Training score far above test score:** the model memorised (*overfitting*). Give it less freedom, or more data.

The size of the **gap** is the tell. A perfect training score is *not* good news by itself.

### A steadier estimate: cross-validation

One train/test split can be lucky or unlucky. **Cross-validation** splits the data several ways (5 folds), trains and scores on each, and averages:

```python run
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

X, y = load_iris(return_X_y=True)
scores = cross_val_score(DecisionTreeClassifier(max_depth=3, random_state=0), X, y, cv=5)
print(scores.round(3), scores.mean().round(3))
```

> **Careful:** don't pick settings by looking at the test set over and over: each peek leaks a bit of the answer into your choices, and the test score stops being honest. Compare settings with cross-validation on the training data, and use the test set once at the end.

# Example: Finding a good depth

```python example
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

X, y = load_iris(return_X_y=True)
for depth in range(1, 7):
    model = DecisionTreeClassifier(max_depth=depth, random_state=0)
    print(depth, round(cross_val_score(model, X, y, cv=5).mean(), 3))
```

Very shallow trees underfit; past a few levels the score stops improving (and on noisier data it would get worse). The best choice is the **simplest** model that scores well.

# Exercise: Train and test scores {#e1}

Define `scores(depth)` that loads iris, splits it with `test_size=0.3, random_state=1`, trains `DecisionTreeClassifier(max_depth=depth, random_state=0)` on the training part, and returns the tuple `(train_accuracy, test_accuracy)`.

```python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Define scores(depth)
```

```python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

def scores(depth):
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    return float(tree.score(X_train, y_train)), float(tree.score(X_test, y_test))
```

## Hints

1. Two scores from one trained model.
2. Which data goes in each `score` call?
3. `tree.score(X_train, y_train)` and `tree.score(X_test, y_test)`.

## Explanation

`score` is accuracy on whatever data you give it. Comparing the two numbers is how you measure overfitting.

# Exercise: Spot the overfit {#e2}

Define `gap(depth)` that returns how much better the model does on the training set than on the test set: `train_accuracy - test_accuracy` (use the same recipe as `scores`). A **negative or zero** gap means no overfitting.

```python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Define gap(depth)
```

```python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

def gap(depth):
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    return float(tree.score(X_train, y_train) - tree.score(X_test, y_test))
```

## Hints

1. It's the same experiment as before, with a different thing returned.
2. Which of the two scores should be subtracted from which?
3. Return the training score minus the test score.

## Explanation

A big positive gap means the model knows its training data much better than new data: classic overfitting.

# Exercise: Cross-validated score {#e3}

Define `cv_score(depth)` that returns the **mean** 5-fold cross-validation accuracy (`cross_val_score(..., cv=5)`) of `DecisionTreeClassifier(max_depth=depth, random_state=0)` on **all** of iris.

```python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

# Define cv_score(depth)
```

```python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

def cv_score(depth):
    X, y = load_iris(return_X_y=True)
    model = DecisionTreeClassifier(max_depth=depth, random_state=0)
    return float(cross_val_score(model, X, y, cv=5).mean())
```

## Hints

1. `cross_val_score` does the splitting and fitting for you.
2. What does it return, and how do you turn that into one number?
3. Pass the (unfitted) model, `X`, `y` and `cv=5`, then take `.mean()` of the result.

## Explanation

You hand `cross_val_score` an *unfitted* model: it fits a fresh copy on each fold. The mean of the five scores is a steadier estimate than any single split.

# Exercise: Choose the depth {#e4}

Define `best_depth(depths)` that returns the depth from the list with the highest `cv_score`. If several are equally good, return the **smallest** (simpler is better). Reuse the same recipe as in the previous exercise.

```python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

# Define best_depth(depths)
```

```python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

def cv_score(depth):
    X, y = load_iris(return_X_y=True)
    model = DecisionTreeClassifier(max_depth=depth, random_state=0)
    return float(cross_val_score(model, X, y, cv=5).mean())

def best_depth(depths):
    best = None
    best_score = -1.0
    for depth in sorted(depths):
        score = cv_score(depth)
        if score > best_score:
            best, best_score = depth, score
    return best
```

## Hints

1. Score each candidate, and remember the best so far.
2. How do you make ties go to the smaller depth?
3. Go through the depths in increasing order and only replace the best when a score is **strictly** greater.

## Explanation

Checking depths smallest-first, and replacing only on a strictly better score, keeps the simplest of any tie. This is the idea behind *hyperparameter tuning*: try settings, compare honestly, keep the best.

# Quiz

## A model scores 100% on training data and 80% on test data. What is this?

- [ ] Underfitting
- [x] Overfitting
- [ ] A perfect model

Explanation: The big gap shows it learned the training set, noise included, rather than the underlying pattern.

## What does cross-validation do?

- [ ] Trains on the test set
- [x] Splits the data several ways and averages the scores for a steadier estimate
- [ ] Makes the model deeper

Explanation: Averaging over several train/validation splits reduces the luck of any single split.

## Why shouldn't you tune settings by repeatedly checking the test score?

- [ ] It's slow
- [x] Each look leaks information, so the test score stops being an honest estimate
- [ ] scikit-learn forbids it

Explanation: If you choose the setting that scores best on the test set, you've fitted to the test set too.
