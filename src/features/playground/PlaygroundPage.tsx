import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Popover } from '@/components/ui/Popover'
import { SNIPPETS } from '@/content/snippets'
import { PythiaEditor } from '@/features/pythia/PythiaEditor'
import { FileTabs } from '@/features/playground/FileTabs'
import { decodeShare, encodeShare } from '@/features/playground/share'
import { usePlayground } from '@/features/playground/store'
import { Console } from '@/features/runtime/Console'
import { runtime, useRuntimeState } from '@/features/runtime/runtime'
import { RuntimePill } from '@/features/runtime/RuntimePill'
import { useRunner } from '@/features/runtime/useRunner'
import { useSettings } from '@/stores/settings'
import { useToast } from '@/stores/toast'
import type { SourceFile } from '@/workers/protocol'

/** A link longer than this may be truncated by chat apps and some browsers. */
const LONG_LINK_CHARS = 8000

function InstallPanel({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const packages = text.split(/[\s,]+/).filter(Boolean)
    if (!packages.length) return
    setBusy(true)
    setMessage(null)
    const result = await runtime.install(packages)
    setMessage({ ok: result.ok, text: result.message })
    setBusy(false)
    if (result.ok) setText('')
  }

  return (
    <form onSubmit={submit} className="w-80 p-4">
      <label htmlFor="pkg" className="text-sm font-medium">Install packages</label>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Pure-Python packages from PyPI, installed with micropip for this session. NumPy, pandas, matplotlib and
        scikit-learn load automatically when you import them.
      </p>
      <input
        id="pkg"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. rich, python-dateutil"
        autoComplete="off"
        spellCheck={false}
        className="mt-3 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-[13px] outline-none focus:border-gold"
      />
      <div className="mt-3 flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={busy || !text.trim()}>
          {busy ? 'Installing…' : 'Install'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      {message && (
        <p role="status" className={`mt-3 text-xs ${message.ok ? 'text-ok' : 'text-bad'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}

export default function PlaygroundPage() {
  const { files, activeId, stdin, setCode, setActive, setStdin, addFile, renameFile, deleteFile, replaceAll } = usePlayground()
  const { editorFontSize, keybindings } = useSettings()
  const runner = useRunner()
  const showToast = useToast((s) => s.show)
  const status = useRuntimeState((s) => s.status)
  const [params, setParams] = useSearchParams()
  const [incoming, setIncoming] = useState<SourceFile[] | null>(null)

  const active = files.find((f) => f.id === activeId) ?? files[0]!

  // Start loading Python as soon as the playground opens.
  useEffect(() => {
    void runtime.ensureReady().catch(() => {})
  }, [])

  // Open code from a share link (?c=…), asking first if it would overwrite real work.
  const shared = params.get('c')
  useEffect(() => {
    if (!shared) return
    let cancelled = false
    void decodeShare(shared).then((decoded) => {
      if (cancelled) return
      setParams({}, { replace: true })
      if (!decoded) return showToast('That share link is damaged, so it could not be opened.')
      if (usePlayground.getState().isPristine()) replaceAll(decoded)
      else setIncoming(decoded)
    })
    return () => {
      cancelled = true
    }
  }, [shared, setParams, replaceAll, showToast])

  const run = useCallback(() => {
    if (runner.running) return
    const { files: current, activeId: id, stdin: input } = usePlayground.getState()
    const file = current.find((f) => f.id === id) ?? current[0]!
    void runner.run(
      current.map(({ name, code }) => ({ name, code })),
      file.name,
      input,
    )
  }, [runner])

  const share = async () => {
    const link = `${location.origin}${location.pathname}#/playground?c=${await encodeShare(files)}`
    try {
      await navigator.clipboard.writeText(link)
      showToast(link.length > LONG_LINK_CHARS ? 'Link copied — it is long, so some apps may cut it off.' : 'Link copied to clipboard')
    } catch {
      showToast('Could not copy the link automatically.')
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-1.5">
        <div className="min-w-0 flex-1">
          <FileTabs
            files={files}
            activeId={active.id}
            onSelect={setActive}
            onAdd={addFile}
            onRename={renameFile}
            onDelete={deleteFile}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RuntimePill />
          <Popover ariaLabel="Snippets library" label="Snippets" align="right" panelClassName="w-72 max-h-96 overflow-auto p-1.5">
            {(close) => (
              <ul>
                {SNIPPETS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const error = addFile(s.id.replace(/-/g, '_') + '.py', s.code)
                        if (error) showToast(error)
                        close()
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface"
                    >
                      <span className="block text-sm">{s.title}</span>
                      <span className="block text-xs text-dim">{s.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Popover>
          <Popover ariaLabel="Install packages" label="Packages" align="right">
            {(close) => <InstallPanel onClose={close} />}
          </Popover>
          <Button size="sm" onClick={() => void share()}>Share</Button>
          {runner.running ? (
            <Button variant="secondary" size="sm" onClick={runner.stop} className="border-bad/60 text-bad">
              Stop
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={run} disabled={status === 'error'}>
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M1 1l8 5-8 5z" fill="currentColor" /></svg>
              Run {active.name}
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[3fr_2fr] lg:grid-cols-[1.15fr_1fr] lg:grid-rows-1">
        <PythiaEditor
          docKey={String(active.id)}
          initialValue={active.code}
          onChange={(code) => setCode(active.id, code)}
          onRun={run}
          fontSize={editorFontSize}
          keybindings={keybindings}
          ariaLabel={`Python code, ${active.name}`}
          lastError={runner.lastResult?.error ?? null}
          className="border-b border-line lg:border-b-0 lg:border-r"
        />
        <Console
          entries={runner.entries}
          running={runner.running}
          prompt={runner.prompt}
          onSubmitInput={runner.submitInput}
          onClear={runner.clear}
          stdin={stdin}
          onStdinChange={setStdin}
        />
      </div>

      <ConfirmDialog
        open={incoming !== null}
        title="Open shared code?"
        confirmLabel="Replace my files"
        destructive
        onCancel={() => setIncoming(null)}
        onConfirm={() => {
          if (incoming) replaceAll(incoming)
          setIncoming(null)
        }}
      >
        This link contains {incoming?.length} file{incoming?.length === 1 ? '' : 's'}. Opening it replaces what is currently in your playground.
      </ConfirmDialog>
    </div>
  )
}
