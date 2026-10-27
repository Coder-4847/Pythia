---
id: while-loops
module: fnd-loops
title: while loops
minutes: 13
goal: Repeat a block while a condition holds, and make sure the loop can end.
summary: Say "keep going until…" and let Python do the repeating.
---

# Concept

A loop runs the same block over and over. A `while` loop keeps going **as long as its condition is true**:

```python run
count = 1
while count <= 3:
    print("Round", count)
    count = count + 1
print("Finished")
```

It looks like an `if`, but when the block finishes Python goes **back up** and checks the condition again. Only when the condition is false does the program move on.

```diagram
{"type":"flow","caption":"What the loop above does","steps":[{"label":"count = 1","detail":"1 <= 3 → run"},{"label":"count = 2","detail":"2 <= 3 → run"},{"label":"count = 3","detail":"3 <= 3 → run"},{"label":"count = 4","detail":"4 <= 3 → stop"}]}
```

### Three parts of a healthy loop

1. **Start**: set up the variable the condition reads (`count = 1`).
2. **Condition**: the test that decides whether to go round again (`count <= 3`).
3. **Update**: change something so the condition *eventually* becomes false (`count = count + 1`).

Forget the update and the condition stays true forever: an **infinite loop**. If a run never finishes, press **Stop**.

> **Careful:** the most common loop bug is forgetting step 3, followed closely by an off-by-one (`<` vs `<=`). When your loop runs one time too many or too few, ask: "what is the *last* value of the counter that should run the block?"

### Accumulating

Loops are how programs add things up. Keep a running total outside the loop:

```python run
total = 0
number = 1
while number <= 5:
    total = total + number
    number += 1
print(total)
```

### Loop until the user says stop

When you don't know in advance how many rounds there will be, loop on the answers:

```python run
answer = ""
while answer != "quit":
    answer = input("Type a word (or quit): ")
    print("You typed", answer)
```

# Example: Doubling

How many times can you double 1 before passing a million? Predict, then run.

```python example
value = 1
steps = 0

while value <= 1_000_000:
    value = value * 2
    steps += 1

print("Doubled", steps, "times; value is now", value)
```

Start `value = 1`, condition `value <= 1_000_000`, update `value * 2`. We don't know the number of rounds beforehand: that's when `while` shines. (Underscores in numbers are just a readability aid.)

# Exercise: Countdown {#e1}

Print the numbers from `5` down to `1`, one per line, then print `Liftoff!`. Use a `while` loop.

```python starter
# Count down from 5 to 1, then print Liftoff!
```

```python solution
count = 5
while count >= 1:
    print(count)
    count -= 1
print("Liftoff!")
```

## Hints

1. What needs to change on each round so the loop eventually ends?
2. Which number should the counter start at, and what is the last value that should still be printed?
3. Start the counter at 5, loop while it is at least 1, print it, then subtract 1. Print `Liftoff!` after the loop.

## Explanation

The counter starts at 5, each round prints it and decrements it, and the condition `count >= 1` becomes false once it reaches 0. `Liftoff!` is outside the loop (not indented), so it prints once at the end.

# Exercise: Add them up {#e2}

`n = 10`. Use a `while` loop to add the whole numbers from `1` to `n` (inclusive) into a variable called `total`.

```python starter
n = 10

# Create total
```

```python solution
n = 10

total = 0
number = 1
while number <= n:
    total += number
    number += 1
```

## Hints

1. You need somewhere to collect the running sum. Where should it start?
2. A second variable steps through the numbers. What must happen to it on every round?
3. Initialise `total` to 0 and a counter to 1; while the counter is at most `n`, add it to `total` and increase it.

## Explanation

`total` starts at 0 and grows each round by the current `number`. Using `<= n` includes `n` itself. The result for `n = 10` is 55.

# Exercise: How many doublings? {#e3}

Start with `value = 1` and `steps = 0`. Keep doubling `value` and adding 1 to `steps` **while `value` is less than 1000**. When the loop ends, `value` should be `1024` and `steps` `10`.

```python starter
value = 1
steps = 0

# Loop here
```

```python solution
value = 1
steps = 0

while value < 1000:
    value *= 2
    steps += 1
```

## Hints

1. Both variables change on every round. Which two lines belong inside the loop?
2. What is the loop condition? Think about which value gets compared with 1000.
3. Loop while `value < 1000`; inside, double `value` and add one to `steps`.

## Explanation

After 10 doublings `value` is 1024, which is no longer below 1000, so the loop stops. `steps` counted the rounds.

# Exercise: Sum until zero {#e4}

Write a program that reads whole numbers with `input()` until the user enters `0`, then prints their sum on the last line. For the inputs `3`, `4`, `0` it should print `7`.

```python starter
# Read numbers until 0, then print the total
```

```python solution
total = 0
number = int(input("Number (0 to stop): "))
while number != 0:
    total += number
    number = int(input("Number (0 to stop): "))
print(total)
```

## Hints

1. You don't know how many numbers will arrive. What is the loop's stopping signal?
2. The condition reads the latest number the user typed, so where must the first `input()` happen?
3. Read once before the loop, then loop while the number isn't 0, adding it and reading the next one at the end of each round.

## Explanation

Reading once *before* the loop gives the condition something to test. Each round adds the current number and reads the next. The `0` is never added, because the loop ends as soon as it is read.

# Quiz

## What happens if you forget to update the variable in a `while` loop's condition?

- [ ] Python stops with an error
- [x] The loop may never end
- [ ] The loop runs zero times

Explanation: If nothing changes, the condition stays true forever. That's an infinite loop. Press Stop to break out.

## How many times does this print?

```python
n = 0
while n < 3:
    print(n)
    n += 1
```

- [ ] 2
- [x] 3
- [ ] 4

Explanation: It prints for n = 0, 1 and 2. When n becomes 3, `n < 3` is false.

## Where does `print("done")` run if it is *not* indented under the loop?

- [ ] Every round
- [ ] Never
- [x] Once, after the loop ends

Explanation: Indentation decides what is inside the loop. An unindented line runs after the loop has finished.
