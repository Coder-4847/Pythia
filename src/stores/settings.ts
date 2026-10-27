import { create } from 'zustand'

export type Keybindings = 'default' | 'vim'

interface SettingsState {
  editorFontSize: number
  keybindings: Keybindings
  set: (patch: Partial<Pick<SettingsState, 'editorFontSize' | 'keybindings'>>) => void
}

/** In-memory for now; phase 4 hydrates this from IndexedDB and writes changes through. */
export const useSettings = create<SettingsState>((set) => ({
  editorFontSize: 14,
  keybindings: 'default',
  set: (patch) => set(patch),
}))
