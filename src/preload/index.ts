import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc-channels'
import type { He3API, Theme } from '@shared/types'

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
    return (localStorage.getItem('lang') as 'zh' | 'en') || 'zh'
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
    ipcRenderer.send(IPC_CHANNELS.NAVIGATE_TO_TOOL, toolId)
  },
  hideSearch: (): void => {
    ipcRenderer.send(IPC_CHANNELS.HIDE_SEARCH_OVERLAY)
  },
  showMain: (): void => {
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
  }
})
