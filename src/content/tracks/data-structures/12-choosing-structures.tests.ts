import { call, check } from '@/content/helpers'

export default {
  e1: [
    call('first_repeat', [[3, 1, 4, 1, 5, 3]], 1),
    call('first_repeat', [[1, 2, 3]], null, { name: 'first_repeat([1, 2, 3]) → None' }),
    call('first_repeat', [[]], null, { hidden: true, name: 'first_repeat([]) → None' }),
    call('first_repeat', [['a', 'b', 'b', 'a']], 'b', { hidden: true }),
    call('first_repeat', [[7, 7]], 7, { hidden: true }),
    check('uses a set to remember', String.raw`assert "set" in src or "{" in src, "Remember the seen items in a set."`, { hidden: true }),
  ],
  e2: [
    call('word_counts', ['the cat The hat'], { the: 2, cat: 1, hat: 1 }),
    call('word_counts', [''], {}),
    call('word_counts', ['a a a'], { a: 3 }, { hidden: true }),
    call('word_counts', ['Go go GO'], { go: 3 }, { hidden: true }),
  ],
  e3: [
    call('top_n', [{ Ada: 82, Grace: 95, Linus: 78 }, 2], ['Grace', 'Ada']),
    call('top_n', [{ a: 1 }, 5], ['a'], { hidden: true }),
    call('top_n', [{ a: 3, b: 2, c: 1 }, 0], [], { hidden: true }),
    call('top_n', [{ a: 1, b: 9, c: 5, d: 7 }, 3], ['b', 'd', 'c'], { hidden: true }),
  ],
  e4: [
    check('finds the shared interests', String.raw`data = {"Ada": {"math", "code", "tea"}, "Grace": {"code", "tea", "ships"}}
assert ns["shared"](data, "Ada", "Grace") == ["code", "tea"], "Return a sorted list of what both people like."`),
    check('nothing in common gives an empty list', String.raw`data = {"a": {"x"}, "b": {"y"}}
assert ns["shared"](data, "a", "b") == []`, { hidden: true }),
    check('order of arguments does not matter', String.raw`data = {"a": {"x", "y"}, "b": {"y", "x", "z"}}
assert ns["shared"](data, "b", "a") == ["x", "y"]`, { hidden: true }),
  ],
}
