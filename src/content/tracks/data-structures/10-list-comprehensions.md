---
id: list-comprehensions
module: ds-comprehensions
title: List comprehensions
minutes: 14
goal: Build lists in one readable line with comprehensions, with and without a filter.
summary: Say what the new list should contain, instead of spelling out the loop.
---

# Concept

You've written this loop many times: start with an empty list, loop, append.

```python run
squares = []
for n in range(1, 6):
    squares.append(n * n)
print(squares)
```

A **list comprehension** does the same job in one line:

```python run
squares = [n * n for n in range(1, 6)]
print(squares)
```

Read it right to left, like a sentence: *"for each `n` in `range(1, 6)`, make `n * n`"*, all wrapped in `[ ]` to build a list.

```diagram
{"type":"flow","caption":"[ n * n   for n in range(1, 6) ]","steps":[{"label":"for n in range(1, 6)","detail":"take each n"},{"label":"n * n","detail":"compute the item"},{"label":"[ ... ]","detail":"collect into a list"}]}
```

### The shape

```python
[ expression  for item in iterable ]
[ expression  for item in iterable  if condition ]
```

- **expression**: what each new item looks like.
- **for ... in ...**: where the items come from.
- **if** (optional): keep only the items that pass.

### Transforming

```python run
words = ["ada", "grace", "linus"]
print([w.upper() for w in words])
print([len(w) for w in words])
print([f"Hi {w.title()}" for w in words])
```

### Filtering

Put the `if` at the end:

```python run
nums = [5, -2, 8, -7, 3, 0]
print([n for n in nums if n > 0])
print([n * 2 for n in nums if n % 2 == 1])
```

The first keeps items unchanged (expression is just `n`). The second filters *and* transforms.

### Choosing between two values

An `if ... else` *inside the expression* decides what each item becomes. Note it sits **before** the `for`:

```python run
nums = [1, 2, 3, 4]
print(["even" if n % 2 == 0 else "odd" for n in nums])
```

> **Careful:** a filter `if` goes at the **end** and removes items; an `if/else` for the value goes at the **front** and keeps every item. Mixing those up is the most common comprehension error. And if a comprehension is getting too long to read at a glance, write the loop instead: clarity beats cleverness.

# Example: Cleaning data

```python example
raw = ["  Ada ", "", "grace", "  ", "LINUS"]

clean = [name.strip().title() for name in raw if name.strip()]
print(clean)

lengths = [len(name) for name in clean]
print(lengths)

print(sum([n for n in range(1, 101) if n % 3 == 0]))
```

The first comprehension drops blank entries (the `if name.strip()` part) and tidies the rest. An empty string and a whitespace-only string are both "falsy" after stripping.

# Exercise: Squares {#e1}

Create `squares`, a list of the squares of the numbers `1` to `10`, using a list comprehension.

```python starter
# Create squares
```

```python solution
squares = [n ** 2 for n in range(1, 11)]
```

## Hints

1. Which two parts do you need: where the numbers come from, and what each becomes?
2. How do you include 10 in a `range`?
3. Write the expression for the square, then `for n in range(...)`, all inside square brackets.

## Explanation

`range(1, 11)` supplies 1 to 10, and `n ** 2` is each item. The result is `[1, 4, 9, ..., 100]`.

# Exercise: Only the evens {#e2}

Define `evens(numbers)` that returns a list of the even numbers from `numbers`, in order, using a comprehension.

```python starter
# Define evens(numbers)
```

```python solution
def evens(numbers):
    return [n for n in numbers if n % 2 == 0]
```

## Hints

1. You're keeping some items unchanged. What is the expression part?
2. How do you express "even" as a condition?
3. Put an `if` with the remainder test after the `for` part.

## Explanation

The expression is just `n`, and the trailing `if n % 2 == 0` filters out odd numbers. The original list isn't modified.

# Exercise: Word lengths {#e3}

Define `lengths(words)` that returns a list holding the length of each word.

```python starter
# Define lengths(words)
```

```python solution
def lengths(words):
    return [len(word) for word in words]
```

## Hints

1. Every word produces exactly one number.
2. Which function measures a word?
3. The expression is the measurement of each word, and the source is the list of words.

## Explanation

There's no filter: every word is kept, but each is replaced by its length.

# Exercise: Shout the long ones {#e4}

Define `shout_long(words)` that returns a list of the words **longer than 3 letters**, converted to upper case and followed by an exclamation mark: `shout_long(["hi", "python", "code"])` returns `["PYTHON!", "CODE!"]`.

```python starter
# Define shout_long(words)
```

```python solution
def shout_long(words):
    return [w.upper() + "!" for w in words if len(w) > 3]
```

## Hints

1. This one needs both a transformation and a filter.
2. Which part of the comprehension changes each item, and which part decides whether to keep it?
3. Put the upper-casing and the `!` in the expression, and the length test in the trailing `if`.

## Explanation

Items that fail `len(w) > 3` are skipped; those that pass are turned into `w.upper() + "!"`.

# Exercise: Label the numbers {#e5}

Define `labels(numbers)` that returns `"positive"` or `"not positive"` for each number: `labels([3, -1, 0])` returns `["positive", "not positive", "not positive"]`.

```python starter
# Define labels(numbers)
```

```python solution
def labels(numbers):
    return ["positive" if n > 0 else "not positive" for n in numbers]
```

## Hints

1. Every number must produce *an item*, so this isn't a filter.
2. How can the item itself depend on a condition?
3. Use the `value_if_true if condition else value_if_false` form as the expression, before the `for`.

## Explanation

The conditional expression sits in the *front* part of the comprehension and picks one of two strings, so every input gets exactly one output.

# Quiz

## What does `[x * 2 for x in [1, 2, 3]]` evaluate to?

- [ ] `[1, 2, 3, 1, 2, 3]`
- [x] `[2, 4, 6]`
- [ ] `6`

Explanation: Each item is doubled, and the results are collected in a new list.

## Which keeps only the positive numbers?

- [ ] `[n if n > 0 for n in nums]`
- [x] `[n for n in nums if n > 0]`
- [ ] `[n > 0 for n in nums]`

Explanation: A filter `if` goes at the end. The last option gives a list of `True`/`False` values instead.

## When should you prefer a plain loop?

- [ ] Never: comprehensions are always better
- [x] When the comprehension gets hard to read at a glance
- [ ] When the list is long

Explanation: Comprehensions are for short, clear transformations. Readability comes first.
