---
id: generators
module: int-iteration
title: Generators and yield
minutes: 14
goal: Write generator functions with yield, and use them one value at a time.
summary: Produce values on demand, so even endless sequences fit in memory.
---

# Concept

A normal function computes everything and returns once. A **generator function** uses `yield` instead, and hands back values **one at a time**, pausing between them.

```python run
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for number in countdown(3):
    print(number)
```

Calling `countdown(3)` doesn't run the body yet. It gives you a **generator object**. Each time something asks for the next value (a `for` loop, or `next()`), Python runs the body up to the next `yield`, hands over that value, and **freezes right there**, with all the local variables intact, until it's asked again.

```python run
def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(2)
print(next(gen))
print(next(gen))
print(next(gen, "done"))
```

```diagram
{"type":"flow","caption":"yield pauses; next() resumes","steps":[{"label":"next(gen)","detail":"run until the next yield"},{"label":"yield value","detail":"hand it over and freeze"},{"label":"next(gen) again","detail":"carry on from where it froze"}]}
```

### Why bother?

Because values are produced **on demand**, a generator never builds the whole list. That means:

- huge or endless sequences work, because only the current value exists;
- you can stop early without wasted work.

```python run
def naturals():
    n = 1
    while True:
        yield n
        n += 1

for n in naturals():
    if n > 5:
        break
    print(n)
```

That `while True` would hang a normal function, but a generator only runs as far as you pull it.

### Generator expressions

A list comprehension with round brackets is a lazy version:

```python run
squares = (n * n for n in range(1, 6))
print(sum(squares))
```

> **Careful:** a generator is **used up** once you've looped over it. A second `for` over the same generator object gives nothing. Call the function again for a fresh one, or use a list if you need to loop several times.

# Example: Reading in chunks

```python example
def pairs(items):
    for i in range(0, len(items) - 1, 2):
        yield items[i], items[i + 1]

for a, b in pairs([1, 2, 3, 4, 5]):
    print(a, "and", b)

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

first = []
for value in fibonacci():
    if value > 50:
        break
    first.append(value)
print(first)
```

`pairs` yields tuples, and the loop unpacks them. `fibonacci` never ends; the caller decides when to stop.

# Exercise: Countdown {#e1}

Define a generator function `countdown(n)` that yields `n`, `n - 1`, … down to `1`. `list(countdown(3))` is `[3, 2, 1]`, and `countdown(0)` yields nothing.

```python starter
# Define countdown(n)
```

```python solution
def countdown(n):
    while n > 0:
        yield n
        n -= 1
```

## Hints

1. A loop that gives back a value each time round.
2. Which keyword hands a value out without ending the function?
3. Use a loop that runs while the counter is above zero, `yield` it, then reduce it.

## Explanation

Each pass through the loop yields the current number and then lowers it. When the condition fails, the function ends and the generator stops.

# Exercise: Multiples {#e2}

Define a generator `multiples(k, limit)` that yields the multiples of `k` that are at most `limit`, starting at `k`. `list(multiples(3, 10))` is `[3, 6, 9]`.

```python starter
# Define multiples(k, limit)
```

```python solution
def multiples(k, limit):
    value = k
    while value <= limit:
        yield value
        value += k
```

## Hints

1. Start from the first multiple and keep going until you pass the limit.
2. How do you get the next multiple from the current one?
3. Keep a variable that starts at `k` and goes up by `k` each time round a loop that checks `<= limit`.

## Explanation

The state (`value`) lives in the generator between yields, so each resumption picks up with the next multiple.

# Exercise: Endless squares {#e3}

Define a generator `squares()` with **no limit**: it yields `1`, `4`, `9`, `16`, … forever.

```python starter
# Define squares()
```

```python solution
def squares():
    n = 1
    while True:
        yield n * n
        n += 1
```

## Hints

1. How can a function that never ends still be useful?
2. What keeps the loop going, and what makes it hand values out?
3. `while True:` with a `yield` of the square of a counter, then add one to the counter.

## Explanation

An infinite loop is fine in a generator because the caller only pulls as many values as it wants. `list(squares())` would hang, but `next()` and `islice` work.

# Exercise: Only the long words {#e4}

Define a generator `long_words(words, size)` that yields each word with at least `size` letters, unchanged and in order. Use `yield` (not a list).

```python starter
# Define long_words(words, size)
```

```python solution
def long_words(words, size):
    for word in words:
        if len(word) >= size:
            yield word
```

## Hints

1. Loop over the words and decide about each one.
2. Where does `yield` go so that short words are skipped?
3. Put the `yield` inside the `if` that checks the length.

## Explanation

Short words never reach the `yield`, so they are simply never produced. No result list is built at all.

# Quiz

## What does calling a generator function do?

- [ ] Runs the whole body and returns a list
- [x] Returns a generator object without running the body yet
- [ ] Raises an error

Explanation: The body runs lazily as values are requested.

## What happens at `yield`?

- [ ] The function ends for good
- [x] A value is handed out and the function pauses, keeping its local variables
- [ ] The value is printed

Explanation: The next request resumes right after the `yield`.

## You loop over a generator twice. What does the second loop see?

- [ ] The same values again
- [x] Nothing: the generator is already used up
- [ ] An error

Explanation: A generator can be consumed once. Call the function again to get a new one.
