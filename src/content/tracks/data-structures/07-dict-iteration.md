---
id: dict-iteration
module: ds-dicts
title: Looping over dictionaries
minutes: 15
goal: Loop over keys, values and items, count and group things with dictionaries, and sort by value.
summary: Walk through a dictionary, and use one to count and group data.
---

# Concept

### Three views

A `for` loop over a dictionary gives its **keys**. Two methods give the other views:

```python run
stock = {"apples": 5, "pears": 0, "figs": 12}

for item in stock:
    print(item)
print("---")
for qty in stock.values():
    print(qty)
print("---")
for item, qty in stock.items():
    print(item, "->", qty)
```

`.items()` gives `(key, value)` pairs you can unpack, which is the form you'll use most.

Dictionaries remember the order in which keys were added, so loops come out in that order.

### Counting with a dictionary

Counting how often each thing appears is *the* classic dictionary job. The pattern is "start from `get(key, 0)` and add one":

```python run
text = "banana"
counts = {}
for letter in text:
    counts[letter] = counts.get(letter, 0) + 1
print(counts)
```

For a new letter `get` gives 0, so it becomes 1; for a letter seen before it gives the old count and adds one. No `KeyError`, no special first-time case.

> **Careful:** writing `counts[letter] += 1` for a new key is a `KeyError`: there's nothing to add to yet. That's why the `get(key, 0)` pattern exists. Pythia will often ask: "what does the dictionary look like the *first* time you see a new key?"

### Grouping

Instead of counting, collect the items that share a key into lists:

```python run
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    first = word[0]
    if first not in groups:
        groups[first] = []
    groups[first].append(word)
print(groups)
```

Here we have to create the empty list the first time a key appears.

### Sorting a dictionary

`sorted` works on any iterable. To order by value, sort the items with a key:

```python run
scores = {"Ada": 82, "Grace": 95, "Linus": 78}
ranked = sorted(scores.items(), key=lambda pair: pair[1], reverse=True)
print(ranked)
print(max(scores, key=scores.get))
```

`max(scores, key=scores.get)` is a compact way to find the key with the largest value.

# Example: Word frequency

```python example
text = "the cat and the hat and the bat"
counts = {}

for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, n in sorted(counts.items(), key=lambda p: p[1], reverse=True):
    print(word, n)
```

`split()` turns the sentence into words, the loop counts them, and the final loop prints them with the most frequent first.

# Exercise: Total stock {#e1}

Define `total_stock(stock)` that returns the sum of all the **values** in a dictionary like `{"apples": 5, "pears": 2}`. Use a loop.

```python starter
# Define total_stock(stock)
```

```python solution
def total_stock(stock):
    total = 0
    for qty in stock.values():
        total += qty
    return total
```

## Hints

1. Which part of each entry do you need: the key or the value?
2. Is there a way to loop over just the values?
3. Start a total at 0 and add each value from the values view.

## Explanation

`stock.values()` yields only the quantities, which you add to a running total. An empty dictionary correctly gives 0.

# Exercise: Count the letters {#e2}

Define `count_letters(text)` that returns a dictionary mapping each character of `text` to how many times it appears: `count_letters("aab")` returns `{"a": 2, "b": 1}`.

```python starter
# Define count_letters(text)
```

```python solution
def count_letters(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    return counts
```

## Hints

1. You need one entry per distinct character, so what will the keys be, and what the values?
2. What should happen the first time a character appears? And the second?
3. For each character, store `counts.get(ch, 0) + 1` under that character in an initially empty dict.

## Explanation

`get(ch, 0)` gives the existing count or 0, and adding one updates it. The pattern handles first and later sightings in a single line.

# Exercise: Who scored most? {#e3}

Define `top_scorer(scores)` that returns the **name** (key) with the highest score in a non-empty dictionary. Scores are all different.

```python starter
# Define top_scorer(scores)
```

```python solution
def top_scorer(scores):
    best_name = None
    best_score = None
    for name, score in scores.items():
        if best_score is None or score > best_score:
            best_name = name
            best_score = score
    return best_name
```

## Hints

1. Keep track of the best entry seen so far while you loop.
2. What are the best-so-far name and score before you've seen anything?
3. Loop over the pairs; replace the best name and score whenever the current score is higher (or no best exists yet).

## Explanation

The loop remembers the best pair. Starting with `None` handles the first pair without inventing a fake minimum. (`max(scores, key=scores.get)` is a one-line alternative.)

# Exercise: Group by length {#e4}

Define `group_by_length(words)` that returns a dictionary mapping each word length to the **list of words** with that length, in their original order: `group_by_length(["a", "bb", "c"])` returns `{1: ["a", "c"], 2: ["bb"]}`.

```python starter
# Define group_by_length(words)
```

```python solution
def group_by_length(words):
    groups = {}
    for word in words:
        n = len(word)
        if n not in groups:
            groups[n] = []
        groups[n].append(word)
    return groups
```

## Hints

1. What is the key, and what kind of value do you store under it?
2. What must exist before you can append to a group for the first time?
3. If the length isn't a key yet, create an empty list for it; then append the word to that list.

## Explanation

The first word of each length creates the empty list, and every word then appends to its group. Words keep their original order within each list.

# Quiz

## What does `for k in {"a": 1, "b": 2}:` give you in `k`?

- [x] The keys: `"a"` then `"b"`
- [ ] The values: 1 then 2
- [ ] Pairs of key and value

Explanation: A plain loop over a dict visits the keys. Use `.values()` or `.items()` for the others.

## Why is `counts[ch] += 1` a bug for a character seen the first time?

- [ ] `+=` doesn't work on dictionaries
- [x] There's no existing value to add to, so it raises a `KeyError`
- [ ] It always adds 2

Explanation: `+=` reads the current value first. `counts.get(ch, 0) + 1` supplies a starting 0.

## What does `max(d, key=d.get)` return?

- [ ] The largest value
- [x] The key with the largest value
- [ ] The largest key

Explanation: `max` compares keys using each key's value (via `d.get`) and returns the winning key.
