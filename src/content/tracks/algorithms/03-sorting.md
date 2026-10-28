---
id: sorting-algorithms
module: alg-sorting
title: Sorting by hand
minutes: 20
goal: Implement selection sort and insertion sort, and merge two sorted lists.
summary: Python's sorted() is one line; knowing how it could work is a way of thinking.
---

# Concept

`sorted(numbers)` puts a list in order, and in real programs you should always use it. But writing a sort yourself teaches you how to think about **loops that make steady progress**, which shows up everywhere.

### Selection sort

*Find the smallest item, move it to the front. Then find the smallest of what's left, and so on.*

```python run
def selection_sort(items):
    items = list(items)                    # work on a copy
    for i in range(len(items)):
        smallest = i
        for j in range(i + 1, len(items)):
            if items[j] < items[smallest]:
                smallest = j
        items[i], items[smallest] = items[smallest], items[i]
    return items

print(selection_sort([5, 2, 9, 1, 5, 6]))
```

After step `i`, the first `i + 1` positions hold the smallest items in order. The swap `a, b = b, a` exchanges two values without a temporary variable.

### Insertion sort

*Keep the front part sorted. Take the next item and slide it left until it fits.* It's how most people sort playing cards.

```python run
def insertion_sort(items):
    items = list(items)
    for i in range(1, len(items)):
        value = items[i]
        j = i - 1
        while j >= 0 and items[j] > value:
            items[j + 1] = items[j]        # shift bigger items right
            j -= 1
        items[j + 1] = value
    return items

print(insertion_sort([5, 2, 9, 1, 5, 6]))
```

```diagram
{"type":"flow","caption":"Insertion sort, one step","steps":[{"label":"[2, 5, 9] | 1","detail":"front is sorted; next value is 1"},{"label":"shift 9, 5, 2 right","detail":"each is bigger than 1"},{"label":"[1, 2, 5, 9]","detail":"drop 1 into the gap"}]}
```

### Merging

Two **already sorted** lists can be combined into one sorted list cheaply: repeatedly take the smaller of the two front items. This is the heart of *merge sort*, which splits a list in half, sorts each half and merges them.

```python run
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    return result + a[i:] + b[j:]

print(merge([1, 4, 9], [2, 3, 10, 11]))
```

> **Careful:** both selection and insertion sort are *quadratic*: doubling the list roughly quadruples the work. Fine for hundreds of items, painful for millions. That's why Python's own sort (and merge sort) use smarter strategies. Also, remember `list.sort()` changes a list in place and returns `None`; `sorted()` returns a new list.

# Example: Is it sorted?

```python example
def is_sorted(items):
    for i in range(len(items) - 1):
        if items[i] > items[i + 1]:
            return False
    return True

print(is_sorted([1, 2, 2, 7]))
print(is_sorted([3, 1, 2]))
print(is_sorted([]))
```

A list is sorted if **no neighbouring pair is out of order**. Notice that an empty list and a one-item list are sorted: there's no pair to be wrong.

# Exercise: Selection sort {#e1}

Define `selection_sort(items)` that returns a new sorted list using the selection-sort idea. Don't use `sorted()` or `.sort()`, and don't change the original list.

```python starter
# Define selection_sort(items)
```

```python solution
def selection_sort(items):
    items = list(items)
    for i in range(len(items)):
        smallest = i
        for j in range(i + 1, len(items)):
            if items[j] < items[smallest]:
                smallest = j
        items[i], items[smallest] = items[smallest], items[i]
    return items
```

## Hints

1. At each position, which value *should* go there?
2. How do you find the smallest item in the part you haven't placed yet?
3. An outer loop over positions, an inner loop to find the index of the smallest remaining item, then swap it into place.

## Explanation

After each outer pass, one more item is in its final position. Copying with `list(items)` leaves the caller's list untouched.

# Exercise: Insertion sort {#e2}

Define `insertion_sort(items)` returning a new sorted list by sliding each item left into place. No `sorted()` or `.sort()`.

```python starter
# Define insertion_sort(items)
```

```python solution
def insertion_sort(items):
    items = list(items)
    for i in range(1, len(items)):
        value = items[i]
        j = i - 1
        while j >= 0 and items[j] > value:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = value
    return items
```

## Hints

1. Think of the front of the list as already in order.
2. How far left should the new item travel?
3. Remember the item, shift larger items one place right while they are bigger, then put it in the gap.

## Explanation

Each item moves only as far as needed, so nearly-sorted input is handled very quickly. That's one reason insertion sort is used for small or almost-sorted lists inside real sorting code.

# Exercise: Merge two sorted lists {#e3}

Define `merge(a, b)` that takes two sorted lists and returns one sorted list containing all their items. Do it by walking both lists, not by sorting the combination.

```python starter
# Define merge(a, b)
```

```python solution
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    return result + a[i:] + b[j:]
```

## Hints

1. You only ever need to compare the two *front* items.
2. How do you remember where you are in each list?
3. Keep an index for each list; append the smaller front item and advance that index. When one list runs out, add the rest of the other.

## Explanation

Because each input is sorted, the smaller front item is the smallest of everything left. One of the lists empties first, and whatever remains of the other is already in order.

# Exercise: Is it sorted? {#e4}

Define `is_sorted(items)` that returns `True` if the list is in non-decreasing order, and `False` otherwise, without sorting it. Empty and one-item lists are sorted.

```python starter
# Define is_sorted(items)
```

```python solution
def is_sorted(items):
    for i in range(len(items) - 1):
        if items[i] > items[i + 1]:
            return False
    return True
```

## Hints

1. Which pairs of items does the answer depend on?
2. What would show immediately that the list is *not* sorted?
3. Compare each item with the next; return `False` as soon as one pair is out of order, and `True` only after checking all pairs.

## Explanation

The early `return False` ends the function on the first violation; reaching the end means every neighbouring pair was fine. With fewer than two items the loop never runs, so the answer is `True`.

# Quiz

## What does selection sort do on each pass?

- [ ] Swaps neighbouring items until nothing changes
- [x] Finds the smallest remaining item and puts it in its place
- [ ] Splits the list in half

Explanation: After pass `i`, positions `0..i` hold the smallest items in order.

## Merging two lists works only if...

- [ ] They have the same length
- [x] Each list is already sorted
- [ ] They contain no duplicates

Explanation: Taking the smaller front item is only correct when each front item is the smallest of its list.

## What does `my_list.sort()` return?

- [ ] The sorted list
- [x] `None`, because it sorts the list in place
- [ ] A new list

Explanation: Use `sorted(my_list)` when you want a new sorted list back.
