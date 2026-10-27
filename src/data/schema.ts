import { z } from 'zod'

/**
 * Every record the app persists, as zod schemas. They are the single source of truth for the
 * IndexedDB tables, the export file format, the import validation and the Supabase sync payloads.
 * Every record carries `updatedAt` (ms since epoch): sync and merge are last-write-wins per item.
 */

/** Bump when a stored shape changes, and add a migration in `exportImport.ts`. */
export const SCHEMA_VERSION = 1

const ts = z.number().int().nonnegative()
const code = z.string().max(200_000)
const id = z.string().min(1).max(200)

export const profileSchema = z.object({
  id: z.literal('me'),
  displayName: z.string().max(60),
  createdAt: ts,
  /** XP the learner aims to earn each day. */
  dailyGoalXp: z.number().int().min(5).max(500),
  updatedAt: ts,
})

export const settingsSchema = z.object({
  id: z.literal('settings'),
  theme: z.enum(['dark', 'light']),
  editorFontSize: z.number().int().min(10).max(28),
  keybindings: z.enum(['default', 'vim']),
  pythiaIntensity: z.enum(['quiet', 'balanced', 'chatty']),
  aiEnabled: z.boolean(),
  reducedMotion: z.enum(['system', 'on', 'off']),
  updatedAt: ts,
})

export const lessonProgressSchema = z.object({
  lessonId: id,
  status: z.enum(['not_started', 'in_progress', 'completed']),
  percent: z.number().min(0).max(100),
  /** Index of the lesson step the learner was on (0 = concept). */
  step: z.number().int().min(0).max(40),
  startedAt: ts,
  completedAt: ts.optional(),
  updatedAt: ts,
})

export const testOutcomeSchema = z.object({ name: z.string().max(300), hidden: z.boolean(), passed: z.boolean() })

export const attemptSchema = z.object({
  id,
  lessonId: id,
  exerciseId: id,
  code,
  at: ts,
  passed: z.boolean(),
  results: z.array(testOutcomeSchema).max(100),
  /** Highest rung of the hint ladder used: 0 none, 1 nudge, 2 question, 3 concrete hint, 4 full explanation. */
  hintsUsed: z.number().int().min(0).max(4),
  xpAwarded: z.number().int().min(0).max(1000),
  updatedAt: ts,
})

/** Auto-saved work in progress for one exercise. */
export const draftSchema = z.object({
  key: id,
  lessonId: id,
  exerciseId: id,
  code,
  hintLevel: z.number().int().min(0).max(4),
  updatedAt: ts,
})

export const quizResultSchema = z.object({
  lessonId: id,
  answers: z.array(z.number().int().min(0).max(20)).max(20),
  correct: z.number().int().min(0).max(20),
  total: z.number().int().min(1).max(20),
  xpAwarded: z.number().int().min(0).max(1000),
  completedAt: ts,
  updatedAt: ts,
})

export const snippetSchema = z.object({
  id,
  title: z.string().min(1).max(100),
  code,
  createdAt: ts,
  updatedAt: ts,
  /** Tombstone, so a deletion can sync to other devices. */
  deletedAt: ts.optional(),
})

export const workspaceSchema = z.object({
  id: z.literal('playground'),
  files: z.array(z.object({ name: z.string().max(100), code })).min(1).max(20),
  activeName: z.string().max(100),
  updatedAt: ts,
})

export const achievementSchema = z.object({ id, unlockedAt: ts, updatedAt: ts })

export type Profile = z.infer<typeof profileSchema>
export type Settings = z.infer<typeof settingsSchema>
export type LessonProgress = z.infer<typeof lessonProgressSchema>
export type Attempt = z.infer<typeof attemptSchema>
export type Draft = z.infer<typeof draftSchema>
export type QuizResult = z.infer<typeof quizResultSchema>
export type Snippet = z.infer<typeof snippetSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type Achievement = z.infer<typeof achievementSchema>

export const DEFAULT_SETTINGS: Omit<Settings, 'updatedAt'> = {
  id: 'settings',
  theme: 'dark',
  editorFontSize: 14,
  keybindings: 'default',
  pythiaIntensity: 'balanced',
  aiEnabled: true,
  reducedMotion: 'system',
}

export const DEFAULT_PROFILE: Omit<Profile, 'createdAt' | 'updatedAt'> = { id: 'me', displayName: 'Learner', dailyGoalXp: 40 }
