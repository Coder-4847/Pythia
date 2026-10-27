---
id: booleans-comparisons
module: fnd-decisions
title: True, False and comparisons
minutes: 12
goal: Compare values with ==, !=, <, >, <= and >= and use the resulting booleans.
summary: Questions your program can ask, and the True/False answers that drive every decision.
---

# Concept

A **boolean** has just two values: `True` and `False`. They are what you get when you ask a question about your data. Comparison operators ask the questions:

| Operator | Asks | Example | Result |
|---|---|---|---|
| `==` | equal? | `3 == 3` | `True` |
| `!=` | not equal? | `3 != 4` | `True` |
| `<` `>` | less / greater? | `2 < 1` | `False` |
| `<=` `>=` | less-or-equal / greater-or-equal? | `5 >= 5` | `True` |

```python run
age = 17
print(age >= 18)
print(age == 17)
print(age != 17)
```

A comparison is just an expression, so you can store the answer:

```python run
age = 17
is_adult = age >= 18
print(is_adult)
print(type(is_adult))
```

### `=` versus `==`

This catches everyone at first. One equals sign **assigns**; two equals signs **ask**.

```python run
x = 5          # store 5 in x
print(x == 5)  # ask: is x equal to 5?
```

> **Careful:** writing `x = 5` when you meant `x == 5` doesn't give an error in every situation. It silently changes `x`! If a check always seems to "pass", count the equals signs.

### Chaining and strings

Python lets you chain comparisons like maths does:

```python run
age = 14
print(13 <= age <= 19)
```

Strings compare too, and **case matters**:

```python run
print("apple" == "apple")
print("Apple" == "apple")
print("apple" < "banana")
print("Apple".lower() == "apple")
```

And `in` asks whether something is contained in a string:

```python run
print("py" in "python")
```

# Example: A few questions

Predict each `True` or `False` before running.

```python example
temperature = 21
name = "Ada"

print(temperature > 20)
print(temperature == 21.0)
print(name == "ada")
print(name.lower() == "ada")
print(0 < temperature < 15)
print("A" in name)
```

`21 == 21.0` is `True`: Python compares numeric values, not types. `"Ada" == "ada"` is `False` because capital letters are different characters, but lowering first makes them match.

# Exercise: Old enough? {#e1}

`age = 17`. Create `is_adult`, which is `True` when `age` is **18 or more**, using a comparison.

```python starter
age = 17

# Create is_adult
```

```python solution
age = 17

is_adult = age >= 18
```

## Hints

1. You don't need an `if`. The comparison itself is the value you want to store.
2. "18 or more": is 18 itself included?
3. Compare `age` against 18 with the operator that allows equality, and assign the result to the new name.

## Explanation

`age >= 18` evaluates to `False` for 17, and that boolean is stored in `is_adult`. Using `>` instead would wrongly exclude 18-year-olds.

# Exercise: Teenager {#e2}

`age = 14`. Create `is_teen`, which is `True` for ages **13 to 19, inclusive**, using one chained comparison.

```python starter
age = 14

# Create is_teen
```

```python solution
age = 14

is_teen = 13 <= age <= 19
```

## Hints

1. Both ends are included. Which comparison operators allow equality?
2. Python lets you put a value between two limits in a single expression, as in maths.
3. Write the lower limit, `age`, and the upper limit in one line with `<=` on both sides.

## Explanation

`13 <= age <= 19` means "13 is at most age, and age is at most 19". For 14 that's `True`, for 12 or 20 it would be `False`.

# Exercise: Same word? {#e3}

`a = "Python"` and `b = "python"`. Create `same`, which is `True` when the two words are equal **ignoring capital letters**.

```python starter
a = "Python"
b = "python"

# Create same
```

```python solution
a = "Python"
b = "python"

same = a.lower() == b.lower()
```

## Hints

1. What makes `a == b` give the wrong answer here?
2. Could you make both strings use the same case before comparing?
3. Lower-case each word with a string method, and compare the results with `==`.

## Explanation

Capital letters are different characters, so `"Python" == "python"` is `False`. Lowering both sides first removes the difference.

# Exercise: Spot the bug {#e4}

`is_five` should be `True` only when `answer` equals 5. The starter code has a classic bug. Fix it.

```python starter
answer = 5
is_five = answer = 5
```

```python solution
answer = 5
is_five = answer == 5
```

## Hints

1. After the second line, what do you think `is_five` holds? Try printing it.
2. How many equals signs does a comparison need?
3. In the second line, replace the second assignment with the operator that asks "is it equal?".

## Explanation

`is_five = answer = 5` is a chained **assignment**: it stores `5` in both names. Changing the second `=` to `==` turns it into a comparison, so `is_five` becomes `True`.

# Quiz

## What is `3 == 3.0`?

- [x] `True`
- [ ] `False`
- [ ] An error

Explanation: Python compares numeric values, and 3 and 3.0 are the same number.

## What is `"Cat" == "cat"`?

- [ ] `True`
- [x] `False`
- [ ] An error

Explanation: Upper- and lower-case letters are different characters, so the strings are not equal.

## What does `x = 5` do?

- [ ] Asks whether `x` equals 5
- [x] Stores 5 in `x`
- [ ] Prints `True`

Explanation: A single `=` is an assignment. Use `==` to compare.
