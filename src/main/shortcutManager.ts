import { app, globalShortcut } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export interface Shortcuts { main: string; search: string; appSearch: string }

export function createShortcutManager(isMac: boolean, onMain: () => void, onSearch: () => void) {
  const defaults: Shortcuts = { main: isMac ? 'Option+Space' : 'Alt+Space', search: isMac ? 'Command+Shift+Space' : 'Ctrl+Shift+Space', appSearch: isMac ? 'Command+K' : 'Ctrl+K' }
  let current = { ...defaults }
  const path = join(app.getPath('userData'), 'shortcuts.json')
  const load = (): Shortcuts => {
    try { return existsSync(path) ? { ...defaults, ...JSON.parse(readFileSync(path, 'utf8')) } : { ...defaults } } catch { return { ...defaults } }
  }
  const save = (value: Shortcuts): void => { try { writeFileSync(path, JSON.stringify(value, null, 2), 'utf8') } catch {} }
  const register = (accelerator: string, callback: () => void): boolean => !accelerator || globalShortcut.register(accelerator, callback)
  const unregister = (accelerator: string): void => { if (accelerator && globalShortcut.isRegistered(accelerator)) globalShortcut.unregister(accelerator) }
  const registerAll = (): void => { current = load(); register(current.main, onMain); register(current.search, onSearch) }
  const update = (changes: Partial<Shortcuts>): { ok: boolean; error?: string } => {
    const old = { ...current }; const next = { ...current, ...changes }
    if (changes.main !== undefined) unregister(old.main)
    if (changes.search !== undefined) unregister(old.search)
    if (changes.main !== undefined && !register(next.main, onMain)) { register(old.main, onMain); return { ok: false, error: `快捷键 "${next.main}" 注册失败，可能被其他应用占用` } }
    if (changes.search !== undefined && !register(next.search, onSearch)) { unregister(next.main); register(old.main, onMain); register(old.search, onSearch); return { ok: false, error: `快捷键 "${next.search}" 注册失败，可能被其他应用占用` } }
    current = next; save(current); return { ok: true }
  }
  return { get: (): Shortcuts => ({ ...current }), registerAll, update }
}
