import { check, variable } from '@/content/helpers'

export default {
  e1: [
    variable('count', 7),
    variable('price', 2.5),
    variable('label', 'apples'),
    variable('in_stock', true),
    check('count is an int and price is a float', String.raw`assert type(ns["count"]) is int, "count should be a whole number (int)."
assert type(ns["price"]) is float, "price should be a decimal number (float)."`, { hidden: true }),
    check('label is text and in_stock is a bool', String.raw`assert type(ns["label"]) is str
assert type(ns["in_stock"]) is bool, "in_stock should be True (a bool), not text."`, { hidden: true }),
  ],
  e2: [
    variable('age', 21),
    variable('next_year', 22),
    check('age is an int, not text', String.raw`assert type(ns["age"]) is int, "age should be a number. Convert the text first."`, { hidden: true }),
    check('converts with int()', String.raw`assert "int(" in src, "Convert age_text with int()."`, { hidden: true }),
  ],
  e3: [
    variable('message', 'Score: 95'),
    check('message is a string built from score', String.raw`assert "str(" in src or "f\"" in src or "f'" in src, "Convert score to text (str) before joining."
assert "95" not in src.split("# Create message")[-1].replace("score = 95", ""), "Build the message from the variable score, not by typing 95 again."`, {
      hidden: true,
    }),
  ],
}
