import { check } from '@/content/helpers'

const people = String.raw`import pandas as pd
df = pd.DataFrame({"name": ["Ada", "Grace", "Linus", "Guido"], "age": [36, 45, 17, 18], "score": [91, 88, 72, 85]})`

export default {
  e1: [
    check('keeps people aged 18 or over', `${people}
r = ns["adults"](df)
assert list(r["name"]) == ["Ada", "Grace", "Guido"], f"Expected Ada, Grace and Guido (18 counts), got {list(r['name'])}."`),
    check('keeps all the columns', `${people}
assert list(ns["adults"](df).columns) == ["name", "age", "score"], "Keep every column; only filter rows."`),
    check('nobody qualifies', String.raw`import pandas as pd
r = ns["adults"](pd.DataFrame({"name": ["Kid"], "age": [9]}))
assert len(r) == 0, "No rows should be left."`, { hidden: true }),
    check('does not change the original', `${people}
ns["adults"](df)
assert len(df) == 4`, { hidden: true }),
  ],
  e2: [
    check('mean per group as a dict', String.raw`import pandas as pd
df = pd.DataFrame({"city": ["Rome", "Oslo", "Rome", "Oslo"], "amount": [10, 7, 30, 3]})
r = ns["average_by"](df, "city", "amount")
assert r == {"Oslo": 5.0, "Rome": 20.0}, f"Expected {{'Oslo': 5.0, 'Rome': 20.0}}, got {r!r}."
assert isinstance(r, dict), "Return a plain dict (use .to_dict())."`),
    check('different columns', String.raw`import pandas as pd
df = pd.DataFrame({"team": ["a", "b", "a"], "pts": [1, 5, 4], "x": [0, 0, 0]})
assert ns["average_by"](df, "team", "pts") == {"a": 2.5, "b": 5.0}`, { hidden: true }),
    check('single group', String.raw`import pandas as pd
df = pd.DataFrame({"g": ["z", "z"], "v": [2, 4]})
assert ns["average_by"](df, "g", "v") == {"z": 3.0}`, { hidden: true }),
  ],
  e3: [
    check('the two best, best first', `${people}
r = ns["top_n"](df, "score", 2)
assert list(r["name"]) == ["Ada", "Grace"], f"Expected Ada then Grace, got {list(r['name'])}."`),
    check('another column', `${people}
r = ns["top_n"](df, "age", 1)
assert list(r["name"]) == ["Grace"]`, { hidden: true }),
    check('asking for more than there are', `${people}
assert len(ns["top_n"](df, "score", 10)) == 4`, { hidden: true }),
    check('descending order', `${people}
scores = list(ns["top_n"](df, "score", 4)["score"])
assert scores == sorted(scores, reverse=True), f"Largest first, but got {scores}."`, { hidden: true }),
  ],
  e4: [
    check('adds total = price * qty', String.raw`import pandas as pd
df = pd.DataFrame({"item": ["pen", "book"], "price": [1.5, 12.0], "qty": [10, 2]})
r = ns["with_total"](df)
assert list(r["total"]) == [15.0, 24.0], f"Expected totals [15.0, 24.0], got {list(r['total'])}."`),
    check('leaves the original alone', String.raw`import pandas as pd
df = pd.DataFrame({"item": ["pen"], "price": [2.0], "qty": [3]})
ns["with_total"](df)
assert "total" not in df.columns, "Work on a copy: the original DataFrame must not get a total column."`),
    check('keeps the other columns', String.raw`import pandas as pd
df = pd.DataFrame({"item": ["pen"], "price": [2.0], "qty": [3]})
assert list(ns["with_total"](df).columns) == ["item", "price", "qty", "total"]`, { hidden: true }),
    check('no loop needed', String.raw`assert "for " not in src and "iterrows" not in src, "Multiply the two columns directly; no loop."`, { hidden: true }),
  ],
}
