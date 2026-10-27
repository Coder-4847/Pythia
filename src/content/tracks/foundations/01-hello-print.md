---
id: hello-print
module: fnd-start
title: Your first program
minutes: 8
goal: Use print() to show text and numbers, and leave comments in code.
summary: Meet print(), strings and comments, and run your very first Python.
---

# Concept

A program is a list of instructions. Python reads them **one line at a time, from top to bottom**, and does what each one says. The simplest instruction shows a message on the screen: `print()`.

```python run
print("Hello, world!")
```

Press **Run**. Then change the words between the quotes and run it again. You cannot break anything here.

### Three things to notice

- `print` is a **function**: a named instruction. The parentheses `( )` hold what you want to hand to it.
- Text is wrapped in **quotes**. A piece of text is called a *string*. Single quotes and double quotes both work: `'hi'` and `"hi"`.
- Each `print()` starts a **new line**.

```python run
print("First line")
print("Second line")
```

### Printing several things at once

Separate values with commas and `print` puts a space between them:

```python run
print("I am", 14, "years old")
```

Numbers don't need quotes. `14` is a number. `"14"` is text that happens to look like one. Python treats them very differently, and we'll see why in the next lessons.

### Comments

Everything after a `#` is ignored by Python. Comments are notes for humans, including future you.

```python run
# Python skips this whole line
print("Comments are free")  # you can also end a line with one
```

> **Careful:** Python is picky about spelling and punctuation. `Print` with a capital P is not `print`, and a forgotten closing quote or bracket is the most common beginner error of all. When that happens, Pythia will ask you a question rather than hand you the fix.

# Example: Putting it together

Read this program top to bottom and predict what it prints before you run it.

```python example
# A tiny program with three print calls
print("Python reads top to bottom.")
print("Next line:", 2 + 3)
print("It can even do maths!")
```

Notice the second line. `2 + 3` is not in quotes, so Python **works it out** and prints `5`. If we wrote `"2 + 3"` in quotes, it would print the text `2 + 3` instead. Try it: add quotes and run again.

# Exercise: Say hello {#e1}

Write a program that prints exactly this message:

`Hello, Pythia!`

Capital letters, the comma and the exclamation mark all count.

```python starter
# Print the message below
```

```python solution
print("Hello, Pythia!")
```

## Hints

1. Which function shows text on the screen? You met it a minute ago.
2. What should go between the parentheses, and what must surround text so Python knows it is text?
3. The message needs quotes around it, and the whole thing goes inside the parentheses of `print`.

## Explanation

`print("Hello, Pythia!")` calls the `print` function and hands it one string. The quotes tell Python that everything inside is text to show exactly as written, so the capital letters, the comma and the `!` all come through.

# Exercise: Two lines {#e2}

Print two separate lines, using **two** `print()` calls:

```text
Python is
fun
```

```python starter
# Two print calls, one per line
```

```python solution
print("Python is")
print("fun")
```

## Hints

1. Each `print()` call ends its line automatically.
2. How many `print()` calls do you need if you want two lines?
3. Put `"Python is"` in the first call and `"fun"` in the second.

## Explanation

Every call to `print` finishes with a new line, so two calls give two lines. There is no need to type the line break yourself.

# Exercise: A sentence with a number {#e3}

Use **one** `print()` call with three comma-separated values to show this sentence:

`I am 14 years old`

The `14` should be a real number, not text in quotes.

```python starter
# Print: I am 14 years old
```

```python solution
print("I am", 14, "years old")
```

## Hints

1. Remember how commas work inside `print`: they put spaces between the pieces for you.
2. Which of the three pieces are text (need quotes) and which is a number (does not)?
3. Three pieces: the text `"I am"`, the number `14`, and the text `"years old"`.

## Explanation

`print("I am", 14, "years old")` hands `print` three values. It converts each to text and joins them with single spaces. Because `14` is written without quotes, Python sees it as a number, which matters as soon as you want to do arithmetic with it.

# Quiz

## What does `print("5 + 3")` show?

- [ ] 8
- [x] 5 + 3
- [ ] An error

Explanation: Anything inside quotes is text, so Python prints it exactly as written. Without quotes, `print(5 + 3)` would show 8.

## Which line is a comment?

- [ ] `print("# hello")`
- [x] `# print("hello")`
- [ ] `print("hello") !`

Explanation: A comment starts with `#` outside of quotes. In the first option the `#` is inside a string, so it is just part of the text that gets printed.

## What is wrong with `print("Hello)`?

- [ ] Nothing, it works
- [ ] `print` needs a capital letter
- [x] The string is missing its closing quote

Explanation: Python reads from the opening quote and never finds the matching one, so it reports a syntax error. Matching your quotes and brackets is a habit worth building early.
