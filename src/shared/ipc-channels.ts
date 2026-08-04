/** IPC 通信频道定义 */
export const IPC_CHANNELS = {
  /** 获取剪贴板文本 */
  CLIPBOARD_READ: 'clipboard:read',
  /** 写入剪贴板文本 */
  CLIPBOARD_WRITE: 'clipboard:write',
  /** 显示主窗口 */
  SHOW_MAIN_WINDOW: 'window:show-main',
  /** 隐藏主窗口 */
  HIDE_MAIN_WINDOW: 'window:hide-main',
  /** 显示搜索浮层 */
  SHOW_SEARCH_OVERLAY: 'window:show-search',
  /** 隐藏搜索浮层 */
  HIDE_SEARCH_OVERLAY: 'window:hide-search',
  /** 导航到指定工具 */
  NAVIGATE_TO_TOOL: 'navigate:tool',
  /** 用系统浏览器打开 URL */
  SHELL_OPEN_EXTERNAL: 'shell:open-external',
  /** 获取平台信息 */
  GET_PLATFORM_INFO: 'system:platform',
  /** 主题变化通知 */
  THEME_CHANGED: 'theme:changed',
  /** 远程文件获取（绕过 CORS） */
  REMOTE_FETCH: 'remote:fetch',
  /** 获取远程仓库 registry.json */
  REMOTE_FETCH_REGISTRY: 'remote:fetch-registry'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
