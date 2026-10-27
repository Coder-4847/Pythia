import type { z } from 'zod'
import { TABLE_NAMES, type TableName } from '@/data/db'
import { achievementSchema, attemptSchema, draftSchema, lessonProgressSchema, profileSchema, quizResultSchema, settingsSchema, snippetSchema, workspaceSchema } from '@/data/schema'

/** How each local table maps onto the cloud's generic `records` table. */
export interface SyncTable {
  /** The record's identity within its table; equals its IndexedDB primary key. */
  key: (row: never) => string
  schema: z.ZodType<{ updatedAt: number }>
}

export const SYNC_TABLES: Record<TableName, SyncTable> = {
  profile: { key: (r: { id: string }) => r.id, schema: profileSchema },
  settings: { key: (r: { id: string }) => r.id, schema: settingsSchema },
  lessonProgress: { key: (r: { lessonId: string }) => r.lessonId, schema: lessonProgressSchema },
  attempts: { key: (r: { id: string }) => r.id, schema: attemptSchema },
  drafts: { key: (r: { key: string }) => r.key, schema: draftSchema },
  quizResults: { key: (r: { lessonId: string }) => r.lessonId, schema: quizResultSchema },
  snippets: { key: (r: { id: string }) => r.id, schema: snippetSchema },
  workspace: { key: (r: { id: string }) => r.id, schema: workspaceSchema },
  achievements: { key: (r: { id: string }) => r.id, schema: achievementSchema },
}

export const isSyncTable = (name: string): name is TableName => (TABLE_NAMES as readonly string[]).includes(name)
export const keyOf = (name: TableName, row: unknown): string => (SYNC_TABLES[name].key as (r: unknown) => string)(row)
