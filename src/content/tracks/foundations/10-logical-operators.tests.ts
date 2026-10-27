import { check, output, rerunOutput, rerunVar, variable } from '@/content/helpers'

export default {
  e1: [
    variable('can_ride', true),
    rerunVar('too short', [['height = 125', 'height = 110']], 'can_ride', false),
    rerunVar('too young', [['age = 9', 'age = 6']], 'can_ride', false),
    rerunVar('exactly the minimums', [['height = 125', 'height = 120'], ['age = 9', 'age = 8']], 'can_ride', true, { hint: 'The limits themselves are allowed.' }),
  ],
  e2: [
    variable('is_weekend', true),
    rerunVar('Sun is a weekend', [['day = "Sat"', 'day = "Sun"']], 'is_weekend', true),
    rerunVar('Mon is not', [['day = "Sat"', 'day = "Mon"']], 'is_weekend', false, { hint: 'Compare day with each value separately.' }),
  ],
  e3: [
    output([], 'Welcome\n'),
    rerunOutput('wrong password', [['password = "1234"', 'password = "nope"']], 'Denied'),
    rerunOutput('wrong username', [['username = "admin"', 'username = "guest"']], 'Denied'),
    check('uses and', String.raw`assert " and " in src, "Use and to require both."`, { hidden: true }),
  ],
  e4: [
    variable('go_to_work', false),
    rerunVar('a plain weekday', [['is_holiday = False\nis_weekend = True', 'is_holiday = False\nis_weekend = False']], 'go_to_work', true),
    rerunVar('a weekday holiday', [['is_holiday = False\nis_weekend = True', 'is_holiday = True\nis_weekend = False']], 'go_to_work', false),
    check('uses not', String.raw`assert "not" in src, "Use not to flip the booleans."`, { hidden: true }),
  ],
}
