import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('crypto UI contracts', () => {
  it('keeps bidirectional transforms accessible and race-safe', () => {
    const source = read('src/renderer/src/components/HTextTransform.vue')
    for (const marker of [
      'enableReverse', 'handleSwap', 'aria-pressed', 'aria-busy',
      'aria-describedby', ':disabled="pending"', 'prefers-reduced-motion'
    ]) expect(source).toContain(marker)
  })

  it('shows explicit notices for legacy ciphers and non-cryptographic hashes', () => {
    const source = read('src/renderer/src/views/ToolView.vue')
    for (const id of [
      'des-encryption', 'rc4-encryption', 'tea-encryption', 'xtea-encryption',
      'blowfish-encryption', 'idea-encryption', 'rabbit-cipher',
      'city-hash', 'fnv-hash', 'murmur-hash'
    ]) expect(source).toContain(`'${id}'`)
    expect(source).toContain('仅用于兼容与学习')
    expect(source).toContain('非加密哈希')
    expect(source).toContain('不提供完整性保护')
  })

  it('requires exact AES key and IV byte lengths and exposes both directions', () => {
    const source = read('src/renderer/src/tools/cryptography/AesEncryption.vue')
    for (const marker of [
      'enable-reverse', ':reverse-transform="decrypt"',
      'actualKeyBytes !== requiredKeyBytes', 'actualIvBytes !== 16',
      '解密失败，请检查密钥、IV、模式和密文编码'
    ]) expect(source).toContain(marker)
  })
})
