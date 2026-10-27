import { z } from 'zod'

/** The Cloudflare Worker URL, set at build time. Empty means "no AI layer": Pythia stays local-only. */
export const AI_URL = (import.meta.env.VITE_AI_PROXY_URL ?? '').replace(/\/$/, '')
export const aiConfigured = AI_URL !== ''

const findingSchema = z.object({
  line: z.number().int().min(1),
  confidence: z.number().min(0).max(1),
  category: z.enum(['logic', 'runtime', 'concept', 'style']),
  question: z.string().min(5).max(300),
})
const responseSchema = z.object({ findings: z.array(findingSchema).max(3) })

export type AiFinding = z.infer<typeof findingSchema>

/** Extract and validate the model's JSON. Anything malformed yields no findings: never a crash. */
export function parseFindings(text: string): AiFinding[] {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return []
  try {
    const parsed = responseSchema.safeParse(JSON.parse(text.slice(start, end + 1)))
    return parsed.success ? parsed.data.findings : []
  } catch {
    return []
  }
}

/** Small, fast, non-cryptographic string hash (cyrb53). Used as a cache key. */
export function hashText(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

/** A bounded cache so a long session can't grow without limit. */
export class LruCache<V> {
  private map = new Map<string, V>()
  constructor(private max: number) {}
  get(key: string): V | undefined {
    const value = this.map.get(key)
    if (value !== undefined) {
      this.map.delete(key)
      this.map.set(key, value) // most recently used goes last
    }
    return value
  }
  set(key: string, value: V) {
    this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value as string)
  }
}

/**
 * Hard limits on how often the browser may ask: a minimum gap between requests, a cap per
 * window, and a backoff after any failure. Cost control starts here, before the proxy's limits.
 */
export function createGate(opts: { minIntervalMs: number; maxPerWindow: number; windowMs: number }, now: () => number = Date.now) {
  let times: number[] = []
  let blockedUntil = 0
  return {
    allow(): boolean {
      const t = now()
      times = times.filter((x) => t - x < opts.windowMs)
      const last = times[times.length - 1]
      return t >= blockedUntil && times.length < opts.maxPerWindow && (last === undefined || t - last >= opts.minIntervalMs)
    },
    record() {
      times.push(now())
    },
    /** After a failure, stay silent for a while instead of hammering a struggling proxy. */
    backoff(ms: number) {
      blockedUntil = now() + ms
    },
    /** Milliseconds until the next request would be allowed (0 if allowed now). */
    wait(): number {
      const t = now()
      const last = times[times.length - 1]
      return Math.max(0, blockedUntil - t, last === undefined ? 0 : opts.minIntervalMs - (t - last))
    },
  }
}

/** Read a Server-Sent-Events body, calling `onText` for each text chunk. Resolves with the full text. */
export async function readEventStream(body: ReadableStream<Uint8Array>, onText?: (chunk: string) => void): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let at: number
    while ((at = buffer.indexOf('\n\n')) !== -1) {
      const line = buffer.slice(0, at).trim()
      buffer = buffer.slice(at + 2)
      if (!line.startsWith('data:')) continue
      let event: { t?: unknown; done?: unknown; error?: unknown }
      try {
        event = JSON.parse(line.slice(5))
      } catch {
        continue
      }
      if (event.error) throw new Error('The AI service failed mid-answer')
      if (typeof event.t === 'string') {
        text += event.t
        onText?.(event.t)
      }
    }
  }
  return text
}

export interface AskRequest {
  code: string
  goal?: string
  recentError?: { type: string; message: string }
}

/** Ask the proxy. Throws on any failure; the caller degrades silently to local analysis. */
export async function askPythia(req: AskRequest, signal: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<AiFinding[]> {
  const res = await fetchImpl(`${AI_URL}/v1/pythia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`AI proxy answered ${res.status}`)
  return parseFindings(await readEventStream(res.body))
}
