import { describe, expect, it } from 'vitest'
import {
  decodeBase32,
  decodeBase58,
  decodeBase62,
  decodeBase64,
  encodeBase32,
  encodeBase58,
  encodeBase62,
  encodeBase64,
  hexToText,
  parseIntegerStrict,
  textToHex,
  textToUnicodeEscapes,
  unicodeEscapesToText
} from '../src/renderer/src/utils/encodingTransforms'
import { decodeDomain, decodePunycodeLabel, encodeDomain } from '../src/renderer/src/utils/punycode'

describe('双向编码转换', () => {
  const samples = ['', 'Hello SuperTools!', '你好世界 😀']

  it.each(samples)('Base64 应完整往返：%s', (value) => {
    expect(decodeBase64(encodeBase64(value))).toBe(value)
  })

  it.each(samples)('Base32 应完整往返：%s', (value) => {
    expect(decodeBase32(encodeBase32(value))).toBe(value)
  })

  it.each(samples)('Base58 应完整往返：%s', (value) => {
    expect(decodeBase58(encodeBase58(value))).toBe(value)
  })

  it.each(samples)('Base62 应完整往返：%s', (value) => {
    expect(decodeBase62(encodeBase62(value))).toBe(value)
  })

  it('Hex 应支持 Unicode 往返', () => {
    const encoded = textToHex('你好 😀', { spaced: true, uppercase: true, prefix: true })
    expect(hexToText(encoded)).toBe('你好 😀')
  })

  it('Unicode 转义应使用代理对支持补充平面字符', () => {
    const encoded = textToUnicodeEscapes('A😀中')
    expect(encoded).toBe('A\\ud83d\\ude00\\u4e2d')
    expect(unicodeEscapesToText(encoded)).toBe('A😀中')
  })
})

describe('非法输入边界', () => {
  it.each(['abc', '!!!!', 'SGVsbG8==='])('Base64 应拒绝非法输入：%s', (value) => {
    expect(() => decodeBase64(value)).toThrow('无效的 Base64')
  })

  it.each(['ABC!', 'A=======', 'MY======extra'])('Base32 应拒绝非法输入：%s', (value) => {
    expect(() => decodeBase32(value)).toThrow('无效的 Base32')
  })

  it.each(['f', 'gg', '0x1 0xzz'])('Hex 应拒绝非法输入：%s', (value) => {
    expect(() => hexToText(value)).toThrow()
  })

  it('进制解析不得部分接受非法字符', () => {
    expect(() => parseIntegerStrict('102', 2)).toThrow('无效的 2 进制数字')
    expect(() => parseIntegerStrict('19', 8)).toThrow('无效的 8 进制数字')
    expect(parseIntegerStrict('FFFFFFFFFFFFFFFF', 16)).toBe(18446744073709551615n)
  })
})

describe('Punycode 域名', () => {
  it('应编码和解码中文域名', () => {
    expect(encodeDomain('中文.com')).toBe('xn--fiq228c.com')
    expect(decodeDomain('xn--fiq228c.com')).toBe('中文.com')
  })

  it('应解码带 ASCII 前缀的标签', () => {
    expect(decodePunycodeLabel('xn--bcher-kva')).toBe('bücher')
  })
})
