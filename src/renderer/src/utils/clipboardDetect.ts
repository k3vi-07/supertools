import type { ContentType } from '@shared/types'

/** UUID 正则 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** IPv4 正则 */
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/

/** Hex 正则（偶数位） */
const HEX_REGEX = /^(0x)?[0-9a-fA-F]+$/



/** JWT 正则（三段 Base64 URL） */
const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

/** Morse 正则 */
const MORSE_REGEX = /^[\.\-\s/]+$/

/** URL 正则 */
const URL_REGEX = /^https?:\/\/[^\s]+$/i

/** Unicode 转义序列正则 */
const UNICODE_REGEX = /\\u[0-9a-fA-F]{4}/

/**
 * 检测文本的内容类型
 */
export function detectContentType(text: string): ContentType {
  if (!text || !text.trim()) return 'unknown'

  const trimmed = text.trim()

  // JSON（以 { 或 [ 开头）
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && isValidJson(trimmed)) {
    return 'json'
  }

  // JWT（三段式）
  if (JWT_REGEX.test(trimmed) && trimmed.split('.').length === 3) {
    return 'jwt'
  }

  // UUID
  if (UUID_REGEX.test(trimmed)) {
    return 'uuid'
  }

  // URL
  if (URL_REGEX.test(trimmed)) {
    return 'url'
  }

  // IPv4
  if (IPV4_REGEX.test(trimmed) && trimmed.split('.').every((n) => Number(n) <= 255)) {
    return 'ipv4'
  }

  // 时间戳（纯数字 10 位或 13 位）
  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) {
    return 'timestamp'
  }

  // Base64（长度 >= 16，只含合法字符，且有填充或长度为 4 的倍数）
  if (trimmed.length >= 16 && isBase64(trimmed)) {
    return 'base64'
  }

  // Unicode 转义
  if (UNICODE_REGEX.test(trimmed) && (trimmed.match(/\\u/g)?.length ?? 0) >= 2) {
    return 'unicode'
  }

  // Morse
  if (MORSE_REGEX.test(trimmed) && trimmed.includes('.') && trimmed.includes('-')) {
    return 'morse'
  }

  // Hex（纯十六进制，偶数长度）
  if (HEX_REGEX.test(trimmed) && trimmed.length >= 8 && trimmed.length % 2 === 0) {
    return 'hex'
  }

  // HTML
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    return 'html'
  }

  // CSS
  if (/[a-z-]+\s*:\s*[^;]+;/i.test(trimmed) && trimmed.includes('{') === false) {
    return 'css'
  }

  // JavaScript
  if (/\b(function|const|let|var|=>|console\.log)\b/.test(trimmed)) {
    return 'javascript'
  }

  return 'text'
}

/** 验证 JSON */
function isValidJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

/** 验证 Base64 */
function isBase64(text: string): boolean {
  const cleaned = text.replace(/\s/g, '').replace(/=+$/, '')
  if (!cleaned) return false
  return /^[A-Za-z0-9+/]+$/.test(cleaned) || /^[A-Za-z0-9_-]+$/.test(cleaned)
}

/** 内容类型的中文描述 */
export const contentTypeLabels: Record<ContentType, string> = {
  json: 'JSON',
  base64: 'Base64',
  url: 'URL',
  uuid: 'UUID',
  jwt: 'JWT',
  timestamp: '时间戳',
  hex: 'Hex 十六进制',
  unicode: 'Unicode 转义',
  ipv4: 'IPv4 地址',
  ipv6: 'IPv6 地址',
  morse: '摩斯密码',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  regex: '正则表达式',
  text: '纯文本',
  unknown: '未知'
}
