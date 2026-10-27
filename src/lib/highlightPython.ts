export type TokenKind = 'keyword' | 'builtin' | 'string' | 'number' | 'comment' | 'plain'
export interface Token {
  text: string
  kind: TokenKind
}

const KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
  'except', 'finally', 'for', 'from', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'raise',
  'return', 'try', 'while', 'with', 'yield',
])
const BUILTINS = new Set(['print', 'range', 'len', 'input', 'int', 'float', 'str', 'list', 'dict', 'set', 'sum', 'min', 'max'])

// Order matters: comments and strings must win over words and numbers.
const TOKEN_RE = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g

/**
 * Tiny Python tokenizer for the marketing demos, where pulling in CodeMirror
 * would cost more than the page's whole JS budget. Tolerates unterminated
 * strings so partially-typed code still renders.
 */
export function highlightPython(source: string): Token[] {
  const tokens: Token[] = []
  let last = 0
  for (const m of source.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0
    if (start > last) tokens.push({ text: source.slice(last, start), kind: 'plain' })
    const [text, comment, string, number, word] = m
    let kind: TokenKind = 'plain'
    if (comment) kind = 'comment'
    else if (string) kind = 'string'
    else if (number) kind = 'number'
    else if (word) kind = KEYWORDS.has(word) ? 'keyword' : BUILTINS.has(word) ? 'builtin' : 'plain'
    tokens.push({ text, kind })
    last = start + text.length
  }
  if (last < source.length) tokens.push({ text: source.slice(last), kind: 'plain' })
  return tokens
}
