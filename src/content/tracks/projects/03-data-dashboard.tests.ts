import { check } from '@/content/helpers'

const data = String.raw`import io
import pandas as pd
csv_text = "month,product,amount\n2024-01,pens,120\n2024-01,books,300\n2024-02,pens,150\n2024-02,books,280\n2024-03,pens,90\n"
df = pd.read_csv(io.StringIO(csv_text))
`

export default {
  e1: [
    check('parses rows and columns', `${data}
r = ns["load"](csv_text)
assert list(r.columns) == ["month", "product", "amount"], f"Expected columns month, product, amount; got {list(r.columns)}."
assert len(r) == 5, f"Expected 5 rows, got {len(r)}."`),
    check('numbers are numbers', `${data}
r = ns["load"](csv_text)
assert r["amount"].sum() == 940, "The amount column should be numeric, so its sum is 940."`),
    check('a different file', String.raw`r = ns["load"]("a,b\n1,2\n3,4\n")
assert r.shape == (2, 2) and list(r["b"]) == [2, 4]`, { hidden: true }),
  ],
  e2: [
    check('totals per month', `${data}
r = ns["monthly_totals"](df)
assert r == {"2024-01": 420, "2024-02": 430, "2024-03": 90}, f"Got {r!r}."
assert isinstance(r, dict), "Return a plain dict (use .to_dict())."`),
    check('one month', String.raw`import pandas as pd
d = pd.DataFrame({"month": ["m", "m"], "product": ["a", "b"], "amount": [1, 2]})
assert ns["monthly_totals"](d) == {"m": 3}`, { hidden: true }),
    check('ignores the product column', String.raw`import pandas as pd
d = pd.DataFrame({"month": ["x", "y"], "product": ["a", "a"], "amount": [5, 7]})
assert ns["monthly_totals"](d) == {"x": 5, "y": 7}`, { hidden: true }),
  ],
  e3: [
    check('books earn the most', `${data}
r = ns["best_product"](df)
assert r == "books", f"Books total 580 and pens 360, so expected 'books', got {r!r}."`),
    check('another dataset', String.raw`import pandas as pd
d = pd.DataFrame({"month": ["m"] * 3, "product": ["a", "b", "c"], "amount": [1, 9, 5]})
assert ns["best_product"](d) == "b"`, { hidden: true }),
    check('sums across months', String.raw`import pandas as pd
d = pd.DataFrame({"month": ["1", "2", "1", "2"], "product": ["a", "a", "b", "b"], "amount": [4, 4, 7, 0]})
assert ns["best_product"](d) == "a", "Add up each product over all months before comparing."`, { hidden: true }),
  ],
  e4: [
    check('a figure with two axes', `${data}
fig = ns["dashboard"](df)
assert len(fig.axes) == 2, f"The figure should have 2 axes, but has {len(fig.axes)}."`),
    check('titles', `${data}
left, right = ns["dashboard"](df).axes
assert left.get_title() == "Sales by month", f"The first title should be 'Sales by month', but is {left.get_title()!r}."
assert right.get_title() == "Sales by product", f"The second title should be 'Sales by product', but is {right.get_title()!r}."`),
    check('a line of 3 months and 2 bars', `${data}
left, right = ns["dashboard"](df).axes
assert len(left.lines) == 1 and len(left.lines[0].get_ydata()) == 3, "The first chart should be one line with a point per month."
assert list(left.lines[0].get_ydata()) == [420, 430, 90], f"The line should plot the monthly totals [420, 430, 90], got {list(left.lines[0].get_ydata())}."
assert len(right.patches) == 2, f"The second chart should have a bar per product (2), but has {len(right.patches)}."`, { hidden: true }),
    check('bar heights are the product totals', `${data}
right = ns["dashboard"](df).axes[1]
assert sorted(round(p.get_height()) for p in right.patches) == [360, 580]`, { hidden: true }),
  ],
}
