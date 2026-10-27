import { call, check, variable } from '@/content/helpers'

export default {
  e1: [
    variable('first_three', [1, 2, 3]),
    variable('last_two', [5, 6]),
    check('works for another list', String.raw`ns2 = {}
exec(src.replace("[1, 2, 3, 4, 5, 6]", "[9, 8, 7, 6, 5]"), ns2)
assert (ns2["first_three"], ns2["last_two"]) == ([9, 8, 7], [6, 5]), "Use slices, so it works for any list."`, { hidden: true }),
  ],
  e2: [
    variable('a', [1, 2, 3]),
    variable('b', [1, 2, 3, 4]),
    check('b is a different list', String.raw`assert ns["a"] is not ns["b"], "a and b should be two separate lists."`, { hidden: true }),
  ],
  e3: [
    call('rotate', [[1, 2, 3]], [2, 3, 1]),
    call('rotate', [['a', 'b']], ['b', 'a']),
    call('rotate', [[]], [], { hidden: true }),
    call('rotate', [[7]], [7], { hidden: true }),
    check('does not change the original', String.raw`original = [1, 2, 3]
ns["rotate"](original)
assert original == [1, 2, 3], "rotate should return a new list and leave its argument unchanged."`, { hidden: true }),
  ],
  e4: [
    variable('served', 'a'),
    variable('queue', ['b', 'c']),
    check('uses pop', String.raw`assert "pop" in src, "Use pop(0) to remove and return the first item."`, { hidden: true }),
  ],
}
