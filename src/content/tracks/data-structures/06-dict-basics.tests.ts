import { call, check, dictOf, variable } from '@/content/helpers'

export default {
  e1: [
    variable('person', { name: 'Ada', age: 36 }),
    check('is a dict', String.raw`assert type(ns["person"]) is dict`, { hidden: true }),
  ],
  e2: [
    variable('person', { age: 37, city: 'London' }),
    check('uses del', String.raw`assert "del " in src, "Use del to remove the name entry."`, { hidden: true }),
  ],
  e3: [
    call('price_of', [{ tea: 3, cake: 5 }, 'tea'], 3),
    call('price_of', [{ tea: 3 }, 'soup'], 0),
    call('price_of', [{}, 'x'], 0, { hidden: true }),
    call('price_of', [{ a: 0 }, 'a'], 0, { hidden: true }),
    call('price_of', [{ pie: 4.5 }, 'pie'], 4.5, { hidden: true }),
  ],
  e4: [
    call('invert', [{ a: 1, b: 2 }], dictOf([1, 'a'], [2, 'b'])),
    check('invert works with string values', String.raw`assert ns["invert"]({"x": "p", "y": "q"}) == {"p": "x", "q": "y"}`, { hidden: true }),
    check('does not modify the original', String.raw`d = {"a": 1}
ns["invert"](d)
assert d == {"a": 1}`, { hidden: true }),
  ],
}
