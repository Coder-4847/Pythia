import { check } from '@/content/helpers'

export default {
  e1: [
    check('Rectangle(3, 4).area() is 12', String.raw`r = ns["Rectangle"](3, 4)
assert r.area() == 12, f"Rectangle(3, 4).area() should be 12, got {r.area()!r}."`),
    check('stores width and height', String.raw`r = ns["Rectangle"](5, 2)
assert (r.width, r.height) == (5, 2), "Store the values as attributes named width and height."`),
    check('each rectangle has its own size', String.raw`a, b = ns["Rectangle"](1, 2), ns["Rectangle"](10, 10)
assert (a.area(), b.area()) == (2, 100), f"Two rectangles should not share values: got {(a.area(), b.area())}."`, { hidden: true }),
    check('works with floats', String.raw`assert ns["Rectangle"](1.5, 2).area() == 3.0`, { hidden: true }),
  ],
  e2: [
    check('starts at zero', String.raw`c = ns["Counter"]()
assert c.value == 0, f"A new Counter should have value 0, got {c.value!r}."`),
    check('increment adds one', String.raw`c = ns["Counter"]()
c.increment(); c.increment(); c.increment()
assert c.value == 3, f"After three increments the value should be 3, got {c.value!r}."`),
    check('reset returns to zero', String.raw`c = ns["Counter"]()
c.increment(); c.reset()
assert c.value == 0, f"After reset the value should be 0, got {c.value!r}."`),
    check('counters are independent', String.raw`a, b = ns["Counter"](), ns["Counter"]()
a.increment(); a.increment()
assert (a.value, b.value) == (2, 0), f"Counters must not share a count: got {(a.value, b.value)}."`, { hidden: true }),
  ],
  e3: [
    check('str(Point(3, 4)) is (3, 4)', String.raw`s = str(ns["Point"](3, 4))
assert s == "(3, 4)", f"str(Point(3, 4)) should be '(3, 4)', got {s!r}."`),
    check('distance_from_origin of (3, 4) is 5', String.raw`d = ns["Point"](3, 4).distance_from_origin()
assert d == 5, f"The distance for (3, 4) should be 5.0, got {d!r}."`),
    check('negative coordinates print as given', String.raw`assert str(ns["Point"](-1, 0)) == "(-1, 0)"`, { hidden: true }),
    check('distance of the origin is 0', String.raw`assert ns["Point"](0, 0).distance_from_origin() == 0`, { hidden: true }),
    check('__str__ returns text, not prints', String.raw`import io, contextlib
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    s = str(ns["Point"](1, 2))
assert buf.getvalue() == "", "__str__ should return the text, not print it."`, { hidden: true }),
  ],
  e4: [
    check('empty cart', String.raw`c = ns["Cart"]()
assert (c.total(), c.count()) == (0, 0), f"An empty cart should total 0 with 0 items, got {(c.total(), c.count())}."`),
    check('adds up prices', String.raw`c = ns["Cart"]()
c.add("pen", 1.5); c.add("book", 10)
assert c.total() == 11.5 and c.count() == 2, f"Expected total 11.5 and 2 items, got {(c.total(), c.count())}."`),
    check('carts do not share items', String.raw`a, b = ns["Cart"](), ns["Cart"]()
a.add("x", 5)
assert (b.count(), b.total()) == (0, 0), "A new cart must start empty; don't share one list between carts."`, { hidden: true }),
    check('duplicates are counted', String.raw`c = ns["Cart"]()
c.add("pen", 2); c.add("pen", 2)
assert (c.count(), c.total()) == (2, 4)`, { hidden: true }),
  ],
}
