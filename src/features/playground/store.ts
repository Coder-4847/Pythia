import { create } from 'zustand'
import { FILE_NAME_RE } from '@/features/playground/share'
import type { SourceFile } from '@/workers/protocol'

export interface PlaygroundFile extends SourceFile {
  /** Stable identity across renames, so each tab keeps its own undo history. */
  id: number
}

export const MAX_FILES = 20
export const STARTER_CODE =
  '# Welcome to the playground. Press Ctrl/⌘ + Enter to run.\nfor i in range(1, 6):\n    print(i, "squared is", i * i)\n'

interface PlaygroundState {
  files: PlaygroundFile[]
  activeId: number
  stdin: string
  setCode: (id: number, code: string) => void
  setActive: (id: number) => void
  setStdin: (text: string) => void
  /** Returns an error message, or null on success. */
  addFile: (name: string, code?: string) => string | null
  renameFile: (id: number, name: string) => string | null
  deleteFile: (id: number) => void
  /** Swap in a whole workspace; `activeName` picks the open tab (default: the first). */
  replaceAll: (files: SourceFile[], activeName?: string) => void
  isPristine: () => boolean
}

let nextId = 1
const make = (name: string, code: string): PlaygroundFile => ({ id: nextId++, name, code })

function validateName(files: PlaygroundFile[], name: string, ignoreId?: number): string | null {
  if (!FILE_NAME_RE.test(name)) return 'Use letters, digits and underscores, ending in .py (so other files can import it).'
  if (files.some((f) => f.name === name && f.id !== ignoreId)) return `There is already a file called ${name}.`
  return null
}

const first = make('main.py', STARTER_CODE)

/** Files in the playground workspace. `data/syncStores.ts` persists them to IndexedDB. */
export const usePlayground = create<PlaygroundState>((set, get) => ({
  files: [first],
  activeId: first.id,
  stdin: '',
  setCode: (id, code) => set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, code } : f)) })),
  setActive: (activeId) => set({ activeId }),
  setStdin: (stdin) => set({ stdin }),
  addFile: (name, code = '') => {
    const { files } = get()
    if (files.length >= MAX_FILES) return `A playground holds up to ${MAX_FILES} files.`
    const error = validateName(files, name)
    if (error) return error
    const file = make(name, code)
    set({ files: [...files, file], activeId: file.id })
    return null
  },
  renameFile: (id, name) => {
    const error = validateName(get().files, name, id)
    if (error) return error
    set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, name } : f)) }))
    return null
  },
  deleteFile: (id) =>
    set((s) => {
      if (s.files.length <= 1) return s
      const files = s.files.filter((f) => f.id !== id)
      return { files, activeId: s.activeId === id ? (files[0]?.id ?? s.activeId) : s.activeId }
    }),
  replaceAll: (incoming, activeName) => {
    const files = incoming.map((f) => make(f.name, f.code))
    set({ files, activeId: (files.find((f) => f.name === activeName) ?? files[0]!).id })
  },
  isPristine: () => {
    const { files } = get()
    return files.length === 1 && files[0]!.code === STARTER_CODE
  },
}))
