---
id: lists-basics
module: ds-lists
title: Lists
minutes: 13
goal: Create lists, read and change items by index, and use len(), append() and in.
summary: An ordered, changeable collection: the workhorse of Python.
---

# Concept

A **list** holds several values in order, written in square brackets:

```python run
colors = ["red", "green", "blue"]
numbers = [10, 20, 30, 40]
mixed = ["Ada", 36, True, 2.5]
empty = []
print(colors)
print(len(numbers))
```

Lists can hold anything, even different types together, and they can grow and shrink while the program runs.

### Indexing

Items are numbered from **0**, exactly like the characters of a string, and negative indexes count from the end:

```diagram
{"type":"strip","caption":"colors = [\"red\", \"green\", \"blue\"]","cells":["\"red\"","\"green\"","\"blue\""],"highlight":[1],"negative":true}
```

```python run
colors = ["red", "green", "blue"]
print(colors[0])
print(colors[2])
print(colors[-1])
```

> **Careful:** `colors[3]` on a three-item list is an `IndexError`: the valid positions are 0 to 2, which is one less than `len(colors)`. If you've ever written `range(len(items) + 1)`, Pythia's question is: "what is the last valid index?"

### Changing a list

Unlike strings, lists are **mutable**: you can replace items in place and add new ones.

```python run
colors = ["red", "green", "blue"]
colors[1] = "yellow"
colors.append("purple")
print(colors)
```

`append` adds one item at the end. Notice that it *changes the list itself* and returns nothing: you don't write `colors = colors.append(...)`. (That would set `colors` to `None`, a classic slip.)

### Membership and length

```python run
colors = ["red", "green", "blue"]
print("green" in colors)
print("pink" in colors)
print(len(colors))
```

### Lists of lists

An item can itself be a list. Index twice to reach inside:

```python run
grid = [[1, 2, 3], [4, 5, 6]]
print(grid[1])
print(grid[1][2])
```

# Example: A shopping list

```python example
shopping = ["milk", "eggs"]
shopping.append("bread")
shopping[0] = "oat milk"

print(shopping)
print("Items:", len(shopping))
print("First:", shopping[0], "| Last:", shopping[-1])
print("Need eggs?", "eggs" in shopping)
```

Each line changes or reads the same list object. `shopping[0] = ...` replaced the first item, and `.append` grew the list.

# Exercise: Make a list {#e1}

Create a list called `colors` holding the three strings `"red"`, `"green"` and `"blue"` in that order.

```python starter
# Create colors
```

```python solution
colors = ["red", "green", "blue"]
```

## Hints

1. Which kind of brackets make a list?
2. How are the items separated, and what does each string need around it?
3. Put the three quoted strings inside square brackets, with commas between them.

## Explanation

Square brackets make a list and commas separate its items. The order you write them is the order they're stored in.

# Exercise: First, last, count {#e2}

For `scores = [72, 85, 90, 64, 88]`, create `first` (the first score), `last` (the last score) and `count` (how many scores there are).

```python starter
scores = [72, 85, 90, 64, 88]

# Create first, last and count
```

```python solution
scores = [72, 85, 90, 64, 88]

first = scores[0]
last = scores[-1]
count = len(scores)
```

## Hints

1. The same ideas apply as for strings: positions and length.
2. Is there a way to refer to the last item without knowing how long the list is?
3. Index 0 is the first item, index -1 the last, and a built-in function counts the items.

## Explanation

`scores[0]` and `scores[-1]` read the ends, and `len(scores)` counts the items. These work for a list of any size.

# Exercise: Edit the fruit {#e3}

`fruits` starts as `["apple", "banana", "cherry"]`. Change the **second** item to `"blueberry"` and add `"date"` to the end, so `fruits` becomes `["apple", "blueberry", "cherry", "date"]`.

```python starter
fruits = ["apple", "banana", "cherry"]

# Edit the list
```

```python solution
fruits = ["apple", "banana", "cherry"]

fruits[1] = "blueberry"
fruits.append("date")
```

## Hints

1. Two changes: one replaces an item, one adds an item.
2. Which index is the *second* item?
3. Assign to `fruits[1]` for the replacement and use the method that adds to the end for the new fruit.

## Explanation

`fruits[1] = ...` overwrites position 1, the second item (indexes start at 0). `append` adds at the end and modifies the list in place.

# Exercise: The last item {#e4}

Define `last_item(items)` that returns the last item of a list, or `None` if the list is empty.

```python starter
# Define last_item(items)
```

```python solution
def last_item(items):
    if len(items) == 0:
        return None
    return items[-1]
```

## Hints

1. What happens if you ask an empty list for its last item?
2. How can you check for emptiness before indexing?
3. If the length is zero, return `None`; otherwise return the item at index -1.

## Explanation

`[][-1]` raises an `IndexError`, so the empty case must be handled first. `return None` makes the "nothing here" answer explicit.

# Quiz

## What is `[10, 20, 30][1]`?

- [ ] 10
- [x] 20
- [ ] 30

Explanation: Index 0 is the first item, so index 1 is the second: 20.

## What does `items = items.append(5)` leave in `items`?

- [ ] The list with 5 added
- [x] `None`
- [ ] An error is raised

Explanation: `append` changes the list in place and returns `None`. Assigning that result throws your list away.

## What does `len([[1, 2], [3]])` return?

- [ ] 3
- [x] 2
- [ ] 1

Explanation: The outer list contains two items, and each of those is itself a list.
