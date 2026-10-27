import type { PythiaDB } from '@/data/db'
import { TABLE_NAMES, type TableName } from '@/data/db'
import { isSyncTable, keyOf, SYNC_TABLES } from '@/sync/tables'

/**
 * Local-first sync. IndexedDB stays the source of truth; the cloud is a mirror that is
 * last-write-wins per item (each record's own `updatedAt`).
 *
 *   write ──► Dexie hook ──► outbox (one entry per changed record) ──► push ──► cloud
 *   cloud ──► pull(seq > cursor) ──► keep whichever side is newer ──► apply (hooks muted)
 *
 * Nothing here knows about Supabase: it talks to a `Remote`, so the whole thing is tested
 * with two simulated devices and an in-memory cloud.
 */

/** One row of the cloud's `records` table. */
export interface RemoteRecord {
  kind: TableName
  key: string
  /** The record, or `null` for a deletion. */
  data: unknown
  deleted: boolean
  /** The record's own `updatedAt`; for a deletion, when it was deleted. */
  updated_at: number
  /** Server-assigned order of accepted writes. */
  seq: number
}

export interface Remote {
  /** Upsert rows. The server keeps the newer of old and new, so pushing a stale row is harmless. */
  push(rows: Omit<RemoteRecord, 'seq'>[]): Promise<void>
  /** Rows with `seq > after`, oldest first. */
  pull(after: number, limit: number): Promise<RemoteRecord[]>
}

export const PUSH_BATCH = 100
export const PULL_PAGE = 500

// ───────────── meta ─────────────
export const getMeta = async <T>(db: PythiaDB, key: string): Promise<T | undefined> => (await db.meta.get(key))?.value as T | undefined
export const setMeta = (db: PythiaDB, key: string, value: unknown) => db.meta.put({ key, value })

/** Transactions that are applying cloud data: their writes must not be queued for upload again. */
const remoteTransactions = new WeakSet<object>()

// ───────────── outbox hooks ─────────────
/**
 * Queue every local change. `isEnabled` says whether this device is paired with an account;
 * writes made by the sync itself (see `remoteTransactions`) are skipped. The entry is written
 * just after the change commits, in its own transaction, because a hook can't touch tables
 * outside the transaction that fired it.
 */
export function installOutboxHooks(db: PythiaDB, isEnabled: () => boolean): void {
  const queue = (table: TableName, key: unknown, trans: object) => {
    if (!isEnabled() || remoteTransactions.has(trans) || typeof key !== 'string') return
    const at = Date.now()
    setTimeout(() => void db.outbox.put({ id: `${table}:${key}`, table, key, at }).catch(() => undefined), 0)
  }
  for (const name of TABLE_NAMES) {
    const table = db.table(name)
    table.hook('creating', function (primKey, _obj, trans) {
      this.onsuccess = (key: unknown) => queue(name, key ?? primKey, trans)
    })
    table.hook('updating', function (_mods, primKey, _obj, trans) {
      this.onsuccess = () => queue(name, primKey, trans)
    })
    table.hook('deleting', function (primKey, _obj, trans) {
      this.onsuccess = () => queue(name, primKey, trans)
    })
  }
}

/** Queue deletions for rows that are about to be wiped with `clear()`, which fires no delete hooks. */
export async function queueClear(db: PythiaDB, names: readonly TableName[]): Promise<void> {
  const at = Date.now()
  for (const name of names) {
    const keys = (await db.table(name).toCollection().primaryKeys()) as string[]
    await db.outbox.bulkPut(keys.map((key) => ({ id: `${name}:${key}`, table: name, key, at })))
  }
}

/** `queueClear`, but only when this device is paired with an account (a guest has no cloud copy to correct). */
export async function queueClearIfPaired(db: PythiaDB, names: readonly TableName[]): Promise<void> {
  if (await getMeta<string>(db, 'syncUser')) await queueClear(db, names)
}

/** Queue every record on this device (first sync, or catching up). */
export async function enqueueAll(db: PythiaDB, since = 0): Promise<number> {
  let count = 0
  for (const name of TABLE_NAMES) {
    const rows = (await db.table(name).toArray()) as { updatedAt: number }[]
    const entries = rows.filter((r) => r.updatedAt >= since).map((r) => ({ id: `${name}:${keyOf(name, r)}`, table: name, key: keyOf(name, r), at: r.updatedAt }))
    await db.outbox.bulkPut(entries)
    count += entries.length
  }
  return count
}

// ───────────── push ─────────────
export async function push(db: PythiaDB, remote: Remote): Promise<number> {
  let sent = 0
  for (;;) {
    const batch = await db.outbox.orderBy('at').limit(PUSH_BATCH).toArray()
    if (!batch.length) return sent
    const rows: Omit<RemoteRecord, 'seq'>[] = []
    for (const entry of batch) {
      if (!isSyncTable(entry.table)) continue
      const row = (await db.table(entry.table).get(entry.key)) as { updatedAt: number } | undefined
      rows.push(
        row
          ? { kind: entry.table, key: entry.key, data: row, deleted: false, updated_at: row.updatedAt }
          : { kind: entry.table, key: entry.key, data: null, deleted: true, updated_at: entry.at },
      )
    }
    if (rows.length) await remote.push(rows)
    // Remove only what we sent: an entry bumped by a newer change while we were pushing stays queued.
    await db.transaction('rw', db.outbox, async () => {
      for (const entry of batch) {
        const current = await db.outbox.get(entry.id)
        if (current && current.at === entry.at) await db.outbox.delete(entry.id)
      }
    })
    sent += batch.length
    if (batch.length < PUSH_BATCH) return sent
  }
}

// ───────────── pull ─────────────
export interface PullResult {
  applied: number
  /** Cloud rows we ignored because this device has a newer copy (it will be uploaded). */
  keptLocal: number
  /** Cloud rows that failed validation and were dropped. */
  rejected: number
  /** Local tables changed by the pull, so UI stores can reload. */
  changed: Set<TableName>
}

export async function pull(db: PythiaDB, remote: Remote): Promise<PullResult> {
  const result: PullResult = { applied: 0, keptLocal: 0, rejected: 0, changed: new Set() }
  let cursor = (await getMeta<number>(db, 'cursor')) ?? 0
  for (;;) {
    const page = await remote.pull(cursor, PULL_PAGE)
    if (!page.length) return result
    const tables = TABLE_NAMES.map((n) => db.table(n))
    const stale: { table: TableName; key: string; at: number }[] = []
    await db.transaction('rw', tables, async (tx) => {
      remoteTransactions.add(tx)
      for (const rec of page) {
        if (!isSyncTable(rec.kind)) {
          result.rejected++
          continue
        }
        const table = db.table(rec.kind)
        const local = (await table.get(rec.key)) as { updatedAt: number } | undefined
        const localAt = local?.updatedAt ?? -1
        if (rec.deleted) {
          if (!local) continue
          if (rec.updated_at > local.updatedAt) {
            await table.delete(rec.key)
            result.applied++
            result.changed.add(rec.kind)
          } else {
            result.keptLocal++
            stale.push({ table: rec.kind, key: rec.key, at: local.updatedAt })
          }
          continue
        }
        const parsed = SYNC_TABLES[rec.kind].schema.safeParse(rec.data)
        // The key must match too: a row filed under the wrong key would overwrite someone else's record.
        if (!parsed.success || keyOf(rec.kind, parsed.data) !== rec.key) {
          result.rejected++
          continue
        }
        if (parsed.data.updatedAt > localAt) {
          await table.put(parsed.data)
          result.applied++
          result.changed.add(rec.kind)
        } else if (parsed.data.updatedAt < localAt) {
          result.keptLocal++
          stale.push({ table: rec.kind, key: rec.key, at: localAt })
        }
      }
    })
    if (stale.length) await db.outbox.bulkPut(stale.map((s) => ({ id: `${s.table}:${s.key}`, table: s.table, key: s.key, at: s.at })))
    cursor = Math.max(cursor, ...page.map((r) => r.seq))
    await setMeta(db, 'cursor', cursor)
    if (page.length < PULL_PAGE) return result
  }
}

/** One full round: send local changes, then fetch the cloud's. */
export async function syncOnce(db: PythiaDB, remote: Remote): Promise<{ pushed: number; pull: PullResult }> {
  const pushed = await push(db, remote)
  const pulled = await pull(db, remote)
  // Rows kept because they were newer locally (and, rarely, queued during the pull) go up now.
  const pushedAgain = await push(db, remote)
  return { pushed: pushed + pushedAgain, pull: pulled }
}

// ───────────── first-sign-in choices ─────────────
/** Pair this device with an account: send everything here, take everything there, newest wins per item. */
export async function pairAndMerge(db: PythiaDB, userId: string): Promise<void> {
  await db.outbox.clear()
  await setMeta(db, 'syncUser', userId)
  await setMeta(db, 'cursor', 0)
  await enqueueAll(db)
}

/** Pair with an account and make this device match it exactly. Local learner data is replaced. */
export async function pairAndReplace(db: PythiaDB, userId: string): Promise<void> {
  const tables = TABLE_NAMES.map((n) => db.table(n))
  await db.transaction('rw', [...tables, db.outbox, db.meta], async (tx) => {
    remoteTransactions.add(tx)
    for (const t of tables) await t.clear()
    await db.outbox.clear()
    await db.meta.bulkPut([
      { key: 'syncUser', value: userId },
      { key: 'cursor', value: 0 },
    ])
  })
}

/** Stop syncing this device with the account; local data is untouched. */
export async function unpair(db: PythiaDB): Promise<void> {
  await db.outbox.clear()
  await db.meta.bulkDelete(['syncUser', 'cursor', 'lastSyncAt'])
}

