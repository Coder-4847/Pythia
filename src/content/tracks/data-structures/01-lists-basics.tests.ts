import { call, check, variable } from '@/content/helpers'

export default {
  e1: [
    variable('colors', ['red', 'green', 'blue']),
    check('is a list', String.raw`assert type(ns["colors"]) is list`, { hidden: true }),
  ],
  e2: [
    variable('first', 72),
    variable('last', 88),
    variable('count', 5),
    check('works for another list', String.raw`ns2 = {}
exec(src.replace("[72, 85, 90, 64, 88]", "[5, 6]"), ns2)
assert (ns2["first"], ns2["last"], ns2["count"]) == (5, 6, 2), "Use index 0, index -1 and len() so it works for any list."`, { hidden: true }),
  ],
  e3: [
    variable('fruits', ['apple', 'blueberry', 'cherry', 'date']),
    check('changes the list itself', String.raw`assert "append" in src, "Use append to add the new fruit."`, { hidden: true }),
  ],
  e4: [
    call('last_item', [[1, 2, 3]], 3),
    call('last_item', [[]], null, { name: 'last_item([]) → None' }),
    call('last_item', [['a']], 'a', { hidden: true }),
    call('last_item', [[[1], [2, 3]]], [2, 3], { hidden: true }),
  ],
}
