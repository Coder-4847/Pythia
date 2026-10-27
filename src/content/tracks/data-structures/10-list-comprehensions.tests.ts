import { call, check, variable } from '@/content/helpers'

export default {
  e1: [
    variable('squares', [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]),
    check('uses a comprehension', String.raw`assert "[" in src and " for " in src and " in " in src, "Use a list comprehension: [ ... for n in ... ]."
assert ".append" not in src, "No append needed: the comprehension builds the list."`, { hidden: true }),
  ],
  e2: [
    call('evens', [[1, 2, 3, 4, 6]], [2, 4, 6]),
    call('evens', [[1, 3]], []),
    call('evens', [[0, -2, -3]], [0, -2], { hidden: true }),
    call('evens', [[]], [], { hidden: true }),
    check('uses a comprehension', String.raw`assert " for " in src and "[" in src and ".append" not in src`, { hidden: true }),
  ],
  e3: [
    call('lengths', [['ada', 'grace']], [3, 5]),
    call('lengths', [[]], []),
    call('lengths', [['', 'a']], [0, 1], { hidden: true }),
  ],
  e4: [
    call('shout_long', [['hi', 'python', 'code']], ['PYTHON!', 'CODE!']),
    call('shout_long', [['abc', 'abcd']], ['ABCD!'], { hint: 'Words of exactly 3 letters are not longer than 3.' }),
    call('shout_long', [[]], [], { hidden: true }),
    call('shout_long', [['ok', 'no']], [], { hidden: true }),
  ],
  e5: [
    call('labels', [[3, -1, 0]], ['positive', 'not positive', 'not positive']),
    call('labels', [[]], [], { hidden: true }),
    call('labels', [[10]], ['positive'], { hidden: true }),
  ],
}
