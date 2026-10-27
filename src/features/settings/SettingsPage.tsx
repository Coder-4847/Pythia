import { DataManagement } from '@/features/settings/DataManagement'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

/** The full settings (theme, editor, Pythia) arrive in a later phase; data management is here first. */
export default function SettingsPage() {
  useDocumentTitle('Settings')
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <h1 className="font-serif text-5xl tracking-tight">Settings</h1>
      <div className="mt-10">
        <DataManagement />
      </div>
    </div>
  )
}
