---
id: linear-regression
module: ml-first-models
title: Fitting a line
minutes: 20
goal: Fit a straight line to data with scikit-learn, predict with it, and measure how wrong it is.
summary: The simplest machine-learning model, and the idea behind all the others.
---

# Concept

**Machine learning** is finding a rule from examples instead of writing the rule by hand. The simplest rule is a straight line: `price = slope × size + intercept`. Given examples of sizes and prices, we let the computer find the `slope` and `intercept` that fit best.

```python run
import numpy as np
from sklearn.linear_model import LinearRegression

sizes = np.array([[50], [70], [90], [110]])      # features: a column of numbers (2D!)
prices = np.array([150, 210, 270, 330])          # targets: what we want to predict

model = LinearRegression()
model.fit(sizes, prices)                         # learn from the examples
print(model.coef_, model.intercept_)             # slope and intercept
print(model.predict([[100]]))                    # predict an unseen house
```

The pattern is the same for nearly every scikit-learn model:

1. **Create** the model.
2. **`fit(X, y)`**: learn from the examples. `X` is the *features* (always 2D: rows are examples, columns are features) and `y` is the *target*.
3. **`predict(X_new)`**: use what it learned.

```diagram
{"type":"flow","caption":"The scikit-learn pattern","steps":[{"label":"model = LinearRegression()","detail":"create"},{"label":"model.fit(X, y)","detail":"learn from examples"},{"label":"model.predict(X_new)","detail":"answer for new data"}]}
```

### How good is the fit?

A model is never perfect. We measure the **error**: how far each prediction is from the truth. The **mean squared error** (MSE) averages the squares of those gaps (squaring makes every gap positive, and punishes big misses more):

```python run
y_true = [3, 5, 7]
y_pred = [2, 5, 9]
errors = [(t - p) ** 2 for t, p in zip(y_true, y_pred)]
print(errors, sum(errors) / len(errors))
```

Another score, **R²**, says how much of the variation in the data the model explains: 1.0 is perfect, 0.0 is no better than always guessing the average.

> **Careful:** `fit` wants `X` as a **2D** array: `[[50], [70]]`, not `[50, 70]`. If you see "Expected 2D array, got 1D array", that's the cause. Use `X.reshape(-1, 1)` or a list of one-item lists. And remember: a line fitted to data that isn't linear will happily give confident-looking wrong answers.

# Example: Fit and compare

```python example
import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1, 2, 3, 4, 5])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])        # roughly y = 2x

model = LinearRegression().fit(x.reshape(-1, 1), y)
print(round(float(model.coef_[0]), 3), round(float(model.intercept_), 3))
print(model.predict([[6]]).round(2))
print(round(model.score(x.reshape(-1, 1), y), 4))   # R squared
```

`x.reshape(-1, 1)` turns a flat array into a column ("as many rows as needed, one column"). The slope comes out close to 2, and `score` returns R².

# Exercise: Fit a line {#e1}

Define `fit_line(xs, ys)` that fits a straight line with `LinearRegression` and returns `(slope, intercept)`, both **rounded to 2 decimals**, as plain Python floats. `xs` and `ys` are flat lists.

```python starter
from sklearn.linear_model import LinearRegression

# Define fit_line(xs, ys)
```

```python solution
from sklearn.linear_model import LinearRegression

def fit_line(xs, ys):
    X = [[x] for x in xs]
    model = LinearRegression().fit(X, ys)
    return round(float(model.coef_[0]), 2), round(float(model.intercept_), 2)
```

## Hints

1. What shape does `fit` need for the features?
2. How do you turn `[1, 2, 3]` into `[[1], [2], [3]]`?
3. Wrap each `x` in its own list, call `fit`, then read `coef_[0]` and `intercept_`.

## Explanation

The features must be 2D, one row per example. `coef_` is an array with one slope per feature; with a single feature, that's `coef_[0]`. `float()` converts NumPy's number into a plain Python float.

# Exercise: Predict a price {#e2}

Define `predict_price(area)` that trains a `LinearRegression` on these examples (inside the function is fine) and returns the predicted price for `area`, rounded to the nearest whole number:

```python
areas  = [[50], [70], [90], [110]]
prices = [150, 210, 270, 330]
```

```python starter
from sklearn.linear_model import LinearRegression

# Define predict_price(area)
```

```python solution
from sklearn.linear_model import LinearRegression

areas = [[50], [70], [90], [110]]
prices = [150, 210, 270, 330]

def predict_price(area):
    model = LinearRegression().fit(areas, prices)
    return round(float(model.predict([[area]])[0]))
```

## Hints

1. Follow the pattern: create, fit, predict.
2. What shape must the thing you pass to `predict` have?
3. `predict` also wants a 2D input: `[[area]]`, and returns an array, so take the first item.

## Explanation

The examples follow `price = 3 × area`, so the model learns slope 3 and predicts `300` for an area of 100. `predict` returns an array even for one input.

# Exercise: Mean squared error {#e3}

Define `mean_squared_error(y_true, y_pred)` (without any library) that returns the average of the squared differences between the two lists. `mean_squared_error([3, 5, 7], [2, 5, 9])` is `5/3 ≈ 1.6667`.

```python starter
# Define mean_squared_error(y_true, y_pred)
```

```python solution
def mean_squared_error(y_true, y_pred):
    total = 0
    for t, p in zip(y_true, y_pred):
        total += (t - p) ** 2
    return total / len(y_true)
```

## Hints

1. Work out each difference first, then combine them.
2. Which function pairs up two lists item by item?
3. Square each `t - p`, add them all up, and divide by how many there are.

## Explanation

`zip` walks both lists together. Squaring removes the sign, so over- and under-predictions both count as errors, and the final division makes it an average.

# Exercise: R squared {#e4}

Define `r_squared(y_true, y_pred)` (no library) that returns `1 - SS_res / SS_tot`, where `SS_res` is the sum of squared differences between truth and prediction, and `SS_tot` is the sum of squared differences between each true value and the **mean** of the true values.

```python starter
# Define r_squared(y_true, y_pred)
```

```python solution
def r_squared(y_true, y_pred):
    mean = sum(y_true) / len(y_true)
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    ss_tot = sum((t - mean) ** 2 for t in y_true)
    return 1 - ss_res / ss_tot
```

## Hints

1. Two sums of squares: how wrong the model is, and how much the data varies on its own.
2. What's the "no-brainer" prediction that SS_tot compares against?
3. SS_tot uses the average of `y_true` as if it were the prediction for every point.

## Explanation

`SS_tot` is the error you'd make by always guessing the average. A model that beats that has `SS_res < SS_tot`, giving R² between 0 and 1; a perfect model has `SS_res = 0`, so R² is exactly 1.

# Quiz

## What shape does `fit(X, y)` expect for `X`?

- [ ] A flat list of numbers
- [x] A 2D array: one row per example, one column per feature
- [ ] A dictionary

Explanation: Even with a single feature, `X` is a column: `[[50], [70], [90]]`.

## What does a mean squared error of 0 mean?

- [ ] The model never ran
- [x] Every prediction was exactly right
- [ ] The data was empty

Explanation: All the differences are zero, so their squares and average are zero.

## What does `model.predict([[100]])` return?

- [ ] A single number
- [x] An array with one predicted value
- [ ] The slope

Explanation: `predict` always returns an array, one prediction per row you give it.
