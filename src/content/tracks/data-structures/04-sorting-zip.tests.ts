import { call, check, tuple, variable } from '@/content/helpers'

export default {
  e1: [
    call('sorted_desc', [[3, 1, 2]], [3, 2, 1]),
    call('sorted_desc', [[]], [], { hidden: true }),
    call('sorted_desc', [[5, 5, 1]], [5, 5, 1], { hidden: true }),
    check('does not modify the original', String.raw`data = [1, 3, 2]
ns["sorted_desc"](data)
assert data == [1, 3, 2], "Return a new sorted list; don't sort the argument in place."`, { hidden: true }),
  ],
  e2: [
    call('by_length', [['pear', 'fig', 'banana', 'kiwi']], ['fig', 'pear', 'kiwi', 'banana']),
    call('by_length', [['bb', 'a', 'cc', 'd']], ['a', 'd', 'bb', 'cc'], { hint: 'Equal lengths must keep their original order.' }),
    call('by_length', [[]], [], { hidden: true }),
  ],
  e3: [
    call('pairs', [['Ada', 'Grace'], [36, 85]], [tuple('Ada', 36), tuple('Grace', 85)], { name: 'pairs(["Ada", "Grace"], [36, 85])' }),
    call('pairs', [[], []], [], { hidden: true }),
    call('pairs', [['a', 'b', 'c'], [1, 2]], [tuple('a', 1), tuple('b', 2)], { hidden: true, name: 'pairs with lists of different lengths' }),
    check('returns tuples in a list', String.raw`r = ns["pairs"](["a"], [1])
assert isinstance(r, list) and isinstance(r[0], tuple), "Return a list of tuples."`, { hidden: true }),
  ],
  e4: [
    variable('cheapest', 'water'),
    check('works for other products', String.raw`ns2 = {}
exec(src.replace('("water", 1.25)', '("juice", 0.5)'), ns2)
assert ns2["cheapest"] == "juice", "Compare the prices so it finds the cheapest of any list."`, { hidden: true }),
  ],
}
