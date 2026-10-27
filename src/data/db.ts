import Dexie, { type Table } from 'dexie'
import type { Achievement, Attempt, Draft, LessonProgress, Profile, QuizResult, Settings, Snippet, Workspace } from '@/data/schema'

export interface OutboxEntry {
  /** `${table}:${key}`, so repeated changes to one record coalesce into one entry. */
  id: string
  table: string
  key: string
  /** When the latest change happened (ms). A deletion is sent with this as its timestamp. */
  at: number
}
export interface MetaEntry {
  key: string
  value: unknown
}

/**
 * IndexedDB, via Dexie. This is the source of truth; Supabase (when configured) is a mirror.
 * Add a new `db.version(n)` block for every schema change, never edit an old one.
 */
export class PythiaDB extends Dexie {
  profile!: Table<Profile, string>
  settings!: Table<Settings, string>
  lessonProgress!: Table<LessonProgress, string>
  attempts!: Table<Attempt, string>
  drafts!: Table<Draft, string>
  quizResults!: Table<QuizResult, string>
  snippets!: Table<Snippet, string>
  workspace!: Table<Workspace, string>
  achievements!: Table<Achievement, string>
  /** Local changes not yet sent to the cloud: one row per changed record (see src/sync). */
  outbox!: Table<OutboxEntry, string>
  /** Small key/value bookkeeping for sync (paired account, pull cursor). Never exported. */
  meta!: Table<MetaEntry, string>

  constructor(name = 'pythia') {
    super(name)
    this.version(1).stores({
      profile: 'id',
      settings: 'id',
      lessonProgress: 'lessonId, status, updatedAt',
      attempts: 'id, lessonId, exerciseId, at, [lessonId+exerciseId]',
      drafts: 'key, lessonId',
      quizResults: 'lessonId',
      snippets: 'id, updatedAt',
      workspace: 'id',
      achievements: 'id',
    })
    this.version(2).stores({
      outbox: 'id, at',
      meta: 'key',
    })
  }
}

export const db = new PythiaDB()

/** Every table of learner data, in a stable order (used by export/import/reset and sync). `outbox` and `meta` are bookkeeping, not data. */
export const TABLE_NAMES = [
  'profile',
  'settings',
  'lessonProgress',
  'attempts',
  'drafts',
  'quizResults',
  'snippets',
  'workspace',
  'achievements',
] as const
export type TableName = (typeof TABLE_NAMES)[number]
