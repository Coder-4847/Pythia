import { check, output, variable } from '@/content/helpers'

export default {
  e1: [
    variable('first', 'p'),
    variable('last', 'n'),
    variable('size', 6),
    check('works for other words', String.raw`ns2 = {}
exec(src.replace('"python"', '"banana"'), ns2)
assert (ns2["first"], ns2["last"], ns2["size"]) == ("b", "a", 6), "Your code should work for any word, not just python. Try index -1 and len()."`, { hidden: true }),
  ],
  e2: [
    variable('start', 'pyt'),
    variable('end', 'hon'),
    check('uses slices', String.raw`assert "[" in src.split("# Create")[-1] and ":" in src.split("# Create")[-1], "Use slices like word[a:b]."`, { hidden: true }),
  ],
  e3: [
    output([], '====================\nPythia\n====================\n', { name: 'prints the three-line banner' }),
    check('uses * to repeat', String.raw`assert "*" in src, "Use the * operator to repeat the equals sign."`, { hidden: true }),
  ],
  e4: [
    variable('swapped', 'hiapyt'),
    check('works for other words', String.raw`ns2 = {}
exec(src.replace('"pythia"', '"abcdef"'), ns2)
assert ns2["swapped"] == "defabc", "Swap the halves with slices so it works for any six-letter word."`, { hidden: true }),
  ],
}
