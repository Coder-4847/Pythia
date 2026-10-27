---
id: loop-control
module: fnd-loops
title: break, continue and nested loops
minutes: 14
goal: Leave a loop early with break, skip a round with continue, and nest loops to build grids.
summary: Take finer control of loops, and put one loop inside another.
---

# Concept

### break: leave the loop now

`break` ends the loop immediately, whatever the condition says. It's perfect for "stop as soon as you've found it":

```python run
for n in range(1, 100):
    if n % 7 == 0 and n > 30:
        print("Found it:", n)
        break
```

Without `break` this would keep searching to 99. With it, the loop ends the moment the first match prints.

### continue: skip to the next round

`continue` abandons the **rest of this round** and jumps to the next item:

```python run
for n in range(1, 8):
    if n % 2 == 0:
        continue
    print(n)
```

Even numbers hit `continue`, so `print` is skipped for them.

### Nested loops

A loop inside a loop runs the inner loop **completely** for every round of the outer one. Think of a clock: the minute hand does a full lap for every step of the hour hand.

```python run
for row in range(3):
    for col in range(4):
        print("*", end="")
    print()
```

The inner loop prints four stars on one line (`end=""` stops the newline). The bare `print()` ends the line. The outer loop repeats that three times.

```diagram
{"type":"flow","caption":"Outer round 1 runs the whole inner loop, then outer round 2 starts","steps":[{"label":"row 0","detail":"col 0,1,2,3"},{"label":"row 1","detail":"col 0,1,2,3"},{"label":"row 2","detail":"col 0,1,2,3"}]}
```

A neat trick: let the inner loop depend on the outer variable.

```python run
for row in range(1, 5):
    print("*" * row)
```

> **Careful:** in nested loops, `break` and `continue` only affect the **innermost** loop they sit in. And when a nested loop is slow or its output looks wrong, trace the first two rounds of the outer loop by hand.

# Example: Prime check

Is 29 prime? Look for a divisor, and stop at the first one found.

```python example
number = 29
is_prime = True

for d in range(2, number):
    if number % d == 0:
        is_prime = False
        break

print(number, "is prime:", is_prime)
```

Try 30, 31 and 1. `break` makes the loop finish as soon as one divisor proves the number isn't prime. (For 1, the loop never runs: can you see why that answer is wrong, and how you'd fix it?)

# Exercise: First multiple {#e1}

Find the first number from `1` to `99` that is a multiple of `7` and greater than `50`. Store it in `first` and stop the search as soon as you find it. (Hint: start with `first = None`.)

```python starter
first = None

# Search for it
```

```python solution
first = None

for n in range(1, 100):
    if n % 7 == 0 and n > 50:
        first = n
        break
```

## Hints

1. You're searching: once you find the first match you can stop. Which keyword stops a loop early?
2. A candidate needs two properties at once. How do you combine them?
3. Loop over 1 to 99; when a number is both a multiple of 7 and above 50, remember it in `first` and break.

## Explanation

The loop visits 1, 2, 3, … and the first number satisfying both conditions is 56. `break` ends the loop right away, so later multiples (63, 70, …) never overwrite `first`.

# Exercise: Skip the threes {#e2}

Print the numbers `1` to `10`, one per line, but **skip every multiple of 3**. Use `continue`.

```python starter
# Print 1 to 10 without multiples of 3
```

```python solution
for n in range(1, 11):
    if n % 3 == 0:
        continue
    print(n)
```

## Hints

1. For some numbers you want to do nothing at all. What can you do instead of printing?
2. How do you test "multiple of 3"?
3. When `n % 3 == 0`, use the keyword that skips straight to the next round; otherwise print.

## Explanation

When the condition holds, `continue` jumps back to the top of the loop for the next number, so `print` is never reached for 3, 6 and 9.

# Exercise: A grid of stars {#e3}

`rows = 3` and `cols = 4`. Print a grid of `*` characters with that many rows and columns (3 lines of `****`). Use **nested loops** (not `"*" * cols`).

```python starter
rows = 3
cols = 4

# Print the grid
```

```python solution
rows = 3
cols = 4

for r in range(rows):
    for c in range(cols):
        print("*", end="")
    print()
```

## Hints

1. Which loop decides the number of lines, and which decides the stars on one line?
2. How do you keep several stars on the same line, and then end the line?
3. In the inner loop print a star with `end=""`; after the inner loop finishes, print an empty line to move down.

## Explanation

The inner loop prints one row of stars without newlines, and the bare `print()` then ends the row. The outer loop repeats that `rows` times.

# Exercise: A triangle {#e4}

`size = 4`. Print a right-angled triangle of stars: one star on the first line, two on the second, and so on up to `size`.

```text
*
**
***
****
```

```python starter
size = 4

# Print the triangle
```

```python solution
size = 4

for row in range(1, size + 1):
    print("*" * row)
```

## Hints

1. How does the number of stars on a line relate to the line number?
2. You don't strictly need an inner loop. What operator repeats a string?
3. Loop the line number from 1 to `size`, and print that many stars each round.

## Explanation

On line `row` you print `row` stars. `range(1, size + 1)` includes `size`, and `"*" * row` builds each line. (An inner loop works too.)

# Quiz

## What does `break` do?

- [ ] Skips to the next round
- [x] Ends the loop immediately
- [ ] Stops the whole program

Explanation: `break` only leaves the loop it is in. The program carries on with the code after the loop.

## What does `continue` do?

- [x] Skips the rest of this round and starts the next
- [ ] Ends the loop
- [ ] Restarts the loop from the first item

Explanation: `continue` jumps to the next iteration. The loop itself keeps going.

## How many times does the inner `print` run?

```python
for a in range(3):
    for b in range(2):
        print(a, b)
```

- [ ] 5
- [x] 6
- [ ] 3

Explanation: The inner loop runs 2 times for each of the 3 outer rounds: 3 × 2 = 6.
