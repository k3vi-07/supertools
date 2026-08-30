import { describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import { argon2id, blake2s, scrypt, whirlpool } from 'hash-wasm'
import { gost341194 } from '@li0ard/gost341194'
import TigerPackage from 'fb-tiger-hash'
import { decrypt, encrypt, makeSession } from 'twofish-ts'
import { stream } from '@stablelib/salsa20'
import { createCipheriv, createDecipheriv } from 'node:crypto'
import { cityhash64_hex, cityhash_102_128_hex } from 'ch-city-wasm'
import { stream as chachaStream } from '@stablelib/chacha'
import CryptoJS from 'crypto-js'
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js'
import { aeskw, gcmsiv } from '@noble/ciphers/aes.js'

const hex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex')

describe('remote cryptography plugins use standard implementations', () => {
  it('matches the RFC 3394 AES Key Wrap vector', () => {
    const kek = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex')
    const key = Buffer.from('00112233445566778899aabbccddeeff', 'hex')
    const wrapped = aeskw(kek).encrypt(key)
    expect(hex(wrapped)).toBe('1fa68b0a8112b447aef34bd8fb5a7b829d3e862371d2cfe5')
    expect(Buffer.from(aeskw(kek).decrypt(wrapped))).toEqual(key)
  })

  it('round-trips XChaCha20-Poly1305 and rejects tampering', () => {
    const key = new Uint8Array(32)
    const nonce = new Uint8Array(24)
    const aad = new TextEncoder().encode('metadata')
    const sealed = xchacha20poly1305(key, nonce, aad).encrypt(new TextEncoder().encode('secret'))
    expect(new TextDecoder().decode(xchacha20poly1305(key, nonce, aad).decrypt(sealed))).toBe('secret')
    sealed[0] ^= 1
    expect(() => xchacha20poly1305(key, nonce, aad).decrypt(sealed)).toThrow()
  })

  it('round-trips AES-GCM-SIV and rejects tampering', () => {
    const key = new Uint8Array(32)
    const nonce = new Uint8Array(12)
    const aad = new TextEncoder().encode('metadata')
    const sealed = gcmsiv(key, nonce, aad).encrypt(new TextEncoder().encode('secret'))
    expect(new TextDecoder().decode(gcmsiv(key, nonce, aad).decrypt(sealed))).toBe('secret')
    sealed[sealed.length - 1] ^= 1
    expect(() => gcmsiv(key, nonce, aad).decrypt(sealed)).toThrow()
  })

  it('matches BLAKE2s-256 RFC vector', async () => {
    expect(await blake2s('abc', 256)).toBe(
      '508c5e8c327c14e2e1a72ba34eeb452f37458b209ed63a294d999b4c86675982'
    )
  })

  it('matches Whirlpool empty-message vector', async () => {
    expect(await whirlpool('')).toBe(
      '19fa61d75522a4669b44e39c1d2e1726c530232130d407f89afee0964997f7a7' +
      '3e83be698b288febcf88e3e03c4f0757ea8964e59b63d93708b138cc42a66eb3'
    )
  })

  it('matches Twofish zero-key vector and decrypts it', () => {
    const session = makeSession(new Uint8Array(16))
    const encrypted = new Uint8Array(16)
    encrypt(new Uint8Array(16), 0, encrypted, 0, session)
    expect(hex(encrypted)).toBe('9f589f5cf6122c32b6bfec2f2ae8c35a')
    const decrypted = new Uint8Array(16)
    decrypt(encrypted, 0, decrypted, 0, session)
    expect(hex(decrypted)).toBe('00000000000000000000000000000000')
  })

  it('matches Tiger empty-message vector', () => {
    const Tiger = TigerPackage
    expect(new Tiger(Tiger.L192).hash('')).toBe('3293ac630c13f0245f92bbb1766e16167a4e58492dde73f3')
  })

  it('matches GOST R 34.11-94 empty-message vector', () => {
    expect(hex(gost341194(new Uint8Array()))).toBe(
      '981e5f3ca30c841487830f84fb433e13ac1101569b9c13584ac483234cd656c0'
    )
  })

  it('matches Salsa20/20 zero-key stream vector', () => {
    expect(hex(stream(new Uint8Array(32), new Uint8Array(8), new Uint8Array(64)))).toBe(
      '9a97f65b9b4c721b960a672145fca8d4e32e67f9111ea979ce9c4826806aeee6' +
      '3de9c0da2bd7f91ebcb2639bf989c6251b29bf38d39a9bdce7c55f4b2ac12a39'
    )
  })

  it('generates and verifies real bcrypt', async () => {
    const hash = await bcrypt.hash('correct horse battery staple', 4)
    await expect(bcrypt.compare('correct horse battery staple', hash)).resolves.toBe(true)
    await expect(bcrypt.compare('wrong', hash)).resolves.toBe(false)
  })

  it('matches Argon2id fixed parameter output', async () => {
    await expect(argon2id({
      password: 'password', salt: 'somesalt', parallelism: 1, iterations: 2,
      memorySize: 65536, hashLength: 32, outputType: 'hex'
    })).resolves.toBe('09316115d5cf24ed5a15a31a3ba326e5cf32edc24702987c02b6566f61913cf7')
  })

  it('matches Camellia-128 RFC 3713 vector and decrypts it', () => {
    const key = Buffer.from('0123456789abcdeffedcba9876543210', 'hex')
    const plain = Buffer.from('0123456789abcdeffedcba9876543210', 'hex')
    const cipher = createCipheriv('camellia-128-ecb', key, null)
    cipher.setAutoPadding(false)
    const encrypted = Buffer.concat([cipher.update(plain), cipher.final()])
    expect(encrypted.toString('hex')).toBe('67673138549669730857065648eabe43')
    const decipher = createDecipheriv('camellia-128-ecb', key, null)
    decipher.setAutoPadding(false)
    expect(Buffer.concat([decipher.update(encrypted), decipher.final()])).toEqual(plain)
  })

  it('matches CityHash reference binding vectors', () => {
    const input = new TextEncoder().encode('hello world')
    expect(cityhash64_hex(input)).toBe('a5a0b66b6b03e4ab')
    expect(cityhash_102_128_hex(input)).toBe('d084e357c375600f7b9cb224dd52fb7d')
  })

  it('matches ChaCha20 RFC 8439 block vector at counter 1', () => {
    const key = Uint8Array.from({ length: 32 }, (_, i) => i)
    const counterNonce = Buffer.from('01000000000000090000004a00000000', 'hex')
    expect(hex(chachaStream(key, counterNonce, new Uint8Array(64), 4))).toBe(
      '10f1e7e4d13b5915500fdd1fa32071c4c7d1f4c733c068030422aa9ac3d46c4e' +
      'd2826446079faa0914c2d705d98b02a2b5129cd1de164eb9cbd083e8a2503c4e'
    )
  })

  it('matches scrypt RFC 7914 vector', async () => {
    await expect(scrypt({ password: '', salt: '', costFactor: 16, blockSize: 1,
      parallelism: 1, hashLength: 64, outputType: 'hex' })).resolves.toBe(
      '77d6576238657b203b19ca42c18a0497f16b4844e3074ae8dfdffa3fede21442' +
      'fcd0069ded0948f8326a753a0fc81f17e8d3e0fb2e0d3628cf35e20c38d18906'
    )
  })

  it('matches DES and 3DES block vectors through the bundled cipher library', () => {
    const plain = CryptoJS.enc.Hex.parse('0123456789abcdef')
    const des = CryptoJS.DES.encrypt(plain, CryptoJS.enc.Hex.parse('133457799bbcdff1'), {
      mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding
    })
    expect(des.ciphertext.toString()).toBe('85e813540f0ab405')
    const triple = CryptoJS.TripleDES.encrypt(plain, CryptoJS.enc.Hex.parse('0123456789abcdeffedcba987654321089abcdef01234567'), {
      mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding
    })
    expect(CryptoJS.TripleDES.decrypt(triple, CryptoJS.enc.Hex.parse('0123456789abcdeffedcba987654321089abcdef01234567'), {
      mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding
    }).toString()).toBe('0123456789abcdef')
  })

  it('matches Web Crypto AES-CBC and AES-CTR NIST vectors', async () => {
    const key = await crypto.subtle.importKey('raw', Buffer.from('2b7e151628aed2a6abf7158809cf4f3c', 'hex'), 'AES-CBC', false, ['encrypt'])
    const plain = Buffer.from('6bc1bee22e409f96e93d7e117393172a', 'hex')
    const cbc = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex') }, key, plain)
    expect(Buffer.from(cbc).subarray(0, 16).toString('hex')).toBe('7649abac8119b246cee98e9b12e9197d')
    const ctrKey = await crypto.subtle.importKey('raw', Buffer.from('2b7e151628aed2a6abf7158809cf4f3c', 'hex'), 'AES-CTR', false, ['encrypt'])
    const ctr = await crypto.subtle.encrypt({ name: 'AES-CTR', counter: Buffer.from('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff', 'hex'), length: 128 }, ctrKey, plain)
    expect(Buffer.from(ctr).toString('hex')).toBe('874d6191b620e3261bef6864990db6ce')
  })

  it('authenticates AES-GCM and rejects tampering', async () => {
    const key = await crypto.subtle.importKey('raw', new Uint8Array(16), 'AES-GCM', false, ['encrypt', 'decrypt'])
    const iv = new Uint8Array(12)
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new Uint8Array(16)))
    expect(Buffer.from(encrypted).toString('hex')).toBe('0388dace60b6a392f328c2b971b2fe78ab6e47d42cec13bdf53a67b21257bddf')
    encrypted[0] ^= 1
    await expect(crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)).rejects.toThrow()
  })

  it('matches PBKDF2 and HMAC-SHA256 vectors', async () => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode('password'), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode('salt'), iterations: 1, hash: 'SHA-256' }, base, 256)
    expect(Buffer.from(bits).toString('hex')).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b')
    const hmacKey = await crypto.subtle.importKey('raw', new TextEncoder().encode('key'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const mac = await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode('The quick brown fox jumps over the lazy dog'))
    expect(Buffer.from(mac).toString('hex')).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8')
  })

  it('derives identical ECDH secrets and verifies ECDSA tamper rejection', async () => {
    const alice = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
    const bob = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
    const a = await crypto.subtle.deriveBits({ name: 'ECDH', public: bob.publicKey }, alice.privateKey, 256)
    const b = await crypto.subtle.deriveBits({ name: 'ECDH', public: alice.publicKey }, bob.privateKey, 256)
    expect(Buffer.from(a)).toEqual(Buffer.from(b))
    const signer = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])
    const message = new TextEncoder().encode('signed message')
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signer.privateKey, message)
    await expect(crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, signer.publicKey, signature, message)).resolves.toBe(true)
    await expect(crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, signer.publicKey, signature, new TextEncoder().encode('tampered'))).resolves.toBe(false)
  })
})
