import { call, check, dictOf, setOf } from '@/content/helpers'

export default {
  e1: [
    call('square_map', [3], dictOf([1, 1], [2, 4], [3, 9])),
    call('square_map', [0], {}, { hidden: true }),
    call('square_map', [1], dictOf([1, 1]), { hidden: true }),
    check('uses a comprehension', String.raw`assert " for " in src and "{" in src`, { hidden: true }),
  ],
  e2: [
    call('unique_lengths', [['a', 'bb', 'c']], setOf(1, 2)),
    call('unique_lengths', [[]], setOf()),
    call('unique_lengths', [['abc', 'xyz', 'q']], setOf(3, 1), { hidden: true }),
    check('returns a set', String.raw`assert type(ns["unique_lengths"](["a"])) is set, "Return a set, not a list."`, { hidden: true }),
  ],
  e3: [
    call('passed', [{ Ada: 92, Grace: 78, Linus: 85 }, 80], { Ada: 92, Linus: 85 }),
    call('passed', [{ a: 1 }, 5], {}),
    call('passed', [{ a: 5, b: 4 }, 5], { a: 5 }, { hidden: true, hint: 'Is exactly the minimum a pass?' }),
    call('passed', [{}, 1], {}, { hidden: true }),
  ],
  e4: [
    call('first_letters', [['ada', 'bo']], { ada: 'a', bo: 'b' }),
    call('first_letters', [[]], {}, { hidden: true }),
    call('first_letters', [['zed']], { zed: 'z' }, { hidden: true }),
  ],
}
