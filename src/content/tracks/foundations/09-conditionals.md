---
id: conditionals
module: fnd-decisions
title: if, elif and else
minutes: 14
goal: Make a program choose between paths with if, elif and else, and indent blocks correctly.
summary: Let your program decide: run some lines only when a condition is true.
---

# Concept

An `if` statement runs a block of code **only when** its condition is `True`:

```python run
temperature = 30

if temperature > 25:
    print("It's hot!")
print("Done")
```

Two details matter:

- The condition ends with a **colon** `:`.
- The block is **indented** (4 spaces is the convention). Everything indented under the `if` belongs to it. The unindented `print("Done")` runs regardless.

### else: the other path

```python run
temperature = 12

if temperature > 25:
    print("Hot")
else:
    print("Not hot")
```

### elif: several paths

`elif` ("else if") adds more conditions. Python checks them **in order** and runs the first one that is true, then skips the rest:

```python run
score = 78

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("Try again")
```

Notice how order does the work: when we reach the `elif score >= 80`, we already know the score is *below 90*.

```diagram
{"type":"flow","caption":"score = 78: Python tests each condition in turn","steps":[{"label":"score >= 90?","detail":"no"},{"label":"score >= 80?","detail":"no"},{"label":"score >= 70?","detail":"yes → print C"}]}
```

> **Careful:** indentation *is* the syntax in Python. A block indented by 3 spaces on one line and 4 on the next is an `IndentationError`. And if you test the *wider* condition first (`score >= 70` before `score >= 90`), the wider one swallows everything. Ask yourself: "which cases can reach this line?"

### Nesting

You can put an `if` inside another block:

```python run
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Come in")
    else:
        print("Buy a ticket")
else:
    print("Too young")
```

# Example: Pricing

Read the code, predict the output for `age = 8`, then change `age` and run again.

```python example
age = 8

if age < 5:
    price = 0
elif age < 18:
    price = 8
else:
    price = 15

print(f"A ticket costs ${price}")
```

Only one branch ever runs, and `price` is set in whichever one it was. The `elif age < 18` doesn't need to say "and age >= 5": the `if` before it already ruled out smaller ages.

# Exercise: Hot or not {#e1}

`temperature = 28`. Print `Hot` if the temperature is **25 or above**, otherwise print `Mild`.

```python starter
temperature = 28

# Decide what to print
```

```python solution
temperature = 28

if temperature >= 25:
    print("Hot")
else:
    print("Mild")
```

## Hints

1. Your program has exactly two paths. Which statement chooses between two?
2. The boundary is "25 or above". Does 25 itself count as hot?
3. Test `temperature` against 25 with the inclusive operator in an `if`, and put the other message in the `else` block.

## Explanation

`if temperature >= 25:` runs the first block for 25 and everything above; every other value falls through to `else`. The colons and the indentation are required.

# Exercise: Letter grades {#e2}

`score = 85`. Print the grade: `A` for 90+, `B` for 80–89, `C` for 70–79, otherwise `F`.

```python starter
score = 85

# Print the grade
```

```python solution
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("F")
```

## Hints

1. There are four outcomes, so one `if`/`else` won't be enough.
2. Python stops at the first true condition. In which order should you test the boundaries?
3. Start with the highest threshold and work down using `elif`. Put `F` in the final `else`.

## Explanation

Checking from the top, each `elif` only runs when everything above was false, so `elif score >= 80` really means "between 80 and 89". The final `else` catches all scores below 70.

# Exercise: Odd or even {#e3}

`number = 7`. Print `odd` if the number is odd and `even` if it is even. (Remember what `%` gives you.)

```python starter
number = 7

# Print odd or even
```

```python solution
number = 7

if number % 2 == 0:
    print("even")
else:
    print("odd")
```

## Hints

1. What is the remainder when you divide an even number by 2?
2. Which operator gives you that remainder, and which one asks "is it equal"?
3. Test whether the remainder of `number` divided by 2 equals zero, and print `even` in that branch.

## Explanation

An even number divides by 2 with no remainder, so `number % 2 == 0` is `True`. Every other integer leaves remainder 1, which goes to the `else` branch.

# Exercise: Ticket price {#e4}

Set `price` from `age = 30`: free (`0`) under 5, `8` from 5 to 17, `15` from 18 to 64, and `10` for 65 and over.

```python starter
age = 30

# Set price
```

```python solution
age = 30

if age < 5:
    price = 0
elif age < 18:
    price = 8
elif age < 65:
    price = 15
else:
    price = 10
```

## Hints

1. Four price bands means a chain of conditions. Which keyword adds a condition after the first `if`?
2. Going upwards from the youngest age, what is the upper limit of each band?
3. Test `age < 5`, then `age < 18`, then `age < 65`, and use `else` for the seniors. Assign `price` in each block.

## Explanation

Each `elif` only needs the *upper* limit of its band, because younger ages were handled earlier in the chain. Going from small to large keeps every condition simple.

# Quiz

## What goes at the end of an `if` line?

- [ ] A semicolon
- [x] A colon
- [ ] Nothing

Explanation: Every block-opening line (`if`, `elif`, `else`, and later `for`, `while`, `def`) ends with a colon.

## What does this print?

```python
x = 5
if x > 3:
    print("A")
elif x > 1:
    print("B")
```

- [x] `A`
- [ ] `B`
- [ ] `A` and `B`

Explanation: Python runs only the first branch whose condition is true. The `elif` is skipped once `x > 3` matched.

## What does indentation do in Python?

- [ ] It's just for looks
- [x] It defines which lines belong to a block
- [ ] It makes code run faster

Explanation: Indentation is part of the syntax: it tells Python which lines belong to the `if`, `else`, loop or function.
