import { describe, expect, it } from 'vitest'
import { cacheKeyToFileName } from '../src/main/cacheService'

describe('remote cache keys', () => {
  it('maps an approved URL to a flat deterministic filename', () => {
    const filename = cacheKeyToFileName(
      'https://cdn.jsdelivr.net/gh/example/tools@v1.0.0/tools/Demo.vue'
    )

    expect(filename).toMatch(/^[a-f0-9]{64}\.vue$/)
    expect(filename).not.toContain('/')
    expect(filename).not.toContain('\\')
  })

  it('rejects traversal-shaped and non-approved cache keys', () => {
    expect(() => cacheKeyToFileName('..\\..\\target')).toThrow('无效的 URL')
    expect(() => cacheKeyToFileName('https://example.com/tool.vue')).toThrow('不在白名单中')
  })
})
