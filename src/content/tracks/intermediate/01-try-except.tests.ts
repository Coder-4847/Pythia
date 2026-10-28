import { call, check } from '@/content/helpers'

export default {
  e1: [
    call('to_int', ['42'], 42),
    call('to_int', ['abc'], null),
    call('to_int', [' 7 '], 7, { hidden: true }),
    call('to_int', [''], null, { hidden: true }),
    call('to_int', ['3.5'], null, { hidden: true }),
    check('uses try/except', String.raw`assert "try" in src and "except" in src, "Use try / except."`, { hidden: true }),
  ],
  e2: [
    call('safe_divide', [10, 4], 2.5),
    call('safe_divide', [1, 0], null),
    call('safe_divide', [0, 5], 0.0, { hidden: true }),
    check('catches ZeroDivisionError by name', String.raw`assert "ZeroDivisionError" in src, "Catch ZeroDivisionError specifically."
assert "except:" not in src.replace(" ", ""), "Don't use a bare except."`, { hidden: true }),
    check('does not hide other errors', String.raw`try:
    ns["safe_divide"]("a", 2)
except TypeError:
    pass
else:
    fail("safe_divide('a', 2) should still raise TypeError: only catch ZeroDivisionError.")`, { hidden: true }),
  ],
  e3: [
    call('count_numbers', [['4', 'x', '10', '']], 2),
    call('count_numbers', [[]], 0),
    call('count_numbers', [['1', '2', '3']], 3, { hidden: true }),
    call('count_numbers', [['a', 'b']], 0, { hidden: true }),
    call('count_numbers', [['-5', '+7', '2.5']], 2, { hidden: true }),
  ],
  e4: [
    call('lookup', [{ apple: 3 }, 'apple'], 3),
    call('lookup', [{ apple: 3 }, 'pear'], 'unknown'),
    call('lookup', [{}, 'x'], 'unknown', { hidden: true }),
    check('uses try/except KeyError', String.raw`assert "KeyError" in src and "try" in src, "Use try / except KeyError."`, { hidden: true }),
  ],
}
