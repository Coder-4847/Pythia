import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/data/db'
import { applyImport, buildExport, parseExport, previewImport, resetAllData, type ExportFile } from '@/data/exportImport'
import { getDraft, getProfile, getSettings, recordAttempt, saveDraft, saveQuiz, saveSnippet, touchLesson, updateSettings, deleteSnippet } from '@/data/repo'
import { SCHEMA_VERSION } from '@/data/schema'
import type { LessonShape } from '@/engine/progress'
import { hydrateStores } from '@/data/syncStores'
import { useTheme } from '@/stores/theme'

const lesson: LessonShape = { id: 'L1', exerciseIds: ['e1', 'e2'], quizLength: 2 }
const pass = [{ name: 't', hidden: false, passed: true }]
const fail = [{ name: 't', hidden: false, passed: false }]

beforeEach(async () => {
  await resetAllData()
})

describe('repo', () => {
  it('awards XP only on the first pass of an exercise', async () => {
    const miss = await recordAttempt({ lesson, exerciseId: 'e1', code: 'a', results: fail, hintsUsed: 0 })
    expect(miss.attempt).toMatchObject({ passed: false, xpAwarded: 0 })
    const first = await recordAttempt({ lesson, exerciseId: 'e1', code: 'b', results: pass, hintsUsed: 2 })
    expect(first.attempt.xpAwarded).toBe(16)
    const again = await recordAttempt({ lesson, exerciseId: 'e1', code: 'c', results: pass, hintsUsed: 0 })
    expect(again.attempt.xpAwarded).toBe(0)
  })

  it('treats an empty result list as not passed', async () => {
    expect((await recordAttempt({ lesson, exerciseId: 'e1', code: '', results: [], hintsUsed: 0 })).attempt.passed).toBe(false)
  })

  it('moves a lesson from in progress to completed, reporting completion exactly once', async () => {
    await touchLesson('L1', 0)
    expect((await db.lessonProgress.get('L1'))?.status).toBe('in_progress')

    const a = await recordAttempt({ lesson, exerciseId: 'e1', code: '', results: pass, hintsUsed: 0 })
    expect(a.summary.percent).toBe(33)
    await recordAttempt({ lesson, exerciseId: 'e2', code: '', results: pass, hintsUsed: 0 })
    const done = await saveQuiz(lesson, [0, 1], 2)
    expect(done.justCompleted).toBe(true)
    expect(await db.lessonProgress.get('L1')).toMatchObject({ status: 'completed', percent: 100 })
    expect((await db.lessonProgress.get('L1'))?.completedAt).toBeTypeOf('number')

    expect((await saveQuiz(lesson, [0, 1], 2)).justCompleted).toBe(false)
  })

  it('keeps the best quiz XP when the quiz is retaken', async () => {
    await saveQuiz(lesson, [0, 0], 2)
    await saveQuiz(lesson, [1, 1], 0)
    expect((await db.quizResults.get('L1'))?.xpAwarded).toBe(10)
  })

  it('round-trips drafts and updates settings without losing other fields', async () => {
    await saveDraft('L1', 'e1', 'print(1)', 2)
    expect(await getDraft('L1', 'e1')).toMatchObject({ code: 'print(1)', hintLevel: 2 })
    await updateSettings({ editorFontSize: 18 })
    expect(await getSettings()).toMatchObject({ editorFontSize: 18, theme: 'dark', pythiaIntensity: 'balanced' })
  })

  it('soft-deletes snippets so the deletion can sync', async () => {
    const s = await saveSnippet('mine', 'x = 1')
    await deleteSnippet(s.id)
    expect((await db.snippets.get(s.id))?.deletedAt).toBeTypeOf('number')
  })
})

async function seed() {
  await getProfile()
  await updateSettings({ editorFontSize: 16 })
  await touchLesson('L1', 1)
  await recordAttempt({ lesson, exerciseId: 'e1', code: 'print("hi")', results: pass, hintsUsed: 1 })
  await saveDraft('L1', 'e2', 'wip', 0)
  await saveSnippet('snip', 'y = 2')
  await db.workspace.put({ id: 'playground', files: [{ name: 'main.py', code: 'z = 3' }], activeName: 'main.py', updatedAt: 5 })
}

describe('export / import', () => {
  it('round-trips everything through a JSON file', async () => {
    await seed()
    const exported = await buildExport('0.1.0')
    expect(exported).toMatchObject({ format: 'pythia-export', version: SCHEMA_VERSION })

    const parsed = parseExport(JSON.stringify(exported))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    await resetAllData()
    expect(await db.attempts.count()).toBe(0)
    await applyImport(parsed.file, 'replace')

    const again = await buildExport('0.1.0')
    expect({ ...again, exportedAt: 0 }).toEqual({ ...exported, exportedAt: 0 })
  })

  it('merges last-write-wins per item and never loses newer local work', async () => {
    await seed()
    const file = structuredClone(await buildExport('0.1.0')) as ExportFile
    // The file has an older settings row, a newer progress row, and a brand-new snippet.
    file.data.settings!.updatedAt -= 1000
    file.data.settings!.editorFontSize = 22
    file.data.lessonProgress[0]!.updatedAt += 1000
    file.data.lessonProgress[0]!.step = 3
    file.data.snippets.push({ id: 'new', title: 'from file', code: 'q', createdAt: 1, updatedAt: 1 })

    await applyImport(file, 'merge')
    expect((await getSettings()).editorFontSize).toBe(16) // local was newer
    expect((await db.lessonProgress.get('L1'))?.step).toBe(3) // file was newer
    expect(await db.snippets.count()).toBe(2)
    expect(await db.attempts.count()).toBe(1) // untouched
  })

  it('replace mode removes local rows the file does not have', async () => {
    await seed()
    const file = await buildExport('0.1.0')
    await saveSnippet('local only', 'k')
    await applyImport(file, 'replace')
    expect(await db.snippets.count()).toBe(1)
  })

  it('previews what an import would change before touching anything', async () => {
    await seed()
    const file = structuredClone(await buildExport('0.1.0')) as ExportFile
    file.data.snippets.push({ id: 'new', title: 'n', code: '', createdAt: 1, updatedAt: 1 })
    file.data.settings!.updatedAt += 10
    await saveSnippet('local only', 'k')

    const merge = Object.fromEntries((await previewImport(file, 'merge')).map((p) => [p.table, p]))
    expect(merge.snippets).toMatchObject({ incoming: 2, added: 1, unchanged: 1, removed: 0 })
    expect(merge.settings).toMatchObject({ updated: 1 })
    expect(merge.attempts).toMatchObject({ unchanged: 1 })

    const replace = Object.fromEntries((await previewImport(file, 'replace')).map((p) => [p.table, p]))
    expect(replace.snippets).toMatchObject({ added: 1, removed: 1 })
    expect(await db.snippets.count()).toBe(2) // preview changed nothing
  })

  it('rejects bad files with readable messages', () => {
    const errors = (text: string) => {
      const r = parseExport(text)
      return r.ok ? [] : r.errors.join(' | ')
    }
    expect(errors('not json')).toContain('not valid JSON')
    expect(errors('{"format":"something-else"}')).toContain('not exported from Pythia')
    expect(errors(JSON.stringify({ format: 'pythia-export', version: SCHEMA_VERSION + 1 }))).toContain('newer version')
    expect(errors(JSON.stringify({ format: 'pythia-export', version: 'x' }))).toContain('valid "version"')
    expect(errors(JSON.stringify({ format: 'pythia-export', version: 1, exportedAt: 1, appVersion: '1', data: { attempts: 'oops' } }))).toContain('data.')
    expect(errors('x'.repeat(30_000_001))).toContain('too large')
  })

  it('rejects out-of-range values inside otherwise valid files', async () => {
    await seed()
    const file = structuredClone(await buildExport('0.1.0')) as ExportFile
    file.data.attempts[0]!.hintsUsed = 9
    const r = parseExport(JSON.stringify(file))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors[0]).toContain('data.attempts.0.hintsUsed')
  })

  it('reset removes everything', async () => {
    await seed()
    await resetAllData()
    const counts = await Promise.all([db.attempts.count(), db.snippets.count(), db.profile.count(), db.workspace.count()])
    expect(counts).toEqual([0, 0, 0, 0])
  })
})

describe('loading saved state', () => {
  it('applies the saved theme, but never undoes one the learner just picked', async () => {
    await updateSettings({ theme: 'light' })
    useTheme.setState({ theme: 'dark', chosen: false })
    await hydrateStores()
    expect(useTheme.getState().theme).toBe('light')

    await updateSettings({ theme: 'dark' })
    useTheme.getState().setTheme('light') // the learner clicked the toggle before loading finished
    await hydrateStores()
    expect(useTheme.getState().theme).toBe('light')
    expect((await getSettings()).theme).toBe('light')
  })
})
