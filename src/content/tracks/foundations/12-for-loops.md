---
id: for-loops
module: fnd-loops
title: for loops and range()
minutes: 14
goal: Repeat a block a known number of times with for and range(), and loop over the characters of a string.
summary: The loop to use when you know how many times, or what you are looping over.
---

# Concept

When you know how many times to repeat something, or you have a collection to walk through, use a `for` loop. It takes each item in turn and runs the block once for it:

```python run
for letter in "hey":
    print(letter)
```

The variable (`letter`) is filled in automatically each round. No counter to start, test or update.

### range(): counting

To repeat a number of times, loop over `range(n)`. It produces `0, 1, ..., n-1`:

```python run
for i in range(5):
    print(i)
```

Pay attention: that is five numbers, **starting at 0 and stopping before 5**. `range` has two more forms:

| Form | Produces |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(2, 6)` | 2, 3, 4, 5 *(start, up to but not including stop)* |
| `range(0, 10, 3)` | 0, 3, 6, 9 *(start, stop, step)* |
| `range(5, 0, -1)` | 5, 4, 3, 2, 1 *(counting down)* |

```python run
for i in range(1, 6):
    print(i, "squared is", i ** 2)
```

> **Careful:** "up to but not including" is the root of the classic *off-by-one* bug. To print 1 to 10 you need `range(1, 11)`. When a loop misses its last item, ask Pythia's question: "what is `i` on the last round?"

### Accumulating with for

```python run
total = 0
for n in range(1, 101):
    total += n
print(total)
```

### Counting things in a string

```python run
word = "banana"
count = 0
for ch in word:
    if ch == "a":
        count += 1
print(count)
```

### for or while?

- **`for`**: you have a collection or a known count.
- **`while`**: you repeat *until something happens* and don't know when.

# Example: Multiplication table

```python example
n = 6
for i in range(1, 6):
    print(f"{n} x {i} = {n * i}")
```

`range(1, 6)` gives 1 to 5, and `i` takes each value in turn. Change `n` and the stop value and run it again.

# Exercise: One to five {#e1}

Print the numbers `1` to `5`, one per line, using a `for` loop and `range`.

```python starter
# Print 1 to 5
```

```python solution
for i in range(1, 6):
    print(i)
```

## Hints

1. Which value should `range` start at, and where does it stop?
2. Does the stop value itself get produced?
3. To include 5, the stop value has to be one larger. Start at 1.

## Explanation

`range(1, 6)` produces 1, 2, 3, 4, 5: the stop value 6 is excluded. The loop variable `i` takes each of them in turn, and the body prints it.

# Exercise: Even total {#e2}

Add up the even numbers `2, 4, 6, ..., 20` into a variable called `total`. Use `range` with a **step** instead of an `if`.

```python starter
# Create total
```

```python solution
total = 0
for n in range(2, 21, 2):
    total += n
```

## Hints

1. The numbers you want are two apart. Which part of `range` controls the gap?
2. What are the first value, and the stop value that makes 20 the last one?
3. Use all three arguments of `range`: start 2, stop 21, step 2. Add each number to `total`.

## Explanation

`range(2, 21, 2)` yields 2, 4, 6, …, 20. Adding each to a running total starting at 0 gives 110.

# Exercise: A times table {#e3}

`n = 7`. Print its times table from 1 to 10, one line each, in exactly this format:

```text
7 x 1 = 7
7 x 2 = 14
...
7 x 10 = 70
```

```python starter
n = 7

# Print the table
```

```python solution
n = 7

for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
```

## Hints

1. How many lines do you need, and what changes from one line to the next?
2. The second number steps from 1 to 10. What `range` call gives exactly those values?
3. Loop `i` over 1 to 10 and print an f-string holding `n`, `i` and their product.

## Explanation

Each round uses the same `n` and a new `i`, and an f-string computes `n * i` inside the braces. `range(1, 11)` stops after 10.

# Exercise: Count the vowels {#e4}

`word = "programming"`. Create `vowels`, the number of letters in `word` that are one of `a`, `e`, `i`, `o`, `u`.

```python starter
word = "programming"

# Create vowels
```

```python solution
word = "programming"

vowels = 0
for letter in word:
    if letter in "aeiou":
        vowels += 1
```

## Hints

1. You have to look at the letters one at a time. What kind of loop walks through a string?
2. How will you decide whether a letter counts, and where does the count live?
3. Start a counter at 0; for each letter, if it is in `"aeiou"`, add 1 to the counter.

## Explanation

`for letter in word` visits every character. `letter in "aeiou"` is `True` for vowels. The counter ends at 3 for "programming" (o, a, i).

# Quiz

## What does `list(range(3))` hold?

- [ ] 1, 2, 3
- [x] 0, 1, 2
- [ ] 0, 1, 2, 3

Explanation: `range(3)` starts at 0 and stops before 3.

## Which loop prints 2, 4, 6, 8?

- [ ] `for i in range(2, 8, 2):`
- [x] `for i in range(2, 9, 2):`
- [ ] `for i in range(8, 2, 2):`

Explanation: The stop value is excluded, so to include 8 we stop at 9. The third form counts upward from 8 and so produces nothing.

## When is `for` the better choice than `while`?

- [ ] When you don't know how many rounds there will be
- [x] When you know the count or have a collection to walk through
- [ ] Never: `while` can do everything faster

Explanation: `for` handles the counter for you, which removes the usual loop bugs. Use `while` to repeat until something happens.
