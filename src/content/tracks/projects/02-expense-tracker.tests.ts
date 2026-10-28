import { call, check } from '@/content/helpers'

const sample = [
  { name: 'coffee', amount: 3.5, category: 'food' },
  { name: 'bus pass', amount: 40.0, category: 'travel' },
  { name: 'lunch', amount: 9.0, category: 'food' },
]

export default {
  e1: [
    check('appends a record', String.raw`items = []
ns["add_expense"](items, "coffee", 3.5, "food")
assert items == [{"name": "coffee", "amount": 3.5, "category": "food"}], f"Expected one dict with name, amount and category, got {items!r}."`),
    check('rejects zero and negative amounts', String.raw`items = []
for bad in (0, -5):
    try:
        ns["add_expense"](items, "x", bad, "y")
    except ValueError:
        pass
    else:
        fail(f"An amount of {bad} should raise ValueError.")
assert items == [], "Nothing should be added when the amount is invalid."`),
    check('keeps earlier items', String.raw`items = [{"name": "a", "amount": 1, "category": "c"}]
ns["add_expense"](items, "b", 2, "c")
assert len(items) == 2 and items[0]["name"] == "a"`, { hidden: true }),
    check('accepts a tiny positive amount', String.raw`items = []
ns["add_expense"](items, "gum", 0.01, "food")
assert len(items) == 1`, { hidden: true }),
  ],
  e2: [
    call('total', [sample], 52.5),
    call('total', [[]], 0),
    call('total', [[{ name: 'x', amount: 0.1, category: 'a' }, { name: 'y', amount: 0.2, category: 'a' }]], 0.3, { hidden: true }),
    call('total', [[{ name: 'x', amount: 10, category: 'a' }]], 10, { hidden: true }),
  ],
  e3: [
    call('by_category', [sample], { food: 12.5, travel: 40.0 }),
    call('by_category', [[]], {}),
    call('by_category', [[{ name: 'x', amount: 0.1, category: 'a' }, { name: 'y', amount: 0.2, category: 'a' }]], { a: 0.3 }, { hidden: true }),
    call('by_category', [[{ name: 'x', amount: 5, category: 'a' }, { name: 'y', amount: 6, category: 'b' }]], { a: 5, b: 6 }, { hidden: true }),
  ],
  e4: [
    call('report', [sample], 'food         12.50\ntravel       40.00\nTOTAL        52.50'),
    call('report', [[]], 'TOTAL         0.00'),
    call('report', [[{ name: 'x', amount: 1, category: 'b' }, { name: 'y', amount: 2, category: 'a' }]], 'a             2.00\nb             1.00\nTOTAL         3.00', { hidden: true }),
    check('no trailing newline', String.raw`r = ns["report"]([{"name": "x", "amount": 1, "category": "a"}])
assert not r.endswith("\n"), "Join the lines with newlines, with no newline at the end."`, { hidden: true }),
  ],
}
