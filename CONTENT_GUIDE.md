# Content guide: writing lessons

Lessons are Markdown. Tests are TypeScript. Adding a lesson never needs a UI change.

```
src/content/tracks/<track-folder>/
  03-strings.md          ← the lesson (prose, code, hints, quiz)
  03-strings.tests.ts    ← its tests (default export: exercise id → tests)
```

Files are ordered by name inside a track, so number them (`01-`, `02-`, …). Lessons are grouped
by their `module:` for display; a module's order comes from `src/content/modules.ts`.

Run `npm test` after every change. The content test suite is the quality gate (see the end).

## 1. The lesson file

````markdown
---
id: strings-basics          # kebab-case, globally unique, PERMANENT (progress is keyed by it)
module: fnd-start           # an id from src/content/modules.ts
title: Working with text
minutes: 10
goal: Slice, join and measure strings.   # one sentence; Pythia uses it as context
summary: Everything you can do with a piece of text.   # shown on cards
---

# Concept
…markdown…

# Example: A title for the example
…walkthrough markdown…
```python example
print("code the learner can run and edit")
```

# Exercise: Reverse a word {#e1}
Task description in markdown.

```python starter
def reverse(word):
    pass
```

```python solution
def reverse(word):
    return word[::-1]
```

## Hints
1. A nudge: points in a direction without naming the technique.
2. A pointed question that makes the learner think.
3. A concrete hint: names the technique, still not the full answer.

## Explanation
Shown only when the learner clicks "I'm stuck". Explain *why* the solution works.

# Quiz

## Question text, inline `code` allowed

- [ ] A wrong option
- [x] The right option
- [ ] Another wrong option

Explanation: Why the right option is right (and the others are not).
````

Rules the parser enforces (it fails the build with a message naming the file):

- Front matter has all six fields. `id` is kebab-case.
- Sections are `# Concept`, `# Example: …`, one or more `# Exercise: Title {#id}`, and `# Quiz`.
  Use `##` only for `## Hints`, `## Explanation` and quiz questions. Inside prose, use `###`/`####`.
- Each exercise has a `python starter`, a `python solution`, **exactly three** numbered hints, an
  explanation, and tests. The exercise `{#id}` (`e1`, `e2`, …) is stored with the learner's attempts:
  **never rename or renumber an id once published**; add new exercises at the end.
- Each quiz question has 2+ options, exactly one `[x]`, and an `Explanation:` line.
- Aim for **2 to 5 exercises** and **2 to 4 quiz questions** per lesson.

## 2. Markdown features

| You write | You get |
|---|---|
| `` `code` ``, `**bold**`, `*italic*`, `[text](https://…)` | inline formatting (links must be http(s) or in-app paths) |
| `> Note…` | a callout |
| ` ```python run ` | an **editable, runnable** snippet with its own output |
| ` ```python ` | a static highlighted code block |
| ` ```diagram ` + JSON | an animated diagram (below) |

Content is rendered as React elements, never HTML, so raw HTML in a lesson is shown as text.

### Diagrams

JSON inside a ` ```diagram ` fence, validated at test time:

```json
{"type":"boxes","caption":"Variables in memory","items":[{"name":"age","value":"14"}]}
{"type":"strip","caption":"A list and its indexes","cells":["'a'","'b'","'c'"],"highlight":[1],"negative":true}
{"type":"flow","caption":"What a loop does","steps":[{"label":"i = 0"},{"label":"i = 1"},{"label":"stop","detail":"i is 2"}]}
```

## 3. Tests (`*.tests.ts`)

```ts
import { call, check, output, variable, tuple, setOf } from '@/content/helpers'

export default {
  e1: [
    call('reverse', ['abc'], 'cba'),                           // visible
    call('reverse', [''], '', { hidden: true, hint: 'What about an empty word?' }),
  ],
}
```

| Helper | Meaning |
|---|---|
| `call(fn, args, expected, opts?)` | call `fn(*args)` and compare the return value |
| `output(stdin, expected, opts?)` | run the whole program with `stdin` lines for `input()` and compare everything it prints |
| `variable(name, expected, opts?)` | after the program runs, `name` must equal `expected` |
| `check(name, pythonCode, opts?)` | free-form Python. Sees `ns` (the learner's globals), `out` (printed text), `src` (their source), `fail(msg)`, `equal(a, b)`. A failed `assert "message"` is shown to the learner |

`opts`: `hidden`, `hint` (shown on failure; for hidden tests it is the *only* thing shown), `stdin`, `name`.
Use `tuple(1, 2)` and `setOf(1, 2)` for expected values JSON can't express.

How tests run: for **each** test the learner's program is executed from scratch (so tests cannot
affect each other), then the check is applied. Comparison tolerates float rounding and does not let
`True` pass for `1`. Failure messages are generated for you: "`add(2, 3)` should return 5, but it
returned 6. It returned `None`. Is there a `return` statement on every path?"

Guidelines:

- Every exercise needs **at least one visible and one hidden test**. Hidden tests guard against
  hard-coding (other inputs, edge cases, "did you use a loop?"). Visible tests teach by example.
- Test names must be unique within an exercise.
- Prefer testing behaviour. Use `src` checks sparingly, to enforce a *learning goal* ("use a loop"),
  never style.
- Hints must not contain a solution line. The nudge and question especially.

## 4. Writing well (Pythia's house style)

- **Questions over answers.** Hints 1 and 2 should be questions or nudges. Never state the fix.
- **One idea per lesson**, 8–15 minutes. Run something in the first screen.
- Show the failure first. A snippet that errors, then the question "what do you expect here?", teaches more than a rule.
- Be friendly and specific. No "simply" or "obviously".
- Every exercise should be solvable from this lesson plus earlier ones only.

## 5. Quality gate

`src/content/content.test.ts` runs for **every** lesson:

- structure (counts, unique ids, visible + hidden tests, valid diagrams),
- hints 1 and 2 don't leak a solution line,
- the **reference solution passes every test** in real Pyodide,
- the **starter code fails** at least one test (an exercise can't be solved by doing nothing).

Lessons that import NumPy/pandas/matplotlib/scikit-learn can't be executed by the Node test
environment (those wheels come from the Pyodide CDN), so their solutions are checked separately
(see STATUS.md); the structural checks still run.

## 6. Adding things

- **A module**: add it to `src/content/modules.ts`; lessons join via `module:`. Empty modules are hidden.
- **A track**: add it to `src/content/tracks.ts`. Tracks with no lessons show as "On the roadmap".
- **A snippet for the playground**: `src/content/snippets.ts`.
