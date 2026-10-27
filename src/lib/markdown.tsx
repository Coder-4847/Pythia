import { Fragment, type ReactNode } from 'react'
import { CodeText } from '@/components/ui/CodeText'

/**
 * A deliberately small Markdown renderer for lesson content. It builds React elements
 * (never HTML strings), so every character of content is escaped by React and there is
 * no path for markup injection. Supported:
 *   blocks:  ### / #### headings, paragraphs, - / 1. lists, > callouts, ``` fences
 *   inline:  `code`, **bold**, *italic*, [text](https://… | /path)
 * Fences: ```python run → runnable snippet, ```diagram → JSON diagram, anything else → static code.
 */

export interface MarkdownHooks {
  /** Render a ```python run block (interactive). */
  runnable?: (code: string, key: string) => ReactNode
  /** Render a ```diagram block from its JSON body. */
  diagram?: (json: string, key: string) => ReactNode
}

const SAFE_URL = /^(https?:\/\/|\/|#\/)/

/** Inline formatting. Exported for single-line contexts such as quiz options. */
export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let n = 0
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const key = `${keyPrefix}${n++}`
    if (m[1] !== undefined)
      out.push(
        <code key={key} className="rounded bg-raised px-1.5 py-0.5 font-mono text-[0.88em] text-gold">
          {m[1]}
        </code>,
      )
    else if (m[2] !== undefined)
      out.push(
        <strong key={key} className="font-semibold text-fg">
          {renderInline(m[2], `${key}b`)}
        </strong>,
      )
    else if (m[3] !== undefined) out.push(<em key={key}>{renderInline(m[3], `${key}e`)}</em>)
    else if (m[4] !== undefined && m[5] !== undefined)
      out.push(
        SAFE_URL.test(m[5]) ? (
          <a key={key} href={m[5]} target={m[5].startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener" className="text-gold underline underline-offset-2">
            {m[4]}
          </a>
        ) : (
          m[4]
        ),
      )
    last = at + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type Block =
  | { type: 'heading'; level: 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'fence'; lang: string; flags: string[]; body: string }

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!
    if (!line.trim()) {
      i++
      continue
    }
    const fence = /^```(\S*)\s*(.*)$/.exec(line)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i]!.startsWith('```')) body.push(lines[i++]!)
      i++ // closing fence
      blocks.push({ type: 'fence', lang: fence[1] ?? '', flags: (fence[2] ?? '').split(/\s+/).filter(Boolean), body: body.join('\n') })
      continue
    }
    const heading = /^(#{3,4})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1]!.length === 3 ? 3 : 4, text: heading[2]! })
      i++
      continue
    }
    if (line.startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i]!.startsWith('>')) quote.push(lines[i++]!.replace(/^>\s?/, ''))
      blocks.push({ type: 'callout', text: quote.join(' ') })
      continue
    }
    const list = /^(\s*)([-*]|\d+\.)\s+/.exec(line)
    if (list) {
      const ordered = /\d/.test(list[2]!)
      const items: string[] = []
      while (i < lines.length && /^(\s*)([-*]|\d+\.)\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*([-*]|\d+\.)\s+/, ''))
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    const para: string[] = [line]
    i++
    while (i < lines.length && lines[i]!.trim() && !/^(```|#{3,4}\s|>|\s*([-*]|\d+\.)\s)/.test(lines[i]!)) para.push(lines[i++]!)
    blocks.push({ type: 'paragraph', text: para.join(' ') })
  }
  return blocks
}

export function renderMarkdown(src: string, hooks: MarkdownHooks = {}): ReactNode {
  return parseBlocks(src).map((block, index) => {
    const key = `b${index}`
    switch (block.type) {
      case 'heading': {
        const Tag = block.level === 3 ? 'h3' : 'h4'
        return (
          <Tag key={key} className={block.level === 3 ? 'mt-8 text-xl font-medium tracking-tight' : 'mt-6 text-base font-medium'}>
            {renderInline(block.text, key)}
          </Tag>
        )
      }
      case 'paragraph':
        return (
          <p key={key} className="mt-4 leading-[1.75] text-muted">
            {renderInline(block.text, key)}
          </p>
        )
      case 'list': {
        const Tag = block.ordered ? 'ol' : 'ul'
        return (
          <Tag key={key} className={`mt-4 space-y-1.5 pl-6 text-muted ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-dim`}>
            {block.items.map((item, n) => (
              <li key={n} className="leading-[1.7]">
                {renderInline(item, `${key}-${n}`)}
              </li>
            ))}
          </Tag>
        )
      }
      case 'callout':
        return (
          <aside key={key} className="mt-5 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-[15px] leading-relaxed text-muted">
            {renderInline(block.text, key)}
          </aside>
        )
      case 'fence': {
        if (block.lang === 'diagram') return <Fragment key={key}>{hooks.diagram?.(block.body, key)}</Fragment>
        const isPython = block.lang === 'python' || block.lang === 'py'
        if (isPython && block.flags.includes('run') && hooks.runnable) return <Fragment key={key}>{hooks.runnable(block.body, key)}</Fragment>
        return (
          <pre key={key} className="mt-4 overflow-x-auto rounded-xl border border-line bg-bg/60 px-4 py-3 font-mono text-[13px] leading-6">
            {isPython ? <CodeText code={block.body} /> : block.body}
          </pre>
        )
      }
    }
  })
}
