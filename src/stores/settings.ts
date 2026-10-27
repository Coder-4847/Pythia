import { create } from 'zustand'
import type { Settings } from '@/data/schema'

export type Keybindings = Settings['keybindings']

/** Everything the learner can configure, minus the theme (see stores/theme.ts) and bookkeeping fields. */
export type SettingsValues = Omit<Settings, 'id' | 'updatedAt' | 'theme'>

interface SettingsState extends SettingsValues {
  set: (patch: Partial<SettingsValues>) => void
}

/**
 * In-memory mirror of the settings record. `data/sync-stores.ts` loads it from IndexedDB at
 * startup and writes every change back, so components just read and call `set`.
 */
export const useSettings = create<SettingsState>((set) => ({
  editorFontSize: 14,
  keybindings: 'default',
  pythiaIntensity: 'balanced',
  aiEnabled: true,
  reducedMotion: 'system',
  set: (patch) => set(patch),
}))
