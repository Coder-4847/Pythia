---
id: string-methods
module: fnd-input
title: String methods and f-strings
minutes: 14
goal: Clean up text with methods and build messages with f-strings.
summary: Built-in text tools, and the cleanest way to put values into a sentence.
---

# Concept

A **method** is a function that belongs to a value. You call it with a dot: `value.method()`. Strings come with dozens.

```python run
name = "  ada LOVELACE  "
print(name.strip())
print(name.lower())
print(name.upper())
print(name.strip().title())
```

Methods return a **new** string and leave the original alone (strings are immutable), so you can chain them: `name.strip().title()` strips first, then title-cases the result.

### Handy ones

| Method | What it does |
|---|---|
| `s.strip()` | remove spaces from both ends |
| `s.lower()` / `s.upper()` / `s.title()` | change case |
| `s.replace(old, new)` | swap every `old` for `new` |
| `s.startswith(x)` / `s.endswith(x)` | `True` or `False` |
| `s.count(x)` | how many times `x` appears |
| `s.find(x)` | index of the first `x`, or `-1` if absent |

```python run
sentence = "the cat sat on the mat"
print(sentence.replace("cat", "dog"))
print(sentence.count("the"))
print(sentence.find("sat"))
print(sentence.startswith("the"))
```

### `in` for "contains"

```python run
print("cat" in "concatenate")
print("dog" in "concatenate")
```

### f-strings: values inside text

Put an `f` before the quote, and anything in `{curly braces}` is evaluated and inserted. It's much tidier than joining with `+` and `str()`.

```python run
name = "Ada"
age = 36
print(f"{name} is {age} years old")
print(f"Next year: {age + 1}")
```

You can control the format after a colon. `:.2f` means "a float with 2 decimals":

```python run
price = 3.14159
print(f"Price: ${price:.2f}")
print(f"{1234567:,}")
```

> **Careful:** forgetting the `f` in front is a classic. `"{name}"` prints the braces literally. If your output shows `{name}`, look at the start of the string.

# Example: Tidying a name tag

Predict the output.

```python example
raw = "   gRACE hOPPER "
clean = raw.strip().title()

print(clean)
print(f"Hello, {clean}!")
print(f"Your name has {len(clean)} characters.")
print(f"Initials: {clean[0]}{clean[clean.find(' ') + 1]}")
```

`.strip().title()` fixes spaces and capitals in one go. The f-string can hold any expression, even a slice or a method call.

# Exercise: Clean a name {#e1}

`name` is messy. Create `clean`, the name with the spaces around it removed and every word capitalised: `"Ada Lovelace"`.

```python starter
name = "  ada lovelace  "

# Create clean
```

```python solution
name = "  ada lovelace  "

clean = name.strip().title()
```

## Hints

1. Two things are wrong with `name`: its edges and its capital letters.
2. Methods can be chained: each one works on the result of the one before.
3. Look for a method that removes surrounding spaces, and another that capitalises each word.

## Explanation

`name.strip()` gives `"ada lovelace"`, and `.title()` capitalises the first letter of each word: `"Ada Lovelace"`.

# Exercise: A sentence from variables {#e2}

Given `name = "Ada"` and `age = 36`, print exactly `Ada is 36 years old`, using an **f-string**.

```python starter
name = "Ada"
age = 36

# Print the sentence
```

```python solution
name = "Ada"
age = 36

print(f"{name} is {age} years old")
```

## Hints

1. A normal string can't see your variables. What one-letter prefix changes that?
2. Where do the variable names go inside the text?
3. Start the string with `f` and put each variable name in curly braces.

## Explanation

In `f"{name} is {age} years old"`, Python replaces `{name}` and `{age}` with their values. No `str()` or `+` needed.

# Exercise: Format a price {#e3}

`price = 3.14159`. Print exactly `Price: $3.14` using an f-string with a format specifier.

```python starter
price = 3.14159

# Print the formatted price
```

```python solution
price = 3.14159

print(f"Price: ${price:.2f}")
```

## Hints

1. The number has too many decimals. Is the fix in the number or in how it is shown?
2. What do you put after the variable name, following a colon, inside the braces?
3. `.2f` means two digits after the decimal point. The dollar sign is just text.

## Explanation

`{price:.2f}` formats the value as a float with exactly two decimals, rounding `3.14159` to `3.14`. The `$` before it is plain text.

# Exercise: Swap a word {#e4}

`sentence = "I like cats. Cats are great."` Create `new_sentence` where every lowercase `cats` becomes `dogs` (the capital `Cats` stays as it is).

```python starter
sentence = "I like cats. Cats are great."

# Create new_sentence
```

```python solution
sentence = "I like cats. Cats are great."

new_sentence = sentence.replace("cats", "dogs")
```

## Hints

1. You want to substitute one piece of text for another throughout the sentence.
2. Is `sentence` itself changed by a method, or do you get something back?
3. A method with two arguments: what to look for, and what to put instead. Keep the result in the new variable.

## Explanation

`replace("cats", "dogs")` returns a new string with each match swapped. It is case-sensitive, so `"Cats"` is untouched, and `sentence` itself never changes.

# Quiz

## What does `"Hello".lower()` return?

- [ ] It changes `"Hello"` to `"hello"` in place
- [x] A new string, `"hello"`
- [ ] `"HELLO"`

Explanation: String methods never modify the original. They return a new string.

## What is `f"{2 + 3}"`?

- [ ] `"{2 + 3}"`
- [ ] `"2 + 3"`
- [x] `"5"`

Explanation: Anything inside the braces is evaluated, so `2 + 3` becomes `5`.

## What does `"banana".count("an")` return?

- [ ] 1
- [x] 2
- [ ] 3

Explanation: "an" appears twice in b**an**·**an**·a.
