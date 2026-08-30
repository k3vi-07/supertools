import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const toolsDir = resolve(process.cwd(), '../supertools-community/tools')

const removals = {
  'BcryptChecker.vue': ['// ===== bcrypt 自定义 base64 =====', 'async function runVerify()'],
  'Blake2Hash.vue': ['// BLAKE2s 纯 JS 实现', "const hash = ref('')"],
  'CamelliaEncryption.vue': ['// Camellia S-boxes', "const output = ref('')"],
  'Chacha20Encryption.vue': ['function rotl32(x, n)', 'function chacha20Crypt(keyBytes, nonceBytes, dataBytes)'],
  'CityHash.vue': ['// ===== Google CityHash 纯 JS 实现 (非加密哈希) =====', 'const results = computed(() => {'],
  'DesEncryption.vue': ['// ===== DES 纯 JS 实现 =====', 'function doEncrypt()'],
  'GostHash.vue': ['// ===== GOST R 34.11-94 俄罗斯国家标准哈希 (256-bit) 纯 JS 实现 =====', 'const results = computed(() => {'],
  'RabbitCipher.vue': ['const rotl32 =', 'const output = computed(() => {'],
  'Salsa20Encryption.vue': ['function rotl32(x, n)', 'const output = computed(() => {'],
  'ScryptGenerator.vue': ['// ===== PBKDF2 as building block for scrypt =====', 'async function derive()'],
  'SnefruHash.vue': ['// ===== Snefru 哈希 (256-bit) 纯 JS 实现 =====', 'const results = computed(() => {'],
  'TigerHash.vue': ['// ===== Tiger 哈希 (192-bit) 纯 JS 实现 =====', 'const results = computed(() => {'],
  'TwofishEncryption.vue': ['// q-tables (fixed permutations used in Twofish', 'function hexToBytes(hex)'],
  'WhirlpoolHash.vue': ['// ===== Whirlpool 纯 JS 实现 (512-bit) =====', 'const results = ref([])']
}

for (const [file, [startMarker, endMarker]] of Object.entries(removals)) {
  const path = resolve(toolsDir, file)
  const source = readFileSync(path, 'utf8')
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  if (start < 0) {
    console.log(`already clean ${file}`)
    continue
  }
  if (end < 0 || end <= start) throw new Error(`${file}: cleanup end marker not found`)
  writeFileSync(path, source.slice(0, start) + source.slice(end), 'utf8')
  console.log(`cleaned ${file}`)
}

const interactionBaseline = `

<!-- Shared interaction baseline: keep every remote tool keyboard, touch, and mobile friendly. -->
<style scoped>
:where(*, *::before, *::after) { box-sizing: border-box; }
:where(input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']):not([type='file']), select, textarea) { min-width: 0; min-height: 40px; max-width: 100%; }
:where(textarea) { line-height: 1.5; overflow-wrap: anywhere; }
:where(button, [role='button']) { min-height: 40px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease; }
:where(button:not(:disabled), [role='button']):hover { filter: brightness(0.98); }
:where(button:not(:disabled), [role='button']):active { opacity: 0.78; }
:where(button:disabled, [aria-disabled='true']) { cursor: not-allowed; opacity: 0.46; }
:where(button, [role='button'], input, select, textarea):focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
:where([class*='output'], [class*='result'], code, pre) { overflow-wrap: anywhere; }
:where([class*='actions'], [class*='controls'], [class*='tabs'], [class*='modes']) { flex-wrap: wrap; }
@media (max-width: 640px) {
  :where(input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']):not([type='file']), select, textarea) { min-height: 44px; font-size: 16px; }
  :where(button, [role='button']) { min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  :where(*, *::before, *::after) { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
</style>
`

for (const file of ['Base36Text.vue', 'Base45Encode.vue', 'JsonSchemaGenerator.vue', 'JsonToXml.vue', 'Rot47Cipher.vue', 'Utf8Bytes.vue']) {
  const path = resolve(toolsDir, file)
  const source = readFileSync(path, 'utf8')
  if (!source.includes('Shared interaction baseline')) {
    writeFileSync(path, source.trimEnd() + interactionBaseline, 'utf8')
    console.log(`normalized interaction ${file}`)
  }
}

const registryPath = resolve(process.cwd(), '../supertools-community/registry.json')
const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
registry.version = 'v1.9.0'
registry.description = 'SuperTools 开发者工具箱的社区远程工具集合 - 134 个工具'
const compatibilityOnly = new Set([
  'des-encryption', 'rc4-encryption', 'tea-encryption', 'xtea-encryption',
  'blowfish-encryption', 'idea-encryption', 'rabbit-cipher', 'classical-cipher',
  'playfair-cipher', 'text-encryptor'
])
const nonCrypto = new Set(['city-hash', 'fnv-hash', 'murmur-hash'])
for (const tool of registry.tools) {
  tool.version = 'v1.9.0'
  const prefix = compatibilityOnly.has(tool.id) ? '【仅兼容旧系统】' : nonCrypto.has(tool.id) ? '【非加密哈希】' : ''
  if (prefix && !tool.description.startsWith(prefix)) tool.description = `${prefix}${tool.description}`
}
const newTools = [
  { id: 'xchacha20-poly1305', name: 'XChaCha20-Poly1305', nameZh: 'XChaCha20-Poly1305 认证加密', icon: 'mdi:shield-lock', category: ['cryptography'], keywords: ['xchacha20', 'poly1305', 'aead', 'nonce', '认证加密'], description: 'XChaCha20-Poly1305 现代认证加密，支持 AAD 与 192 位 Nonce', path: 'tools/Xchacha20Poly1305.vue', author: 'k3vi-07', version: 'v1.9.0' },
  { id: 'aes-gcm-siv', name: 'AES-GCM-SIV', nameZh: 'AES-GCM-SIV 认证加密', icon: 'mdi:shield-refresh-outline', category: ['cryptography'], keywords: ['aes', 'gcm-siv', 'aead', 'rfc8452', '认证加密'], description: 'RFC 8452 抗 Nonce 误用的 AES 认证加密', path: 'tools/AesGcmSiv.vue', author: 'k3vi-07', version: 'v1.9.0' },
  { id: 'aes-key-wrap', name: 'AES Key Wrap', nameZh: 'AES 密钥封装', icon: 'mdi:key-chain', category: ['cryptography'], keywords: ['aes', 'key wrap', 'rfc3394', 'kek', '密钥封装'], description: 'RFC 3394 AES-KW 密钥封装与解封', path: 'tools/AesKeyWrap.vue', author: 'k3vi-07', version: 'v1.9.0' }
]
for (const tool of newTools) {
  if (!registry.tools.some(item => item.id === tool.id)) registry.tools.push(tool)
}
writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8')
console.log('normalized crypto metadata')
