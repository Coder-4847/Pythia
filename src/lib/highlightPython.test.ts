import { describe, expect, it } from 'vitest'
import { highlightPython } from '@/lib/highlightPython'

const kinds = (src: string) => highlightPython(src).filter((t) => t.kind !== 'plain').map((t) => [t.text, t.kind])

describe('highlightPython', () => {
  it('classifies keywords, builtins, numbers and strings', () => {
    expect(kinds('for i in range(1, 10): print("hi")')).toEqual([
      ['for', 'keyword'],
      ['in', 'keyword'],
      ['range', 'builtin'],
      ['1', 'number'],
      ['10', 'number'],
      ['print', 'builtin'],
      ['"hi"', 'string'],
    ])
  })

  it('does not highlight words inside strings or comments', () => {
    expect(kinds('x = "for" # in 5')).toEqual([['"for"', 'string'], ['# in 5', 'comment']])
  })

  it('tolerates unterminated strings while typing', () => {
    expect(kinds('print("Sum')).toEqual([['print', 'builtin'], ['"Sum', 'string']])
  })

  it('round-trips the source text', () => {
    const src = 'if x == 3:\n    y = [1, 2]  # ok\n'
    expect(highlightPython(src).map((t) => t.text).join('')).toBe(src)
  })
})
