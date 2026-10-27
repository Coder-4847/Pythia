import { check, output, variable } from '@/content/helpers'

export default {
  e1: [
    variable('clean', 'Ada Lovelace'),
    check('works for other names', String.raw`ns2 = {}
exec(src.replace('"  ada lovelace  "', '"   grace hopper "'), ns2)
assert ns2["clean"] == "Grace Hopper", "Use methods, so it works for any messy name."`, { hidden: true }),
  ],
  e2: [
    output([], 'Ada is 36 years old\n'),
    check('uses an f-string', String.raw`assert 'f"' in src or "f'" in src, "Use an f-string: put an f before the opening quote."`, { hidden: true }),
    check('uses the variables', String.raw`assert "{name}" in src and "{age}" in src, "Put the variables name and age inside the braces instead of typing their values."`, { hidden: true }),
  ],
  e3: [
    output([], 'Price: $3.14\n'),
    check('uses a format spec', String.raw`assert ".2f" in src, "Use :.2f inside the braces to show two decimals."`, { hidden: true }),
  ],
  e4: [
    variable('new_sentence', 'I like dogs. Cats are great.'),
    check('uses replace', String.raw`assert "replace" in src, "Use the replace method."`, { hidden: true }),
  ],
}
