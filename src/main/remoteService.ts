import { net } from 'electron'

export const REMOTE_LIMITS = {
  fetchBytes: 5 * 1024 * 1024,
  registryBytes: 1024 * 1024,
  timeoutMs: 10_000
} as const

const ALLOWED_DOMAINS = new Set(['cdn.jsdelivr.net', 'raw.githubusercontent.com', 'api.github.com', 'data.jsdelivr.com'])
const REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/

export function validateRemoteUrl(value: string): { ok: boolean; error?: string } {
  let url: URL
  try { url = new URL(value) } catch { return { ok: false, error: '无效的 URL' } }
  if (url.protocol !== 'https:') return { ok: false, error: '仅允许 HTTPS 请求' }
  if (!ALLOWED_DOMAINS.has(url.hostname)) return { ok: false, error: `域名 ${url.hostname} 不在白名单中` }
  if (url.pathname.includes('..') || url.pathname.toLowerCase().includes('%2e')) return { ok: false, error: 'URL 路径包含非法字符' }
  return { ok: true }
}

export function validateRepoId(value: string): boolean {
  const at = value.lastIndexOf('@')
  return REPO_REGEX.test(at > 0 ? value.substring(0, at) : value)
}

export async function fetchRemoteText(url: string, maxBytes = REMOTE_LIMITS.fetchBytes): Promise<{ ok: boolean; data?: string; error?: string; status?: number }> {
  const validation = validateRemoteUrl(url)
  if (!validation.ok) return { ok: false, error: validation.error }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REMOTE_LIMITS.timeoutMs)
  try {
    const response = await net.fetch(url, { signal: controller.signal as never, redirect: 'error' })
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}`, status: response.status }
    const contentLength = Number.parseInt(response.headers.get('content-length') || '0', 10)
    if (contentLength > maxBytes) return { ok: false, error: `响应超过 ${(maxBytes / 1024 / 1024).toFixed(0)}MB 限制` }
    const data = await response.text()
    return data.length > maxBytes ? { ok: false, error: '响应数据超过大小限制' } : { ok: true, data, status: response.status }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  } finally {
    clearTimeout(timer)
  }
}
