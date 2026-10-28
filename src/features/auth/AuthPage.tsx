import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/brand/Logo'
import { Button, buttonClass } from '@/components/ui/Button'
import { friendlyAuthError, looksLikeEmail, passwordProblem } from '@/sync/authErrors'
import { sendPasswordReset, setNewPassword, signIn, signInWithProvider, signUp } from '@/sync/actions'
import { useCloud } from '@/sync/store'
import { useToast } from '@/stores/toast'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset'

const COPY: Record<AuthMode, { title: string; lead: string }> = {
  signin: { title: 'Welcome back', lead: 'Sign in to pick up where you left off on any device.' },
  signup: { title: 'Create your account', lead: 'Optional. It only adds syncing between devices; Pythia works the same without it.' },
  forgot: { title: 'Reset your password', lead: 'Enter your email and we’ll send a link to choose a new one.' },
  reset: { title: 'Choose a new password', lead: 'You followed a recovery link, so you’re signed in. Set a new password to finish.' },
}

function Frame({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const { title, lead } = COPY[mode]
  return (
    <section className="mx-auto w-full max-w-md px-6 py-14 sm:py-20">
      <LogoMark size={44} />
      <h1 className="mt-6 font-serif text-5xl tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">{lead}</p>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Field({ id, label, hint, ...input }: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} {...input} className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-raised/60 px-3 text-[15px] outline-none placeholder:text-dim focus:border-gold" />
      {hint && <p className="mt-1.5 text-xs text-dim">{hint}</p>}
    </div>
  )
}

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.5 12.27c0-.8-.07-1.56-.2-2.3H12v4.35h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.55c2.08-1.91 3.24-4.73 3.24-8.11Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.55-2.75c-.98.66-2.24 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.55H2.16v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.83 14.08a6.6 6.6 0 0 1 0-4.16V7.08H2.16a11 11 0 0 0 0 9.84l3.67-2.84Z" />
    <path fill="#EA4335" d="M12 5.37c1.62 0 3.07.56 4.21 1.65l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.16 7.08l3.67 2.84C6.7 7.31 9.13 5.37 12 5.37Z" />
  </svg>
)

function Unavailable() {
  return (
    <section className="mx-auto w-full max-w-md px-6 py-20">
      <LogoMark size={44} />
      <h1 className="mt-6 font-serif text-5xl tracking-tight">No account needed</h1>
      <p className="mt-3 text-muted">
        Accounts aren’t switched on for this copy of Pythia, so your progress is saved on this device only. Everything else works exactly the same. You can still{' '}
        <Link to="/settings" className="text-gold underline underline-offset-4">
          export your data
        </Link>{' '}
        to move it elsewhere.
      </p>
      <Link to="/learn" className={buttonClass('primary', 'md', 'mt-8')}>
        Continue as guest
      </Link>
    </section>
  )
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  useDocumentTitle(COPY[mode].title)
  const configured = useCloud((s) => s.configured)
  const user = useCloud((s) => s.user)
  const recovery = useCloud((s) => s.recovery)
  const navigate = useNavigate()
  const show = useToast((s) => s.show)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reveal, setReveal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'confirm' | 'reset-sent' | null>(null)

  // Signing in (here or via a redirect) takes you into the app.
  useEffect(() => {
    if (user && mode !== 'reset') navigate('/dashboard', { replace: true })
  }, [user, mode, navigate])

  if (!configured) return <Unavailable />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode !== 'reset' && !looksLikeEmail(email)) return setError('Enter a valid email address.')
    if (mode === 'signup' || mode === 'reset') {
      const problem = passwordProblem(password)
      if (problem) return setError(problem)
    }
    if (mode === 'reset' && password !== confirm) return setError('The two passwords don’t match.')
    if (mode === 'signin' && !password) return setError('Enter your password.')

    setBusy(true)
    try {
      if (mode === 'forgot') {
        const r = await sendPasswordReset(email)
        // Same answer whether or not the address has an account, so this form can't be used to find out.
        if (!r.ok && /connect|server/i.test(r.error)) setError(r.error)
        else setDone('reset-sent')
      } else if (mode === 'signup') {
        const r = await signUp(email, password)
        if (!r.ok) setError(r.error)
        else if (r.needsConfirmation) setDone('confirm')
        else show('Account created')
      } else if (mode === 'signin') {
        const r = await signIn(email, password)
        if (!r.ok) setError(r.error)
        else show('Signed in')
      } else {
        const r = await setNewPassword(password)
        if (!r.ok) setError(r.error)
        else {
          show('Password updated')
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  const oauth = async (provider: 'github' | 'google') => {
    setError(null)
    const r = await signInWithProvider(provider)
    if (!r.ok) setError(r.error)
  }

  if (done === 'confirm')
    return (
      <Frame mode={mode}>
        <div role="status" className="rounded-2xl border border-gold/40 bg-surface p-6">
          <p className="font-medium">Check your email</p>
          <p className="mt-2 text-sm text-muted">
            We sent a confirmation link to <span className="text-fg">{email}</span>. Open it, then come back and sign in.
          </p>
        </div>
        <Link to="/signin" className={buttonClass('secondary', 'md', 'mt-6')}>
          Go to sign in
        </Link>
      </Frame>
    )
  if (done === 'reset-sent')
    return (
      <Frame mode={mode}>
        <div role="status" className="rounded-2xl border border-gold/40 bg-surface p-6">
          <p className="font-medium">If that address has an account, a link is on its way.</p>
          <p className="mt-2 text-sm text-muted">It can take a minute. Check your spam folder if it doesn’t arrive.</p>
        </div>
        <Link to="/signin" className={buttonClass('secondary', 'md', 'mt-6')}>
          Back to sign in
        </Link>
      </Frame>
    )
  if (mode === 'reset' && !recovery)
    return (
      <Frame mode={mode}>
        <p className="text-muted">This page works from the link in a password-recovery email. Request a new one if yours has expired.</p>
        <Link to="/forgot" className={buttonClass('primary', 'md', 'mt-6')}>
          Send me a link
        </Link>
      </Frame>
    )

  const needsPassword = mode !== 'forgot'
  return (
    <Frame mode={mode}>
      {(mode === 'signin' || mode === 'signup') && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => void oauth('github')} className="h-11 justify-center">
              <GitHubIcon /> GitHub
            </Button>
            <Button onClick={() => void oauth('google')} className="h-11 justify-center">
              <GoogleIcon /> Google
            </Button>
          </div>
          <p className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-dim before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or</p>
        </>
      )}

      <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5">
        {mode !== 'reset' && <Field id="email" label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />}
        {needsPassword && (
          <>
            <Field
              id="password"
              label={mode === 'reset' ? 'New password' : 'Password'}
              type={reveal ? 'text' : 'password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={mode === 'signin' ? undefined : 'At least 8 characters.'}
              required
            />
            {mode === 'reset' && <Field id="confirm" label="Repeat the new password" type={reveal ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />}
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} className="size-4 accent-[var(--c-gold)]" />
              Show password
            </label>
          </>
        )}
        <p role="alert" className="min-h-5 text-sm text-bad">
          {error}
        </p>
        <Button type="submit" variant="primary" size="lg" disabled={busy} className="w-full">
          {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Save new password'}
        </Button>
      </form>

      <nav aria-label="Account help" className="mt-6 space-y-2 text-sm text-muted">
        {mode === 'signin' && (
          <>
            <p>
              New here?{' '}
              <Link to="/signup" className="text-gold underline underline-offset-4">
                Create an account
              </Link>
            </p>
            <p>
              <Link to="/forgot" className="text-gold underline underline-offset-4">
                Forgot your password?
              </Link>
            </p>
          </>
        )}
        {mode === 'signup' && (
          <p>
            Already have an account?{' '}
            <Link to="/signin" className="text-gold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        )}
        {mode === 'forgot' && (
          <p>
            <Link to="/signin" className="text-gold underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        )}
        {mode !== 'reset' && (
          <p>
            <Link to="/learn" className="underline underline-offset-4 hover:text-fg">
              Continue as guest
            </Link>{' '}
            · your progress stays on this device
          </p>
        )}
      </nav>
      {mode === 'signup' && (
        <p className="mt-6 text-xs text-dim">
          By creating an account you agree that your progress will be stored in the cloud, as described in the{' '}
          <Link to="/privacy" className="underline underline-offset-4">
            privacy page
          </Link>
          .
        </p>
      )}
    </Frame>
  )
}
