---
id: dict-set-comprehensions
module: ds-comprehensions
title: Dict and set comprehensions
minutes: 13
goal: Build dictionaries and sets with comprehensions, and choose between a comprehension and a loop.
summary: The same one-line idea, for dictionaries and sets.
---

# Concept

The comprehension idea isn't limited to lists. Swap the brackets, and you build other collections.

### Dictionary comprehensions

Curly braces with `key: value` before the `for`:

```python run
squares = {n: n * n for n in range(1, 6)}
print(squares)

words = ["ada", "grace", "linus"]
print({w: len(w) for w in words})
```

Read it as: *"for each `n`, make the entry `n → n * n`"*.

### Filtering a dictionary

Loop over `.items()` and filter on key or value:

```python run
scores = {"Ada": 92, "Grace": 78, "Linus": 85}
passed = {name: s for name, s in scores.items() if s >= 80}
print(passed)

curved = {name: s + 5 for name, s in scores.items()}
print(curved)
```

### Inverting a dictionary

```python run
codes = {"a": 1, "b": 2, "c": 3}
print({value: key for key, value in codes.items()})
```

### Set comprehensions

Curly braces with a *single* expression: duplicates collapse automatically.

```python run
words = ["apple", "fig", "pear", "kiwi", "plum"]
print({len(w) for w in words})
print(sorted({w[0] for w in words}))
```

### Which brackets?

| Brackets | Inside | Builds |
|---|---|---|
| `[ ... ]` | `expr for ...` | a list |
| `{ ... }` | `expr for ...` | a set |
| `{ ... }` | `key: value for ...` | a dict |
| `( ... )` | `expr for ...` | a *generator*, which produces items lazily (see Intermediate Python) |

> **Careful:** `{}` is an empty dict, and `{x for x in ...}` is a set. A trailing colon inside the braces is the difference. If you get a dict when you wanted a set (or the other way round), look at whether there is a `key: value` pair.

### Nested comprehensions

A comprehension can have more than one `for`. They read in the **same order as nested loops**:

```python run
pairs = [(a, b) for a in range(3) for b in range(2)]
print(pairs)
```

That's equal to a loop over `a` with a loop over `b` inside it. Use this sparingly: two `for`s is about the readable limit.

# Example: Summarising orders

```python example
orders = [
    ("Ada", 30), ("Grace", 45), ("Ada", 12), ("Linus", 8), ("Grace", 5),
]

totals = {}
for name, amount in orders:
    totals[name] = totals.get(name, 0) + amount
print(totals)

big_spenders = {name for name, total in totals.items() if total >= 40}
print(sorted(big_spenders))

labels = {name: ("VIP" if total >= 40 else "regular") for name, total in totals.items()}
print(labels)
```

The totals need a loop (each order updates an entry). Once they exist, a set comprehension and a dict comprehension each answer a question in one line.

# Exercise: Square lookup {#e1}

Define `square_map(n)` that returns a dictionary mapping each whole number from `1` to `n` (inclusive) to its square: `square_map(3)` returns `{1: 1, 2: 4, 3: 9}`.

```python starter
# Define square_map(n)
```

```python solution
def square_map(n):
    return {i: i * i for i in range(1, n + 1)}
```

## Hints

1. Each number produces one dictionary entry. What are its key and value?
2. How do you include `n` itself in the range?
3. Curly braces, a `key: value` pair, then `for i in range(1, n + 1)`.

## Explanation

`i: i * i` makes an entry for each `i`, and `n + 1` makes the range include `n`.

# Exercise: Distinct lengths {#e2}

Define `unique_lengths(words)` that returns a **set** of the different word lengths in the list: `unique_lengths(["a", "bb", "c"])` returns `{1, 2}`.

```python starter
# Define unique_lengths(words)
```

```python solution
def unique_lengths(words):
    return {len(w) for w in words}
```

## Hints

1. The result must have no duplicates. Which collection guarantees that?
2. Which brackets and what form of comprehension builds that collection?
3. Curly braces with only an expression (no colon), for each word in the list.

## Explanation

A set comprehension adds each `len(w)`, and duplicate lengths collapse into one.

# Exercise: Keep the passes {#e3}

Define `passed(scores, minimum)` that returns a **dictionary** with only the entries of `scores` whose value is at least `minimum`.

```python starter
# Define passed(scores, minimum)
```

```python solution
def passed(scores, minimum):
    return {name: s for name, s in scores.items() if s >= minimum}
```

## Hints

1. You're filtering entries, so which view of the dictionary gives you both key and value?
2. What does the condition compare?
3. Loop over `.items()`, rebuild the same `key: value` pair, and keep it only if the value passes.

## Explanation

Looping over `items()` gives each name and score; the trailing `if` keeps the ones meeting the minimum. Keys and values come through unchanged.

# Exercise: Index the words {#e4}

Define `first_letters(words)` that returns a dictionary mapping each word to its **first letter**: `first_letters(["ada", "bo"])` returns `{"ada": "a", "bo": "b"}`.

```python starter
# Define first_letters(words)
```

```python solution
def first_letters(words):
    return {w: w[0] for w in words}
```

## Hints

1. Each word is a key. What is its value?
2. Which index gives the first character?
3. `word: word[0]` for each word in the list, inside curly braces.

## Explanation

The key is the word itself and the value is `w[0]`, its first character. (Words must be non-empty here, since `""[0]` is an `IndexError`.)

# Quiz

## What does `{x: x * 2 for x in [1, 2]}` build?

- [ ] A set
- [x] A dictionary `{1: 2, 2: 4}`
- [ ] A list

Explanation: The `key: value` pair before the `for` makes it a dictionary comprehension.

## What does `{len(w) for w in ["a", "b", "cc"]}` give?

- [ ] `{1, 1, 2}`
- [x] `{1, 2}`
- [ ] `[1, 1, 2]`

Explanation: It's a set comprehension, so the duplicate length 1 appears only once.

## What is `{}`?

- [ ] An empty set
- [x] An empty dictionary
- [ ] An error

Explanation: Use `set()` for an empty set. `{}` is an empty dict.
