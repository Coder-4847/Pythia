import { create } from 'zustand'

export type Theme = 'dark' | 'light'
const KEY = 'pythia.theme'

/** localStorage is only a bootstrap cache so the theme is right before the DB loads. */
function readStored(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode: the preference just won't persist */
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: readStored(),
  setTheme: (theme) => {
    apply(theme)
    set({ theme })
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))

/** Call once at startup, before first paint. */
export function initTheme() {
  apply(useTheme.getState().theme)
}
