import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { PythiaDB } from '@/data/db'
import type { Attempt, Snippet } from '@/data/schema'
import { enqueueAll, installOutboxHooks, pairAndMerge, pairAndReplace, pull, queueClear, syncOnce, unpair, type Remote, type RemoteRecord } from '@/sync/engine'

/** An in-memory cloud that behaves like the SQL migration: newer `updated_at` wins, every accepted write gets a seq. */
class FakeCloud implements Remote {
  rows = new Map<string, RemoteRecord>()
  seq = 0
  offline = false
  pushes = 0
  async push(rows: Omit<RemoteRecord, 'seq'>[]) {
    if (this.offline) throw new Error('offline')
    this.pushes++
    for (const r of rows) {
      const id = `${r.kind}:${r.key}`
      const old = this.rows.get(id)
      if (old && r.updated_at <= old.updated_at) continue
      this.rows.set(id, { ...r, data: JSON.parse(JSON.stringify(r.data)), seq: ++this.seq })
    }
  }
  async pull(after: number, limit: number) {
    if (this.offline) throw new Error('offline')
    return [...this.rows.values()].filter((r) => r.seq > after).sort((a, b) => a.seq - b.seq).slice(0, limit)
  }
}

let n = 0
const flush = () => new Promise((r) => setTimeout(r, 20)) // hooks queue just after a write commits
const attempt = (id: string, at: number, extra: Partial<Attempt> = {}): Attempt => ({ id, lessonId: 'L', exerciseId: 'e', code: `code ${id}`, at, passed: false, results: [], hintsUsed: 0, xpAwarded: 0, updatedAt: at, ...extra })
const snippet = (id: string, at: number, extra: Partial<Snippet> = {}): Snippet => ({ id, title: id, code: 'x', createdAt: at, updatedAt: at, ...extra })

async function device(cloud: FakeCloud, paired = true) {
  const db = new PythiaDB(`dev-${n++}`)
  let enabled = false
  installOutboxHooks(db, () => enabled)
  if (paired) {
    await pairAndMerge(db, 'user-1')
    enabled = true
  }
  return { db, cloud, enable: () => (enabled = true), sync: () => syncOnce(db, cloud) }
}

let cloud: FakeCloud
beforeEach(() => {
  cloud = new FakeCloud()
})

describe('sync engine', () => {
  it('queues a write, uploads it, and clears the queue', async () => {
    const a = await device(cloud)
    await a.db.attempts.put(attempt('a1', 100))
    await flush()
    expect(await a.db.outbox.count()).toBe(1)
    await a.sync()
    expect(await a.db.outbox.count()).toBe(0)
    expect(cloud.rows.get('attempts:a1')?.updated_at).toBe(100)
  })

  it('does not queue anything for a device that is not paired', async () => {
    const a = await device(cloud, false)
    await a.db.attempts.put(attempt('a1', 100))
    await flush()
    expect(await a.db.outbox.count()).toBe(0)
  })

  it('coalesces repeated changes to one record into one entry', async () => {
    const a = await device(cloud)
    for (let i = 0; i < 5; i++) await a.db.attempts.put(attempt('a1', 100 + i))
    await flush()
    expect(await a.db.outbox.count()).toBe(1)
  })

  it('carries progress from one device to another', async () => {
    const a = await device(cloud)
    const b = await device(cloud)
    await a.db.attempts.bulkPut([attempt('a1', 100), attempt('a2', 110)])
    await a.db.settings.put({ id: 'settings', theme: 'light', editorFontSize: 16, keybindings: 'vim', pythiaIntensity: 'quiet', aiEnabled: false, reducedMotion: 'on', updatedAt: 120 })
    await flush()
    await a.sync()
    await pull(b.db, cloud)
    expect((await b.db.attempts.toArray()).map((r) => r.id).sort()).toEqual(['a1', 'a2'])
    expect((await b.db.settings.get('settings'))?.theme).toBe('light')
    // What B just received is not queued to go back up (checked right after the pull, before any push could clear it).
    await flush()
    expect(await b.db.outbox.count()).toBe(0)
  })

  it('the newer edit wins on both devices, whichever syncs first', async () => {
    const a = await device(cloud)
    const b = await device(cloud)
    await a.db.snippets.put(snippet('s', 100, { title: 'base' }))
    await flush()
    await a.sync()
    await b.sync()
    await a.db.snippets.put(snippet('s', 200, { title: 'from A' }))
    await b.db.snippets.put(snippet('s', 300, { title: 'from B' }))
    await flush()
    await b.sync() // newer goes first
    await a.sync() // older arrives late: rejected by the cloud, replaced by B's copy locally
    await b.sync()
    expect((await a.db.snippets.get('s'))?.title).toBe('from B')
    expect((await b.db.snippets.get('s'))?.title).toBe('from B')
    expect(cloud.rows.get('snippets:s')?.updated_at).toBe(300)
  })

  it('propagates deletions, and a newer edit beats an older deletion', async () => {
    const a = await device(cloud)
    const b = await device(cloud)
    await a.db.drafts.put({ key: 'L/e', lessonId: 'L', exerciseId: 'e', code: 'x', hintLevel: 0, updatedAt: 100 })
    await a.db.attempts.put(attempt('keep', 100))
    await flush()
    await a.sync()
    await b.sync()
    await a.db.drafts.delete('L/e')
    await flush()
    await a.sync()
    await b.sync()
    expect(await b.db.drafts.count()).toBe(0)

    // B edits an attempt *after* A deletes it: the edit survives and comes back to A.
    await a.db.attempts.delete('keep')
    await flush()
    await new Promise((r) => setTimeout(r, 5))
    await b.db.attempts.put(attempt('keep', Date.now() + 1000))
    await flush()
    await a.sync()
    await b.sync()
    await a.sync()
    expect(await a.db.attempts.get('keep')).toBeDefined()
  })

  it('keeps changes made offline, and sends them when the connection returns', async () => {
    const a = await device(cloud)
    cloud.offline = true
    await a.db.attempts.put(attempt('a1', 100))
    await flush()
    await expect(a.sync()).rejects.toThrow('offline')
    expect(await a.db.outbox.count()).toBe(1)
    cloud.offline = false
    await a.sync()
    expect(await a.db.outbox.count()).toBe(0)
    expect(cloud.rows.has('attempts:a1')).toBe(true)
  })

  it('leaves a newer change in the queue when it arrived during an upload', async () => {
    const a = await device(cloud)
    await a.db.attempts.put(attempt('a1', 100))
    await flush()
    const realPush = cloud.push.bind(cloud)
    cloud.push = async (rows) => {
      await realPush(rows)
      await a.db.attempts.put(attempt('a1', 500)) // edited while the upload was in flight
      await flush()
    }
    await a.sync()
    cloud.push = realPush
    expect(await a.db.outbox.get('attempts:a1')).toBeDefined()
    await a.sync()
    expect(cloud.rows.get('attempts:a1')?.updated_at).toBe(500)
  })

  it('merging a device that already has data with an account that has some', async () => {
    const other = await device(cloud)
    await other.db.attempts.put(attempt('cloud-only', 100))
    await other.db.snippets.put(snippet('both', 100, { title: 'old' }))
    await flush()
    await other.sync()

    const fresh = await device(cloud, false)
    await fresh.db.attempts.put(attempt('local-only', 150))
    await fresh.db.snippets.put(snippet('both', 200, { title: 'newer here' }))
    await pairAndMerge(fresh.db, 'user-1')
    fresh.enable()
    await fresh.sync()
    expect((await fresh.db.attempts.toArray()).map((r) => r.id).sort()).toEqual(['cloud-only', 'local-only'])
    expect((await fresh.db.snippets.get('both'))?.title).toBe('newer here')
    await other.sync()
    expect((await other.db.attempts.toArray()).map((r) => r.id).sort()).toEqual(['cloud-only', 'local-only'])
    expect((await other.db.snippets.get('both'))?.title).toBe('newer here')
  })

  it('"use the cloud copy" replaces local data without uploading it', async () => {
    const other = await device(cloud)
    await other.db.attempts.put(attempt('cloud', 100))
    await flush()
    await other.sync()
    const fresh = await device(cloud, false)
    await fresh.db.attempts.put(attempt('local-junk', 100))
    await pairAndReplace(fresh.db, 'user-1')
    fresh.enable()
    await fresh.sync()
    expect((await fresh.db.attempts.toArray()).map((r) => r.id)).toEqual(['cloud'])
    expect(cloud.rows.has('attempts:local-junk')).toBe(false)
  })

  it('queueClear turns a wipe into deletions that reach the cloud', async () => {
    const a = await device(cloud)
    const b = await device(cloud)
    await a.db.attempts.bulkPut([attempt('a1', 100), attempt('a2', 100)])
    await flush()
    await a.sync()
    await b.sync()
    await queueClear(a.db, ['attempts'])
    await a.db.attempts.clear()
    await a.sync()
    await b.sync()
    expect(await b.db.attempts.count()).toBe(0)
  })

  it('drops cloud rows that fail validation or are filed under the wrong key', async () => {
    const a = await device(cloud)
    cloud.rows.set('attempts:bad', { kind: 'attempts', key: 'bad', data: { id: 'bad', nope: true }, deleted: false, updated_at: 5, seq: ++cloud.seq })
    cloud.rows.set('attempts:liar', { kind: 'attempts', key: 'liar', data: attempt('other-id', 5), deleted: false, updated_at: 5, seq: ++cloud.seq })
    cloud.rows.set('nonsense:x', { kind: 'nonsense' as never, key: 'x', data: {}, deleted: false, updated_at: 5, seq: ++cloud.seq })
    const { pull } = await a.sync()
    expect(pull.rejected).toBe(3)
    expect(await a.db.attempts.count()).toBe(0)
  })

  it('pulls in pages and resumes from its cursor', async () => {
    const a = await device(cloud)
    for (let i = 0; i < 1200; i++) cloud.rows.set(`attempts:p${i}`, { kind: 'attempts', key: `p${i}`, data: attempt(`p${i}`, i + 1), deleted: false, updated_at: i + 1, seq: ++cloud.seq })
    await a.sync()
    expect(await a.db.attempts.count()).toBe(1200)
    const before = cloud.pushes
    await a.sync()
    expect(cloud.pushes).toBe(before)
  })

  it('enqueueAll with `since` only catches up recent rows; unpair forgets the account', async () => {
    const a = await device(cloud, false)
    await a.db.attempts.bulkPut([attempt('old', 10), attempt('new', 1000)])
    expect(await enqueueAll(a.db, 500)).toBe(1)
    await unpair(a.db)
    expect(await a.db.outbox.count()).toBe(0)
  })
})
