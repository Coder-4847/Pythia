---
id: recursion
module: alg-recursion
title: Thinking recursively
minutes: 18
goal: Write recursive functions with a clear base case and a smaller problem.
summary: Solve a problem by solving a smaller copy of the same problem.
---

# Concept

A **recursive** function is one that calls itself. That sounds like it could never end, and it would not, without two ingredients:

1. A **base case**: an input so small the answer is obvious, so no further call is needed.
2. A **recursive case**: break the input into a *smaller* piece, ask the same function about that piece, and combine the answer.

```python run
def countdown(n):
    if n == 0:                # base case
        print("liftoff!")
        return
    print(n)
    countdown(n - 1)          # smaller problem

countdown(3)
```

The classic example is the factorial: `5! = 5 × 4 × 3 × 2 × 1`. Notice that `5! = 5 × 4!`: the answer is built from the answer to a smaller version of the same question.

```python run
def factorial(n):
    if n <= 1:                # base case
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

```diagram
{"type":"flow","caption":"factorial(3), unwinding","steps":[{"label":"factorial(3)","detail":"3 * factorial(2)  ... waits"},{"label":"factorial(2)","detail":"2 * factorial(1)  ... waits"},{"label":"factorial(1)","detail":"base case: returns 1"},{"label":"unwind","detail":"2 * 1 = 2, then 3 * 2 = 6"}]}
```

Each call waits for the one below it, then the answers flow back up. Python keeps those waiting calls on the **call stack**.

### Lists are recursive too

A list is either empty, or its first item plus a smaller list:

```python run
def total(numbers):
    if not numbers:                       # base case: empty list
        return 0
    return numbers[0] + total(numbers[1:])

print(total([4, 8, 15]))
```

### The rules of thumb

- Always write the **base case first**.
- Every recursive call must move **toward** the base case (`n - 1`, a shorter list...).
- If it never gets there, Python eventually stops you with a `RecursionError`.

> **Careful:** forgetting the base case, or recursing on something that doesn't get smaller, gives `RecursionError: maximum recursion depth exceeded`. That's Python protecting you from an endless loop of waiting calls.

# Example: Digits and powers

```python example
def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)

def power(base, exponent):
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)

print(digit_sum(2024))
print(power(2, 10))
```

`n % 10` is the last digit, and `n // 10` is the number without it, which is smaller. When only one digit remains (`n < 10`), the answer is that digit.

# Exercise: Sum to n {#e1}

Define `sum_to(n)` that returns `1 + 2 + … + n` **recursively**, with `sum_to(0)` equal to `0`.

```python starter
# Define sum_to(n)
```

```python solution
def sum_to(n):
    if n == 0:
        return 0
    return n + sum_to(n - 1)
```

## Hints

1. What is the answer for the smallest input?
2. How does `sum_to(n)` relate to `sum_to` of something smaller?
3. Base case `n == 0` returns 0; otherwise return `n` plus the answer for `n - 1`.

## Explanation

`1 + … + n` is `n` plus `1 + … + (n - 1)`. The recursion bottoms out at 0.

# Exercise: Count down the digits {#e2}

Define `count_digits(n)` for a non-negative integer that returns how many digits it has, **recursively** (no `str()` or `len()`). `count_digits(7)` is `1`, `count_digits(2024)` is `4`, and `count_digits(0)` is `1`.

```python starter
# Define count_digits(n)
```

```python solution
def count_digits(n):
    if n < 10:
        return 1
    return 1 + count_digits(n // 10)
```

## Hints

1. When is a number so small you can answer right away?
2. How do you remove the last digit of a number?
3. A one-digit number has 1 digit; otherwise it's 1 more than the digits of `n // 10`.

## Explanation

Integer division by 10 drops the last digit, which makes the problem smaller each time. The single-digit case stops the recursion, and also covers 0.

# Exercise: Reverse a string {#e3}

Define `reverse(text)` that returns `text` reversed, **recursively**. Don't use slicing with a negative step or `reversed()`.

```python starter
# Define reverse(text)
```

```python solution
def reverse(text):
    if text == "":
        return ""
    return reverse(text[1:]) + text[0]
```

## Hints

1. What is the reverse of the empty string?
2. If you set aside the first character, what's left, and where does that character end up?
3. Reverse everything after the first character, then add the first character at the end.

## Explanation

`"abc"` reversed is `"bc"` reversed followed by `"a"`. Each call hands a shorter string to the next, until the empty string ends it.

# Exercise: Flatten {#e4}

Define `flatten(items)` that takes a list that may contain other lists (nested to any depth) and returns one flat list of the non-list items in order. `flatten([1, [2, [3, 4]], 5])` is `[1, 2, 3, 4, 5]`.

```python starter
# Define flatten(items)
```

```python solution
def flatten(items):
    flat = []
    for item in items:
        if isinstance(item, list):
            flat.extend(flatten(item))
        else:
            flat.append(item)
    return flat
```

## Hints

1. Each item is either a plain value or another list you must look inside.
2. How can you tell the two apart, and which case needs the function to call itself?
3. `isinstance(item, list)` detects a list; for those, flatten the inner list and add all its items.

## Explanation

The nesting depth is unknown, which is exactly where recursion shines: a nested list is just a smaller list-flattening problem, and a plain value is the base case.

# Quiz

## What are the two essential parts of a recursive function?

- [ ] A loop and a counter
- [x] A base case and a recursive case that makes the problem smaller
- [ ] A global variable and a return

Explanation: Without a base case the calls never stop; without a smaller problem they never reach it.

## What does `RecursionError` usually mean?

- [ ] Python ran out of memory for the list
- [x] The function keeps calling itself without reaching a base case
- [ ] You used `return` incorrectly

Explanation: Python limits the call stack's depth to stop an endless chain of calls.

## `total([4, 8, 15])` in the lesson works by computing...

- [ ] `4 + 8 + 15` in a loop
- [x] `4 + total([8, 15])`, and so on down to `total([])`
- [ ] `total(4) + total(8) + total(15)`

Explanation: Each call peels off the first item and asks about the shorter rest.
