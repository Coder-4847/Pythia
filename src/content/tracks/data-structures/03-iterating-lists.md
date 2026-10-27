---
id: iterating-lists
module: ds-lists
title: Looping over lists
minutes: 14
goal: Walk through a list with for, and use common patterns: totals, counting, filtering and enumerate.
summary: The patterns behind almost every data-processing program.
---

# Concept

`for item in my_list:` visits every item, in order. It's the most common way to use a list:

```python run
names = ["Ada", "Grace", "Linus"]
for name in names:
    print("Hello,", name)
```

You don't use an index at all: you get the items themselves.

### Built-in helpers

A few functions summarise a list of numbers without any loop:

```python run
scores = [72, 85, 90, 64]
print(sum(scores))
print(min(scores), max(scores))
print(len(scores))
print(sum(scores) / len(scores))
```

But much of the time you need your own loop, and a handful of patterns cover most of the cases.

### Pattern 1: accumulate

Start with an "empty" value, update it for each item:

```python run
total = 0
for price in [3, 5, 8]:
    total += price
print(total)
```

### Pattern 2: count the matches

```python run
count = 0
for n in [5, 12, 7, 20, 3]:
    if n > 6:
        count += 1
print(count)
```

### Pattern 3: build a new list (filter / transform)

Start with an empty list, `append` what you want:

```python run
numbers = [5, -2, 8, -7, 3]
positives = []
for n in numbers:
    if n > 0:
        positives.append(n)
print(positives)
```

### Pattern 4: find the best

Keep the best-so-far, replace it when you see a better one:

```python run
words = ["pear", "banana", "fig"]
longest = words[0]
for w in words:
    if len(w) > len(longest):
        longest = w
print(longest)
```

### enumerate: item and position together

When you need the index as well, don't write `range(len(items))`. Use `enumerate`:

```python run
for i, name in enumerate(["Ada", "Grace"], start=1):
    print(i, name)
```

> **Careful:** don't add or remove items from a list **while looping over it**: the loop skips items or misbehaves. Build a new list instead (Pattern 3). Pythia watches for this one.

# Example: Statistics by hand

```python example
temps = [18, 22, 19, 25, 21]

hottest = temps[0]
total = 0
warm_days = 0

for t in temps:
    total += t
    if t > hottest:
        hottest = t
    if t >= 21:
        warm_days += 1

print("Average:", total / len(temps))
print("Hottest:", hottest)
print("Warm days:", warm_days)
```

One pass through the list updates three different results at once. Notice `hottest` starts at the first item rather than 0, so it works even if all the values are negative.

# Exercise: Total price {#e1}

Define `total_price(prices)` that returns the sum of a list of numbers, using a loop (not `sum`).

```python starter
# Define total_price(prices)
```

```python solution
def total_price(prices):
    total = 0
    for price in prices:
        total += price
    return total
```

## Hints

1. Where will the running result be kept, and what is its value for an empty list?
2. What must happen for each item in the list?
3. Start a total at 0, add each price inside a loop, and return the total *after* the loop.

## Explanation

The accumulator starts at 0, which is also the right answer for an empty list. The `return` is outside the loop, so it only happens once every item has been added.

# Exercise: How many are big? {#e2}

Define `count_above(numbers, limit)` that returns how many numbers in the list are **strictly greater** than `limit`.

```python starter
# Define count_above(numbers, limit)
```

```python solution
def count_above(numbers, limit):
    count = 0
    for n in numbers:
        if n > limit:
            count += 1
    return count
```

## Hints

1. This is a counting task: what do you keep track of?
2. Which comparison decides whether an item counts, and what about numbers equal to the limit?
3. Initialise a counter, add one inside an `if` for each number greater than `limit`, and return the counter.

## Explanation

`n > limit` is strict, so items equal to the limit aren't counted. The counter is returned after the loop.

# Exercise: Keep the positives {#e3}

Define `positives(numbers)` that returns a **new list** with only the numbers greater than zero, in their original order.

```python starter
# Define positives(numbers)
```

```python solution
def positives(numbers):
    result = []
    for n in numbers:
        if n > 0:
            result.append(n)
    return result
```

## Hints

1. You're producing a different list from the one you're given. Where does that list start?
2. How do you decide whether to keep an item, and how do you keep it?
3. Start with an empty list, append each number that is above zero, and return the list afterwards.

## Explanation

The empty list `result` collects the keepers. The original `numbers` list isn't modified, which is the safe approach.

# Exercise: Longest word {#e4}

Define `longest_word(words)` that returns the longest string in a non-empty list. If there is a tie, return the **first** of the longest.

```python starter
# Define longest_word(words)
```

```python solution
def longest_word(words):
    best = words[0]
    for word in words:
        if len(word) > len(best):
            best = word
    return best
```

## Hints

1. Which word do you start with as "the best so far"?
2. When should the best-so-far be replaced? What about equal lengths?
3. Start with the first word and replace it only when a word is strictly longer.

## Explanation

Starting from `words[0]` avoids inventing a fake starting value. Using `>` rather than `>=` keeps the earlier word on ties.

# Exercise: Numbered list {#e5}

Define `numbered(items)` that returns a list of strings like `["1. milk", "2. eggs"]`: each item prefixed with its position, counting from 1. Use `enumerate`.

```python starter
# Define numbered(items)
```

```python solution
def numbered(items):
    result = []
    for i, item in enumerate(items, start=1):
        result.append(f"{i}. {item}")
    return result
```

## Hints

1. You need each item together with its position.
2. By default positions start at 0. How can you change where counting starts?
3. Loop with two variables over `enumerate(items, start=1)` and append an f-string for each.

## Explanation

`enumerate` hands out `(position, item)` pairs, and `start=1` makes the first position 1. Each pair becomes a string appended to the result.

# Quiz

## Which is the best way to loop over a list's items?

- [ ] `for i in range(len(items)): print(items[i])`
- [x] `for item in items: print(item)`
- [ ] `while items: print(items)`

Explanation: Looping directly over the items is shorter and removes index mistakes. Use `enumerate` if you need positions too.

## What does `enumerate(["a", "b"])` produce?

- [ ] `"a", "b"`
- [x] Pairs: `(0, "a")` then `(1, "b")`
- [ ] `0, 1`

Explanation: Each pair holds the position and the item.

## What goes wrong if you remove items from a list while looping over it?

- [ ] Nothing
- [x] The loop can skip items
- [ ] Python refuses to run

Explanation: Removing shifts later items left under the loop's feet, so some are never visited. Build a new list instead.
