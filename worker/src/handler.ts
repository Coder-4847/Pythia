import { createLimiter, memoryStore, type RateStore } from './limits'
import { buildUserMessage, SYSTEM_PROMPT } from './prompt'
import { LIMITS, parseRequest } from './validate'

export interface Env {
  /** Secret: `wrangler secret put ANTHROPIC_API_KEY`. Never sent to the browser. */
  ANTHROPIC_API_KEY: string
  MODEL?: string
  /** Comma-separated allowed origins. */
  ALLOWED_ORIGINS?: string
  RATE_LIMIT_PER_MIN?: string
  RATE_LIMIT_PER_DAY?: string
  /** Optional KV namespace for shared rate limiting. */
  RATE?: RateStore
}

export interface StreamArgs {
  apiKey: string
  model: string
  system: string
  user: string
  signal: AbortSignal
}

export interface Deps {
  /** Yields the model's text as it is generated. */
  streamText: (args: StreamArgs) => AsyncIterable<string>
  now?: () => number
}

const DEFAULT_MODEL = 'claude-haiku-5-5'
const fallbackStore = memoryStore()

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  })

/** HTTP status carried by an upstream SDK error, if any. */
const upstreamStatus = (e: unknown): number | undefined => (typeof e === 'object' && e !== null && 'status' in e && typeof e.status === 'number' ? e.status : undefined)

/**
 * POST /v1/pythia → a Server-Sent Events stream: `data: {"t":"<text>"}` per chunk, then
 * `data: {"done":true}`. The learner's code is never logged or stored.
 */
export async function handle(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url)
  const origin = request.headers.get('Origin') ?? ''
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)
  if (!allowed.includes(origin)) return json(403, { error: 'origin_not_allowed' })
  const cors = corsHeaders(origin)

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (url.pathname !== '/v1/pythia') return json(404, { error: 'not_found' }, cors)
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, cors)

  const limiter = createLimiter(env.RATE ?? fallbackStore, Number(env.RATE_LIMIT_PER_MIN ?? 12), Number(env.RATE_LIMIT_PER_DAY ?? 300), deps.now)
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const limit = await limiter.check(ip)
  if (!limit.ok) return json(429, { error: 'rate_limited', scope: limit.scope }, { ...cors, 'Retry-After': String(limit.retryAfter) })

  const text = await request.text()
  if (text.length > LIMITS.body) return json(413, { error: 'too_large' }, cors)
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json(400, { error: 'bad_json' }, cors)
  }
  const parsed = parseRequest(body)
  if (!parsed.ok) return json(400, { error: 'bad_request', detail: parsed.error }, cors)

  // Pull the first chunk before answering, so an upstream failure becomes a proper HTTP status.
  const controller = new AbortController()
  const upstream = deps.streamText({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.MODEL || DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    user: buildUserMessage(parsed.value),
    signal: controller.signal,
  })
  const iterator = upstream[Symbol.asyncIterator]()
  let first: IteratorResult<string>
  try {
    first = await iterator.next()
  } catch (e) {
    const status = upstreamStatus(e)
    if (status === 429) return json(429, { error: 'upstream_busy' }, { ...cors, 'Retry-After': '30' })
    return json(502, { error: 'upstream_error' }, cors) // never leak the upstream message (it could mention the key)
  }

  const encoder = new TextEncoder()
  const event = (data: unknown) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      try {
        let step = first
        while (!step.done) {
          streamController.enqueue(event({ t: step.value }))
          step = await iterator.next()
        }
        streamController.enqueue(event({ done: true }))
      } catch {
        streamController.enqueue(event({ error: 'upstream' }))
      } finally {
        streamController.close()
      }
    },
    cancel() {
      controller.abort() // the learner kept typing: stop paying for this answer
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { ...cors, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}
