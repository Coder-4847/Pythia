import { call, check } from '@/content/helpers'

const raises = (fn: string, args: string, kind: string, extra = '') => {
  const label = kind.replace(/^ns\["(.*)"\]$/, '$1')
  return String.raw`try:
    ns[${JSON.stringify(fn)}](${args})
except ${kind} as e:
    ${extra || 'pass'}
except Exception as e:
    fail(f"Expected ${label}, but got {type(e).__name__}: {e}")
else:
    fail("Expected ${label} to be raised, but nothing was.")`
}

export default {
  e1: [
    call('check_age', [30], 30),
    call('check_age', [0], 0, { hidden: true }),
    call('check_age', [120], 120, { hidden: true }),
    check('rejects -1', raises('check_age', '-1', 'ValueError', 'assert str(e), "Give the error a message."')),
    check('rejects 121', raises('check_age', '121', 'ValueError'), { hidden: true }),
  ],
  e2: [
    call('withdraw', [100, 30], 70),
    check(
      'InsufficientFunds is an exception',
      String.raw`cls = ns.get("InsufficientFunds")
assert isinstance(cls, type) and issubclass(cls, Exception), "Define a class InsufficientFunds that inherits from Exception."`,
    ),
    check('raises InsufficientFunds when overdrawn', raises('withdraw', '10, 50', 'ns["InsufficientFunds"]')),
    call('withdraw', [50, 50], 0, { hidden: true }),
    check('not just a ValueError', String.raw`try:
    ns["withdraw"](1, 2)
except ns["InsufficientFunds"]:
    pass
else:
    fail("Raise InsufficientFunds.")`, { hidden: true }),
  ],
  e3: [
    check('success path logs open, work, close', String.raw`log = []
ns["run_job"](log, False)
assert log == ["open", "work", "close"], f"Expected ['open', 'work', 'close'], got {log}."`),
    check('failure path still closes and re-raises', String.raw`log = []
try:
    ns["run_job"](log, True)
except RuntimeError:
    pass
else:
    fail("The RuntimeError should still reach the caller.")
assert log == ["open", "close"], f"Expected ['open', 'close'], got {log}."`),
    check('uses finally', String.raw`assert "finally" in src, "Use a finally block for the closing step."`, { hidden: true }),
  ],
  e4: [
    call('parse_all', [['1', '22', '-3']], [1, 22, -3]),
    call('parse_all', [[]], [], { hidden: true }),
    check('names the bad item', raises('parse_all', '["1", "x"]', 'ValueError', String.raw`assert str(e) == "bad value: 'x'", f"The message should be \"bad value: 'x'\", but it is {str(e)!r}."`)),
    check('names a different bad item', raises('parse_all', '["", "2"]', 'ValueError', String.raw`assert str(e) == "bad value: ''", f"The message should be \"bad value: ''\", but it is {str(e)!r}."`), { hidden: true }),
  ],
}
