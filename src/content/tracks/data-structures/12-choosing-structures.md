---
id: choosing-structures
module: ds-comprehensions
title: Choosing the right container
minutes: 15
goal: Pick between list, tuple, dict and set for a job, and combine them to solve small data problems.
summary: A guided tour of when to reach for which container, with problems that use several at once.
---

# Concept

You now know four containers. The skill is **choosing** between them. Ask three questions about your data:

1. **Does order matter?** (or position, like "the third one")
2. **Do I need to change it?**
3. **How will I look things up?** By position, by a name, or just "is it in there?"

| Need | Use | Why |
|---|---|---|
| An ordered sequence I'll change | **list** | index, append, sort, slice |
| A fixed record or a pair/triple that belongs together | **tuple** | can't change by accident; can be a dict key |
| Look things up by a name / label | **dict** | fast access by key |
| Unique items, "is it in there?", overlap | **set** | no duplicates, very fast `in`, set operations |

### The same task, two ways

*"Have we seen this word before?"* With a list, every `in` check scans the whole list. With a set it's instant:

```python run
words = ["a", "b", "a", "c", "b"]
seen = set()
for w in words:
    if w in seen:
        print(w, "repeated")
    seen.add(w)
```

*"What's the price of tea?"* A list of pairs forces a search; a dict answers directly:

```python run
prices_list = [("tea", 3), ("cake", 5)]
prices_dict = {"tea": 3, "cake": 5}
print(prices_dict["tea"])
```

### Combining containers

Real problems mix them. A dict of sets, a list of tuples, a dict of lists:

```python run
friends = {"Ada": {"Grace", "Linus"}, "Grace": {"Ada"}, "Linus": {"Ada", "Grace"}}
print(sorted(friends["Ada"] & friends["Linus"]))   # friends in common
```

```python run
points = [(0, 0), (3, 4), (6, 8)]
distances = {p: (p[0] ** 2 + p[1] ** 2) ** 0.5 for p in points}
print(distances)
```

Tuples are the keys there, because lists couldn't be.

> **Careful:** the most common mismatch is using a **list for lookup** (searching a long list again and again) when a dict or set would answer in one step, and the second is putting **mutable data where a key is needed** (`TypeError: unhashable type: 'list'`). When code feels slow or awkward, ask: "is this the right container for the question I keep asking?"

### A quick checklist

- Position matters → list (or tuple if fixed).
- Named parts of one thing → dict (or a tuple for tiny records).
- Counting or grouping → dict.
- Membership / duplicates / overlap → set.

# Example: Anagram groups

```python example
words = ["listen", "silent", "enlist", "google", "gogole", "cat", "act"]

groups = {}
for word in words:
    key = "".join(sorted(word))      # same letters → same key
    groups.setdefault(key, []).append(word)

for key, group in groups.items():
    print(key, group)
```

A dict of lists, keyed by the sorted letters of each word. `setdefault(key, [])` creates the empty list the first time a key appears. Words that are anagrams of each other land in the same group.

# Exercise: First repeat {#e1}

Define `first_repeat(items)` that returns the first item that has **already appeared earlier** in the list, or `None` if there are no repeats: `first_repeat([3, 1, 4, 1, 5, 3])` returns `1`.

```python starter
# Define first_repeat(items)
```

```python solution
def first_repeat(items):
    seen = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    return None
```

## Hints

1. As you walk through the list, what do you need to remember?
2. Which container answers "have I seen this?" fastest?
3. Keep a set of seen items; return an item as soon as it's already in the set, otherwise add it.

## Explanation

The set remembers everything seen so far. The first item found in the set is the first one to repeat (not the first duplicated value overall): in the example, `1` repeats at index 3 before `3` repeats at index 5.

# Exercise: Word frequencies {#e2}

Define `word_counts(text)` that returns a dictionary of how many times each word appears in `text`, ignoring capital letters: `word_counts("the cat The hat")` returns `{"the": 2, "cat": 1, "hat": 1}`.

```python starter
# Define word_counts(text)
```

```python solution
def word_counts(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts
```

## Hints

1. Which container is the right one for counting things by name?
2. What do you do to the text before splitting it, so that "The" and "the" match?
3. Lower-case the text, split it into words, and count each with `get(word, 0) + 1`.

## Explanation

`text.lower().split()` produces the words in one normalised case. The dictionary then counts each, as in the letter-counting exercise.

# Exercise: Top scorers {#e3}

Define `top_n(scores, n)` where `scores` is a dictionary of `name -> score`. Return a list of the names of the `n` highest scorers, **best first**. Scores are all different.

```python starter
# Define top_n(scores, n)
```

```python solution
def top_n(scores, n):
    ranked = sorted(scores, key=scores.get, reverse=True)
    return ranked[:n]
```

## Hints

1. You need the names in order of score. What can sort the keys, and what should it compare?
2. After sorting, how do you keep only the first few?
3. Sort the dictionary's keys by their values, descending; then take a slice of the first `n`.

## Explanation

`sorted(scores, key=scores.get, reverse=True)` sorts the names by their scores, highest first. Slicing `[:n]` keeps the top `n`; if `n` is larger than the number of names, you just get them all.

# Exercise: Shared interests {#e4}

Define `shared(interests, a, b)` where `interests` is a dictionary mapping a person to a **set** of interests. Return a **sorted list** of the interests that persons `a` and `b` have in common.

```python starter
# Define shared(interests, a, b)
```

```python solution
def shared(interests, a, b):
    return sorted(interests[a] & interests[b])
```

## Hints

1. What kind of values does the dictionary hold, and which operation finds overlap between two of them?
2. How do you get a person's interests out of the dictionary?
3. Look up both people, intersect their sets, and sort the result into a list.

## Explanation

Each lookup returns a set; `&` gives the intersection, and `sorted` converts it to a predictable list. Choosing sets for the values is exactly what makes this one line.

# Quiz

## You need to check "have I seen this?" a million times. Which is best?

- [ ] A list
- [x] A set
- [ ] A tuple

Explanation: `in` on a set takes (roughly) the same time however big it is. On a list it scans every item.

## Which can be a dictionary key?

- [ ] `[1, 2]`
- [x] `(1, 2)`
- [ ] `{1, 2}`

Explanation: Keys must be unchangeable. A tuple of numbers qualifies; lists and sets can change, so they don't.

## You want to store a person's name, age and city together as a fixed record. What fits well?

- [ ] A set
- [x] A tuple (or a dict if you want named fields)
- [ ] A list of their letters

Explanation: A fixed group of related values suits a tuple; if you want to refer to the parts by name, a dictionary is clearer.
