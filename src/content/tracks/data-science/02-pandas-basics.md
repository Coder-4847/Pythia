---
id: pandas-basics
module: sci-pandas
title: Tables with pandas
minutes: 20
goal: Filter, sort, group and extend a DataFrame without writing loops.
summary: Answer questions about a table of data in a line or two.
---

# Concept

**pandas** gives Python a spreadsheet-like table: the **DataFrame**. Rows are records, columns are fields, and each column holds one type of data.

```python run
import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Grace", "Linus", "Guido"],
    "age": [36, 45, 17, 29],
    "score": [91, 88, 72, 85],
})
print(df)
print(df.shape)
```

### Columns and rows

```python run
import pandas as pd

df = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "age": [36, 45, 17], "score": [91, 88, 72]})
print(df["score"])                 # one column (a Series)
print(df["score"].mean())          # summaries
print(df[["name", "score"]])       # several columns: a list inside the brackets
```

### Filtering rows

Comparing a column with a value gives a True/False column; use it to pick rows (the same mask idea as NumPy):

```python run
import pandas as pd

df = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "age": [36, 45, 17], "score": [91, 88, 72]})
adults = df[df["age"] >= 18]
print(adults)
print(df[(df["age"] >= 18) & (df["score"] > 90)])   # combine with & and |, each in brackets
```

### Sorting

```python run
import pandas as pd

df = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "score": [91, 88, 72]})
print(df.sort_values("score", ascending=False))
print(df.sort_values("score", ascending=False).head(2))
```

### Groups

`groupby` splits the rows by a column, then summarises each group:

```python run
import pandas as pd

sales = pd.DataFrame({"city": ["Rome", "Oslo", "Rome", "Oslo"], "amount": [10, 7, 30, 3]})
print(sales.groupby("city")["amount"].sum())
print(sales.groupby("city")["amount"].mean().to_dict())
```

```diagram
{"type":"flow","caption":"split, apply, combine","steps":[{"label":"groupby(\"city\")","detail":"split the rows into one group per city"},{"label":"[\"amount\"].sum()","detail":"summarise each group"},{"label":"one row per city","detail":"combined into a new table"}]}
```

### New columns

Assigning to a new column name creates it, calculated for every row at once:

```python run
import pandas as pd

shop = pd.DataFrame({"item": ["pen", "book"], "price": [1.5, 12.0], "qty": [10, 2]})
shop["total"] = shop["price"] * shop["qty"]
print(shop)
```

> **Careful:** use `&` and `|` (not `and`/`or`) to combine filters, with each condition in its own brackets. And filtering or assigning to a slice of a DataFrame may modify the original, or warn you: when you want to change a copy, call `.copy()` first.

# Example: Which city sells most?

```python example
import pandas as pd

sales = pd.DataFrame({
    "city": ["Rome", "Oslo", "Rome", "Oslo", "Paris"],
    "amount": [10, 7, 30, 3, 12],
})
totals = sales.groupby("city")["amount"].sum().sort_values(ascending=False)
print(totals)
print("Best:", totals.index[0], totals.iloc[0])
```

`groupby` totals each city; sorting descending puts the best first; `.index` holds the city names and `.iloc[0]` the first value.

# Exercise: Adults only {#e1}

Define `adults(df)` that returns the rows of `df` where the `age` column is at least 18.

```python starter
import pandas as pd

# Define adults(df)
```

```python solution
import pandas as pd

def adults(df):
    return df[df["age"] >= 18]
```

## Hints

1. Build a True/False condition from a column.
2. How do you use that condition to pick rows?
3. Put the comparison inside the square brackets after the DataFrame.

## Explanation

`df["age"] >= 18` is a boolean Series; indexing the DataFrame with it keeps only the matching rows.

# Exercise: Average by group {#e2}

Define `average_by(df, group, value)` that returns a **dictionary** mapping each value of the `group` column to the mean of the `value` column for that group.

```python starter
import pandas as pd

# Define average_by(df, group, value)
```

```python solution
import pandas as pd

def average_by(df, group, value):
    return df.groupby(group)[value].mean().to_dict()
```

## Hints

1. Split by one column, summarise another.
2. Which method splits the rows into groups?
3. `groupby(...)`, pick the value column, take the mean, then convert with `to_dict()`.

## Explanation

`groupby(group)[value].mean()` gives a Series indexed by group, and `to_dict()` turns it into the plain dictionary asked for.

# Exercise: Top scorers {#e3}

Define `top_n(df, column, n)` that returns the `n` rows with the **largest** values in `column`, largest first.

```python starter
import pandas as pd

# Define top_n(df, column, n)
```

```python solution
import pandas as pd

def top_n(df, column, n):
    return df.sort_values(column, ascending=False).head(n)
```

## Hints

1. Two steps: put them in order, then keep a few.
2. Which `sort_values` option puts the biggest first?
3. Sort by the column with `ascending=False`, then `head(n)`.

## Explanation

Sorting descending moves the largest values to the top, and `head(n)` keeps the first `n` rows. If there are fewer than `n` rows, you simply get them all.

# Exercise: Add a total column {#e4}

Define `with_total(df)` that returns a **copy** of `df` with a new column `total` equal to `price * qty` for each row. The original must not gain the column.

```python starter
import pandas as pd

# Define with_total(df)
```

```python solution
import pandas as pd

def with_total(df):
    result = df.copy()
    result["total"] = result["price"] * result["qty"]
    return result
```

## Hints

1. A new column is created by assigning to a name that doesn't exist yet.
2. How do you avoid changing the DataFrame you were given?
3. Make a `.copy()` first, then assign `copy["total"] = ...` using the two columns.

## Explanation

Multiplying two columns works row by row. Working on `df.copy()` keeps the caller's table unchanged, which is usually the polite thing to do.

# Quiz

## How do you keep rows where `age` is over 30 and `score` is over 80?

- [ ] `df[df.age > 30 and df.score > 80]`
- [x] `df[(df["age"] > 30) & (df["score"] > 80)]`
- [ ] `df.filter(age > 30, score > 80)`

Explanation: Combine boolean conditions with `&` and put each in brackets; plain `and` doesn't work on columns.

## What does `df.groupby("city")["amount"].sum()` produce?

- [ ] The total of the whole column
- [x] One total per city
- [ ] The rows of the biggest city

Explanation: `groupby` splits by city, then the sum is calculated within each group.

## Why call `.copy()` before adding a column in a function?

- [ ] It makes the code faster
- [x] So the caller's DataFrame isn't changed behind its back
- [ ] It's required by pandas

Explanation: Without a copy, you'd be modifying the table you were passed in.
