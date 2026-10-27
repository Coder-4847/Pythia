import { check, lastLine, output } from '@/content/helpers'

export default {
  e1: [
    lastLine(['Ada'], 'Hello, Ada!'),
    lastLine(['Grace Hopper'], 'Hello, Grace Hopper!', { hidden: true }),
    check('uses input()', String.raw`assert "input(" in src, "Use input() to ask for the name."`, { hidden: true, stdin: ['Ada'] }),
  ],
  e2: [
    lastLine(['14'], 'Next year you will be 15'),
    lastLine(['40'], 'Next year you will be 41', { hidden: true }),
    lastLine(['0'], 'Next year you will be 1', { hidden: true }),
  ],
  e3: [
    lastLine(['3', '4'], '7'),
    lastLine(['10', '-2'], '8', { hidden: true }),
    lastLine(['100', '250'], '350', { hidden: true }),
  ],
  e4: [
    output([], '2026-01-15\n'),
    check('uses sep', String.raw`assert "sep" in src, "Use the sep argument to put the dashes between the values."`, { hidden: true }),
    check('does not type the dashes in the values', String.raw`assert '"-"' in src or "'-'" in src, "The dash should be the separator."`, { hidden: true }),
  ],
}
