import { z } from 'zod'
import type { Exercise, Lesson, QuizQuestion } from '@/content/types'
import type { TestSpec } from '@/workers/protocol'

/**
 * Lessons are authored as Markdown (see CONTENT_GUIDE.md) and parsed here at load time.
 * Tests live in a companion `.tests.ts` file because they are code, not prose.
 */

const frontMatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
  module: z.string().min(1),
  title: z.string().min(1),
  minutes: z.coerce.number().int().min(1).max(60),
  goal: z.string().min(1),
  summary: z.string().min(1),
})

export class LessonParseError extends Error {
  constructor(source: string, message: string) {
    super(`${source}: ${message}`)
    this.name = 'LessonParseError'
  }
}

interface Section {
  heading: string
  lines: string[]
}

/** Split into sections at lines starting with `<marker> `, ignoring markers inside code fences. */
function splitSections(lines: string[], marker: '#' | '##'): { preamble: string[]; sections: Section[] } {
  const preamble: string[] = []
  const sections: Section[] = []
  let inFence = false
  for (const line of lines) {
    if (line.startsWith('```')) inFence = !inFence
    const isHeading = !inFence && line.startsWith(`${marker} `)
    if (isHeading) sections.push({ heading: line.slice(marker.length + 1).trim(), lines: [] })
    else (sections[sections.length - 1]?.lines ?? preamble).push(line)
  }
  return { preamble, sections }
}

const trimBlank = (lines: string[]) => lines.join('\n').trim()

/** Pull ```python <tag> fences out of a block; returns the tagged code and the remaining prose. */
function extractTagged(lines: string[], tags: string[]): { found: Record<string, string>; rest: string[] } {
  const found: Record<string, string> = {}
  const rest: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const open = /^```(?:python|py)\s+(\S+)\s*$/.exec(line)
    if (open && tags.includes(open[1]!)) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i]!.startsWith('```')) body.push(lines[i++]!)
      found[open[1]!] = body.join('\n').replace(/\s+$/, '') + '\n'
    } else {
      rest.push(line)
    }
  }
  return { found, rest }
}

/** Numbered list items, with indented continuation lines folded into the item. */
function numberedItems(lines: string[]): string[] {
  const items: string[] = []
  for (const line of lines) {
    const m = /^\d+\.\s+(.*)$/.exec(line)
    if (m) items.push(m[1]!)
    else if (line.trim() && items.length) items[items.length - 1] += ` ${line.trim()}`
  }
  return items
}

function parseExercise(source: string, heading: string, lines: string[], tests: TestSpec[] | undefined): Exercise {
  const m = /^(.*?)\s*\{#([a-z0-9]+)\}$/.exec(heading)
  if (!m) throw new LessonParseError(source, `Exercise heading "${heading}" needs an id, like "# Exercise: Title {#e1}"`)
  const [, title, id] = m as unknown as [string, string, string]
  const where = `exercise ${id}`

  const { preamble, sections } = splitSections(lines, '##')
  const { found, rest } = extractTagged(preamble, ['starter', 'solution'])
  if (found.starter === undefined) throw new LessonParseError(source, `${where} is missing a \`\`\`python starter block`)
  if (found.solution === undefined) throw new LessonParseError(source, `${where} is missing a \`\`\`python solution block`)

  const hintsSection = sections.find((s) => s.heading.toLowerCase() === 'hints')
  const explanation = sections.find((s) => s.heading.toLowerCase() === 'explanation')
  const hints = hintsSection ? numberedItems(hintsSection.lines) : []
  if (hints.length !== 3) throw new LessonParseError(source, `${where} needs exactly 3 numbered hints (nudge, question, concrete hint); found ${hints.length}`)
  if (!explanation) throw new LessonParseError(source, `${where} is missing a "## Explanation" section`)
  if (!tests?.length) throw new LessonParseError(source, `${where} has no tests in its .tests.ts file`)

  return {
    id,
    title,
    prompt: trimBlank(rest),
    starter: found.starter,
    solution: found.solution,
    tests,
    hints: hints as Exercise['hints'],
    explanation: trimBlank(explanation.lines),
  }
}

function parseQuiz(source: string, lines: string[]): QuizQuestion[] {
  const { sections } = splitSections(lines, '##')
  return sections.map((section, index) => {
    const id = `q${index + 1}`
    const options: string[] = []
    let answer = -1
    const explanation: string[] = []
    for (const line of section.lines) {
      const option = /^- \[( |x)\]\s+(.*)$/.exec(line)
      if (option) {
        if (option[1] === 'x') {
          if (answer !== -1) throw new LessonParseError(source, `quiz ${id} has more than one correct option`)
          answer = options.length
        }
        options.push(option[2]!)
      } else if (/^Explanation:/.test(line)) explanation.push(line.replace(/^Explanation:\s*/, ''))
      else if (explanation.length && line.trim()) explanation.push(line.trim())
    }
    if (options.length < 2) throw new LessonParseError(source, `quiz ${id} needs at least 2 options`)
    if (answer === -1) throw new LessonParseError(source, `quiz ${id} has no correct option (mark one "- [x]")`)
    if (!explanation.length) throw new LessonParseError(source, `quiz ${id} needs an "Explanation:" line`)
    return { id, question: section.heading, options, answer, explanation: explanation.join(' ') }
  })
}

/**
 * Parse one lesson. `tests` maps exercise id → tests (from the companion file).
 * `source` is only used to label error messages.
 */
export function parseLesson(markdown: string, tests: Record<string, TestSpec[]>, source: string): Lesson {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  if (lines[0]?.trim() !== '---') throw new LessonParseError(source, 'must start with a --- front matter block')
  const end = lines.indexOf('---', 1)
  if (end === -1) throw new LessonParseError(source, 'front matter is never closed with ---')
  const raw: Record<string, string> = {}
  for (const line of lines.slice(1, end)) {
    const m = /^(\w+):\s*(.*)$/.exec(line)
    if (m) raw[m[1]!] = m[2]!.trim()
  }
  const meta = frontMatterSchema.safeParse(raw)
  if (!meta.success) throw new LessonParseError(source, `front matter: ${meta.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)

  const { sections } = splitSections(lines.slice(end + 1), '#')
  const concept = sections.find((s) => s.heading.toLowerCase() === 'concept')
  const example = sections.find((s) => s.heading.toLowerCase().startsWith('example'))
  const quiz = sections.find((s) => s.heading.toLowerCase() === 'quiz')
  if (!concept) throw new LessonParseError(source, 'missing "# Concept" section')
  if (!example) throw new LessonParseError(source, 'missing "# Example: …" section')
  if (!quiz) throw new LessonParseError(source, 'missing "# Quiz" section')

  const exampleParts = extractTagged(example.lines, ['example'])
  if (exampleParts.found.example === undefined) throw new LessonParseError(source, 'the example section needs a ```python example block')

  const exercises = sections
    .filter((s) => s.heading.toLowerCase().startsWith('exercise'))
    .map((s) => parseExercise(source, s.heading.replace(/^exercise:?\s*/i, ''), s.lines, tests[/\{#([a-z0-9]+)\}/.exec(s.heading)?.[1] ?? '']))

  return {
    ...meta.data,
    concept: trimBlank(concept.lines),
    example: {
      title: example.heading.replace(/^example:?\s*/i, '') || 'Worked example',
      explanation: trimBlank(exampleParts.rest),
      code: exampleParts.found.example,
    },
    exercises,
    quiz: parseQuiz(source, quiz.lines),
  }
}
