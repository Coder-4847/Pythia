import{c as e,l as t,t as n,u as r}from"./schemas-DuWPd2Ii.js";import{t as i}from"./tracks-vPQWD_Am.js";function a(e){return r(n,e)}var o=`---
id: recursion
module: alg-recursion
title: Thinking recursively
minutes: 18
goal: Write recursive functions with a clear base case and a smaller problem.
summary: Solve a problem by solving a smaller copy of the same problem.
---

# Concept

A **recursive** function is one that calls itself. That sounds like it could never end, and it would not, without two ingredients:

1. A **base case**: an input so small the answer is obvious, so no further call is needed.
2. A **recursive case**: break the input into a *smaller* piece, ask the same function about that piece, and combine the answer.

\`\`\`python run
def countdown(n):
    if n == 0:                # base case
        print("liftoff!")
        return
    print(n)
    countdown(n - 1)          # smaller problem

countdown(3)
\`\`\`

The classic example is the factorial: \`5! = 5 × 4 × 3 × 2 × 1\`. Notice that \`5! = 5 × 4!\`: the answer is built from the answer to a smaller version of the same question.

\`\`\`python run
def factorial(n):
    if n <= 1:                # base case
        return 1
    return n * factorial(n - 1)

print(factorial(5))
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"factorial(3), unwinding","steps":[{"label":"factorial(3)","detail":"3 * factorial(2)  ... waits"},{"label":"factorial(2)","detail":"2 * factorial(1)  ... waits"},{"label":"factorial(1)","detail":"base case: returns 1"},{"label":"unwind","detail":"2 * 1 = 2, then 3 * 2 = 6"}]}
\`\`\`

Each call waits for the one below it, then the answers flow back up. Python keeps those waiting calls on the **call stack**.

### Lists are recursive too

A list is either empty, or its first item plus a smaller list:

\`\`\`python run
def total(numbers):
    if not numbers:                       # base case: empty list
        return 0
    return numbers[0] + total(numbers[1:])

print(total([4, 8, 15]))
\`\`\`

### The rules of thumb

- Always write the **base case first**.
- Every recursive call must move **toward** the base case (\`n - 1\`, a shorter list...).
- If it never gets there, Python eventually stops you with a \`RecursionError\`.

> **Careful:** forgetting the base case, or recursing on something that doesn't get smaller, gives \`RecursionError: maximum recursion depth exceeded\`. That's Python protecting you from an endless loop of waiting calls.

# Example: Digits and powers

\`\`\`python example
def digit_sum(n):
    if n < 10:
        return n
    return n % 10 + digit_sum(n // 10)

def power(base, exponent):
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)

print(digit_sum(2024))
print(power(2, 10))
\`\`\`

\`n % 10\` is the last digit, and \`n // 10\` is the number without it, which is smaller. When only one digit remains (\`n < 10\`), the answer is that digit.

# Exercise: Sum to n {#e1}

Define \`sum_to(n)\` that returns \`1 + 2 + … + n\` **recursively**, with \`sum_to(0)\` equal to \`0\`.

\`\`\`python starter
# Define sum_to(n)
\`\`\`

\`\`\`python solution
def sum_to(n):
    if n == 0:
        return 0
    return n + sum_to(n - 1)
\`\`\`

## Hints

1. What is the answer for the smallest input?
2. How does \`sum_to(n)\` relate to \`sum_to\` of something smaller?
3. Base case \`n == 0\` returns 0; otherwise return \`n\` plus the answer for \`n - 1\`.

## Explanation

\`1 + … + n\` is \`n\` plus \`1 + … + (n - 1)\`. The recursion bottoms out at 0.

# Exercise: Count down the digits {#e2}

Define \`count_digits(n)\` for a non-negative integer that returns how many digits it has, **recursively** (no \`str()\` or \`len()\`). \`count_digits(7)\` is \`1\`, \`count_digits(2024)\` is \`4\`, and \`count_digits(0)\` is \`1\`.

\`\`\`python starter
# Define count_digits(n)
\`\`\`

\`\`\`python solution
def count_digits(n):
    if n < 10:
        return 1
    return 1 + count_digits(n // 10)
\`\`\`

## Hints

1. When is a number so small you can answer right away?
2. How do you remove the last digit of a number?
3. A one-digit number has 1 digit; otherwise it's 1 more than the digits of \`n // 10\`.

## Explanation

Integer division by 10 drops the last digit, which makes the problem smaller each time. The single-digit case stops the recursion, and also covers 0.

# Exercise: Reverse a string {#e3}

Define \`reverse(text)\` that returns \`text\` reversed, **recursively**. Don't use slicing with a negative step or \`reversed()\`.

\`\`\`python starter
# Define reverse(text)
\`\`\`

\`\`\`python solution
def reverse(text):
    if text == "":
        return ""
    return reverse(text[1:]) + text[0]
\`\`\`

## Hints

1. What is the reverse of the empty string?
2. If you set aside the first character, what's left, and where does that character end up?
3. Reverse everything after the first character, then add the first character at the end.

## Explanation

\`"abc"\` reversed is \`"bc"\` reversed followed by \`"a"\`. Each call hands a shorter string to the next, until the empty string ends it.

# Exercise: Flatten {#e4}

Define \`flatten(items)\` that takes a list that may contain other lists (nested to any depth) and returns one flat list of the non-list items in order. \`flatten([1, [2, [3, 4]], 5])\` is \`[1, 2, 3, 4, 5]\`.

\`\`\`python starter
# Define flatten(items)
\`\`\`

\`\`\`python solution
def flatten(items):
    flat = []
    for item in items:
        if isinstance(item, list):
            flat.extend(flatten(item))
        else:
            flat.append(item)
    return flat
\`\`\`

## Hints

1. Each item is either a plain value or another list you must look inside.
2. How can you tell the two apart, and which case needs the function to call itself?
3. \`isinstance(item, list)\` detects a list; for those, flatten the inner list and add all its items.

## Explanation

The nesting depth is unknown, which is exactly where recursion shines: a nested list is just a smaller list-flattening problem, and a plain value is the base case.

# Quiz

## What are the two essential parts of a recursive function?

- [ ] A loop and a counter
- [x] A base case and a recursive case that makes the problem smaller
- [ ] A global variable and a return

Explanation: Without a base case the calls never stop; without a smaller problem they never reach it.

## What does \`RecursionError\` usually mean?

- [ ] Python ran out of memory for the list
- [x] The function keeps calling itself without reaching a base case
- [ ] You used \`return\` incorrectly

Explanation: Python limits the call stack's depth to stop an endless chain of calls.

## \`total([4, 8, 15])\` in the lesson works by computing...

- [ ] \`4 + 8 + 15\` in a loop
- [x] \`4 + total([8, 15])\`, and so on down to \`total([])\`
- [ ] \`total(4) + total(8) + total(15)\`

Explanation: Each call peels off the first item and asks about the shorter rest.
`,s=`---
id: binary-search
module: alg-search
title: Binary search
minutes: 18
goal: Find an item in a sorted list by repeatedly halving the search area.
summary: Look up a name in a million entries in about twenty steps.
---

# Concept

How do you find a word in a dictionary? You don't read from page one. You open it in the middle, see whether your word comes before or after, and throw away the half that can't contain it. Then repeat.

That is **binary search**, and it only works because the list is **sorted**.

\`\`\`python run
def linear_search(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1

print(linear_search([2, 5, 8, 12, 16, 23, 38], 23))
\`\`\`

\`linear_search\` checks items one by one: for a million items, up to a million checks. Binary search does it in about twenty.

\`\`\`python run
def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1          # target is in the right half
        else:
            high = middle - 1         # target is in the left half
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38], 23))
print(binary_search([2, 5, 8, 12, 16, 23, 38], 7))
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"Looking for 23 in [2, 5, 8, 12, 16, 23, 38]","steps":[{"label":"middle is 12","detail":"23 is bigger: keep the right half"},{"label":"middle is 23","detail":"found it"}]}
\`\`\`

### How it works

\`low\` and \`high\` mark the part of the list that could still contain the target. Each loop looks at the middle. A match ends the search; otherwise one half is discarded by moving \`low\` up or \`high\` down. When \`low\` passes \`high\` there is nothing left: the target isn't there.

Each step halves the area, so a list of \`n\` items needs about \`log₂(n)\` steps: 1,000 items need ~10, a million need ~20, a billion need ~30.

> **Careful:** the two classic bugs are \`low = middle\` (instead of \`middle + 1\`), which can loop forever, and a loop condition of \`low < high\`, which misses the last candidate. And never use binary search on an **unsorted** list: it will quietly return wrong answers.

# Example: Counting the steps

\`\`\`python example
def steps_to_find(items, target):
    low, high = 0, len(items) - 1
    steps = 0
    while low <= high:
        steps += 1
        middle = (low + high) // 2
        if items[middle] == target:
            return steps
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return steps

numbers = list(range(1, 1_000_001))
print(steps_to_find(numbers, 777_777))
print(steps_to_find(numbers, 1))
\`\`\`

A million sorted numbers, and the answer is found in around twenty steps.

# Exercise: Binary search {#e1}

Define \`binary_search(items, target)\` for a sorted list. Return the **index** of \`target\`, or \`-1\` if it isn't there.

\`\`\`python starter
# Define binary_search(items, target)
\`\`\`

\`\`\`python solution
def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return middle
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1
\`\`\`

## Hints

1. You need to track which part of the list is still possible.
2. After looking at the middle item, how do you decide which half to keep?
3. Use two indexes, \`low\` and \`high\`, loop while \`low <= high\`, and move one of them past the middle each time.

## Explanation

Each comparison discards half of what's left. The loop ends either by finding the target, or when the range becomes empty.

# Exercise: Does it exist? {#e2}

Define \`contains(items, target)\` for a sorted list that returns \`True\` or \`False\`, using binary search (not \`in\`).

\`\`\`python starter
# Define contains(items, target)
\`\`\`

\`\`\`python solution
def contains(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        middle = (low + high) // 2
        if items[middle] == target:
            return True
        if items[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return False
\`\`\`

## Hints

1. This is the same search with a different answer.
2. What do you return at the end if the range became empty?
3. Same loop as before, but return \`True\` on a match and \`False\` after the loop.

## Explanation

The search logic doesn't change; only what it reports does. Many real tasks are a small twist on the same idea.

# Exercise: The first one at least this big {#e3}

Define \`first_at_least(items, x)\` for a sorted list: return the **index of the first item that is \`>= x\`**, or \`len(items)\` if every item is smaller. \`first_at_least([1, 3, 3, 8], 3)\` is \`1\`, and \`first_at_least([1, 3], 10)\` is \`2\`.

\`\`\`python starter
# Define first_at_least(items, x)
\`\`\`

\`\`\`python solution
def first_at_least(items, x):
    low, high = 0, len(items)
    while low < high:
        middle = (low + high) // 2
        if items[middle] < x:
            low = middle + 1
        else:
            high = middle
    return low
\`\`\`

## Hints

1. You're not looking for an exact match, but for a boundary between "too small" and "big enough".
2. If the middle item is too small, what do you know about everything to its left?
3. Keep a range \`[low, high)\` that could contain the answer; too small moves \`low\` past the middle, otherwise \`high\` becomes the middle.

## Explanation

The answer is the position where the items stop being smaller than \`x\`. Keeping \`high\` as a candidate (never \`middle - 1\`) is what makes duplicates and "not found" come out right. This "lower bound" search is how Python's \`bisect_left\` works.

# Exercise: Guess the number {#e4}

A friend thinks of a number between \`low\` and \`high\` (inclusive). Define \`count_guesses(secret, low, high)\` that plays the *halving* strategy: guess the middle \`(low + high) // 2\`; if it's the secret, stop; if the guess is too small, search above it; otherwise below it. Return **how many guesses** it took.

\`\`\`python starter
# Define count_guesses(secret, low, high)
\`\`\`

\`\`\`python solution
def count_guesses(secret, low, high):
    guesses = 0
    while low <= high:
        guess = (low + high) // 2
        guesses += 1
        if guess == secret:
            return guesses
        if guess < secret:
            low = guess + 1
        else:
            high = guess - 1
    return guesses
\`\`\`

## Hints

1. You're running binary search, but counting instead of returning an index.
2. When should the counter go up?
3. Add one for every middle guess you make, and return the count on the guess that equals the secret.

## Explanation

Binary search needs at most about \`log₂(100) ≈ 7\` guesses for a number between 1 and 100, which is why "higher / lower" guessing games are so quick when you play them well.

# Quiz

## What must be true of a list before you can binary-search it?

- [ ] It has no duplicates
- [x] It is sorted
- [ ] It contains only numbers

Explanation: Discarding half the list is only valid if you know which half the target would be in.

## About how many steps does binary search need for 1,000,000 items?

- [ ] About 1,000,000
- [ ] About 1,000
- [x] About 20

Explanation: Each step halves the range, and 2²⁰ is a little over a million.

## What goes wrong if you write \`low = middle\` instead of \`low = middle + 1\`?

- [ ] Nothing, it's equivalent
- [x] The search range may stop shrinking, so the loop can run forever
- [ ] It returns the wrong type

Explanation: When \`middle\` equals \`low\`, nothing changes, so the loop repeats the same state.
`,c=`---
id: sorting-algorithms
module: alg-sorting
title: Sorting by hand
minutes: 20
goal: Implement selection sort and insertion sort, and merge two sorted lists.
summary: Python's sorted() is one line; knowing how it could work is a way of thinking.
---

# Concept

\`sorted(numbers)\` puts a list in order, and in real programs you should always use it. But writing a sort yourself teaches you how to think about **loops that make steady progress**, which shows up everywhere.

### Selection sort

*Find the smallest item, move it to the front. Then find the smallest of what's left, and so on.*

\`\`\`python run
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
\`\`\`

After step \`i\`, the first \`i + 1\` positions hold the smallest items in order. The swap \`a, b = b, a\` exchanges two values without a temporary variable.

### Insertion sort

*Keep the front part sorted. Take the next item and slide it left until it fits.* It's how most people sort playing cards.

\`\`\`python run
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
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"Insertion sort, one step","steps":[{"label":"[2, 5, 9] | 1","detail":"front is sorted; next value is 1"},{"label":"shift 9, 5, 2 right","detail":"each is bigger than 1"},{"label":"[1, 2, 5, 9]","detail":"drop 1 into the gap"}]}
\`\`\`

### Merging

Two **already sorted** lists can be combined into one sorted list cheaply: repeatedly take the smaller of the two front items. This is the heart of *merge sort*, which splits a list in half, sorts each half and merges them.

\`\`\`python run
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
\`\`\`

> **Careful:** both selection and insertion sort are *quadratic*: doubling the list roughly quadruples the work. Fine for hundreds of items, painful for millions. That's why Python's own sort (and merge sort) use smarter strategies. Also, remember \`list.sort()\` changes a list in place and returns \`None\`; \`sorted()\` returns a new list.

# Example: Is it sorted?

\`\`\`python example
def is_sorted(items):
    for i in range(len(items) - 1):
        if items[i] > items[i + 1]:
            return False
    return True

print(is_sorted([1, 2, 2, 7]))
print(is_sorted([3, 1, 2]))
print(is_sorted([]))
\`\`\`

A list is sorted if **no neighbouring pair is out of order**. Notice that an empty list and a one-item list are sorted: there's no pair to be wrong.

# Exercise: Selection sort {#e1}

Define \`selection_sort(items)\` that returns a new sorted list using the selection-sort idea. Don't use \`sorted()\` or \`.sort()\`, and don't change the original list.

\`\`\`python starter
# Define selection_sort(items)
\`\`\`

\`\`\`python solution
def selection_sort(items):
    items = list(items)
    for i in range(len(items)):
        smallest = i
        for j in range(i + 1, len(items)):
            if items[j] < items[smallest]:
                smallest = j
        items[i], items[smallest] = items[smallest], items[i]
    return items
\`\`\`

## Hints

1. At each position, which value *should* go there?
2. How do you find the smallest item in the part you haven't placed yet?
3. An outer loop over positions, an inner loop to find the index of the smallest remaining item, then swap it into place.

## Explanation

After each outer pass, one more item is in its final position. Copying with \`list(items)\` leaves the caller's list untouched.

# Exercise: Insertion sort {#e2}

Define \`insertion_sort(items)\` returning a new sorted list by sliding each item left into place. No \`sorted()\` or \`.sort()\`.

\`\`\`python starter
# Define insertion_sort(items)
\`\`\`

\`\`\`python solution
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
\`\`\`

## Hints

1. Think of the front of the list as already in order.
2. How far left should the new item travel?
3. Remember the item, shift larger items one place right while they are bigger, then put it in the gap.

## Explanation

Each item moves only as far as needed, so nearly-sorted input is handled very quickly. That's one reason insertion sort is used for small or almost-sorted lists inside real sorting code.

# Exercise: Merge two sorted lists {#e3}

Define \`merge(a, b)\` that takes two sorted lists and returns one sorted list containing all their items. Do it by walking both lists, not by sorting the combination.

\`\`\`python starter
# Define merge(a, b)
\`\`\`

\`\`\`python solution
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
\`\`\`

## Hints

1. You only ever need to compare the two *front* items.
2. How do you remember where you are in each list?
3. Keep an index for each list; append the smaller front item and advance that index. When one list runs out, add the rest of the other.

## Explanation

Because each input is sorted, the smaller front item is the smallest of everything left. One of the lists empties first, and whatever remains of the other is already in order.

# Exercise: Is it sorted? {#e4}

Define \`is_sorted(items)\` that returns \`True\` if the list is in non-decreasing order, and \`False\` otherwise, without sorting it. Empty and one-item lists are sorted.

\`\`\`python starter
# Define is_sorted(items)
\`\`\`

\`\`\`python solution
def is_sorted(items):
    for i in range(len(items) - 1):
        if items[i] > items[i + 1]:
            return False
    return True
\`\`\`

## Hints

1. Which pairs of items does the answer depend on?
2. What would show immediately that the list is *not* sorted?
3. Compare each item with the next; return \`False\` as soon as one pair is out of order, and \`True\` only after checking all pairs.

## Explanation

The early \`return False\` ends the function on the first violation; reaching the end means every neighbouring pair was fine. With fewer than two items the loop never runs, so the answer is \`True\`.

# Quiz

## What does selection sort do on each pass?

- [ ] Swaps neighbouring items until nothing changes
- [x] Finds the smallest remaining item and puts it in its place
- [ ] Splits the list in half

Explanation: After pass \`i\`, positions \`0..i\` hold the smallest items in order.

## Merging two lists works only if...

- [ ] They have the same length
- [x] Each list is already sorted
- [ ] They contain no duplicates

Explanation: Taking the smaller front item is only correct when each front item is the smallest of its list.

## What does \`my_list.sort()\` return?

- [ ] The sorted list
- [x] \`None\`, because it sorts the list in place
- [ ] A new list

Explanation: Use \`sorted(my_list)\` when you want a new sorted list back.
`,l=`---
id: big-o
module: alg-complexity
title: How fast does it grow?
minutes: 18
goal: Reason about how the work a function does grows with its input, and pick the faster approach.
summary: Big-O is a way of asking "what happens when the input gets 1,000 times bigger?"
---

# Concept

Two programs can give the same answers and still be wildly different when the data gets big. **Complexity** describes how the amount of work *grows* as the input grows. It ignores machines and stopwatches, and just counts steps.

### Counting steps

\`\`\`python run
def count_steps_linear(items):
    steps = 0
    for item in items:                 # one step per item
        steps += 1
    return steps

def count_steps_pairs(items):
    steps = 0
    for a in items:
        for b in items:                # n steps for each of n items
            steps += 1
    return steps

for n in (10, 100, 1000):
    data = list(range(n))
    print(n, count_steps_linear(data), count_steps_pairs(data))
\`\`\`

Ten times more data means **10×** more steps for the first function, but **100×** for the second.

| Name | Written | Example | 10× the data means... |
|---|---|---|---|
| constant | O(1) | \`items[0]\`, dictionary lookup | the same work |
| logarithmic | O(log n) | binary search | a few more steps |
| linear | O(n) | one loop over the items | 10× the work |
| quadratic | O(n²) | a loop inside a loop | 100× the work |

Big-O keeps only the **fastest-growing part** and drops constants: \`3n + 20\` is just O(n), and \`n² + n\` is O(n²).

### The cost of the right data structure

Where you keep the data changes the cost of the same question:

\`\`\`python run
names = ["ada", "grace", "linus"] * 3
print("grace" in names)           # list: checks items one by one, O(n)
unique = set(names)
print("grace" in unique)          # set: jumps straight there, O(1) on average
\`\`\`

\`x in some_list\` scans; \`x in some_set\` (or a dictionary key) is a direct lookup. Swapping a list for a set or dict is often the single biggest speed-up you can make.

\`\`\`diagram
{"type":"flow","caption":"Same question, different cost","steps":[{"label":"x in a list","detail":"look at items one by one: O(n)"},{"label":"x in a set","detail":"hash and jump: O(1) on average"},{"label":"in a loop of n","detail":"O(n²) versus O(n) overall"}]}
\`\`\`

> **Careful:** a nested loop isn't always quadratic, and one loop isn't always cheap. Hidden costs hide in functions you call: \`x in a_list\`, \`list.insert(0, x)\`, \`sum(...)\`, and string \`+=\` in a loop are each doing a loop for you. Count the work *per call*, then multiply.

# Example: Finding duplicates two ways

\`\`\`python example
def has_duplicates_slow(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False

def has_duplicates_fast(items):
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False

data = [3, 8, 1, 9, 4, 8]
print(has_duplicates_slow(data), has_duplicates_fast(data))
\`\`\`

The slow version compares every pair: O(n²). The fast one remembers what it has seen in a set and looks each item up once: O(n). On a list of a million items, that's the difference between seconds and hours.

# Exercise: Count the pairs {#e1}

Define \`count_pairs(items)\` that returns the number of **pairs** \`(i, j)\` with \`i < j\` that you would compare in a nested loop, by actually counting them with two loops. \`count_pairs([5, 6, 7])\` is \`3\`.

\`\`\`python starter
# Define count_pairs(items)
\`\`\`

\`\`\`python solution
def count_pairs(items):
    count = 0
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            count += 1
    return count
\`\`\`

## Hints

1. Each pair must be counted once.
2. How can the inner loop avoid repeating pairs you've already counted?
3. Let \`j\` start just after \`i\`, and add one inside the inner loop.

## Explanation

For \`n\` items there are \`n(n-1)/2\` pairs, which grows like n². That's the number of comparisons the slow duplicate check does.

# Exercise: Duplicates, fast {#e2}

Define \`has_duplicates(items)\` returning \`True\` if any value appears twice. Make it **linear**: use a set to remember what you've seen (no nested loops).

\`\`\`python starter
# Define has_duplicates(items)
\`\`\`

\`\`\`python solution
def has_duplicates(items):
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False
\`\`\`

## Hints

1. What do you need to remember as you go?
2. Which container answers "have I seen this?" instantly?
3. Check each item against a set; return \`True\` if it's there, otherwise add it.

## Explanation

Each item is looked up once, in constant time on average, so the total work is proportional to the length of the list.

# Exercise: Two numbers that add up {#e3}

Define \`two_sum(numbers, target)\` that returns a pair \`(i, j)\` of **different indexes** (with \`i < j\`) whose values add up to \`target\`, or \`None\` if there's no such pair. Aim for one pass using a dictionary from value to index.

\`\`\`python starter
# Define two_sum(numbers, target)
\`\`\`

\`\`\`python solution
def two_sum(numbers, target):
    seen = {}
    for j, value in enumerate(numbers):
        need = target - value
        if need in seen:
            return (seen[need], j)
        seen[value] = j
    return None
\`\`\`

## Hints

1. For each number, what other number would complete the target?
2. How can you find out, instantly, whether you've already passed it?
3. Store each value's index in a dictionary as you go; before storing, look up \`target - value\`.

## Explanation

Instead of trying every pair (quadratic), you ask a question per item: "have I seen the partner?". The dictionary makes that O(1), so the whole thing is O(n).

# Exercise: Most common {#e4}

Define \`most_common(items)\` that returns the item that appears most often, or \`None\` for an empty list. If several tie, return the one that **appears first** in the list. Count in a dictionary rather than calling \`items.count()\` for every item.

\`\`\`python starter
# Define most_common(items)
\`\`\`

\`\`\`python solution
def most_common(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    best = None
    for item in items:
        if best is None or counts[item] > counts[best]:
            best = item
    return best
\`\`\`

## Hints

1. Two jobs: tally everything once, then choose the winner.
2. Why is calling \`.count()\` for each item expensive?
3. Build a dictionary of counts in one pass; then walk the list in order and keep the item with the strictly bigger count.

## Explanation

Counting with a dictionary is one pass (O(n)). Using \`.count()\` inside a loop would re-scan the list for each item, which is O(n²). Walking the original order with a strict \`>\` keeps the first of any tie.

# Quiz

## A function has one loop over \`n\` items. Its complexity is...

- [ ] O(1)
- [x] O(n)
- [ ] O(n²)

Explanation: The work grows in proportion to the number of items.

## Which is usually fastest for "is this value present?" on a large collection?

- [ ] A list
- [x] A set or a dictionary
- [ ] A tuple

Explanation: Sets and dictionaries use hashing to jump straight to the value, instead of scanning.

## What does Big-O leave out?

- [ ] The growth rate
- [x] Constant factors and slower-growing terms
- [ ] The size of the input

Explanation: \`3n + 20\` and \`n\` grow in the same way for big inputs, so both are called O(n).
`,u=`---
id: numpy-arrays
module: sci-numpy
title: NumPy arrays
minutes: 18
goal: Create NumPy arrays, do arithmetic on whole arrays at once, and pick values with masks and axes.
summary: Replace loops with one-line operations on whole arrays.
---

# Concept

Python lists are flexible, but slow and clumsy for numbers. **NumPy** adds the \`array\`: a fixed-type grid of numbers stored compactly, with maths that works on **the whole array at once**.

\`\`\`python run
import numpy as np

prices = np.array([4.5, 10.0, 3.25, 8.0])
print(prices)
print(prices * 2)          # every item doubled, no loop
print(prices + prices)     # item-by-item addition
print(prices.sum(), prices.mean(), prices.max())
\`\`\`

Compare with a list: \`[4.5, 10.0] * 2\` repeats the list, but an array \`* 2\` multiplies each number. This "do it to everything" style is called **vectorisation**, and it replaces most \`for\` loops in numeric code.

### Making arrays

\`\`\`python run
import numpy as np

print(np.arange(0, 10, 2))        # like range, but an array: 0 2 4 6 8
print(np.linspace(0, 1, 5))       # 5 evenly spaced points from 0 to 1
print(np.zeros(3), np.ones(2))
grid = np.array([[1, 2, 3], [4, 5, 6]])
print(grid.shape)                 # (2, 3): 2 rows, 3 columns
\`\`\`

### Picking values

Arrays index like lists, and you can also pick with a **boolean mask**: a True/False array the same size.

\`\`\`python run
import numpy as np

scores = np.array([72, 95, 58, 88, 64])
print(scores[0], scores[-1], scores[1:3])

passed = scores >= 70             # an array of True/False
print(passed)
print(scores[passed])             # only the True positions
print(scores[scores > scores.mean()])
\`\`\`

### Rows and columns: \`axis\`

For a 2D array, \`axis=0\` goes **down** the rows (one result per column) and \`axis=1\` goes **across** (one result per row).

\`\`\`python run
import numpy as np

sales = np.array([[10, 20, 30],
                  [ 1,  2,  3]])
print(sales.sum(axis=0))   # per column: [11 22 33]
print(sales.sum(axis=1))   # per row:    [60  6]
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"axis in a 2D array","steps":[{"label":"axis=0","detail":"collapse the rows: one answer per column"},{"label":"axis=1","detail":"collapse the columns: one answer per row"},{"label":"no axis","detail":"collapse everything to one number"}]}
\`\`\`

> **Careful:** \`array * 2\` is arithmetic but \`list * 2\` is repetition. And a mask must be the same length as the array. Also remember that slices of an array are **views**: changing a slice changes the original (use \`.copy()\` to get an independent array).

# Example: Standardising

\`\`\`python example
import numpy as np

heights = np.array([150, 160, 170, 180, 190])
mean = heights.mean()
spread = heights.std()
z = (heights - mean) / spread     # every item at once
print(z.round(2))
print(round(z.mean(), 6), round(z.std(), 6))
\`\`\`

Subtracting a single number from an array applies it to every item (this is called *broadcasting*). The result has mean 0 and standard deviation 1, a common first step before machine learning.

# Exercise: Build arrays {#e1}

Create \`evens\`, an array of the even numbers from 2 to 20 (inclusive) using \`np.arange\`, and \`tens\`, an array holding each of those multiplied by 10.

\`\`\`python starter
import numpy as np

# Create evens and tens
\`\`\`

\`\`\`python solution
import numpy as np

evens = np.arange(2, 21, 2)
tens = evens * 10
\`\`\`

## Hints

1. \`np.arange(start, stop, step)\` works like \`range\`.
2. Does \`stop\` include 20?
3. Use a stop of 21 and a step of 2; then multiply the whole array by 10.

## Explanation

Like \`range\`, the stop value is excluded, so \`21\` is needed to include 20. Multiplying the array by 10 applies to every item at once.

# Exercise: Standardise {#e2}

Define \`standardise(values)\` that takes a NumPy array and returns a new array where the mean has been subtracted and the result divided by the standard deviation.

\`\`\`python starter
import numpy as np

# Define standardise(values)
\`\`\`

\`\`\`python solution
import numpy as np

def standardise(values):
    return (values - values.mean()) / values.std()
\`\`\`

## Hints

1. What two summary numbers do you need?
2. Can you apply a subtraction and a division to the whole array without a loop?
3. Subtract \`values.mean()\` from the array, then divide by \`values.std()\`.

## Explanation

Both steps are broadcast over the whole array, and neither modifies the original.

# Exercise: Above average {#e3}

Define \`above_average(values)\` that returns a NumPy array of only the values that are greater than the mean of all values. Use a boolean mask.

\`\`\`python starter
import numpy as np

# Define above_average(values)
\`\`\`

\`\`\`python solution
import numpy as np

def above_average(values):
    return values[values > values.mean()]
\`\`\`

## Hints

1. Comparing an array with a number gives an array of True/False.
2. What can you do with such an array?
3. Index the array with the comparison itself: \`values[ ... ]\`.

## Explanation

\`values > values.mean()\` is a boolean array, and indexing with it keeps only the \`True\` positions.

# Exercise: Rows and columns {#e4}

Define \`table_stats(table)\` for a 2D array. Return a tuple \`(row_totals, column_means)\`: the sum of each row, and the mean of each column, both as 1D arrays.

\`\`\`python starter
import numpy as np

# Define table_stats(table)
\`\`\`

\`\`\`python solution
import numpy as np

def table_stats(table):
    return table.sum(axis=1), table.mean(axis=0)
\`\`\`

## Hints

1. One answer per row for the first, one per column for the second.
2. Which \`axis\` goes across a row?
3. Row totals collapse the columns (\`axis=1\`); column means collapse the rows (\`axis=0\`).

## Explanation

\`axis\` names the dimension that disappears. Summing along \`axis=1\` collapses each row to a single number; averaging along \`axis=0\` collapses each column.

# Quiz

## What is \`np.array([1, 2, 3]) * 2\`?

- [ ] \`[1, 2, 3, 1, 2, 3]\`
- [x] \`array([2, 4, 6])\`
- [ ] An error

Explanation: Arithmetic on an array applies to every item, unlike list repetition.

## What does \`scores[scores > 70]\` give?

- [ ] \`True\` or \`False\`
- [x] Only the scores greater than 70
- [ ] The positions of those scores

Explanation: A boolean mask keeps the items where the mask is \`True\`.

## For a 2D array, what does \`a.sum(axis=0)\` return?

- [ ] One total per row
- [x] One total per column
- [ ] A single number

Explanation: \`axis=0\` runs down the rows, collapsing them, so you get one value per column.
`,d=`---
id: pandas-basics
module: sci-pandas
title: Tables with pandas
minutes: 20
goal: Filter, sort, group and extend a DataFrame without writing loops.
summary: Answer questions about a table of data in a line or two.
---

# Concept

**pandas** gives Python a spreadsheet-like table: the **DataFrame**. Rows are records, columns are fields, and each column holds one type of data.

\`\`\`python run
import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Grace", "Linus", "Guido"],
    "age": [36, 45, 17, 29],
    "score": [91, 88, 72, 85],
})
print(df)
print(df.shape)
\`\`\`

### Columns and rows

\`\`\`python run
import pandas as pd

df = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "age": [36, 45, 17], "score": [91, 88, 72]})
print(df["score"])                 # one column (a Series)
print(df["score"].mean())          # summaries
print(df[["name", "score"]])       # several columns: a list inside the brackets
\`\`\`

### Filtering rows

Comparing a column with a value gives a True/False column; use it to pick rows (the same mask idea as NumPy):

\`\`\`python run
import pandas as pd

df = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "age": [36, 45, 17], "score": [91, 88, 72]})
adults = df[df["age"] >= 18]
print(adults)
print(df[(df["age"] >= 18) & (df["score"] > 90)])   # combine with & and |, each in brackets
\`\`\`

### Sorting

\`\`\`python run
import pandas as pd

df = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "score": [91, 88, 72]})
print(df.sort_values("score", ascending=False))
print(df.sort_values("score", ascending=False).head(2))
\`\`\`

### Groups

\`groupby\` splits the rows by a column, then summarises each group:

\`\`\`python run
import pandas as pd

sales = pd.DataFrame({"city": ["Rome", "Oslo", "Rome", "Oslo"], "amount": [10, 7, 30, 3]})
print(sales.groupby("city")["amount"].sum())
print(sales.groupby("city")["amount"].mean().to_dict())
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"split, apply, combine","steps":[{"label":"groupby(\\"city\\")","detail":"split the rows into one group per city"},{"label":"[\\"amount\\"].sum()","detail":"summarise each group"},{"label":"one row per city","detail":"combined into a new table"}]}
\`\`\`

### New columns

Assigning to a new column name creates it, calculated for every row at once:

\`\`\`python run
import pandas as pd

shop = pd.DataFrame({"item": ["pen", "book"], "price": [1.5, 12.0], "qty": [10, 2]})
shop["total"] = shop["price"] * shop["qty"]
print(shop)
\`\`\`

> **Careful:** use \`&\` and \`|\` (not \`and\`/\`or\`) to combine filters, with each condition in its own brackets. And filtering or assigning to a slice of a DataFrame may modify the original, or warn you: when you want to change a copy, call \`.copy()\` first.

# Example: Which city sells most?

\`\`\`python example
import pandas as pd

sales = pd.DataFrame({
    "city": ["Rome", "Oslo", "Rome", "Oslo", "Paris"],
    "amount": [10, 7, 30, 3, 12],
})
totals = sales.groupby("city")["amount"].sum().sort_values(ascending=False)
print(totals)
print("Best:", totals.index[0], totals.iloc[0])
\`\`\`

\`groupby\` totals each city; sorting descending puts the best first; \`.index\` holds the city names and \`.iloc[0]\` the first value.

# Exercise: Adults only {#e1}

Define \`adults(df)\` that returns the rows of \`df\` where the \`age\` column is at least 18.

\`\`\`python starter
import pandas as pd

# Define adults(df)
\`\`\`

\`\`\`python solution
import pandas as pd

def adults(df):
    return df[df["age"] >= 18]
\`\`\`

## Hints

1. Build a True/False condition from a column.
2. How do you use that condition to pick rows?
3. Put the comparison inside the square brackets after the DataFrame.

## Explanation

\`df["age"] >= 18\` is a boolean Series; indexing the DataFrame with it keeps only the matching rows.

# Exercise: Average by group {#e2}

Define \`average_by(df, group, value)\` that returns a **dictionary** mapping each value of the \`group\` column to the mean of the \`value\` column for that group.

\`\`\`python starter
import pandas as pd

# Define average_by(df, group, value)
\`\`\`

\`\`\`python solution
import pandas as pd

def average_by(df, group, value):
    return df.groupby(group)[value].mean().to_dict()
\`\`\`

## Hints

1. Split by one column, summarise another.
2. Which method splits the rows into groups?
3. \`groupby(...)\`, pick the value column, take the mean, then convert with \`to_dict()\`.

## Explanation

\`groupby(group)[value].mean()\` gives a Series indexed by group, and \`to_dict()\` turns it into the plain dictionary asked for.

# Exercise: Top scorers {#e3}

Define \`top_n(df, column, n)\` that returns the \`n\` rows with the **largest** values in \`column\`, largest first.

\`\`\`python starter
import pandas as pd

# Define top_n(df, column, n)
\`\`\`

\`\`\`python solution
import pandas as pd

def top_n(df, column, n):
    return df.sort_values(column, ascending=False).head(n)
\`\`\`

## Hints

1. Two steps: put them in order, then keep a few.
2. Which \`sort_values\` option puts the biggest first?
3. Sort by the column with \`ascending=False\`, then \`head(n)\`.

## Explanation

Sorting descending moves the largest values to the top, and \`head(n)\` keeps the first \`n\` rows. If there are fewer than \`n\` rows, you simply get them all.

# Exercise: Add a total column {#e4}

Define \`with_total(df)\` that returns a **copy** of \`df\` with a new column \`total\` equal to \`price * qty\` for each row. The original must not gain the column.

\`\`\`python starter
import pandas as pd

# Define with_total(df)
\`\`\`

\`\`\`python solution
import pandas as pd

def with_total(df):
    result = df.copy()
    result["total"] = result["price"] * result["qty"]
    return result
\`\`\`

## Hints

1. A new column is created by assigning to a name that doesn't exist yet.
2. How do you avoid changing the DataFrame you were given?
3. Make a \`.copy()\` first, then assign \`copy["total"] = ...\` using the two columns.

## Explanation

Multiplying two columns works row by row. Working on \`df.copy()\` keeps the caller's table unchanged, which is usually the polite thing to do.

# Quiz

## How do you keep rows where \`age\` is over 30 and \`score\` is over 80?

- [ ] \`df[df.age > 30 and df.score > 80]\`
- [x] \`df[(df["age"] > 30) & (df["score"] > 80)]\`
- [ ] \`df.filter(age > 30, score > 80)\`

Explanation: Combine boolean conditions with \`&\` and put each in brackets; plain \`and\` doesn't work on columns.

## What does \`df.groupby("city")["amount"].sum()\` produce?

- [ ] The total of the whole column
- [x] One total per city
- [ ] The rows of the biggest city

Explanation: \`groupby\` splits by city, then the sum is calculated within each group.

## Why call \`.copy()\` before adding a column in a function?

- [ ] It makes the code faster
- [x] So the caller's DataFrame isn't changed behind its back
- [ ] It's required by pandas

Explanation: Without a copy, you'd be modifying the table you were passed in.
`,f=`---
id: matplotlib-plots
module: sci-plots
title: Plotting with Matplotlib
minutes: 18
goal: Draw labelled line, bar and comparison charts.
summary: Turn numbers into pictures people can read at a glance.
---

# Concept

A chart makes a pattern visible that a column of numbers hides. **Matplotlib** is Python's standard plotting library. In Pythia the picture appears right in the console when your program finishes.

\`\`\`python run
import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5]
height = [2.0, 3.1, 4.9, 7.2, 9.8]

fig, ax = plt.subplots()
ax.plot(days, height)
ax.set_title("A bean plant")
ax.set_xlabel("Day")
ax.set_ylabel("Height (cm)")
plt.show()
\`\`\`

### Figure and axes

\`plt.subplots()\` gives you two objects:

- the **figure**: the whole canvas;
- the **axes** (\`ax\`): one chart on it, with the lines, bars, labels and axes.

You draw by calling methods on \`ax\`. A good chart always has a **title** and **labelled axes with units**.

### Chart types

\`\`\`python run
import matplotlib.pyplot as plt

fig, (left, right) = plt.subplots(1, 2, figsize=(8, 3))
left.bar(["Mon", "Tue", "Wed"], [5, 9, 4])         # compare categories
left.set_title("Bars: categories")
right.scatter([1, 2, 3, 4], [2, 4, 5, 9])          # relationship between two numbers
right.set_title("Scatter: relationships")
plt.show()
\`\`\`

| Use | Method |
|---|---|
| change over time / a trend | \`ax.plot(x, y)\` |
| compare categories | \`ax.bar(labels, values)\` |
| relationship between two numbers | \`ax.scatter(x, y)\` |

### Several series

Give each line a \`label\` and call \`ax.legend()\` to show which is which:

\`\`\`python run
import matplotlib.pyplot as plt

x = [1, 2, 3]
fig, ax = plt.subplots()
ax.plot(x, [1, 2, 3], label="steady")
ax.plot(x, [1, 4, 9], label="accelerating")
ax.legend()
plt.show()
\`\`\`

> **Careful:** plotting code that leaves out the labels is the most common mistake: nobody can tell what the axes mean. And an empty chart usually means you forgot \`plt.show()\`, or you plotted before creating the axes. In a function, return the \`ax\` so callers (and tests) can inspect or adjust the chart.

# Example: A function that draws

\`\`\`python example
import matplotlib.pyplot as plt

def squares_chart(n):
    xs = list(range(1, n + 1))
    ys = [x * x for x in xs]
    fig, ax = plt.subplots()
    ax.plot(xs, ys, marker="o")
    ax.set_title(f"Squares up to {n}")
    ax.set_xlabel("n")
    ax.set_ylabel("n squared")
    return ax

ax = squares_chart(6)
plt.show()
print(ax.get_title())
\`\`\`

Returning \`ax\` makes the function reusable: the caller can show it, save it, or change it.

# Exercise: A labelled line {#e1}

Define \`growth_chart(days, heights)\` that draws a line chart of \`heights\` against \`days\`, with the title \`"Growth"\`, the x label \`"Day"\` and the y label \`"Height (cm)"\`, and **returns the axes**.

\`\`\`python starter
import matplotlib.pyplot as plt

# Define growth_chart(days, heights)
\`\`\`

\`\`\`python solution
import matplotlib.pyplot as plt

def growth_chart(days, heights):
    fig, ax = plt.subplots()
    ax.plot(days, heights)
    ax.set_title("Growth")
    ax.set_xlabel("Day")
    ax.set_ylabel("Height (cm)")
    return ax
\`\`\`

## Hints

1. Create the axes, draw, label, return.
2. Which methods set the title and the two axis labels?
3. \`ax.plot(days, heights)\`, then \`set_title\`, \`set_xlabel\`, \`set_ylabel\`, and \`return ax\`.

## Explanation

Everything you do to the chart goes through the \`ax\` object. Returning it lets the caller work with the chart afterwards.

# Exercise: A bar chart {#e2}

Define \`bar_chart(labels, values)\` that draws one bar per label and **returns the axes**. Title it \`"Totals"\`.

\`\`\`python starter
import matplotlib.pyplot as plt

# Define bar_chart(labels, values)
\`\`\`

\`\`\`python solution
import matplotlib.pyplot as plt

def bar_chart(labels, values):
    fig, ax = plt.subplots()
    ax.bar(labels, values)
    ax.set_title("Totals")
    return ax
\`\`\`

## Hints

1. Which kind of chart compares categories?
2. What two lists does it take?
3. \`ax.bar(labels, values)\`, then set the title and return \`ax\`.

## Explanation

\`ax.bar\` draws a rectangle per value and uses the labels as the tick text on the x axis.

# Exercise: Two lines, one legend {#e3}

Define \`compare_chart(x, first, second)\` that plots two lines against the same \`x\`, labelled \`"first"\` and \`"second"\`, shows a **legend**, and returns the axes.

\`\`\`python starter
import matplotlib.pyplot as plt

# Define compare_chart(x, first, second)
\`\`\`

\`\`\`python solution
import matplotlib.pyplot as plt

def compare_chart(x, first, second):
    fig, ax = plt.subplots()
    ax.plot(x, first, label="first")
    ax.plot(x, second, label="second")
    ax.legend()
    return ax
\`\`\`

## Hints

1. A legend needs to know the name of each line.
2. Where do you give a line its name?
3. Pass \`label="..."\` to each \`ax.plot\`, and call \`ax.legend()\` once at the end.

## Explanation

\`label\` attaches a name to a plotted line, and \`ax.legend()\` draws the key from all labelled items.

# Quiz

## What are the *figure* and the *axes*?

- [ ] Two names for the same thing
- [x] The figure is the whole canvas; the axes is one chart drawn on it
- [ ] The figure is the data; the axes are the labels

Explanation: A figure can hold several axes (several charts).

## Which chart best compares sales in four cities?

- [ ] A line chart
- [x] A bar chart
- [ ] A scatter plot

Explanation: Bars are for comparing separate categories.

## What do you need so a legend can show which line is which?

- [ ] \`ax.title(...)\`
- [x] A \`label=\` on each plotted line, then \`ax.legend()\`
- [ ] A different colour for each line

Explanation: The legend lists the labels you gave.
`,p=`---
id: lists-basics
module: ds-lists
title: Lists
minutes: 13
goal: Create lists, read and change items by index, and use len(), append() and in.
summary: An ordered, changeable collection: the workhorse of Python.
---

# Concept

A **list** holds several values in order, written in square brackets:

\`\`\`python run
colors = ["red", "green", "blue"]
numbers = [10, 20, 30, 40]
mixed = ["Ada", 36, True, 2.5]
empty = []
print(colors)
print(len(numbers))
\`\`\`

Lists can hold anything, even different types together, and they can grow and shrink while the program runs.

### Indexing

Items are numbered from **0**, exactly like the characters of a string, and negative indexes count from the end:

\`\`\`diagram
{"type":"strip","caption":"colors = [\\"red\\", \\"green\\", \\"blue\\"]","cells":["\\"red\\"","\\"green\\"","\\"blue\\""],"highlight":[1],"negative":true}
\`\`\`

\`\`\`python run
colors = ["red", "green", "blue"]
print(colors[0])
print(colors[2])
print(colors[-1])
\`\`\`

> **Careful:** \`colors[3]\` on a three-item list is an \`IndexError\`: the valid positions are 0 to 2, which is one less than \`len(colors)\`. If you've ever written \`range(len(items) + 1)\`, Pythia's question is: "what is the last valid index?"

### Changing a list

Unlike strings, lists are **mutable**: you can replace items in place and add new ones.

\`\`\`python run
colors = ["red", "green", "blue"]
colors[1] = "yellow"
colors.append("purple")
print(colors)
\`\`\`

\`append\` adds one item at the end. Notice that it *changes the list itself* and returns nothing: you don't write \`colors = colors.append(...)\`. (That would set \`colors\` to \`None\`, a classic slip.)

### Membership and length

\`\`\`python run
colors = ["red", "green", "blue"]
print("green" in colors)
print("pink" in colors)
print(len(colors))
\`\`\`

### Lists of lists

An item can itself be a list. Index twice to reach inside:

\`\`\`python run
grid = [[1, 2, 3], [4, 5, 6]]
print(grid[1])
print(grid[1][2])
\`\`\`

# Example: A shopping list

\`\`\`python example
shopping = ["milk", "eggs"]
shopping.append("bread")
shopping[0] = "oat milk"

print(shopping)
print("Items:", len(shopping))
print("First:", shopping[0], "| Last:", shopping[-1])
print("Need eggs?", "eggs" in shopping)
\`\`\`

Each line changes or reads the same list object. \`shopping[0] = ...\` replaced the first item, and \`.append\` grew the list.

# Exercise: Make a list {#e1}

Create a list called \`colors\` holding the three strings \`"red"\`, \`"green"\` and \`"blue"\` in that order.

\`\`\`python starter
# Create colors
\`\`\`

\`\`\`python solution
colors = ["red", "green", "blue"]
\`\`\`

## Hints

1. Which kind of brackets make a list?
2. How are the items separated, and what does each string need around it?
3. Put the three quoted strings inside square brackets, with commas between them.

## Explanation

Square brackets make a list and commas separate its items. The order you write them is the order they're stored in.

# Exercise: First, last, count {#e2}

For \`scores = [72, 85, 90, 64, 88]\`, create \`first\` (the first score), \`last\` (the last score) and \`count\` (how many scores there are).

\`\`\`python starter
scores = [72, 85, 90, 64, 88]

# Create first, last and count
\`\`\`

\`\`\`python solution
scores = [72, 85, 90, 64, 88]

first = scores[0]
last = scores[-1]
count = len(scores)
\`\`\`

## Hints

1. The same ideas apply as for strings: positions and length.
2. Is there a way to refer to the last item without knowing how long the list is?
3. Index 0 is the first item, index -1 the last, and a built-in function counts the items.

## Explanation

\`scores[0]\` and \`scores[-1]\` read the ends, and \`len(scores)\` counts the items. These work for a list of any size.

# Exercise: Edit the fruit {#e3}

\`fruits\` starts as \`["apple", "banana", "cherry"]\`. Change the **second** item to \`"blueberry"\` and add \`"date"\` to the end, so \`fruits\` becomes \`["apple", "blueberry", "cherry", "date"]\`.

\`\`\`python starter
fruits = ["apple", "banana", "cherry"]

# Edit the list
\`\`\`

\`\`\`python solution
fruits = ["apple", "banana", "cherry"]

fruits[1] = "blueberry"
fruits.append("date")
\`\`\`

## Hints

1. Two changes: one replaces an item, one adds an item.
2. Which index is the *second* item?
3. Assign to \`fruits[1]\` for the replacement and use the method that adds to the end for the new fruit.

## Explanation

\`fruits[1] = ...\` overwrites position 1, the second item (indexes start at 0). \`append\` adds at the end and modifies the list in place.

# Exercise: The last item {#e4}

Define \`last_item(items)\` that returns the last item of a list, or \`None\` if the list is empty.

\`\`\`python starter
# Define last_item(items)
\`\`\`

\`\`\`python solution
def last_item(items):
    if len(items) == 0:
        return None
    return items[-1]
\`\`\`

## Hints

1. What happens if you ask an empty list for its last item?
2. How can you check for emptiness before indexing?
3. If the length is zero, return \`None\`; otherwise return the item at index -1.

## Explanation

\`[][-1]\` raises an \`IndexError\`, so the empty case must be handled first. \`return None\` makes the "nothing here" answer explicit.

# Quiz

## What is \`[10, 20, 30][1]\`?

- [ ] 10
- [x] 20
- [ ] 30

Explanation: Index 0 is the first item, so index 1 is the second: 20.

## What does \`items = items.append(5)\` leave in \`items\`?

- [ ] The list with 5 added
- [x] \`None\`
- [ ] An error is raised

Explanation: \`append\` changes the list in place and returns \`None\`. Assigning that result throws your list away.

## What does \`len([[1, 2], [3]])\` return?

- [ ] 3
- [x] 2
- [ ] 1

Explanation: The outer list contains two items, and each of those is itself a list.
`,m='---\nid: list-methods-slicing\nmodule: ds-lists\ntitle: List methods and slicing\nminutes: 15\ngoal: Slice lists, add and remove items with methods, split and join text, and avoid the shared-list trap.\nsummary: Cut lists into pieces, grow and shrink them, and learn why copying matters.\n---\n\n# Concept\n\n### Slicing\n\nSlices work on lists just like on strings: `items[start:stop]` takes from `start` up to (not including) `stop`, and always gives back a **new list**.\n\n```python run\nnums = [10, 20, 30, 40, 50]\nprint(nums[1:4])\nprint(nums[:2])\nprint(nums[-2:])\nprint(nums[::2])\nprint(nums[::-1])\n```\n\n### Growing and shrinking\n\n| Method | Does |\n|---|---|\n| `append(x)` | add `x` at the end |\n| `insert(i, x)` | add `x` at position `i` |\n| `extend(other)` | add every item of `other` |\n| `pop()` / `pop(i)` | remove and **return** the last item / item at `i` |\n| `remove(x)` | remove the first item equal to `x` |\n| `sort()` / `reverse()` | reorder in place |\n| `count(x)` / `index(x)` | how many / where is the first |\n\n```python run\nqueue = ["a", "b", "c"]\nqueue.append("d")\nqueue.insert(0, "start")\nfirst = queue.pop(0)\nprint(first, queue)\nqueue.remove("c")\nprint(queue)\n```\n\n`+` joins two lists into a new one, and `*` repeats:\n\n```python run\nprint([1, 2] + [3])\nprint([0] * 4)\n```\n\n### Text to list and back\n\n`split()` turns a string into a list of words, and `"sep".join(list)` goes the other way:\n\n```python run\nwords = "the quick brown fox".split()\nprint(words)\nprint("-".join(words))\nprint("a,b,c".split(","))\n```\n\n### The shared-list trap\n\nAssigning a list to another name does **not** copy it. Both names point at the *same* list:\n\n```python run\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)\nprint(a is b)\n```\n\nChanging `b` changed `a`, because they\'re one list. To get an independent copy, make a new list:\n\n```python run\na = [1, 2, 3]\nb = a.copy()        # or list(a), or a[:]\nb.append(4)\nprint(a, b)\n```\n\n```diagram\n{"type":"boxes","caption":"b = a  →  two names, one list","items":[{"name":"a","value":"[1, 2, 3, 4]","note":"same list"},{"name":"b","value":"[1, 2, 3, 4]","note":"same list"}]}\n```\n\n> **Careful:** this aliasing is behind many "why did my data change?!" bugs, especially when you pass a list into a function that modifies it. When a list changes somewhere you didn\'t expect, Pythia will ask: "do these two names refer to the same list?"\n\n# Example: A waiting line\n\n```python example\nline = ["Ada", "Grace", "Linus"]\n\nline.append("Margaret")\nserved = line.pop(0)\nprint("Served:", served)\nprint("Still waiting:", line)\n\nbackup = line.copy()\nline.clear()\nprint("line:", line, "| backup:", backup)\n```\n\n`pop(0)` removes and returns the first item. `copy()` made `backup` independent, so `clear()` didn\'t empty it.\n\n# Exercise: Cut the list {#e1}\n\nFor `nums = [1, 2, 3, 4, 5, 6]`, create `first_three` (the first three items) and `last_two` (the last two items) with slices.\n\n```python starter\nnums = [1, 2, 3, 4, 5, 6]\n\n# Create first_three and last_two\n```\n\n```python solution\nnums = [1, 2, 3, 4, 5, 6]\n\nfirst_three = nums[:3]\nlast_two = nums[-2:]\n```\n\n## Hints\n\n1. The same slice syntax you used on strings works here.\n2. Which side of the colon can you leave empty for "from the beginning", and which for "to the end"?\n3. The first slice stops at index 3. The second uses a negative start and no stop.\n\n## Explanation\n\n`nums[:3]` is the items at indexes 0, 1 and 2. `nums[-2:]` starts two from the end and runs to the end.\n\n# Exercise: Make a real copy {#e2}\n\n`a` should stay `[1, 2, 3]`, but the starter code changes it by accident. Make `b` an **independent copy** of `a` so that after `b.append(4)`, `a` is still `[1, 2, 3]` and `b` is `[1, 2, 3, 4]`.\n\n```python starter\na = [1, 2, 3]\nb = a\nb.append(4)\n```\n\n```python solution\na = [1, 2, 3]\nb = a.copy()\nb.append(4)\n```\n\n## Hints\n\n1. After `b = a`, how many lists exist in memory?\n2. What would you need to create so that `b` has its own list?\n3. Replace the plain assignment with a method (or conversion) that builds a new list with the same items.\n\n## Explanation\n\n`b = a` only gives the list a second name. `a.copy()` builds a new list, so appending to `b` can\'t affect `a`.\n\n# Exercise: Rotate {#e3}\n\nDefine `rotate(items)` that returns a **new** list with the first item moved to the end: `rotate([1, 2, 3])` returns `[2, 3, 1]`. An empty list stays empty. The original list must not change.\n\n```python starter\n# Define rotate(items)\n```\n\n```python solution\ndef rotate(items):\n    return items[1:] + items[:1]\n```\n\n## Hints\n\n1. Think of the result as two pieces: "everything except the first" and "just the first".\n2. Which two slices give you those pieces, and how do you join lists?\n3. Take the slice starting at index 1, then add the slice holding only the first item.\n\n## Explanation\n\n`items[1:]` is everything after the first; `items[:1]` is a one-item list holding the first (or `[]` if the list is empty, which makes the empty case work for free). `+` builds a new list, leaving `items` untouched.\n\n# Exercise: Serve the queue {#e4}\n\n`queue = ["a", "b", "c"]`. Remove the **first** item from the list and store it in `served`, so that `served` is `"a"` and `queue` is `["b", "c"]`.\n\n```python starter\nqueue = ["a", "b", "c"]\n\n# Create served and update queue\n```\n\n```python solution\nqueue = ["a", "b", "c"]\n\nserved = queue.pop(0)\n```\n\n## Hints\n\n1. One operation should both take the item out and tell you what it was.\n2. Which method removes an item and returns it?\n3. Call it on `queue`, passing the position of the item you want, and assign the result to `served`.\n\n## Explanation\n\n`pop(0)` removes the item at index 0 and returns it, so one line both updates `queue` and sets `served`.\n\n# Quiz\n\n## What does `[1, 2, 3, 4][1:3]` give?\n\n- [ ] `[1, 2, 3]`\n- [x] `[2, 3]`\n- [ ] `[2, 3, 4]`\n\nExplanation: It starts at index 1 and stops before index 3: the items at indexes 1 and 2.\n\n## After `a = [1]`, `b = a`, `b.append(2)`, what is `a`?\n\n- [ ] `[1]`\n- [x] `[1, 2]`\n- [ ] An error\n\nExplanation: `b = a` doesn\'t copy. Both names refer to the same list, so the append is visible through either.\n\n## What does `"a-b-c".split("-")` return?\n\n- [ ] `"abc"`\n- [x] `["a", "b", "c"]`\n- [ ] `["a-b-c"]`\n\nExplanation: `split` cuts the string at each separator and returns the pieces as a list.\n',ee=`---
id: iterating-lists
module: ds-lists
title: Looping over lists
minutes: 14
goal: Walk through a list with for, and use common patterns: totals, counting, filtering and enumerate.
summary: The patterns behind almost every data-processing program.
---

# Concept

\`for item in my_list:\` visits every item, in order. It's the most common way to use a list:

\`\`\`python run
names = ["Ada", "Grace", "Linus"]
for name in names:
    print("Hello,", name)
\`\`\`

You don't use an index at all: you get the items themselves.

### Built-in helpers

A few functions summarise a list of numbers without any loop:

\`\`\`python run
scores = [72, 85, 90, 64]
print(sum(scores))
print(min(scores), max(scores))
print(len(scores))
print(sum(scores) / len(scores))
\`\`\`

But much of the time you need your own loop, and a handful of patterns cover most of the cases.

### Pattern 1: accumulate

Start with an "empty" value, update it for each item:

\`\`\`python run
total = 0
for price in [3, 5, 8]:
    total += price
print(total)
\`\`\`

### Pattern 2: count the matches

\`\`\`python run
count = 0
for n in [5, 12, 7, 20, 3]:
    if n > 6:
        count += 1
print(count)
\`\`\`

### Pattern 3: build a new list (filter / transform)

Start with an empty list, \`append\` what you want:

\`\`\`python run
numbers = [5, -2, 8, -7, 3]
positives = []
for n in numbers:
    if n > 0:
        positives.append(n)
print(positives)
\`\`\`

### Pattern 4: find the best

Keep the best-so-far, replace it when you see a better one:

\`\`\`python run
words = ["pear", "banana", "fig"]
longest = words[0]
for w in words:
    if len(w) > len(longest):
        longest = w
print(longest)
\`\`\`

### enumerate: item and position together

When you need the index as well, don't write \`range(len(items))\`. Use \`enumerate\`:

\`\`\`python run
for i, name in enumerate(["Ada", "Grace"], start=1):
    print(i, name)
\`\`\`

> **Careful:** don't add or remove items from a list **while looping over it**: the loop skips items or misbehaves. Build a new list instead (Pattern 3). Pythia watches for this one.

# Example: Statistics by hand

\`\`\`python example
temps = [18, 22, 19, 25, 21]

hottest = temps[0]
total = 0
warm_days = 0

for t in temps:
    total += t
    if t > hottest:
        hottest = t
    if t >= 21:
        warm_days += 1

print("Average:", total / len(temps))
print("Hottest:", hottest)
print("Warm days:", warm_days)
\`\`\`

One pass through the list updates three different results at once. Notice \`hottest\` starts at the first item rather than 0, so it works even if all the values are negative.

# Exercise: Total price {#e1}

Define \`total_price(prices)\` that returns the sum of a list of numbers, using a loop (not \`sum\`).

\`\`\`python starter
# Define total_price(prices)
\`\`\`

\`\`\`python solution
def total_price(prices):
    total = 0
    for price in prices:
        total += price
    return total
\`\`\`

## Hints

1. Where will the running result be kept, and what is its value for an empty list?
2. What must happen for each item in the list?
3. Start a total at 0, add each price inside a loop, and return the total *after* the loop.

## Explanation

The accumulator starts at 0, which is also the right answer for an empty list. The \`return\` is outside the loop, so it only happens once every item has been added.

# Exercise: How many are big? {#e2}

Define \`count_above(numbers, limit)\` that returns how many numbers in the list are **strictly greater** than \`limit\`.

\`\`\`python starter
# Define count_above(numbers, limit)
\`\`\`

\`\`\`python solution
def count_above(numbers, limit):
    count = 0
    for n in numbers:
        if n > limit:
            count += 1
    return count
\`\`\`

## Hints

1. This is a counting task: what do you keep track of?
2. Which comparison decides whether an item counts, and what about numbers equal to the limit?
3. Initialise a counter, add one inside an \`if\` for each number greater than \`limit\`, and return the counter.

## Explanation

\`n > limit\` is strict, so items equal to the limit aren't counted. The counter is returned after the loop.

# Exercise: Keep the positives {#e3}

Define \`positives(numbers)\` that returns a **new list** with only the numbers greater than zero, in their original order.

\`\`\`python starter
# Define positives(numbers)
\`\`\`

\`\`\`python solution
def positives(numbers):
    result = []
    for n in numbers:
        if n > 0:
            result.append(n)
    return result
\`\`\`

## Hints

1. You're producing a different list from the one you're given. Where does that list start?
2. How do you decide whether to keep an item, and how do you keep it?
3. Start with an empty list, append each number that is above zero, and return the list afterwards.

## Explanation

The empty list \`result\` collects the keepers. The original \`numbers\` list isn't modified, which is the safe approach.

# Exercise: Longest word {#e4}

Define \`longest_word(words)\` that returns the longest string in a non-empty list. If there is a tie, return the **first** of the longest.

\`\`\`python starter
# Define longest_word(words)
\`\`\`

\`\`\`python solution
def longest_word(words):
    best = words[0]
    for word in words:
        if len(word) > len(best):
            best = word
    return best
\`\`\`

## Hints

1. Which word do you start with as "the best so far"?
2. When should the best-so-far be replaced? What about equal lengths?
3. Start with the first word and replace it only when a word is strictly longer.

## Explanation

Starting from \`words[0]\` avoids inventing a fake starting value. Using \`>\` rather than \`>=\` keeps the earlier word on ties.

# Exercise: Numbered list {#e5}

Define \`numbered(items)\` that returns a list of strings like \`["1. milk", "2. eggs"]\`: each item prefixed with its position, counting from 1. Use \`enumerate\`.

\`\`\`python starter
# Define numbered(items)
\`\`\`

\`\`\`python solution
def numbered(items):
    result = []
    for i, item in enumerate(items, start=1):
        result.append(f"{i}. {item}")
    return result
\`\`\`

## Hints

1. You need each item together with its position.
2. By default positions start at 0. How can you change where counting starts?
3. Loop with two variables over \`enumerate(items, start=1)\` and append an f-string for each.

## Explanation

\`enumerate\` hands out \`(position, item)\` pairs, and \`start=1\` makes the first position 1. Each pair becomes a string appended to the result.

# Quiz

## Which is the best way to loop over a list's items?

- [ ] \`for i in range(len(items)): print(items[i])\`
- [x] \`for item in items: print(item)\`
- [ ] \`while items: print(items)\`

Explanation: Looping directly over the items is shorter and removes index mistakes. Use \`enumerate\` if you need positions too.

## What does \`enumerate(["a", "b"])\` produce?

- [ ] \`"a", "b"\`
- [x] Pairs: \`(0, "a")\` then \`(1, "b")\`
- [ ] \`0, 1\`

Explanation: Each pair holds the position and the item.

## What goes wrong if you remove items from a list while looping over it?

- [ ] Nothing
- [x] The loop can skip items
- [ ] Python refuses to run

Explanation: Removing shifts later items left under the loop's feet, so some are never visited. Build a new list instead.
`,te=`---
id: sorting-zip
module: ds-lists
title: Sorting and zip
minutes: 14
goal: Sort lists with sorted() and sort(), choose the order with key and reverse, and pair lists with zip().
summary: Put things in order, and walk through two lists side by side.
---

# Concept

### sorted() and .sort()

There are two ways to sort, and the difference matters:

| | Returns | Changes the original? |
|---|---|---|
| \`sorted(items)\` | a **new** sorted list | no |
| \`items.sort()\` | \`None\` | **yes**, in place |

\`\`\`python run
nums = [3, 1, 2]
print(sorted(nums))
print(nums)
nums.sort()
print(nums)
\`\`\`

> **Careful:** \`nums = nums.sort()\` sets \`nums\` to \`None\`, just like \`append\`. Methods that change a list in place return \`None\` so you don't confuse them with ones that return something new.

### Reverse order

\`\`\`python run
print(sorted([3, 1, 2], reverse=True))
print(sorted(["pear", "Apple", "fig"]))
\`\`\`

Strings sort by character code, so uppercase letters come before lowercase: \`"Apple"\` before \`"fig"\`, but \`"Zebra"\` before \`"apple"\`. To ignore case, sort by a key.

### key: sort by something else

\`key=\` takes a function that is applied to each item; items are ordered by its result:

\`\`\`python run
words = ["pear", "fig", "banana", "kiwi"]
print(sorted(words, key=len))
print(sorted(words, key=str.lower))
print(sorted(words, key=len, reverse=True))
\`\`\`

Python's sort is **stable**: items with equal keys stay in their original order (\`pear\` before \`kiwi\`, which are both length 4).

### min and max with key

\`\`\`python run
words = ["pear", "fig", "banana"]
print(max(words, key=len))
print(min(words))
\`\`\`

### zip: two lists, side by side

\`zip(a, b)\` pairs up the items at the same position, and stops at the shorter list:

\`\`\`python run
names = ["Ada", "Grace", "Linus"]
ages = [36, 85, 54]
for name, age in zip(names, ages):
    print(name, "is", age)
print(list(zip(names, ages)))
\`\`\`

\`zip\` gives you pairs as small unchanging groups called *tuples* (the next lesson). Loop with two names to take each pair apart.

# Example: A leaderboard

\`\`\`python example
names = ["Ada", "Grace", "Linus", "Margaret"]
scores = [82, 95, 78, 95]

pairs = list(zip(scores, names))
pairs.sort(reverse=True)

for rank, (score, name) in enumerate(pairs, start=1):
    print(rank, name, score)
\`\`\`

Pairs sort by their first item (the score), then by the second to break ties. The loop unpacks \`(score, name)\` inside \`enumerate\`: a taste of what's next.

# Exercise: Biggest first {#e1}

Define \`sorted_desc(numbers)\` that returns the numbers sorted from **largest to smallest**, without changing the original list.

\`\`\`python starter
# Define sorted_desc(numbers)
\`\`\`

\`\`\`python solution
def sorted_desc(numbers):
    return sorted(numbers, reverse=True)
\`\`\`

## Hints

1. You need a sorted *copy*. Which of the two sorting tools produces one?
2. How do you flip the order?
3. Use the built-in that returns a new list and pass the argument that reverses the order.

## Explanation

\`sorted\` returns a new list and leaves \`numbers\` alone. \`reverse=True\` makes the order descending.

# Exercise: By length {#e2}

Define \`by_length(words)\` that returns the words sorted from shortest to longest. Words with the same length must keep their original relative order.

\`\`\`python starter
# Define by_length(words)
\`\`\`

\`\`\`python solution
def by_length(words):
    return sorted(words, key=len)
\`\`\`

## Hints

1. You're not sorting by the words themselves. What are you sorting by?
2. Sorting can take a function that says what to compare. Which function gives a word's size?
3. Pass that function (without calling it) as the \`key\` argument.

## Explanation

\`key=len\` tells \`sorted\` to compare each word's length. Because the sort is stable, equal lengths keep their input order.

# Exercise: Pair them up {#e3}

Define \`pairs(names, ages)\` that returns a list of \`(name, age)\` tuples built from the two lists, e.g. \`[("Ada", 36), ("Grace", 85)]\`.

\`\`\`python starter
# Define pairs(names, ages)
\`\`\`

\`\`\`python solution
def pairs(names, ages):
    return list(zip(names, ages))
\`\`\`

## Hints

1. Which built-in puts two sequences side by side?
2. What does it return, and how can you turn that into a list?
3. Zip the two lists and wrap the result in \`list(...)\`.

## Explanation

\`zip(names, ages)\` produces the pairs lazily, and \`list(...)\` collects them. If the lists have different lengths, zip stops at the shorter.

# Exercise: Cheapest first {#e4}

\`products\` is a list of \`(name, price)\` tuples. Create \`cheapest\`, the **name** of the product with the lowest price. (Hint: \`min\` accepts a \`key\`, and a tuple's items can be indexed.)

\`\`\`python starter
products = [("tea", 3.5), ("coffee", 4.0), ("water", 1.25)]

# Create cheapest
\`\`\`

\`\`\`python solution
products = [("tea", 3.5), ("coffee", 4.0), ("water", 1.25)]

cheapest = min(products, key=lambda p: p[1])[0]
\`\`\`

## Hints

1. Which built-in finds the smallest item, and what do you want it to compare?
2. The comparison should look at the price, the second item of each tuple. How could \`key\` do that?
3. A tiny \`lambda p: p[1]\` gives the price of a pair. After finding the winning tuple, index it for the name.

## Explanation

\`key=lambda p: p[1]\` makes \`min\` compare prices. It returns the whole tuple, so \`[0]\` extracts the name. (A \`lambda\` is a one-line anonymous function.)

# Quiz

## What does \`nums.sort()\` return?

- [ ] The sorted list
- [x] \`None\`
- [ ] A copy of the list

Explanation: \`sort()\` changes the list in place and returns \`None\`. Use \`sorted(nums)\` for a new list.

## What does \`sorted(["b", "a", "C"])\` return?

- [ ] \`["a", "b", "C"]\`
- [x] \`["C", "a", "b"]\`
- [ ] \`["C", "b", "a"]\`

Explanation: Uppercase letters have smaller character codes than lowercase ones, so \`"C"\` sorts first. Use \`key=str.lower\` to ignore case.

## What does \`list(zip([1, 2, 3], ["a", "b"]))\` give?

- [ ] \`[(1, "a"), (2, "b"), (3, None)]\`
- [x] \`[(1, "a"), (2, "b")]\`
- [ ] An error

Explanation: \`zip\` stops when the shortest input runs out.
`,h=`---
id: tuples
module: ds-tuples
title: Tuples and unpacking
minutes: 12
goal: Create tuples, unpack them into variables, and return several values from a function.
summary: Small, fixed groups of values, and the neat tricks they enable.
---

# Concept

A **tuple** is like a list that can't be changed. It's written with parentheses:

\`\`\`python run
point = (3, 4)
person = ("Ada", 36, "London")
print(point)
print(person[0])
print(len(person))
\`\`\`

You can index, slice, loop and use \`in\` on a tuple exactly as on a list. What you can't do is change it:

\`\`\`python run
point = (3, 4)
point[0] = 10
\`\`\`

That's a \`TypeError\`. Tuples are **immutable**. That makes them a good fit for data that belongs together and shouldn't change: coordinates, RGB colours, a (name, age) record.

> **Careful:** a one-item tuple needs a trailing comma: \`(5,)\`. Without it, \`(5)\` is just the number 5 in parentheses. The comma is what makes a tuple; the parentheses are mostly decoration.

### Unpacking

Assign a tuple to several names at once and Python takes it apart:

\`\`\`python run
point = (3, 4)
x, y = point
print(x, y)

name, age, city = ("Ada", 36, "London")
print(name, "lives in", city)
\`\`\`

The number of names must match the number of items, or you get a \`ValueError\`.

### The swap trick

Unpacking gives Python a lovely way to swap two variables with no temporary variable:

\`\`\`python run
a = 1
b = 2
a, b = b, a
print(a, b)
\`\`\`

The right side builds the tuple \`(b, a)\` first, then it is unpacked into \`a\` and \`b\`.

### Returning several values

A function can return more than one value by returning a tuple, and the caller can unpack it straight away:

\`\`\`python run
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 9, 2, 7])
print(low, high)
print(min_max([4, 9, 2, 7]))
\`\`\`

\`return a, b\` is the same as \`return (a, b)\`. You've already met such a function: \`divmod(17, 5)\` returns \`(3, 2)\`, the quotient and remainder together.

### Looping with unpacking

\`\`\`python run
pairs = [("Ada", 36), ("Grace", 85)]
for name, age in pairs:
    print(name, age)
\`\`\`

# Example: Distance between two points

\`\`\`python example
def distance(p, q):
    (x1, y1), (x2, y2) = p, q
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5

start = (0, 0)
end = (3, 4)
print(distance(start, end))

x, y = end
print(f"end is at x={x}, y={y}")
\`\`\`

Unpacking inside the function gives readable names to the parts of each point instead of \`p[0]\` and \`q[1]\`.

# Exercise: Take the point apart {#e1}

\`point = (3, 4)\`. Use **unpacking** to create \`x\` and \`y\` from it in a single line.

\`\`\`python starter
point = (3, 4)

# Create x and y
\`\`\`

\`\`\`python solution
point = (3, 4)

x, y = point
\`\`\`

## Hints

1. You need two variables from one value in a single assignment.
2. How many names do you list on the left, and how are they separated?
3. List \`x\` and \`y\` on the left of the \`=\`, separated by a comma, and \`point\` on the right.

## Explanation

\`x, y = point\` unpacks the tuple's items into the names in order: \`x\` gets 3 and \`y\` gets 4.

# Exercise: Swap without a helper {#e2}

\`a = "left"\` and \`b = "right"\`. Swap them using tuple unpacking, in **one line**, with no temporary variable.

\`\`\`python starter
a = "left"
b = "right"

# Swap a and b
\`\`\`

\`\`\`python solution
a = "left"
b = "right"

a, b = b, a
\`\`\`

## Hints

1. Python can assign to several names at once. What could you build on the right side?
2. The right side is evaluated completely before anything is assigned. What does that let you do?
3. Put \`b\` then \`a\` on the right and \`a\` then \`b\` on the left.

## Explanation

The right side builds the tuple \`("right", "left")\` before any assignment happens, so unpacking it into \`a, b\` swaps the values safely.

# Exercise: Smallest and largest {#e3}

Define \`min_max(numbers)\` that returns a tuple \`(smallest, largest)\` for a non-empty list of numbers.

\`\`\`python starter
# Define min_max(numbers)
\`\`\`

\`\`\`python solution
def min_max(numbers):
    return min(numbers), max(numbers)
\`\`\`

## Hints

1. One function call has to give back two results.
2. Python has built-in functions for each of those two values.
3. Return both values separated by a comma.

## Explanation

\`return min(numbers), max(numbers)\` packs the two results into a tuple, which the caller can unpack: \`low, high = min_max(data)\`.

# Exercise: Quotient and remainder {#e4}

Define \`split_time(total_seconds)\` that returns \`(minutes, seconds)\`, how many whole minutes fit and how many seconds are left. \`split_time(135)\` returns \`(2, 15)\`.

\`\`\`python starter
# Define split_time(total_seconds)
\`\`\`

\`\`\`python solution
def split_time(total_seconds):
    return total_seconds // 60, total_seconds % 60
\`\`\`

## Hints

1. This is the "how many fit, and what's left" pattern from the arithmetic lesson.
2. Which two operators answer those two questions?
3. Return the floor division and the remainder of the seconds by 60.

## Explanation

\`//\` gives the whole minutes and \`%\` the leftover seconds. Returning them with a comma creates the tuple.

# Quiz

## Which line makes a tuple with one item?

- [ ] \`(5)\`
- [x] \`(5,)\`
- [ ] \`[5]\`

Explanation: The comma creates the tuple. \`(5)\` is just the number 5 in brackets.

## What happens with \`t = (1, 2); t[0] = 9\`?

- [ ] \`t\` becomes \`(9, 2)\`
- [x] A \`TypeError\`: tuples can't be changed
- [ ] \`t\` becomes \`(9,)\`

Explanation: Tuples are immutable. To "change" one you build a new tuple.

## What does \`a, b = 1, 2, 3\` do?

- [ ] Sets \`a\` to 1 and \`b\` to 2
- [ ] Sets \`a\` to 1 and \`b\` to (2, 3)
- [x] Raises a \`ValueError\`: too many values to unpack

Explanation: The number of names has to match the number of values.
`,g=`---
id: dict-basics
module: ds-dicts
title: Dictionaries
minutes: 14
goal: Create dictionaries, look up, add, change and delete entries, and look things up safely with get().
summary: Store values under names (keys) and find them instantly.
---

# Concept

A **dictionary** (\`dict\`) stores **key → value** pairs. You look things up by key instead of by position, like a real dictionary:

\`\`\`python run
person = {"name": "Ada", "age": 36, "city": "London"}
print(person["name"])
print(person["age"])
print(len(person))
\`\`\`

The format: \`{key: value, key: value}\`. Keys are usually strings or numbers. Values can be anything, including lists and other dicts.

### Adding, changing, deleting

Assigning to a key either **adds** it (if new) or **replaces** it (if it exists):

\`\`\`python run
person = {"name": "Ada", "age": 36}
person["city"] = "London"   # add
person["age"] = 37          # change
del person["name"]          # delete
print(person)
\`\`\`

### Asking: in and get

\`in\` tests the **keys**:

\`\`\`python run
person = {"name": "Ada", "age": 36}
print("name" in person)
print("email" in person)
\`\`\`

Looking up a key that isn't there raises a \`KeyError\`:

\`\`\`python run
person = {"name": "Ada"}
print(person["email"])
\`\`\`

When a key might be missing, use \`.get()\`. It returns \`None\` (or a default you choose) instead of failing:

\`\`\`python run
person = {"name": "Ada"}
print(person.get("email"))
print(person.get("email", "no email"))
print(person.get("name", "unknown"))
\`\`\`

> **Careful:** a \`KeyError\` is Python telling you "this key doesn't exist". The first suspect is a typo or a different spelling/case (\`"Name"\` vs \`"name"\`), and the second is that you never added the key. Pythia will often ask you which keys the dictionary really contains.

### Rules for keys

- Keys are **unique**: assigning to an existing key overwrites it.
- Keys must be **unchangeable**: strings, numbers and tuples work; lists don't.
- Values can repeat, and be any type.

\`\`\`python run
scores = {"Ada": 90, "Grace": 95}
scores["Ada"] = 91
print(scores)
\`\`\`

# Example: A tiny phone book

\`\`\`python example
phone = {"Ada": "555-0101", "Grace": "555-0102"}

phone["Linus"] = "555-0103"
phone["Ada"] = "555-9999"
del phone["Grace"]

print(phone)
print("Ada's number:", phone["Ada"])
print("Grace's number:", phone.get("Grace", "not found"))
print("Contacts:", len(phone))
\`\`\`

Each line changes or reads one entry. Notice \`get\` turning the missing \`"Grace"\` into a message instead of an error.

# Exercise: Build a record {#e1}

Create a dictionary called \`person\` with the keys \`"name"\` (value \`"Ada"\`) and \`"age"\` (value \`36\`).

\`\`\`python starter
# Create person
\`\`\`

\`\`\`python solution
person = {"name": "Ada", "age": 36}
\`\`\`

## Hints

1. Which brackets make a dictionary?
2. Each entry has two parts joined by a colon. Which part comes first?
3. \`{key: value, key: value}\`: the keys are the strings \`"name"\` and \`"age"\`.

## Explanation

Curly braces with \`key: value\` pairs make a dict. Both keys are strings, and the values are a string and an integer.

# Exercise: Update the record {#e2}

\`person = {"name": "Ada", "age": 36}\`. Change \`age\` to \`37\`, add the key \`"city"\` with the value \`"London"\`, and delete the \`"name"\` entry.

\`\`\`python starter
person = {"name": "Ada", "age": 36}

# Edit the dictionary
\`\`\`

\`\`\`python solution
person = {"name": "Ada", "age": 36}

person["age"] = 37
person["city"] = "London"
del person["name"]
\`\`\`

## Hints

1. Three edits: one changes a value, one adds an entry, one removes an entry.
2. Assigning to a key works for both changing and adding. Which statement removes?
3. Use \`person[key] = value\` twice and \`del person[key]\` once.

## Explanation

Assignment adds or overwrites; \`del\` removes. The final dict is \`{"age": 37, "city": "London"}\`.

# Exercise: Safe price lookup {#e3}

Define \`price_of(menu, item)\` that returns the price of \`item\` in the dictionary \`menu\`, or \`0\` if the item isn't on the menu.

\`\`\`python starter
# Define price_of(menu, item)
\`\`\`

\`\`\`python solution
def price_of(menu, item):
    return menu.get(item, 0)
\`\`\`

## Hints

1. What happens if you index the dictionary with a missing key?
2. A dictionary method can look up a key with a fallback. What is it called?
3. Call that method with the item and \`0\` as the default, and return the result.

## Explanation

\`menu.get(item, 0)\` returns the stored price when the key exists, and \`0\` otherwise, with no \`KeyError\`.

# Exercise: Swap keys and values {#e4}

Define \`invert(d)\` that returns a new dictionary with the keys and values swapped. You may assume the values are unique: \`invert({"a": 1, "b": 2})\` returns \`{1: "a", 2: "b"}\`.

\`\`\`python starter
# Define invert(d)
\`\`\`

\`\`\`python solution
def invert(d):
    result = {}
    for key in d:
        result[d[key]] = key
    return result
\`\`\`

## Hints

1. You're building a new dict, so where does it start?
2. Looping over a dict gives you its keys. What do you store for each?
3. Start with an empty dict; for each key, assign \`key\` under the key \`d[key]\`.

## Explanation

For each key in \`d\` we store the old key under the old value. Because the old values become keys, they must be unique and unchangeable for this to work.

# Quiz

## What happens with \`d = {"a": 1}; d["b"]\`?

- [ ] It returns \`None\`
- [x] A \`KeyError\`
- [ ] It adds \`"b"\`

Explanation: Reading a missing key is an error. Writing to a missing key (\`d["b"] = 2\`) is how you add it. Use \`d.get("b")\` for a safe read.

## What does \`"x" in {"x": 5}\` check?

- [x] Whether \`"x"\` is a key
- [ ] Whether \`"x"\` is a value
- [ ] Whether \`5\` is a key

Explanation: \`in\` looks at dictionary keys, which is also what makes it fast.

## Which of these can **not** be a dictionary key?

- [ ] \`"name"\`
- [ ] \`(1, 2)\`
- [x] \`[1, 2]\`

Explanation: Keys must be immutable. Lists can change, so Python refuses them as keys. A tuple of the same items is fine.
`,ne=`---
id: dict-iteration
module: ds-dicts
title: Looping over dictionaries
minutes: 15
goal: Loop over keys, values and items, count and group things with dictionaries, and sort by value.
summary: Walk through a dictionary, and use one to count and group data.
---

# Concept

### Three views

A \`for\` loop over a dictionary gives its **keys**. Two methods give the other views:

\`\`\`python run
stock = {"apples": 5, "pears": 0, "figs": 12}

for item in stock:
    print(item)
print("---")
for qty in stock.values():
    print(qty)
print("---")
for item, qty in stock.items():
    print(item, "->", qty)
\`\`\`

\`.items()\` gives \`(key, value)\` pairs you can unpack, which is the form you'll use most.

Dictionaries remember the order in which keys were added, so loops come out in that order.

### Counting with a dictionary

Counting how often each thing appears is *the* classic dictionary job. The pattern is "start from \`get(key, 0)\` and add one":

\`\`\`python run
text = "banana"
counts = {}
for letter in text:
    counts[letter] = counts.get(letter, 0) + 1
print(counts)
\`\`\`

For a new letter \`get\` gives 0, so it becomes 1; for a letter seen before it gives the old count and adds one. No \`KeyError\`, no special first-time case.

> **Careful:** writing \`counts[letter] += 1\` for a new key is a \`KeyError\`: there's nothing to add to yet. That's why the \`get(key, 0)\` pattern exists. Pythia will often ask: "what does the dictionary look like the *first* time you see a new key?"

### Grouping

Instead of counting, collect the items that share a key into lists:

\`\`\`python run
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    first = word[0]
    if first not in groups:
        groups[first] = []
    groups[first].append(word)
print(groups)
\`\`\`

Here we have to create the empty list the first time a key appears.

### Sorting a dictionary

\`sorted\` works on any iterable. To order by value, sort the items with a key:

\`\`\`python run
scores = {"Ada": 82, "Grace": 95, "Linus": 78}
ranked = sorted(scores.items(), key=lambda pair: pair[1], reverse=True)
print(ranked)
print(max(scores, key=scores.get))
\`\`\`

\`max(scores, key=scores.get)\` is a compact way to find the key with the largest value.

# Example: Word frequency

\`\`\`python example
text = "the cat and the hat and the bat"
counts = {}

for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, n in sorted(counts.items(), key=lambda p: p[1], reverse=True):
    print(word, n)
\`\`\`

\`split()\` turns the sentence into words, the loop counts them, and the final loop prints them with the most frequent first.

# Exercise: Total stock {#e1}

Define \`total_stock(stock)\` that returns the sum of all the **values** in a dictionary like \`{"apples": 5, "pears": 2}\`. Use a loop.

\`\`\`python starter
# Define total_stock(stock)
\`\`\`

\`\`\`python solution
def total_stock(stock):
    total = 0
    for qty in stock.values():
        total += qty
    return total
\`\`\`

## Hints

1. Which part of each entry do you need: the key or the value?
2. Is there a way to loop over just the values?
3. Start a total at 0 and add each value from the values view.

## Explanation

\`stock.values()\` yields only the quantities, which you add to a running total. An empty dictionary correctly gives 0.

# Exercise: Count the letters {#e2}

Define \`count_letters(text)\` that returns a dictionary mapping each character of \`text\` to how many times it appears: \`count_letters("aab")\` returns \`{"a": 2, "b": 1}\`.

\`\`\`python starter
# Define count_letters(text)
\`\`\`

\`\`\`python solution
def count_letters(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    return counts
\`\`\`

## Hints

1. You need one entry per distinct character, so what will the keys be, and what the values?
2. What should happen the first time a character appears? And the second?
3. For each character, store \`counts.get(ch, 0) + 1\` under that character in an initially empty dict.

## Explanation

\`get(ch, 0)\` gives the existing count or 0, and adding one updates it. The pattern handles first and later sightings in a single line.

# Exercise: Who scored most? {#e3}

Define \`top_scorer(scores)\` that returns the **name** (key) with the highest score in a non-empty dictionary. Scores are all different.

\`\`\`python starter
# Define top_scorer(scores)
\`\`\`

\`\`\`python solution
def top_scorer(scores):
    best_name = None
    best_score = None
    for name, score in scores.items():
        if best_score is None or score > best_score:
            best_name = name
            best_score = score
    return best_name
\`\`\`

## Hints

1. Keep track of the best entry seen so far while you loop.
2. What are the best-so-far name and score before you've seen anything?
3. Loop over the pairs; replace the best name and score whenever the current score is higher (or no best exists yet).

## Explanation

The loop remembers the best pair. Starting with \`None\` handles the first pair without inventing a fake minimum. (\`max(scores, key=scores.get)\` is a one-line alternative.)

# Exercise: Group by length {#e4}

Define \`group_by_length(words)\` that returns a dictionary mapping each word length to the **list of words** with that length, in their original order: \`group_by_length(["a", "bb", "c"])\` returns \`{1: ["a", "c"], 2: ["bb"]}\`.

\`\`\`python starter
# Define group_by_length(words)
\`\`\`

\`\`\`python solution
def group_by_length(words):
    groups = {}
    for word in words:
        n = len(word)
        if n not in groups:
            groups[n] = []
        groups[n].append(word)
    return groups
\`\`\`

## Hints

1. What is the key, and what kind of value do you store under it?
2. What must exist before you can append to a group for the first time?
3. If the length isn't a key yet, create an empty list for it; then append the word to that list.

## Explanation

The first word of each length creates the empty list, and every word then appends to its group. Words keep their original order within each list.

# Quiz

## What does \`for k in {"a": 1, "b": 2}:\` give you in \`k\`?

- [x] The keys: \`"a"\` then \`"b"\`
- [ ] The values: 1 then 2
- [ ] Pairs of key and value

Explanation: A plain loop over a dict visits the keys. Use \`.values()\` or \`.items()\` for the others.

## Why is \`counts[ch] += 1\` a bug for a character seen the first time?

- [ ] \`+=\` doesn't work on dictionaries
- [x] There's no existing value to add to, so it raises a \`KeyError\`
- [ ] It always adds 2

Explanation: \`+=\` reads the current value first. \`counts.get(ch, 0) + 1\` supplies a starting 0.

## What does \`max(d, key=d.get)\` return?

- [ ] The largest value
- [x] The key with the largest value
- [ ] The largest key

Explanation: \`max\` compares keys using each key's value (via \`d.get\`) and returns the winning key.
`,re=`---
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

\`\`\`python run
people = [
    {"name": "Ada", "age": 36},
    {"name": "Grace", "age": 85},
    {"name": "Linus", "age": 54},
]
print(people[0])
print(people[1]["name"])
for person in people:
    print(person["name"], "is", person["age"])
\`\`\`

Read \`people[1]["name"]\` left to right: *item 1 of the list* → *the \`"name"\` entry of that dict*.

### A dictionary of lists

Great for "one key, many things":

\`\`\`python run
courses = {
    "math": ["Ada", "Grace"],
    "art": ["Linus"],
}
print(courses["math"])
print(len(courses["math"]))
courses["art"].append("Margaret")
print(courses)
\`\`\`

### Navigate step by step

When a lookup looks scary, break it up. Each step gives you a simpler value:

\`\`\`python run
data = {"team": {"lead": {"name": "Ada", "skills": ["math", "code"]}}}

team = data["team"]
lead = team["lead"]
print(lead["name"])
print(lead["skills"][1])
print(data["team"]["lead"]["skills"][0])
\`\`\`

> **Careful:** when a nested lookup fails, find *which step* raised the error. A \`KeyError\` means a dict was missing the key; an \`IndexError\` means a list was too short; a \`TypeError: 'NoneType' ...\` often means an earlier step returned \`None\`. Pythia asks you to print the intermediate value.

### Processing records

Loops and the patterns from the last lessons work on every layer:

\`\`\`python run
people = [{"name": "Ada", "age": 36}, {"name": "Grace", "age": 85}]

names = []
for p in people:
    names.append(p["name"])
print(names)

total_age = 0
for p in people:
    total_age += p["age"]
print(total_age / len(people))
\`\`\`

### Copying nested data

\`copy()\` only copies the **outer** container. The inner lists and dicts are still shared. For a fully independent copy use \`copy.deepcopy\`:

\`\`\`python run
import copy

a = [[1, 2], [3]]
b = copy.deepcopy(a)
b[0].append(99)
print(a, b)
\`\`\`

# Example: A tiny gradebook

\`\`\`python example
students = [
    {"name": "Ada", "grades": [90, 85, 100]},
    {"name": "Grace", "grades": [70, 95]},
]

for s in students:
    average = sum(s["grades"]) / len(s["grades"])
    print(f"{s['name']}: {average:.1f}")

students[1]["grades"].append(100)
print(students[1])
\`\`\`

Each student is a dict, and each dict contains a list. \`s['name']\` uses single quotes inside the double-quoted f-string, which avoids clashing quotes.

# Exercise: List the names {#e1}

Define \`names(people)\` that takes a list of dictionaries (each with a \`"name"\` key) and returns a list of just the names.

\`\`\`python starter
# Define names(people)
\`\`\`

\`\`\`python solution
def names(people):
    result = []
    for person in people:
        result.append(person["name"])
    return result
\`\`\`

## Hints

1. You need one value from each record, collected into a new list.
2. What does each \`person\` in the loop look like, and how do you read one entry from it?
3. Start with an empty list, and append \`person["name"]\` for every person.

## Explanation

Each loop round gives one dict. Indexing it with \`"name"\` extracts that person's name, and \`append\` collects them in order.

# Exercise: Average age {#e2}

Define \`average_age(people)\` that returns the mean of the \`"age"\` values in a list of dictionaries. Return \`0\` for an empty list.

\`\`\`python starter
# Define average_age(people)
\`\`\`

\`\`\`python solution
def average_age(people):
    if len(people) == 0:
        return 0
    total = 0
    for person in people:
        total += person["age"]
    return total / len(people)
\`\`\`

## Hints

1. The mean needs a sum and a count. Which do you get from a loop, and which from a function?
2. What would dividing by \`len(people)\` do for an empty list?
3. Return 0 first if the list is empty; otherwise add all the ages in a loop and divide by the number of people.

## Explanation

The empty list is checked first so we never divide by zero. For other lists, the loop sums the ages and the division gives the mean.

# Exercise: Who's in the course? {#e3}

Define \`students_in(courses, course)\` where \`courses\` is a dictionary of lists like \`{"math": ["Ada"], "art": []}\`. Return the list for \`course\`, or an empty list if the course doesn't exist.

\`\`\`python starter
# Define students_in(courses, course)
\`\`\`

\`\`\`python solution
def students_in(courses, course):
    return courses.get(course, [])
\`\`\`

## Hints

1. A missing key should not crash your function. What dictionary method avoids that?
2. What should the fallback be, given that the function returns a list?
3. Look the course up with a default of an empty list.

## Explanation

\`courses.get(course, [])\` returns the stored list if there is one, and a fresh empty list otherwise.

# Exercise: The oldest person {#e4}

Define \`oldest(people)\` that returns the **whole dictionary** of the person with the greatest \`"age"\` in a non-empty list.

\`\`\`python starter
# Define oldest(people)
\`\`\`

\`\`\`python solution
def oldest(people):
    best = people[0]
    for person in people:
        if person["age"] > best["age"]:
            best = person
    return best
\`\`\`

## Hints

1. This is a "find the best" pattern. What is the first candidate?
2. What do you compare, and what do you remember when you find something better?
3. Start with the first person; replace it with any person whose age is greater; return the dict at the end.

## Explanation

Starting from \`people[0]\` and replacing the best-so-far whenever a larger age appears finds the maximum. The function returns the entire record, not just the age.

# Quiz

## Given \`data = {"a": [10, 20, 30]}\`, what is \`data["a"][1]\`?

- [ ] 10
- [x] 20
- [ ] \`[20]\`

Explanation: \`data["a"]\` is the list; index 1 of that list is the second item, 20.

## What is the effect of \`b = a.copy()\` for \`a = [[1], [2]]\` and then \`b[0].append(9)\`?

- [ ] \`a\` is unchanged
- [x] \`a\` also shows the 9
- [ ] An error

Explanation: \`copy()\` is shallow: the outer list is new, but the inner lists are shared. Use \`copy.deepcopy\` for a full copy.

## Which expression reads the second skill of the first person in \`people\`, where each person has a \`"skills"\` list?

- [ ] \`people["skills"][1][0]\`
- [x] \`people[0]["skills"][1]\`
- [ ] \`people[1]["skills"][0]\`

Explanation: First the list index 0 (first person), then the dict key \`"skills"\`, then the list index 1 (second skill).
`,ie=`---
id: sets
module: ds-sets
title: Sets
minutes: 13
goal: Use sets to remove duplicates, test membership quickly, and combine collections with union, intersection and difference.
summary: Unordered collections of unique items, great for "have I seen this?" and "what do these share?".
---

# Concept

A **set** holds *unique* items, in no particular order. You write one with curly braces, or make one from any other collection with \`set()\`:

\`\`\`python run
colors = {"red", "green", "blue", "red"}
print(colors)
print(len(colors))

numbers = set([3, 1, 3, 2, 1])
print(numbers)
\`\`\`

The duplicates vanished. That's the classic use: **removing duplicates**.

### Adding, removing, testing

\`\`\`python run
tags = {"python", "code"}
tags.add("learn")
tags.add("python")      # already there: nothing happens
tags.discard("code")    # no error if missing
print(tags)
print("python" in tags)
print("java" in tags)
\`\`\`

\`in\` on a set is extremely fast, even with millions of items, while \`in\` on a list has to check items one by one.

> **Careful:** \`{}\` on its own is an empty **dictionary**, not an empty set. Write \`set()\` for an empty set. Also, sets are unordered, so there is no \`tags[0]\`, and the order they print in may surprise you. If you need order, \`sorted(my_set)\` gives a list.

### Set operations

Sets work like the Venn diagrams from school:

| Expression | Meaning |
|---|---|
| \`a \\| b\` | **union**: everything in either |
| \`a & b\` | **intersection**: in both |
| \`a - b\` | **difference**: in \`a\` but not in \`b\` |
| \`a ^ b\` | in exactly one of them |

\`\`\`python run
python_fans = {"Ada", "Grace", "Linus"}
js_fans = {"Linus", "Brendan"}

print(sorted(python_fans | js_fans))
print(sorted(python_fans & js_fans))
print(sorted(python_fans - js_fans))
print(sorted(python_fans ^ js_fans))
\`\`\`

Methods work too: \`a.union(b)\`, \`a.intersection(b)\`, \`a.difference(b)\`, and the handy test \`a.issubset(b)\`.

### Items must be unchangeable

Like dictionary keys, set items must be hashable: strings, numbers and tuples are fine; lists aren't.

### Dedupe while keeping order

\`set(items)\` loses the order. To keep the first occurrence of each item, track what you've seen:

\`\`\`python run
items = ["b", "a", "b", "c", "a"]
seen = set()
unique = []
for item in items:
    if item not in seen:
        seen.add(item)
        unique.append(item)
print(unique)
\`\`\`

# Example: Comparing two classes

\`\`\`python example
class_a = {"Ada", "Grace", "Linus", "Margaret"}
class_b = {"Grace", "Margaret", "Alan"}

print("Both:", sorted(class_a & class_b))
print("Only A:", sorted(class_a - class_b))
print("Everyone:", len(class_a | class_b))
print("Is Grace in A?", "Grace" in class_a)
\`\`\`

Each operation answers a different "who?" question in one expression, which would take a loop with lists. We \`sorted()\` before printing to get a predictable order.

# Exercise: How many different? {#e1}

Define \`unique_count(items)\` that returns how many **different** items a list contains: \`unique_count([1, 2, 2, 3, 3, 3])\` is \`3\`.

\`\`\`python starter
# Define unique_count(items)
\`\`\`

\`\`\`python solution
def unique_count(items):
    return len(set(items))
\`\`\`

## Hints

1. Which collection automatically throws duplicates away?
2. Once duplicates are gone, how do you count what's left?
3. Convert the list to that collection, then take its length.

## Explanation

\`set(items)\` keeps one copy of each distinct value, and \`len\` counts them. An empty list gives 0.

# Exercise: In common {#e2}

Define \`common(a, b)\` that returns a **sorted list** of the items that appear in both lists \`a\` and \`b\`, with no duplicates.

\`\`\`python starter
# Define common(a, b)
\`\`\`

\`\`\`python solution
def common(a, b):
    return sorted(set(a) & set(b))
\`\`\`

## Hints

1. "In both" is a question about overlap. Which set operation answers it?
2. Sets have no order, but the function must return an ordered list. What can fix that?
3. Intersect the two sets and pass the result through \`sorted\`.

## Explanation

\`set(a) & set(b)\` is the intersection, which already has no duplicates. \`sorted(...)\` turns it into an ordered list.

# Exercise: Only in the first {#e3}

Define \`only_in_first(a, b)\` that returns a sorted list of the items in \`a\` that are **not** in \`b\`.

\`\`\`python starter
# Define only_in_first(a, b)
\`\`\`

\`\`\`python solution
def only_in_first(a, b):
    return sorted(set(a) - set(b))
\`\`\`

## Hints

1. This is the "except" question, and the order of the two collections matters.
2. Which set operator removes the items of one set from another?
3. Subtract the set of \`b\` from the set of \`a\`, then sort the result.

## Explanation

\`set(a) - set(b)\` keeps the items of \`a\` that don't appear in \`b\`. Swapping the operands would give a different answer.

# Exercise: Any repeats? {#e4}

Define \`has_duplicates(items)\` that returns \`True\` if any value appears more than once in the list, and \`False\` otherwise.

\`\`\`python starter
# Define has_duplicates(items)
\`\`\`

\`\`\`python solution
def has_duplicates(items):
    return len(set(items)) != len(items)
\`\`\`

## Hints

1. If there are no repeats, how does the number of distinct items compare to the total?
2. What changes when there *is* a repeat?
3. Compare the length of the set built from the list with the length of the list itself.

## Explanation

A list with no repeats has as many distinct items as items. Any repeat makes the set shorter, so the two lengths differ.

# Quiz

## What does \`{1, 2, 2, 3}\` contain?

- [ ] \`1, 2, 2, 3\`
- [x] \`1, 2, 3\`
- [ ] An error

Explanation: A set keeps just one copy of each value.

## How do you create an **empty** set?

- [ ] \`{}\`
- [x] \`set()\`
- [ ] \`[]\`

Explanation: \`{}\` creates an empty dictionary. Use \`set()\` for an empty set.

## What is \`{1, 2, 3} & {2, 3, 4}\`?

- [ ] \`{1, 2, 3, 4}\`
- [x] \`{2, 3}\`
- [ ] \`{1, 4}\`

Explanation: \`&\` is the intersection: just the items in both sets.
`,ae=`---
id: list-comprehensions
module: ds-comprehensions
title: List comprehensions
minutes: 14
goal: Build lists in one readable line with comprehensions, with and without a filter.
summary: Say what the new list should contain, instead of spelling out the loop.
---

# Concept

You've written this loop many times: start with an empty list, loop, append.

\`\`\`python run
squares = []
for n in range(1, 6):
    squares.append(n * n)
print(squares)
\`\`\`

A **list comprehension** does the same job in one line:

\`\`\`python run
squares = [n * n for n in range(1, 6)]
print(squares)
\`\`\`

Read it right to left, like a sentence: *"for each \`n\` in \`range(1, 6)\`, make \`n * n\`"*, all wrapped in \`[ ]\` to build a list.

\`\`\`diagram
{"type":"flow","caption":"[ n * n   for n in range(1, 6) ]","steps":[{"label":"for n in range(1, 6)","detail":"take each n"},{"label":"n * n","detail":"compute the item"},{"label":"[ ... ]","detail":"collect into a list"}]}
\`\`\`

### The shape

\`\`\`python
[ expression  for item in iterable ]
[ expression  for item in iterable  if condition ]
\`\`\`

- **expression**: what each new item looks like.
- **for ... in ...**: where the items come from.
- **if** (optional): keep only the items that pass.

### Transforming

\`\`\`python run
words = ["ada", "grace", "linus"]
print([w.upper() for w in words])
print([len(w) for w in words])
print([f"Hi {w.title()}" for w in words])
\`\`\`

### Filtering

Put the \`if\` at the end:

\`\`\`python run
nums = [5, -2, 8, -7, 3, 0]
print([n for n in nums if n > 0])
print([n * 2 for n in nums if n % 2 == 1])
\`\`\`

The first keeps items unchanged (expression is just \`n\`). The second filters *and* transforms.

### Choosing between two values

An \`if ... else\` *inside the expression* decides what each item becomes. Note it sits **before** the \`for\`:

\`\`\`python run
nums = [1, 2, 3, 4]
print(["even" if n % 2 == 0 else "odd" for n in nums])
\`\`\`

> **Careful:** a filter \`if\` goes at the **end** and removes items; an \`if/else\` for the value goes at the **front** and keeps every item. Mixing those up is the most common comprehension error. And if a comprehension is getting too long to read at a glance, write the loop instead: clarity beats cleverness.

# Example: Cleaning data

\`\`\`python example
raw = ["  Ada ", "", "grace", "  ", "LINUS"]

clean = [name.strip().title() for name in raw if name.strip()]
print(clean)

lengths = [len(name) for name in clean]
print(lengths)

print(sum([n for n in range(1, 101) if n % 3 == 0]))
\`\`\`

The first comprehension drops blank entries (the \`if name.strip()\` part) and tidies the rest. An empty string and a whitespace-only string are both "falsy" after stripping.

# Exercise: Squares {#e1}

Create \`squares\`, a list of the squares of the numbers \`1\` to \`10\`, using a list comprehension.

\`\`\`python starter
# Create squares
\`\`\`

\`\`\`python solution
squares = [n ** 2 for n in range(1, 11)]
\`\`\`

## Hints

1. Which two parts do you need: where the numbers come from, and what each becomes?
2. How do you include 10 in a \`range\`?
3. Write the expression for the square, then \`for n in range(...)\`, all inside square brackets.

## Explanation

\`range(1, 11)\` supplies 1 to 10, and \`n ** 2\` is each item. The result is \`[1, 4, 9, ..., 100]\`.

# Exercise: Only the evens {#e2}

Define \`evens(numbers)\` that returns a list of the even numbers from \`numbers\`, in order, using a comprehension.

\`\`\`python starter
# Define evens(numbers)
\`\`\`

\`\`\`python solution
def evens(numbers):
    return [n for n in numbers if n % 2 == 0]
\`\`\`

## Hints

1. You're keeping some items unchanged. What is the expression part?
2. How do you express "even" as a condition?
3. Put an \`if\` with the remainder test after the \`for\` part.

## Explanation

The expression is just \`n\`, and the trailing \`if n % 2 == 0\` filters out odd numbers. The original list isn't modified.

# Exercise: Word lengths {#e3}

Define \`lengths(words)\` that returns a list holding the length of each word.

\`\`\`python starter
# Define lengths(words)
\`\`\`

\`\`\`python solution
def lengths(words):
    return [len(word) for word in words]
\`\`\`

## Hints

1. Every word produces exactly one number.
2. Which function measures a word?
3. The expression is the measurement of each word, and the source is the list of words.

## Explanation

There's no filter: every word is kept, but each is replaced by its length.

# Exercise: Shout the long ones {#e4}

Define \`shout_long(words)\` that returns a list of the words **longer than 3 letters**, converted to upper case and followed by an exclamation mark: \`shout_long(["hi", "python", "code"])\` returns \`["PYTHON!", "CODE!"]\`.

\`\`\`python starter
# Define shout_long(words)
\`\`\`

\`\`\`python solution
def shout_long(words):
    return [w.upper() + "!" for w in words if len(w) > 3]
\`\`\`

## Hints

1. This one needs both a transformation and a filter.
2. Which part of the comprehension changes each item, and which part decides whether to keep it?
3. Put the upper-casing and the \`!\` in the expression, and the length test in the trailing \`if\`.

## Explanation

Items that fail \`len(w) > 3\` are skipped; those that pass are turned into \`w.upper() + "!"\`.

# Exercise: Label the numbers {#e5}

Define \`labels(numbers)\` that returns \`"positive"\` or \`"not positive"\` for each number: \`labels([3, -1, 0])\` returns \`["positive", "not positive", "not positive"]\`.

\`\`\`python starter
# Define labels(numbers)
\`\`\`

\`\`\`python solution
def labels(numbers):
    return ["positive" if n > 0 else "not positive" for n in numbers]
\`\`\`

## Hints

1. Every number must produce *an item*, so this isn't a filter.
2. How can the item itself depend on a condition?
3. Use the \`value_if_true if condition else value_if_false\` form as the expression, before the \`for\`.

## Explanation

The conditional expression sits in the *front* part of the comprehension and picks one of two strings, so every input gets exactly one output.

# Quiz

## What does \`[x * 2 for x in [1, 2, 3]]\` evaluate to?

- [ ] \`[1, 2, 3, 1, 2, 3]\`
- [x] \`[2, 4, 6]\`
- [ ] \`6\`

Explanation: Each item is doubled, and the results are collected in a new list.

## Which keeps only the positive numbers?

- [ ] \`[n if n > 0 for n in nums]\`
- [x] \`[n for n in nums if n > 0]\`
- [ ] \`[n > 0 for n in nums]\`

Explanation: A filter \`if\` goes at the end. The last option gives a list of \`True\`/\`False\` values instead.

## When should you prefer a plain loop?

- [ ] Never: comprehensions are always better
- [x] When the comprehension gets hard to read at a glance
- [ ] When the list is long

Explanation: Comprehensions are for short, clear transformations. Readability comes first.
`,oe=`---
id: dict-set-comprehensions
module: ds-comprehensions
title: Dict and set comprehensions
minutes: 13
goal: Build dictionaries and sets with comprehensions, and choose between a comprehension and a loop.
summary: The same one-line idea, for dictionaries and sets.
---

# Concept

The comprehension idea isn't limited to lists. Swap the brackets, and you build other collections.

### Dictionary comprehensions

Curly braces with \`key: value\` before the \`for\`:

\`\`\`python run
squares = {n: n * n for n in range(1, 6)}
print(squares)

words = ["ada", "grace", "linus"]
print({w: len(w) for w in words})
\`\`\`

Read it as: *"for each \`n\`, make the entry \`n → n * n\`"*.

### Filtering a dictionary

Loop over \`.items()\` and filter on key or value:

\`\`\`python run
scores = {"Ada": 92, "Grace": 78, "Linus": 85}
passed = {name: s for name, s in scores.items() if s >= 80}
print(passed)

curved = {name: s + 5 for name, s in scores.items()}
print(curved)
\`\`\`

### Inverting a dictionary

\`\`\`python run
codes = {"a": 1, "b": 2, "c": 3}
print({value: key for key, value in codes.items()})
\`\`\`

### Set comprehensions

Curly braces with a *single* expression: duplicates collapse automatically.

\`\`\`python run
words = ["apple", "fig", "pear", "kiwi", "plum"]
print({len(w) for w in words})
print(sorted({w[0] for w in words}))
\`\`\`

### Which brackets?

| Brackets | Inside | Builds |
|---|---|---|
| \`[ ... ]\` | \`expr for ...\` | a list |
| \`{ ... }\` | \`expr for ...\` | a set |
| \`{ ... }\` | \`key: value for ...\` | a dict |
| \`( ... )\` | \`expr for ...\` | a *generator*, which produces items lazily (see Intermediate Python) |

> **Careful:** \`{}\` is an empty dict, and \`{x for x in ...}\` is a set. A trailing colon inside the braces is the difference. If you get a dict when you wanted a set (or the other way round), look at whether there is a \`key: value\` pair.

### Nested comprehensions

A comprehension can have more than one \`for\`. They read in the **same order as nested loops**:

\`\`\`python run
pairs = [(a, b) for a in range(3) for b in range(2)]
print(pairs)
\`\`\`

That's equal to a loop over \`a\` with a loop over \`b\` inside it. Use this sparingly: two \`for\`s is about the readable limit.

# Example: Summarising orders

\`\`\`python example
orders = [
    ("Ada", 30), ("Grace", 45), ("Ada", 12), ("Linus", 8), ("Grace", 5),
]

totals = {}
for name, amount in orders:
    totals[name] = totals.get(name, 0) + amount
print(totals)

big_spenders = {name for name, total in totals.items() if total >= 40}
print(sorted(big_spenders))

labels = {name: ("VIP" if total >= 40 else "regular") for name, total in totals.items()}
print(labels)
\`\`\`

The totals need a loop (each order updates an entry). Once they exist, a set comprehension and a dict comprehension each answer a question in one line.

# Exercise: Square lookup {#e1}

Define \`square_map(n)\` that returns a dictionary mapping each whole number from \`1\` to \`n\` (inclusive) to its square: \`square_map(3)\` returns \`{1: 1, 2: 4, 3: 9}\`.

\`\`\`python starter
# Define square_map(n)
\`\`\`

\`\`\`python solution
def square_map(n):
    return {i: i * i for i in range(1, n + 1)}
\`\`\`

## Hints

1. Each number produces one dictionary entry. What are its key and value?
2. How do you include \`n\` itself in the range?
3. Curly braces, a \`key: value\` pair, then \`for i in range(1, n + 1)\`.

## Explanation

\`i: i * i\` makes an entry for each \`i\`, and \`n + 1\` makes the range include \`n\`.

# Exercise: Distinct lengths {#e2}

Define \`unique_lengths(words)\` that returns a **set** of the different word lengths in the list: \`unique_lengths(["a", "bb", "c"])\` returns \`{1, 2}\`.

\`\`\`python starter
# Define unique_lengths(words)
\`\`\`

\`\`\`python solution
def unique_lengths(words):
    return {len(w) for w in words}
\`\`\`

## Hints

1. The result must have no duplicates. Which collection guarantees that?
2. Which brackets and what form of comprehension builds that collection?
3. Curly braces with only an expression (no colon), for each word in the list.

## Explanation

A set comprehension adds each \`len(w)\`, and duplicate lengths collapse into one.

# Exercise: Keep the passes {#e3}

Define \`passed(scores, minimum)\` that returns a **dictionary** with only the entries of \`scores\` whose value is at least \`minimum\`.

\`\`\`python starter
# Define passed(scores, minimum)
\`\`\`

\`\`\`python solution
def passed(scores, minimum):
    return {name: s for name, s in scores.items() if s >= minimum}
\`\`\`

## Hints

1. You're filtering entries, so which view of the dictionary gives you both key and value?
2. What does the condition compare?
3. Loop over \`.items()\`, rebuild the same \`key: value\` pair, and keep it only if the value passes.

## Explanation

Looping over \`items()\` gives each name and score; the trailing \`if\` keeps the ones meeting the minimum. Keys and values come through unchanged.

# Exercise: Index the words {#e4}

Define \`first_letters(words)\` that returns a dictionary mapping each word to its **first letter**: \`first_letters(["ada", "bo"])\` returns \`{"ada": "a", "bo": "b"}\`.

\`\`\`python starter
# Define first_letters(words)
\`\`\`

\`\`\`python solution
def first_letters(words):
    return {w: w[0] for w in words}
\`\`\`

## Hints

1. Each word is a key. What is its value?
2. Which index gives the first character?
3. \`word: word[0]\` for each word in the list, inside curly braces.

## Explanation

The key is the word itself and the value is \`w[0]\`, its first character. (Words must be non-empty here, since \`""[0]\` is an \`IndexError\`.)

# Quiz

## What does \`{x: x * 2 for x in [1, 2]}\` build?

- [ ] A set
- [x] A dictionary \`{1: 2, 2: 4}\`
- [ ] A list

Explanation: The \`key: value\` pair before the \`for\` makes it a dictionary comprehension.

## What does \`{len(w) for w in ["a", "b", "cc"]}\` give?

- [ ] \`{1, 1, 2}\`
- [x] \`{1, 2}\`
- [ ] \`[1, 1, 2]\`

Explanation: It's a set comprehension, so the duplicate length 1 appears only once.

## What is \`{}\`?

- [ ] An empty set
- [x] An empty dictionary
- [ ] An error

Explanation: Use \`set()\` for an empty set. \`{}\` is an empty dict.
`,se=`---
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
| Unique items, "is it in there?", overlap | **set** | no duplicates, very fast \`in\`, set operations |

### The same task, two ways

*"Have we seen this word before?"* With a list, every \`in\` check scans the whole list. With a set it's instant:

\`\`\`python run
words = ["a", "b", "a", "c", "b"]
seen = set()
for w in words:
    if w in seen:
        print(w, "repeated")
    seen.add(w)
\`\`\`

*"What's the price of tea?"* A list of pairs forces a search; a dict answers directly:

\`\`\`python run
prices_list = [("tea", 3), ("cake", 5)]
prices_dict = {"tea": 3, "cake": 5}
print(prices_dict["tea"])
\`\`\`

### Combining containers

Real problems mix them. A dict of sets, a list of tuples, a dict of lists:

\`\`\`python run
friends = {"Ada": {"Grace", "Linus"}, "Grace": {"Ada"}, "Linus": {"Ada", "Grace"}}
print(sorted(friends["Ada"] & friends["Linus"]))   # friends in common
\`\`\`

\`\`\`python run
points = [(0, 0), (3, 4), (6, 8)]
distances = {p: (p[0] ** 2 + p[1] ** 2) ** 0.5 for p in points}
print(distances)
\`\`\`

Tuples are the keys there, because lists couldn't be.

> **Careful:** the most common mismatch is using a **list for lookup** (searching a long list again and again) when a dict or set would answer in one step, and the second is putting **mutable data where a key is needed** (\`TypeError: unhashable type: 'list'\`). When code feels slow or awkward, ask: "is this the right container for the question I keep asking?"

### A quick checklist

- Position matters → list (or tuple if fixed).
- Named parts of one thing → dict (or a tuple for tiny records).
- Counting or grouping → dict.
- Membership / duplicates / overlap → set.

# Example: Anagram groups

\`\`\`python example
words = ["listen", "silent", "enlist", "google", "gogole", "cat", "act"]

groups = {}
for word in words:
    key = "".join(sorted(word))      # same letters → same key
    groups.setdefault(key, []).append(word)

for key, group in groups.items():
    print(key, group)
\`\`\`

A dict of lists, keyed by the sorted letters of each word. \`setdefault(key, [])\` creates the empty list the first time a key appears. Words that are anagrams of each other land in the same group.

# Exercise: First repeat {#e1}

Define \`first_repeat(items)\` that returns the first item that has **already appeared earlier** in the list, or \`None\` if there are no repeats: \`first_repeat([3, 1, 4, 1, 5, 3])\` returns \`1\`.

\`\`\`python starter
# Define first_repeat(items)
\`\`\`

\`\`\`python solution
def first_repeat(items):
    seen = set()
    for item in items:
        if item in seen:
            return item
        seen.add(item)
    return None
\`\`\`

## Hints

1. As you walk through the list, what do you need to remember?
2. Which container answers "have I seen this?" fastest?
3. Keep a set of seen items; return an item as soon as it's already in the set, otherwise add it.

## Explanation

The set remembers everything seen so far. The first item found in the set is the first one to repeat (not the first duplicated value overall): in the example, \`1\` repeats at index 3 before \`3\` repeats at index 5.

# Exercise: Word frequencies {#e2}

Define \`word_counts(text)\` that returns a dictionary of how many times each word appears in \`text\`, ignoring capital letters: \`word_counts("the cat The hat")\` returns \`{"the": 2, "cat": 1, "hat": 1}\`.

\`\`\`python starter
# Define word_counts(text)
\`\`\`

\`\`\`python solution
def word_counts(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts
\`\`\`

## Hints

1. Which container is the right one for counting things by name?
2. What do you do to the text before splitting it, so that "The" and "the" match?
3. Lower-case the text, split it into words, and count each with \`get(word, 0) + 1\`.

## Explanation

\`text.lower().split()\` produces the words in one normalised case. The dictionary then counts each, as in the letter-counting exercise.

# Exercise: Top scorers {#e3}

Define \`top_n(scores, n)\` where \`scores\` is a dictionary of \`name -> score\`. Return a list of the names of the \`n\` highest scorers, **best first**. Scores are all different.

\`\`\`python starter
# Define top_n(scores, n)
\`\`\`

\`\`\`python solution
def top_n(scores, n):
    ranked = sorted(scores, key=scores.get, reverse=True)
    return ranked[:n]
\`\`\`

## Hints

1. You need the names in order of score. What can sort the keys, and what should it compare?
2. After sorting, how do you keep only the first few?
3. Sort the dictionary's keys by their values, descending; then take a slice of the first \`n\`.

## Explanation

\`sorted(scores, key=scores.get, reverse=True)\` sorts the names by their scores, highest first. Slicing \`[:n]\` keeps the top \`n\`; if \`n\` is larger than the number of names, you just get them all.

# Exercise: Shared interests {#e4}

Define \`shared(interests, a, b)\` where \`interests\` is a dictionary mapping a person to a **set** of interests. Return a **sorted list** of the interests that persons \`a\` and \`b\` have in common.

\`\`\`python starter
# Define shared(interests, a, b)
\`\`\`

\`\`\`python solution
def shared(interests, a, b):
    return sorted(interests[a] & interests[b])
\`\`\`

## Hints

1. What kind of values does the dictionary hold, and which operation finds overlap between two of them?
2. How do you get a person's interests out of the dictionary?
3. Look up both people, intersect their sets, and sort the result into a list.

## Explanation

Each lookup returns a set; \`&\` gives the intersection, and \`sorted\` converts it to a predictable list. Choosing sets for the values is exactly what makes this one line.

# Quiz

## You need to check "have I seen this?" a million times. Which is best?

- [ ] A list
- [x] A set
- [ ] A tuple

Explanation: \`in\` on a set takes (roughly) the same time however big it is. On a list it scans every item.

## Which can be a dictionary key?

- [ ] \`[1, 2]\`
- [x] \`(1, 2)\`
- [ ] \`{1, 2}\`

Explanation: Keys must be unchangeable. A tuple of numbers qualifies; lists and sets can change, so they don't.

## You want to store a person's name, age and city together as a fixed record. What fits well?

- [ ] A set
- [x] A tuple (or a dict if you want named fields)
- [ ] A list of their letters

Explanation: A fixed group of related values suits a tuple; if you want to refer to the parts by name, a dictionary is clearer.
`,ce=`---
id: hello-print
module: fnd-start
title: Your first program
minutes: 8
goal: Use print() to show text and numbers, and leave comments in code.
summary: Meet print(), strings and comments, and run your very first Python.
---

# Concept

A program is a list of instructions. Python reads them **one line at a time, from top to bottom**, and does what each one says. The simplest instruction shows a message on the screen: \`print()\`.

\`\`\`python run
print("Hello, world!")
\`\`\`

Press **Run**. Then change the words between the quotes and run it again. You cannot break anything here.

### Three things to notice

- \`print\` is a **function**: a named instruction. The parentheses \`( )\` hold what you want to hand to it.
- Text is wrapped in **quotes**. A piece of text is called a *string*. Single quotes and double quotes both work: \`'hi'\` and \`"hi"\`.
- Each \`print()\` starts a **new line**.

\`\`\`python run
print("First line")
print("Second line")
\`\`\`

### Printing several things at once

Separate values with commas and \`print\` puts a space between them:

\`\`\`python run
print("I am", 14, "years old")
\`\`\`

Numbers don't need quotes. \`14\` is a number. \`"14"\` is text that happens to look like one. Python treats them very differently, and we'll see why in the next lessons.

### Comments

Everything after a \`#\` is ignored by Python. Comments are notes for humans, including future you.

\`\`\`python run
# Python skips this whole line
print("Comments are free")  # you can also end a line with one
\`\`\`

> **Careful:** Python is picky about spelling and punctuation. \`Print\` with a capital P is not \`print\`, and a forgotten closing quote or bracket is the most common beginner error of all. When that happens, Pythia will ask you a question rather than hand you the fix.

# Example: Putting it together

Read this program top to bottom and predict what it prints before you run it.

\`\`\`python example
# A tiny program with three print calls
print("Python reads top to bottom.")
print("Next line:", 2 + 3)
print("It can even do maths!")
\`\`\`

Notice the second line. \`2 + 3\` is not in quotes, so Python **works it out** and prints \`5\`. If we wrote \`"2 + 3"\` in quotes, it would print the text \`2 + 3\` instead. Try it: add quotes and run again.

# Exercise: Say hello {#e1}

Write a program that prints exactly this message:

\`Hello, Pythia!\`

Capital letters, the comma and the exclamation mark all count.

\`\`\`python starter
# Print the message below
\`\`\`

\`\`\`python solution
print("Hello, Pythia!")
\`\`\`

## Hints

1. Which function shows text on the screen? You met it a minute ago.
2. What should go between the parentheses, and what must surround text so Python knows it is text?
3. The message needs quotes around it, and the whole thing goes inside the parentheses of \`print\`.

## Explanation

\`print("Hello, Pythia!")\` calls the \`print\` function and hands it one string. The quotes tell Python that everything inside is text to show exactly as written, so the capital letters, the comma and the \`!\` all come through.

# Exercise: Two lines {#e2}

Print two separate lines, using **two** \`print()\` calls:

\`\`\`text
Python is
fun
\`\`\`

\`\`\`python starter
# Two print calls, one per line
\`\`\`

\`\`\`python solution
print("Python is")
print("fun")
\`\`\`

## Hints

1. Each \`print()\` call ends its line automatically.
2. How many \`print()\` calls do you need if you want two lines?
3. Put \`"Python is"\` in the first call and \`"fun"\` in the second.

## Explanation

Every call to \`print\` finishes with a new line, so two calls give two lines. There is no need to type the line break yourself.

# Exercise: A sentence with a number {#e3}

Use **one** \`print()\` call with three comma-separated values to show this sentence:

\`I am 14 years old\`

The \`14\` should be a real number, not text in quotes.

\`\`\`python starter
# Print: I am 14 years old
\`\`\`

\`\`\`python solution
print("I am", 14, "years old")
\`\`\`

## Hints

1. Remember how commas work inside \`print\`: they put spaces between the pieces for you.
2. Which of the three pieces are text (need quotes) and which is a number (does not)?
3. Three pieces: the text \`"I am"\`, the number \`14\`, and the text \`"years old"\`.

## Explanation

\`print("I am", 14, "years old")\` hands \`print\` three values. It converts each to text and joins them with single spaces. Because \`14\` is written without quotes, Python sees it as a number, which matters as soon as you want to do arithmetic with it.

# Quiz

## What does \`print("5 + 3")\` show?

- [ ] 8
- [x] 5 + 3
- [ ] An error

Explanation: Anything inside quotes is text, so Python prints it exactly as written. Without quotes, \`print(5 + 3)\` would show 8.

## Which line is a comment?

- [ ] \`print("# hello")\`
- [x] \`# print("hello")\`
- [ ] \`print("hello") !\`

Explanation: A comment starts with \`#\` outside of quotes. In the first option the \`#\` is inside a string, so it is just part of the text that gets printed.

## What is wrong with \`print("Hello)\`?

- [ ] Nothing, it works
- [ ] \`print\` needs a capital letter
- [x] The string is missing its closing quote

Explanation: Python reads from the opening quote and never finds the matching one, so it reports a syntax error. Matching your quotes and brackets is a habit worth building early.
`,le='---\nid: variables\nmodule: fnd-start\ntitle: Variables\nminutes: 12\ngoal: Store values under names with =, read them back, and change them.\nsummary: Give values names, reuse them, and change them as your program runs.\n---\n\n# Concept\n\nA **variable** is a name attached to a value, so you can use the value again later. You create one with `=`:\n\n```python run\nage = 14\nprint(age)\n```\n\nRead `age = 14` as **"let the name `age` refer to the value `14`"**. The name goes on the left, the value on the right.\n\n```diagram\n{"type":"boxes","caption":"After running: name = \\"Ada\\", age = 14","items":[{"name":"name","value":"\\"Ada\\""},{"name":"age","value":"14"}]}\n```\n\n### `=` is not "equals"\n\nIn maths, `=` says two things are equal. In Python it is an **instruction**: *take the value on the right and store it under the name on the left.* That\'s why this makes sense in Python:\n\n```python run\nscore = 10\nscore = score + 5\nprint(score)\n```\n\nPython works out the right side first (`10 + 5 = 15`), then stores the result back under `score`. Variables can change; that\'s why they\'re called *variables*.\n\n### Using variables\n\nOnce a name exists, use it anywhere you could use the value:\n\n```python run\nprice = 4\nquantity = 3\nprint("Total:", price * quantity)\n```\n\n`*` means multiply. We\'ll meet all the operators in a later lesson.\n\n### Choosing names\n\n- Use letters, digits and underscores, and don\'t start with a digit: `total_score`, `player2`.\n- Names are **case-sensitive**: `Age` and `age` are two different names.\n- Pick names that explain themselves. `price` beats `p`.\n- By convention, Python names use `lower_snake_case`.\n\n> **Careful:** using a name that was never assigned stops your program with a `NameError`. If you see one, ask yourself: *was this name created before this line ran?*\n\n# Example: A receipt\n\nPredict the output, then run it. Which variable changes, and when?\n\n```python example\nitem = "notebook"\nprice = 3\nquantity = 4\n\ntotal = price * quantity\nprint(item, "x", quantity, "=", total)\n\nquantity = 5\nprint("After adding one more:", price * quantity)\nprint("But total is still", total)\n```\n\n`total` was calculated **once**, when that line ran, using the values `price` and `quantity` had at that moment. Changing `quantity` afterwards does not recalculate `total`. Variables hold values, not formulas.\n\n# Exercise: Your first variables {#e1}\n\nCreate two variables:\n\n- `name`, set to the text `"Ada"`\n- `age`, set to the number `14`\n\n```python starter\n# Create name and age below\n```\n\n```python solution\nname = "Ada"\nage = 14\n```\n\n## Hints\n\n1. A variable is created by assigning to a name. Which symbol does that?\n2. The name goes on the left of `=`. What goes on the right for each of the two variables?\n3. Text needs quotes and numbers don\'t, so `name` gets `"Ada"` with quotes and `age` gets a bare number.\n\n## Explanation\n\n`name = "Ada"` stores the string `Ada` under the name `name`. `age = 14` stores the number `14` under `age`. Two lines, two names, each pointing at its own value.\n\n# Exercise: Update a score {#e2}\n\nThe starter code gives `score` a first value. Add a line that **adds 5** to `score`, so that after your code runs, `score` is `15`.\n\n```python starter\nscore = 10\n# Add 5 to score here\n\nprint(score)\n```\n\n```python solution\nscore = 10\nscore = score + 5\n\nprint(score)\n```\n\n## Hints\n\n1. Think back to how the lesson changed `score` using its own old value.\n2. Python works out the right-hand side first. What is `score + 5` when `score` is 10?\n3. Assign the result back to the same name: `score` on the left, `score + 5` on the right.\n\n## Explanation\n\n`score = score + 5` reads the current value (10), adds 5 to get 15, then stores 15 back under the name `score`. The old value is replaced.\n\n# Exercise: Swap two values {#e3}\n\n`a` is `1` and `b` is `2`. Write code so that afterwards **`a` is `2` and `b` is `1`**. You\'ll need a third variable to hold one of the values temporarily.\n\n```python starter\na = 1\nb = 2\n\n# Swap them here\n```\n\n```python solution\na = 1\nb = 2\n\ntemp = a\na = b\nb = temp\n```\n\n## Hints\n\n1. If you write `a = b` straight away, what happens to the original value of `a`?\n2. Where could you keep `a`\'s value safe before overwriting it?\n3. Copy `a` into a spare variable first, then assign `a = b`, and finally give `b` the saved value.\n\n## Explanation\n\nAssigning `a = b` immediately would lose `a`\'s original value. So save it first: `temp = a`, then `a = b`, then `b = temp`. Think of juggling: you need a free hand for a moment. (Python also has a one-line trick for this, which you\'ll see later.)\n\n# Exercise: A total {#e4}\n\nYou have `price = 4` and `quantity = 3`. Create a variable `total` that is `price` times `quantity`, then print it.\n\n```python starter\nprice = 4\nquantity = 3\n\n# Create total and print it\n```\n\n```python solution\nprice = 4\nquantity = 3\n\ntotal = price * quantity\nprint(total)\n```\n\n## Hints\n\n1. You need a new variable. What name does the task give it?\n2. Which operator multiplies, and which two variables should it connect?\n3. `total = price * quantity`, followed by a `print` of `total`.\n\n## Explanation\n\n`price * quantity` is evaluated to `12` and stored under the new name `total`. Then `print(total)` shows `12`. Using the variables instead of the numbers 4 and 3 means the line still works if the price changes.\n\n# Quiz\n\n## After `x = 5` and then `x = x + 1`, what is `x`?\n\n- [ ] 5\n- [x] 6\n- [ ] It is an error, because `x` can\'t equal `x + 1`\n\nExplanation: `=` is an instruction, not a claim of equality. Python computes `x + 1` (6) from the current value, then stores it back in `x`.\n\n## Which is a valid variable name?\n\n- [ ] `2nd_place`\n- [ ] `my score`\n- [x] `my_score`\n\nExplanation: Names can\'t start with a digit or contain spaces. Underscores are the standard way to join words.\n\n## What does this print?\n\n```python\nn = 3\ndoubled = n * 2\nn = 10\nprint(doubled)\n```\n\n- [ ] 20\n- [x] 6\n- [ ] 3\n\nExplanation: `doubled` was calculated when `n` was 3. Changing `n` later does not recompute it, because variables store values, not formulas.\n',ue='---\nid: data-types\nmodule: fnd-start\ntitle: Types of values\nminutes: 12\ngoal: Tell integers, floats, strings and booleans apart, and convert between them.\nsummary: Every value has a type. Learn the four basic ones and how to convert between them.\n---\n\n# Concept\n\nEvery value in Python has a **type**, which decides what you can do with it. You can ask Python for it with `type()`:\n\n```python run\nprint(type(42))\nprint(type(3.14))\nprint(type("hello"))\nprint(type(True))\n```\n\nThese are the four basic types:\n\n| Type | Name | Examples |\n|---|---|---|\n| `int` | whole number | `7`, `-3`, `0` |\n| `float` | number with a decimal point | `2.5`, `-0.1`, `3.0` |\n| `str` | text (a *string*) | `"hi"`, `\'42\'`, `""` |\n| `bool` | true or false | `True`, `False` |\n\n### Same look, different meaning\n\n`5` and `"5"` look alike but are different things. Watch what `+` does:\n\n```python run\nprint(5 + 3)\nprint("5" + "3")\n```\n\nNumbers add. Strings **join**. Python never guesses which you meant, so mixing them is an error:\n\n```python run\nprint("Age: " + 14)\n```\n\nRead the last line of that error. Python is telling you the two types it could not combine.\n\n### Converting between types\n\nUse the type\'s name as a function to convert:\n\n```python run\nage_text = "14"\nage = int(age_text)\nprint(age + 1)\nprint("You are " + str(age) + " years old")\nprint(float("2.5") * 2)\n```\n\n- `int(...)` makes a whole number (it cuts off decimals: `int(3.9)` is `3`).\n- `float(...)` makes a decimal number.\n- `str(...)` makes text.\n\n> **Careful:** `int("hello")` fails with a `ValueError`, because `"hello"` doesn\'t look like a number. Conversion only works when the text really does hold a number.\n\n# Example: Converting a price\n\nPredict each line\'s output, then run it.\n\n```python example\nprice_text = "4"\nquantity = 3\n\ntotal = int(price_text) * quantity\nprint(total)\nprint(type(total))\n\nlabel = "Total: " + str(total)\nprint(label)\nprint(type(label))\n```\n\n`price_text` is a string, so multiplying needs `int()` first. The result `total` is an `int`. To glue a number onto text, convert it with `str()`. Notice that converting makes a **new** value; `price_text` itself is unchanged.\n\n# Exercise: One of each type {#e1}\n\nCreate four variables, each with the right **type**:\n\n- `count`: the whole number `7`\n- `price`: the decimal number `2.5`\n- `label`: the text `"apples"`\n- `in_stock`: the boolean `True`\n\n```python starter\n# Create count, price, label and in_stock\n```\n\n```python solution\ncount = 7\nprice = 2.5\nlabel = "apples"\nin_stock = True\n```\n\n## Hints\n\n1. Each value has a different look: some have quotes, some have a dot, one is a keyword.\n2. Which of the four values would Python print `<class \'float\'>` for?\n3. Text goes in quotes. The boolean is written `True` with a capital T and no quotes.\n\n## Explanation\n\n`7` is an `int`, `2.5` a `float`, `"apples"` a `str`, and `True` a `bool`. Quotes make text, a decimal point makes a float, and `True`/`False` are special keywords, so they are written without quotes.\n\n# Exercise: Text to number {#e2}\n\n`age_text` holds the **text** `"21"`. Create `age` as the same value as a real number, then create `next_year` as `age` plus one.\n\n```python starter\nage_text = "21"\n\n# Create age and next_year\n```\n\n```python solution\nage_text = "21"\n\nage = int(age_text)\nnext_year = age + 1\n```\n\n## Hints\n\n1. `age_text + 1` fails. Why? What would you need to do to `age_text` first?\n2. Which of `int()`, `float()` and `str()` turns text into a whole number?\n3. Wrap `age_text` in the conversion function to make `age`, then add one to `age`.\n\n## Explanation\n\n`int(age_text)` creates a new integer, `21`, from the text. After that `age + 1` is ordinary arithmetic and gives `22`. Doing the maths on the text version would have been a `TypeError`.\n\n# Exercise: Build a message {#e3}\n\n`score` is the number `95`. Create a string `message` that reads exactly `Score: 95`, built from the text `"Score: "` and the variable `score`.\n\n```python starter\nscore = 95\n\n# Create message\n```\n\n```python solution\nscore = 95\n\nmessage = "Score: " + str(score)\n```\n\n## Hints\n\n1. Joining text and a number with `+` is a `TypeError`. What do the two sides have in common after you fix that?\n2. Which conversion turns a number into text?\n3. Convert `score` to a string, then join it to `"Score: "` with `+`.\n\n## Explanation\n\n`"Score: " + score` fails because `+` won\'t mix a string and an int. `str(score)` turns `95` into `"95"`, and then joining two strings works: `"Score: 95"`.\n\n# Quiz\n\n## What does `print("5" + "3")` show?\n\n- [ ] 8\n- [x] 53\n- [ ] An error\n\nExplanation: Both values are strings, so `+` joins them. Python only does arithmetic when both sides are numbers.\n\n## Which type is `3.0`?\n\n- [ ] `int`\n- [x] `float`\n- [ ] `str`\n\nExplanation: The decimal point makes it a float, even though the value is a whole number.\n\n## What happens with `int("hello")`?\n\n- [ ] It returns 0\n- [ ] It returns the text unchanged\n- [x] It raises a `ValueError`\n\nExplanation: `int()` only converts text that actually looks like a whole number. Anything else is a `ValueError`.\n',de='---\nid: arithmetic\nmodule: fnd-input\ntitle: Arithmetic\nminutes: 12\ngoal: Use the arithmetic operators, including // and %, and predict how Python orders operations.\nsummary: Python as a calculator, plus the operators that surprise people: / vs // and %.\n---\n\n# Concept\n\nPython is a very good calculator. The operators:\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| `+` `-` | add, subtract | `7 - 2` | `5` |\n| `*` | multiply | `3 * 4` | `12` |\n| `/` | divide | `7 / 2` | `3.5` |\n| `//` | floor-divide (whole part only) | `7 // 2` | `3` |\n| `%` | remainder | `7 % 2` | `1` |\n| `**` | power | `2 ** 3` | `8` |\n\n```python run\nprint(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 10)\n```\n\n### Two divisions\n\n`/` **always** gives a float, even when the answer is whole: `8 / 2` is `4.0`. `//` throws away the fraction and gives the whole part. Together with `%` they split a number into "how many fit" and "what\'s left":\n\n```python run\nminutes = 135\nprint(minutes // 60, "hours and", minutes % 60, "minutes")\n```\n\n> **Careful:** `//` rounds *down*, not toward zero. `-7 // 2` is `-4`, not `-3`. If a loop or a split looks off by one for negative numbers, this is usually why.\n\n### Order of operations\n\nPython follows the maths rules you know: `**` first, then `*` `/` `//` `%`, then `+` `-`. Use parentheses to be explicit:\n\n```python run\nprint(2 + 3 * 4)\nprint((2 + 3) * 4)\n```\n\nA classic slip is an average: `6 + 8 + 10 / 3` divides **only the 10**. Parenthesise the sum first.\n\n### Shortcuts\n\n`x += 1` means `x = x + 1`. There are matching `-=`, `*=`, `/=`.\n\n```python run\ntotal = 10\ntotal += 5\ntotal *= 2\nprint(total)\n```\n\n# Example: Splitting a bill\n\nPredict the output before you run it.\n\n```python example\nbill = 47\npeople = 4\n\neach = bill // people\nleft_over = bill % people\n\nprint("Each person pays", each)\nprint("Left over:", left_over)\nprint("Exact share:", bill / people)\n```\n\n`//` and `%` tell the whole story in whole numbers: 4 people can each pay 11 and 3 is left over. `/` gives the exact share, `11.75`.\n\n# Exercise: Seconds in a shift {#e1}\n\nA shift lasts `hours` hours and `minutes` minutes. Create `total_seconds` for the whole shift.\n\n```python starter\nhours = 2\nminutes = 15\n\n# Create total_seconds\n```\n\n```python solution\nhours = 2\nminutes = 15\n\ntotal_seconds = (hours * 60 + minutes) * 60\n```\n\n## Hints\n\n1. How many seconds are in a minute? In an hour?\n2. You could convert everything to minutes first. Which operation needs parentheses so it happens before the next one?\n3. Add the minutes from the hours to the extra minutes, then convert the total minutes to seconds.\n\n## Explanation\n\n2 hours is 120 minutes; plus 15 gives 135 minutes; times 60 gives 8100 seconds. The parentheses make Python add before it multiplies by 60.\n\n# Exercise: Share the sweets {#e2}\n\n`sweets = 17` are shared equally between `children = 5`. Create `each` (how many sweets every child gets) and `left_over` (how many remain).\n\n```python starter\nsweets = 17\nchildren = 5\n\n# Create each and left_over\n```\n\n```python solution\nsweets = 17\nchildren = 5\n\neach = sweets // children\nleft_over = sweets % children\n```\n\n## Hints\n\n1. You need whole sweets only, so which division would keep just the whole part?\n2. And which operator tells you what is left after sharing?\n3. One operator for each variable: floor division for `each`, remainder for `left_over`.\n\n## Explanation\n\n`17 // 5` is `3` (three whole sweets each) and `17 % 5` is `2` (two left over). Notice that `3 * 5 + 2 == 17`: the two answers always rebuild the original number.\n\n# Exercise: Squares and cubes {#e3}\n\n`side = 4`. Create `area` (side squared) and `volume` (side cubed) using the power operator.\n\n```python starter\nside = 4\n\n# Create area and volume\n```\n\n```python solution\nside = 4\n\narea = side ** 2\nvolume = side ** 3\n```\n\n## Hints\n\n1. Squaring means multiplying a number by itself. Which operator does repeated multiplication in one go?\n2. How do you say "to the power of 2" and "to the power of 3"?\n3. Use `**` with a different exponent for each variable.\n\n## Explanation\n\n`side ** 2` is `4 * 4 = 16` and `side ** 3` is `4 * 4 * 4 = 64`. `**` takes the exponent on its right.\n\n# Exercise: Fix the average {#e4}\n\nThis code is supposed to calculate the average of 6, 8 and 10, which is `8.0`, but it gives the wrong answer. Fix the expression.\n\n```python starter\naverage = 6 + 8 + 10 / 3\n```\n\n```python solution\naverage = (6 + 8 + 10) / 3\n```\n\n## Hints\n\n1. Work out by hand which number gets divided by 3 in the current line.\n2. Which operation should happen first, and how do you force that order?\n3. The three numbers should be added together as a group before the division.\n\n## Explanation\n\nDivision binds tighter than addition, so `6 + 8 + 10 / 3` is `6 + 8 + 3.33...`. Putting the sum in parentheses makes Python add first: `24 / 3 = 8.0`.\n\n# Quiz\n\n## What is `7 // 2`?\n\n- [ ] 3.5\n- [x] 3\n- [ ] 4\n\nExplanation: `//` keeps only the whole part of the division, so 7 // 2 is 3. `/` would give 3.5.\n\n## What is `2 + 3 * 4`?\n\n- [ ] 20\n- [x] 14\n- [ ] 24\n\nExplanation: Multiplication happens before addition: 3 * 4 is 12, plus 2 gives 14. Write `(2 + 3) * 4` if you want 20.\n\n## What is `10 % 3`?\n\n- [ ] 3\n- [x] 1\n- [ ] 0.333\n\nExplanation: `%` is the remainder: 3 fits into 10 three times (9) and leaves 1.\n',fe=`---
id: strings
module: fnd-input
title: Working with text
minutes: 13
goal: Join, repeat, measure, index and slice strings.
summary: Strings are sequences of characters. Join them, count them, and cut out pieces.
---

# Concept

You met strings already: text in quotes. Python gives you a small toolkit for combining and picking apart text.

### Joining and repeating

\`+\` joins two strings. \`*\` repeats one:

\`\`\`python run
first = "Ada"
last = "Lovelace"
print(first + " " + last)
print("ha" * 3)
print("-" * 20)
\`\`\`

### Length

\`len()\` counts the characters, including spaces:

\`\`\`python run
print(len("hello"))
print(len("hello world"))
\`\`\`

### Indexing: one character

Each character has a position called an **index**, counted from **0**. Negative indexes count from the end.

\`\`\`diagram
{"type":"strip","caption":"The string \\"python\\": index 0 is the first letter, -1 is the last","cells":["p","y","t","h","o","n"],"highlight":[0],"negative":true}
\`\`\`

\`\`\`python run
word = "python"
print(word[0])
print(word[2])
print(word[-1])
\`\`\`

### Slicing: a piece

\`text[start:stop]\` takes characters from \`start\` up to, **but not including**, \`stop\`. Leave either side empty to mean "from the beginning" or "to the end".

\`\`\`python run
word = "python"
print(word[1:4])
print(word[:2])
print(word[3:])
print(word[::-1])
\`\`\`

The last one uses a *step* of \`-1\`, which walks backwards and so reverses the string.

> **Careful:** \`word[6]\` on a six-letter word fails with an \`IndexError\`: the valid indexes are 0 to 5. Off-by-one slips with indexes are among the most common bugs in programming, and Pythia will often ask you which index you meant.

Strings are **immutable**: you can't change a character in place. \`word[0] = "P"\` is an error. Instead you build a new string.

# Example: Initials

Predict the output before you run it.

\`\`\`python example
first = "grace"
last = "hopper"

initials = first[0] + last[0]
print(initials)
print(first[0].upper() + first[1:])
print(len(first + last))
\`\`\`

\`first[0]\` is \`"g"\`, so \`first[0] + last[0]\` is \`"gh"\`. \`first[1:]\` is everything after the first letter. Methods like \`.upper()\` come in the next lesson.

# Exercise: Pick letters {#e1}

For \`word = "python"\`, create three variables: \`first\` (the first letter), \`last\` (the last letter) and \`size\` (how many letters).

\`\`\`python starter
word = "python"

# Create first, last and size
\`\`\`

\`\`\`python solution
word = "python"

first = word[0]
last = word[-1]
size = len(word)
\`\`\`

## Hints

1. Indexes start counting from a particular number. Which one?
2. How can you refer to the last character without knowing how long the word is?
3. Use an index for each letter, and a function that counts characters for the size.

## Explanation

\`word[0]\` is the first character and \`word[-1]\` the last, which works for any length. \`len(word)\` counts the characters: 6.

# Exercise: Cut it up {#e2}

Using slices of \`word = "python"\`, create \`start\` (the first three letters) and \`end\` (the last three letters).

\`\`\`python starter
word = "python"

# Create start and end
\`\`\`

\`\`\`python solution
word = "python"

start = word[:3]
end = word[3:]
\`\`\`

## Hints

1. A slice has a start and a stop, separated by a colon. Where does the cut fall between the two halves?
2. Is the character at the stop index included in the slice?
3. Both halves meet at index 3: one slice stops there, the other starts there.

## Explanation

\`word[:3]\` runs from the beginning up to (not including) index 3: \`"pyt"\`. \`word[3:]\` runs from index 3 to the end: \`"hon"\`. Together they rebuild the word exactly.

# Exercise: A banner {#e3}

Print this three-line banner. Use the repeat operator \`*\` rather than typing the equals signs:

\`\`\`text
====================
Pythia
====================
\`\`\`

\`\`\`python starter
# Print the banner
\`\`\`

\`\`\`python solution
print("=" * 20)
print("Pythia")
print("=" * 20)
\`\`\`

## Hints

1. Typing twenty \`=\` characters is error-prone. Which operator repeats a string?
2. What are the two operands of that operator here?
3. Print \`"="\` repeated 20 times, then \`"Pythia"\`, then the same repetition again.

## Explanation

\`"=" * 20\` creates a string of 20 equals signs. Writing it as an expression means you can change the width in one place.

# Exercise: Swap the halves {#e4}

\`word = "pythia"\` has six letters. Create \`swapped\`, the word with its two halves exchanged: the last three letters followed by the first three (\`"hiapyt"\`).

\`\`\`python starter
word = "pythia"

# Create swapped
\`\`\`

\`\`\`python solution
word = "pythia"

swapped = word[3:] + word[:3]
\`\`\`

## Hints

1. You need two slices and one operator that joins strings.
2. Where is the middle of a six-letter word?
3. Take everything from index 3 to the end, then add everything before index 3.

## Explanation

\`word[3:]\` is \`"hia"\` and \`word[:3]\` is \`"pyt"\`. Joining them in the opposite order with \`+\` gives \`"hiapyt"\`.

# Quiz

## What is \`"python"[1]\`?

- [ ] \`"p"\`
- [x] \`"y"\`
- [ ] \`"t"\`

Explanation: Indexes start at 0, so index 0 is \`"p"\` and index 1 is \`"y"\`.

## What is \`"hello"[1:3]\`?

- [ ] \`"hel"\`
- [ ] \`"ell"\`
- [x] \`"el"\`

Explanation: The slice starts at index 1 (\`"e"\`) and stops *before* index 3, so it holds indexes 1 and 2: \`"el"\`.

## What does \`"ab" * 3\` give?

- [ ] \`"ab3"\`
- [x] \`"ababab"\`
- [ ] An error

Explanation: Multiplying a string by an integer repeats it.
`,pe='---\nid: string-methods\nmodule: fnd-input\ntitle: String methods and f-strings\nminutes: 14\ngoal: Clean up text with methods and build messages with f-strings.\nsummary: Built-in text tools, and the cleanest way to put values into a sentence.\n---\n\n# Concept\n\nA **method** is a function that belongs to a value. You call it with a dot: `value.method()`. Strings come with dozens.\n\n```python run\nname = "  ada LOVELACE  "\nprint(name.strip())\nprint(name.lower())\nprint(name.upper())\nprint(name.strip().title())\n```\n\nMethods return a **new** string and leave the original alone (strings are immutable), so you can chain them: `name.strip().title()` strips first, then title-cases the result.\n\n### Handy ones\n\n| Method | What it does |\n|---|---|\n| `s.strip()` | remove spaces from both ends |\n| `s.lower()` / `s.upper()` / `s.title()` | change case |\n| `s.replace(old, new)` | swap every `old` for `new` |\n| `s.startswith(x)` / `s.endswith(x)` | `True` or `False` |\n| `s.count(x)` | how many times `x` appears |\n| `s.find(x)` | index of the first `x`, or `-1` if absent |\n\n```python run\nsentence = "the cat sat on the mat"\nprint(sentence.replace("cat", "dog"))\nprint(sentence.count("the"))\nprint(sentence.find("sat"))\nprint(sentence.startswith("the"))\n```\n\n### `in` for "contains"\n\n```python run\nprint("cat" in "concatenate")\nprint("dog" in "concatenate")\n```\n\n### f-strings: values inside text\n\nPut an `f` before the quote, and anything in `{curly braces}` is evaluated and inserted. It\'s much tidier than joining with `+` and `str()`.\n\n```python run\nname = "Ada"\nage = 36\nprint(f"{name} is {age} years old")\nprint(f"Next year: {age + 1}")\n```\n\nYou can control the format after a colon. `:.2f` means "a float with 2 decimals":\n\n```python run\nprice = 3.14159\nprint(f"Price: ${price:.2f}")\nprint(f"{1234567:,}")\n```\n\n> **Careful:** forgetting the `f` in front is a classic. `"{name}"` prints the braces literally. If your output shows `{name}`, look at the start of the string.\n\n# Example: Tidying a name tag\n\nPredict the output.\n\n```python example\nraw = "   gRACE hOPPER "\nclean = raw.strip().title()\n\nprint(clean)\nprint(f"Hello, {clean}!")\nprint(f"Your name has {len(clean)} characters.")\nprint(f"Initials: {clean[0]}{clean[clean.find(\' \') + 1]}")\n```\n\n`.strip().title()` fixes spaces and capitals in one go. The f-string can hold any expression, even a slice or a method call.\n\n# Exercise: Clean a name {#e1}\n\n`name` is messy. Create `clean`, the name with the spaces around it removed and every word capitalised: `"Ada Lovelace"`.\n\n```python starter\nname = "  ada lovelace  "\n\n# Create clean\n```\n\n```python solution\nname = "  ada lovelace  "\n\nclean = name.strip().title()\n```\n\n## Hints\n\n1. Two things are wrong with `name`: its edges and its capital letters.\n2. Methods can be chained: each one works on the result of the one before.\n3. Look for a method that removes surrounding spaces, and another that capitalises each word.\n\n## Explanation\n\n`name.strip()` gives `"ada lovelace"`, and `.title()` capitalises the first letter of each word: `"Ada Lovelace"`.\n\n# Exercise: A sentence from variables {#e2}\n\nGiven `name = "Ada"` and `age = 36`, print exactly `Ada is 36 years old`, using an **f-string**.\n\n```python starter\nname = "Ada"\nage = 36\n\n# Print the sentence\n```\n\n```python solution\nname = "Ada"\nage = 36\n\nprint(f"{name} is {age} years old")\n```\n\n## Hints\n\n1. A normal string can\'t see your variables. What one-letter prefix changes that?\n2. Where do the variable names go inside the text?\n3. Start the string with `f` and put each variable name in curly braces.\n\n## Explanation\n\nIn `f"{name} is {age} years old"`, Python replaces `{name}` and `{age}` with their values. No `str()` or `+` needed.\n\n# Exercise: Format a price {#e3}\n\n`price = 3.14159`. Print exactly `Price: $3.14` using an f-string with a format specifier.\n\n```python starter\nprice = 3.14159\n\n# Print the formatted price\n```\n\n```python solution\nprice = 3.14159\n\nprint(f"Price: ${price:.2f}")\n```\n\n## Hints\n\n1. The number has too many decimals. Is the fix in the number or in how it is shown?\n2. What do you put after the variable name, following a colon, inside the braces?\n3. `.2f` means two digits after the decimal point. The dollar sign is just text.\n\n## Explanation\n\n`{price:.2f}` formats the value as a float with exactly two decimals, rounding `3.14159` to `3.14`. The `$` before it is plain text.\n\n# Exercise: Swap a word {#e4}\n\n`sentence = "I like cats. Cats are great."` Create `new_sentence` where every lowercase `cats` becomes `dogs` (the capital `Cats` stays as it is).\n\n```python starter\nsentence = "I like cats. Cats are great."\n\n# Create new_sentence\n```\n\n```python solution\nsentence = "I like cats. Cats are great."\n\nnew_sentence = sentence.replace("cats", "dogs")\n```\n\n## Hints\n\n1. You want to substitute one piece of text for another throughout the sentence.\n2. Is `sentence` itself changed by a method, or do you get something back?\n3. A method with two arguments: what to look for, and what to put instead. Keep the result in the new variable.\n\n## Explanation\n\n`replace("cats", "dogs")` returns a new string with each match swapped. It is case-sensitive, so `"Cats"` is untouched, and `sentence` itself never changes.\n\n# Quiz\n\n## What does `"Hello".lower()` return?\n\n- [ ] It changes `"Hello"` to `"hello"` in place\n- [x] A new string, `"hello"`\n- [ ] `"HELLO"`\n\nExplanation: String methods never modify the original. They return a new string.\n\n## What is `f"{2 + 3}"`?\n\n- [ ] `"{2 + 3}"`\n- [ ] `"2 + 3"`\n- [x] `"5"`\n\nExplanation: Anything inside the braces is evaluated, so `2 + 3` becomes `5`.\n\n## What does `"banana".count("an")` return?\n\n- [ ] 1\n- [x] 2\n- [ ] 3\n\nExplanation: "an" appears twice in b**an**·**an**·a.\n',me=`---
id: input-and-output
module: fnd-input
title: Input and output
minutes: 12
goal: Read answers with input(), convert them, and control how print() formats its output.
summary: Make your programs interactive: ask questions, use the answers, shape what you print.
---

# Concept

So far every value was written into the program. \`input()\` lets the **user** supply one while it runs. It shows a question (the *prompt*), waits for a line of typing, and gives you back what was typed:

\`\`\`python run
name = input("What is your name? ")
print("Hello,", name)
\`\`\`

Run it, type something into the console and press Enter.

### input() always gives text

Whatever the user types, \`input()\` returns a **string**, even if they type digits. To do arithmetic, convert it:

\`\`\`python run
text = input("How old are you? ")
age = int(text)
print("Next year you will be", age + 1)
\`\`\`

You'll often see the two steps combined: \`age = int(input("How old are you? "))\`.

> **Careful:** \`input("Number: ") + 1\` raises a \`TypeError\`, because it's text plus a number. If Pythia asks "what type is that value?", this is often the reason. And \`int("abc")\` is a \`ValueError\`: converting only works when the text looks like a number.

### Shaping print

\`print\` takes two optional named arguments:

- \`sep\` is what goes **between** values (default: one space).
- \`end\` is what goes **after** the last value (default: a new line).

\`\`\`python run
print("a", "b", "c", sep="-")
print("Loading", end="")
print("...")
print("2026", "01", "15", sep="/")
\`\`\`

### Putting it together

\`\`\`python run
price = float(input("Price: "))
quantity = int(input("How many? "))
print(f"Total: {price * quantity:.2f}")
\`\`\`

\`float()\` accepts decimals like \`2.5\`. The f-string formats the total with two decimals.

# Example: A tip calculator

Run it and answer the questions.

\`\`\`python example
bill = float(input("Bill amount: "))
percent = int(input("Tip percent: "))

tip = bill * percent / 100
print(f"Tip: {tip:.2f}")
print(f"Total: {bill + tip:.2f}")
\`\`\`

Each \`input()\` is converted straight away: \`float\` for the money (it can have cents), \`int\` for the whole-number percentage. After that it is plain arithmetic.

# Exercise: Greeting {#e1}

Ask the user for their name with \`input()\`, then print \`Hello, \` followed by the name and an exclamation mark. For \`Ada\` the last line printed must be \`Hello, Ada!\`.

\`\`\`python starter
# Ask for a name and greet the user
\`\`\`

\`\`\`python solution
name = input("What is your name? ")
print(f"Hello, {name}!")
\`\`\`

## Hints

1. Which function waits for the user to type something?
2. Where does the typed text go once you have it? You need to hold on to it for the next line.
3. Store the answer in a variable, then print a message that includes that variable.

## Explanation

\`input(...)\` returns what was typed as a string, which you store in \`name\`. The f-string drops it into the greeting. Any prompt wording is fine; only the final line is checked.

# Exercise: Next year {#e2}

Ask for the user's age as a whole number and print \`Next year you will be 15\` (with their age plus one in place of 15).

\`\`\`python starter
# Ask for an age and print the next year's age
\`\`\`

\`\`\`python solution
age = int(input("How old are you? "))
print("Next year you will be", age + 1)
\`\`\`

## Hints

1. What type does \`input()\` return, even when the user types digits?
2. What must you do to that value before you can add one to it?
3. Convert the answer to an integer, then print the sentence with the incremented number in it.

## Explanation

\`int(input(...))\` converts the typed text to a whole number straight away, so \`age + 1\` is arithmetic instead of a \`TypeError\`.

# Exercise: Add two numbers {#e3}

Read two whole numbers (one \`input()\` call each) and print their **sum** as the final line of output.

\`\`\`python starter
# Read two numbers and print their sum
\`\`\`

\`\`\`python solution
a = int(input("First number: "))
b = int(input("Second number: "))
print(a + b)
\`\`\`

## Hints

1. How many times do you need to call \`input()\`?
2. If you skip converting, what does \`+\` do to two strings?
3. Convert each answer with \`int()\` before adding. Print only the result on the last line.

## Explanation

Without \`int()\`, \`"3" + "4"\` would give \`"34"\`. Converting each answer first makes \`+\` add numbers: \`7\`.

# Exercise: Dates with dashes {#e4}

The starter prints three numbers separated by spaces. Change it so it prints \`2026-01-15\` (dashes, no spaces) **without** adding any text yourself: use the \`sep\` argument.

\`\`\`python starter
print(2026, "01", 15)
\`\`\`

\`\`\`python solution
print(2026, "01", 15, sep="-")
\`\`\`

## Hints

1. Which part of \`print\`'s output is unwanted: what is between the values, or what comes after?
2. \`print\` has a named argument for the separator. What is it called?
3. Add \`sep="-"\` after the values, separated from them by a comma.

## Explanation

\`sep\` replaces the single space that \`print\` normally puts between its arguments. Named arguments go after the positional ones.

# Quiz

## What type does \`input()\` always return?

- [ ] \`int\`
- [x] \`str\`
- [ ] It depends on what the user types

Explanation: \`input()\` returns text, whatever was typed. Convert it with \`int()\` or \`float()\` if you need a number.

## What does \`print("a", "b", sep="")\` show?

- [ ] \`a b\`
- [x] \`ab\`
- [ ] \`a, b\`

Explanation: \`sep=""\` puts nothing between the values, so they run together.

## What happens with \`int(input())\` if the user types \`hello\`?

- [ ] It returns 0
- [ ] It returns \`"hello"\`
- [x] A \`ValueError\`

Explanation: \`int()\` can only convert text that looks like a whole number. Later you'll learn to catch this error and ask again.
`,he='---\nid: booleans-comparisons\nmodule: fnd-decisions\ntitle: True, False and comparisons\nminutes: 12\ngoal: Compare values with ==, !=, <, >, <= and >= and use the resulting booleans.\nsummary: Questions your program can ask, and the True/False answers that drive every decision.\n---\n\n# Concept\n\nA **boolean** has just two values: `True` and `False`. They are what you get when you ask a question about your data. Comparison operators ask the questions:\n\n| Operator | Asks | Example | Result |\n|---|---|---|---|\n| `==` | equal? | `3 == 3` | `True` |\n| `!=` | not equal? | `3 != 4` | `True` |\n| `<` `>` | less / greater? | `2 < 1` | `False` |\n| `<=` `>=` | less-or-equal / greater-or-equal? | `5 >= 5` | `True` |\n\n```python run\nage = 17\nprint(age >= 18)\nprint(age == 17)\nprint(age != 17)\n```\n\nA comparison is just an expression, so you can store the answer:\n\n```python run\nage = 17\nis_adult = age >= 18\nprint(is_adult)\nprint(type(is_adult))\n```\n\n### `=` versus `==`\n\nThis catches everyone at first. One equals sign **assigns**; two equals signs **ask**.\n\n```python run\nx = 5          # store 5 in x\nprint(x == 5)  # ask: is x equal to 5?\n```\n\n> **Careful:** writing `x = 5` when you meant `x == 5` doesn\'t give an error in every situation. It silently changes `x`! If a check always seems to "pass", count the equals signs.\n\n### Chaining and strings\n\nPython lets you chain comparisons like maths does:\n\n```python run\nage = 14\nprint(13 <= age <= 19)\n```\n\nStrings compare too, and **case matters**:\n\n```python run\nprint("apple" == "apple")\nprint("Apple" == "apple")\nprint("apple" < "banana")\nprint("Apple".lower() == "apple")\n```\n\nAnd `in` asks whether something is contained in a string:\n\n```python run\nprint("py" in "python")\n```\n\n# Example: A few questions\n\nPredict each `True` or `False` before running.\n\n```python example\ntemperature = 21\nname = "Ada"\n\nprint(temperature > 20)\nprint(temperature == 21.0)\nprint(name == "ada")\nprint(name.lower() == "ada")\nprint(0 < temperature < 15)\nprint("A" in name)\n```\n\n`21 == 21.0` is `True`: Python compares numeric values, not types. `"Ada" == "ada"` is `False` because capital letters are different characters, but lowering first makes them match.\n\n# Exercise: Old enough? {#e1}\n\n`age = 17`. Create `is_adult`, which is `True` when `age` is **18 or more**, using a comparison.\n\n```python starter\nage = 17\n\n# Create is_adult\n```\n\n```python solution\nage = 17\n\nis_adult = age >= 18\n```\n\n## Hints\n\n1. You don\'t need an `if`. The comparison itself is the value you want to store.\n2. "18 or more": is 18 itself included?\n3. Compare `age` against 18 with the operator that allows equality, and assign the result to the new name.\n\n## Explanation\n\n`age >= 18` evaluates to `False` for 17, and that boolean is stored in `is_adult`. Using `>` instead would wrongly exclude 18-year-olds.\n\n# Exercise: Teenager {#e2}\n\n`age = 14`. Create `is_teen`, which is `True` for ages **13 to 19, inclusive**, using one chained comparison.\n\n```python starter\nage = 14\n\n# Create is_teen\n```\n\n```python solution\nage = 14\n\nis_teen = 13 <= age <= 19\n```\n\n## Hints\n\n1. Both ends are included. Which comparison operators allow equality?\n2. Python lets you put a value between two limits in a single expression, as in maths.\n3. Write the lower limit, `age`, and the upper limit in one line with `<=` on both sides.\n\n## Explanation\n\n`13 <= age <= 19` means "13 is at most age, and age is at most 19". For 14 that\'s `True`, for 12 or 20 it would be `False`.\n\n# Exercise: Same word? {#e3}\n\n`a = "Python"` and `b = "python"`. Create `same`, which is `True` when the two words are equal **ignoring capital letters**.\n\n```python starter\na = "Python"\nb = "python"\n\n# Create same\n```\n\n```python solution\na = "Python"\nb = "python"\n\nsame = a.lower() == b.lower()\n```\n\n## Hints\n\n1. What makes `a == b` give the wrong answer here?\n2. Could you make both strings use the same case before comparing?\n3. Lower-case each word with a string method, and compare the results with `==`.\n\n## Explanation\n\nCapital letters are different characters, so `"Python" == "python"` is `False`. Lowering both sides first removes the difference.\n\n# Exercise: Spot the bug {#e4}\n\n`is_five` should be `True` only when `answer` equals 5. The starter code has a classic bug. Fix it.\n\n```python starter\nanswer = 5\nis_five = answer = 5\n```\n\n```python solution\nanswer = 5\nis_five = answer == 5\n```\n\n## Hints\n\n1. After the second line, what do you think `is_five` holds? Try printing it.\n2. How many equals signs does a comparison need?\n3. In the second line, replace the second assignment with the operator that asks "is it equal?".\n\n## Explanation\n\n`is_five = answer = 5` is a chained **assignment**: it stores `5` in both names. Changing the second `=` to `==` turns it into a comparison, so `is_five` becomes `True`.\n\n# Quiz\n\n## What is `3 == 3.0`?\n\n- [x] `True`\n- [ ] `False`\n- [ ] An error\n\nExplanation: Python compares numeric values, and 3 and 3.0 are the same number.\n\n## What is `"Cat" == "cat"`?\n\n- [ ] `True`\n- [x] `False`\n- [ ] An error\n\nExplanation: Upper- and lower-case letters are different characters, so the strings are not equal.\n\n## What does `x = 5` do?\n\n- [ ] Asks whether `x` equals 5\n- [x] Stores 5 in `x`\n- [ ] Prints `True`\n\nExplanation: A single `=` is an assignment. Use `==` to compare.\n',ge=`---
id: conditionals
module: fnd-decisions
title: if, elif and else
minutes: 14
goal: Make a program choose between paths with if, elif and else, and indent blocks correctly.
summary: Let your program decide: run some lines only when a condition is true.
---

# Concept

An \`if\` statement runs a block of code **only when** its condition is \`True\`:

\`\`\`python run
temperature = 30

if temperature > 25:
    print("It's hot!")
print("Done")
\`\`\`

Two details matter:

- The condition ends with a **colon** \`:\`.
- The block is **indented** (4 spaces is the convention). Everything indented under the \`if\` belongs to it. The unindented \`print("Done")\` runs regardless.

### else: the other path

\`\`\`python run
temperature = 12

if temperature > 25:
    print("Hot")
else:
    print("Not hot")
\`\`\`

### elif: several paths

\`elif\` ("else if") adds more conditions. Python checks them **in order** and runs the first one that is true, then skips the rest:

\`\`\`python run
score = 78

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("Try again")
\`\`\`

Notice how order does the work: when we reach the \`elif score >= 80\`, we already know the score is *below 90*.

\`\`\`diagram
{"type":"flow","caption":"score = 78: Python tests each condition in turn","steps":[{"label":"score >= 90?","detail":"no"},{"label":"score >= 80?","detail":"no"},{"label":"score >= 70?","detail":"yes → print C"}]}
\`\`\`

> **Careful:** indentation *is* the syntax in Python. A block indented by 3 spaces on one line and 4 on the next is an \`IndentationError\`. And if you test the *wider* condition first (\`score >= 70\` before \`score >= 90\`), the wider one swallows everything. Ask yourself: "which cases can reach this line?"

### Nesting

You can put an \`if\` inside another block:

\`\`\`python run
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Come in")
    else:
        print("Buy a ticket")
else:
    print("Too young")
\`\`\`

# Example: Pricing

Read the code, predict the output for \`age = 8\`, then change \`age\` and run again.

\`\`\`python example
age = 8

if age < 5:
    price = 0
elif age < 18:
    price = 8
else:
    price = 15

print(f"A ticket costs \${price}")
\`\`\`

Only one branch ever runs, and \`price\` is set in whichever one it was. The \`elif age < 18\` doesn't need to say "and age >= 5": the \`if\` before it already ruled out smaller ages.

# Exercise: Hot or not {#e1}

\`temperature = 28\`. Print \`Hot\` if the temperature is **25 or above**, otherwise print \`Mild\`.

\`\`\`python starter
temperature = 28

# Decide what to print
\`\`\`

\`\`\`python solution
temperature = 28

if temperature >= 25:
    print("Hot")
else:
    print("Mild")
\`\`\`

## Hints

1. Your program has exactly two paths. Which statement chooses between two?
2. The boundary is "25 or above". Does 25 itself count as hot?
3. Test \`temperature\` against 25 with the inclusive operator in an \`if\`, and put the other message in the \`else\` block.

## Explanation

\`if temperature >= 25:\` runs the first block for 25 and everything above; every other value falls through to \`else\`. The colons and the indentation are required.

# Exercise: Letter grades {#e2}

\`score = 85\`. Print the grade: \`A\` for 90+, \`B\` for 80–89, \`C\` for 70–79, otherwise \`F\`.

\`\`\`python starter
score = 85

# Print the grade
\`\`\`

\`\`\`python solution
score = 85

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("F")
\`\`\`

## Hints

1. There are four outcomes, so one \`if\`/\`else\` won't be enough.
2. Python stops at the first true condition. In which order should you test the boundaries?
3. Start with the highest threshold and work down using \`elif\`. Put \`F\` in the final \`else\`.

## Explanation

Checking from the top, each \`elif\` only runs when everything above was false, so \`elif score >= 80\` really means "between 80 and 89". The final \`else\` catches all scores below 70.

# Exercise: Odd or even {#e3}

\`number = 7\`. Print \`odd\` if the number is odd and \`even\` if it is even. (Remember what \`%\` gives you.)

\`\`\`python starter
number = 7

# Print odd or even
\`\`\`

\`\`\`python solution
number = 7

if number % 2 == 0:
    print("even")
else:
    print("odd")
\`\`\`

## Hints

1. What is the remainder when you divide an even number by 2?
2. Which operator gives you that remainder, and which one asks "is it equal"?
3. Test whether the remainder of \`number\` divided by 2 equals zero, and print \`even\` in that branch.

## Explanation

An even number divides by 2 with no remainder, so \`number % 2 == 0\` is \`True\`. Every other integer leaves remainder 1, which goes to the \`else\` branch.

# Exercise: Ticket price {#e4}

Set \`price\` from \`age = 30\`: free (\`0\`) under 5, \`8\` from 5 to 17, \`15\` from 18 to 64, and \`10\` for 65 and over.

\`\`\`python starter
age = 30

# Set price
\`\`\`

\`\`\`python solution
age = 30

if age < 5:
    price = 0
elif age < 18:
    price = 8
elif age < 65:
    price = 15
else:
    price = 10
\`\`\`

## Hints

1. Four price bands means a chain of conditions. Which keyword adds a condition after the first \`if\`?
2. Going upwards from the youngest age, what is the upper limit of each band?
3. Test \`age < 5\`, then \`age < 18\`, then \`age < 65\`, and use \`else\` for the seniors. Assign \`price\` in each block.

## Explanation

Each \`elif\` only needs the *upper* limit of its band, because younger ages were handled earlier in the chain. Going from small to large keeps every condition simple.

# Quiz

## What goes at the end of an \`if\` line?

- [ ] A semicolon
- [x] A colon
- [ ] Nothing

Explanation: Every block-opening line (\`if\`, \`elif\`, \`else\`, and later \`for\`, \`while\`, \`def\`) ends with a colon.

## What does this print?

\`\`\`python
x = 5
if x > 3:
    print("A")
elif x > 1:
    print("B")
\`\`\`

- [x] \`A\`
- [ ] \`B\`
- [ ] \`A\` and \`B\`

Explanation: Python runs only the first branch whose condition is true. The \`elif\` is skipped once \`x > 3\` matched.

## What does indentation do in Python?

- [ ] It's just for looks
- [x] It defines which lines belong to a block
- [ ] It makes code run faster

Explanation: Indentation is part of the syntax: it tells Python which lines belong to the \`if\`, \`else\`, loop or function.
`,_e='---\nid: logical-operators\nmodule: fnd-decisions\ntitle: and, or, not\nminutes: 12\ngoal: Combine conditions with and, or and not, and read compound conditions correctly.\nsummary: Ask more than one question at once, and flip answers around.\n---\n\n# Concept\n\nOne comparison answers one question. Real decisions often need several. Three **logical operators** combine booleans:\n\n| Operator | `True` when… |\n|---|---|\n| `a and b` | **both** are true |\n| `a or b` | **at least one** is true |\n| `not a` | `a` is false (it flips the answer) |\n\n```python run\nage = 25\nhas_id = True\n\nprint(age >= 18 and has_id)\nprint(age < 18 or has_id)\nprint(not has_id)\n```\n\n### Using them in an if\n\n```python run\nage = 16\nhas_permission = True\n\nif age >= 18 or has_permission:\n    print("You can join")\nelse:\n    print("Sorry")\n```\n\n### Read each side separately\n\nEach side of `and`/`or` must be a **complete** condition. This is a very common slip:\n\n```python\nif age > 12 and < 20:      # wrong: "< 20" has no left side\nif age > 12 and age < 20:  # right\n```\n\n(Or use the chained form you met earlier: `12 < age < 20`.)\n\nLikewise, `if day == "Sat" or "Sun":` does not do what it reads like: `"Sun"` on its own counts as *true*, so the condition is **always** true. Write `day == "Sat" or day == "Sun"`.\n\n### Precedence\n\n`not` binds tightest, then `and`, then `or`. When mixing, add parentheses so the next reader (and you) can see the intent:\n\n```python run\na, b, c = True, False, True\nprint(a or b and c)\nprint((a or b) and c)\nprint(not a or b)\n```\n\n> **Careful:** "none of them" and "not all of them" are different. `not (a or b)` means neither is true; `not (a and b)` means they\'re not both true. When a rule seems backwards, write it out in words.\n\nBoth `and` and `or` are **lazy**: Python stops as soon as the answer is known. In `x != 0 and 10 / x > 2`, a zero `x` never reaches the division. That\'s a useful guard.\n\n# Example: Can they ride?\n\n```python example\nheight = 130\nage = 9\n\ncan_ride = height >= 120 and age >= 8\nprint("Can ride:", can_ride)\n\nneeds_adult = age < 12 or height < 140\nprint("Needs an adult:", needs_adult)\n\nprint("Fully independent:", not needs_adult)\n```\n\nTry other heights and ages. `and` needs both rules satisfied, `or` needs just one.\n\n# Exercise: Roller coaster {#e1}\n\nA rider needs `height >= 120` **and** `age >= 8`. With `height = 125` and `age = 9`, create `can_ride`.\n\n```python starter\nheight = 125\nage = 9\n\n# Create can_ride\n```\n\n```python solution\nheight = 125\nage = 9\n\ncan_ride = height >= 120 and age >= 8\n```\n\n## Hints\n\n1. Is it enough to meet one rule, or must both hold?\n2. Each rule is a comparison on its own variable.\n3. Write each requirement as a complete comparison and join them with the operator that needs both.\n\n## Explanation\n\n`and` is `True` only if both sides are: `125 >= 120` and `9 >= 8` are both true, so `can_ride` is `True`. If either rider fails a rule, the whole thing is `False`.\n\n# Exercise: Weekend {#e2}\n\n`day = "Sat"`. Create `is_weekend`, which is `True` if `day` is `"Sat"` **or** `"Sun"`.\n\n```python starter\nday = "Sat"\n\n# Create is_weekend\n```\n\n```python solution\nday = "Sat"\n\nis_weekend = day == "Sat" or day == "Sun"\n```\n\n## Hints\n\n1. Either of two values is enough, so which operator fits?\n2. Can `day` equal both at once? What does each side of the operator need to be?\n3. Compare `day` with each weekend day separately, each as a full `==` comparison, joined by the "at least one" operator.\n\n## Explanation\n\nEach side of `or` must be a complete comparison. `day == "Sat" or day == "Sun"` is `True` for either. The shortcut `day == "Sat" or "Sun"` would always be true because `"Sun"` alone is truthy.\n\n# Exercise: A login check {#e3}\n\nGiven `username = "admin"` and `password = "1234"`, print `Welcome` when the username is `"admin"` **and** the password is `"1234"`, otherwise print `Denied`.\n\n```python starter\nusername = "admin"\npassword = "1234"\n\n# Print Welcome or Denied\n```\n\n```python solution\nusername = "admin"\npassword = "1234"\n\nif username == "admin" and password == "1234":\n    print("Welcome")\nelse:\n    print("Denied")\n```\n\n## Hints\n\n1. Two things must both be right for access. How will you combine the checks?\n2. What are the two comparisons, and which values do they compare?\n3. Put both comparisons in the condition of one `if`, joined by the operator that needs both, and put `Denied` in the `else`.\n\n## Explanation\n\nThe `and` makes access depend on both facts. A right username with a wrong password falls through to `else` and prints `Denied`.\n\n# Exercise: Not on holiday {#e4}\n\n`is_holiday = False` and `is_weekend = True`. Create `go_to_work`, which is `True` only on days that are **neither** a holiday **nor** a weekend.\n\n```python starter\nis_holiday = False\nis_weekend = True\n\n# Create go_to_work\n```\n\n```python solution\nis_holiday = False\nis_weekend = True\n\ngo_to_work = not is_holiday and not is_weekend\n```\n\n## Hints\n\n1. Say the rule out loud: "I go to work if it is not a holiday and..."\n2. Which operator flips a boolean?\n3. Flip each boolean on its own, then combine the two with the operator that needs both.\n\n## Explanation\n\n`not is_holiday and not is_weekend` reads exactly like the rule. Equivalent forms exist, like `not (is_holiday or is_weekend)`; they say "neither is true".\n\n# Quiz\n\n## What is `True and False`?\n\n- [ ] `True`\n- [x] `False`\n- [ ] An error\n\nExplanation: `and` needs both sides true. One `False` is enough to make the whole expression `False`.\n\n## What is `not (3 > 5)`?\n\n- [x] `True`\n- [ ] `False`\n- [ ] `3`\n\nExplanation: `3 > 5` is `False`, and `not` flips it to `True`.\n\n## Why is `if day == "Sat" or "Sun":` a bug?\n\n- [ ] `or` isn\'t allowed in an `if`\n- [x] `"Sun"` on its own is always true, so the condition is always true\n- [ ] It compares the wrong types\n\nExplanation: Each side of `or` is a complete condition. A non-empty string counts as true, so the whole expression is always true, whatever `day` is.\n',ve=`---
id: while-loops
module: fnd-loops
title: while loops
minutes: 13
goal: Repeat a block while a condition holds, and make sure the loop can end.
summary: Say "keep going until…" and let Python do the repeating.
---

# Concept

A loop runs the same block over and over. A \`while\` loop keeps going **as long as its condition is true**:

\`\`\`python run
count = 1
while count <= 3:
    print("Round", count)
    count = count + 1
print("Finished")
\`\`\`

It looks like an \`if\`, but when the block finishes Python goes **back up** and checks the condition again. Only when the condition is false does the program move on.

\`\`\`diagram
{"type":"flow","caption":"What the loop above does","steps":[{"label":"count = 1","detail":"1 <= 3 → run"},{"label":"count = 2","detail":"2 <= 3 → run"},{"label":"count = 3","detail":"3 <= 3 → run"},{"label":"count = 4","detail":"4 <= 3 → stop"}]}
\`\`\`

### Three parts of a healthy loop

1. **Start**: set up the variable the condition reads (\`count = 1\`).
2. **Condition**: the test that decides whether to go round again (\`count <= 3\`).
3. **Update**: change something so the condition *eventually* becomes false (\`count = count + 1\`).

Forget the update and the condition stays true forever: an **infinite loop**. If a run never finishes, press **Stop**.

> **Careful:** the most common loop bug is forgetting step 3, followed closely by an off-by-one (\`<\` vs \`<=\`). When your loop runs one time too many or too few, ask: "what is the *last* value of the counter that should run the block?"

### Accumulating

Loops are how programs add things up. Keep a running total outside the loop:

\`\`\`python run
total = 0
number = 1
while number <= 5:
    total = total + number
    number += 1
print(total)
\`\`\`

### Loop until the user says stop

When you don't know in advance how many rounds there will be, loop on the answers:

\`\`\`python run
answer = ""
while answer != "quit":
    answer = input("Type a word (or quit): ")
    print("You typed", answer)
\`\`\`

# Example: Doubling

How many times can you double 1 before passing a million? Predict, then run.

\`\`\`python example
value = 1
steps = 0

while value <= 1_000_000:
    value = value * 2
    steps += 1

print("Doubled", steps, "times; value is now", value)
\`\`\`

Start \`value = 1\`, condition \`value <= 1_000_000\`, update \`value * 2\`. We don't know the number of rounds beforehand: that's when \`while\` shines. (Underscores in numbers are just a readability aid.)

# Exercise: Countdown {#e1}

Print the numbers from \`5\` down to \`1\`, one per line, then print \`Liftoff!\`. Use a \`while\` loop.

\`\`\`python starter
# Count down from 5 to 1, then print Liftoff!
\`\`\`

\`\`\`python solution
count = 5
while count >= 1:
    print(count)
    count -= 1
print("Liftoff!")
\`\`\`

## Hints

1. What needs to change on each round so the loop eventually ends?
2. Which number should the counter start at, and what is the last value that should still be printed?
3. Start the counter at 5, loop while it is at least 1, print it, then subtract 1. Print \`Liftoff!\` after the loop.

## Explanation

The counter starts at 5, each round prints it and decrements it, and the condition \`count >= 1\` becomes false once it reaches 0. \`Liftoff!\` is outside the loop (not indented), so it prints once at the end.

# Exercise: Add them up {#e2}

\`n = 10\`. Use a \`while\` loop to add the whole numbers from \`1\` to \`n\` (inclusive) into a variable called \`total\`.

\`\`\`python starter
n = 10

# Create total
\`\`\`

\`\`\`python solution
n = 10

total = 0
number = 1
while number <= n:
    total += number
    number += 1
\`\`\`

## Hints

1. You need somewhere to collect the running sum. Where should it start?
2. A second variable steps through the numbers. What must happen to it on every round?
3. Initialise \`total\` to 0 and a counter to 1; while the counter is at most \`n\`, add it to \`total\` and increase it.

## Explanation

\`total\` starts at 0 and grows each round by the current \`number\`. Using \`<= n\` includes \`n\` itself. The result for \`n = 10\` is 55.

# Exercise: How many doublings? {#e3}

Start with \`value = 1\` and \`steps = 0\`. Keep doubling \`value\` and adding 1 to \`steps\` **while \`value\` is less than 1000**. When the loop ends, \`value\` should be \`1024\` and \`steps\` \`10\`.

\`\`\`python starter
value = 1
steps = 0

# Loop here
\`\`\`

\`\`\`python solution
value = 1
steps = 0

while value < 1000:
    value *= 2
    steps += 1
\`\`\`

## Hints

1. Both variables change on every round. Which two lines belong inside the loop?
2. What is the loop condition? Think about which value gets compared with 1000.
3. Loop while \`value < 1000\`; inside, double \`value\` and add one to \`steps\`.

## Explanation

After 10 doublings \`value\` is 1024, which is no longer below 1000, so the loop stops. \`steps\` counted the rounds.

# Exercise: Sum until zero {#e4}

Write a program that reads whole numbers with \`input()\` until the user enters \`0\`, then prints their sum on the last line. For the inputs \`3\`, \`4\`, \`0\` it should print \`7\`.

\`\`\`python starter
# Read numbers until 0, then print the total
\`\`\`

\`\`\`python solution
total = 0
number = int(input("Number (0 to stop): "))
while number != 0:
    total += number
    number = int(input("Number (0 to stop): "))
print(total)
\`\`\`

## Hints

1. You don't know how many numbers will arrive. What is the loop's stopping signal?
2. The condition reads the latest number the user typed, so where must the first \`input()\` happen?
3. Read once before the loop, then loop while the number isn't 0, adding it and reading the next one at the end of each round.

## Explanation

Reading once *before* the loop gives the condition something to test. Each round adds the current number and reads the next. The \`0\` is never added, because the loop ends as soon as it is read.

# Quiz

## What happens if you forget to update the variable in a \`while\` loop's condition?

- [ ] Python stops with an error
- [x] The loop may never end
- [ ] The loop runs zero times

Explanation: If nothing changes, the condition stays true forever. That's an infinite loop. Press Stop to break out.

## How many times does this print?

\`\`\`python
n = 0
while n < 3:
    print(n)
    n += 1
\`\`\`

- [ ] 2
- [x] 3
- [ ] 4

Explanation: It prints for n = 0, 1 and 2. When n becomes 3, \`n < 3\` is false.

## Where does \`print("done")\` run if it is *not* indented under the loop?

- [ ] Every round
- [ ] Never
- [x] Once, after the loop ends

Explanation: Indentation decides what is inside the loop. An unindented line runs after the loop has finished.
`,ye=`---
id: for-loops
module: fnd-loops
title: for loops and range()
minutes: 14
goal: Repeat a block a known number of times with for and range(), and loop over the characters of a string.
summary: The loop to use when you know how many times, or what you are looping over.
---

# Concept

When you know how many times to repeat something, or you have a collection to walk through, use a \`for\` loop. It takes each item in turn and runs the block once for it:

\`\`\`python run
for letter in "hey":
    print(letter)
\`\`\`

The variable (\`letter\`) is filled in automatically each round. No counter to start, test or update.

### range(): counting

To repeat a number of times, loop over \`range(n)\`. It produces \`0, 1, ..., n-1\`:

\`\`\`python run
for i in range(5):
    print(i)
\`\`\`

Pay attention: that is five numbers, **starting at 0 and stopping before 5**. \`range\` has two more forms:

| Form | Produces |
|---|---|
| \`range(5)\` | 0, 1, 2, 3, 4 |
| \`range(2, 6)\` | 2, 3, 4, 5 *(start, up to but not including stop)* |
| \`range(0, 10, 3)\` | 0, 3, 6, 9 *(start, stop, step)* |
| \`range(5, 0, -1)\` | 5, 4, 3, 2, 1 *(counting down)* |

\`\`\`python run
for i in range(1, 6):
    print(i, "squared is", i ** 2)
\`\`\`

> **Careful:** "up to but not including" is the root of the classic *off-by-one* bug. To print 1 to 10 you need \`range(1, 11)\`. When a loop misses its last item, ask Pythia's question: "what is \`i\` on the last round?"

### Accumulating with for

\`\`\`python run
total = 0
for n in range(1, 101):
    total += n
print(total)
\`\`\`

### Counting things in a string

\`\`\`python run
word = "banana"
count = 0
for ch in word:
    if ch == "a":
        count += 1
print(count)
\`\`\`

### for or while?

- **\`for\`**: you have a collection or a known count.
- **\`while\`**: you repeat *until something happens* and don't know when.

# Example: Multiplication table

\`\`\`python example
n = 6
for i in range(1, 6):
    print(f"{n} x {i} = {n * i}")
\`\`\`

\`range(1, 6)\` gives 1 to 5, and \`i\` takes each value in turn. Change \`n\` and the stop value and run it again.

# Exercise: One to five {#e1}

Print the numbers \`1\` to \`5\`, one per line, using a \`for\` loop and \`range\`.

\`\`\`python starter
# Print 1 to 5
\`\`\`

\`\`\`python solution
for i in range(1, 6):
    print(i)
\`\`\`

## Hints

1. Which value should \`range\` start at, and where does it stop?
2. Does the stop value itself get produced?
3. To include 5, the stop value has to be one larger. Start at 1.

## Explanation

\`range(1, 6)\` produces 1, 2, 3, 4, 5: the stop value 6 is excluded. The loop variable \`i\` takes each of them in turn, and the body prints it.

# Exercise: Even total {#e2}

Add up the even numbers \`2, 4, 6, ..., 20\` into a variable called \`total\`. Use \`range\` with a **step** instead of an \`if\`.

\`\`\`python starter
# Create total
\`\`\`

\`\`\`python solution
total = 0
for n in range(2, 21, 2):
    total += n
\`\`\`

## Hints

1. The numbers you want are two apart. Which part of \`range\` controls the gap?
2. What are the first value, and the stop value that makes 20 the last one?
3. Use all three arguments of \`range\`: start 2, stop 21, step 2. Add each number to \`total\`.

## Explanation

\`range(2, 21, 2)\` yields 2, 4, 6, …, 20. Adding each to a running total starting at 0 gives 110.

# Exercise: A times table {#e3}

\`n = 7\`. Print its times table from 1 to 10, one line each, in exactly this format:

\`\`\`text
7 x 1 = 7
7 x 2 = 14
...
7 x 10 = 70
\`\`\`

\`\`\`python starter
n = 7

# Print the table
\`\`\`

\`\`\`python solution
n = 7

for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
\`\`\`

## Hints

1. How many lines do you need, and what changes from one line to the next?
2. The second number steps from 1 to 10. What \`range\` call gives exactly those values?
3. Loop \`i\` over 1 to 10 and print an f-string holding \`n\`, \`i\` and their product.

## Explanation

Each round uses the same \`n\` and a new \`i\`, and an f-string computes \`n * i\` inside the braces. \`range(1, 11)\` stops after 10.

# Exercise: Count the vowels {#e4}

\`word = "programming"\`. Create \`vowels\`, the number of letters in \`word\` that are one of \`a\`, \`e\`, \`i\`, \`o\`, \`u\`.

\`\`\`python starter
word = "programming"

# Create vowels
\`\`\`

\`\`\`python solution
word = "programming"

vowels = 0
for letter in word:
    if letter in "aeiou":
        vowels += 1
\`\`\`

## Hints

1. You have to look at the letters one at a time. What kind of loop walks through a string?
2. How will you decide whether a letter counts, and where does the count live?
3. Start a counter at 0; for each letter, if it is in \`"aeiou"\`, add 1 to the counter.

## Explanation

\`for letter in word\` visits every character. \`letter in "aeiou"\` is \`True\` for vowels. The counter ends at 3 for "programming" (o, a, i).

# Quiz

## What does \`list(range(3))\` hold?

- [ ] 1, 2, 3
- [x] 0, 1, 2
- [ ] 0, 1, 2, 3

Explanation: \`range(3)\` starts at 0 and stops before 3.

## Which loop prints 2, 4, 6, 8?

- [ ] \`for i in range(2, 8, 2):\`
- [x] \`for i in range(2, 9, 2):\`
- [ ] \`for i in range(8, 2, 2):\`

Explanation: The stop value is excluded, so to include 8 we stop at 9. The third form counts upward from 8 and so produces nothing.

## When is \`for\` the better choice than \`while\`?

- [ ] When you don't know how many rounds there will be
- [x] When you know the count or have a collection to walk through
- [ ] Never: \`while\` can do everything faster

Explanation: \`for\` handles the counter for you, which removes the usual loop bugs. Use \`while\` to repeat until something happens.
`,be=`---
id: loop-control
module: fnd-loops
title: break, continue and nested loops
minutes: 14
goal: Leave a loop early with break, skip a round with continue, and nest loops to build grids.
summary: Take finer control of loops, and put one loop inside another.
---

# Concept

### break: leave the loop now

\`break\` ends the loop immediately, whatever the condition says. It's perfect for "stop as soon as you've found it":

\`\`\`python run
for n in range(1, 100):
    if n % 7 == 0 and n > 30:
        print("Found it:", n)
        break
\`\`\`

Without \`break\` this would keep searching to 99. With it, the loop ends the moment the first match prints.

### continue: skip to the next round

\`continue\` abandons the **rest of this round** and jumps to the next item:

\`\`\`python run
for n in range(1, 8):
    if n % 2 == 0:
        continue
    print(n)
\`\`\`

Even numbers hit \`continue\`, so \`print\` is skipped for them.

### Nested loops

A loop inside a loop runs the inner loop **completely** for every round of the outer one. Think of a clock: the minute hand does a full lap for every step of the hour hand.

\`\`\`python run
for row in range(3):
    for col in range(4):
        print("*", end="")
    print()
\`\`\`

The inner loop prints four stars on one line (\`end=""\` stops the newline). The bare \`print()\` ends the line. The outer loop repeats that three times.

\`\`\`diagram
{"type":"flow","caption":"Outer round 1 runs the whole inner loop, then outer round 2 starts","steps":[{"label":"row 0","detail":"col 0,1,2,3"},{"label":"row 1","detail":"col 0,1,2,3"},{"label":"row 2","detail":"col 0,1,2,3"}]}
\`\`\`

A neat trick: let the inner loop depend on the outer variable.

\`\`\`python run
for row in range(1, 5):
    print("*" * row)
\`\`\`

> **Careful:** in nested loops, \`break\` and \`continue\` only affect the **innermost** loop they sit in. And when a nested loop is slow or its output looks wrong, trace the first two rounds of the outer loop by hand.

# Example: Prime check

Is 29 prime? Look for a divisor, and stop at the first one found.

\`\`\`python example
number = 29
is_prime = True

for d in range(2, number):
    if number % d == 0:
        is_prime = False
        break

print(number, "is prime:", is_prime)
\`\`\`

Try 30, 31 and 1. \`break\` makes the loop finish as soon as one divisor proves the number isn't prime. (For 1, the loop never runs: can you see why that answer is wrong, and how you'd fix it?)

# Exercise: First multiple {#e1}

Find the first number from \`1\` to \`99\` that is a multiple of \`7\` and greater than \`50\`. Store it in \`first\` and stop the search as soon as you find it. (Hint: start with \`first = None\`.)

\`\`\`python starter
first = None

# Search for it
\`\`\`

\`\`\`python solution
first = None

for n in range(1, 100):
    if n % 7 == 0 and n > 50:
        first = n
        break
\`\`\`

## Hints

1. You're searching: once you find the first match you can stop. Which keyword stops a loop early?
2. A candidate needs two properties at once. How do you combine them?
3. Loop over 1 to 99; when a number is both a multiple of 7 and above 50, remember it in \`first\` and break.

## Explanation

The loop visits 1, 2, 3, … and the first number satisfying both conditions is 56. \`break\` ends the loop right away, so later multiples (63, 70, …) never overwrite \`first\`.

# Exercise: Skip the threes {#e2}

Print the numbers \`1\` to \`10\`, one per line, but **skip every multiple of 3**. Use \`continue\`.

\`\`\`python starter
# Print 1 to 10 without multiples of 3
\`\`\`

\`\`\`python solution
for n in range(1, 11):
    if n % 3 == 0:
        continue
    print(n)
\`\`\`

## Hints

1. For some numbers you want to do nothing at all. What can you do instead of printing?
2. How do you test "multiple of 3"?
3. When \`n % 3 == 0\`, use the keyword that skips straight to the next round; otherwise print.

## Explanation

When the condition holds, \`continue\` jumps back to the top of the loop for the next number, so \`print\` is never reached for 3, 6 and 9.

# Exercise: A grid of stars {#e3}

\`rows = 3\` and \`cols = 4\`. Print a grid of \`*\` characters with that many rows and columns (3 lines of \`****\`). Use **nested loops** (not \`"*" * cols\`).

\`\`\`python starter
rows = 3
cols = 4

# Print the grid
\`\`\`

\`\`\`python solution
rows = 3
cols = 4

for r in range(rows):
    for c in range(cols):
        print("*", end="")
    print()
\`\`\`

## Hints

1. Which loop decides the number of lines, and which decides the stars on one line?
2. How do you keep several stars on the same line, and then end the line?
3. In the inner loop print a star with \`end=""\`; after the inner loop finishes, print an empty line to move down.

## Explanation

The inner loop prints one row of stars without newlines, and the bare \`print()\` then ends the row. The outer loop repeats that \`rows\` times.

# Exercise: A triangle {#e4}

\`size = 4\`. Print a right-angled triangle of stars: one star on the first line, two on the second, and so on up to \`size\`.

\`\`\`text
*
**
***
****
\`\`\`

\`\`\`python starter
size = 4

# Print the triangle
\`\`\`

\`\`\`python solution
size = 4

for row in range(1, size + 1):
    print("*" * row)
\`\`\`

## Hints

1. How does the number of stars on a line relate to the line number?
2. You don't strictly need an inner loop. What operator repeats a string?
3. Loop the line number from 1 to \`size\`, and print that many stars each round.

## Explanation

On line \`row\` you print \`row\` stars. \`range(1, size + 1)\` includes \`size\`, and \`"*" * row\` builds each line. (An inner loop works too.)

# Quiz

## What does \`break\` do?

- [ ] Skips to the next round
- [x] Ends the loop immediately
- [ ] Stops the whole program

Explanation: \`break\` only leaves the loop it is in. The program carries on with the code after the loop.

## What does \`continue\` do?

- [x] Skips the rest of this round and starts the next
- [ ] Ends the loop
- [ ] Restarts the loop from the first item

Explanation: \`continue\` jumps to the next iteration. The loop itself keeps going.

## How many times does the inner \`print\` run?

\`\`\`python
for a in range(3):
    for b in range(2):
        print(a, b)
\`\`\`

- [ ] 5
- [x] 6
- [ ] 3

Explanation: The inner loop runs 2 times for each of the 3 outer rounds: 3 × 2 = 6.
`,xe=`---
id: defining-functions
module: fnd-functions
title: Defining functions
minutes: 13
goal: Define a function with def, give it a parameter, and call it as many times as you like.
summary: Name a piece of code once and use it anywhere.
---

# Concept

You have used functions all along: \`print\`, \`len\`, \`int\`. A function is a **named, reusable block of code**. Now you'll write your own with \`def\`:

\`\`\`python run
def greet():
    print("Hello!")
    print("Welcome to Pythia.")

greet()
greet()
\`\`\`

Defining a function doesn't run it. It teaches Python a new word. The code inside runs **every time you call it** by writing its name with parentheses.

### Anatomy

\`\`\`python
def greet():            # def, a name, parentheses, a colon
    print("Hello!")     # the body is indented
\`\`\`

- Like \`if\` and \`for\`, the first line ends with a colon and the body is **indented**.
- The name follows the same rules as variable names (\`lower_snake_case\`).
- Parentheses are required, even if empty.

### Why bother?

If you copy-paste the same four lines three times and then need to change one, you have to change it three times. A function means you change it once. This idea is called **DRY**: *don't repeat yourself*.

### Parameters: giving the function input

Put a name inside the parentheses to let the caller pass a value in. That name is a **parameter**; the value you pass is an **argument**:

\`\`\`python run
def greet(name):
    print("Hello,", name + "!")

greet("Ada")
greet("Grace")
\`\`\`

Inside the function, \`name\` is just a variable that holds whatever was passed. Each call gets its own value.

With several parameters, arguments are matched **by position**:

\`\`\`python run
def show_total(item, price):
    print(item, "costs", price)

show_total("tea", 3)
show_total("cake", 5)
\`\`\`

> **Careful:** calling a function with the wrong number of arguments is a \`TypeError\`: \`greet()\` when it needs a name, or \`greet("a", "b")\` when it takes one. Also, writing \`greet\` without parentheses doesn't call it: it just refers to the function.

Functions must be **defined before they're called** in the file. Put your \`def\`s at the top.

# Example: A reusable banner

\`\`\`python example
def banner(title):
    print("=" * 20)
    print(title.upper())
    print("=" * 20)

banner("welcome")
print("some content")
banner("goodbye")
\`\`\`

The three-line pattern lives in one place. Change the width from 20 once and both banners change.

# Exercise: Say hello {#e1}

Define a function \`greet()\` (no parameters) that prints \`Hello, world!\`. The starter has no function yet.

\`\`\`python starter
# Define greet()
\`\`\`

\`\`\`python solution
def greet():
    print("Hello, world!")
\`\`\`

## Hints

1. Which keyword introduces a new function?
2. What goes after the function's name, and what ends the first line?
3. \`def\`, the name, empty parentheses, a colon, then an indented \`print\` line.

## Explanation

\`def greet():\` creates the function, and the indented line is its body. Nothing prints until someone calls \`greet()\`. The tests call it for you.

# Exercise: Shout {#e2}

Define \`shout(text)\` that prints \`text\` in upper case followed by an exclamation mark. \`shout("hello")\` prints \`HELLO!\`.

\`\`\`python starter
# Define shout(text)
\`\`\`

\`\`\`python solution
def shout(text):
    print(text.upper() + "!")
\`\`\`

## Hints

1. This function needs input. How does a function receive a value?
2. What do you need to do to the text before it is printed?
3. Add a parameter, then print the upper-cased text joined to \`"!"\`.

## Explanation

The parameter \`text\` receives whatever the caller passes. \`.upper()\` creates the capitals, and \`+ "!"\` joins the exclamation mark.

# Exercise: A boxed title {#e3}

Define \`box(title)\` that prints the title with a line of \`-\` characters above and below it, each exactly as long as the title. \`box("Hi")\` prints:

\`\`\`text
--
Hi
--
\`\`\`

\`\`\`python starter
# Define box(title)
\`\`\`

\`\`\`python solution
def box(title):
    line = "-" * len(title)
    print(line)
    print(title)
    print(line)
\`\`\`

## Hints

1. How long should the lines be? That depends on the argument, not a fixed number.
2. Which function measures a string, and which operator repeats one?
3. Build the line once from the title's length, and print it, then the title, then the line.

## Explanation

\`"-" * len(title)\` produces a line as long as the title, whatever it is. Storing it in \`line\` avoids computing it twice.

# Exercise: Call it three times {#e4}

The function \`cheer()\` is already defined. Add code **below** it that calls it three times using a loop.

\`\`\`python starter
def cheer():
    print("Hip hip hooray!")

# Call cheer three times
\`\`\`

\`\`\`python solution
def cheer():
    print("Hip hip hooray!")

for _ in range(3):
    cheer()
\`\`\`

## Hints

1. Defining a function doesn't run it. What actually runs it?
2. You need a call repeated a fixed number of times. Which loop fits?
3. Use a \`for\` loop over \`range(3)\` and put the call to \`cheer\` in its body.

## Explanation

\`cheer()\` with parentheses is the call. The \`for\` loop repeats it three times. (\`_\` is the usual name for a loop variable you don't use.)

# Quiz

## What does \`def hello():\` do by itself?

- [ ] Prints hello
- [x] Defines the function but doesn't run it
- [ ] Runs the function once

Explanation: A \`def\` only creates the function. The body runs when you call it with \`hello()\`.

## In \`def area(w, h):\` what are \`w\` and \`h\`?

- [x] Parameters
- [ ] Arguments
- [ ] Return values

Explanation: Parameters are the names in the definition. The values you pass when calling are the arguments.

## What happens with \`greet\` (no parentheses) on its own line?

- [ ] The function runs
- [ ] A \`SyntaxError\`
- [x] Nothing visible: it only refers to the function without calling it

Explanation: Parentheses perform the call. Without them you just mention the function.
`,Se=`---
id: return-values
module: fnd-functions
title: Returning values
minutes: 14
goal: Make functions hand a result back with return, and tell return apart from print.
summary: The difference between showing a result and giving it back.
---

# Concept

So far our functions *print* things. That's useful for people, but a function often needs to hand a **result** back to the code that called it, so that code can store it, test it or compute with it. That's what \`return\` does:

\`\`\`python run
def add(a, b):
    return a + b

result = add(2, 3)
print(result)
print(add(10, 20) * 2)
\`\`\`

\`return\` does two things: it **sends a value back** to where the function was called, and it **ends the function** right there. The call \`add(2, 3)\` is replaced by the value \`5\`.

### return is not print

\`\`\`python run
def show_double(n):
    print(n * 2)

def get_double(n):
    return n * 2

show_double(4)
x = get_double(4)
print(x + 1)
\`\`\`

\`show_double\` displays \`8\` but gives nothing back. \`get_double\` returns \`8\`, so you can add 1 to it. If a function has no \`return\`, calling it gives \`None\`, Python's "nothing here" value:

\`\`\`python run
def broken_double(n):
    n * 2

print(broken_double(4))
\`\`\`

> **Careful:** a missing \`return\` is the single most common function bug. If you see \`None\` where you expected a number, or \`TypeError: unsupported operand ... 'NoneType'\`, check that the function really returns something on *every* path through it.

### Returning early

Because \`return\` ends the function, it's a handy way to exit as soon as you know the answer:

\`\`\`python run
def sign(n):
    if n > 0:
        return "positive"
    if n < 0:
        return "negative"
    return "zero"

print(sign(5), sign(-2), sign(0))
\`\`\`

### Returning booleans

A function that answers a yes/no question returns \`True\` or \`False\`. Often you can return the comparison directly:

\`\`\`python run
def is_adult(age):
    return age >= 18

print(is_adult(20), is_adult(12))
\`\`\`

# Example: A tiny toolkit

\`\`\`python example
def average(a, b, c):
    return (a + b + c) / 3

def label(score):
    if score >= 50:
        return "pass"
    return "fail"

mean = average(40, 60, 80)
print("Average:", mean)
print("Result:", label(mean))
\`\`\`

One function's result feeds straight into the next. That composability is the whole point of returning values.

# Exercise: Add {#e1}

Define \`add(a, b)\` that **returns** the sum of its two arguments.

\`\`\`python starter
# Define add(a, b)
\`\`\`

\`\`\`python solution
def add(a, b):
    return a + b
\`\`\`

## Hints

1. The function must give a value back. Which keyword does that?
2. What two things are you combining?
3. Define the function with two parameters and return their sum.

## Explanation

\`return a + b\` computes the sum and hands it to the caller. The tests check the *returned value*, so printing it instead wouldn't pass.

# Exercise: Even or not {#e2}

Define \`is_even(n)\` that returns \`True\` if \`n\` is even and \`False\` otherwise.

\`\`\`python starter
# Define is_even(n)
\`\`\`

\`\`\`python solution
def is_even(n):
    return n % 2 == 0
\`\`\`

## Hints

1. The answer is a boolean. What operation produces one?
2. What is special about the remainder of an even number divided by 2?
3. Return the result of comparing \`n % 2\` with zero. No \`if\` needed.

## Explanation

\`n % 2 == 0\` is already \`True\` or \`False\`, so it can be returned directly.

# Exercise: Average of three {#e3}

Define \`average(a, b, c)\` that returns the mean of its three arguments.

\`\`\`python starter
# Define average(a, b, c)
\`\`\`

\`\`\`python solution
def average(a, b, c):
    return (a + b + c) / 3
\`\`\`

## Hints

1. What formula gives the mean of three numbers?
2. Mind the order of operations when you write that formula in one line.
3. Add all three first, in parentheses, then divide by three, and return that.

## Explanation

Without the parentheses, only \`c\` would be divided by 3. \`(a + b + c) / 3\` adds first.

# Exercise: Fix the missing return {#e4}

This function is meant to double a number, but it only prints it. Change it so it **returns** the double instead.

\`\`\`python starter
def double(n):
    print(n * 2)
\`\`\`

\`\`\`python solution
def double(n):
    return n * 2
\`\`\`

## Hints

1. Call the function and store its result: what do you get now?
2. What is the difference between showing a value and giving it back?
3. Replace the \`print\` with the keyword that gives the value back to the caller.

## Explanation

\`print(n * 2)\` shows the value but the call evaluates to \`None\`. \`return n * 2\` hands the number back, so \`double(4) + 1\` is \`9\`.

# Exercise: A full name {#e5}

Define \`full_name(first, last)\` that returns the name in the form \`"Last, First"\`. For example \`full_name("Ada", "Lovelace")\` returns \`"Lovelace, Ada"\`.

\`\`\`python starter
# Define full_name(first, last)
\`\`\`

\`\`\`python solution
def full_name(first, last):
    return f"{last}, {first}"
\`\`\`

## Hints

1. Which parameter comes first in the result?
2. What goes between the two names?
3. Build one string from \`last\`, a comma and a space, and \`first\` (an f-string is tidy) and return it.

## Explanation

The f-string \`f"{last}, {first}"\` arranges the two arguments in the new order with the separator written literally between them.

# Quiz

## What does a function without any \`return\` give back?

- [ ] \`0\`
- [ ] An empty string
- [x] \`None\`

Explanation: Python returns \`None\` when a function ends without a \`return\`. It means "no value".

## What does \`return\` do besides sending a value back?

- [x] Ends the function immediately
- [ ] Prints the value
- [ ] Defines a variable

Explanation: Code after a \`return\` in the same block never runs.

## Which version lets you do \`double(3) + 1\`?

- [ ] \`def double(n): print(n * 2)\`
- [x] \`def double(n): return n * 2\`
- [ ] Both

Explanation: Only the version that returns a value can be used in further arithmetic. The \`print\` version gives back \`None\`.
`,Ce=`---
id: scope-and-defaults
module: fnd-functions
title: Scope and default arguments
minutes: 15
goal: Explain where variables live (scope), give parameters default values, and call functions with keyword arguments.
summary: Where a variable is visible, and how to make parameters optional.
---

# Concept

### Scope: where a name lives

Variables created **inside** a function are **local**: they exist only while it runs. Code outside can't see them:

\`\`\`python run
def make_message():
    message = "created inside"
    return message

print(make_message())
print(message)
\`\`\`

The last line raises a \`NameError\`. \`message\` only existed during the call. Good: functions don't leak their internals, and two functions can each use a variable called \`total\` without clashing.

Going the other way, a function *can read* a variable defined outside it (a **global**). But if the function **assigns** to that name, Python creates a new local one:

\`\`\`python run
count = 10

def show():
    print(count)        # reads the global: fine

def try_to_change():
    count = 99          # creates a NEW local variable
    print("inside:", count)

show()
try_to_change()
print("outside:", count)
\`\`\`

> **Careful:** the safest design is for functions to take their inputs as parameters and send results out with \`return\`, not to reach for globals. If a function "doesn't change" a variable you expected it to, you're probably assigning to a local copy.

### Default arguments

Give a parameter a default value with \`=\`, and callers may leave it out:

\`\`\`python run
def power(base, exponent=2):
    return base ** exponent

print(power(5))
print(power(2, 10))
\`\`\`

Parameters with defaults must come **after** those without.

### Keyword arguments

You can name the arguments in a call, in any order. It makes calls readable:

\`\`\`python run
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ada"))
print(greet("Ada", "Welcome"))
print(greet(greeting="Hi", name="Grace"))
\`\`\`

You already use these: \`print("a", "b", sep="-")\` passes \`sep\` by keyword.

### Docstrings

A string on the first line of a function body documents it. It shows up in \`help()\` and in editors:

\`\`\`python run
def area(w, h):
    """Return the area of a w by h rectangle."""
    return w * h

print(area(3, 4))
help(area)
\`\`\`

# Example: A flexible greeting

\`\`\`python example
def describe(name, age=None, city="somewhere"):
    """Build a one-line description of a person."""
    text = f"{name} lives in {city}"
    if age is not None:
        text += f" and is {age}"
    return text

print(describe("Ada"))
print(describe("Grace", 85))
print(describe("Linus", city="Helsinki"))
\`\`\`

Three calls, three shapes, one function. \`is not None\` is the standard way to ask whether an optional value was provided.

# Exercise: Power with a default {#e1}

Define \`power(base, exponent=2)\` that returns \`base\` raised to \`exponent\`. Called with one argument it should square it.

\`\`\`python starter
# Define power(base, exponent=2)
\`\`\`

\`\`\`python solution
def power(base, exponent=2):
    return base ** exponent
\`\`\`

## Hints

1. A parameter can have a value that is used when the caller doesn't supply one. How is that written?
2. Which operator raises one number to the power of another?
3. In the header, write the second parameter as \`exponent=2\`, and return \`base ** exponent\`.

## Explanation

When the caller passes only \`base\`, \`exponent\` takes its default of 2, so \`power(5)\` is 25. When both are passed, the second argument replaces the default: \`power(2, 10)\` is 1024.

# Exercise: A greeting with a default {#e2}

Define \`greet(name, greeting="Hello")\` that **returns** \`"<greeting>, <name>!"\`. \`greet("Ada")\` returns \`"Hello, Ada!"\` and \`greet("Ada", greeting="Hi")\` returns \`"Hi, Ada!"\`.

\`\`\`python starter
# Define greet(name, greeting="Hello")
\`\`\`

\`\`\`python solution
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"
\`\`\`

## Hints

1. Which parameter is required, and which is optional?
2. Required parameters must come first. What does the optional one need in its definition?
3. Give \`greeting\` the default value \`"Hello"\` in the header, and build the result with an f-string.

## Explanation

\`greeting="Hello"\` makes the second parameter optional. Callers can override it by position or by keyword (\`greeting="Hi"\`).

# Exercise: Count down {#e3}

Define \`count_down(start)\` that prints the numbers from \`start\` down to \`1\`, one per line, followed by \`Go!\`.

\`\`\`python starter
# Define count_down(start)
\`\`\`

\`\`\`python solution
def count_down(start):
    for n in range(start, 0, -1):
        print(n)
    print("Go!")
\`\`\`

## Hints

1. Which kind of loop counts a known number of times? And in which direction does it need to go?
2. What does \`range\` need so that it counts down and stops after 1?
3. Use \`range(start, 0, -1)\` for the loop; print \`Go!\` once after it, outside the loop.

## Explanation

A negative step makes \`range\` count downwards, and stopping at 0 means 1 is the last value printed. \`Go!\` is at function level (not indented under the loop), so it prints once.

# Exercise: Where did my variable go? {#e4}

The function below calculates the total but then the program tries to print \`total\` outside it, which fails. **Fix the program** so that \`print(total)\` works: have the function return the value and store it.

\`\`\`python starter
def add_up(a, b):
    total = a + b

add_up(3, 4)
print(total)
\`\`\`

\`\`\`python solution
def add_up(a, b):
    total = a + b
    return total

total = add_up(3, 4)
print(total)
\`\`\`

## Hints

1. Run the starter and read the error. Which name can't Python find, and why?
2. Variables created inside a function vanish when it ends. How can a value escape?
3. Return \`total\` from the function, and in the main code assign the call's result to a variable called \`total\`.

## Explanation

The \`total\` inside \`add_up\` is local. \`return total\` carries the value out, and \`total = add_up(3, 4)\` stores it in a *different* variable that happens to have the same name at the top level.

# Quiz

## Where can you use a variable created inside a function?

- [ ] Anywhere in the program
- [x] Only inside that function
- [ ] Only in other functions

Explanation: Local variables vanish when the function ends. Return the value to get it out.

## What does \`power(3)\` give for \`def power(b, e=2): return b ** e\`?

- [ ] An error: \`e\` is missing
- [ ] 6
- [x] 9

Explanation: The missing argument takes its default of 2, so 3 ** 2 = 9.

## Which call is valid for \`def f(a, b=1, c=2):\`?

- [ ] \`f(b=5)\`
- [x] \`f(1, c=9)\`
- [ ] \`f(c=9, 1)\`

Explanation: \`a\` is required, so \`f(b=5)\` is missing it. Positional arguments can't follow keyword arguments, which rules out the third.
`,we=`---
id: try-except
module: int-errors
title: Catching exceptions
minutes: 14
goal: Use try and except to handle errors you expect, without hiding the ones you don't.
summary: Let your program recover from bad input instead of crashing.
---

# Concept

When Python can't do what you asked, it **raises an exception** and stops. You have met several already:

\`\`\`python run
print(int("forty-two"))
\`\`\`

That \`ValueError\` is not a bug in Python. It is Python telling you: *"this text doesn't look like a number."* The input was bad, and your program is the only one who can decide what to do about it.

A \`try\` / \`except\` block lets you decide:

\`\`\`python run
text = "forty-two"
try:
    number = int(text)
    print("Got", number)
except ValueError:
    print("That wasn't a number.")
print("The program carries on.")
\`\`\`

Python runs the \`try\` body. If an exception of the named type is raised, it **jumps** to the matching \`except\` block, skipping the rest of the \`try\` body. If nothing goes wrong, the \`except\` block is skipped.

\`\`\`diagram
{"type":"flow","caption":"try / except","steps":[{"label":"try: ...","detail":"run the risky code"},{"label":"no error","detail":"skip the except block"},{"label":"error of that type","detail":"jump to except, then carry on"}]}
\`\`\`

### Catch specific errors

Name the exception you expect. Each type means something different:

| Exception | Typical cause |
|---|---|
| \`ValueError\` | right type, wrong value: \`int("abc")\` |
| \`TypeError\` | wrong type: \`"a" + 1\` |
| \`ZeroDivisionError\` | \`10 / 0\` |
| \`KeyError\` | a missing dictionary key |
| \`IndexError\` | a list position that doesn't exist |

You can handle several, and keep the exception object with \`as\`:

\`\`\`python run
for value in ["12", "x", None]:
    try:
        print(int(value) * 2)
    except ValueError:
        print(repr(value), "is not a number")
    except TypeError as problem:
        print("Wrong type:", problem)
\`\`\`

### \`else\`: code that should only run on success

\`\`\`python run
try:
    age = int("30")
except ValueError:
    print("bad age")
else:
    print("age is", age)
\`\`\`

> **Careful:** never write a bare \`except:\` that swallows everything. It also hides typos and real bugs, so a mistake in your code looks like "bad input". Catch the specific exception you expect, and let the surprises crash loudly.

# Example: Friendly parsing

\`\`\`python example
def parse_price(text):
    try:
        return float(text.replace("$", ""))
    except ValueError:
        return None

for raw in ["$4.50", "12", "free"]:
    price = parse_price(raw)
    if price is None:
        print(f"{raw!r}: not a price")
    else:
        print(f"{raw!r}: {price:.2f}")
\`\`\`

The function **returns \`None\`** to say "I couldn't". The caller decides what to do. The \`try\` body is as small as possible: only the line that can fail.

# Exercise: Safe integer {#e1}

Define \`to_int(text)\` that returns \`text\` converted to an \`int\`, or \`None\` if it can't be converted.

\`\`\`python starter
# Define to_int(text)
\`\`\`

\`\`\`python solution
def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None
\`\`\`

## Hints

1. Which line might fail, and what would you like to happen when it does?
2. Which exception does \`int("abc")\` raise?
3. Put the conversion in a \`try\`, and \`return None\` from the matching \`except\`.

## Explanation

\`int(text)\` raises \`ValueError\` for text that isn't a whole number. Catching exactly that and returning \`None\` turns "crash" into "no answer".

# Exercise: Safe division {#e2}

Define \`safe_divide(a, b)\` that returns \`a / b\`, or \`None\` when \`b\` is zero. Catch the specific exception rather than checking \`b\` first.

\`\`\`python starter
# Define safe_divide(a, b)
\`\`\`

\`\`\`python solution
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
\`\`\`

## Hints

1. What does Python do when you divide by zero?
2. Name the exception type.
3. \`try:\` the division, and \`except\` that exception type to return \`None\`.

## Explanation

Dividing by zero raises \`ZeroDivisionError\`. Catching it by name means other mistakes (like passing text) are still reported instead of silently hidden.

# Exercise: Count the numbers {#e3}

Define \`count_numbers(items)\` that returns how many items in the list can be converted with \`int()\`. \`count_numbers(["4", "x", "10", ""])\` returns \`2\`.

\`\`\`python starter
# Define count_numbers(items)
\`\`\`

\`\`\`python solution
def count_numbers(items):
    numbers = []
    for item in items:
        try:
            numbers.append(int(item))
        except ValueError:
            pass
    return len(numbers)
\`\`\`

## Hints

1. You need a loop, one conversion attempt per item, and something that remembers the successes.
2. What happens to the rest of the \`try\` body when the conversion fails?
3. Collect each converted value in a list inside the \`try\`; a failed conversion skips the collecting. \`pass\` means "do nothing".

## Explanation

If \`int(item)\` fails, the exception jumps straight to \`except\`, so nothing is appended for that item. The answer is simply how many values were collected. (Calling \`int(item)\` on its own line just to see whether it fails would work, but throws the result away; keeping the value is clearer.) \`pass\` is a placeholder for a block that intentionally does nothing.

# Exercise: A lookup with a fallback {#e4}

Define \`lookup(prices, name)\` that returns \`prices[name]\`, or the string \`"unknown"\` if the key is missing. Use \`try\` / \`except\`.

\`\`\`python starter
# Define lookup(prices, name)
\`\`\`

\`\`\`python solution
def lookup(prices, name):
    try:
        return prices[name]
    except KeyError:
        return "unknown"
\`\`\`

## Hints

1. What happens if you ask a dictionary for a key it doesn't have?
2. Which exception is that?
3. \`try\` the lookup and return the fallback from the \`except KeyError\` block.

## Explanation

A missing key raises \`KeyError\`. (\`prices.get(name, "unknown")\` does the same without exceptions; the point here is to practise the pattern.)

# Quiz

## What happens to the rest of a \`try\` body after an exception is raised?

- [ ] It keeps running
- [x] It is skipped, and Python jumps to the matching \`except\`
- [ ] The program restarts

Explanation: The exception interrupts the \`try\` body at the failing line. Python looks for an \`except\` that matches.

## Why is a bare \`except:\` a bad idea?

- [ ] It's slower
- [x] It hides every kind of error, including your own bugs
- [ ] It isn't allowed in Python 3

Explanation: A typo in a variable name would be caught and ignored just like bad input. Catch only what you expect.

## Which exception does \`{"a": 1}["b"]\` raise?

- [ ] \`IndexError\`
- [x] \`KeyError\`
- [ ] \`ValueError\`

Explanation: Dictionaries are looked up by key, so a missing key is a \`KeyError\`. \`IndexError\` is for lists and tuples.
`,Te=`---
id: raising-errors
module: int-errors
title: Raising your own errors
minutes: 14
goal: Raise exceptions to reject bad input, clean up with finally, and define your own exception type.
summary: Stop early with a clear message instead of carrying on with nonsense.
---

# Concept

So far Python raised the errors. You can raise them too, when *your* function is handed something it can't sensibly work with.

\`\`\`python run
def set_age(age):
    if age < 0:
        raise ValueError("age can't be negative")
    return age

print(set_age(30))
print(set_age(-5))
\`\`\`

\`raise ValueError("...")\` stops the function right there and hands the exception to whoever called it. Pick the built-in type that matches the problem (\`ValueError\` for a bad value, \`TypeError\` for a wrong type) and write a message that says what was wrong.

> **Why not just return \`-1\` or \`None\`?** A returned "error value" is easy to forget to check, and then the bad value flows on and fails somewhere far away. An exception cannot be ignored by accident.

### Catching what you raised

\`\`\`python run
try:
    set_age = int("-4")
    if set_age < 0:
        raise ValueError(f"age can't be negative, got {set_age}")
except ValueError as problem:
    print("Rejected:", problem)
\`\`\`

\`as problem\` gives you the exception object. \`str(problem)\` is its message.

### \`finally\`: always runs

Some jobs must happen whether or not an error occurred (closing a file, releasing something, writing a log line). Put them in \`finally\`:

\`\`\`python run
def risky(fail):
    print("open")
    try:
        if fail:
            raise RuntimeError("boom")
        print("work")
    finally:
        print("close")

risky(False)
try:
    risky(True)
except RuntimeError:
    print("caught it outside")
\`\`\`

\`close\` is printed both times. And the error still travels on to the caller.

### Your own exception types

A class that inherits from \`Exception\` is a new kind of error. The name documents what went wrong:

\`\`\`python run
class OutOfStock(Exception):
    pass

def buy(stock, wanted):
    if wanted > stock:
        raise OutOfStock(f"only {stock} left")
    return stock - wanted

try:
    buy(2, 5)
except OutOfStock as problem:
    print("Sorry:", problem)
\`\`\`

# Example: Validating an order

\`\`\`python example
class InvalidOrder(Exception):
    pass

def total(prices, quantity):
    if quantity <= 0:
        raise InvalidOrder("quantity must be positive")
    return sum(prices) * quantity

for qty in (3, 0):
    try:
        print(total([2.5, 4.0], qty))
    except InvalidOrder as problem:
        print("Invalid order:", problem)
\`\`\`

The function does one job and refuses bad input loudly. The caller, which knows what to *do* about it, decides how to react.

# Exercise: Reject negative ages {#e1}

Define \`check_age(age)\` that returns \`age\` when it is between 0 and 120 (inclusive), and otherwise raises a \`ValueError\` with a message.

\`\`\`python starter
# Define check_age(age)
\`\`\`

\`\`\`python solution
def check_age(age):
    if age < 0 or age > 120:
        raise ValueError(f"age out of range: {age}")
    return age
\`\`\`

## Hints

1. There are two situations: acceptable, and not.
2. Which statement raises an exception?
3. Test the bad range with \`if\`, \`raise ValueError(...)\` there, and \`return age\` otherwise.

## Explanation

Both ends of the range are invalid, so one condition with \`or\` covers them, and the \`raise\` ends the function before the \`return\`.

# Exercise: Your own exception {#e2}

Define a class \`InsufficientFunds\` that inherits from \`Exception\`. Then define \`withdraw(balance, amount)\` that returns the new balance, but raises \`InsufficientFunds\` if \`amount\` is more than \`balance\`.

\`\`\`python starter
# Define the exception class and withdraw(balance, amount)
\`\`\`

\`\`\`python solution
class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(f"balance {balance} is less than {amount}")
    return balance - amount
\`\`\`

## Hints

1. Two things to define: a class, and a function that uses it.
2. What goes in the parentheses after the class name to make it an exception?
3. \`class InsufficientFunds(Exception):\` with \`pass\` inside is enough; then \`raise InsufficientFunds(...)\` in the function.

## Explanation

Inheriting from \`Exception\` is all it takes. A custom type lets callers catch exactly this problem with \`except InsufficientFunds\`.

# Exercise: Always close {#e3}

Define \`run_job(log, fail)\`. It must append \`"open"\` to the list \`log\`, then either append \`"work"\` (when \`fail\` is false) or raise a \`RuntimeError\` (when \`fail\` is true), and in **both** cases append \`"close"\` last. The error must still reach the caller.

\`\`\`python starter
# Define run_job(log, fail)
\`\`\`

\`\`\`python solution
def run_job(log, fail):
    log.append("open")
    try:
        if fail:
            raise RuntimeError("job failed")
        log.append("work")
    finally:
        log.append("close")
\`\`\`

## Hints

1. Which step must happen even when an error occurs?
2. Which keyword guarantees that?
3. Open before the \`try\`; put the work (and the possible \`raise\`) in the \`try\`; put the closing line in \`finally\`.

## Explanation

\`finally\` runs on the way out, whether the body finished normally or an exception is flying past. Because there's no \`except\`, the exception continues to the caller after \`close\` is logged.

# Exercise: Parse them all {#e4}

Define \`parse_all(items)\` that returns a list of the integers in \`items\`. If any item can't be converted, raise a \`ValueError\` whose message is \`bad value: \` followed by the \`repr\` of that item: for \`["1", "x"]\` it should say \`bad value: 'x'\`.

\`\`\`python starter
# Define parse_all(items)
\`\`\`

\`\`\`python solution
def parse_all(items):
    numbers = []
    for item in items:
        try:
            numbers.append(int(item))
        except ValueError:
            raise ValueError(f"bad value: {item!r}")
    return numbers
\`\`\`

## Hints

1. Convert one at a time, so you know which item failed.
2. You catch one \`ValueError\` and raise another. Why might you want to?
3. Inside the loop, \`try\` the conversion; in the \`except\`, \`raise ValueError(...)\` with your own message. \`!r\` inside an f-string gives the \`repr\`.

## Explanation

Python's own message ("invalid literal for int()...") doesn't say which of many items was wrong. Catching it and raising a clearer one makes the failure easy to act on.

# Quiz

## What does \`raise ValueError("bad")\` do?

- [ ] Prints "bad" and continues
- [x] Stops the current function and hands the exception to the caller
- [ ] Returns the string "bad"

Explanation: Raising interrupts normal flow. Unless something catches it, the program ends with a traceback.

## When does the \`finally\` block run?

- [ ] Only when there was an error
- [ ] Only when there was no error
- [x] Always, whether or not an exception occurred

Explanation: That's what it's for: cleanup that must happen either way.

## How do you create your own exception type?

- [ ] \`def MyError(): ...\`
- [x] \`class MyError(Exception): pass\`
- [ ] \`error MyError\`

Explanation: A class that inherits from \`Exception\` is a new exception type.
`,Ee=`---
id: classes-intro
module: int-objects
title: Classes and objects
minutes: 16
goal: Define a class with attributes and methods, and create objects from it.
summary: Bundle data and the functions that use it into one tidy thing.
---

# Concept

A **dictionary** can hold the facts about one thing:

\`\`\`python run
dog = {"name": "Rex", "tricks": 2}
print(dog["name"], "knows", dog["tricks"], "tricks")
\`\`\`

But the *functions* that work on dogs live somewhere else, and nothing stops you building a dog with a typo in a key. A **class** bundles the data and the behaviour together. It's a blueprint; each **object** (or *instance*) built from it is one actual dog.

\`\`\`python run
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
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"One class, many objects","steps":[{"label":"class Dog","detail":"the blueprint: what every dog has and does"},{"label":"Dog(\\"Rex\\")","detail":"builds a new object and runs __init__"},{"label":"rex.learn()","detail":"calls a method on that one object"}]}
\`\`\`

### The pieces

- **\`class Dog:\`** defines the blueprint.
- **\`__init__\`** is the *constructor*. It runs automatically when you write \`Dog("Rex")\` and sets up the new object.
- **\`self\`** is the object the method is working on. Python passes it for you: you write \`rex.learn()\`, Python runs \`learn(rex)\`.
- **Attributes** like \`self.name\` are the data stored *on* the object. Each object has its own.
- **Methods** are functions defined inside the class.

> **Careful:** forgetting \`self.\` is the classic mistake. Inside a method, \`name\` is a plain local variable that disappears when the method ends; \`self.name\` is the attribute that stays on the object. And every method needs \`self\` as its first parameter.

### Making objects print nicely

Printing an object shows something like \`<__main__.Dog object at 0x...>\`. Define \`__str__\` to control it:

\`\`\`python run
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

print(Point(3, 4))
\`\`\`

# Example: A bank account

\`\`\`python example
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
\`\`\`

The methods change the object's own \`balance\`, and the rule "you can't withdraw more than you have" lives in one place instead of being repeated everywhere an account is used.

# Exercise: A rectangle {#e1}

Define a class \`Rectangle\` whose constructor takes \`width\` and \`height\` and stores them as attributes, with a method \`area()\` that returns the area.

\`\`\`python starter
# Define class Rectangle
\`\`\`

\`\`\`python solution
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height
\`\`\`

## Hints

1. What does each rectangle need to remember?
2. Where do those values get stored when the object is created?
3. Set \`self.width\` and \`self.height\` in \`__init__\`, and use them in \`area\`.

## Explanation

\`__init__\` saves the two numbers on the object. \`area\` reads them back through \`self\`, so each rectangle computes its own area.

# Exercise: A counter {#e2}

Define a class \`Counter\` that starts at \`0\`. It needs a method \`increment()\` that adds 1, a method \`reset()\` that sets it back to 0, and an attribute \`value\` holding the current count.

\`\`\`python starter
# Define class Counter
\`\`\`

\`\`\`python solution
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

    def reset(self):
        self.value = 0
\`\`\`

## Hints

1. Where should the count live, so it survives between method calls?
2. Which attribute holds it?
3. Start \`self.value\` at 0 in \`__init__\`; \`increment\` adds one to it; \`reset\` sets it to zero.

## Explanation

The count is stored on the object, not in a local variable, so each call to \`increment\` builds on the last. Two counters have independent values.

# Exercise: A printable point {#e3}

Define a class \`Point\` with attributes \`x\` and \`y\`, and a \`__str__\` method so that \`str(Point(3, 4))\` is \`"(3, 4)"\`. Also add a method \`distance_from_origin()\` that returns the straight-line distance \`(x**2 + y**2) ** 0.5\`.

\`\`\`python starter
# Define class Point
\`\`\`

\`\`\`python solution
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def distance_from_origin(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
\`\`\`

## Hints

1. Two special things to add beyond the attributes: how it prints, and a measurement.
2. What must \`__str__\` return: print something, or hand back text?
3. \`__str__\` should \`return\` an f-string with both coordinates; the distance uses \`self.x\` and \`self.y\`.

## Explanation

\`__str__\` is called by \`print\` and \`str()\`, and must **return** the text. \`distance_from_origin\` is an ordinary method that reads the object's own attributes.

# Exercise: A shopping cart {#e4}

Define a class \`Cart\`. It starts empty. \`add(name, price)\` stores an item, \`total()\` returns the sum of all prices (0 for an empty cart), and \`count()\` returns how many items were added.

\`\`\`python starter
# Define class Cart
\`\`\`

\`\`\`python solution
class Cart:
    def __init__(self):
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))

    def total(self):
        return sum(price for _, price in self.items)

    def count(self):
        return len(self.items)
\`\`\`

## Hints

1. What single piece of data lets all three methods answer their questions?
2. Which built-in container keeps things in the order added?
3. Keep a list on the object, created in \`__init__\` (not shared!), and append a pair for each item.

## Explanation

All the methods work from one list stored on the object. Creating it in \`__init__\` gives every cart its **own** list; putting \`[]\` at class level would share one list between all carts.

# Quiz

## What is \`self\` inside a method?

- [ ] The name of the class
- [x] The object the method was called on
- [ ] A keyword that makes the method private

Explanation: \`rex.learn()\` is run as \`Dog.learn(rex)\`, so \`self\` is \`rex\`.

## What is the difference between \`name\` and \`self.name\` inside a method?

- [ ] None
- [x] \`name\` is a local variable that vanishes; \`self.name\` is stored on the object
- [ ] \`self.name\` is a constant

Explanation: Only attributes set on \`self\` outlive the method call.

## When does \`__init__\` run?

- [ ] When you call \`print\` on the object
- [x] Automatically, when you create an object with \`ClassName(...)\`
- [ ] When the program ends

Explanation: It's the constructor: it sets up a freshly created object.
`,De=`---
id: generators
module: int-iteration
title: Generators and yield
minutes: 14
goal: Write generator functions with yield, and use them one value at a time.
summary: Produce values on demand, so even endless sequences fit in memory.
---

# Concept

A normal function computes everything and returns once. A **generator function** uses \`yield\` instead, and hands back values **one at a time**, pausing between them.

\`\`\`python run
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for number in countdown(3):
    print(number)
\`\`\`

Calling \`countdown(3)\` doesn't run the body yet. It gives you a **generator object**. Each time something asks for the next value (a \`for\` loop, or \`next()\`), Python runs the body up to the next \`yield\`, hands over that value, and **freezes right there**, with all the local variables intact, until it's asked again.

\`\`\`python run
def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(2)
print(next(gen))
print(next(gen))
print(next(gen, "done"))
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"yield pauses; next() resumes","steps":[{"label":"next(gen)","detail":"run until the next yield"},{"label":"yield value","detail":"hand it over and freeze"},{"label":"next(gen) again","detail":"carry on from where it froze"}]}
\`\`\`

### Why bother?

Because values are produced **on demand**, a generator never builds the whole list. That means:

- huge or endless sequences work, because only the current value exists;
- you can stop early without wasted work.

\`\`\`python run
def naturals():
    n = 1
    while True:
        yield n
        n += 1

for n in naturals():
    if n > 5:
        break
    print(n)
\`\`\`

That \`while True\` would hang a normal function, but a generator only runs as far as you pull it.

### Generator expressions

A list comprehension with round brackets is a lazy version:

\`\`\`python run
squares = (n * n for n in range(1, 6))
print(sum(squares))
\`\`\`

> **Careful:** a generator is **used up** once you've looped over it. A second \`for\` over the same generator object gives nothing. Call the function again for a fresh one, or use a list if you need to loop several times.

# Example: Reading in chunks

\`\`\`python example
def pairs(items):
    for i in range(0, len(items) - 1, 2):
        yield items[i], items[i + 1]

for a, b in pairs([1, 2, 3, 4, 5]):
    print(a, "and", b)

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

first = []
for value in fibonacci():
    if value > 50:
        break
    first.append(value)
print(first)
\`\`\`

\`pairs\` yields tuples, and the loop unpacks them. \`fibonacci\` never ends; the caller decides when to stop.

# Exercise: Countdown {#e1}

Define a generator function \`countdown(n)\` that yields \`n\`, \`n - 1\`, … down to \`1\`. \`list(countdown(3))\` is \`[3, 2, 1]\`, and \`countdown(0)\` yields nothing.

\`\`\`python starter
# Define countdown(n)
\`\`\`

\`\`\`python solution
def countdown(n):
    while n > 0:
        yield n
        n -= 1
\`\`\`

## Hints

1. A loop that gives back a value each time round.
2. Which keyword hands a value out without ending the function?
3. Use a loop that runs while the counter is above zero, \`yield\` it, then reduce it.

## Explanation

Each pass through the loop yields the current number and then lowers it. When the condition fails, the function ends and the generator stops.

# Exercise: Multiples {#e2}

Define a generator \`multiples(k, limit)\` that yields the multiples of \`k\` that are at most \`limit\`, starting at \`k\`. \`list(multiples(3, 10))\` is \`[3, 6, 9]\`.

\`\`\`python starter
# Define multiples(k, limit)
\`\`\`

\`\`\`python solution
def multiples(k, limit):
    value = k
    while value <= limit:
        yield value
        value += k
\`\`\`

## Hints

1. Start from the first multiple and keep going until you pass the limit.
2. How do you get the next multiple from the current one?
3. Keep a variable that starts at \`k\` and goes up by \`k\` each time round a loop that checks \`<= limit\`.

## Explanation

The state (\`value\`) lives in the generator between yields, so each resumption picks up with the next multiple.

# Exercise: Endless squares {#e3}

Define a generator \`squares()\` with **no limit**: it yields \`1\`, \`4\`, \`9\`, \`16\`, … forever.

\`\`\`python starter
# Define squares()
\`\`\`

\`\`\`python solution
def squares():
    n = 1
    while True:
        yield n * n
        n += 1
\`\`\`

## Hints

1. How can a function that never ends still be useful?
2. What keeps the loop going, and what makes it hand values out?
3. \`while True:\` with a \`yield\` of the square of a counter, then add one to the counter.

## Explanation

An infinite loop is fine in a generator because the caller only pulls as many values as it wants. \`list(squares())\` would hang, but \`next()\` and \`islice\` work.

# Exercise: Only the long words {#e4}

Define a generator \`long_words(words, size)\` that yields each word with at least \`size\` letters, unchanged and in order. Use \`yield\` (not a list).

\`\`\`python starter
# Define long_words(words, size)
\`\`\`

\`\`\`python solution
def long_words(words, size):
    for word in words:
        if len(word) >= size:
            yield word
\`\`\`

## Hints

1. Loop over the words and decide about each one.
2. Where does \`yield\` go so that short words are skipped?
3. Put the \`yield\` inside the \`if\` that checks the length.

## Explanation

Short words never reach the \`yield\`, so they are simply never produced. No result list is built at all.

# Quiz

## What does calling a generator function do?

- [ ] Runs the whole body and returns a list
- [x] Returns a generator object without running the body yet
- [ ] Raises an error

Explanation: The body runs lazily as values are requested.

## What happens at \`yield\`?

- [ ] The function ends for good
- [x] A value is handed out and the function pauses, keeping its local variables
- [ ] The value is printed

Explanation: The next request resumes right after the \`yield\`.

## You loop over a generator twice. What does the second loop see?

- [ ] The same values again
- [x] Nothing: the generator is already used up
- [ ] An error

Explanation: A generator can be consumed once. Call the function again to get a new one.
`,Oe=`---
id: linear-regression
module: ml-first-models
title: Fitting a line
minutes: 20
goal: Fit a straight line to data with scikit-learn, predict with it, and measure how wrong it is.
summary: The simplest machine-learning model, and the idea behind all the others.
---

# Concept

**Machine learning** is finding a rule from examples instead of writing the rule by hand. The simplest rule is a straight line: \`price = slope × size + intercept\`. Given examples of sizes and prices, we let the computer find the \`slope\` and \`intercept\` that fit best.

\`\`\`python run
import numpy as np
from sklearn.linear_model import LinearRegression

sizes = np.array([[50], [70], [90], [110]])      # features: a column of numbers (2D!)
prices = np.array([150, 210, 270, 330])          # targets: what we want to predict

model = LinearRegression()
model.fit(sizes, prices)                         # learn from the examples
print(model.coef_, model.intercept_)             # slope and intercept
print(model.predict([[100]]))                    # predict an unseen house
\`\`\`

The pattern is the same for nearly every scikit-learn model:

1. **Create** the model.
2. **\`fit(X, y)\`**: learn from the examples. \`X\` is the *features* (always 2D: rows are examples, columns are features) and \`y\` is the *target*.
3. **\`predict(X_new)\`**: use what it learned.

\`\`\`diagram
{"type":"flow","caption":"The scikit-learn pattern","steps":[{"label":"model = LinearRegression()","detail":"create"},{"label":"model.fit(X, y)","detail":"learn from examples"},{"label":"model.predict(X_new)","detail":"answer for new data"}]}
\`\`\`

### How good is the fit?

A model is never perfect. We measure the **error**: how far each prediction is from the truth. The **mean squared error** (MSE) averages the squares of those gaps (squaring makes every gap positive, and punishes big misses more):

\`\`\`python run
y_true = [3, 5, 7]
y_pred = [2, 5, 9]
errors = [(t - p) ** 2 for t, p in zip(y_true, y_pred)]
print(errors, sum(errors) / len(errors))
\`\`\`

Another score, **R²**, says how much of the variation in the data the model explains: 1.0 is perfect, 0.0 is no better than always guessing the average.

> **Careful:** \`fit\` wants \`X\` as a **2D** array: \`[[50], [70]]\`, not \`[50, 70]\`. If you see "Expected 2D array, got 1D array", that's the cause. Use \`X.reshape(-1, 1)\` or a list of one-item lists. And remember: a line fitted to data that isn't linear will happily give confident-looking wrong answers.

# Example: Fit and compare

\`\`\`python example
import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1, 2, 3, 4, 5])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])        # roughly y = 2x

model = LinearRegression().fit(x.reshape(-1, 1), y)
print(round(float(model.coef_[0]), 3), round(float(model.intercept_), 3))
print(model.predict([[6]]).round(2))
print(round(model.score(x.reshape(-1, 1), y), 4))   # R squared
\`\`\`

\`x.reshape(-1, 1)\` turns a flat array into a column ("as many rows as needed, one column"). The slope comes out close to 2, and \`score\` returns R².

# Exercise: Fit a line {#e1}

Define \`fit_line(xs, ys)\` that fits a straight line with \`LinearRegression\` and returns \`(slope, intercept)\`, both **rounded to 2 decimals**, as plain Python floats. \`xs\` and \`ys\` are flat lists.

\`\`\`python starter
from sklearn.linear_model import LinearRegression

# Define fit_line(xs, ys)
\`\`\`

\`\`\`python solution
from sklearn.linear_model import LinearRegression

def fit_line(xs, ys):
    X = [[x] for x in xs]
    model = LinearRegression().fit(X, ys)
    return round(float(model.coef_[0]), 2), round(float(model.intercept_), 2)
\`\`\`

## Hints

1. What shape does \`fit\` need for the features?
2. How do you turn \`[1, 2, 3]\` into \`[[1], [2], [3]]\`?
3. Wrap each \`x\` in its own list, call \`fit\`, then read \`coef_[0]\` and \`intercept_\`.

## Explanation

The features must be 2D, one row per example. \`coef_\` is an array with one slope per feature; with a single feature, that's \`coef_[0]\`. \`float()\` converts NumPy's number into a plain Python float.

# Exercise: Predict a price {#e2}

Define \`predict_price(area)\` that trains a \`LinearRegression\` on these examples (inside the function is fine) and returns the predicted price for \`area\`, rounded to the nearest whole number:

\`\`\`python
areas  = [[50], [70], [90], [110]]
prices = [150, 210, 270, 330]
\`\`\`

\`\`\`python starter
from sklearn.linear_model import LinearRegression

# Define predict_price(area)
\`\`\`

\`\`\`python solution
from sklearn.linear_model import LinearRegression

areas = [[50], [70], [90], [110]]
prices = [150, 210, 270, 330]

def predict_price(area):
    model = LinearRegression().fit(areas, prices)
    return round(float(model.predict([[area]])[0]))
\`\`\`

## Hints

1. Follow the pattern: create, fit, predict.
2. What shape must the thing you pass to \`predict\` have?
3. \`predict\` also wants a 2D input: \`[[area]]\`, and returns an array, so take the first item.

## Explanation

The examples follow \`price = 3 × area\`, so the model learns slope 3 and predicts \`300\` for an area of 100. \`predict\` returns an array even for one input.

# Exercise: Mean squared error {#e3}

Define \`mean_squared_error(y_true, y_pred)\` (without any library) that returns the average of the squared differences between the two lists. \`mean_squared_error([3, 5, 7], [2, 5, 9])\` is \`5/3 ≈ 1.6667\`.

\`\`\`python starter
# Define mean_squared_error(y_true, y_pred)
\`\`\`

\`\`\`python solution
def mean_squared_error(y_true, y_pred):
    total = 0
    for t, p in zip(y_true, y_pred):
        total += (t - p) ** 2
    return total / len(y_true)
\`\`\`

## Hints

1. Work out each difference first, then combine them.
2. Which function pairs up two lists item by item?
3. Square each \`t - p\`, add them all up, and divide by how many there are.

## Explanation

\`zip\` walks both lists together. Squaring removes the sign, so over- and under-predictions both count as errors, and the final division makes it an average.

# Exercise: R squared {#e4}

Define \`r_squared(y_true, y_pred)\` (no library) that returns \`1 - SS_res / SS_tot\`, where \`SS_res\` is the sum of squared differences between truth and prediction, and \`SS_tot\` is the sum of squared differences between each true value and the **mean** of the true values.

\`\`\`python starter
# Define r_squared(y_true, y_pred)
\`\`\`

\`\`\`python solution
def r_squared(y_true, y_pred):
    mean = sum(y_true) / len(y_true)
    ss_res = sum((t - p) ** 2 for t, p in zip(y_true, y_pred))
    ss_tot = sum((t - mean) ** 2 for t in y_true)
    return 1 - ss_res / ss_tot
\`\`\`

## Hints

1. Two sums of squares: how wrong the model is, and how much the data varies on its own.
2. What's the "no-brainer" prediction that SS_tot compares against?
3. SS_tot uses the average of \`y_true\` as if it were the prediction for every point.

## Explanation

\`SS_tot\` is the error you'd make by always guessing the average. A model that beats that has \`SS_res < SS_tot\`, giving R² between 0 and 1; a perfect model has \`SS_res = 0\`, so R² is exactly 1.

# Quiz

## What shape does \`fit(X, y)\` expect for \`X\`?

- [ ] A flat list of numbers
- [x] A 2D array: one row per example, one column per feature
- [ ] A dictionary

Explanation: Even with a single feature, \`X\` is a column: \`[[50], [70], [90]]\`.

## What does a mean squared error of 0 mean?

- [ ] The model never ran
- [x] Every prediction was exactly right
- [ ] The data was empty

Explanation: All the differences are zero, so their squares and average are zero.

## What does \`model.predict([[100]])\` return?

- [ ] A single number
- [x] An array with one predicted value
- [ ] The slope

Explanation: \`predict\` always returns an array, one prediction per row you give it.
`,ke=`---
id: classification
module: ml-first-models
title: Classifying flowers
minutes: 22
goal: Split data into training and test sets, train a classifier, and measure its accuracy honestly.
summary: Predict a category, and learn why you must test on data the model never saw.
---

# Concept

Regression predicts a **number**. **Classification** predicts a **category**: spam or not, which digit, which species of flower. scikit-learn ships small practice datasets; the famous one is **iris**: 150 flowers, four measurements each, and the species.

\`\`\`python run
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target
print(X.shape, y.shape)               # 150 flowers, 4 measurements
print(iris.feature_names)
print(iris.target_names)              # the three species
print(X[0], iris.target_names[y[0]])
\`\`\`

### Never grade on the questions you studied

If you learn the answers to 150 questions and are then tested on the *same* 150, a perfect score proves nothing: you may just have memorised them. So we **hold some data back**. The model learns from the **training set** and is scored on the **test set** it has never seen.

\`\`\`python run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
print(len(X_train), len(X_test))
\`\`\`

\`random_state\` fixes the shuffle so you get the same split every run, which makes results reproducible.

### A first classifier: nearest neighbours

**k-nearest neighbours** classifies a new flower by looking at the \`k\` most similar flowers in the training set and taking a vote. No fancy maths, and it's surprisingly good.

\`\`\`python run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(predictions[:10])
print((predictions == y_test).mean())      # accuracy: fraction correct
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"An honest evaluation","steps":[{"label":"split","detail":"train set and a test set held back"},{"label":"fit on train","detail":"the model never sees the test set"},{"label":"score on test","detail":"accuracy = fraction of correct predictions"}]}
\`\`\`

**Accuracy** is simply the fraction of predictions that were right. It's an easy number to read, but it can mislead: if 99% of emails aren't spam, a model that always says "not spam" is 99% accurate and useless.

> **Careful:** the number-one mistake is evaluating on the training data. It makes models look better than they are, and it is the reason this lesson (and the next) exists. Never let test data influence how you train or tune.

# Example: Compare values of k

\`\`\`python example
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

for k in (1, 3, 9, 25):
    model = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)
    print(k, round(model.score(X_test, y_test), 3))
\`\`\`

\`score\` on a classifier returns accuracy. Very small \`k\` is jumpy (one odd neighbour decides), very large \`k\` blurs the groups together: a trade-off you'll meet again in the next lesson.

# Exercise: Split the data {#e1}

Define \`split(X, y)\` that returns \`X_train, X_test, y_train, y_test\` using \`train_test_split\` with \`test_size=0.25\` and \`random_state=0\`.

\`\`\`python starter
from sklearn.model_selection import train_test_split

# Define split(X, y)
\`\`\`

\`\`\`python solution
from sklearn.model_selection import train_test_split

def split(X, y):
    return train_test_split(X, y, test_size=0.25, random_state=0)
\`\`\`

## Hints

1. scikit-learn already has a function for this.
2. Which two options fix the sizes and the shuffle?
3. Call \`train_test_split(X, y, test_size=0.25, random_state=0)\` and return its result.

## Explanation

\`train_test_split\` shuffles and cuts the data, returning four pieces in the order train/test for X and then for y. 25% of 150 rows is 37 or 38 test rows.

# Exercise: Accuracy {#e2}

Define \`accuracy(y_true, y_pred)\` (no library) returning the **fraction** of positions where the two lists agree. \`accuracy([1, 0, 1, 1], [1, 1, 1, 0])\` is \`0.5\`. An empty list gives \`0.0\`.

\`\`\`python starter
# Define accuracy(y_true, y_pred)
\`\`\`

\`\`\`python solution
def accuracy(y_true, y_pred):
    if not y_true:
        return 0.0
    correct = 0
    for t, p in zip(y_true, y_pred):
        if t == p:
            correct += 1
    return correct / len(y_true)
\`\`\`

## Hints

1. Count the hits, then divide by the total.
2. What should happen with no data at all?
3. Handle the empty list first so you never divide by zero; otherwise loop over pairs with \`zip\` and count the matches.

## Explanation

Accuracy is \`correct / total\`. Guarding the empty case avoids a \`ZeroDivisionError\`.

# Exercise: How good is k-NN? {#e3}

Define \`knn_accuracy(k)\` that loads iris with \`load_iris(return_X_y=True)\`, splits it with \`test_size=0.3, random_state=42\`, trains a \`KNeighborsClassifier(n_neighbors=k)\` on the training part, and returns the accuracy on the test part as a float.

\`\`\`python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

# Define knn_accuracy(k)
\`\`\`

\`\`\`python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

def knn_accuracy(k):
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X_train, y_train)
    return float(model.score(X_test, y_test))
\`\`\`

## Hints

1. Load, split, create, fit, score.
2. Which part of the data is the model allowed to see while fitting?
3. Fit on \`X_train, y_train\`; call \`model.score(X_test, y_test)\`.

## Explanation

\`score\` evaluates on data the model never trained on, which is what makes the number honest. On iris, nearly any reasonable \`k\` scores above 90%.

# Exercise: Name that flower {#e4}

Define \`predict_species(measurements)\` where \`measurements\` is a list of four numbers (sepal length, sepal width, petal length, petal width). Train a \`KNeighborsClassifier(n_neighbors=3)\` on **all** the iris data and return the predicted species **name** (like \`"setosa"\`).

\`\`\`python starter
from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier

# Define predict_species(measurements)
\`\`\`

\`\`\`python solution
from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier

def predict_species(measurements):
    iris = load_iris()
    model = KNeighborsClassifier(n_neighbors=3).fit(iris.data, iris.target)
    label = model.predict([measurements])[0]
    return str(iris.target_names[label])
\`\`\`

## Hints

1. Predictions are numbers 0, 1, 2. Where do the names live?
2. What shape does \`predict\` need for one flower?
3. \`iris.target_names[label]\` turns a number into a name; give \`predict\` a list containing your one list of four values.

## Explanation

The model works with class numbers; \`target_names\` translates them back. For a final model you've already evaluated, using all the data to train is normal: more examples, better model.

# Quiz

## Why do we hold back a test set?

- [ ] To make training faster
- [x] To measure how the model does on data it has never seen
- [ ] Because scikit-learn requires it

Explanation: A model's score on its own training data says little: it may have simply memorised it.

## What does \`random_state=42\` do in \`train_test_split\`?

- [ ] Makes the split better
- [x] Makes the shuffle repeatable, so you get the same split every time
- [ ] Sets the test size

Explanation: Fixing the random seed makes experiments reproducible.

## In k-nearest neighbours, what is \`k\`?

- [ ] The number of features
- [x] How many nearby training examples vote on the answer
- [ ] The accuracy

Explanation: The prediction is the most common class among the \`k\` closest training points.
`,Ae=`---
id: overfitting
module: ml-first-models
title: Overfitting
minutes: 22
goal: Recognise overfitting from the gap between training and test scores, and tune a model with cross-validation.
summary: A model that memorises its homework fails the exam. Learn to see it coming.
---

# Concept

A model can be **too good at the training data**. If it's flexible enough, it will memorise every quirk and every bit of noise, and then do worse on anything new. That's **overfitting**.

A **decision tree** is a good way to see it: it asks a series of yes/no questions about the features. You control how many questions deep it may go with \`max_depth\`.

\`\`\`python run
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

for depth in (1, 2, 3, None):
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    print(depth, round(tree.score(X_train, y_train), 3), round(tree.score(X_test, y_test), 3))
\`\`\`

Each row shows the depth limit, then the accuracy on the **training** set and on the **test** set. \`None\` means no limit at all.

\`\`\`diagram
{"type":"flow","caption":"Under-fit, good fit, over-fit","steps":[{"label":"too simple","detail":"low train score, low test score: underfitting"},{"label":"just right","detail":"both scores high and close together"},{"label":"too flexible","detail":"train near 100%, test lower: overfitting"}]}
\`\`\`

### Reading the gap

- **Both scores low:** the model is too simple (*underfitting*). Give it more freedom.
- **Training score far above test score:** the model memorised (*overfitting*). Give it less freedom, or more data.

The size of the **gap** is the tell. A perfect training score is *not* good news by itself.

### A steadier estimate: cross-validation

One train/test split can be lucky or unlucky. **Cross-validation** splits the data several ways (5 folds), trains and scores on each, and averages:

\`\`\`python run
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

X, y = load_iris(return_X_y=True)
scores = cross_val_score(DecisionTreeClassifier(max_depth=3, random_state=0), X, y, cv=5)
print(scores.round(3), scores.mean().round(3))
\`\`\`

> **Careful:** don't pick settings by looking at the test set over and over: each peek leaks a bit of the answer into your choices, and the test score stops being honest. Compare settings with cross-validation on the training data, and use the test set once at the end.

# Example: Finding a good depth

\`\`\`python example
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

X, y = load_iris(return_X_y=True)
for depth in range(1, 7):
    model = DecisionTreeClassifier(max_depth=depth, random_state=0)
    print(depth, round(cross_val_score(model, X, y, cv=5).mean(), 3))
\`\`\`

Very shallow trees underfit; past a few levels the score stops improving (and on noisier data it would get worse). The best choice is the **simplest** model that scores well.

# Exercise: Train and test scores {#e1}

Define \`scores(depth)\` that loads iris, splits it with \`test_size=0.3, random_state=1\`, trains \`DecisionTreeClassifier(max_depth=depth, random_state=0)\` on the training part, and returns the tuple \`(train_accuracy, test_accuracy)\`.

\`\`\`python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Define scores(depth)
\`\`\`

\`\`\`python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

def scores(depth):
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    return float(tree.score(X_train, y_train)), float(tree.score(X_test, y_test))
\`\`\`

## Hints

1. Two scores from one trained model.
2. Which data goes in each \`score\` call?
3. \`tree.score(X_train, y_train)\` and \`tree.score(X_test, y_test)\`.

## Explanation

\`score\` is accuracy on whatever data you give it. Comparing the two numbers is how you measure overfitting.

# Exercise: Spot the overfit {#e2}

Define \`gap(depth)\` that returns how much better the model does on the training set than on the test set: \`train_accuracy - test_accuracy\` (use the same recipe as \`scores\`). A **negative or zero** gap means no overfitting.

\`\`\`python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# Define gap(depth)
\`\`\`

\`\`\`python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

def gap(depth):
    X, y = load_iris(return_X_y=True)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    return float(tree.score(X_train, y_train) - tree.score(X_test, y_test))
\`\`\`

## Hints

1. It's the same experiment as before, with a different thing returned.
2. Which of the two scores should be subtracted from which?
3. Return the training score minus the test score.

## Explanation

A big positive gap means the model knows its training data much better than new data: classic overfitting.

# Exercise: Cross-validated score {#e3}

Define \`cv_score(depth)\` that returns the **mean** 5-fold cross-validation accuracy (\`cross_val_score(..., cv=5)\`) of \`DecisionTreeClassifier(max_depth=depth, random_state=0)\` on **all** of iris.

\`\`\`python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

# Define cv_score(depth)
\`\`\`

\`\`\`python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

def cv_score(depth):
    X, y = load_iris(return_X_y=True)
    model = DecisionTreeClassifier(max_depth=depth, random_state=0)
    return float(cross_val_score(model, X, y, cv=5).mean())
\`\`\`

## Hints

1. \`cross_val_score\` does the splitting and fitting for you.
2. What does it return, and how do you turn that into one number?
3. Pass the (unfitted) model, \`X\`, \`y\` and \`cv=5\`, then take \`.mean()\` of the result.

## Explanation

You hand \`cross_val_score\` an *unfitted* model: it fits a fresh copy on each fold. The mean of the five scores is a steadier estimate than any single split.

# Exercise: Choose the depth {#e4}

Define \`best_depth(depths)\` that returns the depth from the list with the highest \`cv_score\`. If several are equally good, return the **smallest** (simpler is better). Reuse the same recipe as in the previous exercise.

\`\`\`python starter
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

# Define best_depth(depths)
\`\`\`

\`\`\`python solution
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

def cv_score(depth):
    X, y = load_iris(return_X_y=True)
    model = DecisionTreeClassifier(max_depth=depth, random_state=0)
    return float(cross_val_score(model, X, y, cv=5).mean())

def best_depth(depths):
    best = None
    best_score = -1.0
    for depth in sorted(depths):
        score = cv_score(depth)
        if score > best_score:
            best, best_score = depth, score
    return best
\`\`\`

## Hints

1. Score each candidate, and remember the best so far.
2. How do you make ties go to the smaller depth?
3. Go through the depths in increasing order and only replace the best when a score is **strictly** greater.

## Explanation

Checking depths smallest-first, and replacing only on a strictly better score, keeps the simplest of any tie. This is the idea behind *hyperparameter tuning*: try settings, compare honestly, keep the best.

# Quiz

## A model scores 100% on training data and 80% on test data. What is this?

- [ ] Underfitting
- [x] Overfitting
- [ ] A perfect model

Explanation: The big gap shows it learned the training set, noise included, rather than the underlying pattern.

## What does cross-validation do?

- [ ] Trains on the test set
- [x] Splits the data several ways and averages the scores for a steadier estimate
- [ ] Makes the model deeper

Explanation: Averaging over several train/validation splits reduces the luck of any single split.

## Why shouldn't you tune settings by repeatedly checking the test score?

- [ ] It's slow
- [x] Each look leaks information, so the test score stops being an honest estimate
- [ ] scikit-learn forbids it

Explanation: If you choose the setting that scores best on the test set, you've fitted to the test set too.
`,je=`---
id: text-adventure
module: prj-builds
title: Project: a text adventure
minutes: 25
goal: Model a small world with dictionaries and write the functions that let a player move through it.
summary: Rooms, exits and a walk-through, built from dictionaries and loops.
---

# Concept

Old text adventures ("You are in a dark cave. Exits: north, east") are made of surprisingly little: a **map** of places, and a few functions to describe and move around it. You already know everything you need.

The world is a **dictionary of dictionaries**. Each room has a description and its exits, which map a direction to the name of another room:

\`\`\`python run
rooms = {
    "hall":    {"text": "A draughty hall.",        "exits": {"north": "kitchen", "east": "library"}},
    "kitchen": {"text": "Pots hang from hooks.",   "exits": {"south": "hall"}},
    "library": {"text": "Dust and old books.",     "exits": {"west": "hall"}},
}

room = "hall"
print(rooms[room]["text"])
print(sorted(rooms[room]["exits"]))
print(rooms[room]["exits"]["north"])
\`\`\`

Notice that rooms refer to **each other by name**, not by holding the other room. That keeps the data simple and lets the map loop back on itself.

### The plan

A game is just a loop over three questions:

1. **Where am I?** (a variable holding a room name)
2. **What do I see?** (look up the room, print its text and exits)
3. **Where can I go?** (look up the direction in the exits, move if it exists)

\`\`\`diagram
{"type":"flow","caption":"One turn of the game","steps":[{"label":"describe","detail":"print the current room and its exits"},{"label":"read a command","detail":"a direction like north"},{"label":"move","detail":"if the exit exists, change the current room"}]}
\`\`\`

You'll build the pieces as small, testable functions, which is how real programs are made: functions with one job that are easy to check, put together by a short main loop.

> **Careful:** looking up an exit that doesn't exist (\`exits["up"]\`) raises a \`KeyError\`. A game must expect players to try silly things. Use \`.get()\` or check with \`in\` first, and decide what happens: usually a polite "you can't go that way", never a crash.

# Example: A tiny game loop

\`\`\`python example
rooms = {
    "hall":    {"text": "A draughty hall.",      "exits": {"north": "kitchen"}},
    "kitchen": {"text": "Pots hang from hooks.", "exits": {"south": "hall"}},
}

room = "hall"
for command in ["north", "up", "south", "quit"]:
    if command == "quit":
        print("Goodbye!")
        break
    exits = rooms[room]["exits"]
    if command in exits:
        room = exits[command]
        print("You walk", command, "to the", room + ".", rooms[room]["text"])
    else:
        print("You can't go", command + ".")
\`\`\`

The commands come from a list so you can run it without typing; in a real game each one would come from \`input()\`.

# Exercise: Describe a room {#e1}

Define \`describe(rooms, name)\` that returns two lines of text joined by a newline: the room's text, then \`"Exits: "\` followed by its exit directions **in alphabetical order**, separated by \`", "\`. A room with no exits shows \`"Exits: none"\`.

\`\`\`python starter
# Define describe(rooms, name)
\`\`\`

\`\`\`python solution
def describe(rooms, name):
    room = rooms[name]
    exits = sorted(room["exits"])
    listing = ", ".join(exits) if exits else "none"
    return room["text"] + "\\n" + "Exits: " + listing
\`\`\`

## Hints

1. You need pieces from inside the room dictionary.
2. How do you get the directions, in order, as text?
3. \`sorted()\` on a dictionary gives its keys in order; \`", ".join(...)\` joins them. Handle the empty case separately.

## Explanation

Sorting makes the output predictable no matter how the exits were written down. Joining an empty list would give an empty string, so the "none" case needs its own branch.

# Exercise: Move {#e2}

Define \`move(rooms, name, direction)\` that returns the name of the room you end up in. If the current room has an exit in that direction, return its destination; otherwise return the **same** room name (you stay put).

\`\`\`python starter
# Define move(rooms, name, direction)
\`\`\`

\`\`\`python solution
def move(rooms, name, direction):
    exits = rooms[name]["exits"]
    if direction in exits:
        return exits[direction]
    return name
\`\`\`

## Hints

1. Two possible outcomes: you go somewhere, or you don't.
2. How do you check safely whether a direction exists?
3. Look at the room's \`exits\` dictionary: if the direction is a key, return its value; otherwise return the room you started in.

## Explanation

The \`in\` test prevents the \`KeyError\` for impossible directions. Returning the same name means a bad move is harmless: callers don't need special cases.

# Exercise: Walk a route {#e3}

Define \`walk(rooms, start, directions)\` that follows a list of directions from \`start\` and returns the **list of rooms visited**, beginning with \`start\`. Impossible directions are ignored (you stay put, and nothing is added to the list).

\`\`\`python starter
# Define walk(rooms, start, directions)
\`\`\`

\`\`\`python solution
def walk(rooms, start, directions):
    visited = [start]
    current = start
    for direction in directions:
        exits = rooms[current]["exits"]
        if direction in exits:
            current = exits[direction]
            visited.append(current)
    return visited
\`\`\`

## Hints

1. Keep track of where you are and where you've been.
2. When should a room be added to the list?
3. For each direction, move only if the exit exists, and append the new room only after a successful move.

## Explanation

\`current\` changes as you move; \`visited\` is the trail. A rejected move changes neither, so the trail contains only real steps.

# Exercise: Play a script {#e4}

Define \`play(rooms, start, commands)\` that returns a **list of the messages** a game would print. For each command:

- \`"quit"\` ends the game, adding \`"Goodbye!"\`;
- a valid direction adds \`"You go <direction> to the <room>."\`;
- anything else adds \`"You can't go <command>."\`.

For example, from a hall with a north exit to the kitchen, \`["north", "up", "quit", "north"]\` gives \`["You go north to the kitchen.", "You can't go up.", "Goodbye!"]\`: nothing after \`quit\` is processed.

\`\`\`python starter
# Define play(rooms, start, commands)
\`\`\`

\`\`\`python solution
def play(rooms, start, commands):
    messages = []
    current = start
    for command in commands:
        if command == "quit":
            messages.append("Goodbye!")
            break
        exits = rooms[current]["exits"]
        if command in exits:
            current = exits[command]
            messages.append(f"You go {command} to the {current}.")
        else:
            messages.append(f"You can't go {command}.")
    return messages
\`\`\`

## Hints

1. Each command produces exactly one message, except that \`quit\` also stops everything.
2. Which statement leaves a loop early?
3. Check for \`"quit"\` first (append, then \`break\`); then decide between a valid move and an invalid one.

## Explanation

Returning messages instead of printing them makes the game logic testable and reusable: a text interface, a web page, or a test can all show them however they like. That separation of "what happens" from "how it's shown" is a habit worth keeping.

# Quiz

## How are rooms connected in the lesson's map?

- [ ] Each room contains the other rooms
- [x] Exits store the *name* of the destination room, which is looked up in the world dictionary
- [ ] By a list of numbers

Explanation: Referring by name keeps the data flat and lets rooms link back to each other.

## What should happen when the player types a direction with no exit?

- [ ] The program crashes with a \`KeyError\`
- [x] A friendly message, and the player stays where they are
- [ ] The game restarts

Explanation: Expect the unexpected: check the key exists before using it.

## Why return a list of messages from \`play\` instead of printing them?

- [ ] \`print\` is slow
- [x] The logic becomes easy to test and to reuse with a different interface
- [ ] Functions can't print

Explanation: Separating "what happens" from "how it's shown" is good design.
`,Me=`---
id: expense-tracker
module: prj-builds
title: Project: an expense tracker
minutes: 25
goal: Store records as dictionaries in a list and write functions that validate, total, group and report on them.
summary: Track spending, catch bad input, and print a tidy report.
---

# Concept

An expense tracker is the "hello world" of real programs: **data comes in** (often messy), gets **validated**, is **stored**, and is **summarised**. We'll keep every expense as a small dictionary, and all of them in a list:

\`\`\`python run
expenses = [
    {"name": "coffee", "amount": 3.5, "category": "food"},
    {"name": "bus pass", "amount": 40.0, "category": "travel"},
    {"name": "lunch", "amount": 9.0, "category": "food"},
]

print(len(expenses))
print(sum(e["amount"] for e in expenses))
for e in expenses:
    print(f'{e["name"]:<10}{e["amount"]:>8.2f}')
\`\`\`

The format \`{x:<10}\` pads text to ten characters, left-aligned, and \`{x:>8.2f}\` right-aligns a number in eight characters with two decimals: that's how reports get neat columns.

### The pieces

1. **Add** an expense, rejecting nonsense (an amount that isn't positive).
2. **Total** them.
3. **Group** by category with a dictionary: \`totals[category] = totals.get(category, 0) + amount\`.
4. **Report**: sort and format.

\`\`\`diagram
{"type":"flow","caption":"Data in, answers out","steps":[{"label":"add_expense","detail":"validate, then append a dict to the list"},{"label":"total / by_category","detail":"loop and add up"},{"label":"report","detail":"sort and format into aligned lines"}]}
\`\`\`

> **Careful:** money and floating point don't mix perfectly: \`0.1 + 0.2\` is \`0.30000000000000004\`. Real systems store whole cents (integers) or use the \`decimal\` module. For this project we use floats and **round when displaying** (\`:.2f\`), and compare totals by rounding too.

# Example: Grouping with get

\`\`\`python example
expenses = [
    {"name": "coffee", "amount": 3.5, "category": "food"},
    {"name": "bus", "amount": 2.0, "category": "travel"},
    {"name": "lunch", "amount": 9.0, "category": "food"},
]

totals = {}
for e in expenses:
    totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
print(totals)

for category in sorted(totals):
    print(f"{category:<8}{totals[category]:>7.2f}")
\`\`\`

\`totals.get(category, 0)\` gives the running total so far, or \`0\` the first time a category appears. That one line replaces an \`if category in totals\` check.

# Exercise: Add an expense {#e1}

Define \`add_expense(expenses, name, amount, category)\` that appends a dictionary with the keys \`"name"\`, \`"amount"\` and \`"category"\` to the list. If \`amount\` is not greater than zero, raise a \`ValueError\` instead and add nothing.

\`\`\`python starter
# Define add_expense(expenses, name, amount, category)
\`\`\`

\`\`\`python solution
def add_expense(expenses, name, amount, category):
    if amount <= 0:
        raise ValueError("amount must be positive")
    expenses.append({"name": name, "amount": amount, "category": category})
\`\`\`

## Hints

1. Check first, then store.
2. Which statement stops a function with an error?
3. \`if amount <= 0:\` then \`raise ValueError(...)\`; otherwise \`append\` a new dictionary.

## Explanation

Validating at the door means the rest of the program can trust the data. Raising an error is better than silently storing a nonsense amount.

# Exercise: Total {#e2}

Define \`total(expenses)\` that returns the sum of all amounts, rounded to 2 decimals. An empty list gives \`0\`.

\`\`\`python starter
# Define total(expenses)
\`\`\`

\`\`\`python solution
def total(expenses):
    return round(sum(e["amount"] for e in expenses), 2)
\`\`\`

## Hints

1. You need every amount, from every dictionary.
2. What built-in adds numbers up?
3. Feed \`sum\` the \`amount\` of each expense (a generator expression), then \`round(..., 2)\`.

## Explanation

Rounding hides the tiny floating-point errors from adding many decimals together.

# Exercise: Totals by category {#e3}

Define \`by_category(expenses)\` that returns a dictionary mapping each category to the total spent in it (rounded to 2 decimals).

\`\`\`python starter
# Define by_category(expenses)
\`\`\`

\`\`\`python solution
def by_category(expenses):
    totals = {}
    for e in expenses:
        totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
    return {category: round(amount, 2) for category, amount in totals.items()}
\`\`\`

## Hints

1. A dictionary where each key keeps a running total.
2. What do you use the first time you meet a category?
3. \`totals.get(category, 0) + amount\`, then round when you build the final dictionary.

## Explanation

\`.get(key, 0)\` supplies the starting value for a new category. Rounding once at the end, instead of at every step, keeps the numbers accurate.

# Exercise: The report {#e4}

Define \`report(expenses)\` that returns a multi-line string with one line per category, **sorted by category name**, formatted as the category left-aligned in 10 characters followed by the total right-aligned in 8 characters with 2 decimals, and then a final line \`"TOTAL"\` padded the same way with the grand total. Lines are joined with \`"\\n"\` and there is no trailing newline.

For \`food\` 12.5 and \`travel\` 40, the result is:

\`\`\`
food         12.50
travel       40.00
TOTAL        52.50
\`\`\`

\`\`\`python starter
# Define report(expenses)
\`\`\`

\`\`\`python solution
def report(expenses):
    totals = {}
    for e in expenses:
        totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]
    lines = [f"{category:<10}{amount:>8.2f}" for category, amount in sorted(totals.items())]
    lines.append(f"{'TOTAL':<10}{sum(totals.values()):>8.2f}")
    return "\\n".join(lines)
\`\`\`

## Hints

1. You already know how to total by category.
2. What format specification pads and aligns?
3. \`f"{name:<10}{value:>8.2f}"\` for each line, \`sorted()\` for the order, then \`"\\n".join(lines)\`.

## Explanation

The format spec \`<10\` pads on the right to ten characters, \`>8.2f\` right-aligns a two-decimal number in eight. Building a list of lines and joining them avoids a stray trailing newline.

# Quiz

## What does \`totals.get(category, 0)\` return for a category not yet in \`totals\`?

- [ ] It raises a \`KeyError\`
- [x] \`0\`
- [ ] \`None\`

Explanation: The second argument is the default for a missing key.

## Why raise an error for a negative amount instead of storing it?

- [ ] Python forbids negative numbers
- [x] Bad data should be stopped at the door, so the rest of the program can trust what's stored
- [ ] To make the program run faster

Explanation: Validating when data enters means you don't need to defend against it everywhere else.

## What does \`f"{x:>8.2f}"\` do?

- [ ] Rounds \`x\` to 8 decimals
- [x] Right-aligns \`x\` in 8 characters with 2 decimals
- [ ] Converts \`x\` to a string of length 2

Explanation: \`>\` aligns right, \`8\` is the width, \`.2f\` is two decimal places.
`,Ne=`---
id: data-dashboard
module: prj-builds
title: Project: a sales dashboard
minutes: 28
goal: Load CSV data with pandas, answer questions about it, and put the answers on a chart.
summary: From raw rows to a two-panel dashboard, using everything from the data-science track.
---

# Concept

A **dashboard** is a few charts and numbers that answer the questions someone actually has. Here the question is about sales: *how do we do month by month, and which product earns the most?*

The data arrives as text in **CSV** form (comma-separated values), the format spreadsheets export. \`pandas\` reads it straight into a DataFrame:

\`\`\`python run
import io
import pandas as pd

csv_text = """month,product,amount
2024-01,pens,120
2024-01,books,300
2024-02,pens,150
2024-02,books,280
2024-03,pens,90
"""

df = pd.read_csv(io.StringIO(csv_text))
print(df)
print(df.dtypes)
\`\`\`

\`io.StringIO(text)\` makes a string behave like a file, so you don't need a real file here. With a real file you'd write \`pd.read_csv("sales.csv")\`.

### Answering questions

Every question is a \`groupby\`, as in the pandas lesson:

\`\`\`python run
import io
import pandas as pd

df = pd.read_csv(io.StringIO("month,product,amount\\n2024-01,pens,120\\n2024-01,books,300\\n2024-02,pens,150\\n"))
print(df.groupby("month")["amount"].sum())
print(df.groupby("product")["amount"].sum().idxmax())    # the label with the biggest total
\`\`\`

### Two charts, one figure

\`plt.subplots(1, 2)\` gives a figure with two axes side by side, so one picture can hold a trend line and a comparison:

\`\`\`python run
import matplotlib.pyplot as plt

fig, (trend, compare) = plt.subplots(1, 2, figsize=(9, 3.5))
trend.plot(["Jan", "Feb", "Mar"], [420, 430, 90], marker="o")
trend.set_title("Sales by month")
compare.bar(["books", "pens"], [580, 360])
compare.set_title("Sales by product")
fig.tight_layout()
plt.show()
\`\`\`

\`\`\`diagram
{"type":"flow","caption":"From file to picture","steps":[{"label":"read_csv","detail":"text becomes a DataFrame"},{"label":"groupby + sum","detail":"one number per month, one per product"},{"label":"two axes","detail":"a line for the trend, bars for the comparison"}]}
\`\`\`

> **Careful:** always **look at your data first** (\`df.head()\`, \`df.dtypes\`). A column that looks numeric but was read as text, a missing header, or extra blank rows will quietly break everything after. Summaries are only as good as the table they came from.

# Example: Putting it together

\`\`\`python example
import io
import pandas as pd
import matplotlib.pyplot as plt

CSV = """month,product,amount
2024-01,pens,120
2024-01,books,300
2024-02,pens,150
2024-02,books,280
2024-03,pens,90
2024-03,books,310
"""

df = pd.read_csv(io.StringIO(CSV))
by_month = df.groupby("month")["amount"].sum()
by_product = df.groupby("product")["amount"].sum()

fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3.5))
left.plot(by_month.index, by_month.values, marker="o")
left.set_title("Sales by month")
right.bar(by_product.index, by_product.values)
right.set_title("Sales by product")
fig.tight_layout()
plt.show()
print("Best product:", by_product.idxmax())
\`\`\`

\`.index\` holds the group labels and \`.values\` the totals: exactly the x and y that Matplotlib needs.

# Exercise: Load the data {#e1}

Define \`load(csv_text)\` that returns a DataFrame parsed from the CSV text (the first line is the header).

\`\`\`python starter
import io
import pandas as pd

# Define load(csv_text)
\`\`\`

\`\`\`python solution
import io
import pandas as pd

def load(csv_text):
    return pd.read_csv(io.StringIO(csv_text))
\`\`\`

## Hints

1. pandas can read CSV; the trick is giving it text instead of a file.
2. Which standard-library tool makes a string look like a file?
3. Wrap the text in \`io.StringIO(...)\` and hand it to \`pd.read_csv\`.

## Explanation

\`StringIO\` is an in-memory file. \`read_csv\` then handles the header, the commas and the types of each column.

# Exercise: Monthly totals {#e2}

Define \`monthly_totals(df)\` that returns a **dictionary** from month to the total \`amount\` for that month.

\`\`\`python starter
import pandas as pd

# Define monthly_totals(df)
\`\`\`

\`\`\`python solution
import pandas as pd

def monthly_totals(df):
    return df.groupby("month")["amount"].sum().to_dict()
\`\`\`

## Hints

1. Group the rows, then add up one column.
2. Which column do you group by, and which do you sum?
3. \`groupby("month")["amount"].sum()\`, converted with \`to_dict()\`.

## Explanation

\`groupby\` splits by month, \`sum\` collapses each month's amounts, and \`to_dict()\` gives a plain dictionary.

# Exercise: Best product {#e3}

Define \`best_product(df)\` that returns the **name of the product** with the largest total \`amount\` across all months.

\`\`\`python starter
import pandas as pd

# Define best_product(df)
\`\`\`

\`\`\`python solution
import pandas as pd

def best_product(df):
    return df.groupby("product")["amount"].sum().idxmax()
\`\`\`

## Hints

1. Total per product first.
2. Which method returns the *label* of the biggest value, rather than the value itself?
3. Group by product, sum, then \`idxmax()\`.

## Explanation

\`idxmax()\` returns the index label (here the product name) of the maximum value; \`max()\` would only give the number.

# Exercise: The dashboard {#e4}

Define \`dashboard(df)\` that returns a Matplotlib **figure** with **two axes**: the first a line chart of the monthly totals (title \`"Sales by month"\`), the second a bar chart of the product totals (title \`"Sales by product"\`).

\`\`\`python starter
import matplotlib.pyplot as plt

# Define dashboard(df)
\`\`\`

\`\`\`python solution
import matplotlib.pyplot as plt

def dashboard(df):
    by_month = df.groupby("month")["amount"].sum()
    by_product = df.groupby("product")["amount"].sum()
    fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3.5))
    left.plot(by_month.index, by_month.values, marker="o")
    left.set_title("Sales by month")
    right.bar(by_product.index, by_product.values)
    right.set_title("Sales by product")
    fig.tight_layout()
    return fig
\`\`\`

## Hints

1. One figure, two axes next to each other.
2. What do \`groupby\` results give you for x and for y?
3. \`.index\` for the labels and \`.values\` for the numbers; \`plt.subplots(1, 2)\` for the two axes; return the figure.

## Explanation

Each panel answers one question. Returning the figure makes the dashboard easy to show or save, and easy to test.

# Quiz

## What does \`io.StringIO(text)\` let you do?

- [ ] Convert text to numbers
- [x] Treat a string as if it were a file
- [ ] Download the text

Explanation: Functions like \`pd.read_csv\` accept file-like objects, so an in-memory string works too.

## \`df.groupby("product")["amount"].sum().idxmax()\` returns...

- [ ] The biggest amount
- [x] The product whose total is biggest
- [ ] The number of products

Explanation: \`idxmax\` gives the label (index) where the maximum occurs.

## What should you do right after loading new data?

- [ ] Nothing, pandas is always right
- [x] Look at it: \`head()\`, \`dtypes\`, shape
- [ ] Sort it

Explanation: Spotting wrong types or odd rows early saves confusing bugs later.
`,_=(...e)=>({$tuple:e}),v=(...e)=>({$set:e}),y=(...e)=>({$dict:e}),b=e=>{if(typeof e==`object`&&e){if(`$tuple`in e)return`(${e.$tuple.map(b).join(`, `)}${e.$tuple.length===1?`,`:``})`;if(`$set`in e)return`{${e.$set.map(b).join(`, `)}}`;if(`$dict`in e)return`{${e.$dict.map(([e,t])=>`${b(e)}: ${b(t)}`).join(`, `)}}`}return JSON.stringify(e)??`None`},x=(e,t,n,r={})=>({kind:`call`,name:r.name??`${e}(${t.map(b).join(`, `)}) → ${b(n)}`,fn:e,args:t,kwargs:r.kwargs,expected:n,hidden:r.hidden,hint:r.hint,stdin:r.stdin}),S=(e,t,n={})=>({kind:`output`,name:n.name??(e.length?`prints the right output for input ${e.map(e=>JSON.stringify(e)).join(`, `)}`:`prints the right output`),expected:t,stdin:e,hidden:n.hidden,hint:n.hint}),C=(e,t,n={})=>({kind:`var`,name:n.name??`${e} is ${b(t)}`,variable:e,expected:t,hidden:n.hidden,hint:n.hint,stdin:n.stdin}),w=(e,t,n={})=>({kind:`check`,name:e,code:t,hidden:n.hidden,hint:n.hint,stdin:n.stdin}),T=(e,t,n={})=>w(n.name??`prints “${t}” for input ${e.map(e=>JSON.stringify(e)).join(`, `)}`,String.raw`lines = [l for l in out.splitlines() if l.strip()]
got = lines[-1].strip() if lines else "(nothing)"
assert got == ${JSON.stringify(t)}, f"The last line your program prints should be {${JSON.stringify(t)}!r}, but it is {got!r}."`,{...n,stdin:e}),E=e=>`json.loads(${JSON.stringify(JSON.stringify(e))})`,D=e=>String.raw`import contextlib, io, json
code = src
swaps = ${E(e)}
for old, new in swaps:
    assert old in code, f"Keep the line {old!r} as it is in the starter code."
    code = code.replace(old, new)
what = "; ".join(new for _, new in swaps)`,O=(e,t,n,r={})=>w(e,String.raw`${D(t)}
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    exec(code, {"__name__": "__main__"})
got = buf.getvalue().strip()
want = ${E(n.trim())}
assert got == want, f"With {what!r}, your program should print {want!r}, but it printed {got!r}."`,{hidden:!0,hint:r.hint,stdin:r.stdin}),k=(e,t,n,r,i={})=>w(e,String.raw`${D(t)}
scope = {"__name__": "__main__"}
exec(code, scope)
got = scope.get(${E(n)}, "(not defined)")
want = ${E(r)}
assert equal(got, want), f"With {what!r}, ${n} should be {want!r}, but it is {got!r}."`,{hidden:!0,hint:i.hint,stdin:i.stdin}),A=(e,t,n,r={})=>{let i=`${e}(${[...t.map(e=>JSON.stringify(e)),...Object.entries(r.kwargs??{}).map(([e,t])=>`${e}=${JSON.stringify(t)}`)].join(`, `)})`;return w(r.name??`${i} prints ${JSON.stringify(n.trim())}`,String.raw`import contextlib, io, json
name = ${E(e)}
if name not in ns:
    fail(f"I can't find a function called {name}. Define it with def {name}(...):")
args = ${E(t)}
kwargs = ${E(r.kwargs??{})}
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    ns[name](*args, **kwargs)
got = buf.getvalue()
want = ${E(n)}
assert got.strip() == want.strip(), f"Calling ${i.replace(/"/g,`'`)} should print {want.strip()!r}, but it printed {got.strip()!r}."`,{hidden:r.hidden,hint:r.hint})},j=e=>w(`calls itself`,String.raw`assert src.count("${e}(") >= 2, "A recursive function calls itself: ${e} should appear inside its own body."`,{hidden:!0}),Pe={e1:[x(`sum_to`,[0],0),x(`sum_to`,[5],15),x(`sum_to`,[1],1,{hidden:!0}),x(`sum_to`,[100],5050,{hidden:!0}),j(`sum_to`)],e2:[x(`count_digits`,[7],1),x(`count_digits`,[2024],4),x(`count_digits`,[0],1),x(`count_digits`,[1e5],6,{hidden:!0}),j(`count_digits`),w(`does not convert to text`,String.raw`assert "str(" not in src and "len(" not in src, "Do it with arithmetic only: no str() or len()."`,{hidden:!0})],e3:[x(`reverse`,[`abc`],`cba`),x(`reverse`,[``],``),x(`reverse`,[`a`],`a`,{hidden:!0}),x(`reverse`,[`Pythia`],`aihtyP`,{hidden:!0}),j(`reverse`),w(`no slicing shortcut`,String.raw`assert "[::-1]" not in src and "reversed(" not in src, "Use recursion instead of the built-in shortcuts."`,{hidden:!0})],e4:[x(`flatten`,[[1,[2,[3,4]],5]],[1,2,3,4,5]),x(`flatten`,[[]],[]),x(`flatten`,[[[],[[]]]],[],{hidden:!0}),x(`flatten`,[[[`a`],`b`]],[`a`,`b`],{hidden:!0}),x(`flatten`,[[1,2,3]],[1,2,3],{hidden:!0}),j(`flatten`),w(`does not change its input`,String.raw`data = [1, [2, [3]]]
ns["flatten"](data)
assert data == [1, [2, [3]]], "flatten should build a new list and leave the original alone."`,{hidden:!0})]},M=[2,5,8,12,16,23,38],Fe={e1:[x(`binary_search`,[M,23],5),x(`binary_search`,[M,7],-1),x(`binary_search`,[M,2],0,{hidden:!0}),x(`binary_search`,[M,38],6,{hidden:!0}),x(`binary_search`,[[],1],-1,{hidden:!0}),x(`binary_search`,[[4],4],0,{hidden:!0}),w(`does not scan the whole list`,String.raw`class Counting(list):
    reads = 0
    def __getitem__(self, i):
        Counting.reads += 1
        return list.__getitem__(self, i)
big = Counting(range(0, 2000, 2))
assert ns["binary_search"](big, 1998) == 999
assert Counting.reads <= 40, f"Binary search should look at about 11 items in a list of 1000, but yours looked at {Counting.reads}."`,{hidden:!0})],e2:[x(`contains`,[M,16],!0),x(`contains`,[M,17],!1),x(`contains`,[[],1],!1,{hidden:!0}),x(`contains`,[M,38],!0,{hidden:!0}),w(`does not use in`,String.raw`assert " in items" not in src and "in items" not in src, "Use binary search, not the in operator."`,{hidden:!0})],e3:[x(`first_at_least`,[[1,3,3,8],3],1),x(`first_at_least`,[[1,3],10],2),x(`first_at_least`,[[5,6,7],1],0,{hidden:!0}),x(`first_at_least`,[[],4],0,{hidden:!0}),x(`first_at_least`,[[2,2,2,2],2],0,{hidden:!0}),x(`first_at_least`,[[1,4,9,16],5],2,{hidden:!0})],e4:[x(`count_guesses`,[37,1,100],3),x(`count_guesses`,[1,1,100],6),x(`count_guesses`,[7,7,7],1,{hidden:!0}),x(`count_guesses`,[100,1,100],7,{hidden:!0}),x(`count_guesses`,[99,1,100],6,{hidden:!0}),x(`count_guesses`,[50,1,100],1,{hidden:!0})]},N=w(`does not cheat with sorted() or .sort()`,String.raw`assert "sorted(" not in src and ".sort(" not in src, "Do the sorting yourself: no sorted() or .sort()."`,{hidden:!0}),P=e=>w(`leaves the original list alone`,String.raw`data = [3, 1, 2]
ns["${e}"](data)
assert data == [3, 1, 2], "Return a new list: don't change the list you were given."`,{hidden:!0}),Ie={e1:[x(`selection_sort`,[[5,2,9,1,5,6]],[1,2,5,5,6,9]),x(`selection_sort`,[[]],[]),x(`selection_sort`,[[1]],[1],{hidden:!0}),x(`selection_sort`,[[3,2,1]],[1,2,3],{hidden:!0}),x(`selection_sort`,[[2,-1,0,-5]],[-5,-1,0,2],{hidden:!0}),x(`selection_sort`,[[1,1,1]],[1,1,1],{hidden:!0}),N,P(`selection_sort`)],e2:[x(`insertion_sort`,[[5,2,9,1,5,6]],[1,2,5,5,6,9]),x(`insertion_sort`,[[]],[]),x(`insertion_sort`,[[4,3]],[3,4],{hidden:!0}),x(`insertion_sort`,[[1,2,3]],[1,2,3],{hidden:!0}),x(`insertion_sort`,[[9,8,7,6,5,4]],[4,5,6,7,8,9],{hidden:!0}),N,P(`insertion_sort`)],e3:[x(`merge`,[[1,4,9],[2,3,10,11]],[1,2,3,4,9,10,11]),x(`merge`,[[],[1,2]],[1,2]),x(`merge`,[[1,2],[]],[1,2],{hidden:!0}),x(`merge`,[[],[]],[],{hidden:!0}),x(`merge`,[[1,1,2],[1,3]],[1,1,1,2,3],{hidden:!0}),x(`merge`,[[5],[1,2,3]],[1,2,3,5],{hidden:!0}),N],e4:[x(`is_sorted`,[[1,2,2,7]],!0),x(`is_sorted`,[[3,1,2]],!1),x(`is_sorted`,[[]],!0),x(`is_sorted`,[[5]],!0,{hidden:!0}),x(`is_sorted`,[[1,3,2,4]],!1,{hidden:!0}),x(`is_sorted`,[[2,1]],!1,{hidden:!0}),w(`does not just compare with sorted()`,String.raw`import re
assert not re.search(r"(?<![\w.])sorted\(", src) and ".sort(" not in src, "Check the pairs yourself instead of sorting."`,{hidden:!0})]},Le={e1:[x(`count_pairs`,[[5,6,7]],3),x(`count_pairs`,[[]],0),x(`count_pairs`,[[1]],0,{hidden:!0}),x(`count_pairs`,[[1,2,3,4,5]],10,{hidden:!0}),x(`count_pairs`,[Array(20).fill(0)],190,{hidden:!0}),w(`really counts with loops`,String.raw`assert src.count("for ") >= 2, "Use two nested loops and count inside them."`,{hidden:!0})],e2:[x(`has_duplicates`,[[3,8,1,9,4,8]],!0),x(`has_duplicates`,[[1,2,3]],!1),x(`has_duplicates`,[[]],!1,{hidden:!0}),x(`has_duplicates`,[[`a`,`b`,`a`]],!0,{hidden:!0}),x(`has_duplicates`,[[7]],!1,{hidden:!0}),w(`uses a set and no nested loop`,String.raw`assert "set" in src or "{" in src, "Remember what you have seen in a set."
assert src.count("for ") <= 1 and "range(" not in src, "One loop is enough when you use a set."`,{hidden:!0}),w(`handles a large list quickly`,String.raw`import time
start = time.perf_counter()
assert ns["has_duplicates"](list(range(200_000))) is False
assert time.perf_counter() - start < 3, "That took too long: a set lookup is instant, so one pass should be quick."`,{hidden:!0})],e3:[x(`two_sum`,[[2,7,11,15],9],_(0,1)),x(`two_sum`,[[1,2,3],100],null),x(`two_sum`,[[3,3],6],_(0,1),{hidden:!0}),x(`two_sum`,[[5,1,4,9],13],_(2,3),{hidden:!0}),x(`two_sum`,[[],1],null,{hidden:!0}),x(`two_sum`,[[4],8],null,{hidden:!0}),w(`indexes are different and ordered`,String.raw`i, j = ns["two_sum"]([6, 1, 6], 12)
assert i < j and i != j, "Return two different indexes with i < j."`,{hidden:!0})],e4:[x(`most_common`,[[`a`,`b`,`a`,`c`]],`a`),x(`most_common`,[[]],null),x(`most_common`,[[1,2,2,1]],1,{hidden:!0}),x(`most_common`,[[5]],5,{hidden:!0}),x(`most_common`,[[3,3,2,2,2]],2,{hidden:!0}),w(`does not call .count()`,String.raw`assert ".count(" not in src, "Count with a dictionary in one pass instead of calling .count() repeatedly."`,{hidden:!0})]},Re={e1:[w(`evens is 2, 4, …, 20`,String.raw`import numpy as np
assert "evens" in ns, "Create a variable called evens."
assert np.array_equal(ns["evens"], np.arange(2, 21, 2)), f"evens should be the even numbers 2 to 20, but it is {ns['evens']!r}."`),w(`tens is each of those times 10`,String.raw`import numpy as np
assert "tens" in ns, "Create a variable called tens."
assert np.array_equal(ns["tens"], np.arange(2, 21, 2) * 10), f"tens should be 20, 40, …, 200, but it is {ns['tens']!r}."`),w(`they are NumPy arrays`,String.raw`import numpy as np
assert isinstance(ns["evens"], np.ndarray) and isinstance(ns["tens"], np.ndarray), "Use NumPy arrays (np.arange), not lists."`,{hidden:!0}),w(`no loop needed`,String.raw`assert "for " not in src, "You can do this without a loop."`,{hidden:!0})],e2:[w(`mean 0 and spread 1`,String.raw`import numpy as np
r = ns["standardise"](np.array([1.0, 2.0, 3.0, 4.0, 5.0]))
assert np.allclose(r.mean(), 0) and np.allclose(r.std(), 1), f"The result should have mean 0 and standard deviation 1, got mean {r.mean():.3f} and std {r.std():.3f}."`),w(`known values`,String.raw`import numpy as np
r = ns["standardise"](np.array([10.0, 20.0]))
assert np.allclose(r, [-1.0, 1.0]), f"standardise([10, 20]) should be [-1, 1], got {r!r}."`),w(`does not change its input`,String.raw`import numpy as np
a = np.array([3.0, 5.0, 9.0])
ns["standardise"](a)
assert np.array_equal(a, [3.0, 5.0, 9.0]), "Return a new array; don't modify the one you were given."`,{hidden:!0}),w(`returns an array`,String.raw`import numpy as np
assert isinstance(ns["standardise"](np.array([1.0, 2.0, 4.0])), np.ndarray)`,{hidden:!0})],e3:[w(`keeps the values above the mean`,String.raw`import numpy as np
r = ns["above_average"](np.array([1, 2, 3, 10]))
assert np.array_equal(r, [10]), f"Only 10 is above the mean (4.0); got {r!r}."`),w(`several values`,String.raw`import numpy as np
r = ns["above_average"](np.array([72, 95, 58, 88, 64]))
assert np.array_equal(r, [95, 88]), f"The mean is 75.4, so expected [95, 88]; got {r!r}."`),w(`all equal: nothing is above the mean`,String.raw`import numpy as np
r = ns["above_average"](np.array([5, 5, 5]))
assert len(r) == 0, f"Nothing is above the mean when all values are equal; got {r!r}."`,{hidden:!0}),w(`order is preserved`,String.raw`import numpy as np
assert list(ns["above_average"](np.array([9, 1, 8, 2, 7]))) == [9, 8, 7]`,{hidden:!0}),w(`uses a mask, not a loop`,String.raw`assert "for " not in src, "Use a boolean mask instead of a loop."`,{hidden:!0})],e4:[w(`row totals and column means`,String.raw`import numpy as np
rows, cols = ns["table_stats"](np.array([[1, 2, 3], [4, 5, 6]]))
assert np.array_equal(rows, [6, 15]), f"The row totals should be [6, 15], got {rows!r}."
assert np.allclose(cols, [2.5, 3.5, 4.5]), f"The column means should be [2.5, 3.5, 4.5], got {cols!r}."`),w(`a different shape`,String.raw`import numpy as np
rows, cols = ns["table_stats"](np.array([[10, 0], [0, 10], [5, 5]]))
assert np.array_equal(rows, [10, 10, 10]) and np.allclose(cols, [5, 5]), f"Got {rows!r} and {cols!r}."`,{hidden:!0}),w(`returns two 1D arrays`,String.raw`import numpy as np
rows, cols = ns["table_stats"](np.ones((2, 4)))
assert rows.shape == (2,) and cols.shape == (4,), f"Expected shapes (2,) and (4,), got {rows.shape} and {cols.shape}."`,{hidden:!0})]},F=String.raw`import pandas as pd
df = pd.DataFrame({"name": ["Ada", "Grace", "Linus", "Guido"], "age": [36, 45, 17, 18], "score": [91, 88, 72, 85]})`,ze={e1:[w(`keeps people aged 18 or over`,`${F}
r = ns["adults"](df)
assert list(r["name"]) == ["Ada", "Grace", "Guido"], f"Expected Ada, Grace and Guido (18 counts), got {list(r['name'])}."`),w(`keeps all the columns`,`${F}
assert list(ns["adults"](df).columns) == ["name", "age", "score"], "Keep every column; only filter rows."`),w(`nobody qualifies`,String.raw`import pandas as pd
r = ns["adults"](pd.DataFrame({"name": ["Kid"], "age": [9]}))
assert len(r) == 0, "No rows should be left."`,{hidden:!0}),w(`does not change the original`,`${F}
ns["adults"](df)
assert len(df) == 4`,{hidden:!0})],e2:[w(`mean per group as a dict`,String.raw`import pandas as pd
df = pd.DataFrame({"city": ["Rome", "Oslo", "Rome", "Oslo"], "amount": [10, 7, 30, 3]})
r = ns["average_by"](df, "city", "amount")
assert r == {"Oslo": 5.0, "Rome": 20.0}, f"Expected {{'Oslo': 5.0, 'Rome': 20.0}}, got {r!r}."
assert isinstance(r, dict), "Return a plain dict (use .to_dict())."`),w(`different columns`,String.raw`import pandas as pd
df = pd.DataFrame({"team": ["a", "b", "a"], "pts": [1, 5, 4], "x": [0, 0, 0]})
assert ns["average_by"](df, "team", "pts") == {"a": 2.5, "b": 5.0}`,{hidden:!0}),w(`single group`,String.raw`import pandas as pd
df = pd.DataFrame({"g": ["z", "z"], "v": [2, 4]})
assert ns["average_by"](df, "g", "v") == {"z": 3.0}`,{hidden:!0})],e3:[w(`the two best, best first`,`${F}
r = ns["top_n"](df, "score", 2)
assert list(r["name"]) == ["Ada", "Grace"], f"Expected Ada then Grace, got {list(r['name'])}."`),w(`another column`,`${F}
r = ns["top_n"](df, "age", 1)
assert list(r["name"]) == ["Grace"]`,{hidden:!0}),w(`asking for more than there are`,`${F}
assert len(ns["top_n"](df, "score", 10)) == 4`,{hidden:!0}),w(`descending order`,`${F}
scores = list(ns["top_n"](df, "score", 4)["score"])
assert scores == sorted(scores, reverse=True), f"Largest first, but got {scores}."`,{hidden:!0})],e4:[w(`adds total = price * qty`,String.raw`import pandas as pd
df = pd.DataFrame({"item": ["pen", "book"], "price": [1.5, 12.0], "qty": [10, 2]})
r = ns["with_total"](df)
assert list(r["total"]) == [15.0, 24.0], f"Expected totals [15.0, 24.0], got {list(r['total'])}."`),w(`leaves the original alone`,String.raw`import pandas as pd
df = pd.DataFrame({"item": ["pen"], "price": [2.0], "qty": [3]})
ns["with_total"](df)
assert "total" not in df.columns, "Work on a copy: the original DataFrame must not get a total column."`),w(`keeps the other columns`,String.raw`import pandas as pd
df = pd.DataFrame({"item": ["pen"], "price": [2.0], "qty": [3]})
assert list(ns["with_total"](df).columns) == ["item", "price", "qty", "total"]`,{hidden:!0}),w(`no loop needed`,String.raw`assert "for " not in src and "iterrows" not in src, "Multiply the two columns directly; no loop."`,{hidden:!0})]},Be={e1:[w(`title and labels`,String.raw`ax = ns["growth_chart"]([1, 2, 3], [2.0, 3.5, 5.0])
assert ax.get_title() == "Growth", f"The title should be 'Growth', but it is {ax.get_title()!r}."
assert ax.get_xlabel() == "Day", f"The x label should be 'Day', but it is {ax.get_xlabel()!r}."
assert ax.get_ylabel() == "Height (cm)", f"The y label should be 'Height (cm)', but it is {ax.get_ylabel()!r}."`),w(`one line with the data`,String.raw`ax = ns["growth_chart"]([1, 2, 3], [2.0, 3.5, 5.0])
assert len(ax.lines) == 1, f"Draw one line, but the chart has {len(ax.lines)}."
assert list(ax.lines[0].get_xdata()) == [1, 2, 3] and list(ax.lines[0].get_ydata()) == [2.0, 3.5, 5.0], "The line should plot heights against days."`),w(`returns the axes`,String.raw`from matplotlib.axes import Axes
assert isinstance(ns["growth_chart"]([1], [1]), Axes), "Return the axes (ax) at the end of the function."`,{hidden:!0}),w(`works for other data`,String.raw`ax = ns["growth_chart"]([10, 20], [1.0, 9.0])
assert list(ax.lines[0].get_ydata()) == [1.0, 9.0]`,{hidden:!0})],e2:[w(`one bar per label`,String.raw`ax = ns["bar_chart"](["a", "b", "c"], [3, 1, 2])
assert len(ax.patches) == 3, f"Expected 3 bars, found {len(ax.patches)}."
assert [round(p.get_height()) for p in ax.patches] == [3, 1, 2], "The bar heights should match the values."`),w(`labels and title`,String.raw`ax = ns["bar_chart"](["a", "b"], [1, 2])
assert [t.get_text() for t in ax.get_xticklabels()] == ["a", "b"], "The x tick labels should be the labels you were given."
assert ax.get_title() == "Totals", f"The title should be 'Totals', but it is {ax.get_title()!r}."`),w(`returns the axes`,String.raw`from matplotlib.axes import Axes
assert isinstance(ns["bar_chart"](["x"], [1]), Axes)`,{hidden:!0}),w(`a single bar`,String.raw`ax = ns["bar_chart"](["only"], [7])
assert len(ax.patches) == 1 and round(ax.patches[0].get_height()) == 7`,{hidden:!0})],e3:[w(`two lines`,String.raw`ax = ns["compare_chart"]([1, 2, 3], [1, 2, 3], [1, 4, 9])
assert len(ax.lines) == 2, f"Expected two lines, found {len(ax.lines)}."
assert list(ax.lines[1].get_ydata()) == [1, 4, 9], "The second line should plot the second series."`),w(`legend with both names`,String.raw`ax = ns["compare_chart"]([1, 2], [1, 2], [2, 1])
legend = ax.get_legend()
assert legend is not None, "Call ax.legend() to show a legend."
assert [t.get_text() for t in legend.get_texts()] == ["first", "second"], "The legend should list 'first' and 'second'."`),w(`returns the axes`,String.raw`from matplotlib.axes import Axes
assert isinstance(ns["compare_chart"]([1], [1], [1]), Axes)`,{hidden:!0}),w(`both lines share the x values`,String.raw`ax = ns["compare_chart"]([5, 6], [1, 1], [2, 2])
assert all(list(l.get_xdata()) == [5, 6] for l in ax.lines)`,{hidden:!0})]},Ve={e1:[C(`colors`,[`red`,`green`,`blue`]),w(`is a list`,String.raw`assert type(ns["colors"]) is list`,{hidden:!0})],e2:[C(`first`,72),C(`last`,88),C(`count`,5),w(`works for another list`,String.raw`ns2 = {}
exec(src.replace("[72, 85, 90, 64, 88]", "[5, 6]"), ns2)
assert (ns2["first"], ns2["last"], ns2["count"]) == (5, 6, 2), "Use index 0, index -1 and len() so it works for any list."`,{hidden:!0})],e3:[C(`fruits`,[`apple`,`blueberry`,`cherry`,`date`]),w(`changes the list itself`,String.raw`assert "append" in src, "Use append to add the new fruit."`,{hidden:!0})],e4:[x(`last_item`,[[1,2,3]],3),x(`last_item`,[[]],null,{name:`last_item([]) → None`}),x(`last_item`,[[`a`]],`a`,{hidden:!0}),x(`last_item`,[[[1],[2,3]]],[2,3],{hidden:!0})]},He={e1:[C(`first_three`,[1,2,3]),C(`last_two`,[5,6]),w(`works for another list`,String.raw`ns2 = {}
exec(src.replace("[1, 2, 3, 4, 5, 6]", "[9, 8, 7, 6, 5]"), ns2)
assert (ns2["first_three"], ns2["last_two"]) == ([9, 8, 7], [6, 5]), "Use slices, so it works for any list."`,{hidden:!0})],e2:[C(`a`,[1,2,3]),C(`b`,[1,2,3,4]),w(`b is a different list`,String.raw`assert ns["a"] is not ns["b"], "a and b should be two separate lists."`,{hidden:!0})],e3:[x(`rotate`,[[1,2,3]],[2,3,1]),x(`rotate`,[[`a`,`b`]],[`b`,`a`]),x(`rotate`,[[]],[],{hidden:!0}),x(`rotate`,[[7]],[7],{hidden:!0}),w(`does not change the original`,String.raw`original = [1, 2, 3]
ns["rotate"](original)
assert original == [1, 2, 3], "rotate should return a new list and leave its argument unchanged."`,{hidden:!0})],e4:[C(`served`,`a`),C(`queue`,[`b`,`c`]),w(`uses pop`,String.raw`assert "pop" in src, "Use pop(0) to remove and return the first item."`,{hidden:!0})]},Ue={e1:[x(`total_price`,[[3,5,8]],16),x(`total_price`,[[]],0),x(`total_price`,[[2.5,2.5]],5,{hidden:!0}),x(`total_price`,[[-1,1,10]],10,{hidden:!0}),w(`uses a loop`,String.raw`assert "for " in src, "Add the prices up with a for loop."`,{hidden:!0})],e2:[x(`count_above`,[[5,12,7,20,3],6],3),x(`count_above`,[[1,2,3],3],0,{hint:`Items equal to the limit should not be counted.`}),x(`count_above`,[[],0],0,{hidden:!0}),x(`count_above`,[[-5,-1,0],-2],2,{hidden:!0})],e3:[x(`positives`,[[5,-2,8,-7,3]],[5,8,3]),x(`positives`,[[-1,-2]],[]),x(`positives`,[[0,1]],[1],{hidden:!0,hint:`Zero is not greater than zero.`}),x(`positives`,[[]],[],{hidden:!0}),w(`does not change its input`,String.raw`data = [1, -1, 2]
ns["positives"](data)
assert data == [1, -1, 2], "positives should build a new list and leave its argument alone."`,{hidden:!0})],e4:[x(`longest_word`,[[`pear`,`banana`,`fig`]],`banana`),x(`longest_word`,[[`ab`,`cd`,`e`]],`ab`,{hint:`On a tie, return the first one.`}),x(`longest_word`,[[`solo`]],`solo`,{hidden:!0}),x(`longest_word`,[[`a`,`bb`,`ccc`,`dd`]],`ccc`,{hidden:!0})],e5:[x(`numbered`,[[`milk`,`eggs`]],[`1. milk`,`2. eggs`]),x(`numbered`,[[]],[],{hidden:!0}),x(`numbered`,[[`x`]],[`1. x`],{hidden:!0}),w(`uses enumerate`,String.raw`assert "enumerate" in src, "Use enumerate to get each item with its position."`,{hidden:!0})]},We={e1:[x(`sorted_desc`,[[3,1,2]],[3,2,1]),x(`sorted_desc`,[[]],[],{hidden:!0}),x(`sorted_desc`,[[5,5,1]],[5,5,1],{hidden:!0}),w(`does not modify the original`,String.raw`data = [1, 3, 2]
ns["sorted_desc"](data)
assert data == [1, 3, 2], "Return a new sorted list; don't sort the argument in place."`,{hidden:!0})],e2:[x(`by_length`,[[`pear`,`fig`,`banana`,`kiwi`]],[`fig`,`pear`,`kiwi`,`banana`]),x(`by_length`,[[`bb`,`a`,`cc`,`d`]],[`a`,`d`,`bb`,`cc`],{hint:`Equal lengths must keep their original order.`}),x(`by_length`,[[]],[],{hidden:!0})],e3:[x(`pairs`,[[`Ada`,`Grace`],[36,85]],[_(`Ada`,36),_(`Grace`,85)],{name:`pairs(["Ada", "Grace"], [36, 85])`}),x(`pairs`,[[],[]],[],{hidden:!0}),x(`pairs`,[[`a`,`b`,`c`],[1,2]],[_(`a`,1),_(`b`,2)],{hidden:!0,name:`pairs with lists of different lengths`}),w(`returns tuples in a list`,String.raw`r = ns["pairs"](["a"], [1])
assert isinstance(r, list) and isinstance(r[0], tuple), "Return a list of tuples."`,{hidden:!0})],e4:[C(`cheapest`,`water`),w(`works for other products`,String.raw`ns2 = {}
exec(src.replace('("water", 1.25)', '("juice", 0.5)'), ns2)
assert ns2["cheapest"] == "juice", "Compare the prices so it finds the cheapest of any list."`,{hidden:!0})]},Ge={e1:[C(`x`,3),C(`y`,4),w(`works for another point`,String.raw`ns2 = {}
exec(src.replace("(3, 4)", "(10, -2)"), ns2)
assert (ns2["x"], ns2["y"]) == (10, -2), "Unpack point instead of typing the numbers."`,{hidden:!0})],e2:[C(`a`,`right`),C(`b`,`left`),w(`does it in one line without temp`,String.raw`assert "temp" not in src and "tmp" not in src, "Swap with unpacking; no temporary variable needed."
assert "a, b = b, a" in src.replace("(", "").replace(")", ""), "Use a, b = b, a"`,{hidden:!0})],e3:[x(`min_max`,[[4,9,2,7]],_(2,9)),x(`min_max`,[[5]],_(5,5),{hidden:!0}),x(`min_max`,[[-3,-1,-8]],_(-8,-1),{hidden:!0})],e4:[x(`split_time`,[135],_(2,15)),x(`split_time`,[59],_(0,59),{hidden:!0}),x(`split_time`,[3600],_(60,0),{hidden:!0})]},Ke={e1:[C(`person`,{name:`Ada`,age:36}),w(`is a dict`,String.raw`assert type(ns["person"]) is dict`,{hidden:!0})],e2:[C(`person`,{age:37,city:`London`}),w(`uses del`,String.raw`assert "del " in src, "Use del to remove the name entry."`,{hidden:!0})],e3:[x(`price_of`,[{tea:3,cake:5},`tea`],3),x(`price_of`,[{tea:3},`soup`],0),x(`price_of`,[{},`x`],0,{hidden:!0}),x(`price_of`,[{a:0},`a`],0,{hidden:!0}),x(`price_of`,[{pie:4.5},`pie`],4.5,{hidden:!0})],e4:[x(`invert`,[{a:1,b:2}],y([1,`a`],[2,`b`])),w(`invert works with string values`,String.raw`assert ns["invert"]({"x": "p", "y": "q"}) == {"p": "x", "q": "y"}`,{hidden:!0}),w(`does not modify the original`,String.raw`d = {"a": 1}
ns["invert"](d)
assert d == {"a": 1}`,{hidden:!0})]},qe={e1:[x(`total_stock`,[{apples:5,pears:2}],7),x(`total_stock`,[{}],0),x(`total_stock`,[{a:0,b:-1,c:10}],9,{hidden:!0})],e2:[x(`count_letters`,[`aab`],{a:2,b:1}),x(`count_letters`,[``],{},{hidden:!0}),x(`count_letters`,[`banana`],{b:1,a:3,n:2},{hidden:!0}),x(`count_letters`,[`a a`],{a:2," ":1},{hidden:!0})],e3:[x(`top_scorer`,[{Ada:82,Grace:95,Linus:78}],`Grace`),x(`top_scorer`,[{solo:1}],`solo`,{hidden:!0}),x(`top_scorer`,[{a:-5,b:-2,c:-9}],`b`,{hidden:!0,hint:`What if every score is negative?`})],e4:[x(`group_by_length`,[[`a`,`bb`,`c`]],y([1,[`a`,`c`]],[2,[`bb`]])),x(`group_by_length`,[[`hi`,`yo`,`cat`]],y([2,[`hi`,`yo`]],[3,[`cat`]])),w(`empty list gives an empty dict`,String.raw`assert ns["group_by_length"]([]) == {}`,{hidden:!0}),w(`keeps the original order`,String.raw`assert ns["group_by_length"](["b", "a", "d", "c"]) == {1: ["b", "a", "d", "c"]}`,{hidden:!0})]},I=[{name:`Ada`,age:36},{name:`Grace`,age:85},{name:`Linus`,age:54}],Je={e1:[x(`names`,[I],[`Ada`,`Grace`,`Linus`],{name:`names(people) → ["Ada", "Grace", "Linus"]`}),x(`names`,[[]],[],{hidden:!0}),x(`names`,[[{name:`Solo`,age:1}]],[`Solo`],{hidden:!0})],e2:[x(`average_age`,[[{name:`a`,age:10},{name:`b`,age:20}]],15,{name:`average_age of ages 10 and 20 → 15`}),x(`average_age`,[[]],0,{hint:`What should an empty list give?`}),x(`average_age`,[I],175/3,{hidden:!0,name:`average_age of three people`})],e3:[x(`students_in`,[{math:[`Ada`,`Grace`],art:[]},`math`],[`Ada`,`Grace`]),x(`students_in`,[{math:[`Ada`]},`art`],[]),x(`students_in`,[{math:[]},`math`],[],{hidden:!0})],e4:[x(`oldest`,[I],{name:`Grace`,age:85},{name:`oldest(people) → Grace’s record`}),x(`oldest`,[[{name:`Solo`,age:7}]],{name:`Solo`,age:7},{hidden:!0}),w(`returns the dictionary itself`,String.raw`p = [{"name": "x", "age": 1}, {"name": "y", "age": 9}]
assert ns["oldest"](p) is p[1], "Return the person's whole dictionary, not just the age or name."`,{hidden:!0})]},Ye={e1:[x(`unique_count`,[[1,2,2,3,3,3]],3),x(`unique_count`,[[]],0),x(`unique_count`,[[`a`,`b`,`a`]],2,{hidden:!0}),x(`unique_count`,[[5]],1,{hidden:!0})],e2:[x(`common`,[[3,1,2,2],[2,3,4]],[2,3]),x(`common`,[[`a`],[`b`]],[]),x(`common`,[[],[1]],[],{hidden:!0}),x(`common`,[[5,5,5],[5]],[5],{hidden:!0,hint:`No duplicates in the result.`})],e3:[x(`only_in_first`,[[1,2,3,3],[3,4]],[1,2]),x(`only_in_first`,[[1],[1]],[]),x(`only_in_first`,[[`z`,`a`],[]],[`a`,`z`],{hidden:!0}),x(`only_in_first`,[[],[1]],[],{hidden:!0})],e4:[x(`has_duplicates`,[[1,2,3]],!1),x(`has_duplicates`,[[1,2,1]],!0),x(`has_duplicates`,[[]],!1,{hidden:!0}),x(`has_duplicates`,[[`a`,`b`,`c`,`a`]],!0,{hidden:!0}),w(`is a real boolean`,String.raw`assert ns["has_duplicates"]([1, 1]) is True`,{hidden:!0})]},Xe={e1:[C(`squares`,[1,4,9,16,25,36,49,64,81,100]),w(`uses a comprehension`,String.raw`assert "[" in src and " for " in src and " in " in src, "Use a list comprehension: [ ... for n in ... ]."
assert ".append" not in src, "No append needed: the comprehension builds the list."`,{hidden:!0})],e2:[x(`evens`,[[1,2,3,4,6]],[2,4,6]),x(`evens`,[[1,3]],[]),x(`evens`,[[0,-2,-3]],[0,-2],{hidden:!0}),x(`evens`,[[]],[],{hidden:!0}),w(`uses a comprehension`,String.raw`assert " for " in src and "[" in src and ".append" not in src`,{hidden:!0})],e3:[x(`lengths`,[[`ada`,`grace`]],[3,5]),x(`lengths`,[[]],[]),x(`lengths`,[[``,`a`]],[0,1],{hidden:!0})],e4:[x(`shout_long`,[[`hi`,`python`,`code`]],[`PYTHON!`,`CODE!`]),x(`shout_long`,[[`abc`,`abcd`]],[`ABCD!`],{hint:`Words of exactly 3 letters are not longer than 3.`}),x(`shout_long`,[[]],[],{hidden:!0}),x(`shout_long`,[[`ok`,`no`]],[],{hidden:!0})],e5:[x(`labels`,[[3,-1,0]],[`positive`,`not positive`,`not positive`]),x(`labels`,[[]],[],{hidden:!0}),x(`labels`,[[10]],[`positive`],{hidden:!0})]},Ze={e1:[x(`square_map`,[3],y([1,1],[2,4],[3,9])),x(`square_map`,[0],{},{hidden:!0}),x(`square_map`,[1],y([1,1]),{hidden:!0}),w(`uses a comprehension`,String.raw`assert " for " in src and "{" in src`,{hidden:!0})],e2:[x(`unique_lengths`,[[`a`,`bb`,`c`]],v(1,2)),x(`unique_lengths`,[[]],v()),x(`unique_lengths`,[[`abc`,`xyz`,`q`]],v(3,1),{hidden:!0}),w(`returns a set`,String.raw`assert type(ns["unique_lengths"](["a"])) is set, "Return a set, not a list."`,{hidden:!0})],e3:[x(`passed`,[{Ada:92,Grace:78,Linus:85},80],{Ada:92,Linus:85}),x(`passed`,[{a:1},5],{}),x(`passed`,[{a:5,b:4},5],{a:5},{hidden:!0,hint:`Is exactly the minimum a pass?`}),x(`passed`,[{},1],{},{hidden:!0})],e4:[x(`first_letters`,[[`ada`,`bo`]],{ada:`a`,bo:`b`}),x(`first_letters`,[[]],{},{hidden:!0}),x(`first_letters`,[[`zed`]],{zed:`z`},{hidden:!0})]},Qe={e1:[x(`first_repeat`,[[3,1,4,1,5,3]],1),x(`first_repeat`,[[1,2,3]],null,{name:`first_repeat([1, 2, 3]) → None`}),x(`first_repeat`,[[]],null,{hidden:!0,name:`first_repeat([]) → None`}),x(`first_repeat`,[[`a`,`b`,`b`,`a`]],`b`,{hidden:!0}),x(`first_repeat`,[[7,7]],7,{hidden:!0}),w(`uses a set to remember`,String.raw`assert "set" in src or "{" in src, "Remember the seen items in a set."`,{hidden:!0})],e2:[x(`word_counts`,[`the cat The hat`],{the:2,cat:1,hat:1}),x(`word_counts`,[``],{}),x(`word_counts`,[`a a a`],{a:3},{hidden:!0}),x(`word_counts`,[`Go go GO`],{go:3},{hidden:!0})],e3:[x(`top_n`,[{Ada:82,Grace:95,Linus:78},2],[`Grace`,`Ada`]),x(`top_n`,[{a:1},5],[`a`],{hidden:!0}),x(`top_n`,[{a:3,b:2,c:1},0],[],{hidden:!0}),x(`top_n`,[{a:1,b:9,c:5,d:7},3],[`b`,`d`,`c`],{hidden:!0})],e4:[w(`finds the shared interests`,String.raw`data = {"Ada": {"math", "code", "tea"}, "Grace": {"code", "tea", "ships"}}
assert ns["shared"](data, "Ada", "Grace") == ["code", "tea"], "Return a sorted list of what both people like."`),w(`nothing in common gives an empty list`,String.raw`data = {"a": {"x"}, "b": {"y"}}
assert ns["shared"](data, "a", "b") == []`,{hidden:!0}),w(`order of arguments does not matter`,String.raw`data = {"a": {"x", "y"}, "b": {"y", "x", "z"}}
assert ns["shared"](data, "b", "a") == ["x", "y"]`,{hidden:!0})]},$e={e1:[S([],`Hello, Pythia!
`,{name:`prints exactly “Hello, Pythia!”`}),w(`prints a single line`,`assert out.count("\\n") == 1, "The message should be on a single line."`,{hidden:!0}),w(`uses print()`,`assert "print(" in src, "Use the print() function to show the message."`,{hidden:!0})],e2:[S([],`Python is
fun
`,{name:`prints “Python is” then “fun”`}),w(`uses two print calls`,`assert src.count("print(") >= 2, "Use one print() call per line."`,{hidden:!0})],e3:[S([],`I am 14 years old
`,{name:`prints “I am 14 years old”`}),w(`uses one print call`,`assert src.count("print(") == 1, "Use a single print() call."`,{hidden:!0}),w(`14 is a number, not text`,`assert '"14"' not in src and "'14'" not in src, "Write 14 as a number, without quotes."`,{hidden:!0})]},et={e1:[C(`name`,`Ada`,{name:`name is "Ada"`}),C(`age`,14,{name:`age is the number 14`,hint:`age should be a number, so no quotes around 14.`}),w(`uses = to assign`,`assert "=" in src`,{hidden:!0})],e2:[C(`score`,15,{name:`score ends up as 15`}),S([],`15
`,{name:`prints 15`}),w(`does not just assign 15`,`assert "score = 15" not in src.replace("  ", " "), "Compute it from the old value: add 5 to score."`,{hidden:!0,hint:`Build 15 from the old score instead of typing it.`})],e3:[C(`a`,2,{name:`a is 2`}),C(`b`,1,{name:`b is 1`}),w(`does not retype the numbers`,`assert "a = 2" not in src and "b = 1\\n" not in src.split("# Swap")[-1] + "\\n", "Swap using the variables, not by typing new numbers."`,{hidden:!0,hint:`Use a third variable to hold one value while you swap.`})],e4:[C(`total`,12,{name:`total is 12`}),S([],`12
`,{name:`prints 12`}),w(`multiplies the variables`,`assert "price * quantity" in src.replace("  ", " ") or "quantity * price" in src.replace("  ", " "), "Multiply price and quantity rather than typing 12."`,{hidden:!0})]},tt={e1:[C(`count`,7),C(`price`,2.5),C(`label`,`apples`),C(`in_stock`,!0),w(`count is an int and price is a float`,String.raw`assert type(ns["count"]) is int, "count should be a whole number (int)."
assert type(ns["price"]) is float, "price should be a decimal number (float)."`,{hidden:!0}),w(`label is text and in_stock is a bool`,String.raw`assert type(ns["label"]) is str
assert type(ns["in_stock"]) is bool, "in_stock should be True (a bool), not text."`,{hidden:!0})],e2:[C(`age`,21),C(`next_year`,22),w(`age is an int, not text`,String.raw`assert type(ns["age"]) is int, "age should be a number. Convert the text first."`,{hidden:!0}),w(`converts with int()`,String.raw`assert "int(" in src, "Convert age_text with int()."`,{hidden:!0})],e3:[C(`message`,`Score: 95`),w(`message is a string built from score`,String.raw`assert "str(" in src or "f\"" in src or "f'" in src, "Convert score to text (str) before joining."
assert "95" not in src.split("# Create message")[-1].replace("score = 95", ""), "Build the message from the variable score, not by typing 95 again."`,{hidden:!0})]},nt={e1:[C(`total_seconds`,8100),w(`uses the variables, not a typed number`,String.raw`assert "hours" in src.split("# Create total_seconds")[-1] and "minutes" in src.split("# Create total_seconds")[-1], "Build total_seconds from hours and minutes."`,{hidden:!0,hint:`Use the variables hours and minutes, so it still works if they change.`}),w(`works for other values`,String.raw`ns2 = {}
exec(src.replace("hours = 2", "hours = 1").replace("minutes = 15", "minutes = 30"), ns2)
assert ns2["total_seconds"] == 5400, "With 1 hour 30 minutes the answer should be 5400."`,{hidden:!0})],e2:[C(`each`,3),C(`left_over`,2),w(`uses // and %`,String.raw`assert "//" in src and "%" in src, "Use floor division (//) and remainder (%)."`,{hidden:!0}),w(`works for other numbers`,String.raw`ns2 = {}
exec(src.replace("sweets = 17", "sweets = 23").replace("children = 5", "children = 4"), ns2)
assert (ns2["each"], ns2["left_over"]) == (5, 3), "With 23 sweets and 4 children: 5 each and 3 left over."`,{hidden:!0})],e3:[C(`area`,16),C(`volume`,64),w(`uses **`,String.raw`assert "**" in src, "Use the power operator **."`,{hidden:!0}),w(`works for other sides`,String.raw`ns2 = {}
exec(src.replace("side = 4", "side = 5"), ns2)
assert (ns2["area"], ns2["volume"]) == (25, 125)`,{hidden:!0})],e4:[C(`average`,8),w(`uses parentheses`,String.raw`assert "(" in src, "You need parentheses to make the addition happen first."`,{hidden:!0})]},rt={e1:[C(`first`,`p`),C(`last`,`n`),C(`size`,6),w(`works for other words`,String.raw`ns2 = {}
exec(src.replace('"python"', '"banana"'), ns2)
assert (ns2["first"], ns2["last"], ns2["size"]) == ("b", "a", 6), "Your code should work for any word, not just python. Try index -1 and len()."`,{hidden:!0})],e2:[C(`start`,`pyt`),C(`end`,`hon`),w(`uses slices`,String.raw`assert "[" in src.split("# Create")[-1] and ":" in src.split("# Create")[-1], "Use slices like word[a:b]."`,{hidden:!0})],e3:[S([],`====================
Pythia
====================
`,{name:`prints the three-line banner`}),w(`uses * to repeat`,String.raw`assert "*" in src, "Use the * operator to repeat the equals sign."`,{hidden:!0})],e4:[C(`swapped`,`hiapyt`),w(`works for other words`,String.raw`ns2 = {}
exec(src.replace('"pythia"', '"abcdef"'), ns2)
assert ns2["swapped"] == "defabc", "Swap the halves with slices so it works for any six-letter word."`,{hidden:!0})]},it={e1:[C(`clean`,`Ada Lovelace`),w(`works for other names`,String.raw`ns2 = {}
exec(src.replace('"  ada lovelace  "', '"   grace hopper "'), ns2)
assert ns2["clean"] == "Grace Hopper", "Use methods, so it works for any messy name."`,{hidden:!0})],e2:[S([],`Ada is 36 years old
`),w(`uses an f-string`,String.raw`assert 'f"' in src or "f'" in src, "Use an f-string: put an f before the opening quote."`,{hidden:!0}),w(`uses the variables`,String.raw`assert "{name}" in src and "{age}" in src, "Put the variables name and age inside the braces instead of typing their values."`,{hidden:!0})],e3:[S([],`Price: $3.14
`),w(`uses a format spec`,String.raw`assert ".2f" in src, "Use :.2f inside the braces to show two decimals."`,{hidden:!0})],e4:[C(`new_sentence`,`I like dogs. Cats are great.`),w(`uses replace`,String.raw`assert "replace" in src, "Use the replace method."`,{hidden:!0})]},at={e1:[T([`Ada`],`Hello, Ada!`),T([`Grace Hopper`],`Hello, Grace Hopper!`,{hidden:!0}),w(`uses input()`,String.raw`assert "input(" in src, "Use input() to ask for the name."`,{hidden:!0,stdin:[`Ada`]})],e2:[T([`14`],`Next year you will be 15`),T([`40`],`Next year you will be 41`,{hidden:!0}),T([`0`],`Next year you will be 1`,{hidden:!0})],e3:[T([`3`,`4`],`7`),T([`10`,`-2`],`8`,{hidden:!0}),T([`100`,`250`],`350`,{hidden:!0})],e4:[S([],`2026-01-15
`),w(`uses sep`,String.raw`assert "sep" in src, "Use the sep argument to put the dashes between the values."`,{hidden:!0}),w(`does not type the dashes in the values`,String.raw`assert '"-"' in src or "'-'" in src, "The dash should be the separator."`,{hidden:!0})]},L={e1:[C(`is_adult`,!1),k(`age 18 is an adult`,[[`age = 17`,`age = 18`]],`is_adult`,!0,{hint:`Is exactly 18 old enough?`}),k(`age 40 is an adult`,[[`age = 17`,`age = 40`]],`is_adult`,!0)],e2:[C(`is_teen`,!0),k(`age 13 is a teen`,[[`age = 14`,`age = 13`]],`is_teen`,!0,{hint:`Check both ends of the range.`}),k(`age 19 is a teen`,[[`age = 14`,`age = 19`]],`is_teen`,!0),k(`age 20 is not a teen`,[[`age = 14`,`age = 20`]],`is_teen`,!1),k(`age 12 is not a teen`,[[`age = 14`,`age = 12`]],`is_teen`,!1)],e3:[C(`same`,!0),k(`different words are not the same`,[[`b = "python"`,`b = "java"`]],`same`,!1),w(`is a boolean`,String.raw`assert type(ns["same"]) is bool`,{hidden:!0})],e4:[C(`is_five`,!0),k(`answer 6 is not five`,[[`answer = 5
`,`answer = 6
`]],`is_five`,!1),w(`uses ==`,String.raw`assert "==" in src, "Use == to compare."`,{hidden:!0})]},ot={e1:[S([],`Hot
`),O(`25 is hot`,[[`temperature = 28`,`temperature = 25`]],`Hot`,{hint:`Is exactly 25 hot?`}),O(`10 is mild`,[[`temperature = 28`,`temperature = 10`]],`Mild`),w(`uses if and else`,String.raw`assert "if " in src and "else" in src`,{hidden:!0})],e2:[S([],`B
`),O(`95 is an A`,[[`score = 85`,`score = 95`]],`A`),O(`90 is an A`,[[`score = 85`,`score = 90`]],`A`,{hint:`Check the boundaries: exactly 90, 80 and 70.`}),O(`72 is a C`,[[`score = 85`,`score = 72`]],`C`),O(`40 is an F`,[[`score = 85`,`score = 40`]],`F`)],e3:[S([],`odd
`),O(`10 is even`,[[`number = 7`,`number = 10`]],`even`),O(`0 is even`,[[`number = 7`,`number = 0`]],`even`),w(`uses %`,String.raw`assert "%" in src, "Use the remainder operator %."`,{hidden:!0})],e4:[C(`price`,15),k(`age 3 is free`,[[`age = 30`,`age = 3`]],`price`,0),k(`age 17 pays 8`,[[`age = 30`,`age = 17`]],`price`,8),k(`age 18 pays 15`,[[`age = 30`,`age = 18`]],`price`,15,{hint:`Check the exact boundaries: 5, 18 and 65.`}),k(`age 65 pays 10`,[[`age = 30`,`age = 65`]],`price`,10)]},st={e1:[C(`can_ride`,!0),k(`too short`,[[`height = 125`,`height = 110`]],`can_ride`,!1),k(`too young`,[[`age = 9`,`age = 6`]],`can_ride`,!1),k(`exactly the minimums`,[[`height = 125`,`height = 120`],[`age = 9`,`age = 8`]],`can_ride`,!0,{hint:`The limits themselves are allowed.`})],e2:[C(`is_weekend`,!0),k(`Sun is a weekend`,[[`day = "Sat"`,`day = "Sun"`]],`is_weekend`,!0),k(`Mon is not`,[[`day = "Sat"`,`day = "Mon"`]],`is_weekend`,!1,{hint:`Compare day with each value separately.`})],e3:[S([],`Welcome
`),O(`wrong password`,[[`password = "1234"`,`password = "nope"`]],`Denied`),O(`wrong username`,[[`username = "admin"`,`username = "guest"`]],`Denied`),w(`uses and`,String.raw`assert " and " in src, "Use and to require both."`,{hidden:!0})],e4:[C(`go_to_work`,!1),k(`a plain weekday`,[[`is_holiday = False
is_weekend = True`,`is_holiday = False
is_weekend = False`]],`go_to_work`,!0),k(`a weekday holiday`,[[`is_holiday = False
is_weekend = True`,`is_holiday = True
is_weekend = False`]],`go_to_work`,!1),w(`uses not`,String.raw`assert "not" in src, "Use not to flip the booleans."`,{hidden:!0})]},ct={e1:[S([],`5
4
3
2
1
Liftoff!
`,{name:`counts 5 to 1 then prints Liftoff!`}),w(`uses a while loop`,String.raw`assert "while" in src, "Use a while loop."`,{hidden:!0})],e2:[C(`total`,55),k(`n = 4 gives 10`,[[`n = 10`,`n = 4`]],`total`,10),k(`n = 1 gives 1`,[[`n = 10`,`n = 1`]],`total`,1,{hint:`Is n itself included?`}),w(`uses a while loop`,String.raw`assert "while" in src, "Use a while loop."`,{hidden:!0})],e3:[C(`value`,1024),C(`steps`,10),k(`a lower limit`,[[`value = 1
`,`value = 3
`]],`steps`,9),w(`uses a while loop`,String.raw`assert "while" in src`,{hidden:!0})],e4:[T([`3`,`4`,`0`],`7`),T([`0`],`0`,{hidden:!0}),T([`10`,`-4`,`5`,`0`],`11`,{hidden:!0}),w(`uses a while loop`,String.raw`assert "while" in src`,{hidden:!0,stdin:[`1`,`0`]})]},R=e=>Array.from({length:10},(t,n)=>`${e} x ${n+1} = ${e*(n+1)}`).join(`
`)+`
`,lt={e1:[S([],`1
2
3
4
5
`),w(`uses for and range`,String.raw`assert "for " in src and "range(" in src, "Use a for loop with range()."`,{hidden:!0})],e2:[C(`total`,110),w(`uses a range step`,String.raw`assert "range(" in src and src.count(",") >= 2, "Use the third (step) argument of range()."`,{hidden:!0})],e3:[S([],R(7)),O(`works for n = 3`,[[`n = 7`,`n = 3`]],R(3).trim()),w(`uses a loop`,String.raw`assert "for " in src`,{hidden:!0})],e4:[C(`vowels`,3),k(`works for education`,[[`word = "programming"`,`word = "education"`]],`vowels`,5),k(`works with no vowels`,[[`word = "programming"`,`word = "rhythm"`]],`vowels`,0)]},ut={e1:[C(`first`,56),w(`uses break`,String.raw`assert "break" in src, "Use break to stop searching once you find it."`,{hidden:!0})],e2:[S([],`1
2
4
5
7
8
10
`),w(`uses continue`,String.raw`assert "continue" in src, "Use continue to skip the multiples of 3."`,{hidden:!0})],e3:[S([],`****
****
****
`),O(`2 rows of 5`,[[`rows = 3`,`rows = 2`],[`cols = 4`,`cols = 5`]],`*****
*****`),w(`uses nested loops`,String.raw`assert src.count("for ") >= 2, "Use a loop inside a loop."`,{hidden:!0})],e4:[S([],`*
**
***
****
`),O(`size 2`,[[`size = 4`,`size = 2`]],`*
**`),O(`size 6`,[[`size = 4`,`size = 6`]],`*
**
***
****
*****
******`)]},dt={e1:[A(`greet`,[],`Hello, world!`),w(`uses def`,String.raw`assert "def greet" in src`,{hidden:!0})],e2:[A(`shout`,[`hello`],`HELLO!`),A(`shout`,[`pythia rocks`],`PYTHIA ROCKS!`,{hidden:!0}),A(`shout`,[``],`!`,{hidden:!0})],e3:[A(`box`,[`Hi`],`--
Hi
--`),A(`box`,[`Python`],`------
Python
------`,{hidden:!0}),A(`box`,[`a`],`-
a
-`,{hidden:!0})],e4:[w(`prints the cheer three times`,String.raw`assert out.count("Hip hip hooray!") == 3, f"cheer() should run 3 times, but it ran {out.count('Hip hip hooray!')} times."`),w(`uses a loop, not three copies`,String.raw`assert "for " in src or "while " in src, "Use a loop to repeat the call."`,{hidden:!0})]},ft={e1:[x(`add`,[2,3],5),x(`add`,[-4,4],0,{hidden:!0}),x(`add`,[.5,.25],.75,{hidden:!0}),w(`returns instead of printing`,String.raw`assert "return" in src, "Use return to hand the sum back."`,{hidden:!0})],e2:[x(`is_even`,[4],!0),x(`is_even`,[7],!1),x(`is_even`,[0],!0,{hidden:!0}),x(`is_even`,[-3],!1,{hidden:!0})],e3:[x(`average`,[1,2,3],2),x(`average`,[10,20,60],30),x(`average`,[0,0,1],1/3,{hidden:!0})],e4:[x(`double`,[4],8),x(`double`,[-1],-2,{hidden:!0}),w(`no longer prints`,String.raw`assert "print" not in src, "The function should return the value, not print it."`,{hidden:!0})],e5:[x(`full_name`,[`Ada`,`Lovelace`],`Lovelace, Ada`),x(`full_name`,[`Grace`,`Hopper`],`Hopper, Grace`,{hidden:!0})]},pt={e1:[x(`power`,[5],25),x(`power`,[2,10],1024),x(`power`,[3],9,{hidden:!0}),x(`power`,[4,0],1,{hidden:!0}),w(`exponent has a default`,String.raw`assert "exponent=2" in src.replace(" ", ""), "Give exponent a default value of 2."`,{hidden:!0})],e2:[x(`greet`,[`Ada`],`Hello, Ada!`),x(`greet`,[`Ada`,`Welcome`],`Welcome, Ada!`),x(`greet`,[`Ada`],`Hi, Ada!`,{kwargs:{greeting:`Hi`},name:`greet("Ada", greeting="Hi") → "Hi, Ada!"`}),x(`greet`,[],`Hey, Bo!`,{kwargs:{name:`Bo`,greeting:`Hey`},hidden:!0,name:`greet(greeting="Hey", name="Bo")`})],e3:[A(`count_down`,[3],`3
2
1
Go!`),A(`count_down`,[1],`1
Go!`,{hidden:!0}),A(`count_down`,[5],`5
4
3
2
1
Go!`,{hidden:!0})],e4:[C(`total`,7),w(`the function returns the value`,String.raw`assert "return" in src, "Make add_up return the total."`,{hidden:!0}),w(`add_up gives back a number`,String.raw`assert ns["add_up"](1, 2) == 3, "add_up(1, 2) should return 3."`,{hidden:!0})]},mt={e1:[x(`to_int`,[`42`],42),x(`to_int`,[`abc`],null),x(`to_int`,[` 7 `],7,{hidden:!0}),x(`to_int`,[``],null,{hidden:!0}),x(`to_int`,[`3.5`],null,{hidden:!0}),w(`uses try/except`,String.raw`assert "try" in src and "except" in src, "Use try / except."`,{hidden:!0})],e2:[x(`safe_divide`,[10,4],2.5),x(`safe_divide`,[1,0],null),x(`safe_divide`,[0,5],0,{hidden:!0}),w(`catches ZeroDivisionError by name`,String.raw`assert "ZeroDivisionError" in src, "Catch ZeroDivisionError specifically."
assert "except:" not in src.replace(" ", ""), "Don't use a bare except."`,{hidden:!0}),w(`does not hide other errors`,String.raw`try:
    ns["safe_divide"]("a", 2)
except TypeError:
    pass
else:
    fail("safe_divide('a', 2) should still raise TypeError: only catch ZeroDivisionError.")`,{hidden:!0})],e3:[x(`count_numbers`,[[`4`,`x`,`10`,``]],2),x(`count_numbers`,[[]],0),x(`count_numbers`,[[`1`,`2`,`3`]],3,{hidden:!0}),x(`count_numbers`,[[`a`,`b`]],0,{hidden:!0}),x(`count_numbers`,[[`-5`,`+7`,`2.5`]],2,{hidden:!0})],e4:[x(`lookup`,[{apple:3},`apple`],3),x(`lookup`,[{apple:3},`pear`],`unknown`),x(`lookup`,[{},`x`],`unknown`,{hidden:!0}),w(`uses try/except KeyError`,String.raw`assert "KeyError" in src and "try" in src, "Use try / except KeyError."`,{hidden:!0})]},z=(e,t,n,r=``)=>{let i=n.replace(/^ns\["(.*)"\]$/,`$1`);return String.raw`try:
    ns[${JSON.stringify(e)}](${t})
except ${n} as e:
    ${r||`pass`}
except Exception as e:
    fail(f"Expected ${i}, but got {type(e).__name__}: {e}")
else:
    fail("Expected ${i} to be raised, but nothing was.")`},ht={e1:[x(`check_age`,[30],30),x(`check_age`,[0],0,{hidden:!0}),x(`check_age`,[120],120,{hidden:!0}),w(`rejects -1`,z(`check_age`,`-1`,`ValueError`,`assert str(e), "Give the error a message."`)),w(`rejects 121`,z(`check_age`,`121`,`ValueError`),{hidden:!0})],e2:[x(`withdraw`,[100,30],70),w(`InsufficientFunds is an exception`,String.raw`cls = ns.get("InsufficientFunds")
assert isinstance(cls, type) and issubclass(cls, Exception), "Define a class InsufficientFunds that inherits from Exception."`),w(`raises InsufficientFunds when overdrawn`,z(`withdraw`,`10, 50`,`ns["InsufficientFunds"]`)),x(`withdraw`,[50,50],0,{hidden:!0}),w(`not just a ValueError`,String.raw`try:
    ns["withdraw"](1, 2)
except ns["InsufficientFunds"]:
    pass
else:
    fail("Raise InsufficientFunds.")`,{hidden:!0})],e3:[w(`success path logs open, work, close`,String.raw`log = []
ns["run_job"](log, False)
assert log == ["open", "work", "close"], f"Expected ['open', 'work', 'close'], got {log}."`),w(`failure path still closes and re-raises`,String.raw`log = []
try:
    ns["run_job"](log, True)
except RuntimeError:
    pass
else:
    fail("The RuntimeError should still reach the caller.")
assert log == ["open", "close"], f"Expected ['open', 'close'], got {log}."`),w(`uses finally`,String.raw`assert "finally" in src, "Use a finally block for the closing step."`,{hidden:!0})],e4:[x(`parse_all`,[[`1`,`22`,`-3`]],[1,22,-3]),x(`parse_all`,[[]],[],{hidden:!0}),w(`names the bad item`,z(`parse_all`,`["1", "x"]`,`ValueError`,String.raw`assert str(e) == "bad value: 'x'", f"The message should be \"bad value: 'x'\", but it is {str(e)!r}."`)),w(`names a different bad item`,z(`parse_all`,`["", "2"]`,`ValueError`,String.raw`assert str(e) == "bad value: ''", f"The message should be \"bad value: ''\", but it is {str(e)!r}."`),{hidden:!0})]},gt={e1:[w(`Rectangle(3, 4).area() is 12`,String.raw`r = ns["Rectangle"](3, 4)
assert r.area() == 12, f"Rectangle(3, 4).area() should be 12, got {r.area()!r}."`),w(`stores width and height`,String.raw`r = ns["Rectangle"](5, 2)
assert (r.width, r.height) == (5, 2), "Store the values as attributes named width and height."`),w(`each rectangle has its own size`,String.raw`a, b = ns["Rectangle"](1, 2), ns["Rectangle"](10, 10)
assert (a.area(), b.area()) == (2, 100), f"Two rectangles should not share values: got {(a.area(), b.area())}."`,{hidden:!0}),w(`works with floats`,String.raw`assert ns["Rectangle"](1.5, 2).area() == 3.0`,{hidden:!0})],e2:[w(`starts at zero`,String.raw`c = ns["Counter"]()
assert c.value == 0, f"A new Counter should have value 0, got {c.value!r}."`),w(`increment adds one`,String.raw`c = ns["Counter"]()
c.increment(); c.increment(); c.increment()
assert c.value == 3, f"After three increments the value should be 3, got {c.value!r}."`),w(`reset returns to zero`,String.raw`c = ns["Counter"]()
c.increment(); c.reset()
assert c.value == 0, f"After reset the value should be 0, got {c.value!r}."`),w(`counters are independent`,String.raw`a, b = ns["Counter"](), ns["Counter"]()
a.increment(); a.increment()
assert (a.value, b.value) == (2, 0), f"Counters must not share a count: got {(a.value, b.value)}."`,{hidden:!0})],e3:[w(`str(Point(3, 4)) is (3, 4)`,String.raw`s = str(ns["Point"](3, 4))
assert s == "(3, 4)", f"str(Point(3, 4)) should be '(3, 4)', got {s!r}."`),w(`distance_from_origin of (3, 4) is 5`,String.raw`d = ns["Point"](3, 4).distance_from_origin()
assert d == 5, f"The distance for (3, 4) should be 5.0, got {d!r}."`),w(`negative coordinates print as given`,String.raw`assert str(ns["Point"](-1, 0)) == "(-1, 0)"`,{hidden:!0}),w(`distance of the origin is 0`,String.raw`assert ns["Point"](0, 0).distance_from_origin() == 0`,{hidden:!0}),w(`__str__ returns text, not prints`,String.raw`import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    s = str(ns["Point"](1, 2))
assert buf.getvalue() == "", "__str__ should return the text, not print it."`,{hidden:!0})],e4:[w(`empty cart`,String.raw`c = ns["Cart"]()
assert (c.total(), c.count()) == (0, 0), f"An empty cart should total 0 with 0 items, got {(c.total(), c.count())}."`),w(`adds up prices`,String.raw`c = ns["Cart"]()
c.add("pen", 1.5); c.add("book", 10)
assert c.total() == 11.5 and c.count() == 2, f"Expected total 11.5 and 2 items, got {(c.total(), c.count())}."`),w(`carts do not share items`,String.raw`a, b = ns["Cart"](), ns["Cart"]()
a.add("x", 5)
assert (b.count(), b.total()) == (0, 0), "A new cart must start empty; don't share one list between carts."`,{hidden:!0}),w(`duplicates are counted`,String.raw`c = ns["Cart"]()
c.add("pen", 2); c.add("pen", 2)
assert (c.count(), c.total()) == (2, 4)`,{hidden:!0})]},B=(e,t,n,r=``)=>String.raw`import types
g = ns[${JSON.stringify(e)}](${t})
assert isinstance(g, types.GeneratorType), "${e}(...) should be a generator: use yield instead of building and returning a list."
got = list(g)
assert got == ${n}, f"${e}(${t.replace(/"/g,`\\"`)}) should produce ${n.replace(/"/g,`\\"`)}, but produced {got!r}. ${r}"`,V=(e,t,n)=>String.raw`import itertools, types
g = ns[${JSON.stringify(e)}]()
assert isinstance(g, types.GeneratorType), "${e}() should be a generator function (use yield)."
got = list(itertools.islice(g, ${t}))
assert got == ${n}, f"The first ${t} values should be ${n}, but they are {got!r}."`,_t={e1:[w(`countdown(3) → 3, 2, 1`,B(`countdown`,`3`,`[3, 2, 1]`)),w(`countdown(0) yields nothing`,B(`countdown`,`0`,`[]`)),w(`countdown(1)`,B(`countdown`,`1`,`[1]`),{hidden:!0}),w(`countdown(6)`,B(`countdown`,`6`,`[6, 5, 4, 3, 2, 1]`),{hidden:!0})],e2:[w(`multiples(3, 10)`,B(`multiples`,`3, 10`,`[3, 6, 9]`)),w(`limit that is itself a multiple`,B(`multiples`,`5, 15`,`[5, 10, 15]`)),w(`limit below the first multiple`,B(`multiples`,`7, 3`,`[]`),{hidden:!0}),w(`multiples(1, 4)`,B(`multiples`,`1, 4`,`[1, 2, 3, 4]`),{hidden:!0})],e3:[w(`first five squares`,V(`squares`,5,`[1, 4, 9, 16, 25]`)),w(`first ten squares`,V(`squares`,10,`[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]`),{hidden:!0}),w(`is resumable`,String.raw`g = ns["squares"]()
a, b, c = next(g), next(g), next(g)
assert (a, b, c) == (1, 4, 9), f"Successive next() calls should give 1, 4, 9 but gave {(a, b, c)}."`,{hidden:!0})],e4:[w(`keeps words of at least the size`,B(`long_words`,`["a", "bear", "cat", "dingo"], 4`,`["bear", "dingo"]`)),w(`size 1 keeps everything`,B(`long_words`,`["a", "bb"], 1`,`["a", "bb"]`),{hidden:!0}),w(`nothing long enough`,B(`long_words`,`["a", "bb"], 5`,`[]`),{hidden:!0}),w(`is a generator`,String.raw`import types
assert isinstance(ns["long_words"](["x"], 1), types.GeneratorType), "Use yield so this is a generator."`,{hidden:!0})]},vt={e1:[w(`a perfect line y = 2x + 1`,String.raw`slope, icpt = ns["fit_line"]([1, 2, 3, 4], [3, 5, 7, 9])
assert (slope, icpt) == (2.0, 1.0), f"The data is exactly y = 2x + 1, so expected (2.0, 1.0), got {(slope, icpt)}."`),w(`noisy data matches NumPy`,String.raw`import numpy as np
xs, ys = [1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1]
m, b = np.polyfit(xs, ys, 1)
slope, icpt = ns["fit_line"](xs, ys)
assert (slope, icpt) == (round(m, 2), round(b, 2)), f"Expected {(round(m, 2), round(b, 2))}, got {(slope, icpt)}."`),w(`returns plain floats`,String.raw`slope, icpt = ns["fit_line"]([0, 1, 2], [5, 5, 5])
assert type(slope) is float and type(icpt) is float, f"Convert with float(): got {type(slope).__name__} and {type(icpt).__name__}."`,{hidden:!0}),w(`negative slope`,String.raw`assert ns["fit_line"]([0, 1, 2], [4, 2, 0]) == (-2.0, 4.0)`,{hidden:!0}),w(`uses scikit-learn`,String.raw`assert "LinearRegression" in src, "Use LinearRegression from scikit-learn."`,{hidden:!0})],e2:[x(`predict_price`,[100],300),x(`predict_price`,[60],180),x(`predict_price`,[0],0,{hidden:!0}),x(`predict_price`,[200],600,{hidden:!0}),w(`uses scikit-learn`,String.raw`assert "LinearRegression" in src and ".fit(" in src and ".predict(" in src, "Create a LinearRegression, fit it, then predict."`,{hidden:!0})],e3:[x(`mean_squared_error`,[[3,5,7],[2,5,9]],5/3),x(`mean_squared_error`,[[1,2],[1,2]],0),x(`mean_squared_error`,[[0],[4]],16,{hidden:!0}),x(`mean_squared_error`,[[1,1,1,1],[0,2,0,2]],1,{hidden:!0}),w(`no library`,String.raw`assert "sklearn" not in src and "numpy" not in src, "Write it yourself with a loop or sum()."`,{hidden:!0})],e4:[x(`r_squared`,[[1,2,3],[1,2,3]],1),x(`r_squared`,[[1,2,3],[2,2,2]],0),x(`r_squared`,[[1,2,3,4],[1.1,1.9,3.2,3.8]],.98,{hidden:!0}),x(`r_squared`,[[2,4],[4,2]],-3,{hidden:!0}),w(`no library`,String.raw`assert "sklearn" not in src and "numpy" not in src, "Write it yourself."`,{hidden:!0})]},yt={e1:[w(`returns four pieces of the right size`,String.raw`from sklearn.datasets import load_iris
X, y = load_iris(return_X_y=True)
parts = ns["split"](X, y)
assert len(parts) == 4, "Return X_train, X_test, y_train, y_test."
X_train, X_test, y_train, y_test = parts
assert len(X_train) == len(y_train) == 112 and len(X_test) == len(y_test) == 38, f"With test_size=0.25 of 150 flowers expected 112 and 38, got {len(X_train)} and {len(X_test)}."`),w(`matches the reference split`,String.raw`from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np
X, y = load_iris(return_X_y=True)
want = train_test_split(X, y, test_size=0.25, random_state=0)
got = ns["split"](X, y)
assert all(np.array_equal(a, b) for a, b in zip(want, got)), "Use test_size=0.25 and random_state=0 so the split is the same as the reference."`,{hidden:!0}),w(`works on small data too`,String.raw`parts = ns["split"](list(range(8)), list(range(8)))
assert len(parts[1]) == 2 and len(parts[0]) == 6`,{hidden:!0})],e2:[x(`accuracy`,[[1,0,1,1],[1,1,1,0]],.5),x(`accuracy`,[[1,2],[1,2]],1),x(`accuracy`,[[],[]],0),x(`accuracy`,[[0,0,0],[1,1,1]],0,{hidden:!0}),x(`accuracy`,[[`a`,`b`,`b`],[`a`,`b`,`a`]],2/3,{hidden:!0}),w(`no library`,String.raw`assert "sklearn" not in src and "numpy" not in src, "Write it yourself."`,{hidden:!0})],e3:[w(`a sensible accuracy for k = 3`,String.raw`acc = ns["knn_accuracy"](3)
assert isinstance(acc, float), f"Return a float, not {type(acc).__name__}."
assert 0.9 <= acc <= 1.0, f"k-NN does well on iris (over 90%), but your function returned {acc:.3f}."`),w(`different k`,String.raw`for k in (1, 5, 11):
    acc = ns["knn_accuracy"](k)
    assert 0.85 <= acc <= 1.0, f"k={k} should also score highly, but got {acc:.3f}."`,{hidden:!0}),w(`scores on held-out data, not the training data`,String.raw`import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
X, y = load_iris(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42)
want = KNeighborsClassifier(n_neighbors=1).fit(Xa, ya).score(Xb, yb)
got = ns["knn_accuracy"](1)
assert abs(got - want) < 1e-9, f"With k=1 expected {want:.4f} (scored on the test set), but got {got:.4f}. Did you score on the training data?"`,{hidden:!0})],e4:[w(`a setosa`,String.raw`r = ns["predict_species"]([5.1, 3.5, 1.4, 0.2])
assert r == "setosa", f"Expected 'setosa', got {r!r}."`),w(`a virginica`,String.raw`r = ns["predict_species"]([6.5, 3.0, 5.8, 2.2])
assert r == "virginica", f"Expected 'virginica', got {r!r}."`),w(`a versicolor`,String.raw`r = ns["predict_species"]([5.9, 2.8, 4.3, 1.3])
assert r == "versicolor", f"Expected 'versicolor', got {r!r}."`,{hidden:!0}),w(`returns plain text`,String.raw`assert type(ns["predict_species"]([5.0, 3.4, 1.5, 0.2])) is str`,{hidden:!0})]},H=String.raw`from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.tree import DecisionTreeClassifier
def reference(depth):
    X, y = load_iris(return_X_y=True)
    Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=1)
    t = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(Xa, ya)
    return t.score(Xa, ya), t.score(Xb, yb)
def ref_cv(depth):
    X, y = load_iris(return_X_y=True)
    return cross_val_score(DecisionTreeClassifier(max_depth=depth, random_state=0), X, y, cv=5).mean()
`,bt={e1:[w(`returns a pair of accuracies`,`${H}
r = ns["scores"](3)
assert isinstance(r, tuple) and len(r) == 2, "Return a tuple (train_accuracy, test_accuracy)."
want = reference(3)
assert abs(r[0] - want[0]) < 1e-9 and abs(r[1] - want[1]) < 1e-9, f"For depth 3 expected {want}, got {r}."`),w(`an unlimited tree memorises the training data`,`${H}
train, test = ns["scores"](None)
assert train == 1.0, f"An unlimited tree should score 100% on its own training data, but got {train}."
assert test <= 1.0`,{hidden:!0}),w(`a stump cannot`,`${H}
train, test = ns["scores"](1)
assert train < 0.8, f"A depth-1 tree is too simple to score well even on its training data, but got {train}."`,{hidden:!0}),w(`plain floats`,`${H}
assert all(type(v) is float for v in ns["scores"](2))`,{hidden:!0})],e2:[w(`depth 1 has no overfitting gap`,`${H}
g = ns["gap"](1)
a, b = reference(1)
assert abs(g - (a - b)) < 1e-9, f"For depth 1 expected {a - b:.4f}, got {g:.4f}."`),w(`a deep tree has a gap`,`${H}
g = ns["gap"](None)
a, b = reference(None)
assert abs(g - (a - b)) < 1e-9 and g > 0, f"A tree with no limit should do better on training than test data. Got {g:.4f}."`),w(`train minus test, in that order`,`${H}
a, b = reference(4)
assert abs(ns["gap"](4) - (a - b)) < 1e-9, "The gap is train accuracy minus test accuracy."`,{hidden:!0})],e3:[w(`mean cross-validated accuracy`,`${H}
got, want = ns["cv_score"](3), ref_cv(3)
assert abs(got - want) < 1e-9, f"For depth 3 expected {want:.4f}, got {got:.4f}. Use cross_val_score(model, X, y, cv=5).mean()."`),w(`another depth`,`${H}
assert abs(ns["cv_score"](1) - ref_cv(1)) < 1e-9`,{hidden:!0}),w(`uses the whole dataset`,`${H}
assert 0.9 < ns["cv_score"](4) <= 1.0`,{hidden:!0}),w(`uses cross_val_score`,String.raw`assert "cross_val_score" in src and "cv=5" in src.replace(" ", ""), "Use cross_val_score(..., cv=5)."`,{hidden:!0})],e4:[w(`picks the best depth`,`${H}
depths = [1, 2, 3, 4, 5]
best = ns["best_depth"](depths)
top = max(ref_cv(d) for d in depths)
assert best in depths and abs(ref_cv(best) - top) < 1e-9, f"best_depth returned {best}, whose score is not the highest."`),w(`ties go to the smaller depth`,`${H}
depths = [6, 7, 8, 9]
best = ns["best_depth"](depths)
top = max(ref_cv(d) for d in depths)
smallest = min(d for d in depths if abs(ref_cv(d) - top) < 1e-12)
assert best == smallest, f"Several depths tie; expected the smallest ({smallest}) but got {best}."`),w(`works on one candidate`,`${H}
assert ns["best_depth"]([3]) == 3`,{hidden:!0}),w(`order of the list does not matter`,`${H}
assert ns["best_depth"]([5, 1, 3, 2]) == ns["best_depth"]([1, 2, 3, 5])`,{hidden:!0})]},U={hall:{text:`A draughty hall.`,exits:{north:`kitchen`,east:`library`}},kitchen:{text:`Pots hang from hooks.`,exits:{south:`hall`}},library:{text:`Dust and old books.`,exits:{west:`hall`}},cell:{text:`Bare walls.`,exits:{}}},xt={e1:[x(`describe`,[U,`hall`],`A draughty hall.
Exits: east, north`),x(`describe`,[U,`kitchen`],`Pots hang from hooks.
Exits: south`),x(`describe`,[U,`cell`],`Bare walls.
Exits: none`,{hidden:!0}),x(`describe`,[{a:{text:`x`,exits:{west:`a`,up:`a`,east:`a`}}},`a`],`x
Exits: east, up, west`,{hidden:!0})],e2:[x(`move`,[U,`hall`,`north`],`kitchen`),x(`move`,[U,`hall`,`up`],`hall`),x(`move`,[U,`cell`,`north`],`cell`,{hidden:!0}),x(`move`,[U,`library`,`west`],`hall`,{hidden:!0}),w(`does not crash on any direction`,String.raw`for d in ["", "NORTH", "x", "south"]:
    ns["move"]({"a": {"text": "", "exits": {}}}, "a", d)`,{hidden:!0})],e3:[x(`walk`,[U,`hall`,[`north`,`south`,`east`]],[`hall`,`kitchen`,`hall`,`library`]),x(`walk`,[U,`hall`,[`up`,`north`,`west`,`south`]],[`hall`,`kitchen`,`hall`],{hidden:!0}),x(`walk`,[U,`cell`,[`north`]],[`cell`],{hidden:!0}),x(`walk`,[U,`library`,[]],[`library`],{hidden:!0})],e4:[x(`play`,[U,`hall`,[`north`,`up`,`quit`,`north`]],[`You go north to the kitchen.`,`You can't go up.`,`Goodbye!`]),x(`play`,[U,`hall`,[]],[],{hidden:!0}),x(`play`,[U,`hall`,[`quit`]],[`Goodbye!`],{hidden:!0}),x(`play`,[U,`hall`,[`east`,`west`,`north`]],[`You go east to the library.`,`You go west to the hall.`,`You go north to the kitchen.`],{hidden:!0}),x(`play`,[U,`cell`,[`north`]],[`You can't go north.`],{hidden:!0}),w(`returns, not prints`,String.raw`import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    ns["play"]({"a": {"text": "", "exits": {}}}, "a", ["x", "quit"])
assert buf.getvalue() == "", "Return the messages instead of printing them."`,{hidden:!0})]},W=[{name:`coffee`,amount:3.5,category:`food`},{name:`bus pass`,amount:40,category:`travel`},{name:`lunch`,amount:9,category:`food`}],St={e1:[w(`appends a record`,String.raw`items = []
ns["add_expense"](items, "coffee", 3.5, "food")
assert items == [{"name": "coffee", "amount": 3.5, "category": "food"}], f"Expected one dict with name, amount and category, got {items!r}."`),w(`rejects zero and negative amounts`,String.raw`items = []
for bad in (0, -5):
    try:
        ns["add_expense"](items, "x", bad, "y")
    except ValueError:
        pass
    else:
        fail(f"An amount of {bad} should raise ValueError.")
assert items == [], "Nothing should be added when the amount is invalid."`),w(`keeps earlier items`,String.raw`items = [{"name": "a", "amount": 1, "category": "c"}]
ns["add_expense"](items, "b", 2, "c")
assert len(items) == 2 and items[0]["name"] == "a"`,{hidden:!0}),w(`accepts a tiny positive amount`,String.raw`items = []
ns["add_expense"](items, "gum", 0.01, "food")
assert len(items) == 1`,{hidden:!0})],e2:[x(`total`,[W],52.5),x(`total`,[[]],0),x(`total`,[[{name:`x`,amount:.1,category:`a`},{name:`y`,amount:.2,category:`a`}]],.3,{hidden:!0}),x(`total`,[[{name:`x`,amount:10,category:`a`}]],10,{hidden:!0})],e3:[x(`by_category`,[W],{food:12.5,travel:40}),x(`by_category`,[[]],{}),x(`by_category`,[[{name:`x`,amount:.1,category:`a`},{name:`y`,amount:.2,category:`a`}]],{a:.3},{hidden:!0}),x(`by_category`,[[{name:`x`,amount:5,category:`a`},{name:`y`,amount:6,category:`b`}]],{a:5,b:6},{hidden:!0})],e4:[x(`report`,[W],`food         12.50
travel       40.00
TOTAL        52.50`),x(`report`,[[]],`TOTAL         0.00`),x(`report`,[[{name:`x`,amount:1,category:`b`},{name:`y`,amount:2,category:`a`}]],`a             2.00
b             1.00
TOTAL         3.00`,{hidden:!0}),w(`no trailing newline`,String.raw`r = ns["report"]([{"name": "x", "amount": 1, "category": "a"}])
assert not r.endswith("\n"), "Join the lines with newlines, with no newline at the end."`,{hidden:!0})]},G=String.raw`import io
import pandas as pd
csv_text = "month,product,amount\n2024-01,pens,120\n2024-01,books,300\n2024-02,pens,150\n2024-02,books,280\n2024-03,pens,90\n"
df = pd.read_csv(io.StringIO(csv_text))
`,Ct={e1:[w(`parses rows and columns`,`${G}
r = ns["load"](csv_text)
assert list(r.columns) == ["month", "product", "amount"], f"Expected columns month, product, amount; got {list(r.columns)}."
assert len(r) == 5, f"Expected 5 rows, got {len(r)}."`),w(`numbers are numbers`,`${G}
r = ns["load"](csv_text)
assert r["amount"].sum() == 940, "The amount column should be numeric, so its sum is 940."`),w(`a different file`,String.raw`r = ns["load"]("a,b\n1,2\n3,4\n")
assert r.shape == (2, 2) and list(r["b"]) == [2, 4]`,{hidden:!0})],e2:[w(`totals per month`,`${G}
r = ns["monthly_totals"](df)
assert r == {"2024-01": 420, "2024-02": 430, "2024-03": 90}, f"Got {r!r}."
assert isinstance(r, dict), "Return a plain dict (use .to_dict())."`),w(`one month`,String.raw`import pandas as pd
d = pd.DataFrame({"month": ["m", "m"], "product": ["a", "b"], "amount": [1, 2]})
assert ns["monthly_totals"](d) == {"m": 3}`,{hidden:!0}),w(`ignores the product column`,String.raw`import pandas as pd
d = pd.DataFrame({"month": ["x", "y"], "product": ["a", "a"], "amount": [5, 7]})
assert ns["monthly_totals"](d) == {"x": 5, "y": 7}`,{hidden:!0})],e3:[w(`books earn the most`,`${G}
r = ns["best_product"](df)
assert r == "books", f"Books total 580 and pens 360, so expected 'books', got {r!r}."`),w(`another dataset`,String.raw`import pandas as pd
d = pd.DataFrame({"month": ["m"] * 3, "product": ["a", "b", "c"], "amount": [1, 9, 5]})
assert ns["best_product"](d) == "b"`,{hidden:!0}),w(`sums across months`,String.raw`import pandas as pd
d = pd.DataFrame({"month": ["1", "2", "1", "2"], "product": ["a", "a", "b", "b"], "amount": [4, 4, 7, 0]})
assert ns["best_product"](d) == "a", "Add up each product over all months before comparing."`,{hidden:!0})],e4:[w(`a figure with two axes`,`${G}
fig = ns["dashboard"](df)
assert len(fig.axes) == 2, f"The figure should have 2 axes, but has {len(fig.axes)}."`),w(`titles`,`${G}
left, right = ns["dashboard"](df).axes
assert left.get_title() == "Sales by month", f"The first title should be 'Sales by month', but is {left.get_title()!r}."
assert right.get_title() == "Sales by product", f"The second title should be 'Sales by product', but is {right.get_title()!r}."`),w(`a line of 3 months and 2 bars`,`${G}
left, right = ns["dashboard"](df).axes
assert len(left.lines) == 1 and len(left.lines[0].get_ydata()) == 3, "The first chart should be one line with a point per month."
assert list(left.lines[0].get_ydata()) == [420, 430, 90], f"The line should plot the monthly totals [420, 430, 90], got {list(left.lines[0].get_ydata())}."
assert len(right.patches) == 2, f"The second chart should have a bar per product (2), but has {len(right.patches)}."`,{hidden:!0}),w(`bar heights are the product totals`,`${G}
right = ns["dashboard"](df).axes[1]
assert sorted(round(p.get_height()) for p in right.patches) == [360, 580]`,{hidden:!0})]},K=[{id:`fnd-start`,track:`foundations`,title:`Getting started`,blurb:`Run your first programs and meet values, names and text.`},{id:`fnd-input`,track:`foundations`,title:`Talking to your program`,blurb:`Ask questions, do some maths, and format what you print.`},{id:`fnd-decisions`,track:`foundations`,title:`Making decisions`,blurb:`Let your program choose what to do.`},{id:`fnd-loops`,track:`foundations`,title:`Repeating things`,blurb:`Loops: say it once, run it many times.`},{id:`fnd-functions`,track:`foundations`,title:`Functions`,blurb:`Name a piece of logic and reuse it.`},{id:`ds-lists`,track:`data-structures`,title:`Lists`,blurb:`Ordered collections you can change.`},{id:`ds-tuples`,track:`data-structures`,title:`Tuples`,blurb:`Ordered collections that stay put.`},{id:`ds-dicts`,track:`data-structures`,title:`Dictionaries`,blurb:`Look things up by name.`},{id:`ds-sets`,track:`data-structures`,title:`Sets`,blurb:`Unique items and fast membership tests.`},{id:`ds-comprehensions`,track:`data-structures`,title:`Comprehensions`,blurb:`Build collections in a single, readable line.`},{id:`int-errors`,track:`intermediate`,title:`Handling errors`,blurb:`Catch what you expect, raise what you must.`},{id:`int-objects`,track:`intermediate`,title:`Objects`,blurb:`Bundle data and behaviour together.`},{id:`int-iteration`,track:`intermediate`,title:`Lazy sequences`,blurb:`Produce values on demand.`},{id:`alg-recursion`,track:`algorithms`,title:`Recursion`,blurb:`Solve a problem by solving a smaller copy of it.`},{id:`alg-search`,track:`algorithms`,title:`Searching`,blurb:`Finding things fast by not looking everywhere.`},{id:`alg-sorting`,track:`algorithms`,title:`Sorting`,blurb:`Put things in order, by hand.`},{id:`alg-complexity`,track:`algorithms`,title:`Complexity`,blurb:`How the work grows with the size of the input.`},{id:`sci-numpy`,track:`data-science`,title:`NumPy`,blurb:`Fast arrays and whole-array maths.`},{id:`sci-pandas`,track:`data-science`,title:`Pandas`,blurb:`Tables of data you can filter, group and sort.`},{id:`sci-plots`,track:`data-science`,title:`Matplotlib`,blurb:`Turn numbers into pictures.`},{id:`ml-first-models`,track:`machine-learning`,title:`Your first models`,blurb:`Fit a model, measure it honestly, and watch it overfit.`},{id:`prj-builds`,track:`projects`,title:`Guided builds`,blurb:`Small programs that tie everything together.`}],wt=e({id:t().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/,`id must be kebab-case`),module:t().min(1),title:t().min(1),minutes:a().int().min(1).max(60),goal:t().min(1),summary:t().min(1)}),q=class extends Error{constructor(e,t){super(`${e}: ${t}`),this.name=`LessonParseError`}};function J(e,t){let n=[],r=[],i=!1;for(let a of e)a.startsWith("```")&&(i=!i),!i&&a.startsWith(`${t} `)?r.push({heading:a.slice(t.length+1).trim(),lines:[]}):(r[r.length-1]?.lines??n).push(a);return{preamble:n,sections:r}}var Y=e=>e.join(`
`).trim();function X(e,t){let n={},r=[];for(let i=0;i<e.length;i++){let a=e[i],o=/^```(?:python|py)\s+(\S+)\s*$/.exec(a);if(o&&t.includes(o[1])){let t=[];for(i++;i<e.length&&!e[i].startsWith("```");)t.push(e[i++]);n[o[1]]=t.join(`
`).replace(/\s+$/,``)+`
`}else r.push(a)}return{found:n,rest:r}}function Tt(e){let t=[];for(let n of e){let e=/^\d+\.\s+(.*)$/.exec(n);e?t.push(e[1]):n.trim()&&t.length&&(t[t.length-1]+=` ${n.trim()}`)}return t}function Et(e,t,n,r){let i=/^(.*?)\s*\{#([a-z0-9]+)\}$/.exec(t);if(!i)throw new q(e,`Exercise heading "${t}" needs an id, like "# Exercise: Title {#e1}"`);let[,a,o]=i,s=`exercise ${o}`,{preamble:c,sections:l}=J(n,`##`),{found:u,rest:d}=X(c,[`starter`,`solution`]);if(u.starter===void 0)throw new q(e,`${s} is missing a \`\`\`python starter block`);if(u.solution===void 0)throw new q(e,`${s} is missing a \`\`\`python solution block`);let f=l.find(e=>e.heading.toLowerCase()===`hints`),p=l.find(e=>e.heading.toLowerCase()===`explanation`),m=f?Tt(f.lines):[];if(m.length!==3)throw new q(e,`${s} needs exactly 3 numbered hints (nudge, question, concrete hint); found ${m.length}`);if(!p)throw new q(e,`${s} is missing a "## Explanation" section`);if(!r?.length)throw new q(e,`${s} has no tests in its .tests.ts file`);return{id:o,title:a,prompt:Y(d),starter:u.starter,solution:u.solution,tests:r,hints:m,explanation:Y(p.lines)}}function Dt(e,t){let{sections:n}=J(t,`##`);return n.map((t,n)=>{let r=`q${n+1}`,i=[],a=-1,o=[];for(let n of t.lines){let t=/^- \[( |x)\]\s+(.*)$/.exec(n);if(t){if(t[1]===`x`){if(a!==-1)throw new q(e,`quiz ${r} has more than one correct option`);a=i.length}i.push(t[2])}else/^Explanation:/.test(n)?o.push(n.replace(/^Explanation:\s*/,``)):o.length&&n.trim()&&o.push(n.trim())}if(i.length<2)throw new q(e,`quiz ${r} needs at least 2 options`);if(a===-1)throw new q(e,`quiz ${r} has no correct option (mark one "- [x]")`);if(!o.length)throw new q(e,`quiz ${r} needs an "Explanation:" line`);return{id:r,question:t.heading,options:i,answer:a,explanation:o.join(` `)}})}function Ot(e,t,n){let r=e.replace(/\r\n/g,`
`).split(`
`);if(r[0]?.trim()!==`---`)throw new q(n,`must start with a --- front matter block`);let i=r.indexOf(`---`,1);if(i===-1)throw new q(n,`front matter is never closed with ---`);let a={};for(let e of r.slice(1,i)){let t=/^(\w+):\s*(.*)$/.exec(e);t&&(a[t[1]]=t[2].trim())}let o=wt.safeParse(a);if(!o.success)throw new q(n,`front matter: ${o.error.issues.map(e=>`${e.path.join(`.`)} ${e.message}`).join(`; `)}`);let{sections:s}=J(r.slice(i+1),`#`),c=s.find(e=>e.heading.toLowerCase()===`concept`),l=s.find(e=>e.heading.toLowerCase().startsWith(`example`)),u=s.find(e=>e.heading.toLowerCase()===`quiz`);if(!c)throw new q(n,`missing "# Concept" section`);if(!l)throw new q(n,`missing "# Example: …" section`);if(!u)throw new q(n,`missing "# Quiz" section`);let d=X(l.lines,[`example`]);if(d.found.example===void 0)throw new q(n,"the example section needs a ```python example block");let f=s.filter(e=>e.heading.toLowerCase().startsWith(`exercise`)).map(e=>Et(n,e.heading.replace(/^exercise:?\s*/i,``),e.lines,t[/\{#([a-z0-9]+)\}/.exec(e.heading)?.[1]??``]));return{...o.data,concept:Y(c.lines),example:{title:l.heading.replace(/^example:?\s*/i,``)||`Worked example`,explanation:Y(d.rest),code:d.found.example},exercises:f,quiz:Dt(n,u.lines)}}var Z=Object.assign({"./tracks/algorithms/01-recursion.md":o,"./tracks/algorithms/02-binary-search.md":s,"./tracks/algorithms/03-sorting.md":c,"./tracks/algorithms/04-big-o.md":l,"./tracks/data-science/01-numpy-arrays.md":u,"./tracks/data-science/02-pandas-basics.md":d,"./tracks/data-science/03-matplotlib.md":f,"./tracks/data-structures/01-lists-basics.md":p,"./tracks/data-structures/02-list-methods-slicing.md":m,"./tracks/data-structures/03-iterating-lists.md":ee,"./tracks/data-structures/04-sorting-zip.md":te,"./tracks/data-structures/05-tuples.md":h,"./tracks/data-structures/06-dict-basics.md":g,"./tracks/data-structures/07-dict-iteration.md":ne,"./tracks/data-structures/08-nested-data.md":re,"./tracks/data-structures/09-sets.md":ie,"./tracks/data-structures/10-list-comprehensions.md":ae,"./tracks/data-structures/11-dict-set-comprehensions.md":oe,"./tracks/data-structures/12-choosing-structures.md":se,"./tracks/foundations/01-hello-print.md":ce,"./tracks/foundations/02-variables.md":le,"./tracks/foundations/03-data-types.md":ue,"./tracks/foundations/04-arithmetic.md":de,"./tracks/foundations/05-strings.md":fe,"./tracks/foundations/06-string-methods.md":pe,"./tracks/foundations/07-input-output.md":me,"./tracks/foundations/08-booleans-comparisons.md":he,"./tracks/foundations/09-conditionals.md":ge,"./tracks/foundations/10-logical-operators.md":_e,"./tracks/foundations/11-while-loops.md":ve,"./tracks/foundations/12-for-loops.md":ye,"./tracks/foundations/13-loop-control.md":be,"./tracks/foundations/14-defining-functions.md":xe,"./tracks/foundations/15-return-values.md":Se,"./tracks/foundations/16-scope-defaults.md":Ce,"./tracks/intermediate/01-try-except.md":we,"./tracks/intermediate/02-raising.md":Te,"./tracks/intermediate/03-classes.md":Ee,"./tracks/intermediate/04-generators.md":De,"./tracks/machine-learning/01-linear-regression.md":Oe,"./tracks/machine-learning/02-classification.md":ke,"./tracks/machine-learning/03-overfitting.md":Ae,"./tracks/projects/01-text-adventure.md":je,"./tracks/projects/02-expense-tracker.md":Me,"./tracks/projects/03-data-dashboard.md":Ne}),kt=Object.assign({"./tracks/algorithms/01-recursion.tests.ts":Pe,"./tracks/algorithms/02-binary-search.tests.ts":Fe,"./tracks/algorithms/03-sorting.tests.ts":Ie,"./tracks/algorithms/04-big-o.tests.ts":Le,"./tracks/data-science/01-numpy-arrays.tests.ts":Re,"./tracks/data-science/02-pandas-basics.tests.ts":ze,"./tracks/data-science/03-matplotlib.tests.ts":Be,"./tracks/data-structures/01-lists-basics.tests.ts":Ve,"./tracks/data-structures/02-list-methods-slicing.tests.ts":He,"./tracks/data-structures/03-iterating-lists.tests.ts":Ue,"./tracks/data-structures/04-sorting-zip.tests.ts":We,"./tracks/data-structures/05-tuples.tests.ts":Ge,"./tracks/data-structures/06-dict-basics.tests.ts":Ke,"./tracks/data-structures/07-dict-iteration.tests.ts":qe,"./tracks/data-structures/08-nested-data.tests.ts":Je,"./tracks/data-structures/09-sets.tests.ts":Ye,"./tracks/data-structures/10-list-comprehensions.tests.ts":Xe,"./tracks/data-structures/11-dict-set-comprehensions.tests.ts":Ze,"./tracks/data-structures/12-choosing-structures.tests.ts":Qe,"./tracks/foundations/01-hello-print.tests.ts":$e,"./tracks/foundations/02-variables.tests.ts":et,"./tracks/foundations/03-data-types.tests.ts":tt,"./tracks/foundations/04-arithmetic.tests.ts":nt,"./tracks/foundations/05-strings.tests.ts":rt,"./tracks/foundations/06-string-methods.tests.ts":it,"./tracks/foundations/07-input-output.tests.ts":at,"./tracks/foundations/08-booleans-comparisons.tests.ts":L,"./tracks/foundations/09-conditionals.tests.ts":ot,"./tracks/foundations/10-logical-operators.tests.ts":st,"./tracks/foundations/11-while-loops.tests.ts":ct,"./tracks/foundations/12-for-loops.tests.ts":lt,"./tracks/foundations/13-loop-control.tests.ts":ut,"./tracks/foundations/14-defining-functions.tests.ts":dt,"./tracks/foundations/15-return-values.tests.ts":ft,"./tracks/foundations/16-scope-defaults.tests.ts":pt,"./tracks/intermediate/01-try-except.tests.ts":mt,"./tracks/intermediate/02-raising.tests.ts":ht,"./tracks/intermediate/03-classes.tests.ts":gt,"./tracks/intermediate/04-generators.tests.ts":_t,"./tracks/machine-learning/01-linear-regression.tests.ts":vt,"./tracks/machine-learning/02-classification.tests.ts":yt,"./tracks/machine-learning/03-overfitting.tests.ts":bt,"./tracks/projects/01-text-adventure.tests.ts":xt,"./tracks/projects/02-expense-tracker.tests.ts":St,"./tracks/projects/03-data-dashboard.tests.ts":Ct});function At(){let e=new Map;for(let t of Object.keys(Z).sort()){let n=Ot(Z[t],kt[t.replace(/\.md$/,`.tests.ts`)]??{},t),r=K.find(e=>e.id===n.module);if(!r)throw Error(`${t}: unknown module "${n.module}"`);e.set(r.track,[...e.get(r.track)??[],n])}return i.flatMap(t=>{let n=K.filter(e=>e.track===t.id).map(e=>e.id);return[...e.get(t.id)??[]].sort((e,t)=>n.indexOf(e.module)-n.indexOf(t.module)).map((e,n)=>({...e,track:t.id,index:n}))})}var Q=At(),jt=new Map(Q.map(e=>[e.id,e])),Mt=e=>jt.get(e),Nt=e=>Q.filter(t=>t.track===e),$=e=>Q.filter(t=>t.module===e),Pt=e=>K.filter(t=>t.track===e&&$(t.id).length>0);function Ft(e){let t=Q.findIndex(t=>t.id===e);return{prev:Q[t-1]??null,next:Q[t+1]??null}}export{Pt as a,Nt as i,Mt as n,Ft as o,$ as r,Q as t};