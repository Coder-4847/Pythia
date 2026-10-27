import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  applyImport,
  buildExport,
  parseExport,
  previewImport,
  resetAllData,
  type ExportFile,
  type ImportMode,
  type TablePreview,
} from '@/data/exportImport'
import { hydrateStores } from '@/data/syncStores'
import { cn } from '@/lib/cn'
import { useToast } from '@/stores/toast'

const APP_VERSION = '0.1.0'

type Staged = { file: ExportFile; name: string; migratedFrom: number | null }

function PreviewTable({ rows, mode }: { rows: TablePreview[]; mode: ImportMode }) {
  const visible = rows.filter((r) => r.incoming || r.removed)
  if (!visible.length) return <p className="mt-3 text-sm text-muted">This file has nothing to import.</p>
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">What this import would change</caption>
        <thead className="bg-raised/60 font-mono text-[11px] uppercase tracking-wider text-dim">
          <tr>
            <th className="px-3 py-2 font-medium">Data</th>
            <th className="px-3 py-2 font-medium">In file</th>
            <th className="px-3 py-2 font-medium">New</th>
            <th className="px-3 py-2 font-medium">Updated</th>
            <th className="px-3 py-2 font-medium">{mode === 'merge' ? 'Kept (yours is newer)' : 'Removed'}</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.table} className="border-t border-line">
              <td className="px-3 py-2">{r.label}</td>
              <td className="px-3 py-2 font-mono">{r.incoming}</td>
              <td className={cn('px-3 py-2 font-mono', r.added > 0 && 'text-ok')}>{r.added}</td>
              <td className={cn('px-3 py-2 font-mono', r.updated > 0 && 'text-gold')}>{r.updated}</td>
              <td className={cn('px-3 py-2 font-mono', mode === 'replace' && r.removed > 0 && 'text-bad')}>{mode === 'merge' ? r.keptLocal : r.removed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Export, import (with preview) and reset: the learner's data is theirs to move or erase. */
export function DataManagement() {
  const show = useToast((s) => s.show)
  const picker = useRef<HTMLInputElement>(null)
  const [staged, setStaged] = useState<Staged | null>(null)
  const [mode, setMode] = useState<ImportMode>('merge')
  const [preview, setPreview] = useState<TablePreview[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [confirm, setConfirm] = useState<'replace' | 'reset' | null>(null)
  const [busy, setBusy] = useState(false)

  const download = async () => {
    const file = await buildExport(APP_VERSION)
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `pythia-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    show('Export downloaded')
  }

  const refreshPreview = async (file: ExportFile, m: ImportMode) => setPreview(await previewImport(file, m))

  const onFile = async (file: File | undefined) => {
    setErrors([])
    setStaged(null)
    setPreview(null)
    if (!file) return
    const result = parseExport(await file.text())
    if (!result.ok) return setErrors(result.errors)
    setStaged({ file: result.file, name: file.name, migratedFrom: result.migratedFrom })
    await refreshPreview(result.file, mode)
  }

  const apply = async () => {
    if (!staged) return
    setBusy(true)
    try {
      await applyImport(staged.file, mode)
      await hydrateStores()
      show(mode === 'merge' ? 'Import merged into your data' : 'Your data was replaced')
      setStaged(null)
      setPreview(null)
    } catch {
      setErrors(['The import failed and nothing was changed. Try again, or export your current data first.'])
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const reset = async () => {
    await resetAllData()
    await hydrateStores()
    setConfirm(null)
    show('All data on this device was deleted')
  }

  return (
    <section aria-labelledby="data-heading" className="rounded-2xl border border-line bg-surface p-6">
      <h2 id="data-heading" className="text-xl font-medium">Your data</h2>
      <p className="mt-1 text-sm text-muted">Everything lives in this browser. Export it to back up or move to another device.</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => void download()}>
          Export all data
        </Button>
        <Button onClick={() => picker.current?.click()}>Import from file…</Button>
        <input ref={picker} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose a Pythia export file" onChange={(e) => void onFile(e.target.files?.[0])} />
      </div>

      {errors.length > 0 && (
        <div role="alert" className="mt-4 rounded-xl border border-bad/40 bg-bad/10 p-4 text-sm text-bad">
          <p className="font-medium">That file can’t be imported</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {staged && (
        <div className="mt-6 rounded-xl border border-line-strong p-4">
          <p className="text-sm">
            <span className="font-medium">{staged.name}</span>
            {staged.migratedFrom !== null && <span className="text-dim"> · upgraded from an older format (v{staged.migratedFrom})</span>}
          </p>
          <fieldset className="mt-3">
            <legend className="sr-only">How to import</legend>
            <div className="flex flex-wrap gap-2">
              {(['merge', 'replace'] as const).map((m) => (
                <label key={m} className={cn('cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors', mode === m ? 'border-gold bg-gold/10' : 'border-line hover:border-line-strong')}>
                  <input
                    type="radio"
                    name="import-mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => {
                      setMode(m)
                      void refreshPreview(staged.file, m)
                    }}
                    className="sr-only"
                  />
                  {m === 'merge' ? 'Merge (keep whichever is newer)' : 'Replace everything'}
                </label>
              ))}
            </div>
          </fieldset>
          {preview && <PreviewTable rows={preview} mode={mode} />}
          <div className="mt-4 flex gap-3">
            <Button variant="primary" disabled={busy} onClick={() => (mode === 'replace' ? setConfirm('replace') : void apply())}>
              {mode === 'merge' ? 'Merge into my data' : 'Replace my data'}
            </Button>
            <Button variant="ghost" onClick={() => { setStaged(null); setPreview(null) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <hr className="my-6 border-line" />
      <h3 className="font-medium text-bad">Danger zone</h3>
      <p className="mt-1 text-sm text-muted">Deletes all progress, code and settings stored on this device. Export first if you may want them back.</p>
      <Button className="mt-4 border-bad/50 text-bad hover:border-bad" onClick={() => setConfirm('reset')}>
        Reset all data…
      </Button>

      <ConfirmDialog
        open={confirm === 'replace'}
        title="Replace all your data?"
        confirmLabel="Replace"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => void apply()}
      >
        Everything on this device that isn’t in the file will be removed. This can’t be undone.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'reset'}
        title="Delete everything on this device?"
        confirmLabel="Delete everything"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => void reset()}
      >
        Your progress, saved code, snippets and settings will be erased. This can’t be undone.
      </ConfirmDialog>
    </section>
  )
}
