---
id: tuples
module: ds-tuples
title: Tuples and unpacking
minutes: 12
goal: Create tuples, unpack them into variables, and return several values from a function.
summary: Small, fixed groups of values, and the neat tricks they enable.
---

# Concept

A **tuple** is like a list that can't be changed. It's written with parentheses:

```python run
point = (3, 4)
person = ("Ada", 36, "London")
print(point)
print(person[0])
print(len(person))
```

You can index, slice, loop and use `in` on a tuple exactly as on a list. What you can't do is change it:

```python run
point = (3, 4)
point[0] = 10
```

That's a `TypeError`. Tuples are **immutable**. That makes them a good fit for data that belongs together and shouldn't change: coordinates, RGB colours, a (name, age) record.

> **Careful:** a one-item tuple needs a trailing comma: `(5,)`. Without it, `(5)` is just the number 5 in parentheses. The comma is what makes a tuple; the parentheses are mostly decoration.

### Unpacking

Assign a tuple to several names at once and Python takes it apart:

```python run
point = (3, 4)
x, y = point
print(x, y)

name, age, city = ("Ada", 36, "London")
print(name, "lives in", city)
```

The number of names must match the number of items, or you get a `ValueError`.

### The swap trick

Unpacking gives Python a lovely way to swap two variables with no temporary variable:

```python run
a = 1
b = 2
a, b = b, a
print(a, b)
```

The right side builds the tuple `(b, a)` first, then it is unpacked into `a` and `b`.

### Returning several values

A function can return more than one value by returning a tuple, and the caller can unpack it straight away:

```python run
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 9, 2, 7])
print(low, high)
print(min_max([4, 9, 2, 7]))
```

`return a, b` is the same as `return (a, b)`. You've already met such a function: `divmod(17, 5)` returns `(3, 2)`, the quotient and remainder together.

### Looping with unpacking

```python run
pairs = [("Ada", 36), ("Grace", 85)]
for name, age in pairs:
    print(name, age)
```

# Example: Distance between two points

```python example
def distance(p, q):
    (x1, y1), (x2, y2) = p, q
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5

start = (0, 0)
end = (3, 4)
print(distance(start, end))

x, y = end
print(f"end is at x={x}, y={y}")
```

Unpacking inside the function gives readable names to the parts of each point instead of `p[0]` and `q[1]`.

# Exercise: Take the point apart {#e1}

`point = (3, 4)`. Use **unpacking** to create `x` and `y` from it in a single line.

```python starter
point = (3, 4)

# Create x and y
```

```python solution
point = (3, 4)

x, y = point
```

## Hints

1. You need two variables from one value in a single assignment.
2. How many names do you list on the left, and how are they separated?
3. List `x` and `y` on the left of the `=`, separated by a comma, and `point` on the right.

## Explanation

`x, y = point` unpacks the tuple's items into the names in order: `x` gets 3 and `y` gets 4.

# Exercise: Swap without a helper {#e2}

`a = "left"` and `b = "right"`. Swap them using tuple unpacking, in **one line**, with no temporary variable.

```python starter
a = "left"
b = "right"

# Swap a and b
```

```python solution
a = "left"
b = "right"

a, b = b, a
```

## Hints

1. Python can assign to several names at once. What could you build on the right side?
2. The right side is evaluated completely before anything is assigned. What does that let you do?
3. Put `b` then `a` on the right and `a` then `b` on the left.

## Explanation

The right side builds the tuple `("right", "left")` before any assignment happens, so unpacking it into `a, b` swaps the values safely.

# Exercise: Smallest and largest {#e3}

Define `min_max(numbers)` that returns a tuple `(smallest, largest)` for a non-empty list of numbers.

```python starter
# Define min_max(numbers)
```

```python solution
def min_max(numbers):
    return min(numbers), max(numbers)
```

## Hints

1. One function call has to give back two results.
2. Python has built-in functions for each of those two values.
3. Return both values separated by a comma.

## Explanation

`return min(numbers), max(numbers)` packs the two results into a tuple, which the caller can unpack: `low, high = min_max(data)`.

# Exercise: Quotient and remainder {#e4}

Define `split_time(total_seconds)` that returns `(minutes, seconds)`, how many whole minutes fit and how many seconds are left. `split_time(135)` returns `(2, 15)`.

```python starter
# Define split_time(total_seconds)
```

```python solution
def split_time(total_seconds):
    return total_seconds // 60, total_seconds % 60
```

## Hints

1. This is the "how many fit, and what's left" pattern from the arithmetic lesson.
2. Which two operators answer those two questions?
3. Return the floor division and the remainder of the seconds by 60.

## Explanation

`//` gives the whole minutes and `%` the leftover seconds. Returning them with a comma creates the tuple.

# Quiz

## Which line makes a tuple with one item?

- [ ] `(5)`
- [x] `(5,)`
- [ ] `[5]`

Explanation: The comma creates the tuple. `(5)` is just the number 5 in brackets.

## What happens with `t = (1, 2); t[0] = 9`?

- [ ] `t` becomes `(9, 2)`
- [x] A `TypeError`: tuples can't be changed
- [ ] `t` becomes `(9,)`

Explanation: Tuples are immutable. To "change" one you build a new tuple.

## What does `a, b = 1, 2, 3` do?

- [ ] Sets `a` to 1 and `b` to 2
- [ ] Sets `a` to 1 and `b` to (2, 3)
- [x] Raises a `ValueError`: too many values to unpack

Explanation: The number of names has to match the number of values.
