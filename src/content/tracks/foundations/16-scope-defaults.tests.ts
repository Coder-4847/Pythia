import { call, callPrints, check, variable } from '@/content/helpers'

export default {
  e1: [
    call('power', [5], 25),
    call('power', [2, 10], 1024),
    call('power', [3], 9, { hidden: true }),
    call('power', [4, 0], 1, { hidden: true }),
    check('exponent has a default', String.raw`assert "exponent=2" in src.replace(" ", ""), "Give exponent a default value of 2."`, { hidden: true }),
  ],
  e2: [
    call('greet', ['Ada'], 'Hello, Ada!'),
    call('greet', ['Ada', 'Welcome'], 'Welcome, Ada!'),
    call('greet', ['Ada'], 'Hi, Ada!', { kwargs: { greeting: 'Hi' }, name: 'greet("Ada", greeting="Hi") → "Hi, Ada!"' }),
    call('greet', [], 'Hey, Bo!', { kwargs: { name: 'Bo', greeting: 'Hey' }, hidden: true, name: 'greet(greeting="Hey", name="Bo")' }),
  ],
  e3: [
    callPrints('count_down', [3], '3\n2\n1\nGo!'),
    callPrints('count_down', [1], '1\nGo!', { hidden: true }),
    callPrints('count_down', [5], '5\n4\n3\n2\n1\nGo!', { hidden: true }),
  ],
  e4: [
    variable('total', 7),
    check('the function returns the value', String.raw`assert "return" in src, "Make add_up return the total."`, { hidden: true }),
    check('add_up gives back a number', String.raw`assert ns["add_up"](1, 2) == 3, "add_up(1, 2) should return 3."`, { hidden: true }),
  ],
}
