---
id: defining-functions
module: fnd-functions
title: Defining functions
minutes: 13
goal: Define a function with def, give it a parameter, and call it as many times as you like.
summary: Name a piece of code once and use it anywhere.
---

# Concept

You have used functions all along: `print`, `len`, `int`. A function is a **named, reusable block of code**. Now you'll write your own with `def`:

```python run
def greet():
    print("Hello!")
    print("Welcome to Pythia.")

greet()
greet()
```

Defining a function doesn't run it. It teaches Python a new word. The code inside runs **every time you call it** by writing its name with parentheses.

### Anatomy

```python
def greet():            # def, a name, parentheses, a colon
    print("Hello!")     # the body is indented
```

- Like `if` and `for`, the first line ends with a colon and the body is **indented**.
- The name follows the same rules as variable names (`lower_snake_case`).
- Parentheses are required, even if empty.

### Why bother?

If you copy-paste the same four lines three times and then need to change one, you have to change it three times. A function means you change it once. This idea is called **DRY**: *don't repeat yourself*.

### Parameters: giving the function input

Put a name inside the parentheses to let the caller pass a value in. That name is a **parameter**; the value you pass is an **argument**:

```python run
def greet(name):
    print("Hello,", name + "!")

greet("Ada")
greet("Grace")
```

Inside the function, `name` is just a variable that holds whatever was passed. Each call gets its own value.

With several parameters, arguments are matched **by position**:

```python run
def show_total(item, price):
    print(item, "costs", price)

show_total("tea", 3)
show_total("cake", 5)
```

> **Careful:** calling a function with the wrong number of arguments is a `TypeError`: `greet()` when it needs a name, or `greet("a", "b")` when it takes one. Also, writing `greet` without parentheses doesn't call it: it just refers to the function.

Functions must be **defined before they're called** in the file. Put your `def`s at the top.

# Example: A reusable banner

```python example
def banner(title):
    print("=" * 20)
    print(title.upper())
    print("=" * 20)

banner("welcome")
print("some content")
banner("goodbye")
```

The three-line pattern lives in one place. Change the width from 20 once and both banners change.

# Exercise: Say hello {#e1}

Define a function `greet()` (no parameters) that prints `Hello, world!`. The starter has no function yet.

```python starter
# Define greet()
```

```python solution
def greet():
    print("Hello, world!")
```

## Hints

1. Which keyword introduces a new function?
2. What goes after the function's name, and what ends the first line?
3. `def`, the name, empty parentheses, a colon, then an indented `print` line.

## Explanation

`def greet():` creates the function, and the indented line is its body. Nothing prints until someone calls `greet()`. The tests call it for you.

# Exercise: Shout {#e2}

Define `shout(text)` that prints `text` in upper case followed by an exclamation mark. `shout("hello")` prints `HELLO!`.

```python starter
# Define shout(text)
```

```python solution
def shout(text):
    print(text.upper() + "!")
```

## Hints

1. This function needs input. How does a function receive a value?
2. What do you need to do to the text before it is printed?
3. Add a parameter, then print the upper-cased text joined to `"!"`.

## Explanation

The parameter `text` receives whatever the caller passes. `.upper()` creates the capitals, and `+ "!"` joins the exclamation mark.

# Exercise: A boxed title {#e3}

Define `box(title)` that prints the title with a line of `-` characters above and below it, each exactly as long as the title. `box("Hi")` prints:

```text
--
Hi
--
```

```python starter
# Define box(title)
```

```python solution
def box(title):
    line = "-" * len(title)
    print(line)
    print(title)
    print(line)
```

## Hints

1. How long should the lines be? That depends on the argument, not a fixed number.
2. Which function measures a string, and which operator repeats one?
3. Build the line once from the title's length, and print it, then the title, then the line.

## Explanation

`"-" * len(title)` produces a line as long as the title, whatever it is. Storing it in `line` avoids computing it twice.

# Exercise: Call it three times {#e4}

The function `cheer()` is already defined. Add code **below** it that calls it three times using a loop.

```python starter
def cheer():
    print("Hip hip hooray!")

# Call cheer three times
```

```python solution
def cheer():
    print("Hip hip hooray!")

for _ in range(3):
    cheer()
```

## Hints

1. Defining a function doesn't run it. What actually runs it?
2. You need a call repeated a fixed number of times. Which loop fits?
3. Use a `for` loop over `range(3)` and put the call to `cheer` in its body.

## Explanation

`cheer()` with parentheses is the call. The `for` loop repeats it three times. (`_` is the usual name for a loop variable you don't use.)

# Quiz

## What does `def hello():` do by itself?

- [ ] Prints hello
- [x] Defines the function but doesn't run it
- [ ] Runs the function once

Explanation: A `def` only creates the function. The body runs when you call it with `hello()`.

## In `def area(w, h):` what are `w` and `h`?

- [x] Parameters
- [ ] Arguments
- [ ] Return values

Explanation: Parameters are the names in the definition. The values you pass when calling are the arguments.

## What happens with `greet` (no parentheses) on its own line?

- [ ] The function runs
- [ ] A `SyntaxError`
- [x] Nothing visible: it only refers to the function without calling it

Explanation: Parentheses perform the call. Without them you just mention the function.
