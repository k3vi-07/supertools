import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RemoteToolEntry, RemoteRegistry } from '@shared/types'
import type { ToolManifest } from '../tools/types'
import { createRemoteComponentLoader } from '../utils/remoteLoader'

const INSTALLED_KEY = 'supertools:installed-remote-tools'
const REPOS_KEY = 'supertools:remote-repos'

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
  /** 自定义别名 */
  alias?: string
}

export const useRemoteToolsStore = defineStore('remoteTools', () => {
  /** 已添加的远程仓库列表 */
  const repos = ref<RemoteRepo[]>([])
  /** 已安装的远程工具 */
  const installedTools = ref<InstalledRemoteTool[]>([])
  /** 当前正在加载的仓库清单 */
  const loadingRegistry = ref(false)
  /** 当前仓库清单缓存 */
  const registryCache = ref<Record<string, RemoteRegistry>>({})

  /** 初始化：从 localStorage 加载 */
  function init(): void {
    try {
      const savedRepos = localStorage.getItem(REPOS_KEY)
      if (savedRepos) repos.value = JSON.parse(savedRepos)
      const savedInstalled = localStorage.getItem(INALLED_KEY)
      if (savedInstalled) installedTools.value = JSON.parse(savedInstalled)
    } catch {
      // 忽略
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

  /** 保存到 localStorage */
  function save(): void {
    localStorage.setItem(REPOS_KEY, JSON.stringify(repos.value))
    localStorage.setItem(INSTALLED_KEY, JSON.stringify(installedTools.value))
  }

  /** 添加远程仓库 */
  async function addRepo(repoId: string): Promise<boolean> {
    if (repos.value.find((r) => r.id === repoId)) {
      return false
    }
    try {
      // 尝试获取清单以验证仓库有效
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
    save()
  }

  /** 获取远程仓库的工具清单 */
  async function fetchRegistry(repoId: string): Promise<RemoteRegistry> {
    if (registryCache.value[repoId]) {
      return registryCache.value[repoId]
    }
    loadingRegistry.value = true
    try {
      const data = (await window.supertools.fetchRegistry(repoId)) as RemoteRegistry
      if (!data || !Array.isArray(data.tools)) {
        throw new Error('无效的仓库清单格式')
      }
      registryCache.value[repoId] = data
      return data
    } finally {
      loadingRegistry.value = false
    }
  }

  /** 安装远程工具 */
  function installTool(entry: RemoteToolEntry, repoId: string, version = 'master'): void {
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
    save()
  }

  /** 卸载远程工具 */
  function uninstallTool(toolId: string): void {
    installedTools.value = installedTools.value.filter((t) => t.id !== toolId)
    save()
  }

  /** 判断是否已安装 */
  function isInstalled(toolId: string): boolean {
    return installedIds.value.has(toolId)
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
    init,
    addRepo,
    removeRepo,
    fetchRegistry,
    installTool,
    uninstallTool,
    isInstalled,
    getAllStoreTools
  }
})
