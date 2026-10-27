---
id: dict-basics
module: ds-dicts
title: Dictionaries
minutes: 14
goal: Create dictionaries, look up, add, change and delete entries, and look things up safely with get().
summary: Store values under names (keys) and find them instantly.
---

# Concept

A **dictionary** (`dict`) stores **key → value** pairs. You look things up by key instead of by position, like a real dictionary:

```python run
person = {"name": "Ada", "age": 36, "city": "London"}
print(person["name"])
print(person["age"])
print(len(person))
```

The format: `{key: value, key: value}`. Keys are usually strings or numbers. Values can be anything, including lists and other dicts.

### Adding, changing, deleting

Assigning to a key either **adds** it (if new) or **replaces** it (if it exists):

```python run
person = {"name": "Ada", "age": 36}
person["city"] = "London"   # add
person["age"] = 37          # change
del person["name"]          # delete
print(person)
```

### Asking: in and get

`in` tests the **keys**:

```python run
person = {"name": "Ada", "age": 36}
print("name" in person)
print("email" in person)
```

Looking up a key that isn't there raises a `KeyError`:

```python run
person = {"name": "Ada"}
print(person["email"])
```

When a key might be missing, use `.get()`. It returns `None` (or a default you choose) instead of failing:

```python run
person = {"name": "Ada"}
print(person.get("email"))
print(person.get("email", "no email"))
print(person.get("name", "unknown"))
```

> **Careful:** a `KeyError` is Python telling you "this key doesn't exist". The first suspect is a typo or a different spelling/case (`"Name"` vs `"name"`), and the second is that you never added the key. Pythia will often ask you which keys the dictionary really contains.

### Rules for keys

- Keys are **unique**: assigning to an existing key overwrites it.
- Keys must be **unchangeable**: strings, numbers and tuples work; lists don't.
- Values can repeat, and be any type.

```python run
scores = {"Ada": 90, "Grace": 95}
scores["Ada"] = 91
print(scores)
```

# Example: A tiny phone book

```python example
phone = {"Ada": "555-0101", "Grace": "555-0102"}

phone["Linus"] = "555-0103"
phone["Ada"] = "555-9999"
del phone["Grace"]

print(phone)
print("Ada's number:", phone["Ada"])
print("Grace's number:", phone.get("Grace", "not found"))
print("Contacts:", len(phone))
```

Each line changes or reads one entry. Notice `get` turning the missing `"Grace"` into a message instead of an error.

# Exercise: Build a record {#e1}

Create a dictionary called `person` with the keys `"name"` (value `"Ada"`) and `"age"` (value `36`).

```python starter
# Create person
```

```python solution
person = {"name": "Ada", "age": 36}
```

## Hints

1. Which brackets make a dictionary?
2. Each entry has two parts joined by a colon. Which part comes first?
3. `{key: value, key: value}`: the keys are the strings `"name"` and `"age"`.

## Explanation

Curly braces with `key: value` pairs make a dict. Both keys are strings, and the values are a string and an integer.

# Exercise: Update the record {#e2}

`person = {"name": "Ada", "age": 36}`. Change `age` to `37`, add the key `"city"` with the value `"London"`, and delete the `"name"` entry.

```python starter
person = {"name": "Ada", "age": 36}

# Edit the dictionary
```

```python solution
person = {"name": "Ada", "age": 36}

person["age"] = 37
person["city"] = "London"
del person["name"]
```

## Hints

1. Three edits: one changes a value, one adds an entry, one removes an entry.
2. Assigning to a key works for both changing and adding. Which statement removes?
3. Use `person[key] = value` twice and `del person[key]` once.

## Explanation

Assignment adds or overwrites; `del` removes. The final dict is `{"age": 37, "city": "London"}`.

# Exercise: Safe price lookup {#e3}

Define `price_of(menu, item)` that returns the price of `item` in the dictionary `menu`, or `0` if the item isn't on the menu.

```python starter
# Define price_of(menu, item)
```

```python solution
def price_of(menu, item):
    return menu.get(item, 0)
```

## Hints

1. What happens if you index the dictionary with a missing key?
2. A dictionary method can look up a key with a fallback. What is it called?
3. Call that method with the item and `0` as the default, and return the result.

## Explanation

`menu.get(item, 0)` returns the stored price when the key exists, and `0` otherwise, with no `KeyError`.

# Exercise: Swap keys and values {#e4}

Define `invert(d)` that returns a new dictionary with the keys and values swapped. You may assume the values are unique: `invert({"a": 1, "b": 2})` returns `{1: "a", 2: "b"}`.

```python starter
# Define invert(d)
```

```python solution
def invert(d):
    result = {}
    for key in d:
        result[d[key]] = key
    return result
```

## Hints

1. You're building a new dict, so where does it start?
2. Looping over a dict gives you its keys. What do you store for each?
3. Start with an empty dict; for each key, assign `key` under the key `d[key]`.

## Explanation

For each key in `d` we store the old key under the old value. Because the old values become keys, they must be unique and unchangeable for this to work.

# Quiz

## What happens with `d = {"a": 1}; d["b"]`?

- [ ] It returns `None`
- [x] A `KeyError`
- [ ] It adds `"b"`

Explanation: Reading a missing key is an error. Writing to a missing key (`d["b"] = 2`) is how you add it. Use `d.get("b")` for a safe read.

## What does `"x" in {"x": 5}` check?

- [x] Whether `"x"` is a key
- [ ] Whether `"x"` is a value
- [ ] Whether `5` is a key

Explanation: `in` looks at dictionary keys, which is also what makes it fast.

## Which of these can **not** be a dictionary key?

- [ ] `"name"`
- [ ] `(1, 2)`
- [x] `[1, 2]`

Explanation: Keys must be immutable. Lists can change, so Python refuses them as keys. A tuple of the same items is fine.
