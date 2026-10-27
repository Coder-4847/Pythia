import type { BrowserContext, Route } from '@playwright/test'

/**
 * A tiny in-memory stand-in for the parts of Supabase that Pythia uses (GoTrue password auth and
 * the `records` table with the last-write-wins trigger), so the real browser client can be tested
 * end to end without a project. Share one instance between browser contexts to simulate several
 * devices talking to one cloud.
 */
export const FAKE_URL = 'https://fake.supabase.test'

interface User {
  id: string
  email: string
  password: string
}
export interface Row {
  user_id: string
  kind: string
  key: string
  data: unknown
  deleted: boolean
  updated_at: number
  seq: number
}

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' }

export class FakeSupabase {
  users: User[] = []
  rows = new Map<string, Row>()
  seq = 0
  /** Sign-up answers with "check your email" instead of a session. */
  confirmEmails = false
  rejectRest = false
  restCalls = { push: 0, pull: 0 }

  private token(u: User) {
    const exp = Math.floor(Date.now() / 1000) + 3600
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', exp })}.sig`
  }
  private userJson(u: User) {
    return { id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, email_confirmed_at: new Date().toISOString(), app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
  }
  private session(u: User) {
    return { access_token: this.token(u), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: `r-${u.id}`, user: this.userJson(u) }
  }
  private userFrom(route: Route): User | undefined {
    const auth = route.request().headers()['authorization']?.replace('Bearer ', '') ?? ''
    try {
      const sub = JSON.parse(Buffer.from(auth.split('.')[1] ?? '', 'base64url').toString()).sub
      return this.users.find((u) => u.id === sub)
    } catch {
      return undefined
    }
  }

  rowsFor(email: string, kind?: string) {
    const u = this.users.find((x) => x.email === email)
    return [...this.rows.values()].filter((r) => r.user_id === u?.id && (!kind || r.kind === kind))
  }

  async attach(context: BrowserContext) {
    await context.route(`${FAKE_URL}/**`, (route) => void this.handle(route))
  }

  private async handle(route: Route) {
    const req = route.request()
    const url = new URL(req.url())
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const body = req.postData() ? (JSON.parse(req.postData()!) as Record<string, unknown>) : {}
    const path = url.pathname

    if (path === '/auth/v1/signup') {
      const email = String(body.email)
      if (this.users.some((u) => u.email === email)) return json(200, { id: 'x', email }) // GoTrue hides duplicates
      const u: User = { id: crypto.randomUUID(), email, password: String(body.password) }
      this.users.push(u)
      return json(200, this.confirmEmails ? this.userJson(u) : this.session(u))
    }
    if (path === '/auth/v1/token') {
      const grant = url.searchParams.get('grant_type')
      if (grant === 'password') {
        const u = this.users.find((x) => x.email === body.email && x.password === body.password)
        return u ? json(200, this.session(u)) : json(400, { error: 'invalid_grant', error_code: 'invalid_credentials', error_description: 'Invalid login credentials', msg: 'Invalid login credentials' })
      }
      const u = this.users.find((x) => `r-${x.id}` === body.refresh_token)
      return u ? json(200, this.session(u)) : json(400, { error: 'invalid_grant', error_description: 'Invalid Refresh Token' })
    }
    if (path === '/auth/v1/user') {
      const u = this.userFrom(route)
      return u ? json(200, this.userJson(u)) : json(401, { msg: 'invalid JWT' })
    }
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, headers: CORS })
    if (path === '/auth/v1/recover') return json(200, {})

    const user = this.userFrom(route)
    if (path.startsWith('/rest/v1/')) {
      if (this.rejectRest) return json(500, { message: 'boom' })
      if (!user) return json(401, { message: 'JWT expired' })
      if (path === '/rest/v1/rpc/delete_my_account') {
        this.users = this.users.filter((u) => u.id !== user.id)
        for (const [k, r] of this.rows) if (r.user_id === user.id) this.rows.delete(k)
        // (PostgREST answers a void function with 204; Chromium under Playwright drops a bodiless 204 to a cross-origin POST.)
        return json(200, null)
      }
      if (path === '/rest/v1/records' && req.method() === 'POST') {
        this.restCalls.push++
        for (const r of body as unknown as Omit<Row, 'seq'>[]) {
          if (r.user_id !== user.id) return json(403, { message: 'new row violates row-level security policy' })
          const id = `${r.user_id}/${r.kind}/${r.key}`
          const old = this.rows.get(id)
          if (old && r.updated_at <= old.updated_at) continue // the LWW trigger
          this.rows.set(id, { ...r, seq: ++this.seq })
        }
        return route.fulfill({ status: 201, headers: CORS })
      }
      if (path === '/rest/v1/records' && req.method() === 'GET') {
        this.restCalls.pull++
        const after = Number(/gt\.(\d+)/.exec(url.searchParams.get('seq') ?? '')?.[1] ?? 0)
        const limit = Number(url.searchParams.get('limit') ?? 1000)
        const rows = [...this.rows.values()].filter((r) => r.user_id === user.id && r.seq > after).sort((a, b) => a.seq - b.seq).slice(0, limit)
        return json(200, rows)
      }
    }
    return json(404, { message: `fake supabase: unhandled ${req.method()} ${path}` })
  }
}
