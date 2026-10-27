import { check, output, rerunOutput, rerunVar, variable } from '@/content/helpers'

const table = (n: number) => Array.from({ length: 10 }, (_, i) => `${n} x ${i + 1} = ${n * (i + 1)}`).join('\n') + '\n'

export default {
  e1: [
    output([], '1\n2\n3\n4\n5\n'),
    check('uses for and range', String.raw`assert "for " in src and "range(" in src, "Use a for loop with range()."`, { hidden: true }),
  ],
  e2: [
    variable('total', 110),
    check('uses a range step', String.raw`assert "range(" in src and src.count(",") >= 2, "Use the third (step) argument of range()."`, { hidden: true }),
  ],
  e3: [
    output([], table(7)),
    rerunOutput('works for n = 3', [['n = 7', 'n = 3']], table(3).trim()),
    check('uses a loop', String.raw`assert "for " in src`, { hidden: true }),
  ],
  e4: [
    variable('vowels', 3),
    rerunVar('works for education', [['word = "programming"', 'word = "education"']], 'vowels', 5),
    rerunVar('works with no vowels', [['word = "programming"', 'word = "rhythm"']], 'vowels', 0),
  ],
}
