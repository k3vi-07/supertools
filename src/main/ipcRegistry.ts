import type { IpcMain } from 'electron'

/** 统一 IPC 注册器：避免热重载或重复初始化导致 channel 重复注册。 */
export function createIpcRegistry(ipcMain: IpcMain): IpcMain {
  const handlers = new Set<string>()
  const events = new Set<string>()
  const registry = Object.create(ipcMain) as IpcMain

  registry.handle = ((channel, listener) => {
    if (handlers.has(channel)) ipcMain.removeHandler(channel)
    handlers.add(channel)
    return ipcMain.handle(channel, listener)
  }) as IpcMain['handle']

  registry.on = ((channel, listener) => {
    if (events.has(channel)) ipcMain.removeAllListeners(channel)
    events.add(channel)
    return ipcMain.on(channel, listener)
  }) as IpcMain['on']

  return registry
}
