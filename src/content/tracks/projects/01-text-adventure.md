---
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

```python run
rooms = {
    "hall":    {"text": "A draughty hall.",        "exits": {"north": "kitchen", "east": "library"}},
    "kitchen": {"text": "Pots hang from hooks.",   "exits": {"south": "hall"}},
    "library": {"text": "Dust and old books.",     "exits": {"west": "hall"}},
}

room = "hall"
print(rooms[room]["text"])
print(sorted(rooms[room]["exits"]))
print(rooms[room]["exits"]["north"])
```

Notice that rooms refer to **each other by name**, not by holding the other room. That keeps the data simple and lets the map loop back on itself.

### The plan

A game is just a loop over three questions:

1. **Where am I?** (a variable holding a room name)
2. **What do I see?** (look up the room, print its text and exits)
3. **Where can I go?** (look up the direction in the exits, move if it exists)

```diagram
{"type":"flow","caption":"One turn of the game","steps":[{"label":"describe","detail":"print the current room and its exits"},{"label":"read a command","detail":"a direction like north"},{"label":"move","detail":"if the exit exists, change the current room"}]}
```

You'll build the pieces as small, testable functions, which is how real programs are made: functions with one job that are easy to check, put together by a short main loop.

> **Careful:** looking up an exit that doesn't exist (`exits["up"]`) raises a `KeyError`. A game must expect players to try silly things. Use `.get()` or check with `in` first, and decide what happens: usually a polite "you can't go that way", never a crash.

# Example: A tiny game loop

```python example
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
```

The commands come from a list so you can run it without typing; in a real game each one would come from `input()`.

# Exercise: Describe a room {#e1}

Define `describe(rooms, name)` that returns two lines of text joined by a newline: the room's text, then `"Exits: "` followed by its exit directions **in alphabetical order**, separated by `", "`. A room with no exits shows `"Exits: none"`.

```python starter
# Define describe(rooms, name)
```

```python solution
def describe(rooms, name):
    room = rooms[name]
    exits = sorted(room["exits"])
    listing = ", ".join(exits) if exits else "none"
    return room["text"] + "\n" + "Exits: " + listing
```

## Hints

1. You need pieces from inside the room dictionary.
2. How do you get the directions, in order, as text?
3. `sorted()` on a dictionary gives its keys in order; `", ".join(...)` joins them. Handle the empty case separately.

## Explanation

Sorting makes the output predictable no matter how the exits were written down. Joining an empty list would give an empty string, so the "none" case needs its own branch.

# Exercise: Move {#e2}

Define `move(rooms, name, direction)` that returns the name of the room you end up in. If the current room has an exit in that direction, return its destination; otherwise return the **same** room name (you stay put).

```python starter
# Define move(rooms, name, direction)
```

```python solution
def move(rooms, name, direction):
    exits = rooms[name]["exits"]
    if direction in exits:
        return exits[direction]
    return name
```

## Hints

1. Two possible outcomes: you go somewhere, or you don't.
2. How do you check safely whether a direction exists?
3. Look at the room's `exits` dictionary: if the direction is a key, return its value; otherwise return the room you started in.

## Explanation

The `in` test prevents the `KeyError` for impossible directions. Returning the same name means a bad move is harmless: callers don't need special cases.

# Exercise: Walk a route {#e3}

Define `walk(rooms, start, directions)` that follows a list of directions from `start` and returns the **list of rooms visited**, beginning with `start`. Impossible directions are ignored (you stay put, and nothing is added to the list).

```python starter
# Define walk(rooms, start, directions)
```

```python solution
def walk(rooms, start, directions):
    visited = [start]
    current = start
    for direction in directions:
        exits = rooms[current]["exits"]
        if direction in exits:
            current = exits[direction]
            visited.append(current)
    return visited
```

## Hints

1. Keep track of where you are and where you've been.
2. When should a room be added to the list?
3. For each direction, move only if the exit exists, and append the new room only after a successful move.

## Explanation

`current` changes as you move; `visited` is the trail. A rejected move changes neither, so the trail contains only real steps.

# Exercise: Play a script {#e4}

Define `play(rooms, start, commands)` that returns a **list of the messages** a game would print. For each command:

- `"quit"` ends the game, adding `"Goodbye!"`;
- a valid direction adds `"You go <direction> to the <room>."`;
- anything else adds `"You can't go <command>."`.

For example, from a hall with a north exit to the kitchen, `["north", "up", "quit", "north"]` gives `["You go north to the kitchen.", "You can't go up.", "Goodbye!"]`: nothing after `quit` is processed.

```python starter
# Define play(rooms, start, commands)
```

```python solution
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
```

## Hints

1. Each command produces exactly one message, except that `quit` also stops everything.
2. Which statement leaves a loop early?
3. Check for `"quit"` first (append, then `break`); then decide between a valid move and an invalid one.

## Explanation

Returning messages instead of printing them makes the game logic testable and reusable: a text interface, a web page, or a test can all show them however they like. That separation of "what happens" from "how it's shown" is a habit worth keeping.

# Quiz

## How are rooms connected in the lesson's map?

- [ ] Each room contains the other rooms
- [x] Exits store the *name* of the destination room, which is looked up in the world dictionary
- [ ] By a list of numbers

Explanation: Referring by name keeps the data flat and lets rooms link back to each other.

## What should happen when the player types a direction with no exit?

- [ ] The program crashes with a `KeyError`
- [x] A friendly message, and the player stays where they are
- [ ] The game restarts

Explanation: Expect the unexpected: check the key exists before using it.

## Why return a list of messages from `play` instead of printing them?

- [ ] `print` is slow
- [x] The logic becomes easy to test and to reuse with a different interface
- [ ] Functions can't print

Explanation: Separating "what happens" from "how it's shown" is good design.
