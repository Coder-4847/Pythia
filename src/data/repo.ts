import { db } from '@/data/db'
import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  type Attempt,
  type Draft,
  type LessonProgress,
  type Profile,
  type QuizResult,
  type Settings,
  type Snippet,
  type Workspace,
} from '@/data/schema'
import { quizXp, summarizeLesson, xpForAttempt, type LessonShape, type LessonSummary } from '@/engine/progress'

const now = () => Date.now()
const uid = () => crypto.randomUUID()

// ───────────── profile & settings ─────────────
export async function getProfile(): Promise<Profile> {
  const existing = await db.profile.get('me')
  if (existing) return existing
  // updatedAt 0: an untouched default must never win a sync against a profile the learner actually edited.
  const profile: Profile = { ...DEFAULT_PROFILE, createdAt: now(), updatedAt: 0 }
  await db.profile.put(profile)
  return profile
}

export async function updateProfile(patch: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>) {
  const profile = await getProfile()
  await db.profile.put({ ...profile, ...patch, updatedAt: now() })
}

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('settings')) ?? { ...DEFAULT_SETTINGS, updatedAt: 0 }
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id' | 'updatedAt'>>) {
  await db.settings.put({ ...(await getSettings()), ...patch, updatedAt: now() })
}

// ───────────── lessons ─────────────
/** Open a lesson (or move within it): marks it in progress and remembers the step. */
export async function touchLesson(lessonId: string, step: number) {
  const existing = await db.lessonProgress.get(lessonId)
  const t = now()
  await db.lessonProgress.put({
    lessonId,
    status: existing?.status === 'completed' ? 'completed' : 'in_progress',
    percent: existing?.percent ?? 0,
    step,
    startedAt: existing?.startedAt ?? t,
    completedAt: existing?.completedAt,
    updatedAt: t,
  })
}

/** Re-derive a lesson's stored progress from its attempts and quiz result. */
export async function recomputeLessonProgress(lesson: LessonShape): Promise<{ summary: LessonSummary; justCompleted: boolean }> {
  const [attempts, quiz, existing] = await Promise.all([
    db.attempts.where('lessonId').equals(lesson.id).toArray(),
    db.quizResults.get(lesson.id),
    db.lessonProgress.get(lesson.id),
  ])
  const summary = summarizeLesson(lesson, attempts, quiz, Boolean(existing))
  const t = now()
  const justCompleted = summary.status === 'completed' && existing?.status !== 'completed'
  await db.lessonProgress.put({
    lessonId: lesson.id,
    status: summary.status,
    percent: summary.percent,
    step: existing?.step ?? 0,
    startedAt: existing?.startedAt ?? t,
    completedAt: summary.status === 'completed' ? (existing?.completedAt ?? t) : undefined,
    updatedAt: t,
  })
  return { summary, justCompleted }
}

// ───────────── exercises ─────────────
export const draftKey = (lessonId: string, exerciseId: string) => `${lessonId}/${exerciseId}`

export const getDraft = (lessonId: string, exerciseId: string) => db.drafts.get(draftKey(lessonId, exerciseId))

/** Auto-save work in progress (code and the hint rung reached). */
export async function saveDraft(lessonId: string, exerciseId: string, code: string, hintLevel: number) {
  const draft: Draft = { key: draftKey(lessonId, exerciseId), lessonId, exerciseId, code, hintLevel, updatedAt: now() }
  await db.drafts.put(draft)
}

export interface AttemptInput {
  lesson: LessonShape
  exerciseId: string
  code: string
  results: Attempt['results']
  hintsUsed: number
}

/** Record a test run. XP is awarded here, once, on the first pass. */
export async function recordAttempt(input: AttemptInput): Promise<{ attempt: Attempt; summary: LessonSummary; justCompleted: boolean }> {
  const passed = input.results.length > 0 && input.results.every((r) => r.passed)
  const previous = await db.attempts.where('[lessonId+exerciseId]').equals([input.lesson.id, input.exerciseId]).toArray()
  const attempt: Attempt = {
    id: uid(),
    lessonId: input.lesson.id,
    exerciseId: input.exerciseId,
    code: input.code,
    at: now(),
    passed,
    results: input.results,
    hintsUsed: input.hintsUsed,
    xpAwarded: xpForAttempt(previous, passed, input.hintsUsed),
    updatedAt: now(),
  }
  await db.attempts.put(attempt)
  const { summary, justCompleted } = await recomputeLessonProgress(input.lesson)
  return { attempt, summary, justCompleted }
}

// ───────────── quiz ─────────────
export async function saveQuiz(lesson: LessonShape, answers: number[], correct: number) {
  const previous = await db.quizResults.get(lesson.id)
  const t = now()
  const result: QuizResult = {
    lessonId: lesson.id,
    answers,
    correct,
    total: lesson.quizLength,
    // XP only improves: retaking a quiz never takes XP away or farms it.
    xpAwarded: Math.max(previous?.xpAwarded ?? 0, quizXp(correct)),
    completedAt: previous?.completedAt ?? t,
    updatedAt: t,
  }
  await db.quizResults.put(result)
  return recomputeLessonProgress(lesson)
}

// ───────────── playground & snippets ─────────────
export const getWorkspace = () => db.workspace.get('playground')

export const saveWorkspace = (files: Workspace['files'], activeName: string) =>
  db.workspace.put({ id: 'playground', files, activeName, updatedAt: now() })

export async function saveSnippet(title: string, code: string): Promise<Snippet> {
  const t = now()
  const snippet: Snippet = { id: uid(), title, code, createdAt: t, updatedAt: t }
  await db.snippets.put(snippet)
  return snippet
}

/** Soft-delete, so the deletion can sync to other devices. */
export async function deleteSnippet(id: string) {
  const snippet = await db.snippets.get(id)
  if (snippet) await db.snippets.put({ ...snippet, deletedAt: now(), updatedAt: now() })
}

// ───────────── whole-database ─────────────
export async function progressFor(lessonId: string): Promise<LessonProgress | undefined> {
  return db.lessonProgress.get(lessonId)
}
