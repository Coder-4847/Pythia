import { describe, expect, it } from 'vitest'
import { decodeShare, encodeShare } from '@/features/playground/share'

describe('share links', () => {
  it('round-trips multiple files including unicode', async () => {
    const files = [
      { name: 'main.py', code: 'print("héllo — ✓")\nimport helper' },
      { name: 'helper.py', code: 'x = 1\n' },
    ]
    const encoded = await encodeShare(files)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/) // URL-safe
    expect(await decodeShare(encoded)).toEqual(files)
  })

  it('compresses repetitive code well below its raw size', async () => {
    const code = 'print("hello")\n'.repeat(200)
    expect((await encodeShare([{ name: 'main.py', code }])).length).toBeLessThan(code.length / 10)
  })

  it('rejects garbage, wrong shapes, bad names and duplicate files', async () => {
    expect(await decodeShare('not-a-payload')).toBeNull()
    expect(await decodeShare(await encodeShare([{ name: '../evil.py', code: '' }]))).toBeNull()
    expect(await decodeShare(await encodeShare([{ name: 'a.txt', code: '' }]))).toBeNull()
    expect(
      await decodeShare(
        await encodeShare([
          { name: 'a.py', code: '' },
          { name: 'a.py', code: '' },
        ]),
      ),
    ).toBeNull()
    expect(await decodeShare(await encodeShare([]))).toBeNull()
  })
})
