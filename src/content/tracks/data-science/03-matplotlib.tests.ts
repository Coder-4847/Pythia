import { check } from '@/content/helpers'

export default {
  e1: [
    check('title and labels', String.raw`ax = ns["growth_chart"]([1, 2, 3], [2.0, 3.5, 5.0])
assert ax.get_title() == "Growth", f"The title should be 'Growth', but it is {ax.get_title()!r}."
assert ax.get_xlabel() == "Day", f"The x label should be 'Day', but it is {ax.get_xlabel()!r}."
assert ax.get_ylabel() == "Height (cm)", f"The y label should be 'Height (cm)', but it is {ax.get_ylabel()!r}."`),
    check('one line with the data', String.raw`ax = ns["growth_chart"]([1, 2, 3], [2.0, 3.5, 5.0])
assert len(ax.lines) == 1, f"Draw one line, but the chart has {len(ax.lines)}."
assert list(ax.lines[0].get_xdata()) == [1, 2, 3] and list(ax.lines[0].get_ydata()) == [2.0, 3.5, 5.0], "The line should plot heights against days."`),
    check('returns the axes', String.raw`from matplotlib.axes import Axes
assert isinstance(ns["growth_chart"]([1], [1]), Axes), "Return the axes (ax) at the end of the function."`, { hidden: true }),
    check('works for other data', String.raw`ax = ns["growth_chart"]([10, 20], [1.0, 9.0])
assert list(ax.lines[0].get_ydata()) == [1.0, 9.0]`, { hidden: true }),
  ],
  e2: [
    check('one bar per label', String.raw`ax = ns["bar_chart"](["a", "b", "c"], [3, 1, 2])
assert len(ax.patches) == 3, f"Expected 3 bars, found {len(ax.patches)}."
assert [round(p.get_height()) for p in ax.patches] == [3, 1, 2], "The bar heights should match the values."`),
    check('labels and title', String.raw`ax = ns["bar_chart"](["a", "b"], [1, 2])
assert [t.get_text() for t in ax.get_xticklabels()] == ["a", "b"], "The x tick labels should be the labels you were given."
assert ax.get_title() == "Totals", f"The title should be 'Totals', but it is {ax.get_title()!r}."`),
    check('returns the axes', String.raw`from matplotlib.axes import Axes
assert isinstance(ns["bar_chart"](["x"], [1]), Axes)`, { hidden: true }),
    check('a single bar', String.raw`ax = ns["bar_chart"](["only"], [7])
assert len(ax.patches) == 1 and round(ax.patches[0].get_height()) == 7`, { hidden: true }),
  ],
  e3: [
    check('two lines', String.raw`ax = ns["compare_chart"]([1, 2, 3], [1, 2, 3], [1, 4, 9])
assert len(ax.lines) == 2, f"Expected two lines, found {len(ax.lines)}."
assert list(ax.lines[1].get_ydata()) == [1, 4, 9], "The second line should plot the second series."`),
    check('legend with both names', String.raw`ax = ns["compare_chart"]([1, 2], [1, 2], [2, 1])
legend = ax.get_legend()
assert legend is not None, "Call ax.legend() to show a legend."
assert [t.get_text() for t in legend.get_texts()] == ["first", "second"], "The legend should list 'first' and 'second'."`),
    check('returns the axes', String.raw`from matplotlib.axes import Axes
assert isinstance(ns["compare_chart"]([1], [1], [1]), Axes)`, { hidden: true }),
    check('both lines share the x values', String.raw`ax = ns["compare_chart"]([5, 6], [1, 1], [2, 2])
assert all(list(l.get_xdata()) == [5, 6] for l in ax.lines)`, { hidden: true }),
  ],
}
