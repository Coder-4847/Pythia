import { beforeEach, describe, expect, it } from 'vitest'
import { initTheme, useTheme } from '@/stores/theme'

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear()
    useTheme.getState().setTheme('dark')
  })

  it('defaults to dark and reflects the theme on <html>', () => {
    initTheme()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('toggles and persists the choice', () => {
    useTheme.getState().toggle()
    expect(useTheme.getState().theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('pythia.theme')).toBe('light')
  })
})
