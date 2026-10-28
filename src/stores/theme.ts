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
  /** The learner picked a theme this session. Loading the saved one must not undo that. */
  chosen: boolean
  /** `saved` marks the value coming from storage, not from the learner. */
  setTheme: (t: Theme, source?: 'saved') => void
  toggle: () => void
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: readStored(),
  chosen: false,
  setTheme: (theme, source) => {
    apply(theme)
    set(source === 'saved' ? { theme } : { theme, chosen: true })
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))

/** Call once at startup, before first paint. */
export function initTheme() {
  apply(useTheme.getState().theme)
}
