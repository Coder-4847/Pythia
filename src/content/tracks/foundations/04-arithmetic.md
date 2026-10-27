---
id: arithmetic
module: fnd-input
title: Arithmetic
minutes: 12
goal: Use the arithmetic operators, including // and %, and predict how Python orders operations.
summary: Python as a calculator, plus the operators that surprise people: / vs // and %.
---

# Concept

Python is a very good calculator. The operators:

| Operator | Meaning | Example | Result |
|---|---|---|---|
| `+` `-` | add, subtract | `7 - 2` | `5` |
| `*` | multiply | `3 * 4` | `12` |
| `/` | divide | `7 / 2` | `3.5` |
| `//` | floor-divide (whole part only) | `7 // 2` | `3` |
| `%` | remainder | `7 % 2` | `1` |
| `**` | power | `2 ** 3` | `8` |

```python run
print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 10)
```

### Two divisions

`/` **always** gives a float, even when the answer is whole: `8 / 2` is `4.0`. `//` throws away the fraction and gives the whole part. Together with `%` they split a number into "how many fit" and "what's left":

```python run
minutes = 135
print(minutes // 60, "hours and", minutes % 60, "minutes")
```

> **Careful:** `//` rounds *down*, not toward zero. `-7 // 2` is `-4`, not `-3`. If a loop or a split looks off by one for negative numbers, this is usually why.

### Order of operations

Python follows the maths rules you know: `**` first, then `*` `/` `//` `%`, then `+` `-`. Use parentheses to be explicit:

```python run
print(2 + 3 * 4)
print((2 + 3) * 4)
```

A classic slip is an average: `6 + 8 + 10 / 3` divides **only the 10**. Parenthesise the sum first.

### Shortcuts

`x += 1` means `x = x + 1`. There are matching `-=`, `*=`, `/=`.

```python run
total = 10
total += 5
total *= 2
print(total)
```

# Example: Splitting a bill

Predict the output before you run it.

```python example
bill = 47
people = 4

each = bill // people
left_over = bill % people

print("Each person pays", each)
print("Left over:", left_over)
print("Exact share:", bill / people)
```

`//` and `%` tell the whole story in whole numbers: 4 people can each pay 11 and 3 is left over. `/` gives the exact share, `11.75`.

# Exercise: Seconds in a shift {#e1}

A shift lasts `hours` hours and `minutes` minutes. Create `total_seconds` for the whole shift.

```python starter
hours = 2
minutes = 15

# Create total_seconds
```

```python solution
hours = 2
minutes = 15

total_seconds = (hours * 60 + minutes) * 60
```

## Hints

1. How many seconds are in a minute? In an hour?
2. You could convert everything to minutes first. Which operation needs parentheses so it happens before the next one?
3. Add the minutes from the hours to the extra minutes, then convert the total minutes to seconds.

## Explanation

2 hours is 120 minutes; plus 15 gives 135 minutes; times 60 gives 8100 seconds. The parentheses make Python add before it multiplies by 60.

# Exercise: Share the sweets {#e2}

`sweets = 17` are shared equally between `children = 5`. Create `each` (how many sweets every child gets) and `left_over` (how many remain).

```python starter
sweets = 17
children = 5

# Create each and left_over
```

```python solution
sweets = 17
children = 5

each = sweets // children
left_over = sweets % children
```

## Hints

1. You need whole sweets only, so which division would keep just the whole part?
2. And which operator tells you what is left after sharing?
3. One operator for each variable: floor division for `each`, remainder for `left_over`.

## Explanation

`17 // 5` is `3` (three whole sweets each) and `17 % 5` is `2` (two left over). Notice that `3 * 5 + 2 == 17`: the two answers always rebuild the original number.

# Exercise: Squares and cubes {#e3}

`side = 4`. Create `area` (side squared) and `volume` (side cubed) using the power operator.

```python starter
side = 4

# Create area and volume
```

```python solution
side = 4

area = side ** 2
volume = side ** 3
```

## Hints

1. Squaring means multiplying a number by itself. Which operator does repeated multiplication in one go?
2. How do you say "to the power of 2" and "to the power of 3"?
3. Use `**` with a different exponent for each variable.

## Explanation

`side ** 2` is `4 * 4 = 16` and `side ** 3` is `4 * 4 * 4 = 64`. `**` takes the exponent on its right.

# Exercise: Fix the average {#e4}

This code is supposed to calculate the average of 6, 8 and 10, which is `8.0`, but it gives the wrong answer. Fix the expression.

```python starter
average = 6 + 8 + 10 / 3
```

```python solution
average = (6 + 8 + 10) / 3
```

## Hints

1. Work out by hand which number gets divided by 3 in the current line.
2. Which operation should happen first, and how do you force that order?
3. The three numbers should be added together as a group before the division.

## Explanation

Division binds tighter than addition, so `6 + 8 + 10 / 3` is `6 + 8 + 3.33...`. Putting the sum in parentheses makes Python add first: `24 / 3 = 8.0`.

# Quiz

## What is `7 // 2`?

- [ ] 3.5
- [x] 3
- [ ] 4

Explanation: `//` keeps only the whole part of the division, so 7 // 2 is 3. `/` would give 3.5.

## What is `2 + 3 * 4`?

- [ ] 20
- [x] 14
- [ ] 24

Explanation: Multiplication happens before addition: 3 * 4 is 12, plus 2 gives 14. Write `(2 + 3) * 4` if you want 20.

## What is `10 % 3`?

- [ ] 3
- [x] 1
- [ ] 0.333

Explanation: `%` is the remainder: 3 fits into 10 three times (9) and leaves 1.
