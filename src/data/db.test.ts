import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { probeIndexedDB } from '@/data/db'

describe('probeIndexedDB', () => {
  it('says yes for a working IndexedDB', async () => {
    expect(await probeIndexedDB(indexedDB, 2000)).toBe(true)
  })

  it('says no when there is none, when opening throws, or when it fails', async () => {
    expect(await probeIndexedDB(null)).toBe(false)
    const throwing = { open: () => { throw new Error('SecurityError') } } as unknown as IDBFactory
    expect(await probeIndexedDB(throwing, 2000)).toBe(false)
    const failing = { open: () => { const r: { onerror?: (e: Event) => void } = {}; setTimeout(() => r.onerror?.(new Event('error')), 0); return r } } as unknown as IDBFactory
    expect(await probeIndexedDB(failing, 2000)).toBe(false)
  })

  it('says no, rather than waiting forever, when the browser never answers', async () => {
    const silent = { open: () => ({}) } as unknown as IDBFactory
    const started = Date.now()
    expect(await probeIndexedDB(silent, 150)).toBe(false)
    expect(Date.now() - started).toBeLessThan(2000)
  })
})
