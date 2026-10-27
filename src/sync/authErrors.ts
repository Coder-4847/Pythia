export const MIN_PASSWORD = 8

/** `null` when the password is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (password.length > 72) return 'Use at most 72 characters.'
  return null
}

export const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

/** A request that never reached the server (offline, blocked, DNS), as opposed to the server saying no. */
export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
  const msg = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error)
  return error instanceof TypeError || /failed to fetch|networkerror|load failed|network request failed|fetch failed/i.test(msg)
}

/**
 * Turn Supabase's messages into something a learner can act on. Sign-in failures stay vague on
 * purpose: they must not reveal whether an email address has an account.
 */
export function friendlyAuthError(error: unknown): string {
  if (isNetworkError(error)) return 'Can’t reach the server. Check your connection and try again.'
  const msg = (error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? '')).toLowerCase()
  if (/invalid login|invalid credentials/.test(msg)) return 'That email and password don’t match.'
  if (/email not confirmed/.test(msg)) return 'Confirm your email first: we sent you a link when you signed up.'
  if (/rate limit|too many|security purposes/.test(msg)) return 'Too many tries. Wait a minute and try again.'
  if (/password.*(short|least|weak|characters)|weak password/.test(msg)) return `Choose a stronger password (at least ${MIN_PASSWORD} characters).`
  if (/same.*password|different from the old/.test(msg)) return 'Choose a password you haven’t used for this account before.'
  if (/provider.*(not enabled|disabled)|unsupported provider/.test(msg)) return 'That sign-in method isn’t turned on for this site.'
  if (/signups? not allowed|signup.*disabled/.test(msg)) return 'New accounts are turned off for this site.'
  if (/jwt|session.*(missing|expired)|not authenticated/.test(msg)) return 'Your session has ended. Please sign in again.'
  return 'Something went wrong. Please try again.'
}
