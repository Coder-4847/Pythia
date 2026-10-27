import { check, output, rerunOutput, variable } from '@/content/helpers'

export default {
  e1: [
    variable('first', 56),
    check('uses break', String.raw`assert "break" in src, "Use break to stop searching once you find it."`, { hidden: true }),
  ],
  e2: [
    output([], '1\n2\n4\n5\n7\n8\n10\n'),
    check('uses continue', String.raw`assert "continue" in src, "Use continue to skip the multiples of 3."`, { hidden: true }),
  ],
  e3: [
    output([], '****\n****\n****\n'),
    rerunOutput('2 rows of 5', [['rows = 3', 'rows = 2'], ['cols = 4', 'cols = 5']], '*****\n*****'),
    check('uses nested loops', String.raw`assert src.count("for ") >= 2, "Use a loop inside a loop."`, { hidden: true }),
  ],
  e4: [
    output([], '*\n**\n***\n****\n'),
    rerunOutput('size 2', [['size = 4', 'size = 2']], '*\n**'),
    rerunOutput('size 6', [['size = 4', 'size = 6']], '*\n**\n***\n****\n*****\n******'),
  ],
}
