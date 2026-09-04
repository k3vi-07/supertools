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
import bcryptjs from 'bcryptjs'
import CryptoJS from 'crypto-js'
import * as HashWasm from 'hash-wasm'
import * as Twofish from 'twofish-ts'
import * as Gost341194 from '@li0ard/gost341194'
import TigerHash from 'fb-tiger-hash'
import Snefru from 'crypto-api/src/hasher/snefru.mjs'
import * as CryptoApiUtf from 'crypto-api/src/encoder/utf.mjs'
import * as CryptoApiHex from 'crypto-api/src/encoder/hex.mjs'
import * as Salsa20 from '@stablelib/salsa20'
import * as ChaCha20 from '@stablelib/chacha'
import * as NobleChaCha from '@noble/ciphers/chacha.js'
import * as NobleAes from '@noble/ciphers/aes.js'
import * as NobleCipherUtils from '@noble/ciphers/utils.js'
import { initSync as initCityHash, cityhash64_hex, cityhash_102_128_hex } from 'ch-city-wasm'
import getCityHashWasm from 'ch-city-wasm/wasm'
import { Buffer } from 'buffer'
import type { Component } from 'vue'
import { globalComponents } from '../components/register'

initCityHash({ module: getCityHashWasm() })
// fb-tiger-hash expects the standard Buffer UTF encoder; provide the browser build locally.
Object.assign(globalThis, { Buffer })

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
  vue: Vue,
  bcryptjs,
  'crypto-js': CryptoJS,
  'hash-wasm': HashWasm,
  'twofish-ts': Twofish,
  '@li0ard/gost341194': Gost341194,
  'fb-tiger-hash': TigerHash,
  'crypto-api/snefru': { default: Snefru },
  'crypto-api/utf': CryptoApiUtf,
  'crypto-api/hex': CryptoApiHex,
  '@stablelib/salsa20': Salsa20,
  '@stablelib/chacha': ChaCha20,
  '@noble/ciphers/chacha.js': NobleChaCha,
  '@noble/ciphers/aes.js': NobleAes,
  '@noble/ciphers/utils.js': NobleCipherUtils,
  'ch-city-wasm': { cityhash64_hex, cityhash_102_128_hex }
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
  if (typeof window === 'undefined' || !window.supertools?.fetchRemote) {
    throw new Error('远程工具必须通过主进程代理加载')
  }
  content = await window.supertools.fetchRemote(url)

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
   * 安全策略：只允许 moduleCache 中随应用打包并审核过的模块。
   *
   * 未列入白名单的 npm 包与所有远程文件 import 均拒绝加载。
   */
  async loadAdditionalModule(_url: string): Promise<never> {
    throw new Error(
      '远程工具请求了未授权模块。仅允许使用应用内置白名单模块。'
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
  version?: string
): Promise<string | null> {
  const versions = version ? [version] : ['master', 'main']
  for (const ver of versions) {
    const url = buildCdnUrl(repo, path, ver)
    try {
      const content = await getFileWithCache(url)
      if (content) {
        console.log(`[remoteLoader] 预缓存成功: ${ver}`)
        return ver
      }
    } catch {
      // 尝试下一个版本
    }
  }
  console.warn('[remoteLoader] 预缓存失败：所有版本均不可用')
  return null
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
  // 安装阶段已经解析并缓存了实际版本，运行时不得静默切换到其他分支。
  const versions = [version]
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
