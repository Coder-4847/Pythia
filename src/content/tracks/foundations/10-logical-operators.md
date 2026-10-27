---
id: logical-operators
module: fnd-decisions
title: and, or, not
minutes: 12
goal: Combine conditions with and, or and not, and read compound conditions correctly.
summary: Ask more than one question at once, and flip answers around.
---

# Concept

One comparison answers one question. Real decisions often need several. Three **logical operators** combine booleans:

| Operator | `True` when… |
|---|---|
| `a and b` | **both** are true |
| `a or b` | **at least one** is true |
| `not a` | `a` is false (it flips the answer) |

```python run
age = 25
has_id = True

print(age >= 18 and has_id)
print(age < 18 or has_id)
print(not has_id)
```

### Using them in an if

```python run
age = 16
has_permission = True

if age >= 18 or has_permission:
    print("You can join")
else:
    print("Sorry")
```

### Read each side separately

Each side of `and`/`or` must be a **complete** condition. This is a very common slip:

```python
if age > 12 and < 20:      # wrong: "< 20" has no left side
if age > 12 and age < 20:  # right
```

(Or use the chained form you met earlier: `12 < age < 20`.)

Likewise, `if day == "Sat" or "Sun":` does not do what it reads like: `"Sun"` on its own counts as *true*, so the condition is **always** true. Write `day == "Sat" or day == "Sun"`.

### Precedence

`not` binds tightest, then `and`, then `or`. When mixing, add parentheses so the next reader (and you) can see the intent:

```python run
a, b, c = True, False, True
print(a or b and c)
print((a or b) and c)
print(not a or b)
```

> **Careful:** "none of them" and "not all of them" are different. `not (a or b)` means neither is true; `not (a and b)` means they're not both true. When a rule seems backwards, write it out in words.

Both `and` and `or` are **lazy**: Python stops as soon as the answer is known. In `x != 0 and 10 / x > 2`, a zero `x` never reaches the division. That's a useful guard.

# Example: Can they ride?

```python example
height = 130
age = 9

can_ride = height >= 120 and age >= 8
print("Can ride:", can_ride)

needs_adult = age < 12 or height < 140
print("Needs an adult:", needs_adult)

print("Fully independent:", not needs_adult)
```

Try other heights and ages. `and` needs both rules satisfied, `or` needs just one.

# Exercise: Roller coaster {#e1}

A rider needs `height >= 120` **and** `age >= 8`. With `height = 125` and `age = 9`, create `can_ride`.

```python starter
height = 125
age = 9

# Create can_ride
```

```python solution
height = 125
age = 9

can_ride = height >= 120 and age >= 8
```

## Hints

1. Is it enough to meet one rule, or must both hold?
2. Each rule is a comparison on its own variable.
3. Write each requirement as a complete comparison and join them with the operator that needs both.

## Explanation

`and` is `True` only if both sides are: `125 >= 120` and `9 >= 8` are both true, so `can_ride` is `True`. If either rider fails a rule, the whole thing is `False`.

# Exercise: Weekend {#e2}

`day = "Sat"`. Create `is_weekend`, which is `True` if `day` is `"Sat"` **or** `"Sun"`.

```python starter
day = "Sat"

# Create is_weekend
```

```python solution
day = "Sat"

is_weekend = day == "Sat" or day == "Sun"
```

## Hints

1. Either of two values is enough, so which operator fits?
2. Can `day` equal both at once? What does each side of the operator need to be?
3. Compare `day` with each weekend day separately, each as a full `==` comparison, joined by the "at least one" operator.

## Explanation

Each side of `or` must be a complete comparison. `day == "Sat" or day == "Sun"` is `True` for either. The shortcut `day == "Sat" or "Sun"` would always be true because `"Sun"` alone is truthy.

# Exercise: A login check {#e3}

Given `username = "admin"` and `password = "1234"`, print `Welcome` when the username is `"admin"` **and** the password is `"1234"`, otherwise print `Denied`.

```python starter
username = "admin"
password = "1234"

# Print Welcome or Denied
```

```python solution
username = "admin"
password = "1234"

if username == "admin" and password == "1234":
    print("Welcome")
else:
    print("Denied")
```

## Hints

1. Two things must both be right for access. How will you combine the checks?
2. What are the two comparisons, and which values do they compare?
3. Put both comparisons in the condition of one `if`, joined by the operator that needs both, and put `Denied` in the `else`.

## Explanation

The `and` makes access depend on both facts. A right username with a wrong password falls through to `else` and prints `Denied`.

# Exercise: Not on holiday {#e4}

`is_holiday = False` and `is_weekend = True`. Create `go_to_work`, which is `True` only on days that are **neither** a holiday **nor** a weekend.

```python starter
is_holiday = False
is_weekend = True

# Create go_to_work
```

```python solution
is_holiday = False
is_weekend = True

go_to_work = not is_holiday and not is_weekend
```

## Hints

1. Say the rule out loud: "I go to work if it is not a holiday and..."
2. Which operator flips a boolean?
3. Flip each boolean on its own, then combine the two with the operator that needs both.

## Explanation

`not is_holiday and not is_weekend` reads exactly like the rule. Equivalent forms exist, like `not (is_holiday or is_weekend)`; they say "neither is true".

# Quiz

## What is `True and False`?

- [ ] `True`
- [x] `False`
- [ ] An error

Explanation: `and` needs both sides true. One `False` is enough to make the whole expression `False`.

## What is `not (3 > 5)`?

- [x] `True`
- [ ] `False`
- [ ] `3`

Explanation: `3 > 5` is `False`, and `not` flips it to `True`.

## Why is `if day == "Sat" or "Sun":` a bug?

- [ ] `or` isn't allowed in an `if`
- [x] `"Sun"` on its own is always true, so the condition is always true
- [ ] It compares the wrong types

Explanation: Each side of `or` is a complete condition. A non-empty string counts as true, so the whole expression is always true, whatever `day` is.
