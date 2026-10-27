import { describe, expect, it } from 'vitest'
import { fuzzyScore } from '@/lib/fuzzy'

describe('fuzzyScore', () => {
  it('matches subsequences, ignoring case and spaces', () => {
    expect(fuzzyScore('lcmp', 'List comprehensions')).not.toBeNull()
    expect(fuzzyScore('LIST C', 'list comprehensions')).not.toBeNull()
    expect(fuzzyScore('xyz', 'Variables')).toBeNull()
  })

  it('prefers consecutive and prefix matches', () => {
    const exact = fuzzyScore('loops', 'Loops')!
    const scattered = fuzzyScore('loops', 'Lines of old programs')!
    expect(exact).toBeGreaterThan(scattered)
    expect(fuzzyScore('var', 'Variables')!).toBeGreaterThan(fuzzyScore('var', 'The very large array')!)
  })

  it('treats an empty query as matching everything', () => {
    expect(fuzzyScore('', 'anything')).toBe(0)
  })
})
