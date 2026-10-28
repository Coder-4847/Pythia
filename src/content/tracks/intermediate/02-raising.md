---
id: raising-errors
module: int-errors
title: Raising your own errors
minutes: 14
goal: Raise exceptions to reject bad input, clean up with finally, and define your own exception type.
summary: Stop early with a clear message instead of carrying on with nonsense.
---

# Concept

So far Python raised the errors. You can raise them too, when *your* function is handed something it can't sensibly work with.

```python run
def set_age(age):
    if age < 0:
        raise ValueError("age can't be negative")
    return age

print(set_age(30))
print(set_age(-5))
```

`raise ValueError("...")` stops the function right there and hands the exception to whoever called it. Pick the built-in type that matches the problem (`ValueError` for a bad value, `TypeError` for a wrong type) and write a message that says what was wrong.

> **Why not just return `-1` or `None`?** A returned "error value" is easy to forget to check, and then the bad value flows on and fails somewhere far away. An exception cannot be ignored by accident.

### Catching what you raised

```python run
try:
    set_age = int("-4")
    if set_age < 0:
        raise ValueError(f"age can't be negative, got {set_age}")
except ValueError as problem:
    print("Rejected:", problem)
```

`as problem` gives you the exception object. `str(problem)` is its message.

### `finally`: always runs

Some jobs must happen whether or not an error occurred (closing a file, releasing something, writing a log line). Put them in `finally`:

```python run
def risky(fail):
    print("open")
    try:
        if fail:
            raise RuntimeError("boom")
        print("work")
    finally:
        print("close")

risky(False)
try:
    risky(True)
except RuntimeError:
    print("caught it outside")
```

`close` is printed both times. And the error still travels on to the caller.

### Your own exception types

A class that inherits from `Exception` is a new kind of error. The name documents what went wrong:

```python run
class OutOfStock(Exception):
    pass

def buy(stock, wanted):
    if wanted > stock:
        raise OutOfStock(f"only {stock} left")
    return stock - wanted

try:
    buy(2, 5)
except OutOfStock as problem:
    print("Sorry:", problem)
```

# Example: Validating an order

```python example
class InvalidOrder(Exception):
    pass

def total(prices, quantity):
    if quantity <= 0:
        raise InvalidOrder("quantity must be positive")
    return sum(prices) * quantity

for qty in (3, 0):
    try:
        print(total([2.5, 4.0], qty))
    except InvalidOrder as problem:
        print("Invalid order:", problem)
```

The function does one job and refuses bad input loudly. The caller, which knows what to *do* about it, decides how to react.

# Exercise: Reject negative ages {#e1}

Define `check_age(age)` that returns `age` when it is between 0 and 120 (inclusive), and otherwise raises a `ValueError` with a message.

```python starter
# Define check_age(age)
```

```python solution
def check_age(age):
    if age < 0 or age > 120:
        raise ValueError(f"age out of range: {age}")
    return age
```

## Hints

1. There are two situations: acceptable, and not.
2. Which statement raises an exception?
3. Test the bad range with `if`, `raise ValueError(...)` there, and `return age` otherwise.

## Explanation

Both ends of the range are invalid, so one condition with `or` covers them, and the `raise` ends the function before the `return`.

# Exercise: Your own exception {#e2}

Define a class `InsufficientFunds` that inherits from `Exception`. Then define `withdraw(balance, amount)` that returns the new balance, but raises `InsufficientFunds` if `amount` is more than `balance`.

```python starter
# Define the exception class and withdraw(balance, amount)
```

```python solution
class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(f"balance {balance} is less than {amount}")
    return balance - amount
```

## Hints

1. Two things to define: a class, and a function that uses it.
2. What goes in the parentheses after the class name to make it an exception?
3. `class InsufficientFunds(Exception):` with `pass` inside is enough; then `raise InsufficientFunds(...)` in the function.

## Explanation

Inheriting from `Exception` is all it takes. A custom type lets callers catch exactly this problem with `except InsufficientFunds`.

# Exercise: Always close {#e3}

Define `run_job(log, fail)`. It must append `"open"` to the list `log`, then either append `"work"` (when `fail` is false) or raise a `RuntimeError` (when `fail` is true), and in **both** cases append `"close"` last. The error must still reach the caller.

```python starter
# Define run_job(log, fail)
```

```python solution
def run_job(log, fail):
    log.append("open")
    try:
        if fail:
            raise RuntimeError("job failed")
        log.append("work")
    finally:
        log.append("close")
```

## Hints

1. Which step must happen even when an error occurs?
2. Which keyword guarantees that?
3. Open before the `try`; put the work (and the possible `raise`) in the `try`; put the closing line in `finally`.

## Explanation

`finally` runs on the way out, whether the body finished normally or an exception is flying past. Because there's no `except`, the exception continues to the caller after `close` is logged.

# Exercise: Parse them all {#e4}

Define `parse_all(items)` that returns a list of the integers in `items`. If any item can't be converted, raise a `ValueError` whose message is `bad value: ` followed by the `repr` of that item: for `["1", "x"]` it should say `bad value: 'x'`.

```python starter
# Define parse_all(items)
```

```python solution
def parse_all(items):
    numbers = []
    for item in items:
        try:
            numbers.append(int(item))
        except ValueError:
            raise ValueError(f"bad value: {item!r}")
    return numbers
```

## Hints

1. Convert one at a time, so you know which item failed.
2. You catch one `ValueError` and raise another. Why might you want to?
3. Inside the loop, `try` the conversion; in the `except`, `raise ValueError(...)` with your own message. `!r` inside an f-string gives the `repr`.

## Explanation

Python's own message ("invalid literal for int()...") doesn't say which of many items was wrong. Catching it and raising a clearer one makes the failure easy to act on.

# Quiz

## What does `raise ValueError("bad")` do?

- [ ] Prints "bad" and continues
- [x] Stops the current function and hands the exception to the caller
- [ ] Returns the string "bad"

Explanation: Raising interrupts normal flow. Unless something catches it, the program ends with a traceback.

## When does the `finally` block run?

- [ ] Only when there was an error
- [ ] Only when there was no error
- [x] Always, whether or not an exception occurred

Explanation: That's what it's for: cleanup that must happen either way.

## How do you create your own exception type?

- [ ] `def MyError(): ...`
- [x] `class MyError(Exception): pass`
- [ ] `error MyError`

Explanation: A class that inherits from `Exception` is a new exception type.
