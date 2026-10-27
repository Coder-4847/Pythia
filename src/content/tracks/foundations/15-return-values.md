---
id: return-values
module: fnd-functions
title: Returning values
minutes: 14
goal: Make functions hand a result back with return, and tell return apart from print.
summary: The difference between showing a result and giving it back.
---

# Concept

So far our functions *print* things. That's useful for people, but a function often needs to hand a **result** back to the code that called it, so that code can store it, test it or compute with it. That's what `return` does:

```python run
def add(a, b):
    return a + b

result = add(2, 3)
print(result)
print(add(10, 20) * 2)
```

`return` does two things: it **sends a value back** to where the function was called, and it **ends the function** right there. The call `add(2, 3)` is replaced by the value `5`.

### return is not print

```python run
def show_double(n):
    print(n * 2)

def get_double(n):
    return n * 2

show_double(4)
x = get_double(4)
print(x + 1)
```

`show_double` displays `8` but gives nothing back. `get_double` returns `8`, so you can add 1 to it. If a function has no `return`, calling it gives `None`, Python's "nothing here" value:

```python run
def broken_double(n):
    n * 2

print(broken_double(4))
```

> **Careful:** a missing `return` is the single most common function bug. If you see `None` where you expected a number, or `TypeError: unsupported operand ... 'NoneType'`, check that the function really returns something on *every* path through it.

### Returning early

Because `return` ends the function, it's a handy way to exit as soon as you know the answer:

```python run
def sign(n):
    if n > 0:
        return "positive"
    if n < 0:
        return "negative"
    return "zero"

print(sign(5), sign(-2), sign(0))
```

### Returning booleans

A function that answers a yes/no question returns `True` or `False`. Often you can return the comparison directly:

```python run
def is_adult(age):
    return age >= 18

print(is_adult(20), is_adult(12))
```

# Example: A tiny toolkit

```python example
def average(a, b, c):
    return (a + b + c) / 3

def label(score):
    if score >= 50:
        return "pass"
    return "fail"

mean = average(40, 60, 80)
print("Average:", mean)
print("Result:", label(mean))
```

One function's result feeds straight into the next. That composability is the whole point of returning values.

# Exercise: Add {#e1}

Define `add(a, b)` that **returns** the sum of its two arguments.

```python starter
# Define add(a, b)
```

```python solution
def add(a, b):
    return a + b
```

## Hints

1. The function must give a value back. Which keyword does that?
2. What two things are you combining?
3. Define the function with two parameters and return their sum.

## Explanation

`return a + b` computes the sum and hands it to the caller. The tests check the *returned value*, so printing it instead wouldn't pass.

# Exercise: Even or not {#e2}

Define `is_even(n)` that returns `True` if `n` is even and `False` otherwise.

```python starter
# Define is_even(n)
```

```python solution
def is_even(n):
    return n % 2 == 0
```

## Hints

1. The answer is a boolean. What operation produces one?
2. What is special about the remainder of an even number divided by 2?
3. Return the result of comparing `n % 2` with zero. No `if` needed.

## Explanation

`n % 2 == 0` is already `True` or `False`, so it can be returned directly.

# Exercise: Average of three {#e3}

Define `average(a, b, c)` that returns the mean of its three arguments.

```python starter
# Define average(a, b, c)
```

```python solution
def average(a, b, c):
    return (a + b + c) / 3
```

## Hints

1. What formula gives the mean of three numbers?
2. Mind the order of operations when you write that formula in one line.
3. Add all three first, in parentheses, then divide by three, and return that.

## Explanation

Without the parentheses, only `c` would be divided by 3. `(a + b + c) / 3` adds first.

# Exercise: Fix the missing return {#e4}

This function is meant to double a number, but it only prints it. Change it so it **returns** the double instead.

```python starter
def double(n):
    print(n * 2)
```

```python solution
def double(n):
    return n * 2
```

## Hints

1. Call the function and store its result: what do you get now?
2. What is the difference between showing a value and giving it back?
3. Replace the `print` with the keyword that gives the value back to the caller.

## Explanation

`print(n * 2)` shows the value but the call evaluates to `None`. `return n * 2` hands the number back, so `double(4) + 1` is `9`.

# Exercise: A full name {#e5}

Define `full_name(first, last)` that returns the name in the form `"Last, First"`. For example `full_name("Ada", "Lovelace")` returns `"Lovelace, Ada"`.

```python starter
# Define full_name(first, last)
```

```python solution
def full_name(first, last):
    return f"{last}, {first}"
```

## Hints

1. Which parameter comes first in the result?
2. What goes between the two names?
3. Build one string from `last`, a comma and a space, and `first` (an f-string is tidy) and return it.

## Explanation

The f-string `f"{last}, {first}"` arranges the two arguments in the new order with the separator written literally between them.

# Quiz

## What does a function without any `return` give back?

- [ ] `0`
- [ ] An empty string
- [x] `None`

Explanation: Python returns `None` when a function ends without a `return`. It means "no value".

## What does `return` do besides sending a value back?

- [x] Ends the function immediately
- [ ] Prints the value
- [ ] Defines a variable

Explanation: Code after a `return` in the same block never runs.

## Which version lets you do `double(3) + 1`?

- [ ] `def double(n): print(n * 2)`
- [x] `def double(n): return n * 2`
- [ ] Both

Explanation: Only the version that returns a value can be used in further arithmetic. The `print` version gives back `None`.
