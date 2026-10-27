/**
 * Case-insensitive subsequence match for the command palette: every letter of the query must
 * appear in order. Consecutive and early matches score higher. `null` means no match.
 */
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.toLowerCase().replace(/\s+/g, '')
  const t = text.toLowerCase()
  if (!q) return 0
  let score = 0
  let at = 0
  let streak = 0
  for (const ch of q) {
    const found = t.indexOf(ch, at)
    if (found === -1) return null
    streak = found === at ? streak + 1 : 0
    score += 1 + streak * 2 - Math.min(found, 20) * 0.05
    at = found + 1
  }
  return score - t.length * 0.01
}
