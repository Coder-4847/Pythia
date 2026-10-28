import { PageShell } from '@/components/ui/PageShell'
import { ProfileFields } from '@/features/profile/ProfilePage'
import { DataManagement } from '@/features/settings/DataManagement'
import { cn } from '@/lib/cn'
import { OFFLINE_TEXT, useOfflineStatus } from '@/lib/useOfflineStatus'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useSettings, type SettingsValues } from '@/stores/settings'
import { useTheme, type Theme } from '@/stores/theme'

interface Choice<T extends string | number> {
  value: T
  label: string
  hint?: string
}

function Segmented<T extends string | number>({ name, label, value, options, onChange }: { name: string; label: string; value: T; options: Choice<T>[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-full border border-line-strong bg-raised/50 p-1">
        {options.map((o) => (
          <label
            key={o.value}
            title={o.hint}
            className={cn(
              'cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold',
              value === o.value ? 'bg-gold text-gold-ink' : 'text-muted hover:text-fg',
            )}
          >
            <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Row({ id, title, help, children }: { id: string; title: string; help: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-line py-5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="max-w-md">
        <p id={id} className="text-sm font-medium">
          {title}
        </p>
        <p className="mt-1 text-sm text-muted">{help}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Group({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="font-serif text-2xl">
        {title}
      </h2>
      <div className="mt-4 rounded-2xl border border-line bg-surface px-6">{children}</div>
    </section>
  )
}

export const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20] as const

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)
  const s = useSettings()
  const set = (patch: Partial<SettingsValues>) => s.set(patch)
  const offline = useOfflineStatus()

  return (
    <PageShell eyebrow="Settings" title="Settings" subtitle="Changes save automatically, on this device." narrow>
      <Group id="g-look" title="Appearance">
        <Row id="r-theme" title="Theme" help="Dark is the default. Light has the same contrast guarantees.">
          <Segmented<Theme> name="theme" label="Theme" value={theme} onChange={setTheme} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} />
        </Row>
        <Row id="r-motion" title="Reduced motion" help="Follow your system setting, or force animations off or on.">
          <Segmented name="motion" label="Reduced motion" value={s.reducedMotion} onChange={(v) => set({ reducedMotion: v })} options={[{ value: 'system', label: 'System' }, { value: 'on', label: 'Reduce' }, { value: 'off', label: 'Full' }]} />
        </Row>
      </Group>

      <Group id="g-editor" title="Editor">
        <Row id="r-font" title="Font size" help="For the lesson and playground editors.">
          <select aria-labelledby="r-font" value={s.editorFontSize} onChange={(e) => set({ editorFontSize: Number(e.target.value) })} className="h-10 rounded-lg border border-line-strong bg-raised/60 px-3 text-sm outline-none focus:border-gold">
            {FONT_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} px
              </option>
            ))}
          </select>
        </Row>
        <Row id="r-keys" title="Keybindings" help="Vim mode loads on demand the first time you turn it on.">
          <Segmented name="keys" label="Keybindings" value={s.keybindings} onChange={(v) => set({ keybindings: v })} options={[{ value: 'default', label: 'Default' }, { value: 'vim', label: 'Vim' }]} />
        </Row>
      </Group>

      <Group id="g-pythia" title="Pythia">
        <Row id="r-intensity" title="How much Pythia says" help="Quiet: only certain crashes. Balanced: likely bugs too. Chatty: tidiness as well.">
          <Segmented name="intensity" label="Pythia intensity" value={s.pythiaIntensity} onChange={(v) => set({ pythiaIntensity: v })} options={[{ value: 'quiet', label: 'Quiet' }, { value: 'balanced', label: 'Balanced' }, { value: 'chatty', label: 'Chatty' }]} />
        </Row>
        <Row id="r-ai" title="AI layer" help="When on and configured, a snippet is sent to this site’s AI proxy once you pause typing. Off keeps everything on your device. See Privacy.">
          <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" role="switch" aria-labelledby="r-ai" checked={s.aiEnabled} onChange={(e) => set({ aiEnabled: e.target.checked })} className="size-5 accent-[var(--c-gold)]" />
            {s.aiEnabled ? 'On' : 'Off'}
          </label>
        </Row>
      </Group>

      <Group id="g-offline" title="Offline">
        <Row id="r-offline" title="Use without a connection" help="After your first visit the app and the Python runtime are saved in this browser.">
          <p role="status" data-testid="offline-status" className="max-w-xs text-sm text-muted">
            {offline ? OFFLINE_TEXT[offline] : 'Checking…'}
          </p>
        </Row>
      </Group>

      <Group id="g-you" title="You">
        <div className="py-6">
          <ProfileFields />
        </div>
      </Group>

      <div className="mt-10">
        <DataManagement />
      </div>
    </PageShell>
  )
}
