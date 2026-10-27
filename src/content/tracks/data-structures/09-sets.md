---
id: sets
module: ds-sets
title: Sets
minutes: 13
goal: Use sets to remove duplicates, test membership quickly, and combine collections with union, intersection and difference.
summary: Unordered collections of unique items, great for "have I seen this?" and "what do these share?".
---

# Concept

A **set** holds *unique* items, in no particular order. You write one with curly braces, or make one from any other collection with `set()`:

```python run
colors = {"red", "green", "blue", "red"}
print(colors)
print(len(colors))

numbers = set([3, 1, 3, 2, 1])
print(numbers)
```

The duplicates vanished. That's the classic use: **removing duplicates**.

### Adding, removing, testing

```python run
tags = {"python", "code"}
tags.add("learn")
tags.add("python")      # already there: nothing happens
tags.discard("code")    # no error if missing
print(tags)
print("python" in tags)
print("java" in tags)
```

`in` on a set is extremely fast, even with millions of items, while `in` on a list has to check items one by one.

> **Careful:** `{}` on its own is an empty **dictionary**, not an empty set. Write `set()` for an empty set. Also, sets are unordered, so there is no `tags[0]`, and the order they print in may surprise you. If you need order, `sorted(my_set)` gives a list.

### Set operations

Sets work like the Venn diagrams from school:

| Expression | Meaning |
|---|---|
| `a \| b` | **union**: everything in either |
| `a & b` | **intersection**: in both |
| `a - b` | **difference**: in `a` but not in `b` |
| `a ^ b` | in exactly one of them |

```python run
python_fans = {"Ada", "Grace", "Linus"}
js_fans = {"Linus", "Brendan"}

print(sorted(python_fans | js_fans))
print(sorted(python_fans & js_fans))
print(sorted(python_fans - js_fans))
print(sorted(python_fans ^ js_fans))
```

Methods work too: `a.union(b)`, `a.intersection(b)`, `a.difference(b)`, and the handy test `a.issubset(b)`.

### Items must be unchangeable

Like dictionary keys, set items must be hashable: strings, numbers and tuples are fine; lists aren't.

### Dedupe while keeping order

`set(items)` loses the order. To keep the first occurrence of each item, track what you've seen:

```python run
items = ["b", "a", "b", "c", "a"]
seen = set()
unique = []
for item in items:
    if item not in seen:
        seen.add(item)
        unique.append(item)
print(unique)
```

# Example: Comparing two classes

```python example
class_a = {"Ada", "Grace", "Linus", "Margaret"}
class_b = {"Grace", "Margaret", "Alan"}

print("Both:", sorted(class_a & class_b))
print("Only A:", sorted(class_a - class_b))
print("Everyone:", len(class_a | class_b))
print("Is Grace in A?", "Grace" in class_a)
```

Each operation answers a different "who?" question in one expression, which would take a loop with lists. We `sorted()` before printing to get a predictable order.

# Exercise: How many different? {#e1}

Define `unique_count(items)` that returns how many **different** items a list contains: `unique_count([1, 2, 2, 3, 3, 3])` is `3`.

```python starter
# Define unique_count(items)
```

```python solution
def unique_count(items):
    return len(set(items))
```

## Hints

1. Which collection automatically throws duplicates away?
2. Once duplicates are gone, how do you count what's left?
3. Convert the list to that collection, then take its length.

## Explanation

`set(items)` keeps one copy of each distinct value, and `len` counts them. An empty list gives 0.

# Exercise: In common {#e2}

Define `common(a, b)` that returns a **sorted list** of the items that appear in both lists `a` and `b`, with no duplicates.

```python starter
# Define common(a, b)
```

```python solution
def common(a, b):
    return sorted(set(a) & set(b))
```

## Hints

1. "In both" is a question about overlap. Which set operation answers it?
2. Sets have no order, but the function must return an ordered list. What can fix that?
3. Intersect the two sets and pass the result through `sorted`.

## Explanation

`set(a) & set(b)` is the intersection, which already has no duplicates. `sorted(...)` turns it into an ordered list.

# Exercise: Only in the first {#e3}

Define `only_in_first(a, b)` that returns a sorted list of the items in `a` that are **not** in `b`.

```python starter
# Define only_in_first(a, b)
```

```python solution
def only_in_first(a, b):
    return sorted(set(a) - set(b))
```

## Hints

1. This is the "except" question, and the order of the two collections matters.
2. Which set operator removes the items of one set from another?
3. Subtract the set of `b` from the set of `a`, then sort the result.

## Explanation

`set(a) - set(b)` keeps the items of `a` that don't appear in `b`. Swapping the operands would give a different answer.

# Exercise: Any repeats? {#e4}

Define `has_duplicates(items)` that returns `True` if any value appears more than once in the list, and `False` otherwise.

```python starter
# Define has_duplicates(items)
```

```python solution
def has_duplicates(items):
    return len(set(items)) != len(items)
```

## Hints

1. If there are no repeats, how does the number of distinct items compare to the total?
2. What changes when there *is* a repeat?
3. Compare the length of the set built from the list with the length of the list itself.

## Explanation

A list with no repeats has as many distinct items as items. Any repeat makes the set shorter, so the two lengths differ.

# Quiz

## What does `{1, 2, 2, 3}` contain?

- [ ] `1, 2, 2, 3`
- [x] `1, 2, 3`
- [ ] An error

Explanation: A set keeps just one copy of each value.

## How do you create an **empty** set?

- [ ] `{}`
- [x] `set()`
- [ ] `[]`

Explanation: `{}` creates an empty dictionary. Use `set()` for an empty set.

## What is `{1, 2, 3} & {2, 3, 4}`?

- [ ] `{1, 2, 3, 4}`
- [x] `{2, 3}`
- [ ] `{1, 4}`

Explanation: `&` is the intersection: just the items in both sets.
