import { Link } from 'react-router-dom'
import { PageShell } from '@/components/ui/PageShell'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { isCloudConfigured } from '@/sync/config'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-muted">{children}</div>
    </section>
  )
}

/** Plain-language and specific: it says exactly what the app does today. Update it with every feature that touches data. */
export default function PrivacyPage() {
  useDocumentTitle('Privacy')
  return (
    <PageShell eyebrow="Privacy" title="What happens to your data" narrow subtitle="Short version: your learning stays on your device, and we run no analytics.">
      <Section title="What stays on your device">
        <p>
          Your progress, attempts, code, settings and playground files are stored in your browser (IndexedDB). There is no account and nothing is uploaded. Clearing site data, or <Link to="/settings" className="text-gold hover:underline">resetting in Settings</Link>, removes it. Use{' '}
          <Link to="/settings" className="text-gold hover:underline">export</Link> to keep a copy.
        </p>
        <p>Python runs in a Web Worker in your browser. Your code is never sent anywhere in order to run it.</p>
      </Section>

      <Section title="The optional AI layer">
        <p>
          If the site’s owner has configured an AI proxy and the AI layer is switched on in{' '}
          <Link to="/settings" className="text-gold hover:underline">Settings</Link>, then when you pause typing and the built-in checks found nothing, the code in your editor, the exercise prompt and, after a crash, the last error message are sent to
          that proxy, which forwards them to Anthropic to write a question. The proxy does not log or store your code. Anthropic processes it under its own terms. Switch the AI layer off and nothing is sent. Without a configured proxy the app never makes this request.
        </p>
      </Section>

      <Section title="Third-party requests">
        <p>
          The Python runtime (Pyodide) is downloaded from the jsDelivr CDN the first time you run code, unless the site is self-hosting it, and your browser caches it. That request reveals your IP address and browser to the CDN, as any download does. Fonts and
          everything else are served from this site.
        </p>
        <p>
          The first visit may reload once while a small service worker installs; it exists only to enable features Python’s <code className="font-mono text-fg">input()</code> needs and stores no personal data.
        </p>
      </Section>

      <Section title="What we don’t do">
        <p>No analytics, no advertising, no tracking cookies, no fingerprinting. Share links for the playground put the code inside the link’s fragment, which browsers never send to a server.</p>
      </Section>

      <Section title="Accounts">
        {isCloudConfigured ? (
          <>
            <p>
              Accounts are optional and only add syncing between your devices. If you create one, we store your <strong className="text-fg">email address</strong> and a salted hash of your password (or, if you sign in with GitHub or Google, the email that provider shares). The
              account system is Supabase; the site’s owner runs the database.
            </p>
            <p>
              Once you’re signed in and have chosen to sync, a copy of your learning data is uploaded and kept up to date: lesson progress, every exercise attempt <em>including the code you wrote</em>, quiz results, drafts, snippets, playground files, achievements, your display name, daily goal and settings.
              Each row is protected by database rules so that only your own account can read or change it. Whoever administers the database could still technically read it, which is why nothing beyond that list is ever uploaded and you shouldn’t put secrets in your code.
            </p>
            <p>
              Sign out and nothing more is uploaded. <Link to="/profile" className="text-gold hover:underline">Delete account</Link> on the profile page erases your account and all cloud data immediately. Your data on this device is never touched by either.
            </p>
          </>
        ) : (
          <p>Optional cloud accounts are not switched on for this copy of Pythia, so nothing is ever uploaded and there is nothing to sign in to.</p>
        )}
      </Section>
    </PageShell>
  )
}
