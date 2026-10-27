import { getSettings, getWorkspace, saveWorkspace, updateSettings } from '@/data/repo'
import { usePlayground } from '@/features/playground/store'
import { useSettings, type SettingsValues } from '@/stores/settings'
import { useTheme } from '@/stores/theme'

/** Save a burst of changes (typing) as one write. */
function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

let writing = false

const pick = (s: ReturnType<typeof useSettings.getState>): SettingsValues => ({
  editorFontSize: s.editorFontSize,
  keybindings: s.keybindings,
  pythiaIntensity: s.pythiaIntensity,
  aiEnabled: s.aiEnabled,
  reducedMotion: s.reducedMotion,
})

/** Load settings and the playground workspace from IndexedDB into their stores. Safe to call again after an import. */
export async function hydrateStores(): Promise<void> {
  writing = true // don't echo what we just loaded straight back into the database
  try {
    const settings = await getSettings()
    useSettings.setState(pick({ ...useSettings.getState(), ...settings }))
    useTheme.getState().setTheme(settings.theme)

    const workspace = await getWorkspace()
    if (workspace) usePlayground.getState().replaceAll(workspace.files, workspace.activeName)
  } finally {
    writing = false
  }
}

/** Start writing store changes through to IndexedDB. Call once, after the first hydrate. */
export function startWriteThrough(): void {
  const saveSettings = debounce((patch: Parameters<typeof updateSettings>[0]) => void updateSettings(patch), 300)
  useSettings.subscribe((state) => {
    if (!writing) saveSettings(pick(state))
  })
  let lastTheme = useTheme.getState().theme
  useTheme.subscribe((state) => {
    if (state.theme === lastTheme) return
    lastTheme = state.theme
    if (!writing) saveSettings({ theme: state.theme })
  })

  const saveFiles = debounce(() => {
    const { files, activeId } = usePlayground.getState()
    const active = files.find((f) => f.id === activeId) ?? files[0]
    if (active) void saveWorkspace(files.map(({ name, code }) => ({ name, code })), active.name)
  }, 600)
  usePlayground.subscribe((state, prev) => {
    if (!writing && (state.files !== prev.files || state.activeId !== prev.activeId)) saveFiles()
  })
}
