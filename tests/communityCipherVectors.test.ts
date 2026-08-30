import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const toolsRoot = resolve(process.env.SUPERTOOLS_COMMUNITY_DIR || '../supertools-community', 'tools')

function evaluate(file: string, setup: string, expression = 'output.value'): unknown {
  const source = readFileSync(resolve(toolsRoot, file), 'utf8')
  const script = source.match(/<script setup>([\s\S]*?)<\/script>/)?.[1]
  if (!script) throw new Error(`缺少 script setup: ${file}`)
  const executable = script.replace(/^import .*$/gm, '')
  const ref = <T>(value: T): { value: T } => ({ value })
  const computed = <T>(fn: () => T): { readonly value: T } => ({ get value() { return fn() } })
  return new Function('ref', 'computed', `${executable}\n${setup}\nreturn ${expression}`)(ref, computed)
}

describe('community pure-JS block and stream ciphers', () => {
  it('matches the Blowfish zero vector', () => {
    expect(evaluate('BlowfishEncryption.vue',
      "keyHex.value='0000000000000000'; input.value='0000000000000000'; mode.value='encrypt';"
    )).toBe('4ef997456198dd78')
  })

  it('matches the IDEA reference vector', () => {
    expect(evaluate('IdeaEncryption.vue', '')).toBe('11fbed2b01986de5')
  })

  it('matches the SM4 GB/T 32907 vector', () => {
    expect(evaluate('Sm4Encryption.vue',
      "keyHex.value='0123456789abcdeffedcba9876543210'; input.value='0123456789abcdeffedcba9876543210'; mode.value='encrypt';"
    )).toBe('681edf34d206965e86b3e94f536e4246')
  })

  it('matches the TEA zero vector', () => {
    expect(evaluate('TeaEncryption.vue',
      "keyHex.value='00000000000000000000000000000000'; input.value='0000000000000000'; mode.value='encrypt';"
    )).toBe('41ea3a0a94baa940')
  })

  it('matches the XTEA zero vector', () => {
    expect(evaluate('XteaEncryption.vue', '',
      "xteaEncryptBlock([0,0],[0,0,0,0]).map(x=>(x>>>0).toString(16).padStart(8,'0')).join('')"
    )).toBe('dee9d4d8f7131ed9')
  })

  it('matches the RC4 Key/Plaintext vector', () => {
    expect(evaluate('Rc4Encryption.vue',
      "key.value='Key'; input.value='Plaintext'; mode.value='encrypt';"
    )).toBe('bbf316e8d940af0ad3')
  })
})
