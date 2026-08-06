import { app, BrowserWindow, globalShortcut, ipcMain, shell, clipboard, Tray, Menu, nativeImage, net } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import { autoUpdater } from 'electron-updater'

let mainWindow: BrowserWindow | null = null
let searchWindow: BrowserWindow | null = null
let tray: Tray | null = null

/** 是否正在退出应用（用于区分关闭窗口和退出） */
let isQuitting = false

/** 当前主题（由渲染进程同步过来） */
let currentTheme: 'dark' | 'light' = 'dark'

/** 是否 macOS */
const isMac = process.platform === 'darwin'
/** 是否 Windows */
const isWin = process.platform === 'win32'

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
      sandbox: false,
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
      sandbox: false,
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

/** 默认快捷键配置 */
const DEFAULT_SHORTCUTS = {
  main: isMac ? 'Option+Space' : 'Alt+Space',
  search: isMac ? 'Command+Shift+Space' : 'Ctrl+Shift+Space',
  appSearch: isMac ? 'Command+K' : 'Ctrl+K'
}

/** 快捷键配置文件路径 */
function getShortcutsPath(): string {
  return join(app.getPath('userData'), 'shortcuts.json')
}

/** 当前生效的快捷键配置 */
let currentShortcuts = { ...DEFAULT_SHORTCUTS }

/** 加载快捷键配置 */
function loadShortcuts(): typeof DEFAULT_SHORTCUTS {
  try {
    const filePath = getShortcutsPath()
    if (existsSync(filePath)) {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'))
      return { ...DEFAULT_SHORTCUTS, ...data }
    }
  } catch {
    // 忽略
  }
  return { ...DEFAULT_SHORTCUTS }
}

/** 保存快捷键配置 */
function saveShortcuts(shortcuts: typeof DEFAULT_SHORTCUTS): void {
  try {
    writeFileSync(getShortcutsPath(), JSON.stringify(shortcuts, null, 2), 'utf-8')
  } catch {
    // 忽略
  }
}

/** 注册单个全局快捷键，返回是否成功 */
function registerOne(accelerator: string, callback: () => void): boolean {
  if (!accelerator) return true // 空值 = 禁用，视为成功
  return globalShortcut.register(accelerator, callback)
}

/** 注销单个快捷键 */
function unregisterOne(accelerator: string): void {
  if (accelerator && globalShortcut.isRegistered(accelerator)) {
    globalShortcut.unregister(accelerator)
  }
}

/** 注册全局快捷键（从配置读取） */
function registerShortcuts(): void {
  currentShortcuts = loadShortcuts()

  registerOne(currentShortcuts.main, () => {
    toggleMainWindow()
  })
  registerOne(currentShortcuts.search, () => {
    showSearchWindow()
  })
}

/** 更新快捷键配置（unregister 旧的 → register 新的） */
function updateShortcuts(
  newShortcuts: Partial<typeof DEFAULT_SHORTCUTS>
): { ok: boolean; error?: string } {
  const oldShortcuts = { ...currentShortcuts }
  const merged = { ...currentShortcuts, ...newShortcuts }

  // 注销受影响的全局快捷键
  if (newShortcuts.main !== undefined) {
    unregisterOne(oldShortcuts.main)
  }
  if (newShortcuts.search !== undefined) {
    unregisterOne(oldShortcuts.search)
  }

  // 尝试注册新的
  if (newShortcuts.main !== undefined) {
    if (!registerOne(merged.main, () => toggleMainWindow())) {
      // 注册失败，回滚
      registerOne(oldShortcuts.main, () => toggleMainWindow())
      return { ok: false, error: `快捷键 "${merged.main}" 注册失败，可能被其他应用占用` }
    }
  }
  if (newShortcuts.search !== undefined) {
    if (!registerOne(merged.search, () => showSearchWindow())) {
      // 注册失败，回滚
      registerOne(oldShortcuts.main, () => toggleMainWindow()) // 确保新注册的也回滚
      if (newShortcuts.main !== undefined) {
        registerOne(oldShortcuts.main, () => toggleMainWindow())
      }
      registerOne(oldShortcuts.search, () => showSearchWindow())
      return { ok: false, error: `快捷键 "${merged.search}" 注册失败，可能被其他应用占用` }
    }
  }

  currentShortcuts = merged
  saveShortcuts(merged)
  return { ok: true }
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

/** 获取远程工具缓存目录 */
function getCacheDir(): string {
  const dir = join(app.getPath('userData'), 'remote-tools')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** 将 URL 安全转换为缓存文件名 */
function urlToCacheKey(url: string): string {
  // https://cdn.jsdelivr.net/gh/user/repo@version/path/to/File.vue
  // → user_repo@version_path_to_File.vue
  return url
    .replace(/^https?:\/\/[^/]+\/gh\//, '')
    .replace(/[/:]/g, '_')
    .replace(/@/g, '_at_')
}

/** 配置自动更新 */
function setupAutoUpdater(): void {
  // 开发模式下使用 dev-app-update.yml
  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true
  }

  // 自动下载更新
  autoUpdater.autoDownload = true
  // 退出时自动安装已下载的更新
  autoUpdater.autoInstallOnAppQuit = true

  /** 向所有窗口推送更新事件 */
  const sendUpdateEvent = (event: { type: string; info?: Record<string, unknown> }): void => {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      win.webContents.send(IPC_CHANNELS.UPDATER_EVENT, event)
    }
  }

  autoUpdater.on('checking-for-update', () => {
    console.log('🔄 正在检查更新...')
    sendUpdateEvent({ type: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    console.log('📦 发现新版本:', info.version)
    sendUpdateEvent({
      type: 'available',
      info: {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseName: info.releaseName
      }
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('✅ 当前已是最新版本:', info.version)
    sendUpdateEvent({ type: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(`⬇️ 下载中: ${progress.percent.toFixed(1)}%`)
    sendUpdateEvent({
      type: 'progress',
      info: {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total
      }
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ 更新已下载:', info.version)
    sendUpdateEvent({
      type: 'downloaded',
      info: { version: info.version }
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('❌ 更新出错:', err.message)
    sendUpdateEvent({
      type: 'error',
      info: { message: err.message }
    })
  })

  // 手动检查更新
  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK, async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      await autoUpdater.checkForUpdates()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  })

  // 安装已下载的更新
  ipcMain.on(IPC_CHANNELS.UPDATER_INSTALL, (): void => {
    autoUpdater.quitAndInstall()
  })

  // 获取当前版本信息
  ipcMain.handle(IPC_CHANNELS.UPDATER_GET_STATUS, (): { currentVersion: string } => {
    return { currentVersion: app.getVersion() }
  })

  // 启动 10 秒后自动检查更新
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.warn('自动检查更新失败:', err.message)
    })
  }, 10000)
}

/** 设置 IPC 处理器 */
function setupIpcHandlers(): void {
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

  // 用系统浏览器打开 URL
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, (_event, url: string): Promise<void> => {
    return shell.openExternal(url)
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
    return currentShortcuts
  })

  // 更新快捷键配置
  ipcMain.handle(IPC_CHANNELS.SHORTCUT_UPDATE, (_event, shortcuts: Record<string, string>) => {
    return updateShortcuts(shortcuts)
  })

  // 远程文件获取（绕过 CORS，通过主进程 net 模块）
  ipcMain.handle(IPC_CHANNELS.REMOTE_FETCH, async (_event, url: string): Promise<{ ok: boolean; data?: string; error?: string; status?: number }> => {
    try {
      const response = await net.fetch(url)
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}`, status: response.status }
      }
      const data = await response.text()
      return { ok: true, data, status: response.status }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  })

  // 获取远程仓库 registry.json
  // repo 格式: 'user/repo' 或 'user/repo@version'
  //
  // 缓存策略（根治 CDN 缓存过期问题）：
  //   1. 先通过 GitHub API 获取 master 分支最新 commit hash
  //   2. 用 commit hash 构建 CDN URL（commit hash 不可变，CDN 缓存永远正确）
  //   3. GitHub API 失败时，回退到 latest/master/main 并行请求，取工具数最多的
  ipcMain.handle(IPC_CHANNELS.REMOTE_FETCH_REGISTRY, async (_event, repo: string): Promise<{ ok: boolean; data?: unknown; error?: string }> => {
    try {
      // 解析 repo 和 version
      let owner = repo
      let version = ''
      const atIndex = repo.lastIndexOf('@')
      if (atIndex > 0) {
        owner = repo.substring(0, atIndex)
        version = repo.substring(atIndex + 1)
      }

      /** 带超时的 fetch */
      const fetchWithTimeout = async (url: string, timeoutMs = 10000): Promise<Response | null> => {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)
        try {
          const resp = await net.fetch(url, { signal: controller.signal as never })
          clearTimeout(timer)
          return resp
        } catch {
          clearTimeout(timer)
          return null
        }
      }

      /** 获取指定分支最新 commit hash（用于构建不可变 CDN URL） */
      const getLatestCommitHash = async (branch: string): Promise<string | null> => {
        try {
          const resp = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/commits/${branch}`,
            8000
          )
          if (resp && resp.ok) {
            const data = await resp.json() as { sha?: string }
            return data.sha || null
          }
        } catch {
          // 网络问题，回退
        }
        return null
      }

      /** 从 URL 获取 registry 数据 */
      const fetchRegistry = async (url: string): Promise<{ data: { tools: unknown[] } | null; count: number; error: string }> => {
        try {
          const response = await fetchWithTimeout(url)
          if (response && response.ok) {
            const data = await response.json() as { tools?: unknown[] }
            const count = Array.isArray(data?.tools) ? data.tools.length : 0
            return { data: data as { tools: unknown[] }, count, error: '' }
          }
          return { data: null, count: 0, error: `HTTP ${response?.status || 'unknown'}` }
        } catch (err) {
          return { data: null, count: 0, error: (err as Error).message }
        }
      }

      // ---- 第一步：尝试用 commit hash 获取（根治 CDN 缓存问题）----
      const branch = version || 'master'
      const commitHash = await getLatestCommitHash(branch)

      const sources: string[] = []
      if (commitHash) {
        // 用 commit hash 构建 URL — 不可变，CDN 缓存永远正确
        sources.push(`https://cdn.jsdelivr.net/gh/${owner}@${commitHash}/registry.json`)
        sources.push(`https://raw.githubusercontent.com/${owner}/${commitHash}/registry.json`)
      }

      // ---- 第二步：回退源（commit hash 获取失败或作为补充）----
      const refs = version ? [version] : ['latest', 'master', 'main']
      for (const r of refs) {
        sources.push(`https://cdn.jsdelivr.net/gh/${owner}@${r}/registry.json`)
        sources.push(`https://raw.githubusercontent.com/${owner}/${r}/registry.json`)
      }

      // 并行请求所有源，取工具数最多的结果
      const fetchPromises = sources.map((url) => fetchRegistry(url))
      const results = await Promise.all(fetchPromises)

      let bestData: { tools: unknown[] } | null = null
      let bestCount = 0
      let lastError = ''
      for (const result of results) {
        if (result.count > bestCount) {
          bestCount = result.count
          bestData = result.data
        }
        if (!lastError && result.error) {
          lastError = result.error
        }
      }

      if (bestData) {
        return { ok: true, data: bestData }
      }
      return { ok: false, error: `无法获取仓库清单 (${lastError})` }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  })

  // ===== 远程组件本地缓存 =====

  // 读取缓存的组件源码
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_READ, (_event, key: string): { ok: boolean; data?: string } => {
    try {
      const safeKey = urlToCacheKey(key)
      const filePath = join(getCacheDir(), safeKey)
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf-8')
        return { ok: true, data }
      }
      return { ok: false }
    } catch {
      return { ok: false }
    }
  })

  // 写入组件源码到缓存
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_WRITE, (_event, key: string, content: string): { ok: boolean } => {
    try {
      const safeKey = urlToCacheKey(key)
      const filePath = join(getCacheDir(), safeKey)
      writeFileSync(filePath, content, 'utf-8')
      return { ok: true }
    } catch {
      return { ok: false }
    }
  })

  // 删除单个缓存
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_DELETE, (_event, key: string): { ok: boolean } => {
    try {
      const safeKey = urlToCacheKey(key)
      const filePath = join(getCacheDir(), safeKey)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
      return { ok: true }
    } catch {
      return { ok: false }
    }
  })

  // 清空所有缓存
  ipcMain.handle(IPC_CHANNELS.REMOTE_CACHE_CLEAR, (): { ok: boolean } => {
    try {
      const dir = getCacheDir()
      if (existsSync(dir)) {
        for (const file of readdirSync(dir)) {
          unlinkSync(join(dir, file))
        }
      }
      return { ok: true }
    } catch {
      return { ok: false }
    }
  })
}

/** 应用初始化 */
app.whenReady().then((): void => {
  // 禁用 GPU 沙盒以避免某些环境下 GPU 进程崩溃
  app.commandLine.appendSwitch('disable-gpu-sandbox')
  app.commandLine.appendSwitch('no-sandbox')

  createMainWindow()
  createSearchWindow()
  createTray()
  registerShortcuts()
  setupIpcHandlers()
  setupAutoUpdater()

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
