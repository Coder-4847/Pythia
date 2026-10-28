import { call, check } from '@/content/helpers'

const rooms = {
  hall: { text: 'A draughty hall.', exits: { north: 'kitchen', east: 'library' } },
  kitchen: { text: 'Pots hang from hooks.', exits: { south: 'hall' } },
  library: { text: 'Dust and old books.', exits: { west: 'hall' } },
  cell: { text: 'Bare walls.', exits: {} },
}

export default {
  e1: [
    call('describe', [rooms, 'hall'], 'A draughty hall.\nExits: east, north'),
    call('describe', [rooms, 'kitchen'], 'Pots hang from hooks.\nExits: south'),
    call('describe', [rooms, 'cell'], 'Bare walls.\nExits: none', { hidden: true }),
    call('describe', [{ a: { text: 'x', exits: { west: 'a', up: 'a', east: 'a' } } }, 'a'], 'x\nExits: east, up, west', { hidden: true }),
  ],
  e2: [
    call('move', [rooms, 'hall', 'north'], 'kitchen'),
    call('move', [rooms, 'hall', 'up'], 'hall'),
    call('move', [rooms, 'cell', 'north'], 'cell', { hidden: true }),
    call('move', [rooms, 'library', 'west'], 'hall', { hidden: true }),
    check('does not crash on any direction', String.raw`for d in ["", "NORTH", "x", "south"]:
    ns["move"]({"a": {"text": "", "exits": {}}}, "a", d)`, { hidden: true }),
  ],
  e3: [
    call('walk', [rooms, 'hall', ['north', 'south', 'east']], ['hall', 'kitchen', 'hall', 'library']),
    call('walk', [rooms, 'hall', ['up', 'north', 'west', 'south']], ['hall', 'kitchen', 'hall'], { hidden: true }),
    call('walk', [rooms, 'cell', ['north']], ['cell'], { hidden: true }),
    call('walk', [rooms, 'library', []], ['library'], { hidden: true }),
  ],
  e4: [
    call('play', [rooms, 'hall', ['north', 'up', 'quit', 'north']], ['You go north to the kitchen.', "You can't go up.", 'Goodbye!']),
    call('play', [rooms, 'hall', []], [], { hidden: true }),
    call('play', [rooms, 'hall', ['quit']], ['Goodbye!'], { hidden: true }),
    call('play', [rooms, 'hall', ['east', 'west', 'north']], ['You go east to the library.', 'You go west to the hall.', 'You go north to the kitchen.'], { hidden: true }),
    call('play', [rooms, 'cell', ['north']], ["You can't go north."], { hidden: true }),
    check('returns, not prints', String.raw`import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    ns["play"]({"a": {"text": "", "exits": {}}}, "a", ["x", "quit"])
assert buf.getvalue() == "", "Return the messages instead of printing them."`, { hidden: true }),
  ],
}
