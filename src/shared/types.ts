/**
 * 共享类型定义 — 主进程与渲染进程共用的类型
 */

/** 剪贴板内容类型 */
export type ContentType =
  | 'json'
  | 'base64'
  | 'url'
  | 'uuid'
  | 'jwt'
  | 'timestamp'
  | 'hex'
  | 'unicode'
  | 'ipv4'
  | 'ipv6'
  | 'morse'
  | 'html'
  | 'css'
  | 'javascript'
  | 'regex'
  | 'text'
  | 'unknown'

/** 工具分类 */
export type ToolCategory =
  | 'encode'
  | 'json'
  | 'cryptography'
  | 'text'
  | 'web'
  | 'color'
  | 'datetime'
  | 'programming'
  | 'network'

/** 主题 */
export type Theme = 'dark' | 'light'

/** 语言 */
export type Lang = 'zh' | 'en'

/** 平台 */
export type Platform = 'macos' | 'windows' | 'linux'

/** 远程工具仓库中的工具清单条目 */
export interface RemoteToolEntry {
  id: string
  name: string
  nameZh: string
  icon: string
  category: string[]
  keywords: string[]
  description: string
  path: string
  author?: string
  version?: string
  /** 主页 URL */
  homepage?: string
  /** 开源许可证 */
  license?: string
  /** 仓库地址 */
  repository?: string
}

/** 远程仓库清单 */
export interface RemoteRegistry {
  name: string
  description?: string
  tools: RemoteToolEntry[]
}

/** $he3 全局 API 接口 */
export interface He3API {
  /** 获取最近一次剪贴板内容 */
  getLastClipboard(): Promise<string>
  /** 复制文本到剪贴板 */
  copyText(text: string): Promise<void>
  /** 注册"使用了剪贴板值"的回调 */
  onUseClipboardValue(cb: () => void): void
  /** 消息提示 */
  message: {
    success(text: string): void
    error(text: string): void
    info(text: string): void
    warning(text: string): void
  }
  /** 当前主题 */
  theme: Theme
  /** 当前语言 */
  lang: Lang
  /** 平台判断 */
  isMacOS: boolean
  isWindows: boolean
  isLinux: boolean
  /** 是否开发环境 */
  isDev: boolean
  /** 订阅主题变化 */
  subscribeThemeChange(cb: (theme: Theme) => void): void
  /** 使用系统默认浏览器打开 URL */
  shellOpenExternal(url: string): Promise<void>
}

declare global {
  interface Window {
    $he3: He3API
  }
}
