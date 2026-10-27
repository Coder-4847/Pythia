import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LESSONS } from '@/content'
import { useSettings } from '@/stores/settings'
import { useTheme } from '@/stores/theme'
import { cn } from '@/lib/cn'
import { fuzzyScore } from '@/lib/fuzzy'

interface Command {
  id: string
  label: string
  hint?: string
  group: 'Go to' | 'Lessons' | 'Actions'
  run: () => void
}

/** Ctrl/⌘ + K: jump anywhere, open any lesson, or flip a setting, from the keyboard. */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const toggleTheme = useTheme((s) => s.toggle)
  const setSettings = useSettings((s) => s.set)

  const commands = useMemo<Command[]>(() => {
    const go = (label: string, path: string, hint?: string): Command => ({ id: `go:${path}`, label, hint, group: 'Go to', run: () => navigate(path) })
    return [
      go('Dashboard', '/dashboard'),
      go('Curriculum', '/learn'),
      go('Playground', '/playground'),
      go('Archive', '/archive', 'Everything you’ve completed'),
      go('Achievements', '/achievements'),
      go('Statistics', '/stats'),
      go('Profile', '/profile'),
      go('Settings', '/settings'),
      go('About Pythia', '/about'),
      go('Changelog', '/changelog'),
      ...LESSONS.map((l): Command => ({ id: `lesson:${l.id}`, label: l.title, hint: l.summary, group: 'Lessons', run: () => navigate(`/lesson/${l.id}`) })),
      { id: 'act:theme', label: 'Switch between dark and light theme', group: 'Actions', run: toggleTheme },
      { id: 'act:quiet', label: 'Pythia: be quiet (only certain crashes)', group: 'Actions', run: () => setSettings({ pythiaIntensity: 'quiet' }) },
      { id: 'act:balanced', label: 'Pythia: balanced', group: 'Actions', run: () => setSettings({ pythiaIntensity: 'balanced' }) },
      { id: 'act:chatty', label: 'Pythia: chatty (everything)', group: 'Actions', run: () => setSettings({ pythiaIntensity: 'chatty' }) },
    ]
  }, [navigate, toggleTheme, setSettings])

  const results = useMemo(() => {
    if (!query.trim()) return commands.filter((c) => c.group !== 'Lessons').slice(0, 12)
    return commands
      .map((c) => ({ c, score: fuzzyScore(query, c.label) }))
      .filter((r): r is { c: Command; score: number } => r.score !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => r.c)
  }, [commands, query])

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      input.current?.focus()
    }
    if (!open && d.open) d.close()
  }, [open])

  const choose = (c: Command | undefined) => {
    if (!c) return
    onClose()
    setQuery('')
    setCursor(0)
    c.run()
  }

  const active = results[Math.min(cursor, results.length - 1)]

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        setQuery('')
        setCursor(0)
        onClose()
      }}
      aria-label="Command palette"
      className="mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line-strong bg-raised p-0 text-fg shadow-pop backdrop:bg-black/60"
    >
      <input
        ref={input}
        role="combobox"
        aria-expanded
        aria-controls={listId}
        aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
        aria-label="Search commands and lessons"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setCursor(0)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setCursor((c) => Math.min(c + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setCursor((c) => Math.max(c - 1, 0))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            choose(active)
          }
        }}
        placeholder="Search lessons, pages and settings…"
        autoComplete="off"
        spellCheck={false}
        className="w-full border-b border-line bg-transparent px-5 py-4 text-[15px] outline-none placeholder:text-dim"
      />
      <ul id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-dim">Nothing matches “{query}”.</li>}
        {results.map((c, i) => (
          <li
            key={c.id}
            id={`${listId}-${c.id}`}
            role="option"
            aria-selected={c === active}
            onPointerMove={() => setCursor(i)}
            onClick={() => choose(c)}
            className={cn('flex cursor-pointer items-baseline gap-3 rounded-lg px-3 py-2.5 text-sm', c === active && 'bg-gold/15')}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-dim">{c.group}</span>
            <span className="min-w-0 flex-1 truncate">{c.label}</span>
            {c.hint && c === active && <span className="hidden max-w-[40%] truncate text-xs text-dim sm:inline">{c.hint}</span>}
          </li>
        ))}
      </ul>
    </dialog>
  )
}
