import { check, variable } from '@/content/helpers'

export default {
  e1: [
    variable('total_seconds', 8100),
    check('uses the variables, not a typed number', String.raw`assert "hours" in src.split("# Create total_seconds")[-1] and "minutes" in src.split("# Create total_seconds")[-1], "Build total_seconds from hours and minutes."`, {
      hidden: true,
      hint: 'Use the variables hours and minutes, so it still works if they change.',
    }),
    check('works for other values', String.raw`ns2 = {}
exec(src.replace("hours = 2", "hours = 1").replace("minutes = 15", "minutes = 30"), ns2)
assert ns2["total_seconds"] == 5400, "With 1 hour 30 minutes the answer should be 5400."`, { hidden: true }),
  ],
  e2: [
    variable('each', 3),
    variable('left_over', 2),
    check('uses // and %', String.raw`assert "//" in src and "%" in src, "Use floor division (//) and remainder (%)."`, { hidden: true }),
    check('works for other numbers', String.raw`ns2 = {}
exec(src.replace("sweets = 17", "sweets = 23").replace("children = 5", "children = 4"), ns2)
assert (ns2["each"], ns2["left_over"]) == (5, 3), "With 23 sweets and 4 children: 5 each and 3 left over."`, { hidden: true }),
  ],
  e3: [
    variable('area', 16),
    variable('volume', 64),
    check('uses **', String.raw`assert "**" in src, "Use the power operator **."`, { hidden: true }),
    check('works for other sides', String.raw`ns2 = {}
exec(src.replace("side = 4", "side = 5"), ns2)
assert (ns2["area"], ns2["volume"]) == (25, 125)`, { hidden: true }),
  ],
  e4: [
    variable('average', 8.0),
    check('uses parentheses', String.raw`assert "(" in src, "You need parentheses to make the addition happen first."`, { hidden: true }),
  ],
}
