---
id: data-types
module: fnd-start
title: Types of values
minutes: 12
goal: Tell integers, floats, strings and booleans apart, and convert between them.
summary: Every value has a type. Learn the four basic ones and how to convert between them.
---

# Concept

Every value in Python has a **type**, which decides what you can do with it. You can ask Python for it with `type()`:

```python run
print(type(42))
print(type(3.14))
print(type("hello"))
print(type(True))
```

These are the four basic types:

| Type | Name | Examples |
|---|---|---|
| `int` | whole number | `7`, `-3`, `0` |
| `float` | number with a decimal point | `2.5`, `-0.1`, `3.0` |
| `str` | text (a *string*) | `"hi"`, `'42'`, `""` |
| `bool` | true or false | `True`, `False` |

### Same look, different meaning

`5` and `"5"` look alike but are different things. Watch what `+` does:

```python run
print(5 + 3)
print("5" + "3")
```

Numbers add. Strings **join**. Python never guesses which you meant, so mixing them is an error:

```python run
print("Age: " + 14)
```

Read the last line of that error. Python is telling you the two types it could not combine.

### Converting between types

Use the type's name as a function to convert:

```python run
age_text = "14"
age = int(age_text)
print(age + 1)
print("You are " + str(age) + " years old")
print(float("2.5") * 2)
```

- `int(...)` makes a whole number (it cuts off decimals: `int(3.9)` is `3`).
- `float(...)` makes a decimal number.
- `str(...)` makes text.

> **Careful:** `int("hello")` fails with a `ValueError`, because `"hello"` doesn't look like a number. Conversion only works when the text really does hold a number.

# Example: Converting a price

Predict each line's output, then run it.

```python example
price_text = "4"
quantity = 3

total = int(price_text) * quantity
print(total)
print(type(total))

label = "Total: " + str(total)
print(label)
print(type(label))
```

`price_text` is a string, so multiplying needs `int()` first. The result `total` is an `int`. To glue a number onto text, convert it with `str()`. Notice that converting makes a **new** value; `price_text` itself is unchanged.

# Exercise: One of each type {#e1}

Create four variables, each with the right **type**:

- `count`: the whole number `7`
- `price`: the decimal number `2.5`
- `label`: the text `"apples"`
- `in_stock`: the boolean `True`

```python starter
# Create count, price, label and in_stock
```

```python solution
count = 7
price = 2.5
label = "apples"
in_stock = True
```

## Hints

1. Each value has a different look: some have quotes, some have a dot, one is a keyword.
2. Which of the four values would Python print `<class 'float'>` for?
3. Text goes in quotes. The boolean is written `True` with a capital T and no quotes.

## Explanation

`7` is an `int`, `2.5` a `float`, `"apples"` a `str`, and `True` a `bool`. Quotes make text, a decimal point makes a float, and `True`/`False` are special keywords, so they are written without quotes.

# Exercise: Text to number {#e2}

`age_text` holds the **text** `"21"`. Create `age` as the same value as a real number, then create `next_year` as `age` plus one.

```python starter
age_text = "21"

# Create age and next_year
```

```python solution
age_text = "21"

age = int(age_text)
next_year = age + 1
```

## Hints

1. `age_text + 1` fails. Why? What would you need to do to `age_text` first?
2. Which of `int()`, `float()` and `str()` turns text into a whole number?
3. Wrap `age_text` in the conversion function to make `age`, then add one to `age`.

## Explanation

`int(age_text)` creates a new integer, `21`, from the text. After that `age + 1` is ordinary arithmetic and gives `22`. Doing the maths on the text version would have been a `TypeError`.

# Exercise: Build a message {#e3}

`score` is the number `95`. Create a string `message` that reads exactly `Score: 95`, built from the text `"Score: "` and the variable `score`.

```python starter
score = 95

# Create message
```

```python solution
score = 95

message = "Score: " + str(score)
```

## Hints

1. Joining text and a number with `+` is a `TypeError`. What do the two sides have in common after you fix that?
2. Which conversion turns a number into text?
3. Convert `score` to a string, then join it to `"Score: "` with `+`.

## Explanation

`"Score: " + score` fails because `+` won't mix a string and an int. `str(score)` turns `95` into `"95"`, and then joining two strings works: `"Score: 95"`.

# Quiz

## What does `print("5" + "3")` show?

- [ ] 8
- [x] 53
- [ ] An error

Explanation: Both values are strings, so `+` joins them. Python only does arithmetic when both sides are numbers.

## Which type is `3.0`?

- [ ] `int`
- [x] `float`
- [ ] `str`

Explanation: The decimal point makes it a float, even though the value is a whole number.

## What happens with `int("hello")`?

- [ ] It returns 0
- [ ] It returns the text unchanged
- [x] It raises a `ValueError`

Explanation: `int()` only converts text that actually looks like a whole number. Anything else is a `ValueError`.
