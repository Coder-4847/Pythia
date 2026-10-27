import { call, check } from '@/content/helpers'

export default {
  e1: [
    call('total_price', [[3, 5, 8]], 16),
    call('total_price', [[]], 0),
    call('total_price', [[2.5, 2.5]], 5, { hidden: true }),
    call('total_price', [[-1, 1, 10]], 10, { hidden: true }),
    check('uses a loop', String.raw`assert "for " in src, "Add the prices up with a for loop."`, { hidden: true }),
  ],
  e2: [
    call('count_above', [[5, 12, 7, 20, 3], 6], 3),
    call('count_above', [[1, 2, 3], 3], 0, { hint: 'Items equal to the limit should not be counted.' }),
    call('count_above', [[], 0], 0, { hidden: true }),
    call('count_above', [[-5, -1, 0], -2], 2, { hidden: true }),
  ],
  e3: [
    call('positives', [[5, -2, 8, -7, 3]], [5, 8, 3]),
    call('positives', [[-1, -2]], []),
    call('positives', [[0, 1]], [1], { hidden: true, hint: 'Zero is not greater than zero.' }),
    call('positives', [[]], [], { hidden: true }),
    check('does not change its input', String.raw`data = [1, -1, 2]
ns["positives"](data)
assert data == [1, -1, 2], "positives should build a new list and leave its argument alone."`, { hidden: true }),
  ],
  e4: [
    call('longest_word', [['pear', 'banana', 'fig']], 'banana'),
    call('longest_word', [['ab', 'cd', 'e']], 'ab', { hint: 'On a tie, return the first one.' }),
    call('longest_word', [['solo']], 'solo', { hidden: true }),
    call('longest_word', [['a', 'bb', 'ccc', 'dd']], 'ccc', { hidden: true }),
  ],
  e5: [
    call('numbered', [['milk', 'eggs']], ['1. milk', '2. eggs']),
    call('numbered', [[]], [], { hidden: true }),
    call('numbered', [['x']], ['1. x'], { hidden: true }),
    check('uses enumerate', String.raw`assert "enumerate" in src, "Use enumerate to get each item with its position."`, { hidden: true }),
  ],
}
