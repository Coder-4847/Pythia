import { describe, expect, it } from 'vitest'
import { call } from '@/content/helpers'
import { LessonParseError, parseLesson } from '@/content/parseLesson'
import type { TestSpec } from '@/workers/protocol'

const FM = '---\nid: demo\nmodule: m\ntitle: Demo\nminutes: 5\ngoal: Do a thing\nsummary: A demo\n---\n'

const GOOD = `${FM}
# Concept

### Heading level three

Some text with \`code\`.

\`\`\`python run
# a python comment that must not become a heading
print("hi")
\`\`\`

# Example: Adding

We add two numbers.

\`\`\`python example
print(1 + 2)
\`\`\`

# Exercise: Add {#e1}

Write add.

\`\`\`python starter
# TODO
def add(a, b):
    pass
\`\`\`

\`\`\`python solution
def add(a, b):
    return a + b
\`\`\`

## Hints

1. Nudge here.
2. A pointed
   question across lines?
3. Concrete hint.

## Explanation

Because plus.

# Quiz

## What is \`1 + 1\`?

- [ ] 1
- [x] 2
- [ ] 3

Explanation: Basic arithmetic.
`

const tests: Record<string, TestSpec[]> = { e1: [call('add', [1, 2], 3)] }

describe('parseLesson', () => {
  it('parses every section of a well-formed lesson', () => {
    const l = parseLesson(GOOD, tests, 'demo.md')
    expect(l).toMatchObject({ id: 'demo', module: 'm', title: 'Demo', minutes: 5 })
    expect(l.concept).toContain('# a python comment that must not become a heading')
    expect(l.example).toMatchObject({ title: 'Adding', code: 'print(1 + 2)\n' })
    expect(l.example.explanation).toBe('We add two numbers.')

    const e = l.exercises[0]!
    expect(e).toMatchObject({ id: 'e1', title: 'Add', prompt: 'Write add.' })
    expect(e.starter).toContain('# TODO')
    expect(e.solution).toBe('def add(a, b):\n    return a + b\n')
    expect(e.hints[1]).toBe('A pointed question across lines?')
    expect(e.explanation).toBe('Because plus.')
    expect(e.tests).toHaveLength(1)

    expect(l.quiz[0]).toMatchObject({ id: 'q1', question: 'What is `1 + 1`?', options: ['1', '2', '3'], answer: 1, explanation: 'Basic arithmetic.' })
  })

  const fails = (md: string, message: string, t = tests) => {
    expect(() => parseLesson(md, t, 'demo.md')).toThrow(LessonParseError)
    expect(() => parseLesson(md, t, 'demo.md')).toThrow(message)
  }

  it('reports clear errors for authoring mistakes', () => {
    fails('# Concept', 'front matter')
    fails(GOOD.replace('minutes: 5', 'minutes: lots'), 'minutes')
    fails(GOOD.replace('id: demo', 'id: Not Kebab'), 'kebab-case')
    fails(GOOD.replace('# Concept', '# Notes'), 'missing "# Concept"')
    fails(GOOD.replace('```python example', '```python'), 'python example')
    fails(GOOD.replace(' {#e1}', ''), 'needs an id')
    fails(GOOD.replace('python starter', 'python'), 'missing a ```python starter')
    fails(GOOD.replace('3. Concrete hint.\n', ''), 'exactly 3 numbered hints')
    fails(GOOD, 'no tests', {})
    fails(GOOD.replace('- [x] 2', '- [ ] 2'), 'no correct option')
    fails(GOOD.replace('- [ ] 3', '- [x] 3'), 'more than one correct')
    fails(GOOD.replace('Explanation: Basic arithmetic.', ''), 'needs an "Explanation:"')
  })

  it('accepts Windows line endings', () => {
    expect(parseLesson(GOOD.replace(/\n/g, '\r\n'), tests, 'demo.md').id).toBe('demo')
  })
})
