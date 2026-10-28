---
id: matplotlib-plots
module: sci-plots
title: Plotting with Matplotlib
minutes: 18
goal: Draw labelled line, bar and comparison charts.
summary: Turn numbers into pictures people can read at a glance.
---

# Concept

A chart makes a pattern visible that a column of numbers hides. **Matplotlib** is Python's standard plotting library. In Pythia the picture appears right in the console when your program finishes.

```python run
import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5]
height = [2.0, 3.1, 4.9, 7.2, 9.8]

fig, ax = plt.subplots()
ax.plot(days, height)
ax.set_title("A bean plant")
ax.set_xlabel("Day")
ax.set_ylabel("Height (cm)")
plt.show()
```

### Figure and axes

`plt.subplots()` gives you two objects:

- the **figure**: the whole canvas;
- the **axes** (`ax`): one chart on it, with the lines, bars, labels and axes.

You draw by calling methods on `ax`. A good chart always has a **title** and **labelled axes with units**.

### Chart types

```python run
import matplotlib.pyplot as plt

fig, (left, right) = plt.subplots(1, 2, figsize=(8, 3))
left.bar(["Mon", "Tue", "Wed"], [5, 9, 4])         # compare categories
left.set_title("Bars: categories")
right.scatter([1, 2, 3, 4], [2, 4, 5, 9])          # relationship between two numbers
right.set_title("Scatter: relationships")
plt.show()
```

| Use | Method |
|---|---|
| change over time / a trend | `ax.plot(x, y)` |
| compare categories | `ax.bar(labels, values)` |
| relationship between two numbers | `ax.scatter(x, y)` |

### Several series

Give each line a `label` and call `ax.legend()` to show which is which:

```python run
import matplotlib.pyplot as plt

x = [1, 2, 3]
fig, ax = plt.subplots()
ax.plot(x, [1, 2, 3], label="steady")
ax.plot(x, [1, 4, 9], label="accelerating")
ax.legend()
plt.show()
```

> **Careful:** plotting code that leaves out the labels is the most common mistake: nobody can tell what the axes mean. And an empty chart usually means you forgot `plt.show()`, or you plotted before creating the axes. In a function, return the `ax` so callers (and tests) can inspect or adjust the chart.

# Example: A function that draws

```python example
import matplotlib.pyplot as plt

def squares_chart(n):
    xs = list(range(1, n + 1))
    ys = [x * x for x in xs]
    fig, ax = plt.subplots()
    ax.plot(xs, ys, marker="o")
    ax.set_title(f"Squares up to {n}")
    ax.set_xlabel("n")
    ax.set_ylabel("n squared")
    return ax

ax = squares_chart(6)
plt.show()
print(ax.get_title())
```

Returning `ax` makes the function reusable: the caller can show it, save it, or change it.

# Exercise: A labelled line {#e1}

Define `growth_chart(days, heights)` that draws a line chart of `heights` against `days`, with the title `"Growth"`, the x label `"Day"` and the y label `"Height (cm)"`, and **returns the axes**.

```python starter
import matplotlib.pyplot as plt

# Define growth_chart(days, heights)
```

```python solution
import matplotlib.pyplot as plt

def growth_chart(days, heights):
    fig, ax = plt.subplots()
    ax.plot(days, heights)
    ax.set_title("Growth")
    ax.set_xlabel("Day")
    ax.set_ylabel("Height (cm)")
    return ax
```

## Hints

1. Create the axes, draw, label, return.
2. Which methods set the title and the two axis labels?
3. `ax.plot(days, heights)`, then `set_title`, `set_xlabel`, `set_ylabel`, and `return ax`.

## Explanation

Everything you do to the chart goes through the `ax` object. Returning it lets the caller work with the chart afterwards.

# Exercise: A bar chart {#e2}

Define `bar_chart(labels, values)` that draws one bar per label and **returns the axes**. Title it `"Totals"`.

```python starter
import matplotlib.pyplot as plt

# Define bar_chart(labels, values)
```

```python solution
import matplotlib.pyplot as plt

def bar_chart(labels, values):
    fig, ax = plt.subplots()
    ax.bar(labels, values)
    ax.set_title("Totals")
    return ax
```

## Hints

1. Which kind of chart compares categories?
2. What two lists does it take?
3. `ax.bar(labels, values)`, then set the title and return `ax`.

## Explanation

`ax.bar` draws a rectangle per value and uses the labels as the tick text on the x axis.

# Exercise: Two lines, one legend {#e3}

Define `compare_chart(x, first, second)` that plots two lines against the same `x`, labelled `"first"` and `"second"`, shows a **legend**, and returns the axes.

```python starter
import matplotlib.pyplot as plt

# Define compare_chart(x, first, second)
```

```python solution
import matplotlib.pyplot as plt

def compare_chart(x, first, second):
    fig, ax = plt.subplots()
    ax.plot(x, first, label="first")
    ax.plot(x, second, label="second")
    ax.legend()
    return ax
```

## Hints

1. A legend needs to know the name of each line.
2. Where do you give a line its name?
3. Pass `label="..."` to each `ax.plot`, and call `ax.legend()` once at the end.

## Explanation

`label` attaches a name to a plotted line, and `ax.legend()` draws the key from all labelled items.

# Quiz

## What are the *figure* and the *axes*?

- [ ] Two names for the same thing
- [x] The figure is the whole canvas; the axes is one chart drawn on it
- [ ] The figure is the data; the axes are the labels

Explanation: A figure can hold several axes (several charts).

## Which chart best compares sales in four cities?

- [ ] A line chart
- [x] A bar chart
- [ ] A scatter plot

Explanation: Bars are for comparing separate categories.

## What do you need so a legend can show which line is which?

- [ ] `ax.title(...)`
- [x] A `label=` on each plotted line, then `ax.legend()`
- [ ] A different colour for each line

Explanation: The legend lists the labels you gave.
