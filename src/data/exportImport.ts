import { z } from 'zod'
import { db, TABLE_NAMES, type TableName } from '@/data/db'
import { queueClearIfPaired } from '@/sync/engine'
import {
  achievementSchema,
  attemptSchema,
  draftSchema,
  lessonProgressSchema,
  profileSchema,
  quizResultSchema,
  SCHEMA_VERSION,
  settingsSchema,
  snippetSchema,
  workspaceSchema,
} from '@/data/schema'

export const EXPORT_FORMAT = 'pythia-export'
/** Refuse files bigger than this before parsing: a corrupt or hostile file must not freeze the tab. */
export const MAX_IMPORT_CHARS = 30_000_000

const dataSchema = z.object({
  profile: profileSchema.nullable(),
  settings: settingsSchema.nullable(),
  lessonProgress: z.array(lessonProgressSchema),
  attempts: z.array(attemptSchema),
  drafts: z.array(draftSchema),
  quizResults: z.array(quizResultSchema),
  snippets: z.array(snippetSchema),
  workspace: workspaceSchema.nullable(),
  achievements: z.array(achievementSchema),
})

export const exportSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  version: z.number().int().min(1),
  exportedAt: z.number().int().nonnegative(),
  appVersion: z.string().max(40),
  data: dataSchema,
})

export type ExportFile = z.infer<typeof exportSchema>
export type ExportData = ExportFile['data']
export type ImportMode = 'merge' | 'replace'

/** Per-table description: how to read a row's identity, and whether the table holds one row. */
const TABLES: Record<TableName, { label: string; key: (row: never) => string; singleton: boolean }> = {
  profile: { label: 'Profile', key: (r: { id: string }) => r.id, singleton: true },
  settings: { label: 'Settings', key: (r: { id: string }) => r.id, singleton: true },
  lessonProgress: { label: 'Lesson progress', key: (r: { lessonId: string }) => r.lessonId, singleton: false },
  attempts: { label: 'Exercise attempts', key: (r: { id: string }) => r.id, singleton: false },
  drafts: { label: 'Saved drafts', key: (r: { key: string }) => r.key, singleton: false },
  quizResults: { label: 'Quiz results', key: (r: { lessonId: string }) => r.lessonId, singleton: false },
  snippets: { label: 'Snippets', key: (r: { id: string }) => r.id, singleton: false },
  workspace: { label: 'Playground files', key: (r: { id: string }) => r.id, singleton: true },
  achievements: { label: 'Achievements', key: (r: { id: string }) => r.id, singleton: false },
}

// ───────────── export ─────────────
export async function buildExport(appVersion: string): Promise<ExportFile> {
  const [profile, settings, lessonProgress, attempts, drafts, quizResults, snippets, workspace, achievements] = await Promise.all([
    db.profile.get('me'),
    db.settings.get('settings'),
    db.lessonProgress.toArray(),
    db.attempts.toArray(),
    db.drafts.toArray(),
    db.quizResults.toArray(),
    db.snippets.toArray(),
    db.workspace.get('playground'),
    db.achievements.toArray(),
  ])
  return {
    format: EXPORT_FORMAT,
    version: SCHEMA_VERSION,
    exportedAt: Date.now(),
    appVersion,
    data: {
      profile: profile ?? null,
      settings: settings ?? null,
      lessonProgress,
      attempts,
      drafts,
      quizResults,
      snippets,
      workspace: workspace ?? null,
      achievements,
    },
  }
}

// ───────────── parse, validate, migrate ─────────────
/**
 * Steps that upgrade an older file one version at a time. `MIGRATIONS[n]` turns a version-n
 * file into version n+1. Empty today: version 1 is the first release.
 */
const MIGRATIONS: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {}

export type ParseResult = { ok: true; file: ExportFile; migratedFrom: number | null } | { ok: false; errors: string[] }

export function parseExport(text: string): ParseResult {
  if (text.length > MAX_IMPORT_CHARS) return { ok: false, errors: ['This file is too large to be a Pythia export.'] }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['This is not valid JSON. Choose a file that was exported from Pythia.'] }
  }
  if (typeof raw !== 'object' || raw === null || (raw as { format?: unknown }).format !== EXPORT_FORMAT) {
    return { ok: false, errors: ['This file was not exported from Pythia (missing or wrong "format").'] }
  }
  let current = raw as Record<string, unknown>
  const version = current.version
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return { ok: false, errors: ['The file has no valid "version".'] }
  if (version > SCHEMA_VERSION) {
    return { ok: false, errors: [`This file is from a newer version of Pythia (format v${version}; this app understands up to v${SCHEMA_VERSION}). Update Pythia and try again.`] }
  }
  for (let v = version; v < SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v]
    if (!migrate) return { ok: false, errors: [`No upgrade path from format v${v}.`] }
    current = { ...migrate(current), version: v + 1 }
  }
  const parsed = exportSchema.safeParse(current)
  if (!parsed.success) {
    const errors = parsed.error.issues.slice(0, 8).map((i) => `${i.path.join('.') || 'file'}: ${i.message}`)
    if (parsed.error.issues.length > 8) errors.push(`…and ${parsed.error.issues.length - 8} more problems.`)
    return { ok: false, errors }
  }
  return { ok: true, file: parsed.data, migratedFrom: version < SCHEMA_VERSION ? version : null }
}

// ───────────── preview & apply ─────────────
type Row = { updatedAt: number }

/** Rows of a table as an array, whether the export stores them as a list or a single object. */
function incomingRows(data: ExportData, name: TableName): Row[] {
  const value = data[name] as Row | Row[] | null
  return value === null ? [] : Array.isArray(value) ? value : [value]
}

const keyOf = (name: TableName, row: Row) => (TABLES[name].key as (r: Row) => string)(row)

export interface TablePreview {
  table: TableName
  label: string
  incoming: number
  /** Not on this device yet. */
  added: number
  /** On this device, but the file's copy is newer. */
  updated: number
  /** Identical timestamp: nothing to do. */
  unchanged: number
  /** On this device and newer (or equal), so the file's copy is ignored in a merge. */
  keptLocal: number
  /** Replace mode only: rows on this device that the file doesn't have, which will be deleted. */
  removed: number
}

export async function previewImport(file: ExportFile, mode: ImportMode): Promise<TablePreview[]> {
  const previews: TablePreview[] = []
  for (const name of TABLE_NAMES) {
    const local = (await db.table(name).toArray()) as Row[]
    const localByKey = new Map(local.map((r) => [keyOf(name, r), r]))
    const incoming = incomingRows(file.data, name)
    const p: TablePreview = { table: name, label: TABLES[name].label, incoming: incoming.length, added: 0, updated: 0, unchanged: 0, keptLocal: 0, removed: 0 }
    for (const row of incoming) {
      const existing = localByKey.get(keyOf(name, row))
      if (!existing) p.added++
      else if (mode === 'replace') {
        if (row.updatedAt === existing.updatedAt) p.unchanged++
        else p.updated++
      }
      else if (row.updatedAt > existing.updatedAt) p.updated++
      else if (row.updatedAt === existing.updatedAt) p.unchanged++
      else p.keptLocal++
    }
    if (mode === 'replace') {
      const incomingKeys = new Set(incoming.map((r) => keyOf(name, r)))
      p.removed = local.filter((r) => !incomingKeys.has(keyOf(name, r))).length
    }
    previews.push(p)
  }
  return previews
}

/** Apply an import atomically: either everything lands or nothing changes. */
export async function applyImport(file: ExportFile, mode: ImportMode): Promise<void> {
  const tables = TABLE_NAMES.map((n) => db.table(n))
  // Replacing wipes tables with clear(), which fires no delete hooks: queue those deletions for the cloud first.
  if (mode === 'replace') await queueClearIfPaired(db, TABLE_NAMES)
  await db.transaction('rw', tables, async () => {
    for (const name of TABLE_NAMES) {
      const table = db.table(name)
      const incoming = incomingRows(file.data, name)
      if (mode === 'replace') {
        await table.clear()
        await table.bulkPut(incoming)
        continue
      }
      // Merge: last write wins per item.
      const local = new Map(((await table.toArray()) as Row[]).map((r) => [keyOf(name, r), r]))
      const winners = incoming.filter((row) => {
        const existing = local.get(keyOf(name, row))
        return !existing || row.updatedAt > existing.updatedAt
      })
      await table.bulkPut(winners)
    }
  })
}

/** Delete everything stored on this device. */
export async function resetAllData(): Promise<void> {
  await queueClearIfPaired(db, TABLE_NAMES)
  await db.transaction('rw', TABLE_NAMES.map((n) => db.table(n)), async () => {
    for (const name of TABLE_NAMES) await db.table(name).clear()
  })
}
