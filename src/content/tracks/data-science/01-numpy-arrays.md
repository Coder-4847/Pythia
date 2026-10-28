---
id: numpy-arrays
module: sci-numpy
title: NumPy arrays
minutes: 18
goal: Create NumPy arrays, do arithmetic on whole arrays at once, and pick values with masks and axes.
summary: Replace loops with one-line operations on whole arrays.
---

# Concept

Python lists are flexible, but slow and clumsy for numbers. **NumPy** adds the `array`: a fixed-type grid of numbers stored compactly, with maths that works on **the whole array at once**.

```python run
import numpy as np

prices = np.array([4.5, 10.0, 3.25, 8.0])
print(prices)
print(prices * 2)          # every item doubled, no loop
print(prices + prices)     # item-by-item addition
print(prices.sum(), prices.mean(), prices.max())
```

Compare with a list: `[4.5, 10.0] * 2` repeats the list, but an array `* 2` multiplies each number. This "do it to everything" style is called **vectorisation**, and it replaces most `for` loops in numeric code.

### Making arrays

```python run
import numpy as np

print(np.arange(0, 10, 2))        # like range, but an array: 0 2 4 6 8
print(np.linspace(0, 1, 5))       # 5 evenly spaced points from 0 to 1
print(np.zeros(3), np.ones(2))
grid = np.array([[1, 2, 3], [4, 5, 6]])
print(grid.shape)                 # (2, 3): 2 rows, 3 columns
```

### Picking values

Arrays index like lists, and you can also pick with a **boolean mask**: a True/False array the same size.

```python run
import numpy as np

scores = np.array([72, 95, 58, 88, 64])
print(scores[0], scores[-1], scores[1:3])

passed = scores >= 70             # an array of True/False
print(passed)
print(scores[passed])             # only the True positions
print(scores[scores > scores.mean()])
```

### Rows and columns: `axis`

For a 2D array, `axis=0` goes **down** the rows (one result per column) and `axis=1` goes **across** (one result per row).

```python run
import numpy as np

sales = np.array([[10, 20, 30],
                  [ 1,  2,  3]])
print(sales.sum(axis=0))   # per column: [11 22 33]
print(sales.sum(axis=1))   # per row:    [60  6]
```

```diagram
{"type":"flow","caption":"axis in a 2D array","steps":[{"label":"axis=0","detail":"collapse the rows: one answer per column"},{"label":"axis=1","detail":"collapse the columns: one answer per row"},{"label":"no axis","detail":"collapse everything to one number"}]}
```

> **Careful:** `array * 2` is arithmetic but `list * 2` is repetition. And a mask must be the same length as the array. Also remember that slices of an array are **views**: changing a slice changes the original (use `.copy()` to get an independent array).

# Example: Standardising

```python example
import numpy as np

heights = np.array([150, 160, 170, 180, 190])
mean = heights.mean()
spread = heights.std()
z = (heights - mean) / spread     # every item at once
print(z.round(2))
print(round(z.mean(), 6), round(z.std(), 6))
```

Subtracting a single number from an array applies it to every item (this is called *broadcasting*). The result has mean 0 and standard deviation 1, a common first step before machine learning.

# Exercise: Build arrays {#e1}

Create `evens`, an array of the even numbers from 2 to 20 (inclusive) using `np.arange`, and `tens`, an array holding each of those multiplied by 10.

```python starter
import numpy as np

# Create evens and tens
```

```python solution
import numpy as np

evens = np.arange(2, 21, 2)
tens = evens * 10
```

## Hints

1. `np.arange(start, stop, step)` works like `range`.
2. Does `stop` include 20?
3. Use a stop of 21 and a step of 2; then multiply the whole array by 10.

## Explanation

Like `range`, the stop value is excluded, so `21` is needed to include 20. Multiplying the array by 10 applies to every item at once.

# Exercise: Standardise {#e2}

Define `standardise(values)` that takes a NumPy array and returns a new array where the mean has been subtracted and the result divided by the standard deviation.

```python starter
import numpy as np

# Define standardise(values)
```

```python solution
import numpy as np

def standardise(values):
    return (values - values.mean()) / values.std()
```

## Hints

1. What two summary numbers do you need?
2. Can you apply a subtraction and a division to the whole array without a loop?
3. Subtract `values.mean()` from the array, then divide by `values.std()`.

## Explanation

Both steps are broadcast over the whole array, and neither modifies the original.

# Exercise: Above average {#e3}

Define `above_average(values)` that returns a NumPy array of only the values that are greater than the mean of all values. Use a boolean mask.

```python starter
import numpy as np

# Define above_average(values)
```

```python solution
import numpy as np

def above_average(values):
    return values[values > values.mean()]
```

## Hints

1. Comparing an array with a number gives an array of True/False.
2. What can you do with such an array?
3. Index the array with the comparison itself: `values[ ... ]`.

## Explanation

`values > values.mean()` is a boolean array, and indexing with it keeps only the `True` positions.

# Exercise: Rows and columns {#e4}

Define `table_stats(table)` for a 2D array. Return a tuple `(row_totals, column_means)`: the sum of each row, and the mean of each column, both as 1D arrays.

```python starter
import numpy as np

# Define table_stats(table)
```

```python solution
import numpy as np

def table_stats(table):
    return table.sum(axis=1), table.mean(axis=0)
```

## Hints

1. One answer per row for the first, one per column for the second.
2. Which `axis` goes across a row?
3. Row totals collapse the columns (`axis=1`); column means collapse the rows (`axis=0`).

## Explanation

`axis` names the dimension that disappears. Summing along `axis=1` collapses each row to a single number; averaging along `axis=0` collapses each column.

# Quiz

## What is `np.array([1, 2, 3]) * 2`?

- [ ] `[1, 2, 3, 1, 2, 3]`
- [x] `array([2, 4, 6])`
- [ ] An error

Explanation: Arithmetic on an array applies to every item, unlike list repetition.

## What does `scores[scores > 70]` give?

- [ ] `True` or `False`
- [x] Only the scores greater than 70
- [ ] The positions of those scores

Explanation: A boolean mask keeps the items where the mask is `True`.

## For a 2D array, what does `a.sum(axis=0)` return?

- [ ] One total per row
- [x] One total per column
- [ ] A single number

Explanation: `axis=0` runs down the rows, collapsing them, so you get one value per column.
