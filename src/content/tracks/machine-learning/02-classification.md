---
id: classification
module: ml-first-models
title: Classifying flowers
minutes: 22
goal: Split data into training and test sets, train a classifier, and measure its accuracy honestly.
summary: Predict a category, and learn why you must test on data the model never saw.
---

# Concept

Regression predicts a **number**. **Classification** predicts a **category**: spam or not, which digit, which species of flower. scikit-learn ships small practice datasets; the famous one is **iris**: 150 flowers, four measurements each, and the species.

```python run
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target
print(X.shape, y.shape)               # 150 flowers, 4 measurements
print(iris.feature_names)
print(iris.target_names)              # the three species
print(X[0], iris.target_names[y[0]])
```

### Never grade on the questions you studied

If you learn the answers to 150 questions and are then tested on the *same* 150, a perfect score proves nothing: you may just have memorised them. So we **hold some data back**. The model learns from the **training set** and is scored on the **test set** it has never seen.

```python run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
print(len(X_train), len(X_test))
```

`random_state` fixes the shuffle so you get the same split every run, which makes results reproducible.

### A first classifier: nearest neighbours

**k-nearest neighbours** classifies a new flower by looking at the `k` most similar flowers in the training set and taking a vote. No fancy maths, and it's surprisingly good.

```python run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(predictions[:10])
print((predictions == y_test).mean())      # accuracy: fraction correct
```

```diagram
{"type":"flow","caption":"An honest evaluation","steps":[{"label":"split","detail":"train set and a test set held back"},{"label":"fit on train","detail":"the model never sees the test set"},{"label":"score on test","detail":"accuracy = fraction of correct predictions"}]}
```

**Accuracy** is simply the fraction of predictions that were right. It's an easy number to read, but it can mislead: if 99% of emails aren't spam, a model that always says "not spam" is 99% accurate and useless.

> **Careful:** the number-one mistake is evaluating on the training data. It makes models look better than they are, and it is the reason this lesson (and the next) exists. Never let test data influence how you train or tune.

# Example: Compare values of k

```python example
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

for k in (1, 3, 9, 25):
    model = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)
    print(k, round(model.score(X_test, y_test), 3))
```

`score` on a classifier returns accuracy. Very small `k` is jumpy (one odd neighbour decides), very large `k` blurs the groups together: a trade-off you'll meet again in the next lesson.

# Exercise: Split the data {#e1}

Define `split(X, y)` that returns `X_train, X_test, y_train, y_test` using `train_test_split` with `test_size=0.25` and `random_state=0`.

```python starter
from sklearn.model_selection import train_test_split

# Define split(X, y)
```

```python solution
from sklearn.model_selection import train_test_split

def split(X, y):
    return train_test_split(X, y, test_size=0.25, random_state=0)
```

## Hints

1. scikit-learn already has a function for this.
2. Which two options fix the sizes and the shuffle?
3. Call `train_test_split(X, y, test_size=0.25, random_state=0)` and return its result.

## Explanation

`train_test_split` shuffles and cuts the data, returning four pieces in the order train/test for X and then for y. 25% of 150 rows is 37 or 38 test rows.

# Exercise: Accuracy {#e2}

Define `accuracy(y_true, y_pred)` (no library) returning the **fraction** of positions where the two lists agree. `accuracy([1, 0, 1, 1], [1, 1, 1, 0])` is `0.5`. An empty list gives `0.0`.

```python starter
# Define accuracy(y_true, y_pred)
```

```python solution
def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    correct = 0
    for t, p in zip(y_true, y_pred):
        if t == p:
            correct += 1
    return correct / len(y_true)
```

## Hints

1. Count the hits, then divide by the total.
2. What should happen with no data at all?
3. Handle the empty list first so you never divide by zero; otherwise loop over pairs with `zip` and count the matches.

## Explanation

Accuracy is `correct / total`. Guarding the empty case avoids a `ZeroDivisionError`.

# Exercise: How good is k-NN? {#e3}

Define `knn_accuracy(k)` that loads iris with `load_iris(return_X_y=True)`, splits it with `test_size=0.3, random_state=42`, trains a `KNeighborsClassifier(n_neighbors=k)` on the training part, and returns the accuracy on the test part as a float.

```python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

# Define knn_accuracy(k)
```

```python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

def knn_accuracy(k):
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X_train, y_train)
    return float(model.score(X_test, y_test))
```

## Hints

1. Load, split, create, fit, score.
2. Which part of the data is the model allowed to see while fitting?
3. Fit on `X_train, y_train`; call `model.score(X_test, y_test)`.

## Explanation

`score` evaluates on data the model never trained on, which is what makes the number honest. On iris, nearly any reasonable `k` scores above 90%.

# Exercise: Name that flower {#e4}

Define `predict_species(measurements)` where `measurements` is a list of four numbers (sepal length, sepal width, petal length, petal width). Train a `KNeighborsClassifier(n_neighbors=3)` on **all** the iris data and return the predicted species **name** (like `"setosa"`).

```python starter
from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier

# Define predict_species(measurements)
```

```python solution
from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier

def predict_species(measurements):
    iris = load_iris()
    model = KNeighborsClassifier(n_neighbors=3).fit(iris.data, iris.target)
    label = model.predict([measurements])[0]
    return str(iris.target_names[label])
```

## Hints

1. Predictions are numbers 0, 1, 2. Where do the names live?
2. What shape does `predict` need for one flower?
3. `iris.target_names[label]` turns a number into a name; give `predict` a list containing your one list of four values.

## Explanation

The model works with class numbers; `target_names` translates them back. For a final model you've already evaluated, using all the data to train is normal: more examples, better model.

# Quiz

## Why do we hold back a test set?

- [ ] To make training faster
- [x] To measure how the model does on data it has never seen
- [ ] Because scikit-learn requires it

Explanation: A model's score on its own training data says little: it may have simply memorised it.

## What does `random_state=42` do in `train_test_split`?

- [ ] Makes the split better
- [x] Makes the shuffle repeatable, so you get the same split every time
- [ ] Sets the test size

Explanation: Fixing the random seed makes experiments reproducible.

## In k-nearest neighbours, what is `k`?

- [ ] The number of features
- [x] How many nearby training examples vote on the answer
- [ ] The accuracy

Explanation: The prediction is the most common class among the `k` closest training points.
