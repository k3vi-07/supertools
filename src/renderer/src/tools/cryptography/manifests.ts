import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 加密哈希工具元数据 */
export const cryptoToolManifests: Manifest[] = [
  {
    id: 'md5-hash',
    name: 'MD5 Hash',
    nameZh: 'MD5 哈希',
    icon: 'mdi:fingerprint',
    category: ['cryptography'],
    keywords: ['md5', 'hash', '哈希', '摘要', 'digest'],
    description: '生成 MD5 哈希值',
    relatedToolId: ['sha-hash'],
    componentFile: 'HashGenerator.vue'
  },
  {
    id: 'sha-hash',
    name: 'SHA Hash',
    nameZh: 'SHA 哈希',
    icon: 'mdi:shield-check-outline',
    category: ['cryptography'],
    keywords: ['sha', 'sha1', 'sha256', 'sha512', 'hash', '哈希'],
    description: '生成 SHA-1/256/512 哈希',
    relatedToolId: ['md5-hash', 'hmac-generator'],
    componentFile: 'ShaHash.vue'
  },
  {
    id: 'hmac-generator',
    name: 'HMAC Generator',
    nameZh: 'HMAC 生成器',
    icon: 'mdi:key-variant',
    category: ['cryptography'],
    keywords: ['hmac', 'mac', 'signature', '签名', '密钥'],
    description: '生成 HMAC 消息认证码',
    relatedToolId: ['sha-hash'],
    componentFile: 'HmacGenerator.vue'
  },
  {
    id: 'aes-encryption',
    name: 'AES Encryption',
    nameZh: 'AES 加解密',
    icon: 'mdi:lock-outline',
    category: ['cryptography'],
    keywords: ['aes', 'encrypt', 'decrypt', '加密', '解密', '对称'],
    description: 'AES 对称加密与解密'
  },
  {
    id: 'jwt-parser',
    name: 'JWT Parser',
    nameZh: 'JWT 解析',
    icon: 'mdi:key-chain',
    category: ['cryptography'],
    keywords: ['jwt', 'json', 'web', 'token', 'parse', '解析', '令牌'],
    description: '解析 JWT Token 的 Header 和 Payload',
    advance: {
      recommend: { type: 'jwt', priority: 5 }
    }
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    nameZh: 'UUID 生成器',
    icon: 'mdi:identifier',
    category: ['cryptography'],
    keywords: ['uuid', 'guid', 'unique', 'id', '唯一', '标识符'],
    description: '生成 UUID v4 / v1',
    advance: {
      recommend: { type: 'uuid', priority: 5 }
    }
  },
  {
    id: 'bcrypt-hash',
    name: 'BCrypt Hash',
    nameZh: 'BCrypt 密码哈希',
    icon: 'mdi:lock-password-outline',
    category: ['cryptography'],
    keywords: ['bcrypt', 'password', 'hash', '密码', '哈希', 'salt'],
    description: 'BCrypt 密码哈希与校验'
  },
  {
    id: 'random-password',
    name: 'Password Generator',
    nameZh: '密码生成器',
    icon: 'mdi:form-textbox-password',
    category: ['cryptography'],
    keywords: ['password', 'random', 'generate', '密码', '生成', '随机'],
    description: '生成安全的随机密码',
    componentFile: 'PasswordGenerator.vue'
  },
  {
    id: 'rsa-key-generator',
    name: 'RSA Key Generator',
    nameZh: 'RSA 密钥生成',
    icon: 'mdi:key-chain-variant',
    category: ['cryptography'],
    keywords: ['rsa', 'key', 'generate', 'public', 'private', '密钥', '生成', '公钥', '私钥'],
    description: '生成 RSA 公钥/私钥对',
    relatedToolId: ['jwt-parser']
  },
  {
    id: 'crc-hash',
    name: 'CRC Hash',
    nameZh: 'CRC 哈希校验',
    icon: 'mdi:barcode',
    category: ['cryptography'],
    keywords: ['crc', 'crc32', 'hash', 'checksum', '校验', '哈希'],
    description: '生成 CRC32 及多种哈希校验值',
    relatedToolId: ['md5-hash', 'sha-hash']
  },
  { id: 'sha1-hash', name: 'SHA1 Hash', nameZh: 'SHA-1 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['sha1', 'sha-1', 'hash', '哈希'], description: '生成 SHA-1 哈希',
    componentFile: 'HashSha1.vue' },
  { id: 'sha224-hash', name: 'SHA224 Hash', nameZh: 'SHA-224 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['sha224', 'sha-224', 'hash', '哈希'], description: '生成 SHA-224 哈希',
    componentFile: 'HashSha224.vue' },
  { id: 'sha256-hash', name: 'SHA256 Hash', nameZh: 'SHA-256 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['sha256', 'sha-256', 'hash', '哈希'], description: '生成 SHA-256 哈希',
    componentFile: 'HashSha256.vue' },
  { id: 'sha384-hash', name: 'SHA384 Hash', nameZh: 'SHA-384 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['sha384', 'sha-384', 'hash', '哈希'], description: '生成 SHA-384 哈希',
    componentFile: 'HashSha384.vue' },
  { id: 'sha512-hash', name: 'SHA512 Hash', nameZh: 'SHA-512 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['sha512', 'sha-512', 'hash', '哈希'], description: '生成 SHA-512 哈希',
    componentFile: 'HashSha512.vue' },
  { id: 'sha3-hash', name: 'SHA3 Hash', nameZh: 'SHA-3 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['sha3', 'sha-3', 'keccak', 'hash', '哈希'], description: '生成 SHA-3 (Keccak) 哈希',
    componentFile: 'HashSha3.vue' },
  { id: 'ripemd160-hash', name: 'RIPEMD-160 Hash', nameZh: 'RIPEMD-160 哈希', icon: 'mdi:shield', category: ['cryptography'], keywords: ['ripemd', 'ripemd160', 'hash', '哈希'], description: '生成 RIPEMD-160 哈希',
    componentFile: 'HashRipemd160.vue' },
  { id: 'crc8-hash', name: 'CRC8 Hash', nameZh: 'CRC8 校验', icon: 'mdi:barcode', category: ['cryptography'], keywords: ['crc8', 'crc-8', 'hash', '校验'], description: '生成 CRC8 校验码',
    componentFile: 'HashCrc8.vue' },
  { id: 'crc16-hash', name: 'CRC16 Hash', nameZh: 'CRC16 校验', icon: 'mdi:barcode', category: ['cryptography'], keywords: ['crc16', 'crc-16', 'hash', '校验'], description: '生成 CRC16 校验码',
    componentFile: 'HashCrc16.vue' },
  { id: 'crc32-hash-algo', name: 'CRC32 Hash', nameZh: 'CRC32 校验', icon: 'mdi:barcode', category: ['cryptography'], keywords: ['crc32', 'crc-32', 'hash', '校验'], description: '生成 CRC32 校验码',
    componentFile: 'HashCrc32.vue' },
  { id: 'adler32-hash', name: 'Adler-32 Hash', nameZh: 'Adler-32 校验', icon: 'mdi:barcode', category: ['cryptography'], keywords: ['adler32', 'adler', 'hash', '校验'], description: '生成 Adler-32 校验码',
    componentFile: 'HashAdler32.vue' }
]
