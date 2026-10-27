import { check, lastLine, output, rerunVar, variable } from '@/content/helpers'

export default {
  e1: [
    output([], '5\n4\n3\n2\n1\nLiftoff!\n', { name: 'counts 5 to 1 then prints Liftoff!' }),
    check('uses a while loop', String.raw`assert "while" in src, "Use a while loop."`, { hidden: true }),
  ],
  e2: [
    variable('total', 55),
    rerunVar('n = 4 gives 10', [['n = 10', 'n = 4']], 'total', 10),
    rerunVar('n = 1 gives 1', [['n = 10', 'n = 1']], 'total', 1, { hint: 'Is n itself included?' }),
    check('uses a while loop', String.raw`assert "while" in src, "Use a while loop."`, { hidden: true }),
  ],
  e3: [
    variable('value', 1024),
    variable('steps', 10),
    rerunVar('a lower limit', [['value = 1\n', 'value = 3\n']], 'steps', 9),
    check('uses a while loop', String.raw`assert "while" in src`, { hidden: true }),
  ],
  e4: [
    lastLine(['3', '4', '0'], '7'),
    lastLine(['0'], '0', { hidden: true }),
    lastLine(['10', '-4', '5', '0'], '11', { hidden: true }),
    check('uses a while loop', String.raw`assert "while" in src`, { hidden: true, stdin: ['1', '0'] }),
  ],
}
