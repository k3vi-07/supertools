/**
 * 远程工具加载器 — 使用 vue3-sfc-loader 运行时编译远程 .vue 组件
 *
 * 架构：
 *   GitHub .vue → jsDelivr CDN URL → 主进程 net 代理 fetch → vue3-sfc-loader 编译 → Vue 组件
 */
import { loadModule } from 'vue3-sfc-loader'
import * as Vue from 'vue'
import type { Component } from 'vue'

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

/** sfc-loader 选项配置 */
const sfcOptions = {
  moduleCache,

  /** 获取 .vue 文件内容（通过主进程代理绕过 CORS） */
  async getFile(url: string): Promise<string> {
    // 优先通过主进程代理获取（最可靠，绕过所有 CORS 限制）
    if (typeof window !== 'undefined' && window.supertools?.fetchRemote) {
      try {
        return await window.supertools.fetchRemote(url)
      } catch (err) {
        console.warn(`[remoteLoader] 主进程代理失败，尝试直接 fetch: ${url}`, err)
      }
    }
    // Fallback: 直接 fetch（在 dev 模式下可能可用）
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`加载远程组件失败: HTTP ${response.status} - ${url}`)
    }
    return response.text()
  },

  /** 解析 .vue 中的 <style> 并注入到 DOM */
  addStyle(textContent: string): void {
    const style = Object.assign(document.createElement('style'), { textContent })
    // 为远程样式添加标记，方便卸载时移除
    style.setAttribute('data-remote-tool', 'true')
    document.head.appendChild(style)
  },

  /** 处理 .vue 中额外的模块导入（如 import xxx from './utils'） */
  async loadAdditionalModule(url: string): Promise<unknown> {
    // 对于相对路径的模块，通过同样的代理机制加载
    if (typeof window !== 'undefined' && window.supertools?.fetchRemote) {
      const code = await window.supertools.fetchRemote(url)
      // 尝试作为 ES 模块解析（简单的 export default 处理）
      try {
        return new Function(`${code}; return typeof exports !== 'undefined' ? exports : (typeof module !== 'undefined' ? module.exports : {})`)()
      } catch {
        return null
      }
    }
    return null
  },

  logModuleLoaderError(err: unknown): void {
    console.error('[remoteLoader] SFC 编译失败:', err)
  }
}

/**
 * 检查 URL 是否可访问（HEAD 预检）
 */
async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && window.supertools?.fetchRemote) {
      await window.supertools.fetchRemote(url)
      return true
    }
  } catch {
    return false
  }
  return false
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
  // 尝试顺序：指定版本 → master → main（处理 git tag/分支不存在的情况）
  const versions = [version, 'master', 'main'].filter((v, i, a) => a.indexOf(v) === i)
  let lastError: unknown = null

  for (const ver of versions) {
    const url = buildCdnUrl(repo, path, ver)
    console.log(`[remoteLoader] 尝试加载: ${url}`)

    // 预检 URL 是否可访问，避免 loadModule 吞掉 404 错误
    const accessible = await checkUrlAccessible(url)
    if (!accessible) {
      console.warn(`[remoteLoader] 版本 ${ver} 不可访问 (404)，尝试下一个`)
      continue
    }

    try {
      const module = await loadModule(url, sfcOptions)
      console.log(`[remoteLoader] 加载成功: ${ver}`)
      return module as unknown as Component
    } catch (err) {
      console.warn(`[remoteLoader] 版本 ${ver} 编译失败，尝试下一个`)
      lastError = err
    }
  }
  throw lastError || new Error('所有版本均加载失败')
}

/**
 * 创建懒加载的远程组件函数
 * 符合 ToolManifest.component 的签名 () => Promise<{ default: Component }>
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
