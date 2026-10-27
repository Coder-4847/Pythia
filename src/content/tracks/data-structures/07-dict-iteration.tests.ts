import { call, check, dictOf } from '@/content/helpers'

export default {
  e1: [
    call('total_stock', [{ apples: 5, pears: 2 }], 7),
    call('total_stock', [{}], 0),
    call('total_stock', [{ a: 0, b: -1, c: 10 }], 9, { hidden: true }),
  ],
  e2: [
    call('count_letters', ['aab'], { a: 2, b: 1 }),
    call('count_letters', [''], {}, { hidden: true }),
    call('count_letters', ['banana'], { b: 1, a: 3, n: 2 }, { hidden: true }),
    call('count_letters', ['a a'], { a: 2, ' ': 1 }, { hidden: true }),
  ],
  e3: [
    call('top_scorer', [{ Ada: 82, Grace: 95, Linus: 78 }], 'Grace'),
    call('top_scorer', [{ solo: 1 }], 'solo', { hidden: true }),
    call('top_scorer', [{ a: -5, b: -2, c: -9 }], 'b', { hidden: true, hint: 'What if every score is negative?' }),
  ],
  e4: [
    call('group_by_length', [['a', 'bb', 'c']], dictOf([1, ['a', 'c']], [2, ['bb']])),
    call('group_by_length', [['hi', 'yo', 'cat']], dictOf([2, ['hi', 'yo']], [3, ['cat']])),
    check('empty list gives an empty dict', String.raw`assert ns["group_by_length"]([]) == {}`, { hidden: true }),
    check('keeps the original order', String.raw`assert ns["group_by_length"](["b", "a", "d", "c"]) == {1: ["b", "a", "d", "c"]}`, { hidden: true }),
  ],
}
