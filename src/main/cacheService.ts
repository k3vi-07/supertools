import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs'
import { join } from 'path'

function cacheDir(): string {
  const dir = join(app.getPath('userData'), 'remote-tools')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function cachePath(key: string): string {
  const safeKey = key.replace(/^https?:\/\/[^/]+\/gh\//, '').replace(/[/:]/g, '_').replace(/@/g, '_at_')
  return join(cacheDir(), safeKey)
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
