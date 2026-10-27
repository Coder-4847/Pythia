---
id: input-and-output
module: fnd-input
title: Input and output
minutes: 12
goal: Read answers with input(), convert them, and control how print() formats its output.
summary: Make your programs interactive: ask questions, use the answers, shape what you print.
---

# Concept

So far every value was written into the program. `input()` lets the **user** supply one while it runs. It shows a question (the *prompt*), waits for a line of typing, and gives you back what was typed:

```python run
name = input("What is your name? ")
print("Hello,", name)
```

Run it, type something into the console and press Enter.

### input() always gives text

Whatever the user types, `input()` returns a **string**, even if they type digits. To do arithmetic, convert it:

```python run
text = input("How old are you? ")
age = int(text)
print("Next year you will be", age + 1)
```

You'll often see the two steps combined: `age = int(input("How old are you? "))`.

> **Careful:** `input("Number: ") + 1` raises a `TypeError`, because it's text plus a number. If Pythia asks "what type is that value?", this is often the reason. And `int("abc")` is a `ValueError`: converting only works when the text looks like a number.

### Shaping print

`print` takes two optional named arguments:

- `sep` is what goes **between** values (default: one space).
- `end` is what goes **after** the last value (default: a new line).

```python run
print("a", "b", "c", sep="-")
print("Loading", end="")
print("...")
print("2026", "01", "15", sep="/")
```

### Putting it together

```python run
price = float(input("Price: "))
quantity = int(input("How many? "))
print(f"Total: {price * quantity:.2f}")
```

`float()` accepts decimals like `2.5`. The f-string formats the total with two decimals.

# Example: A tip calculator

Run it and answer the questions.

```python example
bill = float(input("Bill amount: "))
percent = int(input("Tip percent: "))

tip = bill * percent / 100
print(f"Tip: {tip:.2f}")
print(f"Total: {bill + tip:.2f}")
```

Each `input()` is converted straight away: `float` for the money (it can have cents), `int` for the whole-number percentage. After that it is plain arithmetic.

# Exercise: Greeting {#e1}

Ask the user for their name with `input()`, then print `Hello, ` followed by the name and an exclamation mark. For `Ada` the last line printed must be `Hello, Ada!`.

```python starter
# Ask for a name and greet the user
```

```python solution
name = input("What is your name? ")
print(f"Hello, {name}!")
```

## Hints

1. Which function waits for the user to type something?
2. Where does the typed text go once you have it? You need to hold on to it for the next line.
3. Store the answer in a variable, then print a message that includes that variable.

## Explanation

`input(...)` returns what was typed as a string, which you store in `name`. The f-string drops it into the greeting. Any prompt wording is fine; only the final line is checked.

# Exercise: Next year {#e2}

Ask for the user's age as a whole number and print `Next year you will be 15` (with their age plus one in place of 15).

```python starter
# Ask for an age and print the next year's age
```

```python solution
age = int(input("How old are you? "))
print("Next year you will be", age + 1)
```

## Hints

1. What type does `input()` return, even when the user types digits?
2. What must you do to that value before you can add one to it?
3. Convert the answer to an integer, then print the sentence with the incremented number in it.

## Explanation

`int(input(...))` converts the typed text to a whole number straight away, so `age + 1` is arithmetic instead of a `TypeError`.

# Exercise: Add two numbers {#e3}

Read two whole numbers (one `input()` call each) and print their **sum** as the final line of output.

```python starter
# Read two numbers and print their sum
```

```python solution
a = int(input("First number: "))
b = int(input("Second number: "))
print(a + b)
```

## Hints

1. How many times do you need to call `input()`?
2. If you skip converting, what does `+` do to two strings?
3. Convert each answer with `int()` before adding. Print only the result on the last line.

## Explanation

Without `int()`, `"3" + "4"` would give `"34"`. Converting each answer first makes `+` add numbers: `7`.

# Exercise: Dates with dashes {#e4}

The starter prints three numbers separated by spaces. Change it so it prints `2026-01-15` (dashes, no spaces) **without** adding any text yourself: use the `sep` argument.

```python starter
print(2026, "01", 15)
```

```python solution
print(2026, "01", 15, sep="-")
```

## Hints

1. Which part of `print`'s output is unwanted: what is between the values, or what comes after?
2. `print` has a named argument for the separator. What is it called?
3. Add `sep="-"` after the values, separated from them by a comma.

## Explanation

`sep` replaces the single space that `print` normally puts between its arguments. Named arguments go after the positional ones.

# Quiz

## What type does `input()` always return?

- [ ] `int`
- [x] `str`
- [ ] It depends on what the user types

Explanation: `input()` returns text, whatever was typed. Convert it with `int()` or `float()` if you need a number.

## What does `print("a", "b", sep="")` show?

- [ ] `a b`
- [x] `ab`
- [ ] `a, b`

Explanation: `sep=""` puts nothing between the values, so they run together.

## What happens with `int(input())` if the user types `hello`?

- [ ] It returns 0
- [ ] It returns `"hello"`
- [x] A `ValueError`

Explanation: `int()` can only convert text that looks like a whole number. Later you'll learn to catch this error and ask again.
