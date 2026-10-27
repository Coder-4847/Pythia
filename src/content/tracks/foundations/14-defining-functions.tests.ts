import { callPrints, check } from '@/content/helpers'

export default {
  e1: [
    callPrints('greet', [], 'Hello, world!'),
    check('uses def', String.raw`assert "def greet" in src`, { hidden: true }),
  ],
  e2: [
    callPrints('shout', ['hello'], 'HELLO!'),
    callPrints('shout', ['pythia rocks'], 'PYTHIA ROCKS!', { hidden: true }),
    callPrints('shout', [''], '!', { hidden: true }),
  ],
  e3: [
    callPrints('box', ['Hi'], '--\nHi\n--'),
    callPrints('box', ['Python'], '------\nPython\n------', { hidden: true }),
    callPrints('box', ['a'], '-\na\n-', { hidden: true }),
  ],
  e4: [
    check('prints the cheer three times', String.raw`assert out.count("Hip hip hooray!") == 3, f"cheer() should run 3 times, but it ran {out.count('Hip hip hooray!')} times."`),
    check('uses a loop, not three copies', String.raw`assert "for " in src or "while " in src, "Use a loop to repeat the call."`, { hidden: true }),
  ],
}
