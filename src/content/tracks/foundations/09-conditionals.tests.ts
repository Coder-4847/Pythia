import { check, output, rerunOutput, rerunVar, variable } from '@/content/helpers'

export default {
  e1: [
    output([], 'Hot\n'),
    rerunOutput('25 is hot', [['temperature = 28', 'temperature = 25']], 'Hot', { hint: 'Is exactly 25 hot?' }),
    rerunOutput('10 is mild', [['temperature = 28', 'temperature = 10']], 'Mild'),
    check('uses if and else', String.raw`assert "if " in src and "else" in src`, { hidden: true }),
  ],
  e2: [
    output([], 'B\n'),
    rerunOutput('95 is an A', [['score = 85', 'score = 95']], 'A'),
    rerunOutput('90 is an A', [['score = 85', 'score = 90']], 'A', { hint: 'Check the boundaries: exactly 90, 80 and 70.' }),
    rerunOutput('72 is a C', [['score = 85', 'score = 72']], 'C'),
    rerunOutput('40 is an F', [['score = 85', 'score = 40']], 'F'),
  ],
  e3: [
    output([], 'odd\n'),
    rerunOutput('10 is even', [['number = 7', 'number = 10']], 'even'),
    rerunOutput('0 is even', [['number = 7', 'number = 0']], 'even'),
    check('uses %', String.raw`assert "%" in src, "Use the remainder operator %."`, { hidden: true }),
  ],
  e4: [
    variable('price', 15),
    rerunVar('age 3 is free', [['age = 30', 'age = 3']], 'price', 0),
    rerunVar('age 17 pays 8', [['age = 30', 'age = 17']], 'price', 8),
    rerunVar('age 18 pays 15', [['age = 30', 'age = 18']], 'price', 15, { hint: 'Check the exact boundaries: 5, 18 and 65.' }),
    rerunVar('age 65 pays 10', [['age = 30', 'age = 65']], 'price', 10),
  ],
}
