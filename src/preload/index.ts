import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { He3API, Theme } from '@shared/types'

/** 专用远程工具窗口只允许加载远程组件所需能力。 */
const isIsolatedRemoteWindow = location.hash.includes('?isolated=1')

/** 剪贴板值使用回调 */
let clipboardValueUsedCallback: (() => void) | null = null

/** 主题变化回调列表 */
const themeChangeCallbacks: ((theme: Theme) => void)[] = []

/** 平台信息缓存 */
let platformInfo: {
  isMacOS: boolean
  isWindows: boolean
  isLinux: boolean
} | null = null

/** 初始化平台信息 */
async function initPlatformInfo(): Promise<void> {
  if (!platformInfo) {
    platformInfo = (await ipcRenderer.invoke(IPC_CHANNELS.GET_PLATFORM_INFO)) as {
      isMacOS: boolean
      isWindows: boolean
      isLinux: boolean
    }
  }
}

/** $he3 API 实现 */
const he3Api: He3API = {
  async getLastClipboard(): Promise<string> {
    return ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_READ)
  },

  async copyText(text: string): Promise<void> {
    await ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE, text)
  },

  onUseClipboardValue(cb: () => void): void {
    clipboardValueUsedCallback = cb
  },

  message: {
    success(text: string): void {
      // 通过自定义事件通知渲染进程的消息组件
      window.dispatchEvent(
        new CustomEvent('he3:message', { detail: { type: 'success', text } })
      )
    },
    error(text: string): void {
      window.dispatchEvent(
        new CustomEvent('he3:message', { detail: { type: 'error', text } })
      )
    },
    info(text: string): void {
      window.dispatchEvent(
        new CustomEvent('he3:message', { detail: { type: 'info', text } })
      )
    },
    warning(text: string): void {
      window.dispatchEvent(
        new CustomEvent('he3:message', { detail: { type: 'warning', text } })
      )
    }
  },

  get theme(): Theme {
    return (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
  },

  get lang(): 'zh' | 'en' {
    return (localStorage.getItem('supertools:lang') as 'zh' | 'en') || 'zh'
  },

  get isMacOS(): boolean {
    return platformInfo?.isMacOS ?? false
  },

  get isWindows(): boolean {
    return platformInfo?.isWindows ?? false
  },

  get isLinux(): boolean {
    return platformInfo?.isLinux ?? false
  },

  get isDev(): boolean {
    return Boolean(import.meta.env.DEV)
  },

  subscribeThemeChange(cb: (theme: Theme) => void): void {
    themeChangeCallbacks.push(cb)
    // 监听 DOM 属性变化
    const observer = new MutationObserver((): void => {
      const theme = (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
      cb(theme)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
  },

  async shellOpenExternal(url: string): Promise<void> {
    if (isIsolatedRemoteWindow) return
    await ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url)
  }
}

// 初始化平台信息
initPlatformInfo()

// 通过 contextBridge 暴露 $he3 API（安全方式）
contextBridge.exposeInMainWorld('$he3', {
  getLastClipboard: he3Api.getLastClipboard,
  copyText: he3Api.copyText,
  onUseClipboardValue: he3Api.onUseClipboardValue,
  message: he3Api.message,
  get theme(): Theme {
    return he3Api.theme
  },
  get lang(): 'zh' | 'en' {
    return he3Api.lang
  },
  get isMacOS(): boolean {
    return he3Api.isMacOS
  },
  get isWindows(): boolean {
    return he3Api.isWindows
  },
  get isLinux(): boolean {
    return he3Api.isLinux
  },
  get isDev(): boolean {
    return he3Api.isDev
  },
  subscribeThemeChange: he3Api.subscribeThemeChange,
  shellOpenExternal: he3Api.shellOpenExternal
})

// 暴露导航相关 API（用于搜索浮层）
contextBridge.exposeInMainWorld('supertools', {
  navigateToTool: (toolId: string): void => {
    if (isIsolatedRemoteWindow) return
    ipcRenderer.send(IPC_CHANNELS.NAVIGATE_TO_TOOL, toolId)
  },
  hideSearch: (): void => {
    if (isIsolatedRemoteWindow) return
    ipcRenderer.send(IPC_CHANNELS.HIDE_SEARCH_OVERLAY)
  },
  showMain: (): void => {
    if (isIsolatedRemoteWindow) return
    ipcRenderer.send(IPC_CHANNELS.SHOW_MAIN_WINDOW)
  },
  onHide: (cb: () => void): void => {
    ipcRenderer.on('search:hide', cb)
  },
  onShow: (cb: () => void): void => {
    ipcRenderer.on('search:show', cb)
  },
  onFocus: (cb: () => void): void => {
    ipcRenderer.on('search:focus', cb)
  },
  onNavigate: (cb: (toolId: string) => void): void => {
    ipcRenderer.on('navigate:tool', (_e, toolId: string) => cb(toolId))
  },
  openRemoteTool: (toolId: string): void => {
    if (isIsolatedRemoteWindow) return
    ipcRenderer.send(IPC_CHANNELS.OPEN_REMOTE_TOOL, toolId)
  },

  // ===== 远程工具加载 API =====

  /** 通过主进程代理获取远程文件（绕过 CORS） */
  fetchRemote: async (url: string): Promise<string> => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.REMOTE_FETCH, url)
    const res = result as { ok: boolean; data?: string; error?: string }
    if (!res.ok) {
      throw new Error(res.error || '远程获取失败')
    }
    return res.data || ''
  },

  /** 获取远程仓库的工具清单 */
  fetchRegistry: async (repo: string): Promise<unknown> => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.REMOTE_FETCH_REGISTRY, repo)
    const res = result as { ok: boolean; data?: unknown; error?: string }
    if (!res.ok) {
      throw new Error(res.error || '获取清单失败')
    }
    return res.data
  },

  // ===== 远程组件本地缓存 API =====

  /** 读取本地缓存的组件源码（未命中返回 null） */
  readCache: async (key: string): Promise<string | null> => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.REMOTE_CACHE_READ, key)
    const res = result as { ok: boolean; data?: string }
    return res.ok ? (res.data || null) : null
  },

  /** 将组件源码写入本地缓存 */
  writeCache: async (key: string, content: string): Promise<boolean> => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.REMOTE_CACHE_WRITE, key, content)
    return (result as { ok: boolean }).ok
  },

  /** 删除单个组件缓存 */
  deleteCache: async (key: string): Promise<boolean> => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.REMOTE_CACHE_DELETE, key)
    return (result as { ok: boolean }).ok
  },

  /** 清空所有组件缓存 */
  clearCache: async (): Promise<boolean> => {
    if (isIsolatedRemoteWindow) return false
    const result = await ipcRenderer.invoke(IPC_CHANNELS.REMOTE_CACHE_CLEAR)
    return (result as { ok: boolean }).ok
  },

  camelliaBlock: (mode: 'encrypt' | 'decrypt', keyHex: string, dataHex: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.CRYPTO_CAMELLIA_BLOCK, mode, keyHex, dataHex),

  // ===== 自动更新 API =====

  /** 手动检查更新 */
  checkForUpdates: async (): Promise<void> => {
    if (isIsolatedRemoteWindow) return
    await ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK)
  },

  /** 安装已下载的更新并重启 */
  installUpdate: (): void => {
    if (isIsolatedRemoteWindow) return
    ipcRenderer.send(IPC_CHANNELS.UPDATER_INSTALL)
  },

  /** 获取当前版本信息 */
  getUpdateStatus: async (): Promise<{ currentVersion: string }> => {
    if (isIsolatedRemoteWindow) return { currentVersion: '' }
    return ipcRenderer.invoke(IPC_CHANNELS.UPDATER_GET_STATUS)
  },

  /** 监听主进程推送的更新事件 */
  onUpdateEvent: (cb: (event: { type: string; info?: Record<string, unknown> }) => void): void => {
    if (isIsolatedRemoteWindow) return
    ipcRenderer.on(IPC_CHANNELS.UPDATER_EVENT, (_e, event) => cb(event))
  },

  // ===== 快捷键配置 API =====

  /** 获取当前快捷键配置 */
  getShortcuts: async (): Promise<{ main: string; search: string; appSearch: string }> => {
    if (isIsolatedRemoteWindow) return { main: '', search: '', appSearch: '' }
    return ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_GET)
  },

  /** 更新快捷键配置 */
  updateShortcuts: async (shortcuts: Record<string, string>): Promise<{ ok: boolean; error?: string }> => {
    if (isIsolatedRemoteWindow) return { ok: false, error: '远程工具窗口不支持快捷键配置' }
    return ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_UPDATE, shortcuts)
  }
})
