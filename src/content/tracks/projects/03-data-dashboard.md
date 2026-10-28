---
id: data-dashboard
module: prj-builds
title: Project: a sales dashboard
minutes: 28
goal: Load CSV data with pandas, answer questions about it, and put the answers on a chart.
summary: From raw rows to a two-panel dashboard, using everything from the data-science track.
---

# Concept

A **dashboard** is a few charts and numbers that answer the questions someone actually has. Here the question is about sales: *how do we do month by month, and which product earns the most?*

The data arrives as text in **CSV** form (comma-separated values), the format spreadsheets export. `pandas` reads it straight into a DataFrame:

```python run
import io
import pandas as pd

csv_text = """month,product,amount
2024-01,pens,120
2024-01,books,300
2024-02,pens,150
2024-02,books,280
2024-03,pens,90
"""

df = pd.read_csv(io.StringIO(csv_text))
print(df)
print(df.dtypes)
```

`io.StringIO(text)` makes a string behave like a file, so you don't need a real file here. With a real file you'd write `pd.read_csv("sales.csv")`.

### Answering questions

Every question is a `groupby`, as in the pandas lesson:

```python run
import io
import pandas as pd

df = pd.read_csv(io.StringIO("month,product,amount\n2024-01,pens,120\n2024-01,books,300\n2024-02,pens,150\n"))
print(df.groupby("month")["amount"].sum())
print(df.groupby("product")["amount"].sum().idxmax())    # the label with the biggest total
```

### Two charts, one figure

`plt.subplots(1, 2)` gives a figure with two axes side by side, so one picture can hold a trend line and a comparison:

```python run
import matplotlib.pyplot as plt

fig, (trend, compare) = plt.subplots(1, 2, figsize=(9, 3.5))
trend.plot(["Jan", "Feb", "Mar"], [420, 430, 90], marker="o")
trend.set_title("Sales by month")
compare.bar(["books", "pens"], [580, 360])
compare.set_title("Sales by product")
fig.tight_layout()
plt.show()
```

```diagram
{"type":"flow","caption":"From file to picture","steps":[{"label":"read_csv","detail":"text becomes a DataFrame"},{"label":"groupby + sum","detail":"one number per month, one per product"},{"label":"two axes","detail":"a line for the trend, bars for the comparison"}]}
```

> **Careful:** always **look at your data first** (`df.head()`, `df.dtypes`). A column that looks numeric but was read as text, a missing header, or extra blank rows will quietly break everything after. Summaries are only as good as the table they came from.

# Example: Putting it together

```python example
import io
import pandas as pd
import matplotlib.pyplot as plt

CSV = """month,product,amount
2024-01,pens,120
2024-01,books,300
2024-02,pens,150
2024-02,books,280
2024-03,pens,90
2024-03,books,310
"""

df = pd.read_csv(io.StringIO(CSV))
by_month = df.groupby("month")["amount"].sum()
by_product = df.groupby("product")["amount"].sum()

fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3.5))
left.plot(by_month.index, by_month.values, marker="o")
left.set_title("Sales by month")
right.bar(by_product.index, by_product.values)
right.set_title("Sales by product")
fig.tight_layout()
plt.show()
print("Best product:", by_product.idxmax())
```

`.index` holds the group labels and `.values` the totals: exactly the x and y that Matplotlib needs.

# Exercise: Load the data {#e1}

Define `load(csv_text)` that returns a DataFrame parsed from the CSV text (the first line is the header).

```python starter
import io
import pandas as pd

# Define load(csv_text)
```

```python solution
import io
import pandas as pd

def load(csv_text):
    return pd.read_csv(io.StringIO(csv_text))
```

## Hints

1. pandas can read CSV; the trick is giving it text instead of a file.
2. Which standard-library tool makes a string look like a file?
3. Wrap the text in `io.StringIO(...)` and hand it to `pd.read_csv`.

## Explanation

`StringIO` is an in-memory file. `read_csv` then handles the header, the commas and the types of each column.

# Exercise: Monthly totals {#e2}

Define `monthly_totals(df)` that returns a **dictionary** from month to the total `amount` for that month.

```python starter
import pandas as pd

# Define monthly_totals(df)
```

```python solution
import pandas as pd

def monthly_totals(df):
    return df.groupby("month")["amount"].sum().to_dict()
```

## Hints

1. Group the rows, then add up one column.
2. Which column do you group by, and which do you sum?
3. `groupby("month")["amount"].sum()`, converted with `to_dict()`.

## Explanation

`groupby` splits by month, `sum` collapses each month's amounts, and `to_dict()` gives a plain dictionary.

# Exercise: Best product {#e3}

Define `best_product(df)` that returns the **name of the product** with the largest total `amount` across all months.

```python starter
import pandas as pd

# Define best_product(df)
```

```python solution
import pandas as pd

def best_product(df):
    return df.groupby("product")["amount"].sum().idxmax()
```

## Hints

1. Total per product first.
2. Which method returns the *label* of the biggest value, rather than the value itself?
3. Group by product, sum, then `idxmax()`.

## Explanation

`idxmax()` returns the index label (here the product name) of the maximum value; `max()` would only give the number.

# Exercise: The dashboard {#e4}

Define `dashboard(df)` that returns a Matplotlib **figure** with **two axes**: the first a line chart of the monthly totals (title `"Sales by month"`), the second a bar chart of the product totals (title `"Sales by product"`).

```python starter
import matplotlib.pyplot as plt

# Define dashboard(df)
```

```python solution
import matplotlib.pyplot as plt

def dashboard(df):
    by_month = df.groupby("month")["amount"].sum()
    by_product = df.groupby("product")["amount"].sum()
    fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3.5))
    left.plot(by_month.index, by_month.values, marker="o")
    left.set_title("Sales by month")
    right.bar(by_product.index, by_product.values)
    right.set_title("Sales by product")
    fig.tight_layout()
    return fig
```

## Hints

1. One figure, two axes next to each other.
2. What do `groupby` results give you for x and for y?
3. `.index` for the labels and `.values` for the numbers; `plt.subplots(1, 2)` for the two axes; return the figure.

## Explanation

Each panel answers one question. Returning the figure makes the dashboard easy to show or save, and easy to test.

# Quiz

## What does `io.StringIO(text)` let you do?

- [ ] Convert text to numbers
- [x] Treat a string as if it were a file
- [ ] Download the text

Explanation: Functions like `pd.read_csv` accept file-like objects, so an in-memory string works too.

## `df.groupby("product")["amount"].sum().idxmax()` returns...

- [ ] The biggest amount
- [x] The product whose total is biggest
- [ ] The number of products

Explanation: `idxmax` gives the label (index) where the maximum occurs.

## What should you do right after loading new data?

- [ ] Nothing, pandas is always right
- [x] Look at it: `head()`, `dtypes`, shape
- [ ] Sort it

Explanation: Spotting wrong types or odd rows early saves confusing bugs later.
