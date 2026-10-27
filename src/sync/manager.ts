import type { Session } from '@supabase/supabase-js'
import { liveQuery } from 'dexie'
import { db } from '@/data/db'
import { hydrateStores } from '@/data/syncStores'
import { friendlyAuthError, isNetworkError } from '@/sync/authErrors'
import { getClient } from '@/sync/client'
import { authRedirect, isCloudConfigured } from '@/sync/config'
import { enqueueAll, getMeta, installOutboxHooks, pairAndMerge, pairAndReplace, setMeta, syncOnce, unpair } from '@/sync/engine'
import { supabaseRemote } from '@/sync/remote'
import { useCloud } from '@/sync/store'

/**
 * Wires the sync engine to Supabase auth and to the browser: who is signed in, when to sync
 * (after a change, on reconnect, on returning to the tab, every minute), and the one-time
 * question on a device's first sign-in. Loaded only when accounts are configured.
 */

const SYNC_DEBOUNCE_MS = 3000
const POLL_MS = 60_000
const BACKOFF_MS = [15_000, 30_000, 60_000, 120_000, 300_000]

const patch = useCloud.getState().set
let paired = false
let handledUser: string | null = null
let running: Promise<void> | null = null
let again = false
let timer: ReturnType<typeof setTimeout> | undefined
let failures = 0
let started = false

// ───────────── sync scheduling ─────────────
export function requestSync(delay = SYNC_DEBOUNCE_MS): void {
  clearTimeout(timer)
  timer = setTimeout(() => void runSync(), delay)
}

async function runSync(): Promise<void> {
  const { user } = useCloud.getState()
  if (!user || !paired) return
  if (running) {
    again = true
    return running
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    patch({ phase: 'offline' })
    return
  }
  running = (async () => {
    const startedAt = Date.now()
    patch({ phase: 'syncing' })
    try {
      if ((await getMeta<string>(db, 'syncUser')) !== user.id) return
      const client = await getClient()
      const { pull } = await syncOnce(db, supabaseRemote(client, user.id))
      await setMeta(db, 'lastPushAt', startedAt)
      await setMeta(db, 'lastSyncAt', Date.now())
      failures = 0
      patch({ phase: 'idle', lastSyncAt: Date.now(), error: null })
      // Settings and the playground live in memory stores; reload them if the cloud changed them.
      if (pull.changed.has('settings') || pull.changed.has('workspace')) await hydrateStores()
    } catch (e) {
      const offline = isNetworkError(e)
      patch({ phase: offline ? 'offline' : 'error', error: offline ? null : friendlyAuthError(e) })
      requestSync(BACKOFF_MS[Math.min(failures++, BACKOFF_MS.length - 1)])
    }
  })().finally(() => {
    running = null
    if (again) {
      again = false
      requestSync(1000)
    }
  })
  return running
}

// ───────────── pairing this device with the account ─────────────
async function localSummary() {
  const [lessons, attempts, quizzes, snippets, drafts, achievements, workspace] = await Promise.all([
    db.lessonProgress.count(),
    db.attempts.count(),
    db.quizResults.count(),
    db.snippets.count(),
    db.drafts.count(),
    db.achievements.count(),
    db.workspace.count(),
  ])
  return { lessons, attempts, hasData: lessons + attempts + quizzes + snippets + drafts + achievements + workspace > 0 }
}

async function attach(user: { id: string; email: string }): Promise<void> {
  if ((await getMeta<string>(db, 'syncUser')) === user.id) {
    paired = true
    await enqueueAll(db, (await getMeta<number>(db, 'lastPushAt')) ?? 0) // anything written before the hooks were ready
    patch({ phase: 'idle', lastSyncAt: (await getMeta<number>(db, 'lastSyncAt')) ?? null })
    return requestSync(0)
  }
  if ((await getMeta<string>(db, 'declined')) === user.id) return void patch({ phase: 'paused' })

  const local = await localSummary()
  if (!local.hasData) {
    // Nothing here to lose or to upload: just follow the account.
    await pairAndMerge(db, user.id)
    paired = true
    patch({ phase: 'idle' })
    return requestSync(0)
  }
  let cloudHasData = true
  try {
    cloudHasData = (await supabaseRemote(await getClient(), user.id).pull(0, 1)).length > 0
  } catch {
    /* can't tell: offer the safe choices */
  }
  patch({ phase: 'paused', choice: { cloudHasData, local: { lessons: local.lessons, attempts: local.attempts } } })
}

export async function resolveChoice(choice: 'merge' | 'replace' | 'later'): Promise<void> {
  const { user } = useCloud.getState()
  if (!user) return
  if (choice === 'later') {
    await setMeta(db, 'declined', user.id)
    return void patch({ choice: null, phase: 'paused' })
  }
  patch({ choice: null, phase: 'syncing' })
  await db.meta.delete('declined')
  if (choice === 'merge') await pairAndMerge(db, user.id)
  else await pairAndReplace(db, user.id)
  paired = true
  await runSync()
  if (choice === 'replace') await hydrateStores()
}

/** From the profile page: the learner changed their mind after "not now". */
export async function enableSync(): Promise<void> {
  const { user } = useCloud.getState()
  if (!user) return
  await db.meta.delete('declined')
  handledUser = null
  await handleSession(user)
}

// ───────────── session ─────────────
async function handleSession(user: { id: string; email?: string | null } | null): Promise<void> {
  patch({ user: user ? { id: user.id, email: user.email ?? '' } : null, ready: true })
  if (!user) {
    handledUser = null
    clearTimeout(timer)
    return void patch({ phase: 'off', choice: null, error: null, pending: 0 })
  }
  if (handledUser === user.id) return
  handledUser = user.id
  await attach({ id: user.id, email: user.email ?? '' })
}

export async function startCloud(): Promise<void> {
  if (!isCloudConfigured || started) return
  started = true
  installOutboxHooks(db, () => paired)
  paired = Boolean(await getMeta<string>(db, 'syncUser'))
  const returned = /[?&](code|error_description)=/.test(window.location.search)
  patch({ returned })

  const client = await getClient()
  client.auth.onAuthStateChange((event, session: Session | null) => {
    if (event === 'PASSWORD_RECOVERY') patch({ recovery: true })
    // The SDK holds a lock while this runs; calling back into it here would deadlock, so defer.
    setTimeout(() => void handleSession(session?.user ?? null), 0)
  })
  const { data } = await client.auth.getSession()
  await handleSession(data.session?.user ?? null)

  window.addEventListener('online', () => requestSync(500))
  window.addEventListener('offline', () => useCloud.getState().user && patch({ phase: 'offline' }))
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && requestSync(500))
  setInterval(() => document.visibilityState === 'visible' && requestSync(0), POLL_MS)
  liveQuery(() => db.outbox.count()).subscribe({
    next: (pending) => {
      patch({ pending })
      if (pending > 0 && paired) requestSync()
    },
    error: () => undefined,
  })
}

// ───────────── account actions ─────────────
export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: string }

async function guard<T>(run: () => PromiseLike<{ error: unknown } & T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const result = await run()
    return result.error ? { ok: false, error: friendlyAuthError(result.error) } : { ok: true, data: result }
  } catch (e) {
    return { ok: false, error: friendlyAuthError(e) }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const client = await getClient()
  const r = await guard(() => client.auth.signInWithPassword({ email: email.trim(), password }))
  return r.ok ? { ok: true } : r
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const client = await getClient()
  const r = await guard(() => client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: authRedirect() } }))
  // With email confirmation on there is no session yet; the learner must click the emailed link.
  return r.ok ? { ok: true, needsConfirmation: !r.data.data.session } : r
}

export async function signInWithProvider(provider: 'github' | 'google'): Promise<AuthResult> {
  const client = await getClient()
  const r = await guard(() => client.auth.signInWithOAuth({ provider, options: { redirectTo: authRedirect() } }))
  return r.ok ? { ok: true } : r
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const client = await getClient()
  const r = await guard(() => client.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirect() }))
  return r.ok ? { ok: true } : r
}

export async function setNewPassword(password: string): Promise<AuthResult> {
  const client = await getClient()
  const r = await guard(() => client.auth.updateUser({ password }))
  if (r.ok) patch({ recovery: false })
  return r.ok ? { ok: true } : r
}

export async function signOut(): Promise<void> {
  const client = await getClient()
  await client.auth.signOut()
  await handleSession(null)
}

/** Erase the account and everything in it from the cloud. This device's own data stays. */
export async function deleteAccount(): Promise<AuthResult> {
  const client = await getClient()
  const r = await guard(() => client.rpc('delete_my_account'))
  if (!r.ok) return r
  await unpair(db)
  paired = false
  await client.auth.signOut({ scope: 'local' }).catch(() => undefined)
  await handleSession(null)
  return { ok: true }
}

export const syncNow = () => runSync()
