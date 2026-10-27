import { describe, expect, it, vi } from 'vitest'
import { friendlyAuthError, isNetworkError, looksLikeEmail, passwordProblem } from '@/sync/authErrors'

describe('authErrors', () => {
  it('validates passwords', () => {
    expect(passwordProblem('short')).toMatch(/at least 8/)
    expect(passwordProblem('long enough')).toBeNull()
    expect(passwordProblem('x'.repeat(73))).toMatch(/at most 72/)
  })

  it('recognises email-shaped input', () => {
    expect(looksLikeEmail(' a@b.co ')).toBe(true)
    expect(looksLikeEmail('a@b')).toBe(false)
    expect(looksLikeEmail('a b@c.de')).toBe(false)
  })

  it('tells network failures from server answers', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isNetworkError({ message: 'Invalid login credentials' })).toBe(false)
    vi.stubGlobal('navigator', { onLine: false })
    expect(isNetworkError({ message: 'anything' })).toBe(true)
    vi.unstubAllGlobals()
  })

  it('translates common failures and never leaks which half of a login was wrong', () => {
    expect(friendlyAuthError({ message: 'Invalid login credentials' })).toBe('That email and password don’t match.')
    expect(friendlyAuthError({ message: 'Email not confirmed' })).toMatch(/Confirm your email/)
    expect(friendlyAuthError({ message: 'email rate limit exceeded' })).toMatch(/Too many/)
    expect(friendlyAuthError({ message: 'Password should be at least 6 characters' })).toMatch(/stronger password/)
    expect(friendlyAuthError({ message: 'Unsupported provider: provider is not enabled' })).toMatch(/isn’t turned on/)
    expect(friendlyAuthError({ message: 'weird internal stack trace at line 42' })).toBe('Something went wrong. Please try again.')
  })
})
