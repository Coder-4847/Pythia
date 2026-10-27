import type { SourceFile } from '@/workers/protocol'

/** Hard cap so a pasted link can't make the playground allocate unbounded memory. */
const MAX_FILES = 20
const MAX_CODE_CHARS = 200_000
export const FILE_NAME_RE = /^[A-Za-z_]\w*\.py$/

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64Url = (text: string) => {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const writer = stream.writable.getWriter()
  void writer.write(bytes as BufferSource).then(() => writer.close())
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

/** Compress files into a URL-safe string (deflate + base64url). No server involved. */
export async function encodeShare(files: SourceFile[]): Promise<string> {
  const json = JSON.stringify(files.map((f) => [f.name, f.code]))
  return toBase64Url(await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw')))
}

/** Inverse of `encodeShare`. Returns null for anything that isn't a valid, size-bounded payload. */
export async function decodeShare(text: string): Promise<SourceFile[] | null> {
  try {
    const raw = await pipe(fromBase64Url(text), new DecompressionStream('deflate-raw'))
    const parsed: unknown = JSON.parse(new TextDecoder().decode(raw))
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > MAX_FILES) return null
    const files: SourceFile[] = []
    for (const item of parsed) {
      if (!Array.isArray(item) || typeof item[0] !== 'string' || typeof item[1] !== 'string') return null
      if (!FILE_NAME_RE.test(item[0]) || item[1].length > MAX_CODE_CHARS) return null
      files.push({ name: item[0], code: item[1] })
    }
    return new Set(files.map((f) => f.name)).size === files.length ? files : null
  } catch {
    return null
  }
}
