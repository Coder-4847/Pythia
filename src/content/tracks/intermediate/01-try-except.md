---
id: try-except
module: int-errors
title: Catching exceptions
minutes: 14
goal: Use try and except to handle errors you expect, without hiding the ones you don't.
summary: Let your program recover from bad input instead of crashing.
---

# Concept

When Python can't do what you asked, it **raises an exception** and stops. You have met several already:

```python run
print(int("forty-two"))
```

That `ValueError` is not a bug in Python. It is Python telling you: *"this text doesn't look like a number."* The input was bad, and your program is the only one who can decide what to do about it.

A `try` / `except` block lets you decide:

```python run
text = "forty-two"
try:
    number = int(text)
    print("Got", number)
except ValueError:
    print("That wasn't a number.")
print("The program carries on.")
```

Python runs the `try` body. If an exception of the named type is raised, it **jumps** to the matching `except` block, skipping the rest of the `try` body. If nothing goes wrong, the `except` block is skipped.

```diagram
{"type":"flow","caption":"try / except","steps":[{"label":"try: ...","detail":"run the risky code"},{"label":"no error","detail":"skip the except block"},{"label":"error of that type","detail":"jump to except, then carry on"}]}
```

### Catch specific errors

Name the exception you expect. Each type means something different:

| Exception | Typical cause |
|---|---|
| `ValueError` | right type, wrong value: `int("abc")` |
| `TypeError` | wrong type: `"a" + 1` |
| `ZeroDivisionError` | `10 / 0` |
| `KeyError` | a missing dictionary key |
| `IndexError` | a list position that doesn't exist |

You can handle several, and keep the exception object with `as`:

```python run
for value in ["12", "x", None]:
    try:
        print(int(value) * 2)
    except ValueError:
        print(repr(value), "is not a number")
    except TypeError as problem:
        print("Wrong type:", problem)
```

### `else`: code that should only run on success

```python run
try:
    age = int("30")
except ValueError:
    print("bad age")
else:
    print("age is", age)
```

> **Careful:** never write a bare `except:` that swallows everything. It also hides typos and real bugs, so a mistake in your code looks like "bad input". Catch the specific exception you expect, and let the surprises crash loudly.

# Example: Friendly parsing

```python example
def parse_price(text):
    try:
        return float(text.replace("$", ""))
    except ValueError:
        return None

for raw in ["$4.50", "12", "free"]:
    price = parse_price(raw)
    if price is None:
        print(f"{raw!r}: not a price")
    else:
        print(f"{raw!r}: {price:.2f}")
```

The function **returns `None`** to say "I couldn't". The caller decides what to do. The `try` body is as small as possible: only the line that can fail.

# Exercise: Safe integer {#e1}

Define `to_int(text)` that returns `text` converted to an `int`, or `None` if it can't be converted.

```python starter
# Define to_int(text)
```

```python solution
def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None
```

## Hints

1. Which line might fail, and what would you like to happen when it does?
2. Which exception does `int("abc")` raise?
3. Put the conversion in a `try`, and `return None` from the matching `except`.

## Explanation

`int(text)` raises `ValueError` for text that isn't a whole number. Catching exactly that and returning `None` turns "crash" into "no answer".

# Exercise: Safe division {#e2}

Define `safe_divide(a, b)` that returns `a / b`, or `None` when `b` is zero. Catch the specific exception rather than checking `b` first.

```python starter
# Define safe_divide(a, b)
```

```python solution
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
```

## Hints

1. What does Python do when you divide by zero?
2. Name the exception type.
3. `try:` the division, and `except` that exception type to return `None`.

## Explanation

Dividing by zero raises `ZeroDivisionError`. Catching it by name means other mistakes (like passing text) are still reported instead of silently hidden.

# Exercise: Count the numbers {#e3}

Define `count_numbers(items)` that returns how many items in the list can be converted with `int()`. `count_numbers(["4", "x", "10", ""])` returns `2`.

```python starter
# Define count_numbers(items)
```

```python solution
def count_numbers(items):
    numbers = []
    for item in items:
        try:
            numbers.append(int(item))
        except ValueError:
            pass
    return len(numbers)
```

## Hints

1. You need a loop, one conversion attempt per item, and something that remembers the successes.
2. What happens to the rest of the `try` body when the conversion fails?
3. Collect each converted value in a list inside the `try`; a failed conversion skips the collecting. `pass` means "do nothing".

## Explanation

If `int(item)` fails, the exception jumps straight to `except`, so nothing is appended for that item. The answer is simply how many values were collected. (Calling `int(item)` on its own line just to see whether it fails would work, but throws the result away; keeping the value is clearer.) `pass` is a placeholder for a block that intentionally does nothing.

# Exercise: A lookup with a fallback {#e4}

Define `lookup(prices, name)` that returns `prices[name]`, or the string `"unknown"` if the key is missing. Use `try` / `except`.

```python starter
# Define lookup(prices, name)
```

```python solution
def lookup(prices, name):
    try:
        return prices[name]
    except KeyError:
        return "unknown"
```

## Hints

1. What happens if you ask a dictionary for a key it doesn't have?
2. Which exception is that?
3. `try` the lookup and return the fallback from the `except KeyError` block.

## Explanation

A missing key raises `KeyError`. (`prices.get(name, "unknown")` does the same without exceptions; the point here is to practise the pattern.)

# Quiz

## What happens to the rest of a `try` body after an exception is raised?

- [ ] It keeps running
- [x] It is skipped, and Python jumps to the matching `except`
- [ ] The program restarts

Explanation: The exception interrupts the `try` body at the failing line. Python looks for an `except` that matches.

## Why is a bare `except:` a bad idea?

- [ ] It's slower
- [x] It hides every kind of error, including your own bugs
- [ ] It isn't allowed in Python 3

Explanation: A typo in a variable name would be caught and ignored just like bad input. Catch only what you expect.

## Which exception does `{"a": 1}["b"]` raise?

- [ ] `IndexError`
- [x] `KeyError`
- [ ] `ValueError`

Explanation: Dictionaries are looked up by key, so a missing key is a `KeyError`. `IndexError` is for lists and tuples.
