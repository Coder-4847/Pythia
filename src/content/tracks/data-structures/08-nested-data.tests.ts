import { call, check } from '@/content/helpers'

const people = [
  { name: 'Ada', age: 36 },
  { name: 'Grace', age: 85 },
  { name: 'Linus', age: 54 },
]

export default {
  e1: [
    call('names', [people], ['Ada', 'Grace', 'Linus'], { name: 'names(people) → ["Ada", "Grace", "Linus"]' }),
    call('names', [[]], [], { hidden: true }),
    call('names', [[{ name: 'Solo', age: 1 }]], ['Solo'], { hidden: true }),
  ],
  e2: [
    call('average_age', [[{ name: 'a', age: 10 }, { name: 'b', age: 20 }]], 15, { name: 'average_age of ages 10 and 20 → 15' }),
    call('average_age', [[]], 0, { hint: 'What should an empty list give?' }),
    call('average_age', [people], (36 + 85 + 54) / 3, { hidden: true, name: 'average_age of three people' }),
  ],
  e3: [
    call('students_in', [{ math: ['Ada', 'Grace'], art: [] }, 'math'], ['Ada', 'Grace']),
    call('students_in', [{ math: ['Ada'] }, 'art'], []),
    call('students_in', [{ math: [] }, 'math'], [], { hidden: true }),
  ],
  e4: [
    call('oldest', [people], { name: 'Grace', age: 85 }, { name: 'oldest(people) → Grace’s record' }),
    call('oldest', [[{ name: 'Solo', age: 7 }]], { name: 'Solo', age: 7 }, { hidden: true }),
    check('returns the dictionary itself', String.raw`p = [{"name": "x", "age": 1}, {"name": "y", "age": 9}]
assert ns["oldest"](p) is p[1], "Return the person's whole dictionary, not just the age or name."`, { hidden: true }),
  ],
}
