import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs'
import { createHash } from 'crypto'
import { join, resolve, sep } from 'path'
import { validateRemoteUrl } from './remoteService'

function cacheDir(): string {
  const dir = join(app.getPath('userData'), 'remote-tools')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function cacheKeyToFileName(key: string): string {
  const validation = validateRemoteUrl(key)
  if (!validation.ok) throw new Error(validation.error)
  return `${createHash('sha256').update(key).digest('hex')}.vue`
}

function cachePath(key: string): string {
  const base = resolve(cacheDir())
  const filename = cacheKeyToFileName(key)
  const target = resolve(base, filename)
  if (!target.startsWith(base + sep)) throw new Error('缓存路径越界')
  return target
}

export function readRemoteCache(key: string): string | null {
  try { const path = cachePath(key); return existsSync(path) ? readFileSync(path, 'utf8') : null } catch { return null }
}

export function writeRemoteCache(key: string, content: string): boolean {
  try { writeFileSync(cachePath(key), content, 'utf8'); return true } catch { return false }
}

export function deleteRemoteCache(key: string): boolean {
  try { const path = cachePath(key); if (existsSync(path)) unlinkSync(path); return true } catch { return false }
}

export function clearRemoteCache(): boolean {
  try { for (const file of readdirSync(cacheDir())) unlinkSync(join(cacheDir(), file)); return true } catch { return false }
}
