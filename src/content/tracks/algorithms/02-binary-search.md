---
id: binary-search
module: alg-search
title: Binary search
minutes: 18
goal: Find an item in a sorted list by repeatedly halving the search area.
summary: Look up a name in a million entries in about twenty steps.
---

# Concept

How do you find a word in a dictionary? You don't read from page one. You open it in the middle, see whether your word comes before or after, and throw away the half that can't contain it. Then repeat.

That is **binary search**, and it only works because the list is **sorted**.

```python run
def linear_search(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1

print(linear_search([2, 5, 8, 12, 16, 23, 38], 23))
```

`linear_search` checks items one by one: for a million items, up to a million checks. Binary search does it in about twenty.

```python run
def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1          # target is in the right half
        else:
            high = middle - 1         # target is in the left half
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38], 23))
print(binary_search([2, 5, 8, 12, 16, 23, 38], 7))
```

```diagram
{"type":"flow","caption":"Looking for 23 in [2, 5, 8, 12, 16, 23, 38]","steps":[{"label":"middle is 12","detail":"23 is bigger: keep the right half"},{"label":"middle is 23","detail":"found it"}]}
```

### How it works

`low` and `high` mark the part of the list that could still contain the target. Each loop looks at the middle. A match ends the search; otherwise one half is discarded by moving `low` up or `high` down. When `low` passes `high` there is nothing left: the target isn't there.

Each step halves the area, so a list of `n` items needs about `log₂(n)` steps: 1,000 items need ~10, a million need ~20, a billion need ~30.

> **Careful:** the two classic bugs are `low = middle` (instead of `middle + 1`), which can loop forever, and a loop condition of `low < high`, which misses the last candidate. And never use binary search on an **unsorted** list: it will quietly return wrong answers.

# Example: Counting the steps

```python example
def steps_to_find(items, target):
    low, high = 0, len(items) - 1
    steps = 0
    while low <= high:
        steps += 1
        middle = (low + high) // 2
        if items[middle] == target:
            return steps
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return steps

numbers = list(range(1, 1_000_001))
print(steps_to_find(numbers, 777_777))
print(steps_to_find(numbers, 1))
```

A million sorted numbers, and the answer is found in around twenty steps.

# Exercise: Binary search {#e1}

Define `binary_search(items, target)` for a sorted list. Return the **index** of `target`, or `-1` if it isn't there.

```python starter
# Define binary_search(items, target)
```

```python solution
def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1
```

## Hints

1. You need to track which part of the list is still possible.
2. After looking at the middle item, how do you decide which half to keep?
3. Use two indexes, `low` and `high`, loop while `low <= high`, and move one of them past the middle each time.

## Explanation

Each comparison discards half of what's left. The loop ends either by finding the target, or when the range becomes empty.

# Exercise: Does it exist? {#e2}

Define `contains(items, target)` for a sorted list that returns `True` or `False`, using binary search (not `in`).

```python starter
# Define contains(items, target)
```

```python solution
def contains(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return True
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return False
```

## Hints

1. This is the same search with a different answer.
2. What do you return at the end if the range became empty?
3. Same loop as before, but return `True` on a match and `False` after the loop.

## Explanation

The search logic doesn't change; only what it reports does. Many real tasks are a small twist on the same idea.

# Exercise: The first one at least this big {#e3}

Define `first_at_least(items, x)` for a sorted list: return the **index of the first item that is `>= x`**, or `len(items)` if every item is smaller. `first_at_least([1, 3, 3, 8], 3)` is `1`, and `first_at_least([1, 3], 10)` is `2`.

```python starter
# Define first_at_least(items, x)
```

```python solution
def first_at_least(items, x):
    low, high = 0, len(items)
    while low < high:
        middle = (low + high) // 2
        if items[middle] < x:
            low = middle + 1
        else:
            high = middle
    return low
```

## Hints

1. You're not looking for an exact match, but for a boundary between "too small" and "big enough".
2. If the middle item is too small, what do you know about everything to its left?
3. Keep a range `[low, high)` that could contain the answer; too small moves `low` past the middle, otherwise `high` becomes the middle.

## Explanation

The answer is the position where the items stop being smaller than `x`. Keeping `high` as a candidate (never `middle - 1`) is what makes duplicates and "not found" come out right. This "lower bound" search is how Python's `bisect_left` works.

# Exercise: Guess the number {#e4}

A friend thinks of a number between `low` and `high` (inclusive). Define `count_guesses(secret, low, high)` that plays the *halving* strategy: guess the middle `(low + high) // 2`; if it's the secret, stop; if the guess is too small, search above it; otherwise below it. Return **how many guesses** it took.

```python starter
# Define count_guesses(secret, low, high)
```

```python solution
def count_guesses(secret, low, high):
    guesses = 0
    while low <= high:
        guess = (low + high) // 2
        guesses += 1
        if guess == secret:
            return guesses
        if guess < secret:
            low = guess + 1
        else:
            high = guess - 1
    return guesses
```

## Hints

1. You're running binary search, but counting instead of returning an index.
2. When should the counter go up?
3. Add one for every middle guess you make, and return the count on the guess that equals the secret.

## Explanation

Binary search needs at most about `log₂(100) ≈ 7` guesses for a number between 1 and 100, which is why "higher / lower" guessing games are so quick when you play them well.

# Quiz

## What must be true of a list before you can binary-search it?

- [ ] It has no duplicates
- [x] It is sorted
- [ ] It contains only numbers

Explanation: Discarding half the list is only valid if you know which half the target would be in.

## About how many steps does binary search need for 1,000,000 items?

- [ ] About 1,000,000
- [ ] About 1,000
- [x] About 20

Explanation: Each step halves the range, and 2²⁰ is a little over a million.

## What goes wrong if you write `low = middle` instead of `low = middle + 1`?

- [ ] Nothing, it's equivalent
- [x] The search range may stop shrinking, so the loop can run forever
- [ ] It returns the wrong type

Explanation: When `middle` equals `low`, nothing changes, so the loop repeats the same state.
