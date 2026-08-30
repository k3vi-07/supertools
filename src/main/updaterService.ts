import { app, BrowserWindow } from 'electron'
import type { IpcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from '@shared/ipc-channels'

export function setupUpdater(ipcMain: IpcMain): void {
  if (!app.isPackaged) autoUpdater.forceDevUpdateConfig = true
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  const broadcast = (event: { type: string; info?: Record<string, unknown> }): void => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) win.webContents.send(IPC_CHANNELS.UPDATER_EVENT, event)
    }
  }

  autoUpdater.on('checking-for-update', () => broadcast({ type: 'checking' }))
  autoUpdater.on('update-available', (info) => broadcast({ type: 'available', info: { version: info.version, releaseNotes: info.releaseNotes, releaseName: info.releaseName } }))
  autoUpdater.on('update-not-available', () => broadcast({ type: 'not-available' }))
  autoUpdater.on('download-progress', (progress) => broadcast({ type: 'progress', info: { percent: progress.percent, transferred: progress.transferred, total: progress.total } }))
  autoUpdater.on('update-downloaded', (info) => broadcast({ type: 'downloaded', info: { version: info.version } }))
  autoUpdater.on('error', (error) => broadcast({ type: 'error', info: { message: error.message } }))

  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK, async () => {
    try { await autoUpdater.checkForUpdates(); return { ok: true } }
    catch (error) { return { ok: false, error: (error as Error).message } }
  })
  ipcMain.on(IPC_CHANNELS.UPDATER_INSTALL, () => autoUpdater.quitAndInstall())
  ipcMain.handle(IPC_CHANNELS.UPDATER_GET_STATUS, () => ({ currentVersion: app.getVersion() }))
  setTimeout(() => { autoUpdater.checkForUpdates().catch(() => {}) }, 10_000)
}
