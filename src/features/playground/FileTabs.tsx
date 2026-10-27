import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { MAX_FILES, type PlaygroundFile } from '@/features/playground/store'

interface FileTabsProps {
  files: PlaygroundFile[]
  activeId: number
  onSelect: (id: number) => void
  onAdd: (name: string) => string | null
  onRename: (id: number, name: string) => string | null
  onDelete: (id: number) => void
}

/** Next unused scratch name: untitled.py, untitled_2.py, … */
function suggestName(files: PlaygroundFile[]) {
  const taken = new Set(files.map((f) => f.name))
  if (!taken.has('untitled.py')) return 'untitled.py'
  for (let n = 2; ; n++) if (!taken.has(`untitled_${n}.py`)) return `untitled_${n}.py`
}

export function FileTabs({ files, activeId, onSelect, onAdd, onRename, onDelete }: FileTabsProps) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing !== null) input.current?.select()
  }, [editing])

  const startRename = (file: PlaygroundFile) => {
    setEditing(file.id)
    setDraft(file.name)
    setError(null)
  }

  const commit = (file: PlaygroundFile) => {
    if (draft === file.name) return setEditing(null)
    const message = onRename(file.id, draft.trim())
    if (message) setError(message)
    else setEditing(null)
  }

  return (
    <div className="relative flex min-w-0 items-center">
      <div role="tablist" aria-label="Files" className="flex min-w-0 items-center overflow-x-auto">
        {files.map((file) => {
          const active = file.id === activeId
          return (
            <div
              key={file.id}
              className={cn(
                'group relative flex shrink-0 items-center border-b-2 font-mono text-[13px] transition-colors',
                active ? 'border-gold text-fg' : 'border-transparent text-dim hover:text-muted',
              )}
            >
              {editing === file.id ? (
                <input
                  ref={input}
                  value={draft}
                  aria-label="File name"
                  aria-invalid={error !== null}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    setError(null)
                  }}
                  onBlur={() => commit(file)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit(file)
                    if (e.key === 'Escape') setEditing(null)
                  }}
                  className="mx-2 my-2 w-32 rounded border border-gold bg-surface px-1.5 py-0.5 text-fg outline-none"
                />
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelect(file.id)}
                  onDoubleClick={() => startRename(file)}
                  onKeyDown={(e) => e.key === 'F2' && startRename(file)}
                  title="Double-click or press F2 to rename"
                  className="px-3 py-3"
                >
                  {file.name}
                </button>
              )}
              {files.length > 1 && editing !== file.id && (
                <button
                  type="button"
                  aria-label={`Delete ${file.name}`}
                  onClick={() => onDelete(file.id)}
                  className="mr-1.5 grid size-5 place-items-center rounded text-dim opacity-0 transition hover:bg-raised hover:text-bad focus-visible:opacity-100 group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
      <button
        type="button"
        aria-label="New file"
        disabled={files.length >= MAX_FILES}
        onClick={() => {
          const message = onAdd(suggestName(files))
          if (message) setError(message)
        }}
        className="ml-1 grid size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-fg disabled:opacity-40"
      >
        +
      </button>
      {error && (
        <p role="alert" className="absolute left-2 top-full z-20 mt-1 max-w-xs rounded-md border border-bad/40 bg-raised px-3 py-1.5 text-xs text-bad shadow-pop">
          {error}
        </p>
      )}
    </div>
  )
}
