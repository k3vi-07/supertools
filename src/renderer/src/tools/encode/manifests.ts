import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 编码解码类工具元数据 */
export const encodeToolManifests: Manifest[] = [
  {
    id: 'url-encode',
    name: 'URL Encode',
    nameZh: 'URL 编码解码',
    icon: 'mdi:link-variant',
    category: ['encode'],
    keywords: ['url', 'uri', 'encode', 'decode', 'percent', '编码', '解码'],
    description: 'URL 编码与解码（URI / URI Component）',
    relatedToolId: ['base64-encode'],
    advance: {
      recommend: { type: 'url', priority: 5 },
      conversionFunction: (input: string) => encodeURI(input)
    }
  },
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    nameZh: 'Base64 编码解码',
    icon: 'mdi:binary',
    category: ['encode'],
    keywords: ['base64', 'encode', 'decode', 'atob', 'btoa', '编码', '解码'],
    description: 'Base64 编码与解码',
    relatedToolId: ['base32-encode', 'hex-to-ascii'],
    advance: {
      recommend: { type: 'base64', priority: 5 }
    }
  },
  {
    id: 'base32-encode',
    name: 'Base32 Encode',
    nameZh: 'Base32 编码解码',
    icon: 'mdi:format-wrap-top-bottom',
    category: ['encode'],
    keywords: ['base32', 'encode', 'decode', '编码', '解码'],
    description: 'Base32 编码与解码'
  },
  {
    id: 'html-encode',
    name: 'HTML Entity Encode',
    nameZh: 'HTML 实体编码解码',
    icon: 'mdi:code-tags',
    category: ['encode'],
    keywords: ['html', 'entity', 'encode', 'decode', 'escape', '编码', '实体'],
    description: 'HTML 实体编码与解码',
    advance: {
      recommend: { type: 'html', priority: 3 }
    }
  },
  {
    id: 'hex-to-ascii',
    name: 'Hex to ASCII',
    nameZh: 'Hex 与 ASCII 互转',
    icon: 'mdi:hexadecimal',
    category: ['encode'],
    keywords: ['hex', 'ascii', 'convert', '十六进制', '转换'],
    description: '十六进制与 ASCII 文本互转',
    advance: {
      recommend: { type: 'hex', priority: 4 }
    }
  },
  {
    id: 'unicode-convert',
    name: 'Unicode Convert',
    nameZh: 'Unicode 转中文',
    icon: 'mdi:translate',
    category: ['encode'],
    keywords: ['unicode', '中文', 'chinese', 'convert', '转换', '转义'],
    description: 'Unicode 转义与中文互转',
    advance: {
      recommend: { type: 'unicode', priority: 4 }
    }
  },
  {
    id: 'morse-code',
    name: 'Morse Code',
    nameZh: '摩斯密码编解码',
    icon: 'mdi:morse-code',
    category: ['encode'],
    keywords: ['morse', 'code', 'encode', 'decode', '摩斯', '密码'],
    description: '摩斯密码编码与解码',
    advance: {
      recommend: { type: 'morse', priority: 3 }
    }
  },
  {
    id: 'qrcode-generator',
    name: 'QR Code Generator',
    nameZh: '二维码生成器',
    icon: 'mdi:qrcode',
    category: ['encode'],
    keywords: ['qrcode', 'qr', '二维码', 'barcode', '生成'],
    description: '为文本或 URL 生成二维码'
  },
  {
    id: 'base58-encode',
    name: 'Base58 Encode',
    nameZh: 'Base58 编码解码',
    icon: 'mdi:hash',
    category: ['encode'],
    keywords: ['base58', 'bitcoin', 'encode', 'decode', '编码', '解码'],
    description: 'Base58 编码与解码（Bitcoin 风格）'
  },
  {
    id: 'base62-encode',
    name: 'Base62 Encode',
    nameZh: 'Base62 编码解码',
    icon: 'mdi:format-list-numbered',
    category: ['encode'],
    keywords: ['base62', 'encode', 'decode', '编码', '解码'],
    description: 'Base62 编码与解码'
  },
  {
    id: 'ascii-table',
    name: 'ASCII Table',
    nameZh: 'ASCII 码表',
    icon: 'mdi:table',
    category: ['encode'],
    keywords: ['ascii', 'table', 'code', '字符', '编码表'],
    description: 'ASCII 字符编码对照表（0-255）'
  },
  {
    id: 'punycode-convert',
    name: 'Punycode Convert',
    nameZh: 'Punycode 域名转换',
    icon: 'mdi:web',
    category: ['encode'],
    keywords: ['punycode', 'idn', 'domain', '域名', '国际化域名'],
    description: '国际化域名 (IDN) 与 Punycode 互转'
  }
]
