import { describe, expect, it, vi } from 'vitest'
import { askPythia, createGate, hashText, LruCache, parseFindings, readEventStream } from '@/features/pythia/aiClient'

const sse = (...events: unknown[]) => events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('')
const bodyOf = (text: string, chunkSize = 7) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      const bytes = new TextEncoder().encode(text)
      for (let i = 0; i < bytes.length; i += chunkSize) c.enqueue(bytes.slice(i, i + chunkSize))
      c.close()
    },
  })

describe('parseFindings', () => {
  const good = '{"findings":[{"line":2,"confidence":0.8,"category":"logic","question":"What is `i` on the last loop?"}]}'

  it('accepts a valid answer, even wrapped in prose or code fences', () => {
    expect(parseFindings(good)).toHaveLength(1)
    expect(parseFindings('Here you go:\n```json\n' + good + '\n```')[0]).toMatchObject({ line: 2, category: 'logic' })
  })

  it('returns nothing for empty, malformed or out-of-contract answers', () => {
    expect(parseFindings('{"findings":[]}')).toEqual([])
    expect(parseFindings('')).toEqual([])
    expect(parseFindings('not json {')).toEqual([])
    expect(parseFindings('{"findings":[{"line":0,"confidence":2,"category":"x","question":"?"}]}')).toEqual([])
    expect(parseFindings('{"findings":"nope"}')).toEqual([])
  })
})

describe('readEventStream', () => {
  it('reassembles text across tiny chunks and reports progress', async () => {
    const seen: string[] = []
    const text = await readEventStream(bodyOf(sse({ t: '{"find' }, { t: 'ings":[]}' }, { done: true }), 5), (c) => seen.push(c))
    expect(text).toBe('{"findings":[]}')
    expect(seen).toEqual(['{"find', 'ings":[]}'])
  })

  it('throws when the proxy reports a mid-stream failure, and ignores junk lines', async () => {
    await expect(readEventStream(bodyOf(sse({ t: 'a' }, { error: 'upstream' })))).rejects.toThrow('failed mid-answer')
    expect(await readEventStream(bodyOf('data: not-json\n\n: comment\n\n' + sse({ t: 'ok' })))).toBe('ok')
  })
})

describe('askPythia', () => {
  it('posts the request and returns validated findings', async () => {
    const answer = '{"findings":[{"line":3,"confidence":0.9,"category":"runtime","question":"What type does input() return?"}]}'
    const fetchImpl = vi.fn(async () => new Response(bodyOf(sse({ t: answer }, { done: true })), { status: 200 }))
    const findings = await askPythia({ code: 'x = 1', goal: 'g' }, new AbortController().signal, fetchImpl as unknown as typeof fetch)
    expect(findings[0]).toMatchObject({ line: 3, category: 'runtime' })
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ code: 'x = 1', goal: 'g' })
  })

  it('throws on HTTP errors so the caller can back off', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 429 }))
    await expect(askPythia({ code: 'x' }, new AbortController().signal, fetchImpl as unknown as typeof fetch)).rejects.toThrow('429')
  })
})

describe('hashText and LruCache', () => {
  it('hashes equal text equally and different text differently', () => {
    expect(hashText('abc')).toBe(hashText('abc'))
    expect(hashText('abc')).not.toBe(hashText('abd'))
    expect(hashText('')).toMatch(/^[0-9a-z]+$/)
  })

  it('evicts the least recently used entry', () => {
    const cache = new LruCache<number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.get('a')
    cache.set('c', 3)
    expect([cache.get('a'), cache.get('b'), cache.get('c')]).toEqual([1, undefined, 3])
  })
})

describe('createGate', () => {
  it('enforces a minimum gap, a cap per window and a backoff', () => {
    let t = 0
    const gate = createGate({ minIntervalMs: 1000, maxPerWindow: 3, windowMs: 10_000 }, () => t)
    expect(gate.allow()).toBe(true)
    gate.record()
    expect(gate.allow()).toBe(false)
    expect(gate.wait()).toBe(1000)
    t = 1000
    expect(gate.allow()).toBe(true)
    gate.record()
    t = 2000
    gate.record()
    t = 3000
    expect(gate.allow()).toBe(false) // 3 in the window
    t = 11_000
    expect(gate.allow()).toBe(true) // the window slid past them
    gate.backoff(5000)
    expect(gate.allow()).toBe(false)
    t = 16_001
    expect(gate.allow()).toBe(true)
  })
})
