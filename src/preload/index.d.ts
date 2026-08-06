import type { He3API, Theme, Lang } from '@shared/types'

/** 自动更新事件 */
interface UpdateEvent {
  type: 'checking' | 'available' | 'not-available' | 'progress' | 'downloaded' | 'error'
  info?: {
    version?: string
    releaseNotes?: string | null
    releaseName?: string | null
    percent?: number
    transferred?: number
    total?: number
    message?: string
  }
}

/** supertools 预加载 API（搜索浮层导航等） */
interface SuperToolsAPI {
  navigateToTool(toolId: string): void
  hideSearch(): void
  showMain(): void
  onHide(cb: () => void): void
  onShow(cb: () => void): void
  onFocus(cb: () => void): void
  onNavigate(cb: (toolId: string) => void): void
  /** 通过主进程代理获取远程文件内容 */
  fetchRemote(url: string): Promise<string>
  /** 获取远程仓库工具清单 */
  fetchRegistry(repo: string): Promise<unknown>
  /** 读取本地缓存的组件源码（未命中返回 null） */
  readCache(key: string): Promise<string | null>
  /** 将组件源码写入本地缓存 */
  writeCache(key: string, content: string): Promise<boolean>
  /** 删除单个组件缓存 */
  deleteCache(key: string): Promise<boolean>
  /** 清空所有组件缓存 */
  clearCache(): Promise<boolean>
  /** 手动检查更新 */
  checkForUpdates(): Promise<void>
  /** 安装已下载的更新并重启 */
  installUpdate(): void
  /** 获取当前版本信息 */
  getUpdateStatus(): Promise<{ currentVersion: string }>
  /** 监听主进程推送的更新事件 */
  onUpdateEvent(cb: (event: UpdateEvent) => void): void
  /** 获取当前快捷键配置 */
  getShortcuts(): Promise<{ main: string; search: string; appSearch: string }>
  /** 更新快捷键配置 */
  updateShortcuts(shortcuts: Record<string, string>): Promise<{ ok: boolean; error?: string }>
}

declare global {
  interface Window {
    $he3: He3API
    supertools: SuperToolsAPI
  }
}

export {}
