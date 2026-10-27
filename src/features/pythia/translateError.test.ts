import { describe, expect, it } from 'vitest'
import { translateError } from '@/features/pythia/translateError'
import type { PyError } from '@/workers/protocol'

const err = (type: string, message: string, line: number | null = 3): PyError => ({ type, message, traceback: '', line, file: 'main.py' })

describe('translateError', () => {
  const cases: [string, string, string, string][] = [
    ['NameError', "name 'totl' is not defined", 'doesn\'t know the name `totl` on line 3', 'spelled exactly the same'],
    ['TypeError', 'can only concatenate str (not "int") to str', 'Text and a int were joined with + on line 3', 'turn one into the other'],
    ['TypeError', "unsupported operand type(s) for +: 'int' and 'str'", "can't use `+` between a int and a str", 'does Python know how to combine'],
    ['TypeError', "'NoneType' object is not subscriptable", 'is None', 'missing its return'],
    ['TypeError', "'int' object is not callable", 'was called like a function', 'reuse the name of a function'],
    ['TypeError', 'add() takes 2 positional arguments but 3 were given', '`add()` was called with the wrong number', 'how many does this call pass'],
    ['TypeError', "'float' object cannot be interpreted as an integer", 'whole number was needed', 'decimal'],
    ['AttributeError', "'str' object has no attribute 'append'", 'A str has no `.append`', 'Which methods does a str offer'],
    ['AttributeError', "'NoneType' object has no attribute 'upper'", '`.upper` was used on a value that is None', 'missing its return'],
    ['IndexError', 'list index out of range', 'past the end', 'last index that exists'],
    ['KeyError', "'name'", "a key it doesn't have", 'same spelling and capitals'],
    ['ValueError', "invalid literal for int() with base 10: 'abc'", "`int()` was given 'abc'", 'only digits'],
    ['ValueError', 'not enough values to unpack (expected 2, got 1)', "doesn't match the number of values", 'names are on the left'],
    ['ZeroDivisionError', 'division by zero', 'divided by zero', 'divisor'],
    ['RecursionError', 'maximum recursion depth exceeded', 'calling itself', 'stops the function'],
    ['ModuleNotFoundError', "No module named 'requests'", '`requests`', 'Packages menu'],
    ['EOFError', 'EOF when reading a line', '`input()` was asked', 'how many answers'],
    ['SyntaxError', "expected ':'", 'expected a colon', 'must end with'],
    ['SyntaxError', 'unterminated string literal (detected at line 3)', 'never closed', 'matching partner'],
    ['SyntaxError', "'(' was never closed", 'no partner', 'waiting for'],
    ['SyntaxError', "invalid syntax. Maybe you meant '==' or ':=' instead of '='?", 'single =', 'How many equals signs'],
    ['IndentationError', 'expected an indented block after if statement on line 2', 'indentation', 'same amount'],
    ['UnboundLocalError', "cannot access local variable 'x' where it is not associated with a value", 'used `x`', 'assigned inside this function'],
    ['WeirdError', 'something odd', 'stopped with a WeirdError on line 3', 'last line of the message'],
  ]

  it.each(cases)('%s: %s', (type, message, headline, question) => {
    const t = translateError(err(type, message))
    expect(t?.headline).toContain(headline)
    expect(t?.question).toContain(question)
  })

  it('never states a fix: every question really is a question', () => {
    for (const [type, message] of cases) expect(translateError(err(type, message))?.question).toMatch(/\?$/)
  })

  it('stays silent for a manual stop', () => {
    expect(translateError(err('KeyboardInterrupt', 'Stopped'))).toBeNull()
  })

  it('omits the line when it is unknown', () => {
    expect(translateError(err('ZeroDivisionError', 'division by zero', null))?.headline).toBe('Something was divided by zero.')
  })
})
