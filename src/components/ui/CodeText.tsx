import { highlightPython, type TokenKind } from '@/lib/highlightPython'

const COLOR: Record<TokenKind, string> = {
  keyword: 'text-gold',
  builtin: 'text-fg',
  string: 'text-ok',
  number: 'text-fg',
  comment: 'text-dim italic',
  plain: 'text-muted',
}

/** Syntax-highlighted Python as spans. Parent supplies <pre>/<code> and layout. */
export function CodeText({ code }: { code: string }) {
  return (
    <>
      {highlightPython(code).map((t, i) => (
        <span key={i} className={COLOR[t.kind]}>
          {t.text}
        </span>
      ))}
    </>
  )
}
