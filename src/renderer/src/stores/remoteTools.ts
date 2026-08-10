import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RemoteToolEntry, RemoteRegistry } from '@shared/types'
import type { ToolManifest } from '../tools/types'
import { createRemoteComponentLoader, precacheRemoteComponent, evictRemoteComponentCache } from '../utils/remoteLoader'
import { validateRegistry } from '../utils/registryValidator'
import { storageGetJSON, storageSetJSON } from '../utils/storage'

/** 已安装的远程工具（包含完整 manifest + 远程来源信息） */
export interface InstalledRemoteTool extends RemoteToolEntry {
  /** 安装来源仓库 */
  sourceRepo: string
  /** 安装版本 */
  installedVersion: string
  /** 安装时间 */
  installedAt: number
}

/** 远程仓库配置 */
export interface RemoteRepo {
  /** 仓库全名 user/repo */
  id: string
  /** 显示名称 */
  name: string
}

/** 过期工具信息（有更新可用） */
export interface OutdatedTool {
  toolId: string
  installedVersion: string
  latestVersion: string
  entry: RemoteToolEntry
}

/** 用户评分类型 */
export type Rating = 'like' | 'dislike'

export const useRemoteToolsStore = defineStore('remoteTools', () => {
  /** 已添加的远程仓库列表 */
  const repos = ref<RemoteRepo[]>([])
  /** 已安装的远程工具 */
  const installedTools = ref<InstalledRemoteTool[]>([])
  /** 当前正在加载的仓库清单 */
  const loadingRegistry = ref(false)
  /** 当前仓库清单缓存 */
  const registryCache = ref<Record<string, RemoteRegistry>>({})
  /** 用户评分（本地点赞/踩） */
  const ratings = ref<Record<string, Rating>>({})
  /** 过期工具列表 */
  const outdatedTools = ref<OutdatedTool[]>([])
  /** 是否正在检查更新 */
  const checkingUpdates = ref(false)

  /** 默认社区仓库（首次使用自动添加） */
  const DEFAULT_REPO = 'k3vi-07/supertools-community'

  /** 初始化：从 localStorage 加载，首次使用自动添加默认仓库 */
  function init(): void {
    repos.value = storageGetJSON<RemoteRepo[]>('remote-repos', [])
    installedTools.value = storageGetJSON<InstalledRemoteTool[]>('installed-remote-tools', [])
    ratings.value = storageGetJSON<Record<string, Rating>>('tool-ratings', {})

    // 首次使用：自动添加默认社区仓库
    if (repos.value.length === 0) {
      repos.value = [{ id: DEFAULT_REPO, name: 'SuperTools Community' }]
      save()
    }
  }

  /** 已安装工具的 id 集合 */
  const installedIds = computed((): Set<string> => {
    return new Set(installedTools.value.map((t) => t.id))
  })

  /** 已安装的远程工具转为 ToolManifest 格式 */
  const remoteToolManifests = computed((): ToolManifest[] => {
    return installedTools.value.map((tool) => ({
      id: tool.id,
      name: tool.name,
      nameZh: tool.nameZh,
      icon: tool.icon,
      category: tool.category as never,
      keywords: tool.keywords,
      description: tool.description,
      component: createRemoteComponentLoader(tool.sourceRepo, tool.path, tool.installedVersion)
    }))
  })

  /** 已安装工具数量 */
  const installedCount = computed(() => installedTools.value.length)

  /** 最近安装的工具（按时间倒序） */
  const recentlyInstalled = computed((): InstalledRemoteTool[] => {
    return [...installedTools.value].sort((a, b) => b.installedAt - a.installedAt)
  })

  /** 点赞数排序的热门工具 */
  const topRatedTools = computed((): string[] => {
    return Object.entries(ratings.value)
      .filter(([, r]) => r === 'like')
      .map(([id]) => id)
  })

  /** 过期工具数量 */
  const outdatedCount = computed(() => outdatedTools.value.length)

  /** 保存到 localStorage */
  function save(): void {
    storageSetJSON('remote-repos', repos.value)
    storageSetJSON('installed-remote-tools', installedTools.value)
    storageSetJSON('tool-ratings', ratings.value)
  }

  /** 添加远程仓库 */
  async function addRepo(repoId: string): Promise<boolean> {
    if (repos.value.find((r) => r.id === repoId)) {
      return false
    }
    try {
      await fetchRegistry(repoId)
      const registry = registryCache.value[repoId]
      repos.value.push({
        id: repoId,
        name: registry?.name || repoId
      })
      save()
      return true
    } catch {
      return false
    }
  }

  /** 移除远程仓库（同时卸载该仓库的所有工具） */
  function removeRepo(repoId: string): void {
    repos.value = repos.value.filter((r) => r.id !== repoId)
    installedTools.value = installedTools.value.filter((t) => t.sourceRepo !== repoId)
    delete registryCache.value[repoId]
    outdatedTools.value = outdatedTools.value.filter((t) => {
      const tool = installedTools.value.find((i) => i.id === t.toolId)
      return tool !== undefined
    })
    save()
  }

  /** 获取远程仓库的工具清单（含 schema 校验） */
  async function fetchRegistry(repoId: string, force = false): Promise<RemoteRegistry> {
    if (!force && registryCache.value[repoId]) {
      return registryCache.value[repoId]
    }
    loadingRegistry.value = true
    try {
      const data = await window.supertools.fetchRegistry(repoId)
      if (!data) {
        throw new Error('获取仓库清单失败')
      }
      // schema 校验：过滤非法/恶意数据
      const result = validateRegistry(data)
      if (!result.valid && result.errors.length > 0) {
        console.warn(`[remoteTools] 仓库 ${repoId} 校验有 ${result.errors.length} 个警告:`, result.errors.slice(0, 5))
      }
      if (!result.sanitized || result.sanitized.tools.length === 0) {
        throw new Error(`仓库清单校验失败: ${result.errors.slice(0, 3).join('; ')}`)
      }
      registryCache.value[repoId] = result.sanitized
      return result.sanitized
    } finally {
      loadingRegistry.value = false
    }
  }

  /** 安装远程工具（同时预下载组件到本地缓存） */
  function installTool(entry: RemoteToolEntry, repoId: string): void {
    const version = entry.version || 'master'
    if (installedIds.value.has(entry.id)) {
      // 更新已有安装
      installedTools.value = installedTools.value.filter((t) => t.id !== entry.id)
    }
    installedTools.value.push({
      ...entry,
      sourceRepo: repoId,
      installedVersion: version,
      installedAt: Date.now()
    })
    // 清除该工具的过期状态
    outdatedTools.value = outdatedTools.value.filter((t) => t.toolId !== entry.id)
    save()

    // 异步预下载组件源码到本地缓存（不阻塞 UI）
    precacheRemoteComponent(repoId, entry.path, version).catch(() => {
      // 预下载失败不影响安装，后续打开工具时会自动重试
    })
  }

  /** 卸载远程工具（同时清理本地缓存） */
  function uninstallTool(toolId: string): void {
    const tool = installedTools.value.find((t) => t.id === toolId)
    installedTools.value = installedTools.value.filter((t) => t.id !== toolId)
    outdatedTools.value = outdatedTools.value.filter((t) => t.toolId !== toolId)
    save()

    // 异步清理本地缓存
    if (tool) {
      evictRemoteComponentCache(tool.sourceRepo, tool.path, tool.installedVersion).catch(() => {})
    }
  }

  /** 判断是否已安装 */
  function isInstalled(toolId: string): boolean {
    return installedIds.value.has(toolId)
  }

  /** 获取已安装工具的版本 */
  function getInstalledVersion(toolId: string): string | undefined {
    return installedTools.value.find((t) => t.id === toolId)?.installedVersion
  }

  /** 批量安装仓库所有工具 */
  async function installAllFromRepo(repoId: string): Promise<number> {
    const registry = await fetchRegistry(repoId)
    let count = 0
    for (const entry of registry.tools) {
      if (!installedIds.value.has(entry.id)) {
        installTool(entry, repoId)
        count++
      }
    }
    return count
  }

  /** 批量卸载仓库所有工具 */
  function uninstallAllFromRepo(repoId: string): number {
    const before = installedTools.value.length
    installedTools.value = installedTools.value.filter((t) => t.sourceRepo !== repoId)
    const count = before - installedTools.value.length
    save()
    return count
  }

  /** 检查所有已安装工具的更新 */
  async function checkUpdates(): Promise<OutdatedTool[]> {
    checkingUpdates.value = true
    const outdated: OutdatedTool[] = []
    try {
      // 按仓库分组检查
      const repoGroups = new Map<string, InstalledRemoteTool[]>()
      for (const tool of installedTools.value) {
        const group = repoGroups.get(tool.sourceRepo) || []
        group.push(tool)
        repoGroups.set(tool.sourceRepo, group)
      }

      for (const [repoId, tools] of repoGroups) {
        try {
          const registry = await fetchRegistry(repoId, true)
          const registryMap = new Map(registry.tools.map((t) => [t.id, t]))
          for (const installed of tools) {
            const latest = registryMap.get(installed.id)
            if (latest) {
              const latestVersion = latest.version || 'master'
              if (latestVersion !== installed.installedVersion) {
                outdated.push({
                  toolId: installed.id,
                  installedVersion: installed.installedVersion,
                  latestVersion,
                  entry: latest
                })
              }
            }
          }
        } catch {
          // 仓库获取失败，跳过
        }
      }
      outdatedTools.value = outdated
      return outdated
    } finally {
      checkingUpdates.value = false
    }
  }

  /** 更新单个工具到最新版本 */
  function updateTool(toolId: string): void {
    const outdated = outdatedTools.value.find((t) => t.toolId === toolId)
    if (!outdated) return
    const installed = installedTools.value.find((t) => t.id === toolId)
    if (installed) installTool(outdated.entry, installed.sourceRepo)
  }

  /** 更新所有过期工具 */
  function updateAll(): number {
    let count = 0
    for (const outdated of outdatedTools.value) {
      const installed = installedTools.value.find((t) => t.id === outdated.toolId)
      if (installed) {
        installTool(outdated.entry, installed.sourceRepo)
        count++
      }
    }
    outdatedTools.value = []
    return count
  }

  /** 判断工具是否有更新 */
  function isOutdated(toolId: string): boolean {
    return outdatedTools.value.some((t) => t.toolId === toolId)
  }

  /** 设置评分 */
  function setRating(toolId: string, rating: Rating): void {
    // 切换：再次点击相同评分则取消
    if (ratings.value[toolId] === rating) {
      delete ratings.value[toolId]
    } else {
      ratings.value[toolId] = rating
    }
    save()
  }

  /** 获取评分 */
  function getRating(toolId: string): Rating | undefined {
    return ratings.value[toolId]
  }

  /** 导出已安装工具列表 */
  function exportInstalled(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      tools: installedTools.value.map((t) => ({
        id: t.id,
        name: t.name,
        sourceRepo: t.sourceRepo,
        installedVersion: t.installedVersion
      }))
    }, null, 2)
  }

  /** 导入工具列表（需要仓库已添加） */
  async function importInstalled(json: string): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0
    try {
      const data = JSON.parse(json)
      if (!data.tools || !Array.isArray(data.tools)) {
        return { success: 0, failed: 0 }
      }
      for (const item of data.tools) {
        try {
          const registry = await fetchRegistry(item.sourceRepo)
          const entry = registry.tools.find((t) => t.id === item.id)
          if (entry) {
            installTool(entry, item.sourceRepo)
            success++
          } else {
            failed++
          }
        } catch {
          failed++
        }
      }
    } catch {
      // JSON 解析失败
    }
    return { success, failed }
  }

  /** 获取所有已添加仓库的工具列表（用于商店展示） */
  async function getAllStoreTools(): Promise<{ repo: RemoteRepo; tools: RemoteToolEntry[] }[]> {
    const result: { repo: RemoteRepo; tools: RemoteToolEntry[] }[] = []
    for (const repo of repos.value) {
      try {
        const registry = await fetchRegistry(repo.id)
        result.push({ repo, tools: registry.tools })
      } catch {
        result.push({ repo, tools: [] })
      }
    }
    return result
  }

  return {
    repos,
    installedTools,
    installedIds,
    remoteToolManifests,
    loadingRegistry,
    registryCache,
    ratings,
    outdatedTools,
    checkingUpdates,
    installedCount,
    recentlyInstalled,
    topRatedTools,
    outdatedCount,
    init,
    addRepo,
    removeRepo,
    fetchRegistry,
    installTool,
    uninstallTool,
    isInstalled,
    getInstalledVersion,
    installAllFromRepo,
    uninstallAllFromRepo,
    checkUpdates,
    updateTool,
    updateAll,
    isOutdated,
    setRating,
    getRating,
    exportInstalled,
    importInstalled,
    getAllStoreTools
  }
})
