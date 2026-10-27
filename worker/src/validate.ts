/** What the app sends to the proxy. Everything is bounded, so one request can't cost much. */
export interface PythiaRequest {
  code: string
  /** The lesson goal or exercise prompt, as context. */
  goal?: string
  /** The most recent error the learner saw. */
  recentError?: { type: string; message: string }
}

export const LIMITS = { code: 8_000, goal: 600, errorType: 60, errorMessage: 300, body: 20_000 } as const

export type Parsed = { ok: true; value: PythiaRequest } | { ok: false; error: string }

const isText = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max

export function parseRequest(body: unknown): Parsed {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Body must be a JSON object.' }
  const { code, goal, recentError } = body as Record<string, unknown>
  if (!isText(code, LIMITS.code) || code.trim().length === 0) return { ok: false, error: `"code" must be 1 to ${LIMITS.code} characters.` }
  if (goal !== undefined && !isText(goal, LIMITS.goal)) return { ok: false, error: `"goal" must be at most ${LIMITS.goal} characters.` }
  const value: PythiaRequest = { code }
  if (goal) value.goal = goal
  if (recentError !== undefined) {
    const e = recentError as Record<string, unknown> | null
    if (typeof e !== 'object' || e === null || !isText(e.type, LIMITS.errorType) || !isText(e.message, LIMITS.errorMessage)) {
      return { ok: false, error: '"recentError" must be {type, message} with short strings.' }
    }
    value.recentError = { type: e.type, message: e.message }
  }
  return { ok: true, value }
}
