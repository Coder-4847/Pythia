import type { PyError } from '@/workers/protocol'

export interface Translation {
  /** What happened, in plain English. */
  headline: string
  /** A guiding question that points at the cause without naming the fix. */
  question: string
}

type Rule = { type: RegExp; message?: RegExp; make: (m: RegExpMatchArray, e: PyError) => Translation }

const at = (e: PyError) => (e.line ? ` on line ${e.line}` : '')
const code = (s: string) => `\`${s}\``

/** First match wins, so put the specific patterns before the general ones. */
const RULES: Rule[] = [
  // ───────── syntax ─────────
  {
    type: /^SyntaxError$/,
    message: /expected ':'/,
    make: (_m, e) => ({
      headline: `Python got to the end of a line${at(e)} and expected a colon.`,
      question: 'Which kinds of line must end with `:`, and does this one?',
    }),
  },
  {
    type: /^SyntaxError$/,
    message: /unterminated string/,
    make: (_m, e) => ({
      headline: `A string${at(e)} was opened but never closed.`,
      question: 'Which quote opens this string, and where is its matching partner?',
    }),
  },
  {
    type: /^SyntaxError$/,
    message: /'(.)' was never closed|unmatched '(.)'/,
    make: (m, e) => ({
      headline: `A bracket${at(e)} has no partner.`,
      question: `Which ${code(m[1] ?? m[2] ?? '(')} is waiting for (or missing) its other half?`,
    }),
  },
  {
    type: /^SyntaxError$/,
    message: /Maybe you meant '=='/,
    make: (_m, e) => ({
      headline: `A single = was used${at(e)} where Python expected a question.`,
      question: 'Are you storing a value here, or asking whether two things are equal? How many equals signs does each need?',
    }),
  },
  {
    type: /^SyntaxError$/,
    make: (_m, e) => ({
      headline: `Python couldn't understand the code${at(e)}.`,
      question: 'What does Python expect to see right where it stopped reading? Look at the character just before the spot it points to.',
    }),
  },
  {
    type: /^(IndentationError|TabError)$/,
    make: (_m, e) => ({
      headline: `The indentation${at(e)} doesn't fit the code around it.`,
      question: 'Which lines belong inside the block above, and are they all indented by the same amount?',
    }),
  },
  // ───────── names ─────────
  {
    type: /^NameError$/,
    message: /name '(.+)' is not defined/,
    make: (m, e) => ({
      headline: `Python doesn't know the name ${code(m[1]!)}${at(e)}.`,
      question: `Where do you give ${code(m[1]!)} a value *before* this line, and is it spelled exactly the same both times?`,
    }),
  },
  {
    type: /^UnboundLocalError$/,
    message: /'(.+)'/,
    make: (m, e) => ({
      headline: `A function used ${code(m[1]!)}${at(e)} before giving it a value.`,
      question: `Is ${code(m[1]!)} assigned inside this function? What value should it have at the moment it is read?`,
    }),
  },
  // ───────── types ─────────
  {
    type: /^TypeError$/,
    message: /can only concatenate str \(not "(\w+)"\) to str/,
    make: (m, e) => ({
      headline: `Text and a ${m[1]} were joined with +${at(e)}.`,
      question: 'Which side of the + is text and which is not? What could turn one into the other?',
    }),
  },
  {
    type: /^TypeError$/,
    message: /unsupported operand type\(s\) for ([^:]+): '(\w+)' and '(\w+)'/,
    make: (m, e) => ({
      headline: `Python can't use ${code(m[1]!.trim())} between a ${m[2]} and a ${m[3]}${at(e)}.`,
      question: `What type is each side of the ${code(m[1]!.trim())}, and does Python know how to combine those two?`,
    }),
  },
  {
    type: /^TypeError$/,
    message: /'NoneType' object is not (subscriptable|iterable)/,
    make: (_m, e) => ({
      headline: `A value that is None was used as if it held something${at(e)}.`,
      question: 'Which line was supposed to give this value something other than None? Could a function be missing its return?',
    }),
  },
  {
    type: /^TypeError$/,
    message: /'(\w+)' object is not (subscriptable|iterable)/,
    make: (m, e) => ({
      headline: `A ${m[1]} can't be ${m[2] === 'iterable' ? 'looped over' : 'indexed with []'}${at(e)}.`,
      question: `What type is this value really, and does a ${m[1]} support that?`,
    }),
  },
  {
    type: /^TypeError$/,
    message: /'(\w+)' object is not callable/,
    make: (m, e) => ({
      headline: `Something that is a ${m[1]} was called like a function${at(e)}.`,
      question: 'Did you reuse the name of a function for a value somewhere earlier in the program?',
    }),
  },
  {
    type: /^TypeError$/,
    message: /(\w+)\(\) (?:takes|missing)[^]*?(\d+) (?:required )?positional argument/,
    make: (m, e) => ({
      headline: `${code(m[1]! + '()')} was called with the wrong number of values${at(e)}.`,
      question: `How many values does ${code(m[1]!)} list in its definition, and how many does this call pass?`,
    }),
  },
  {
    type: /^TypeError$/,
    message: /(list|string|tuple) indices must be integers|cannot be interpreted as an integer/,
    make: (_m, e) => ({
      headline: `A whole number was needed${at(e)}, but something else was given.`,
      question: 'What type is the value used as an index (or in `range`)? Which operator might have turned it into a decimal?',
    }),
  },
  // ───────── attributes, indexes, keys ─────────
  {
    type: /^AttributeError$/,
    message: /'NoneType' object has no attribute '(\w+)'/,
    make: (m, e) => ({
      headline: `${code('.' + m[1]!)} was used on a value that is None${at(e)}.`,
      question: 'Which line was meant to give this value something other than None? Is a function missing its return?',
    }),
  },
  {
    type: /^AttributeError$/,
    message: /'(\w+)' object has no attribute '(\w+)'/,
    make: (m, e) => ({
      headline: `A ${m[1]} has no ${code('.' + m[2]!)}${at(e)}.`,
      question: `What type is this value really? Which methods does a ${m[1]} offer, and is ${code(m[2]!)} spelled like one of them?`,
    }),
  },
  {
    type: /^IndexError$/,
    make: (_m, e) => ({
      headline: `An index${at(e)} was past the end.`,
      question: 'How many items are there, and what index are you asking for? What is the last index that exists?',
    }),
  },
  {
    type: /^KeyError$/,
    make: (_m, e) => ({
      headline: `A dictionary was asked for a key it doesn't have${at(e)}.`,
      question: 'Which keys does the dictionary really contain, and is the one you asked for among them, with the same spelling and capitals?',
    }),
  },
  // ───────── values ─────────
  {
    type: /^ValueError$/,
    message: /invalid literal for int\(\) with base 10: (.*)/,
    make: (m, e) => ({
      headline: `${code('int()')} was given ${m[1]}, which doesn't look like a whole number${at(e)}.`,
      question: 'What text did the program actually receive here? Does it contain only digits (no spaces, letters or decimal point)?',
    }),
  },
  {
    type: /^ValueError$/,
    message: /could not convert string to float: (.*)/,
    make: (m, e) => ({
      headline: `${code('float()')} was given ${m[1]}, which doesn't look like a number${at(e)}.`,
      question: 'What text did the program actually receive here? Is it really a number?',
    }),
  },
  {
    type: /^ValueError$/,
    message: /(not enough|too many) values to unpack/,
    make: (_m, e) => ({
      headline: `The number of names doesn't match the number of values${at(e)}.`,
      question: 'How many items are on the right of the =, and how many names are on the left?',
    }),
  },
  {
    type: /^ZeroDivisionError$/,
    make: (_m, e) => ({
      headline: `Something was divided by zero${at(e)}.`,
      question: 'What value does the divisor have at this moment, and which earlier line gave it that value?',
    }),
  },
  {
    type: /^RecursionError$/,
    make: () => ({
      headline: 'A function kept calling itself until Python gave up.',
      question: 'What stops the function from calling itself again? Does every call move closer to that stopping point?',
    }),
  },
  // ───────── environment ─────────
  {
    type: /^(ModuleNotFoundError|ImportError)$/,
    message: /No module named '([\w.]+)'/,
    make: (m) => ({
      headline: `Python can't find a module called ${code(m[1]!)}.`,
      question: `Is ${code(m[1]!)} spelled right? Is it part of Python itself, or a package you would need to install first (see the Packages menu)?`,
    }),
  },
  {
    type: /^ImportError$/,
    message: /cannot import name '(\w+)'/,
    make: (m) => ({
      headline: `The module doesn't contain a ${code(m[1]!)} to import.`,
      question: `Is ${code(m[1]!)} spelled exactly as in the module (capitals included), and does the module really define it?`,
    }),
  },
  {
    type: /^FileNotFoundError$/,
    make: () => ({
      headline: "Python couldn't find that file.",
      question: 'Which folder is Python looking in, and does a file with exactly this name exist there?',
    }),
  },
  {
    type: /^EOFError$/,
    make: (_m, e) => ({
      headline: `${code('input()')} was asked for an answer${at(e)}, but there was none left.`,
      question: 'How many times does your program call input(), and how many answers were provided?',
    }),
  },
  {
    type: /^AssertionError$/,
    make: (_m, e) => ({
      headline: `A check (assert)${at(e)} did not hold.`,
      question: 'What condition does the assert test, and what values do its parts have right now?',
    }),
  },
]

/**
 * Turn a Python error into plain English plus a guiding question. Returns `null` for a manual
 * stop, which needs no explanation. Deterministic and offline: the AI layer is never involved.
 */
export function translateError(error: PyError): Translation | null {
  if (error.type === 'KeyboardInterrupt') return null
  for (const rule of RULES) {
    if (!rule.type.test(error.type)) continue
    const m = rule.message ? error.message.match(rule.message) : ([''] as RegExpMatchArray)
    if (m) return rule.make(m, error)
  }
  return {
    headline: `Python stopped with a ${error.type}${at(error)}.`,
    question: 'Read the last line of the message: which part names a value or a type you recognise? Which line does it point to?',
  }
}
