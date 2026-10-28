---
id: big-o
module: alg-complexity
title: How fast does it grow?
minutes: 18
goal: Reason about how the work a function does grows with its input, and pick the faster approach.
summary: Big-O is a way of asking "what happens when the input gets 1,000 times bigger?"
---

# Concept

Two programs can give the same answers and still be wildly different when the data gets big. **Complexity** describes how the amount of work *grows* as the input grows. It ignores machines and stopwatches, and just counts steps.

### Counting steps

```python run
def count_steps_linear(items):
    steps = 0
    for item in items:                 # one step per item
        steps += 1
    return steps

def count_steps_pairs(items):
    steps = 0
    for a in items:
        for b in items:                # n steps for each of n items
            steps += 1
    return steps

for n in (10, 100, 1000):
    data = list(range(n))
    print(n, count_steps_linear(data), count_steps_pairs(data))
```

Ten times more data means **10×** more steps for the first function, but **100×** for the second.

| Name | Written | Example | 10× the data means... |
|---|---|---|---|
| constant | O(1) | `items[0]`, dictionary lookup | the same work |
| logarithmic | O(log n) | binary search | a few more steps |
| linear | O(n) | one loop over the items | 10× the work |
| quadratic | O(n²) | a loop inside a loop | 100× the work |

Big-O keeps only the **fastest-growing part** and drops constants: `3n + 20` is just O(n), and `n² + n` is O(n²).

### The cost of the right data structure

Where you keep the data changes the cost of the same question:

```python run
names = ["ada", "grace", "linus"] * 3
print("grace" in names)           # list: checks items one by one, O(n)
unique = set(names)
print("grace" in unique)          # set: jumps straight there, O(1) on average
```

`x in some_list` scans; `x in some_set` (or a dictionary key) is a direct lookup. Swapping a list for a set or dict is often the single biggest speed-up you can make.

```diagram
{"type":"flow","caption":"Same question, different cost","steps":[{"label":"x in a list","detail":"look at items one by one: O(n)"},{"label":"x in a set","detail":"hash and jump: O(1) on average"},{"label":"in a loop of n","detail":"O(n²) versus O(n) overall"}]}
```

> **Careful:** a nested loop isn't always quadratic, and one loop isn't always cheap. Hidden costs hide in functions you call: `x in a_list`, `list.insert(0, x)`, `sum(...)`, and string `+=` in a loop are each doing a loop for you. Count the work *per call*, then multiply.

# Example: Finding duplicates two ways

```python example
def has_duplicates_slow(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False

def has_duplicates_fast(items):
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False

data = [3, 8, 1, 9, 4, 8]
print(has_duplicates_slow(data), has_duplicates_fast(data))
```

The slow version compares every pair: O(n²). The fast one remembers what it has seen in a set and looks each item up once: O(n). On a list of a million items, that's the difference between seconds and hours.

# Exercise: Count the pairs {#e1}

Define `count_pairs(items)` that returns the number of **pairs** `(i, j)` with `i < j` that you would compare in a nested loop, by actually counting them with two loops. `count_pairs([5, 6, 7])` is `3`.

```python starter
# Define count_pairs(items)
```

```python solution
def count_pairs(items):
    count = 0
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            count += 1
    return count
```

## Hints

1. Each pair must be counted once.
2. How can the inner loop avoid repeating pairs you've already counted?
3. Let `j` start just after `i`, and add one inside the inner loop.

## Explanation

For `n` items there are `n(n-1)/2` pairs, which grows like n². That's the number of comparisons the slow duplicate check does.

# Exercise: Duplicates, fast {#e2}

Define `has_duplicates(items)` returning `True` if any value appears twice. Make it **linear**: use a set to remember what you've seen (no nested loops).

```python starter
# Define has_duplicates(items)
```

```python solution
def has_duplicates(items):
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False
```

## Hints

1. What do you need to remember as you go?
2. Which container answers "have I seen this?" instantly?
3. Check each item against a set; return `True` if it's there, otherwise add it.

## Explanation

Each item is looked up once, in constant time on average, so the total work is proportional to the length of the list.

# Exercise: Two numbers that add up {#e3}

Define `two_sum(numbers, target)` that returns a pair `(i, j)` of **different indexes** (with `i < j`) whose values add up to `target`, or `None` if there's no such pair. Aim for one pass using a dictionary from value to index.

```python starter
# Define two_sum(numbers, target)
```

```python solution
def two_sum(numbers, target):
    seen = {}
    for j, value in enumerate(numbers):
        need = target - value
        if need in seen:
            return (seen[need], j)
        seen[value] = j
    return None
```

## Hints

1. For each number, what other number would complete the target?
2. How can you find out, instantly, whether you've already passed it?
3. Store each value's index in a dictionary as you go; before storing, look up `target - value`.

## Explanation

Instead of trying every pair (quadratic), you ask a question per item: "have I seen the partner?". The dictionary makes that O(1), so the whole thing is O(n).

# Exercise: Most common {#e4}

Define `most_common(items)` that returns the item that appears most often, or `None` for an empty list. If several tie, return the one that **appears first** in the list. Count in a dictionary rather than calling `items.count()` for every item.

```python starter
# Define most_common(items)
```

```python solution
def most_common(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    best = None
    for item in items:
        if best is None or counts[item] > counts[best]:
            best = item
    return best
```

## Hints

1. Two jobs: tally everything once, then choose the winner.
2. Why is calling `.count()` for each item expensive?
3. Build a dictionary of counts in one pass; then walk the list in order and keep the item with the strictly bigger count.

## Explanation

Counting with a dictionary is one pass (O(n)). Using `.count()` inside a loop would re-scan the list for each item, which is O(n²). Walking the original order with a strict `>` keeps the first of any tie.

# Quiz

## A function has one loop over `n` items. Its complexity is...

- [ ] O(1)
- [x] O(n)
- [ ] O(n²)

Explanation: The work grows in proportion to the number of items.

## Which is usually fastest for "is this value present?" on a large collection?

- [ ] A list
- [x] A set or a dictionary
- [ ] A tuple

Explanation: Sets and dictionaries use hashing to jump straight to the value, instead of scanning.

## What does Big-O leave out?

- [ ] The growth rate
- [x] Constant factors and slower-growing terms
- [ ] The size of the input

Explanation: `3n + 20` and `n` grow in the same way for big inputs, so both are called O(n).
