import Dexie, { type DexieOptions, type Table } from 'dexie'
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

  constructor(name = 'pythia', options?: DexieOptions) {
    super(name, options)
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

/**
 * Can this browser open an IndexedDB database? Some can't (private modes, blocked storage, in-app
 * browsers) and a few never answer at all, which would leave every page that reads progress waiting
 * forever, so an answer that takes longer than `timeoutMs` counts as "no".
 */
export function probeIndexedDB(factory: IDBFactory | null = typeof indexedDB === 'undefined' ? null : indexedDB, timeoutMs = 4000): Promise<boolean> {
  if (!factory) return Promise.resolve(false)
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      clearTimeout(timer)
      resolve(ok)
    }
    const timer = setTimeout(() => resolve(false), timeoutMs)
    try {
      const request = factory.open('pythia-probe')
      request.onsuccess = () => {
        request.result.close()
        done(true)
      }
      request.onerror = () => done(false)
      request.onblocked = () => done(false)
    } catch {
      done(false)
    }
  })
}

/** Where the learner's data lives: the browser's IndexedDB, or (when that is unusable) memory for this tab only. */
export const storage: { persistent: boolean } = { persistent: true }

async function openDatabase(): Promise<PythiaDB> {
  if (await probeIndexedDB()) return new PythiaDB()
  // Keep the app fully working, just without remembering anything after the tab closes. The in-memory
  // implementation is only downloaded in this case.
  const { IDBFactory, IDBKeyRange } = await import('fake-indexeddb')
  storage.persistent = false
  return new PythiaDB('pythia-memory', { indexedDB: new IDBFactory(), IDBKeyRange })
}

export const db = await openDatabase()

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
