/** The slice of a Workers KV namespace that the limiter needs (so tests can fake it). */
export interface RateStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>
}

/** Per-isolate fallback when no KV namespace is bound: best-effort, resets when the Worker restarts. */
export function memoryStore(now: () => number = Date.now): RateStore {
  const data = new Map<string, { value: string; expires: number }>()
  return {
    async get(key) {
      const hit = data.get(key)
      if (!hit || hit.expires <= now()) return null
      return hit.value
    },
    async put(key, value, { expirationTtl }) {
      if (data.size > 10_000) data.clear() // a crude cap, so the map can't grow without bound
      data.set(key, { value, expires: now() + expirationTtl * 1000 })
    },
  }
}

export type LimitResult = { ok: true } | { ok: false; retryAfter: number; scope: 'minute' | 'day' }

/**
 * Fixed-window counters per client IP: N requests per minute and M per day. KV is eventually
 * consistent and read-modify-write isn't atomic, so this is a spend guard rather than a hard
 * guarantee (DEPLOY.md explains how to make it strict with a Durable Object).
 */
export function createLimiter(store: RateStore, perMinute: number, perDay: number, now: () => number = Date.now) {
  return {
    async check(ip: string): Promise<LimitResult> {
      const t = now()
      const minuteKey = `m:${ip}:${Math.floor(t / 60_000)}`
      const dayKey = `d:${ip}:${Math.floor(t / 86_400_000)}`
      const [minute, day] = (await Promise.all([store.get(minuteKey), store.get(dayKey)])).map((v) => Number(v ?? 0)) as [number, number]
      if (minute >= perMinute) return { ok: false, retryAfter: 60 - Math.floor((t % 60_000) / 1000), scope: 'minute' }
      if (day >= perDay) return { ok: false, retryAfter: 86_400 - Math.floor((t % 86_400_000) / 1000), scope: 'day' }
      await Promise.all([store.put(minuteKey, String(minute + 1), { expirationTtl: 120 }), store.put(dayKey, String(day + 1), { expirationTtl: 90_000 })])
      return { ok: true }
    },
  }
}
