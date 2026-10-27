// @vitest-environment node
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide } from 'pyodide'
import { LESSONS, getLesson, neighbours } from '@/content'
import { MODULES } from '@/content/modules'
import { TRACKS } from '@/content/tracks'
import { parseDiagram } from '@/features/lessons/diagram'
import { createEngine, type Engine } from '@/workers/engine'

/**
 * Quality gate for all curriculum content. Every reference solution is run through the same
 * test runner learners use, in real Pyodide, so content can't ship with a broken exercise.
 */
let engine: Engine

/** Lessons whose code needs packages the Node test environment can't download. */
const needsPackages = (code: string) => /\b(numpy|pandas|matplotlib|sklearn|scipy)\b/.test(code)

beforeAll(async () => {
  const indexURL = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/'
  engine = await createEngine(await loadPyodide({ indexURL }), {
    stdout: () => {},
    stderr: () => {},
    image: () => {},
    status: () => {},
    readLine: () => null,
    wasCancelled: () => false,
  })
}, 60_000)

describe('catalog', () => {
  it('has unique lesson ids and valid module/track references', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length)
    for (const l of LESSONS) {
      expect(MODULES.some((m) => m.id === l.module), `${l.id} module`).toBe(true)
      expect(TRACKS.some((t) => t.id === l.track), `${l.id} track`).toBe(true)
    }
  })

  it('links lessons in order', () => {
    const [first, second] = LESSONS
    expect(neighbours(first!.id).prev).toBeNull()
    expect(neighbours(first!.id).next?.id).toBe(second!.id)
    expect(getLesson('nope')).toBeUndefined()
  })
})

describe.each(LESSONS)('lesson $id', (lesson) => {
  it('meets the structural rules', () => {
    expect(lesson.exercises.length, 'exercises').toBeGreaterThanOrEqual(2)
    expect(lesson.exercises.length, 'exercises').toBeLessThanOrEqual(5)
    expect(lesson.quiz.length, 'quiz questions').toBeGreaterThanOrEqual(2)
    expect(lesson.quiz.length, 'quiz questions').toBeLessThanOrEqual(4)
    expect(new Set(lesson.exercises.map((e) => e.id)).size).toBe(lesson.exercises.length)
    for (const q of lesson.quiz) expect(q.answer).toBeLessThan(q.options.length)
    for (const e of lesson.exercises) {
      expect(e.tests.some((t) => !t.hidden), `${e.id} visible tests`).toBe(true)
      expect(e.tests.some((t) => t.hidden), `${e.id} hidden tests`).toBe(true)
      expect(new Set(e.tests.map((t) => t.name)).size, `${e.id} unique test names`).toBe(e.tests.length)
      expect(e.starter.trim().length, `${e.id} starter`).toBeGreaterThan(0)
    }
  })

  it('has valid diagrams', () => {
    for (const [, json] of lesson.concept.matchAll(/```diagram\n([\s\S]*?)```/g)) expect(parseDiagram(json!), 'diagram JSON').not.toBeNull()
  })

  it('has hints that do not leak the full solution', () => {
    for (const e of lesson.exercises) {
      const solutionLines = e.solution.split('\n').map((l) => l.trim()).filter((l) => l.length > 12)
      for (const hint of e.hints.slice(0, 2)) for (const line of solutionLines) expect(hint, `${e.id} nudge/question leaks "${line}"`).not.toContain(line)
    }
  })

  for (const exercise of lesson.exercises) {
    it(`exercise ${exercise.id}: the reference solution passes every test`, async () => {
      if (needsPackages(exercise.solution) || exercise.tests.some((t) => t.kind === 'check' && needsPackages(t.code))) return
      const report = await engine.runTests([{ name: 'main.py', code: exercise.solution }], 'main.py', exercise.tests)
      expect(report.error).toBeNull()
      const failures = report.results.filter((r) => !r.passed).map((r) => `${r.name}: ${r.message}`)
      expect(failures).toEqual([])
    })

    it(`exercise ${exercise.id}: the starter code is not already a solution`, async () => {
      if (needsPackages(exercise.starter)) return
      const report = await engine.runTests([{ name: 'main.py', code: exercise.starter }], 'main.py', exercise.tests)
      const passedAll = !report.error && report.results.length > 0 && report.results.every((r) => r.passed)
      expect(passedAll, 'starter must fail at least one test').toBe(false)
    })
  }
})
