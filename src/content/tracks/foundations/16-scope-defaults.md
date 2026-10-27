---
id: scope-and-defaults
module: fnd-functions
title: Scope and default arguments
minutes: 15
goal: Explain where variables live (scope), give parameters default values, and call functions with keyword arguments.
summary: Where a variable is visible, and how to make parameters optional.
---

# Concept

### Scope: where a name lives

Variables created **inside** a function are **local**: they exist only while it runs. Code outside can't see them:

```python run
def make_message():
    message = "created inside"
    return message

print(make_message())
print(message)
```

The last line raises a `NameError`. `message` only existed during the call. Good: functions don't leak their internals, and two functions can each use a variable called `total` without clashing.

Going the other way, a function *can read* a variable defined outside it (a **global**). But if the function **assigns** to that name, Python creates a new local one:

```python run
count = 10

def show():
    print(count)        # reads the global: fine

def try_to_change():
    count = 99          # creates a NEW local variable
    print("inside:", count)

show()
try_to_change()
print("outside:", count)
```

> **Careful:** the safest design is for functions to take their inputs as parameters and send results out with `return`, not to reach for globals. If a function "doesn't change" a variable you expected it to, you're probably assigning to a local copy.

### Default arguments

Give a parameter a default value with `=`, and callers may leave it out:

```python run
def power(base, exponent=2):
    return base ** exponent

print(power(5))
print(power(2, 10))
```

Parameters with defaults must come **after** those without.

### Keyword arguments

You can name the arguments in a call, in any order. It makes calls readable:

```python run
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ada"))
print(greet("Ada", "Welcome"))
print(greet(greeting="Hi", name="Grace"))
```

You already use these: `print("a", "b", sep="-")` passes `sep` by keyword.

### Docstrings

A string on the first line of a function body documents it. It shows up in `help()` and in editors:

```python run
def area(w, h):
    """Return the area of a w by h rectangle."""
    return w * h

print(area(3, 4))
help(area)
```

# Example: A flexible greeting

```python example
def describe(name, age=None, city="somewhere"):
    """Build a one-line description of a person."""
    text = f"{name} lives in {city}"
    if age is not None:
        text += f" and is {age}"
    return text

print(describe("Ada"))
print(describe("Grace", 85))
print(describe("Linus", city="Helsinki"))
```

Three calls, three shapes, one function. `is not None` is the standard way to ask whether an optional value was provided.

# Exercise: Power with a default {#e1}

Define `power(base, exponent=2)` that returns `base` raised to `exponent`. Called with one argument it should square it.

```python starter
# Define power(base, exponent=2)
```

```python solution
def power(base, exponent=2):
    return base ** exponent
```

## Hints

1. A parameter can have a value that is used when the caller doesn't supply one. How is that written?
2. Which operator raises one number to the power of another?
3. In the header, write the second parameter as `exponent=2`, and return `base ** exponent`.

## Explanation

When the caller passes only `base`, `exponent` takes its default of 2, so `power(5)` is 25. When both are passed, the second argument replaces the default: `power(2, 10)` is 1024.

# Exercise: A greeting with a default {#e2}

Define `greet(name, greeting="Hello")` that **returns** `"<greeting>, <name>!"`. `greet("Ada")` returns `"Hello, Ada!"` and `greet("Ada", greeting="Hi")` returns `"Hi, Ada!"`.

```python starter
# Define greet(name, greeting="Hello")
```

```python solution
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"
```

## Hints

1. Which parameter is required, and which is optional?
2. Required parameters must come first. What does the optional one need in its definition?
3. Give `greeting` the default value `"Hello"` in the header, and build the result with an f-string.

## Explanation

`greeting="Hello"` makes the second parameter optional. Callers can override it by position or by keyword (`greeting="Hi"`).

# Exercise: Count down {#e3}

Define `count_down(start)` that prints the numbers from `start` down to `1`, one per line, followed by `Go!`.

```python starter
# Define count_down(start)
```

```python solution
def count_down(start):
    for n in range(start, 0, -1):
        print(n)
    print("Go!")
```

## Hints

1. Which kind of loop counts a known number of times? And in which direction does it need to go?
2. What does `range` need so that it counts down and stops after 1?
3. Use `range(start, 0, -1)` for the loop; print `Go!` once after it, outside the loop.

## Explanation

A negative step makes `range` count downwards, and stopping at 0 means 1 is the last value printed. `Go!` is at function level (not indented under the loop), so it prints once.

# Exercise: Where did my variable go? {#e4}

The function below calculates the total but then the program tries to print `total` outside it, which fails. **Fix the program** so that `print(total)` works: have the function return the value and store it.

```python starter
def add_up(a, b):
    total = a + b

add_up(3, 4)
print(total)
```

```python solution
def add_up(a, b):
    total = a + b
    return total

total = add_up(3, 4)
print(total)
```

## Hints

1. Run the starter and read the error. Which name can't Python find, and why?
2. Variables created inside a function vanish when it ends. How can a value escape?
3. Return `total` from the function, and in the main code assign the call's result to a variable called `total`.

## Explanation

The `total` inside `add_up` is local. `return total` carries the value out, and `total = add_up(3, 4)` stores it in a *different* variable that happens to have the same name at the top level.

# Quiz

## Where can you use a variable created inside a function?

- [ ] Anywhere in the program
- [x] Only inside that function
- [ ] Only in other functions

Explanation: Local variables vanish when the function ends. Return the value to get it out.

## What does `power(3)` give for `def power(b, e=2): return b ** e`?

- [ ] An error: `e` is missing
- [ ] 6
- [x] 9

Explanation: The missing argument takes its default of 2, so 3 ** 2 = 9.

## Which call is valid for `def f(a, b=1, c=2):`?

- [ ] `f(b=5)`
- [x] `f(1, c=9)`
- [ ] `f(c=9, 1)`

Explanation: `a` is required, so `f(b=5)` is missing it. Positional arguments can't follow keyword arguments, which rules out the third.
