import { check, output, variable } from '@/content/helpers'

export default {
  e1: [
    variable('name', 'Ada', { name: 'name is "Ada"' }),
    variable('age', 14, { name: 'age is the number 14', hint: 'age should be a number, so no quotes around 14.' }),
    check('uses = to assign', 'assert "=" in src', { hidden: true }),
  ],
  e2: [
    variable('score', 15, { name: 'score ends up as 15' }),
    output([], '15\n', { name: 'prints 15' }),
    check('does not just assign 15', 'assert "score = 15" not in src.replace("  ", " "), "Compute it from the old value: add 5 to score."', {
      hidden: true,
      hint: 'Build 15 from the old score instead of typing it.',
    }),
  ],
  e3: [
    variable('a', 2, { name: 'a is 2' }),
    variable('b', 1, { name: 'b is 1' }),
    check('does not retype the numbers', 'assert "a = 2" not in src and "b = 1\\n" not in src.split("# Swap")[-1] + "\\n", "Swap using the variables, not by typing new numbers."', {
      hidden: true,
      hint: 'Use a third variable to hold one value while you swap.',
    }),
  ],
  e4: [
    variable('total', 12, { name: 'total is 12' }),
    output([], '12\n', { name: 'prints 12' }),
    check('multiplies the variables', 'assert "price * quantity" in src.replace("  ", " ") or "quantity * price" in src.replace("  ", " "), "Multiply price and quantity rather than typing 12."', {
      hidden: true,
    }),
  ],
}
