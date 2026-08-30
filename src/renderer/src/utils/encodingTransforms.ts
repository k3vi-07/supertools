const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function decodeBase64(input: string): string {
  const value = input.trim()
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('无效的 Base64')
  }
  const binary = atob(value)
  return bytesToText(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

export function encodeBase32(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  while (output.length % 8 !== 0) output += '='
  return output
}

export function decodeBase32(input: string): string {
  const normalized = input.trim().toUpperCase()
  if (!/^(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}======|[A-Z2-7]{4}====|[A-Z2-7]{5}===|[A-Z2-7]{7}=)?$/.test(normalized)) {
    throw new Error('无效的 Base32')
  }
  const clean = normalized.replace(/=+$/, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of clean) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char)
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return bytesToText(new Uint8Array(bytes))
}

function encodeRadix(input: string, alphabet: string): string {
  const bytes = new TextEncoder().encode(input)
  if (bytes.length === 0) return ''
  let number = 0n
  for (const byte of bytes) number = (number << 8n) | BigInt(byte)
  let result = ''
  const radix = BigInt(alphabet.length)
  while (number > 0n) {
    result = alphabet[Number(number % radix)] + result
    number /= radix
  }
  let leadingZeros = 0
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) leadingZeros++
  return alphabet[0].repeat(leadingZeros) + result
}

function decodeRadix(input: string, alphabet: string, label: string): string {
  if (!input) return ''
  let number = 0n
  const radix = BigInt(alphabet.length)
  for (const char of input) {
    const index = alphabet.indexOf(char)
    if (index < 0) throw new Error(`无效的 ${label} 字符`)
    number = number * radix + BigInt(index)
  }
  const bytes: number[] = []
  while (number > 0n) {
    bytes.unshift(Number(number & 255n))
    number >>= 8n
  }
  let leadingZeros = 0
  while (leadingZeros < input.length && input[leadingZeros] === alphabet[0]) leadingZeros++
  bytes.unshift(...new Array<number>(leadingZeros).fill(0))
  return bytesToText(new Uint8Array(bytes))
}

export const encodeBase58 = (input: string): string => encodeRadix(input, BASE58_ALPHABET)
export const decodeBase58 = (input: string): string => decodeRadix(input.trim(), BASE58_ALPHABET, 'Base58')
export const encodeBase62 = (input: string): string => encodeRadix(input, BASE62_ALPHABET)
export const decodeBase62 = (input: string): string => decodeRadix(input.trim(), BASE62_ALPHABET, 'Base62')

export function textToHex(input: string, options: { spaced: boolean; uppercase: boolean; prefix: boolean }): string {
  return Array.from(new TextEncoder().encode(input), (byte) => {
    let value = byte.toString(16).padStart(2, '0')
    if (options.uppercase) value = value.toUpperCase()
    return options.prefix ? `0x${value}` : value
  }).join(options.spaced ? ' ' : '')
}

export function hexToText(input: string): string {
  const clean = input.trim().replace(/0x/gi, '').replace(/\s+/g, '')
  if (!clean || clean.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(clean)) throw new Error('请输入偶数位有效 Hex 字符')
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16)
  return bytesToText(bytes)
}

export function textToUnicodeEscapes(input: string, withPrefix = true): string {
  let output = ''
  for (let i = 0; i < input.length; i++) {
    const codeUnit = input.charCodeAt(i)
    if (codeUnit <= 0x7f) output += input[i]
    else output += `${withPrefix ? '\\u' : ''}${codeUnit.toString(16).padStart(4, '0')}`
  }
  return output
}

export function unicodeEscapesToText(input: string): string {
  if (/\\u(?![0-9a-f]{4})/i.test(input)) throw new Error('Unicode 转义必须包含 4 位十六进制数')
  return input
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
}

export function parseIntegerStrict(input: string, radix: number): bigint {
  const clean = input.trim().replace(radix === 2 ? /^0b/i : radix === 8 ? /^0o/i : radix === 16 ? /^0x/i : /^$/, '')
  const patterns: Record<number, RegExp> = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^-?\d+$/, 16: /^[0-9a-f]+$/i }
  if (!patterns[radix]?.test(clean)) throw new Error(`无效的 ${radix} 进制数字`)
  const negative = clean.startsWith('-')
  const digits = negative ? clean.slice(1) : clean
  let value = 0n
  for (const char of digits.toLowerCase()) {
    const digit = Number.parseInt(char, 16)
    value = value * BigInt(radix) + BigInt(digit)
  }
  return negative ? -value : value
}
