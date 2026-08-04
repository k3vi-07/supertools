import type { He3API, Theme, Lang } from '@shared/types'

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
}

declare global {
  interface Window {
    $he3: He3API
    supertools: SuperToolsAPI
  }
}

export {}
