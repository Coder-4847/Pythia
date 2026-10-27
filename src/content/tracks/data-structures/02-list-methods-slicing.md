---
id: list-methods-slicing
module: ds-lists
title: List methods and slicing
minutes: 15
goal: Slice lists, add and remove items with methods, split and join text, and avoid the shared-list trap.
summary: Cut lists into pieces, grow and shrink them, and learn why copying matters.
---

# Concept

### Slicing

Slices work on lists just like on strings: `items[start:stop]` takes from `start` up to (not including) `stop`, and always gives back a **new list**.

```python run
nums = [10, 20, 30, 40, 50]
print(nums[1:4])
print(nums[:2])
print(nums[-2:])
print(nums[::2])
print(nums[::-1])
```

### Growing and shrinking

| Method | Does |
|---|---|
| `append(x)` | add `x` at the end |
| `insert(i, x)` | add `x` at position `i` |
| `extend(other)` | add every item of `other` |
| `pop()` / `pop(i)` | remove and **return** the last item / item at `i` |
| `remove(x)` | remove the first item equal to `x` |
| `sort()` / `reverse()` | reorder in place |
| `count(x)` / `index(x)` | how many / where is the first |

```python run
queue = ["a", "b", "c"]
queue.append("d")
queue.insert(0, "start")
first = queue.pop(0)
print(first, queue)
queue.remove("c")
print(queue)
```

`+` joins two lists into a new one, and `*` repeats:

```python run
print([1, 2] + [3])
print([0] * 4)
```

### Text to list and back

`split()` turns a string into a list of words, and `"sep".join(list)` goes the other way:

```python run
words = "the quick brown fox".split()
print(words)
print("-".join(words))
print("a,b,c".split(","))
```

### The shared-list trap

Assigning a list to another name does **not** copy it. Both names point at the *same* list:

```python run
a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(a is b)
```

Changing `b` changed `a`, because they're one list. To get an independent copy, make a new list:

```python run
a = [1, 2, 3]
b = a.copy()        # or list(a), or a[:]
b.append(4)
print(a, b)
```

```diagram
{"type":"boxes","caption":"b = a  →  two names, one list","items":[{"name":"a","value":"[1, 2, 3, 4]","note":"same list"},{"name":"b","value":"[1, 2, 3, 4]","note":"same list"}]}
```

> **Careful:** this aliasing is behind many "why did my data change?!" bugs, especially when you pass a list into a function that modifies it. When a list changes somewhere you didn't expect, Pythia will ask: "do these two names refer to the same list?"

# Example: A waiting line

```python example
line = ["Ada", "Grace", "Linus"]

line.append("Margaret")
served = line.pop(0)
print("Served:", served)
print("Still waiting:", line)

backup = line.copy()
line.clear()
print("line:", line, "| backup:", backup)
```

`pop(0)` removes and returns the first item. `copy()` made `backup` independent, so `clear()` didn't empty it.

# Exercise: Cut the list {#e1}

For `nums = [1, 2, 3, 4, 5, 6]`, create `first_three` (the first three items) and `last_two` (the last two items) with slices.

```python starter
nums = [1, 2, 3, 4, 5, 6]

# Create first_three and last_two
```

```python solution
nums = [1, 2, 3, 4, 5, 6]

first_three = nums[:3]
last_two = nums[-2:]
```

## Hints

1. The same slice syntax you used on strings works here.
2. Which side of the colon can you leave empty for "from the beginning", and which for "to the end"?
3. The first slice stops at index 3. The second uses a negative start and no stop.

## Explanation

`nums[:3]` is the items at indexes 0, 1 and 2. `nums[-2:]` starts two from the end and runs to the end.

# Exercise: Make a real copy {#e2}

`a` should stay `[1, 2, 3]`, but the starter code changes it by accident. Make `b` an **independent copy** of `a` so that after `b.append(4)`, `a` is still `[1, 2, 3]` and `b` is `[1, 2, 3, 4]`.

```python starter
a = [1, 2, 3]
b = a
b.append(4)
```

```python solution
a = [1, 2, 3]
b = a.copy()
b.append(4)
```

## Hints

1. After `b = a`, how many lists exist in memory?
2. What would you need to create so that `b` has its own list?
3. Replace the plain assignment with a method (or conversion) that builds a new list with the same items.

## Explanation

`b = a` only gives the list a second name. `a.copy()` builds a new list, so appending to `b` can't affect `a`.

# Exercise: Rotate {#e3}

Define `rotate(items)` that returns a **new** list with the first item moved to the end: `rotate([1, 2, 3])` returns `[2, 3, 1]`. An empty list stays empty. The original list must not change.

```python starter
# Define rotate(items)
```

```python solution
def rotate(items):
    return items[1:] + items[:1]
```

## Hints

1. Think of the result as two pieces: "everything except the first" and "just the first".
2. Which two slices give you those pieces, and how do you join lists?
3. Take the slice starting at index 1, then add the slice holding only the first item.

## Explanation

`items[1:]` is everything after the first; `items[:1]` is a one-item list holding the first (or `[]` if the list is empty, which makes the empty case work for free). `+` builds a new list, leaving `items` untouched.

# Exercise: Serve the queue {#e4}

`queue = ["a", "b", "c"]`. Remove the **first** item from the list and store it in `served`, so that `served` is `"a"` and `queue` is `["b", "c"]`.

```python starter
queue = ["a", "b", "c"]

# Create served and update queue
```

```python solution
queue = ["a", "b", "c"]

served = queue.pop(0)
```

## Hints

1. One operation should both take the item out and tell you what it was.
2. Which method removes an item and returns it?
3. Call it on `queue`, passing the position of the item you want, and assign the result to `served`.

## Explanation

`pop(0)` removes the item at index 0 and returns it, so one line both updates `queue` and sets `served`.

# Quiz

## What does `[1, 2, 3, 4][1:3]` give?

- [ ] `[1, 2, 3]`
- [x] `[2, 3]`
- [ ] `[2, 3, 4]`

Explanation: It starts at index 1 and stops before index 3: the items at indexes 1 and 2.

## After `a = [1]`, `b = a`, `b.append(2)`, what is `a`?

- [ ] `[1]`
- [x] `[1, 2]`
- [ ] An error

Explanation: `b = a` doesn't copy. Both names refer to the same list, so the append is visible through either.

## What does `"a-b-c".split("-")` return?

- [ ] `"abc"`
- [x] `["a", "b", "c"]`
- [ ] `["a-b-c"]`

Explanation: `split` cuts the string at each separator and returns the pieces as a list.
