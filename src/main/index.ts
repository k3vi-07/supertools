import { app, BrowserWindow, globalShortcut, ipcMain as electronIpcMain, shell, clipboard, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { openRemoteToolWindow } from './remoteToolWindow'
import { readRemoteCache, writeRemoteCache, deleteRemoteCache, clearRemoteCache } from './cacheService'
import { createShortcutManager } from './shortcutManager'
import { createIpcRegistry } from './ipcRegistry'
import { setupUpdater } from './updaterService'
import { fetchRemoteText } from './remoteService'
import { fetchRemoteRegistry } from './remoteRegistryService'
import { createCipheriv, createDecipheriv } from 'node:crypto'

let mainWindow: BrowserWindow | null = null
let searchWindow: BrowserWindow | null = null
let remoteToolWindow: BrowserWindow | null = null
let tray: Tray | null = null

/** 是否正在退出应用（用于区分关闭窗口和退出） */
let isQuitting = false

/** 当前主题（由渲染进程同步过来） */
let currentTheme: 'dark' | 'light' = 'dark'

/** 是否 macOS */
const isMac = process.platform === 'darwin'
/** 是否 Windows */
const isWin = process.platform === 'win32'
const ipcMain = createIpcRegistry(electronIpcMain)
const shortcutManager = createShortcutManager(isMac, () => toggleMainWindow(), () => showSearchWindow())

/** 创建主窗口 */
function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.center()
    mainWindow?.show()
    mainWindow?.focus()
    // 开发环境自动打开 DevTools
    if (process.env['NODE_ENV'] === 'development' || process.env['ELECTRON_RENDERER_URL']) {
      mainWindow?.webContents.openDevTools({ mode: 'detach' })
    }
  })

  // 页面加载失败时打印错误
  mainWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription) => {
    console.error('❌ 页面加载失败:', errorCode, errorDescription)
  })

  // 打印渲染进程的 console 消息
  mainWindow.webContents.on('console-message', (_e, level, message) => {
    const prefix = level === 2 ? '⚠️' : level === 3 ? '❌' : '📝'
    console.log(`${prefix} [Renderer] ${message}`)
  })

  // 页面加载完成后打印确认
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ 页面加载完成')
  })

  // macOS 关闭窗口时隐藏到托盘，而非退出；真正退出时允许关闭
  mainWindow.on('close', (e) => {
    if (isMac && !isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  // 开发环境加载 dev server，生产环境加载打包文件
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

/** 创建搜索浮层窗口（Spotlight 风格） */
function createSearchWindow(): BrowserWindow {
  searchWindow = new BrowserWindow({
    width: 680,
    height: 460,
    frame: false,
    resizable: false,
    movable: false,
    show: false,
    skipTaskbar: true,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: true,
    fullscreenable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 居中显示在屏幕上方区域
  searchWindow.on('blur', () => {
    hideSearchWindow()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    searchWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/search')
  } else {
    searchWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/search' })
  }

  return searchWindow
}

/** 显示搜索浮层 */
function showSearchWindow(): void {
  if (!searchWindow) {
    createSearchWindow()
  }
  // 获取当前活动显示器，居中靠上显示
  const { screen } = require('electron')
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const { width } = display.workAreaSize
  const x = Math.round((width - 680) / 2)
  const y = Math.round(display.workAreaSize.height * 0.25)

  if (searchWindow && !searchWindow.isVisible()) {
    searchWindow.setPosition(x, y, false)
    searchWindow.show()
    searchWindow.focus()
    searchWindow.webContents.send('search:show')
  } else if (searchWindow) {
    searchWindow.focus()
    searchWindow.webContents.send('search:focus')
  }
}

/** 隐藏搜索浮层 */
function hideSearchWindow(): void {
  if (searchWindow && searchWindow.isVisible()) {
    searchWindow.hide()
  }
}

/** 在独立 sandbox 窗口中打开远程工具，避免第三方组件进入主窗口组件树。 */
function showRemoteToolWindow(toolId: string): void {
  if (remoteToolWindow && !remoteToolWindow.isDestroyed()) {
    remoteToolWindow.focus()
    if (process.env['ELECTRON_RENDERER_URL']) {
      remoteToolWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/tool/${encodeURIComponent(toolId)}?isolated=1`)
    } else {
      remoteToolWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: `/tool/${encodeURIComponent(toolId)}?isolated=1` })
    }
    return
  }
  remoteToolWindow = openRemoteToolWindow(toolId)
  remoteToolWindow.on('closed', () => { remoteToolWindow = null })
}

/** 显示/隐藏主窗口 */
function toggleMainWindow(): void {
  if (!mainWindow) {
    createMainWindow()
    return
  }
  if (mainWindow.isVisible() && mainWindow.isFocused()) {
    if (isMac) {
      mainWindow.hide()
    } else {
      mainWindow.hide()
    }
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

/** 创建系统托盘 */
function createTray(): void {
  // 使用应用图标作为托盘图标（缩放到 22x22 适配 macOS 菜单栏）
  const iconPath = join(__dirname, '../../build/icon.png')
  let icon: Electron.NativeImage
  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty()
    } else {
      icon = icon.resize({ width: 22, height: 22 })
    }
  } catch {
    icon = nativeImage.createEmpty()
  }
  tray = new Tray(icon)
  tray.setToolTip('SuperTools - 开发者工具箱')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: (): void => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: '快速搜索',
      click: (): void => {
        showSearchWindow()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: (): void => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', (): void => {
    toggleMainWindow()
  })
}

/** 设置 IPC 处理器 */
function setupIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CRYPTO_CAMELLIA_BLOCK, (_event, mode: string, keyHex: string, dataHex: string): string => {
    if (mode !== 'encrypt' && mode !== 'decrypt') throw new Error('不支持的 Camellia 操作')
    if (!/^(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{48}|[0-9a-fA-F]{64})$/.test(keyHex)) throw new Error('Camellia 密钥必须为 128/192/256 位 Hex')
    if (!/^[0-9a-fA-F]{32}$/.test(dataHex)) throw new Error('Camellia 数据必须为 128 位 Hex')
    const algorithm = `camellia-${keyHex.length * 4}-ecb`
    const transform = mode === 'encrypt'
      ? createCipheriv(algorithm, Buffer.from(keyHex, 'hex'), null)
      : createDecipheriv(algorithm, Buffer.from(keyHex, 'hex'), null)
    transform.setAutoPadding(false)
    return Buffer.concat([transform.update(Buffer.from(dataHex, 'hex')), transform.final()]).toString('hex')
  })
  // 读取剪贴板
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_READ, (): string => {
    return clipboard.readText()
  })

  // 写入剪贴板
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE, (_event, text: string): void => {
    clipboard.writeText(text)
  })

  // 显示主窗口
  ipcMain.on(IPC_CHANNELS.SHOW_MAIN_WINDOW, (): void => {
    mainWindow?.show()
    mainWindow?.focus()
  })

  // 隐藏主窗口
  ipcMain.on(IPC_CHANNELS.HIDE_MAIN_WINDOW, (): void => {
    if (!isMac) {
      mainWindow?.hide()
    }
  })

  // 显示搜索浮层
  ipcMain.on(IPC_CHANNELS.SHOW_SEARCH_OVERLAY, (): void => {
    showSearchWindow()
  })

  // 隐藏搜索浮层
  ipcMain.on(IPC_CHANNELS.HIDE_SEARCH_OVERLAY, (): void => {
    hideSearchWindow()
  })

  // 导航到工具（从搜索浮层打开工具）
  ipcMain.on(IPC_CHANNELS.NAVIGATE_TO_TOOL, (_event, toolId: string): void => {
    if (!mainWindow) {
      createMainWindow()
    }
    mainWindow?.show()
    mainWindow?.focus()
    mainWindow?.webContents.send('navigate:tool', toolId)
    hideSearchWindow()
  })

  ipcMain.on(IPC_CHANNELS.OPEN_REMOTE_TOOL, (_event, toolId: string): void => {
    if (typeof toolId !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(toolId)) return
    showRemoteToolWindow(toolId)
  })

  // 用系统浏览器打开 URL
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, (_event, url: string): Promise<void> => {
    let parsed: URL
    try { parsed = new URL(url) } catch { return Promise.reject(new Error('无效的外部链接')) }
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return Promise.reject(new Error('不支持的链接协议'))
    }
    return shell.openExternal(parsed.toString())
  })

  // 获取平台信息
  ipcMain.handle(IPC_CHANNELS.GET_PLATFORM_INFO, (): Record<string, unknown> => {
    return {
      isMacOS: isMac,
      isWindows: isWin,
      isLinux: !isMac && !isWin,
      platform: process.platform,
      versions: process.versions
    }
  })

  // 主题变化
  ipcMain.on(IPC_CHANNELS.THEME_CHANGED, (_event, theme: 'dark' | 'light'): void => {
    currentTheme = theme
  })

  // ===== 快捷键配置 =====

  // 获取当前快捷键配置
  ipcMain.handle(IPC_CHANNELS.SHORTCUT_GET, () => {
    return shortcutManager.get()
  })

  // 更新快捷键配置
  ipcMain.handle(IPC_CHANNELS.SHORTCUT_UPDATE, (_event, shortcuts: Record<string, string>) => {
    return shortcutManager.update(shortcuts)
  })

  ipcMain.handle(IPC_CHANNELS.REMOTE_FETCH, async (_event, url: string): Promise<{ ok: boolean; data?: string; error?: string; status?: number }> => {
    return fetchRemoteText(url)
  })

  // registry 获取由独立服务负责。
  ipcMain.handle(IPC_CHANNELS.REMOTE_FETCH_REGISTRY, (_event, repo: string) => fetchRemoteRegistry(repo))

  // ===== 远程组件本地缓存 =====

  // 读取缓存的组件源码
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_READ, (_event, key: string): { ok: boolean; data?: string } => {
    try {
      const data = readRemoteCache(key)
      return data === null ? { ok: false } : { ok: true, data }
    } catch {
      return { ok: false }
    }
  })

  // 写入组件源码到缓存
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_WRITE, (_event, key: string, content: string): { ok: boolean } => {
    try {
      return { ok: writeRemoteCache(key, content) }
    } catch {
      return { ok: false }
    }
  })

  // 删除单个缓存
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_DELETE, (_event, key: string): { ok: boolean } => {
    try {
      return { ok: deleteRemoteCache(key) }
    } catch {
      return { ok: false }
    }
  })

  // 清空所有缓存
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_CLEAR, (): { ok: boolean } => {
    try {
      return { ok: clearRemoteCache() }
    } catch {
      return { ok: false }
    }
  })
}

/** 应用初始化 */
app.whenReady().then((): void => {
  createMainWindow()
  createSearchWindow()
  createTray()
  shortcutManager.registerAll()
  setupIpcHandlers()
  setupUpdater(ipcMain)

  app.on('activate', (): void => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    } else {
      mainWindow?.show()
    }
  })
})

/** 所有窗口关闭时退出（macOS 除外） */
app.on('window-all-closed', (): void => {
  if (!isMac) {
    app.quit()
  }
})

/** 应用即将退出时设置标志，让 close 事件不再阻止窗口关闭 */
app.on('before-quit', (): void => {
  isQuitting = true
})

/** 应用退出前注销所有快捷键 */
app.on('will-quit', (): void => {
  globalShortcut.unregisterAll()
})
