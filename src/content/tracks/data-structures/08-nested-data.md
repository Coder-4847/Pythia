---
id: nested-data
module: ds-dicts
title: Nested data
minutes: 14
goal: Read and process lists of dictionaries and dictionaries of lists.
summary: Real data is rarely flat. Learn to navigate lists inside dictionaries and dictionaries inside lists.
---

# Concept

Real-world data is layered: a list of people, each with a name, an age and a list of hobbies. Python handles this by **nesting** containers inside each other.

### A list of dictionaries

This shape is everywhere: each dict is one record, the list holds the records.

```python run
people = [
    {"name": "Ada", "age": 36},
    {"name": "Grace", "age": 85},
    {"name": "Linus", "age": 54},
]
print(people[0])
print(people[1]["name"])
for person in people:
    print(person["name"], "is", person["age"])
```

Read `people[1]["name"]` left to right: *item 1 of the list* → *the `"name"` entry of that dict*.

### A dictionary of lists

Great for "one key, many things":

```python run
courses = {
    "math": ["Ada", "Grace"],
    "art": ["Linus"],
}
print(courses["math"])
print(len(courses["math"]))
courses["art"].append("Margaret")
print(courses)
```

### Navigate step by step

When a lookup looks scary, break it up. Each step gives you a simpler value:

```python run
data = {"team": {"lead": {"name": "Ada", "skills": ["math", "code"]}}}

team = data["team"]
lead = team["lead"]
print(lead["name"])
print(lead["skills"][1])
print(data["team"]["lead"]["skills"][0])
```

> **Careful:** when a nested lookup fails, find *which step* raised the error. A `KeyError` means a dict was missing the key; an `IndexError` means a list was too short; a `TypeError: 'NoneType' ...` often means an earlier step returned `None`. Pythia asks you to print the intermediate value.

### Processing records

Loops and the patterns from the last lessons work on every layer:

```python run
people = [{"name": "Ada", "age": 36}, {"name": "Grace", "age": 85}]

names = []
for p in people:
    names.append(p["name"])
print(names)

total_age = 0
for p in people:
    total_age += p["age"]
print(total_age / len(people))
```

### Copying nested data

`copy()` only copies the **outer** container. The inner lists and dicts are still shared. For a fully independent copy use `copy.deepcopy`:

```python run
import copy

a = [[1, 2], [3]]
b = copy.deepcopy(a)
b[0].append(99)
print(a, b)
```

# Example: A tiny gradebook

```python example
students = [
    {"name": "Ada", "grades": [90, 85, 100]},
    {"name": "Grace", "grades": [70, 95]},
]

for s in students:
    average = sum(s["grades"]) / len(s["grades"])
    print(f"{s['name']}: {average:.1f}")

students[1]["grades"].append(100)
print(students[1])
```

Each student is a dict, and each dict contains a list. `s['name']` uses single quotes inside the double-quoted f-string, which avoids clashing quotes.

# Exercise: List the names {#e1}

Define `names(people)` that takes a list of dictionaries (each with a `"name"` key) and returns a list of just the names.

```python starter
# Define names(people)
```

```python solution
def names(people):
    result = []
    for person in people:
        result.append(person["name"])
    return result
```

## Hints

1. You need one value from each record, collected into a new list.
2. What does each `person` in the loop look like, and how do you read one entry from it?
3. Start with an empty list, and append `person["name"]` for every person.

## Explanation

Each loop round gives one dict. Indexing it with `"name"` extracts that person's name, and `append` collects them in order.

# Exercise: Average age {#e2}

Define `average_age(people)` that returns the mean of the `"age"` values in a list of dictionaries. Return `0` for an empty list.

```python starter
# Define average_age(people)
```

```python solution
def average_age(people):
    if len(people) == 0:
        return 0
    total = 0
    for person in people:
        total += person["age"]
    return total / len(people)
```

## Hints

1. The mean needs a sum and a count. Which do you get from a loop, and which from a function?
2. What would dividing by `len(people)` do for an empty list?
3. Return 0 first if the list is empty; otherwise add all the ages in a loop and divide by the number of people.

## Explanation

The empty list is checked first so we never divide by zero. For other lists, the loop sums the ages and the division gives the mean.

# Exercise: Who's in the course? {#e3}

Define `students_in(courses, course)` where `courses` is a dictionary of lists like `{"math": ["Ada"], "art": []}`. Return the list for `course`, or an empty list if the course doesn't exist.

```python starter
# Define students_in(courses, course)
```

```python solution
def students_in(courses, course):
    return courses.get(course, [])
```

## Hints

1. A missing key should not crash your function. What dictionary method avoids that?
2. What should the fallback be, given that the function returns a list?
3. Look the course up with a default of an empty list.

## Explanation

`courses.get(course, [])` returns the stored list if there is one, and a fresh empty list otherwise.

# Exercise: The oldest person {#e4}

Define `oldest(people)` that returns the **whole dictionary** of the person with the greatest `"age"` in a non-empty list.

```python starter
# Define oldest(people)
```

```python solution
def oldest(people):
    best = people[0]
    for person in people:
        if person["age"] > best["age"]:
            best = person
    return best
```

## Hints

1. This is a "find the best" pattern. What is the first candidate?
2. What do you compare, and what do you remember when you find something better?
3. Start with the first person; replace it with any person whose age is greater; return the dict at the end.

## Explanation

Starting from `people[0]` and replacing the best-so-far whenever a larger age appears finds the maximum. The function returns the entire record, not just the age.

# Quiz

## Given `data = {"a": [10, 20, 30]}`, what is `data["a"][1]`?

- [ ] 10
- [x] 20
- [ ] `[20]`

Explanation: `data["a"]` is the list; index 1 of that list is the second item, 20.

## What is the effect of `b = a.copy()` for `a = [[1], [2]]` and then `b[0].append(9)`?

- [ ] `a` is unchanged
- [x] `a` also shows the 9
- [ ] An error

Explanation: `copy()` is shallow: the outer list is new, but the inner lists are shared. Use `copy.deepcopy` for a full copy.

## Which expression reads the second skill of the first person in `people`, where each person has a `"skills"` list?

- [ ] `people["skills"][1][0]`
- [x] `people[0]["skills"][1]`
- [ ] `people[1]["skills"][0]`

Explanation: First the list index 0 (first person), then the dict key `"skills"`, then the list index 1 (second skill).
