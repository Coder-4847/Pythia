---
id: strings
module: fnd-input
title: Working with text
minutes: 13
goal: Join, repeat, measure, index and slice strings.
summary: Strings are sequences of characters. Join them, count them, and cut out pieces.
---

# Concept

You met strings already: text in quotes. Python gives you a small toolkit for combining and picking apart text.

### Joining and repeating

`+` joins two strings. `*` repeats one:

```python run
first = "Ada"
last = "Lovelace"
print(first + " " + last)
print("ha" * 3)
print("-" * 20)
```

### Length

`len()` counts the characters, including spaces:

```python run
print(len("hello"))
print(len("hello world"))
```

### Indexing: one character

Each character has a position called an **index**, counted from **0**. Negative indexes count from the end.

```diagram
{"type":"strip","caption":"The string \"python\": index 0 is the first letter, -1 is the last","cells":["p","y","t","h","o","n"],"highlight":[0],"negative":true}
```

```python run
word = "python"
print(word[0])
print(word[2])
print(word[-1])
```

### Slicing: a piece

`text[start:stop]` takes characters from `start` up to, **but not including**, `stop`. Leave either side empty to mean "from the beginning" or "to the end".

```python run
word = "python"
print(word[1:4])
print(word[:2])
print(word[3:])
print(word[::-1])
```

The last one uses a *step* of `-1`, which walks backwards and so reverses the string.

> **Careful:** `word[6]` on a six-letter word fails with an `IndexError`: the valid indexes are 0 to 5. Off-by-one slips with indexes are among the most common bugs in programming, and Pythia will often ask you which index you meant.

Strings are **immutable**: you can't change a character in place. `word[0] = "P"` is an error. Instead you build a new string.

# Example: Initials

Predict the output before you run it.

```python example
first = "grace"
last = "hopper"

initials = first[0] + last[0]
print(initials)
print(first[0].upper() + first[1:])
print(len(first + last))
```

`first[0]` is `"g"`, so `first[0] + last[0]` is `"gh"`. `first[1:]` is everything after the first letter. Methods like `.upper()` come in the next lesson.

# Exercise: Pick letters {#e1}

For `word = "python"`, create three variables: `first` (the first letter), `last` (the last letter) and `size` (how many letters).

```python starter
word = "python"

# Create first, last and size
```

```python solution
word = "python"

first = word[0]
last = word[-1]
size = len(word)
```

## Hints

1. Indexes start counting from a particular number. Which one?
2. How can you refer to the last character without knowing how long the word is?
3. Use an index for each letter, and a function that counts characters for the size.

## Explanation

`word[0]` is the first character and `word[-1]` the last, which works for any length. `len(word)` counts the characters: 6.

# Exercise: Cut it up {#e2}

Using slices of `word = "python"`, create `start` (the first three letters) and `end` (the last three letters).

```python starter
word = "python"

# Create start and end
```

```python solution
word = "python"

start = word[:3]
end = word[3:]
```

## Hints

1. A slice has a start and a stop, separated by a colon. Where does the cut fall between the two halves?
2. Is the character at the stop index included in the slice?
3. Both halves meet at index 3: one slice stops there, the other starts there.

## Explanation

`word[:3]` runs from the beginning up to (not including) index 3: `"pyt"`. `word[3:]` runs from index 3 to the end: `"hon"`. Together they rebuild the word exactly.

# Exercise: A banner {#e3}

Print this three-line banner. Use the repeat operator `*` rather than typing the equals signs:

```text
====================
Pythia
====================
```

```python starter
# Print the banner
```

```python solution
print("=" * 20)
print("Pythia")
print("=" * 20)
```

## Hints

1. Typing twenty `=` characters is error-prone. Which operator repeats a string?
2. What are the two operands of that operator here?
3. Print `"="` repeated 20 times, then `"Pythia"`, then the same repetition again.

## Explanation

`"=" * 20` creates a string of 20 equals signs. Writing it as an expression means you can change the width in one place.

# Exercise: Swap the halves {#e4}

`word = "pythia"` has six letters. Create `swapped`, the word with its two halves exchanged: the last three letters followed by the first three (`"hiapyt"`).

```python starter
word = "pythia"

# Create swapped
```

```python solution
word = "pythia"

swapped = word[3:] + word[:3]
```

## Hints

1. You need two slices and one operator that joins strings.
2. Where is the middle of a six-letter word?
3. Take everything from index 3 to the end, then add everything before index 3.

## Explanation

`word[3:]` is `"hia"` and `word[:3]` is `"pyt"`. Joining them in the opposite order with `+` gives `"hiapyt"`.

# Quiz

## What is `"python"[1]`?

- [ ] `"p"`
- [x] `"y"`
- [ ] `"t"`

Explanation: Indexes start at 0, so index 0 is `"p"` and index 1 is `"y"`.

## What is `"hello"[1:3]`?

- [ ] `"hel"`
- [ ] `"ell"`
- [x] `"el"`

Explanation: The slice starts at index 1 (`"e"`) and stops *before* index 3, so it holds indexes 1 and 2: `"el"`.

## What does `"ab" * 3` give?

- [ ] `"ab3"`
- [x] `"ababab"`
- [ ] An error

Explanation: Multiplying a string by an integer repeats it.
