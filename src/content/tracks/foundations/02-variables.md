---
id: variables
module: fnd-start
title: Variables
minutes: 12
goal: Store values under names with =, read them back, and change them.
summary: Give values names, reuse them, and change them as your program runs.
---

# Concept

A **variable** is a name attached to a value, so you can use the value again later. You create one with `=`:

```python run
age = 14
print(age)
```

Read `age = 14` as **"let the name `age` refer to the value `14`"**. The name goes on the left, the value on the right.

```diagram
{"type":"boxes","caption":"After running: name = \"Ada\", age = 14","items":[{"name":"name","value":"\"Ada\""},{"name":"age","value":"14"}]}
```

### `=` is not "equals"

In maths, `=` says two things are equal. In Python it is an **instruction**: *take the value on the right and store it under the name on the left.* That's why this makes sense in Python:

```python run
score = 10
score = score + 5
print(score)
```

Python works out the right side first (`10 + 5 = 15`), then stores the result back under `score`. Variables can change; that's why they're called *variables*.

### Using variables

Once a name exists, use it anywhere you could use the value:

```python run
price = 4
quantity = 3
print("Total:", price * quantity)
```

`*` means multiply. We'll meet all the operators in a later lesson.

### Choosing names

- Use letters, digits and underscores, and don't start with a digit: `total_score`, `player2`.
- Names are **case-sensitive**: `Age` and `age` are two different names.
- Pick names that explain themselves. `price` beats `p`.
- By convention, Python names use `lower_snake_case`.

> **Careful:** using a name that was never assigned stops your program with a `NameError`. If you see one, ask yourself: *was this name created before this line ran?*

# Example: A receipt

Predict the output, then run it. Which variable changes, and when?

```python example
item = "notebook"
price = 3
quantity = 4

total = price * quantity
print(item, "x", quantity, "=", total)

quantity = 5
print("After adding one more:", price * quantity)
print("But total is still", total)
```

`total` was calculated **once**, when that line ran, using the values `price` and `quantity` had at that moment. Changing `quantity` afterwards does not recalculate `total`. Variables hold values, not formulas.

# Exercise: Your first variables {#e1}

Create two variables:

- `name`, set to the text `"Ada"`
- `age`, set to the number `14`

```python starter
# Create name and age below
```

```python solution
name = "Ada"
age = 14
```

## Hints

1. A variable is created by assigning to a name. Which symbol does that?
2. The name goes on the left of `=`. What goes on the right for each of the two variables?
3. Text needs quotes and numbers don't, so `name` gets `"Ada"` with quotes and `age` gets a bare number.

## Explanation

`name = "Ada"` stores the string `Ada` under the name `name`. `age = 14` stores the number `14` under `age`. Two lines, two names, each pointing at its own value.

# Exercise: Update a score {#e2}

The starter code gives `score` a first value. Add a line that **adds 5** to `score`, so that after your code runs, `score` is `15`.

```python starter
score = 10
# Add 5 to score here

print(score)
```

```python solution
score = 10
score = score + 5

print(score)
```

## Hints

1. Think back to how the lesson changed `score` using its own old value.
2. Python works out the right-hand side first. What is `score + 5` when `score` is 10?
3. Assign the result back to the same name: `score` on the left, `score + 5` on the right.

## Explanation

`score = score + 5` reads the current value (10), adds 5 to get 15, then stores 15 back under the name `score`. The old value is replaced.

# Exercise: Swap two values {#e3}

`a` is `1` and `b` is `2`. Write code so that afterwards **`a` is `2` and `b` is `1`**. You'll need a third variable to hold one of the values temporarily.

```python starter
a = 1
b = 2

# Swap them here
```

```python solution
a = 1
b = 2

temp = a
a = b
b = temp
```

## Hints

1. If you write `a = b` straight away, what happens to the original value of `a`?
2. Where could you keep `a`'s value safe before overwriting it?
3. Copy `a` into a spare variable first, then assign `a = b`, and finally give `b` the saved value.

## Explanation

Assigning `a = b` immediately would lose `a`'s original value. So save it first: `temp = a`, then `a = b`, then `b = temp`. Think of juggling: you need a free hand for a moment. (Python also has a one-line trick for this, which you'll see later.)

# Exercise: A total {#e4}

You have `price = 4` and `quantity = 3`. Create a variable `total` that is `price` times `quantity`, then print it.

```python starter
price = 4
quantity = 3

# Create total and print it
```

```python solution
price = 4
quantity = 3

total = price * quantity
print(total)
```

## Hints

1. You need a new variable. What name does the task give it?
2. Which operator multiplies, and which two variables should it connect?
3. `total = price * quantity`, followed by a `print` of `total`.

## Explanation

`price * quantity` is evaluated to `12` and stored under the new name `total`. Then `print(total)` shows `12`. Using the variables instead of the numbers 4 and 3 means the line still works if the price changes.

# Quiz

## After `x = 5` and then `x = x + 1`, what is `x`?

- [ ] 5
- [x] 6
- [ ] It is an error, because `x` can't equal `x + 1`

Explanation: `=` is an instruction, not a claim of equality. Python computes `x + 1` (6) from the current value, then stores it back in `x`.

## Which is a valid variable name?

- [ ] `2nd_place`
- [ ] `my score`
- [x] `my_score`

Explanation: Names can't start with a digit or contain spaces. Underscores are the standard way to join words.

## What does this print?

```python
n = 3
doubled = n * 2
n = 10
print(doubled)
```

- [ ] 20
- [x] 6
- [ ] 3

Explanation: `doubled` was calculated when `n` was 3. Changing `n` later does not recompute it, because variables store values, not formulas.
