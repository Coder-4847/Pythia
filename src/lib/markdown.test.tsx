import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '@/lib/markdown'

const html = (md: string, hooks = {}) => renderToStaticMarkup(<>{renderMarkdown(md, hooks)}</>)

describe('renderMarkdown', () => {
  it('renders headings, paragraphs, lists and inline formatting', () => {
    const out = html('### Title\n\nSome **bold**, *soft* and `code`.\n\n- one\n- two\n\n1. first\n2. second')
    expect(out).toContain('<h3')
    expect(out).toContain('<strong')
    expect(out).toContain('<em>soft</em>')
    expect(out).toContain('>code</code>')
    expect(out).toMatch(/<ul[^>]*>.*<li[^>]*>one<\/li>/)
    expect(out).toMatch(/<ol[^>]*>.*<li[^>]*>first<\/li>/)
  })

  it('nests inline code inside bold and italics', () => {
    const out = html('**the `a` and `b`** and *a `c`*')
    expect(out).not.toContain('`')
    expect(out.match(/<code/g)).toHaveLength(3)
  })

  it('escapes raw HTML in content instead of rendering it', () => {
    const out = html('<script>alert(1)</script> and <img src=x onerror=alert(1)>\n\n```text\n<b>not bold</b>\n```')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('<img')
    expect(out).not.toContain('<b>')
    expect(out).toContain('&lt;script&gt;')
  })

  it('only links http(s) and in-app paths', () => {
    expect(html('[ok](https://example.com)')).toContain('href="https://example.com"')
    expect(html('[ok](/playground)')).toContain('href="/playground"')
    const bad = html('[x](javascript:alert(1))')
    expect(bad).not.toContain('href')
    expect(bad).toContain('x')
  })

  it('routes run fences and diagrams to hooks, and renders other fences statically', () => {
    const hooks = {
      runnable: (code: string) => <div data-run>{code}</div>,
      diagram: (json: string) => <div data-diagram>{json}</div>,
    }
    const out = html('```python run\nprint(1)\n```\n\n```diagram\n{"a":1}\n```\n\n```python\nx = 1\n```', hooks)
    expect(out).toContain('data-run="true">print(1)</div>')
    expect(out).toContain('data-diagram')
    expect(out).toContain('<pre')
  })

  it('turns > blocks into callouts', () => {
    expect(html('> **Tip:** take your time')).toContain('<aside')
  })

  it('tolerates an unterminated fence', () => {
    expect(() => html('```python\nprint(1)')).not.toThrow()
  })
})
