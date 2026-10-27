---
id: sorting-zip
module: ds-lists
title: Sorting and zip
minutes: 14
goal: Sort lists with sorted() and sort(), choose the order with key and reverse, and pair lists with zip().
summary: Put things in order, and walk through two lists side by side.
---

# Concept

### sorted() and .sort()

There are two ways to sort, and the difference matters:

| | Returns | Changes the original? |
|---|---|---|
| `sorted(items)` | a **new** sorted list | no |
| `items.sort()` | `None` | **yes**, in place |

```python run
nums = [3, 1, 2]
print(sorted(nums))
print(nums)
nums.sort()
print(nums)
```

> **Careful:** `nums = nums.sort()` sets `nums` to `None`, just like `append`. Methods that change a list in place return `None` so you don't confuse them with ones that return something new.

### Reverse order

```python run
print(sorted([3, 1, 2], reverse=True))
print(sorted(["pear", "Apple", "fig"]))
```

Strings sort by character code, so uppercase letters come before lowercase: `"Apple"` before `"fig"`, but `"Zebra"` before `"apple"`. To ignore case, sort by a key.

### key: sort by something else

`key=` takes a function that is applied to each item; items are ordered by its result:

```python run
words = ["pear", "fig", "banana", "kiwi"]
print(sorted(words, key=len))
print(sorted(words, key=str.lower))
print(sorted(words, key=len, reverse=True))
```

Python's sort is **stable**: items with equal keys stay in their original order (`pear` before `kiwi`, which are both length 4).

### min and max with key

```python run
words = ["pear", "fig", "banana"]
print(max(words, key=len))
print(min(words))
```

### zip: two lists, side by side

`zip(a, b)` pairs up the items at the same position, and stops at the shorter list:

```python run
names = ["Ada", "Grace", "Linus"]
ages = [36, 85, 54]
for name, age in zip(names, ages):
    print(name, "is", age)
print(list(zip(names, ages)))
```

`zip` gives you pairs as small unchanging groups called *tuples* (the next lesson). Loop with two names to take each pair apart.

# Example: A leaderboard

```python example
names = ["Ada", "Grace", "Linus", "Margaret"]
scores = [82, 95, 78, 95]

pairs = list(zip(scores, names))
pairs.sort(reverse=True)

for rank, (score, name) in enumerate(pairs, start=1):
    print(rank, name, score)
```

Pairs sort by their first item (the score), then by the second to break ties. The loop unpacks `(score, name)` inside `enumerate`: a taste of what's next.

# Exercise: Biggest first {#e1}

Define `sorted_desc(numbers)` that returns the numbers sorted from **largest to smallest**, without changing the original list.

```python starter
# Define sorted_desc(numbers)
```

```python solution
def sorted_desc(numbers):
    return sorted(numbers, reverse=True)
```

## Hints

1. You need a sorted *copy*. Which of the two sorting tools produces one?
2. How do you flip the order?
3. Use the built-in that returns a new list and pass the argument that reverses the order.

## Explanation

`sorted` returns a new list and leaves `numbers` alone. `reverse=True` makes the order descending.

# Exercise: By length {#e2}

Define `by_length(words)` that returns the words sorted from shortest to longest. Words with the same length must keep their original relative order.

```python starter
# Define by_length(words)
```

```python solution
def by_length(words):
    return sorted(words, key=len)
```

## Hints

1. You're not sorting by the words themselves. What are you sorting by?
2. Sorting can take a function that says what to compare. Which function gives a word's size?
3. Pass that function (without calling it) as the `key` argument.

## Explanation

`key=len` tells `sorted` to compare each word's length. Because the sort is stable, equal lengths keep their input order.

# Exercise: Pair them up {#e3}

Define `pairs(names, ages)` that returns a list of `(name, age)` tuples built from the two lists, e.g. `[("Ada", 36), ("Grace", 85)]`.

```python starter
# Define pairs(names, ages)
```

```python solution
def pairs(names, ages):
    return list(zip(names, ages))
```

## Hints

1. Which built-in puts two sequences side by side?
2. What does it return, and how can you turn that into a list?
3. Zip the two lists and wrap the result in `list(...)`.

## Explanation

`zip(names, ages)` produces the pairs lazily, and `list(...)` collects them. If the lists have different lengths, zip stops at the shorter.

# Exercise: Cheapest first {#e4}

`products` is a list of `(name, price)` tuples. Create `cheapest`, the **name** of the product with the lowest price. (Hint: `min` accepts a `key`, and a tuple's items can be indexed.)

```python starter
products = [("tea", 3.5), ("coffee", 4.0), ("water", 1.25)]

# Create cheapest
```

```python solution
products = [("tea", 3.5), ("coffee", 4.0), ("water", 1.25)]

cheapest = min(products, key=lambda p: p[1])[0]
```

## Hints

1. Which built-in finds the smallest item, and what do you want it to compare?
2. The comparison should look at the price, the second item of each tuple. How could `key` do that?
3. A tiny `lambda p: p[1]` gives the price of a pair. After finding the winning tuple, index it for the name.

## Explanation

`key=lambda p: p[1]` makes `min` compare prices. It returns the whole tuple, so `[0]` extracts the name. (A `lambda` is a one-line anonymous function.)

# Quiz

## What does `nums.sort()` return?

- [ ] The sorted list
- [x] `None`
- [ ] A copy of the list

Explanation: `sort()` changes the list in place and returns `None`. Use `sorted(nums)` for a new list.

## What does `sorted(["b", "a", "C"])` return?

- [ ] `["a", "b", "C"]`
- [x] `["C", "a", "b"]`
- [ ] `["C", "b", "a"]`

Explanation: Uppercase letters have smaller character codes than lowercase ones, so `"C"` sorts first. Use `key=str.lower` to ignore case.

## What does `list(zip([1, 2, 3], ["a", "b"]))` give?

- [ ] `[(1, "a"), (2, "b"), (3, None)]`
- [x] `[(1, "a"), (2, "b")]`
- [ ] An error

Explanation: `zip` stops when the shortest input runs out.
