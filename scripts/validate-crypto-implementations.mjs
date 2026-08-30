import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const community = resolve(process.env.SUPERTOOLS_COMMUNITY_DIR || '../supertools-community', 'tools')
const vectorTests = [
  readFileSync(resolve(process.cwd(), 'tests/cryptoStandards.test.ts'), 'utf8'),
  readFileSync(resolve(process.cwd(), 'tests/communityCipherVectors.test.ts'), 'utf8')
].join('\n')

const contracts = {
  'AesCbcEncryption.vue': ['crypto.subtle', 'AES-CBC'],
  'AesCtrEncryption.vue': ['crypto.subtle', 'AES-CTR'],
  'AesGcmEncryption.vue': ['crypto.subtle', 'AES-GCM'],
  'Argon2Generator.vue': ["from 'hash-wasm'", 'argon2id'],
  'BcryptChecker.vue': ["from 'bcryptjs'", 'bcrypt.compare'],
  'Blake2Hash.vue': ["from 'hash-wasm'", 'blake2s'],
  'CamelliaEncryption.vue': ['window.supertools.camelliaBlock'],
  'Chacha20Encryption.vue': ["from '@stablelib/chacha'", 'streamXOR'],
  'CityHash.vue': ["from 'ch-city-wasm'", 'cityhash64_hex'],
  'DesEncryption.vue': ["from 'crypto-js'", 'CryptoJS.TripleDES'],
  'GostHash.vue': ["from '@li0ard/gost341194'", 'gost341194'],
  'RabbitCipher.vue': ["from 'crypto-js'", 'CryptoJS.Rabbit'],
  'Salsa20Encryption.vue': ["from '@stablelib/salsa20'", 'streamXOR'],
  'ScryptGenerator.vue': ["from 'hash-wasm'", 'standardScrypt'],
  'SnefruHash.vue': ["from 'crypto-api/snefru'", 'new Snefru'],
  'TigerHash.vue': ["from 'fb-tiger-hash'", 'new Tiger'],
  'TwofishEncryption.vue': ["from 'twofish-ts'", 'makeSession'],
  'WhirlpoolHash.vue': ["from 'hash-wasm'", 'standardWhirlpool'],
  'Xchacha20Poly1305.vue': ["from '@noble/ciphers/chacha.js'", 'xchacha20poly1305'],
  'AesGcmSiv.vue': ["from '@noble/ciphers/aes.js'", 'gcmsiv'],
  'AesKeyWrap.vue': ["from '@noble/ciphers/aes.js'", 'aeskw']
}

const vectorNames = [
  'BlowfishEncryption.vue', 'IdeaEncryption.vue', 'Sm4Encryption.vue',
  'TeaEncryption.vue', 'XteaEncryption.vue', 'Rc4Encryption.vue'
]

const errors = []
const retiredMarkers = [
  'BLAKE2s 纯 JS 实现', 'Camellia S-boxes', 'Google CityHash 纯 JS 实现',
  'DES 纯 JS 实现', 'GOST R 34.11-94 俄罗斯国家标准哈希 (256-bit) 纯 JS 实现',
  'bcrypt 自定义 base64', 'Snefru 哈希 (256-bit) 纯 JS 实现',
  'Tiger 哈希 (192-bit) 纯 JS 实现', 'Whirlpool 纯 JS 实现 (512-bit)',
  'Simplified Twofish-style round function'
]
for (const [file, markers] of Object.entries(contracts)) {
  const source = readFileSync(resolve(community, file), 'utf8')
  for (const marker of markers) {
    if (!source.includes(marker)) errors.push(`${file}: 缺少受信实现标记 ${marker}`)
  }
}
for (const file of vectorNames) {
  if (!vectorTests.includes(file)) errors.push(`${file}: 缺少直接插件源码向量测试`)
}
for (const file of Object.keys(contracts)) {
  const source = readFileSync(resolve(community, file), 'utf8')
  for (const marker of retiredMarkers) {
    if (source.includes(marker)) errors.push(`${file}: 发现已退役的手写实现 ${marker}`)
  }
}

if (errors.length) {
  console.error(errors.map(item => `❌ ${item}`).join('\n'))
  process.exit(1)
}
console.log(`✅ 加密实现契约通过：${Object.keys(contracts).length} 个受信实现，${vectorNames.length} 个源码向量锁定`)
