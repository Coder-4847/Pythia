---
id: classes-intro
module: int-objects
title: Classes and objects
minutes: 16
goal: Define a class with attributes and methods, and create objects from it.
summary: Bundle data and the functions that use it into one tidy thing.
---

# Concept

A **dictionary** can hold the facts about one thing:

```python run
dog = {"name": "Rex", "tricks": 2}
print(dog["name"], "knows", dog["tricks"], "tricks")
```

But the *functions* that work on dogs live somewhere else, and nothing stops you building a dog with a typo in a key. A **class** bundles the data and the behaviour together. It's a blueprint; each **object** (or *instance*) built from it is one actual dog.

```python run
class Dog:
    def __init__(self, name):
        self.name = name
        self.tricks = 0

    def learn(self):
        self.tricks += 1

    def describe(self):
        return f"{self.name} knows {self.tricks} tricks"

rex = Dog("Rex")
rex.learn()
rex.learn()
print(rex.describe())

fido = Dog("Fido")
print(fido.describe())
```

```diagram
{"type":"flow","caption":"One class, many objects","steps":[{"label":"class Dog","detail":"the blueprint: what every dog has and does"},{"label":"Dog(\"Rex\")","detail":"builds a new object and runs __init__"},{"label":"rex.learn()","detail":"calls a method on that one object"}]}
```

### The pieces

- **`class Dog:`** defines the blueprint.
- **`__init__`** is the *constructor*. It runs automatically when you write `Dog("Rex")` and sets up the new object.
- **`self`** is the object the method is working on. Python passes it for you: you write `rex.learn()`, Python runs `learn(rex)`.
- **Attributes** like `self.name` are the data stored *on* the object. Each object has its own.
- **Methods** are functions defined inside the class.

> **Careful:** forgetting `self.` is the classic mistake. Inside a method, `name` is a plain local variable that disappears when the method ends; `self.name` is the attribute that stays on the object. And every method needs `self` as its first parameter.

### Making objects print nicely

Printing an object shows something like `<__main__.Dog object at 0x...>`. Define `__str__` to control it:

```python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

print(Point(3, 4))
```

# Example: A bank account

```python example
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

    def __str__(self):
        return f"{self.owner}: {self.balance}"

acct = Account("Ada", 100)
acct.deposit(50)
acct.withdraw(30)
print(acct)
```

The methods change the object's own `balance`, and the rule "you can't withdraw more than you have" lives in one place instead of being repeated everywhere an account is used.

# Exercise: A rectangle {#e1}

Define a class `Rectangle` whose constructor takes `width` and `height` and stores them as attributes, with a method `area()` that returns the area.

```python starter
# Define class Rectangle
```

```python solution
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height
```

## Hints

1. What does each rectangle need to remember?
2. Where do those values get stored when the object is created?
3. Set `self.width` and `self.height` in `__init__`, and use them in `area`.

## Explanation

`__init__` saves the two numbers on the object. `area` reads them back through `self`, so each rectangle computes its own area.

# Exercise: A counter {#e2}

Define a class `Counter` that starts at `0`. It needs a method `increment()` that adds 1, a method `reset()` that sets it back to 0, and an attribute `value` holding the current count.

```python starter
# Define class Counter
```

```python solution
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def reset(self):
        self.value = 0
```

## Hints

1. Where should the count live, so it survives between method calls?
2. Which attribute holds it?
3. Start `self.value` at 0 in `__init__`; `increment` adds one to it; `reset` sets it to zero.

## Explanation

The count is stored on the object, not in a local variable, so each call to `increment` builds on the last. Two counters have independent values.

# Exercise: A printable point {#e3}

Define a class `Point` with attributes `x` and `y`, and a `__str__` method so that `str(Point(3, 4))` is `"(3, 4)"`. Also add a method `distance_from_origin()` that returns the straight-line distance `(x**2 + y**2) ** 0.5`.

```python starter
# Define class Point
```

```python solution
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def distance_from_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
```

## Hints

1. Two special things to add beyond the attributes: how it prints, and a measurement.
2. What must `__str__` return: print something, or hand back text?
3. `__str__` should `return` an f-string with both coordinates; the distance uses `self.x` and `self.y`.

## Explanation

`__str__` is called by `print` and `str()`, and must **return** the text. `distance_from_origin` is an ordinary method that reads the object's own attributes.

# Exercise: A shopping cart {#e4}

Define a class `Cart`. It starts empty. `add(name, price)` stores an item, `total()` returns the sum of all prices (0 for an empty cart), and `count()` returns how many items were added.

```python starter
# Define class Cart
```

```python solution
class Cart:
    def __init__(self):
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for _, price in self.items)

    def count(self):
        return len(self.items)
```

## Hints

1. What single piece of data lets all three methods answer their questions?
2. Which built-in container keeps things in the order added?
3. Keep a list on the object, created in `__init__` (not shared!), and append a pair for each item.

## Explanation

All the methods work from one list stored on the object. Creating it in `__init__` gives every cart its **own** list; putting `[]` at class level would share one list between all carts.

# Quiz

## What is `self` inside a method?

- [ ] The name of the class
- [x] The object the method was called on
- [ ] A keyword that makes the method private

Explanation: `rex.learn()` is run as `Dog.learn(rex)`, so `self` is `rex`.

## What is the difference between `name` and `self.name` inside a method?

- [ ] None
- [x] `name` is a local variable that vanishes; `self.name` is stored on the object
- [ ] `self.name` is a constant

Explanation: Only attributes set on `self` outlive the method call.

## When does `__init__` run?

- [ ] When you call `print` on the object
- [x] Automatically, when you create an object with `ClassName(...)`
- [ ] When the program ends

Explanation: It's the constructor: it sets up a freshly created object.
