import { check, output } from '@/content/helpers'

export default {
  e1: [
    output([], 'Hello, Pythia!\n', { name: 'prints exactly “Hello, Pythia!”' }),
    check('prints a single line', 'assert out.count("\\n") == 1, "The message should be on a single line."', { hidden: true }),
    check('uses print()', 'assert "print(" in src, "Use the print() function to show the message."', { hidden: true }),
  ],
  e2: [
    output([], 'Python is\nfun\n', { name: 'prints “Python is” then “fun”' }),
    check('uses two print calls', 'assert src.count("print(") >= 2, "Use one print() call per line."', { hidden: true }),
  ],
  e3: [
    output([], 'I am 14 years old\n', { name: 'prints “I am 14 years old”' }),
    check('uses one print call', 'assert src.count("print(") == 1, "Use a single print() call."', { hidden: true }),
    check('14 is a number, not text', 'assert \'"14"\' not in src and "\'14\'" not in src, "Write 14 as a number, without quotes."', { hidden: true }),
  ],
}
