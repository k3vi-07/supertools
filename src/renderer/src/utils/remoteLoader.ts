/**
 * 远程工具加载器 — 使用 vue3-sfc-loader 运行时编译远程 .vue 组件
 *
 * 架构：
 *   GitHub .vue → jsDelivr CDN URL → 主进程 net 代理 fetch → vue3-sfc-loader 编译 → Vue 组件
 *
 * 缓存策略（v1.2+）：
 *   加载时优先读取本地磁盘缓存（app userData/remote-tools/）
 *   未命中则走云端下载，成功后自动写入缓存
 *   安装时预下载，卸载时清理对应缓存
 */
import { loadModule } from 'vue3-sfc-loader'
import * as Vue from 'vue'
import type { Component } from 'vue'
import { globalComponents } from '../components/register'

/** jsDelivr CDN 基础 URL */
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh'

/** 构建 jsDelivr CDN URL */
export function buildCdnUrl(repo: string, path: string, version = 'master'): string {
  let owner = repo
  let ver = version
  // 支持 'user/repo@version' 格式
  const atIndex = repo.lastIndexOf('@')
  if (atIndex > 0) {
    owner = repo.substring(0, atIndex)
    ver = repo.substring(atIndex + 1)
  }
  return `${JSDELIVR_BASE}/${owner}@${ver}/${path.replace(/^\//, '')}`
}

/** Vue 运行时模块缓存（sfc-loader 需要） */
const moduleCache: Record<string, unknown> = {
  vue: Vue
}

// 覆盖 Vue.resolveComponent — 让远程组件能解析全局注册的 h-xxx 组件
// vue3-sfc-loader 编译的远程组件 render 函数中会调用 resolveComponent("h-xxx")
// 但远程组件不继承 Vue app 的全局组件注册，导致返回 undefined → 页面空白
// Proxy 包装 moduleCache.vue 无效（Vite 构建时 vue 已被内联到 sfc-loader）
// 注意：ESM 导入的属性是只读的（开发模式下），直接赋值会报 TypeError
// 使用 Object.defineProperty 可以绕过只读限制
const _origResolve = Vue.resolveComponent
const _patchedResolve = (name: string): unknown => {
  const resolved = _origResolve(name)
  if (resolved !== name) return resolved
  const kebab = name.toLowerCase()
  if (globalComponents[kebab]) return globalComponents[kebab]
  return name
}
try {
  // 生产模式：直接赋值（Vite 内联 Vue 后属性可写）
  ;(Vue as Record<string, unknown>).resolveComponent = _patchedResolve
} catch {
  // 开发模式：ESM 导入属性只读，尝试 defineProperty
  try {
    Object.defineProperty(Vue, 'resolveComponent', {
      value: _patchedResolve,
      writable: true,
      configurable: true
    })
  } catch {
    // ESM 属性也不可配置，静默跳过，靠 componentDef.components 注入兜底
  }
}

/** 内存缓存：避免同一 session 内重复读磁盘 */
const memoryCache = new Map<string, string>()

/**
 * 获取文件内容 — 缓存优先策略
 * 1. 内存缓存 → 2. 磁盘缓存 → 3. 云端下载（成功后写缓存）
 */
async function getFileWithCache(url: string): Promise<string> {
  // 1. 内存缓存
  if (memoryCache.has(url)) {
    return memoryCache.get(url)!
  }

  // 2. 磁盘缓存
  if (typeof window !== 'undefined' && window.supertools?.readCache) {
    try {
      const cached = await window.supertools.readCache(url)
      if (cached) {
        memoryCache.set(url, cached)
        return cached
      }
    } catch {
      // 缓存读取失败，继续走云端
    }
  }

  // 3. 云端下载
  let content: string
  if (typeof window !== 'undefined' && window.supertools?.fetchRemote) {
    try {
      content = await window.supertools.fetchRemote(url)
    } catch (err) {
      console.warn(`[remoteLoader] 主进程代理失败，尝试直接 fetch: ${url}`, err)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`加载远程组件失败: HTTP ${response.status} - ${url}`)
      }
      content = await response.text()
    }
  } else {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`加载远程组件失败: HTTP ${response.status} - ${url}`)
    }
    content = await response.text()
  }

  // 写入缓存（内存 + 磁盘）
  memoryCache.set(url, content)
  if (typeof window !== 'undefined' && window.supertools?.writeCache) {
    window.supertools.writeCache(url, content).catch(() => {})
  }

  return content
}

/** sfc-loader 选项配置 */
const sfcOptions = {
  moduleCache,

  /** 获取 .vue 文件内容（缓存优先） */
  async getFile(url: string): Promise<string> {
    return getFileWithCache(url)
  },

  /** 解析 .vue 中的 <style> 并注入到 DOM */
  addStyle(textContent: string): void {
    const style = Object.assign(document.createElement('style'), { textContent })
    style.setAttribute('data-remote-tool', 'true')
    document.head.appendChild(style)
  },

  /**
   * 安全策略：禁止远程组件 import 外部模块
   *
   * 远程 .vue 组件在浏览器端运行时编译，不允许 import npm 包或外部文件。
   * 远程组件只能使用 Vue 内置 API 和全局注册的 h- 组件。
   * 需要 npm 包的功能请使用浏览器原生 API（如 Web Crypto API 替代 crypto-js）。
   */
  async loadAdditionalModule(_url: string): Promise<never> {
    throw new Error(
      '远程工具不支持 import 外部模块。请使用 Vue 内置 API 或浏览器原生 API。'
    )
  },

  logModuleLoaderError(err: unknown): void {
    console.error('[remoteLoader] SFC 编译失败:', err)
  }
}

/**
 * 检查 URL 是否可访问（用于版本回退预检）
 */
async function checkUrlAccessible(url: string): Promise<boolean> {
  // 先检查缓存，缓存命中直接返回 true
  if (memoryCache.has(url)) return true

  if (typeof window !== 'undefined' && window.supertools?.readCache) {
    try {
      const cached = await window.supertools.readCache(url)
      if (cached) return true
    } catch {
      // 缓存检查失败
    }
  }

  // 无缓存，检查网络可访问性
  if (typeof window !== 'undefined' && window.supertools?.fetchRemote) {
    try {
      await window.supertools.fetchRemote(url)
      return true
    } catch {
      return false
    }
  }
  return false
}

/**
 * 预下载远程组件到本地缓存（安装时调用）
 * 不编译，只下载保存，后续打开时直接读缓存
 */
export async function precacheRemoteComponent(
  repo: string,
  path: string,
  version = 'master'
): Promise<boolean> {
  const versions = [version, 'master', 'main'].filter((v, i, a) => a.indexOf(v) === i)
  for (const ver of versions) {
    const url = buildCdnUrl(repo, path, ver)
    try {
      const content = await getFileWithCache(url)
      if (content) {
        console.log(`[remoteLoader] 预缓存成功: ${ver}`)
        return true
      }
    } catch {
      // 尝试下一个版本
    }
  }
  console.warn('[remoteLoader] 预缓存失败：所有版本均不可用')
  return false
}

/**
 * 删除远程组件的本地缓存（卸载时调用）
 */
export async function evictRemoteComponentCache(
  repo: string,
  path: string,
  version = 'master'
): Promise<void> {
  const versions = [version, 'master', 'main'].filter((v, i, a) => a.indexOf(v) === i)
  for (const ver of versions) {
    const url = buildCdnUrl(repo, path, ver)
    memoryCache.delete(url)
    if (typeof window !== 'undefined' && window.supertools?.deleteCache) {
      try {
        await window.supertools.deleteCache(url)
      } catch {
        // 忽略
      }
    }
  }
}

/**
 * 加载远程 Vue SFC 组件
 * @param repo GitHub 仓库，如 'user/supertools-community'
 * @param path 组件路径，如 'tools/MyTool.vue'
 * @param version 版本/分支/commit，默认 'master'
 * @returns Vue 组件
 */
export async function loadRemoteComponent(
  repo: string,
  path: string,
  version = 'master'
): Promise<Component> {
  // 尝试顺序：指定版本 → latest → master → main
  // latest 是版本标签，CDN 缓存始终正确；master 可能有过期缓存
  const versions = [version, 'latest', 'master', 'main'].filter((v, i, a) => a.indexOf(v) === i)
  let lastError: unknown = null

  for (const ver of versions) {
    const url = buildCdnUrl(repo, path, ver)
    console.log(`[remoteLoader] 尝试加载: ${url}`)

    try {
      const module = await loadModule(url, sfcOptions)
      const rawComponent = module as unknown as Record<string, unknown>
      const componentDef = (rawComponent.default || rawComponent) as Record<string, unknown>

      // 注入全局组件到组件定义
      if (componentDef && typeof componentDef === 'object') {
        componentDef.components = {
          ...(componentDef.components as Record<string, unknown>),
          ...globalComponents
        }
      }

      console.log(`[remoteLoader] 加载成功: ${ver}`)
      return componentDef as unknown as Component
    } catch (err) {
      console.warn(`[remoteLoader] 版本 ${ver} 加载失败:`, (err as Error).message?.substring(0, 100))
      // 清除这个版本可能的坏缓存，避免下次还用坏数据
      memoryCache.delete(url)
      if (typeof window !== 'undefined' && window.supertools?.deleteCache) {
        window.supertools.deleteCache(url).catch(() => {})
      }
      lastError = err
    }
  }
  throw lastError || new Error('所有版本均加载失败')
}

/**
 * 创建懒加载的远程组件函数
 * defineAsyncComponent 会对返回值检查 __esModule，
 * 如果为 true 则取 .default，否则直接用返回值作为组件。
 * 我们直接返回组件对象（不包装），避免 defineAsyncComponent 的歧义。
 */
export function createRemoteComponentLoader(
  repo: string,
  path: string,
  version = 'master'
): () => Promise<{ default: Component }> {
  return async () => {
    const component = await loadRemoteComponent(repo, path, version)
    return { default: component }
  }
}
