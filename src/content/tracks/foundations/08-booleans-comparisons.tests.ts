import { check, rerunVar, variable } from '@/content/helpers'

export default {
  e1: [
    variable('is_adult', false),
    rerunVar('age 18 is an adult', [['age = 17', 'age = 18']], 'is_adult', true, { hint: 'Is exactly 18 old enough?' }),
    rerunVar('age 40 is an adult', [['age = 17', 'age = 40']], 'is_adult', true),
  ],
  e2: [
    variable('is_teen', true),
    rerunVar('age 13 is a teen', [['age = 14', 'age = 13']], 'is_teen', true, { hint: 'Check both ends of the range.' }),
    rerunVar('age 19 is a teen', [['age = 14', 'age = 19']], 'is_teen', true),
    rerunVar('age 20 is not a teen', [['age = 14', 'age = 20']], 'is_teen', false),
    rerunVar('age 12 is not a teen', [['age = 14', 'age = 12']], 'is_teen', false),
  ],
  e3: [
    variable('same', true),
    rerunVar('different words are not the same', [['b = "python"', 'b = "java"']], 'same', false),
    check('is a boolean', String.raw`assert type(ns["same"]) is bool`, { hidden: true }),
  ],
  e4: [
    variable('is_five', true),
    rerunVar('answer 6 is not five', [['answer = 5\n', 'answer = 6\n']], 'is_five', false),
    check('uses ==', String.raw`assert "==" in src, "Use == to compare."`, { hidden: true }),
  ],
}
