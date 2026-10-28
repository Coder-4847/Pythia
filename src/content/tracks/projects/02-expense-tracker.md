---
id: expense-tracker
module: prj-builds
title: Project: an expense tracker
minutes: 25
goal: Store records as dictionaries in a list and write functions that validate, total, group and report on them.
summary: Track spending, catch bad input, and print a tidy report.
---

# Concept

An expense tracker is the "hello world" of real programs: **data comes in** (often messy), gets **validated**, is **stored**, and is **summarised**. We'll keep every expense as a small dictionary, and all of them in a list:

```python run
expenses = [
    {"name": "coffee", "amount": 3.5, "category": "food"},
    {"name": "bus pass", "amount": 40.0, "category": "travel"},
    {"name": "lunch", "amount": 9.0, "category": "food"},
]

print(len(expenses))
print(sum(e["amount"] for e in expenses))
for e in expenses:
    print(f'{e["name"]:<10}{e["amount"]:>8.2f}')
```

The format `{x:<10}` pads text to ten characters, left-aligned, and `{x:>8.2f}` right-aligns a number in eight characters with two decimals: that's how reports get neat columns.

### The pieces

1. **Add** an expense, rejecting nonsense (an amount that isn't positive).
2. **Total** them.
3. **Group** by category with a dictionary: `totals[category] = totals.get(category, 0) + amount`.
4. **Report**: sort and format.

```diagram
{"type":"flow","caption":"Data in, answers out","steps":[{"label":"add_expense","detail":"validate, then append a dict to the list"},{"label":"total / by_category","detail":"loop and add up"},{"label":"report","detail":"sort and format into aligned lines"}]}
```

> **Careful:** money and floating point don't mix perfectly: `0.1 + 0.2` is `0.30000000000000004`. Real systems store whole cents (integers) or use the `decimal` module. For this project we use floats and **round when displaying** (`:.2f`), and compare totals by rounding too.

# Example: Grouping with get

```python example
expenses = [
    {"name": "coffee", "amount": 3.5, "category": "food"},
    {"name": "bus", "amount": 2.0, "category": "travel"},
    {"name": "lunch", "amount": 9.0, "category": "food"},
]

totals = {}
for e in expenses:
    totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
print(totals)

for category in sorted(totals):
    print(f"{category:<8}{totals[category]:>7.2f}")
```

`totals.get(category, 0)` gives the running total so far, or `0` the first time a category appears. That one line replaces an `if category in totals` check.

# Exercise: Add an expense {#e1}

Define `add_expense(expenses, name, amount, category)` that appends a dictionary with the keys `"name"`, `"amount"` and `"category"` to the list. If `amount` is not greater than zero, raise a `ValueError` instead and add nothing.

```python starter
# Define add_expense(expenses, name, amount, category)
```

```python solution
def add_expense(expenses, name, amount, category):
    if amount <= 0:
        raise ValueError("amount must be positive")
    expenses.append({"name": name, "amount": amount, "category": category})
```

## Hints

1. Check first, then store.
2. Which statement stops a function with an error?
3. `if amount <= 0:` then `raise ValueError(...)`; otherwise `append` a new dictionary.

## Explanation

Validating at the door means the rest of the program can trust the data. Raising an error is better than silently storing a nonsense amount.

# Exercise: Total {#e2}

Define `total(expenses)` that returns the sum of all amounts, rounded to 2 decimals. An empty list gives `0`.

```python starter
# Define total(expenses)
```

```python solution
def total(expenses):
    return round(sum(e["amount"] for e in expenses), 2)
```

## Hints

1. You need every amount, from every dictionary.
2. What built-in adds numbers up?
3. Feed `sum` the `amount` of each expense (a generator expression), then `round(..., 2)`.

## Explanation

Rounding hides the tiny floating-point errors from adding many decimals together.

# Exercise: Totals by category {#e3}

Define `by_category(expenses)` that returns a dictionary mapping each category to the total spent in it (rounded to 2 decimals).

```python starter
# Define by_category(expenses)
```

```python solution
def by_category(expenses):
    totals = {}
    for e in expenses:
        totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
    return {category: round(amount, 2) for category, amount in totals.items()}
```

## Hints

1. A dictionary where each key keeps a running total.
2. What do you use the first time you meet a category?
3. `totals.get(category, 0) + amount`, then round when you build the final dictionary.

## Explanation

`.get(key, 0)` supplies the starting value for a new category. Rounding once at the end, instead of at every step, keeps the numbers accurate.

# Exercise: The report {#e4}

Define `report(expenses)` that returns a multi-line string with one line per category, **sorted by category name**, formatted as the category left-aligned in 10 characters followed by the total right-aligned in 8 characters with 2 decimals, and then a final line `"TOTAL"` padded the same way with the grand total. Lines are joined with `"\n"` and there is no trailing newline.

For `food` 12.5 and `travel` 40, the result is:

```
food         12.50
travel       40.00
TOTAL        52.50
```

```python starter
# Define report(expenses)
```

```python solution
def report(expenses):
    totals = {}
    for e in expenses:
        totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
    lines = [f"{category:<10}{amount:>8.2f}" for category, amount in sorted(totals.items())]
    lines.append(f"{'TOTAL':<10}{sum(totals.values()):>8.2f}")
    return "\n".join(lines)
```

## Hints

1. You already know how to total by category.
2. What format specification pads and aligns?
3. `f"{name:<10}{value:>8.2f}"` for each line, `sorted()` for the order, then `"\n".join(lines)`.

## Explanation

The format spec `<10` pads on the right to ten characters, `>8.2f` right-aligns a two-decimal number in eight. Building a list of lines and joining them avoids a stray trailing newline.

# Quiz

## What does `totals.get(category, 0)` return for a category not yet in `totals`?

- [ ] It raises a `KeyError`
- [x] `0`
- [ ] `None`

Explanation: The second argument is the default for a missing key.

## Why raise an error for a negative amount instead of storing it?

- [ ] Python forbids negative numbers
- [x] Bad data should be stopped at the door, so the rest of the program can trust what's stored
- [ ] To make the program run faster

Explanation: Validating when data enters means you don't need to defend against it everywhere else.

## What does `f"{x:>8.2f}"` do?

- [ ] Rounds `x` to 8 decimals
- [x] Right-aligns `x` in 8 characters with 2 decimals
- [ ] Converts `x` to a string of length 2

Explanation: `>` aligns right, `8` is the width, `.2f` is two decimal places.
