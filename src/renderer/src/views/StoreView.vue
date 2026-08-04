<template>
  <div class="store-view">
    <div class="store-view__header">
      <h1 class="store-view__title">
        <h-icon icon="mdi:store-search-outline" :size="24" />
        工具商店
      </h1>
      <p class="store-view__subtitle">从 GitHub 社区仓库发现和安装远程工具</p>
    </div>

    <!-- 添加仓库 -->
    <h-card-box text="添加工具仓库" icon="mdi:plus-circle-outline">
      <div class="store-view__add-repo">
        <h-input
          v-model="newRepoInput"
          placeholder="输入 GitHub 仓库地址，如 user/supertools-community"
          class="store-view__repo-input"
        />
        <h-button type="primary" icon="mdi:plus" :disabled="!newRepoInput.trim()" @click="handleAddRepo">
          添加
        </h-button>
      </div>
      <p class="store-view__hint">
        💡 仓库需要包含 <code>registry.json</code> 文件描述可用工具。工具组件通过 jsDelivr CDN 加载。
      </p>
    </h-card-box>

    <!-- 已添加的仓库 -->
    <div v-if="remoteToolsStore.repos.length > 0" class="store-view__repos">
      <div
        v-for="repo in remoteToolsStore.repos"
        :key="repo.id"
        class="store-view__repo-section"
      >
        <div class="store-view__repo-header">
          <div class="store-view__repo-info">
            <h-icon icon="mdi:github" :size="20" />
            <span class="store-view__repo-name">{{ repo.name }}</span>
            <span class="store-view__repo-id">{{ repo.id }}</span>
          </div>
          <div class="store-view__repo-actions">
            <h-button size="small" icon="mdi:refresh" @click="refreshRepo(repo.id)">刷新</h-button>
            <h-button size="small" type="ghost" icon="mdi:delete-outline" @click="removeRepo(repo.id)">移除</h-button>
          </div>
        </div>

        <!-- 仓库中的工具列表 -->
        <div v-if="repoTools[repo.id]" class="store-view__tools">
          <div
            v-for="tool in repoTools[repo.id]"
            :key="tool.id"
            class="store-view__tool-card"
            :class="{ installed: remoteToolsStore.isInstalled(tool.id) }"
          >
            <div class="store-view__tool-icon">
              <h-icon :icon="tool.icon" :size="22" />
            </div>
            <div class="store-view__tool-info">
              <div class="store-view__tool-name">{{ tool.nameZh }}</div>
              <div class="store-view__tool-desc">{{ tool.description }}</div>
            </div>
            <div class="store-view__tool-action">
              <button
                v-if="!remoteToolsStore.isInstalled(tool.id)"
                class="store-view__install-btn"
                @click="installTool(tool, repo.id)"
              >
                <h-icon icon="mdi:download" :size="16" /> 安装
              </button>
              <button
                v-else
                class="store-view__uninstall-btn"
                @click="uninstallTool(tool.id)"
              >
                <h-icon icon="mdi:check" :size="16" /> 已安装 · 卸载
              </button>
            </div>
          </div>
          <div v-if="repoTools[repo.id]?.length === 0" class="store-view__empty-repo">
            此仓库暂无工具
          </div>
        </div>
        <div v-else-if="loadingRepos[repo.id]" class="store-view__loading">
          <h-icon icon="mdi:loading" :size="24" color="var(--color-primary)" />
          <span>加载清单中...</span>
        </div>
        <div v-else class="store-view__loading">
          <h-icon icon="mdi:alert-circle-outline" :size="24" color="var(--color-error)" />
          <span>加载失败，点击刷新重试</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="store-view__no-repos">
      <h-icon icon="mdi:package-variant-closed" :size="64" color="var(--text-tertiary)" />
      <p>还没有添加任何工具仓库</p>
      <p class="store-view__empty-hint">在上方输入 GitHub 仓库地址来添加社区工具源</p>
    </div>

    <!-- 已安装工具统计 -->
    <div v-if="remoteToolsStore.installedTools.length > 0" class="store-view__installed-summary">
      <h-icon icon="mdi:check-circle" :size="18" color="var(--color-success)" />
      <span>已安装 {{ remoteToolsStore.installedTools.length }} 个远程工具</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRemoteToolsStore } from '../stores/remoteTools'
import { mergeRemoteTools } from '../tools'
import { useToolsStore } from '../stores/tools'
import { initSearchIndex } from '../utils/fuzzySearch'
import type { RemoteToolEntry } from '@shared/types'

const remoteToolsStore = useRemoteToolsStore()
const toolsStore = useToolsStore()

const newRepoInput = ref('')
const repoTools = reactive<Record<string, RemoteToolEntry[]>>({})
const loadingRepos = reactive<Record<string, boolean>>({})

/** 添加仓库 */
async function handleAddRepo(): Promise<void> {
  const repoId = newRepoInput.value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')
  if (!repoId || !repoId.includes('/')) {
    window.$he3?.message.error('请输入有效的 GitHub 仓库地址')
    return
  }

  loadingRepos[repoId] = true
  const success = await remoteToolsStore.addRepo(repoId)
  loadingRepos[repoId] = false

  if (success) {
    window.$he3?.message.success(`仓库 ${repoId} 添加成功`)
    newRepoInput.value = ''
    await loadRepoTools(repoId)
  } else {
    window.$he3?.message.error('添加失败，请检查仓库地址或网络连接')
  }
}

/** 加载仓库工具列表 */
async function loadRepoTools(repoId: string): Promise<void> {
  loadingRepos[repoId] = true
  try {
    const registry = await remoteToolsStore.fetchRegistry(repoId)
    repoTools[repoId] = registry.tools
  } catch (err) {
    console.error('加载仓库工具失败:', err)
    repoTools[repoId] = []
  } finally {
    loadingRepos[repoId] = false
  }
}

/** 刷新仓库 */
async function refreshRepo(repoId: string): Promise<void> {
  // 清除缓存
  delete remoteToolsStore.registryCache[repoId]
  await loadRepoTools(repoId)
  window.$he3?.message.success('已刷新')
}

/** 移除仓库 */
function removeRepo(repoId: string): void {
  remoteToolsStore.removeRepo(repoId)
  delete repoTools[repoId]
  refreshToolList()
  window.$he3?.message.success('仓库已移除')
}

/** 安装工具 */
function installTool(tool: RemoteToolEntry, repoId: string): void {
  remoteToolsStore.installTool(tool, repoId)
  refreshToolList()
  window.$he3?.message.success(`已安装: ${tool.nameZh}`)
}

/** 卸载工具 */
function uninstallTool(toolId: string): void {
  remoteToolsStore.uninstallTool(toolId)
  refreshToolList()
  window.$he3?.message.success('已卸载')
}

/** 刷新工具列表和搜索索引 */
function refreshToolList(): void {
  mergeRemoteTools(remoteToolsStore.remoteToolManifests)
  toolsStore.registerTools([...toolsStore.tools])
  initSearchIndex([...toolsStore.tools])
}

onMounted(async () => {
  // 加载所有已添加仓库的工具
  for (const repo of remoteToolsStore.repos) {
    await loadRepoTools(repo.id)
  }
})
</script>

<style scoped lang="less">
.store-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.store-view__header {
  margin-bottom: 24px;
}

.store-view__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.store-view__subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.store-view__add-repo {
  display: flex;
  gap: 8px;
}

.store-view__repo-input {
  flex: 1;
}

.store-view__hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-tertiary);

  code {
    padding: 1px 5px;
    background: var(--bg-base);
    border-radius: 3px;
    font-family: monospace;
    color: var(--color-primary);
  }
}

.store-view__repos {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.store-view__repo-section {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.store-view__repo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-code-header);
  border-bottom: 1px solid var(--border-color);
}

.store-view__repo-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.store-view__repo-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.store-view__repo-id {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
}

.store-view__repo-actions {
  display: flex;
  gap: 8px;
}

.store-view__tools {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.store-view__tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
  }

  &.installed {
    border-color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 5%, transparent);
  }
}

.store-view__tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-base);
  color: var(--color-primary);
  flex-shrink: 0;
}

.store-view__tool-info {
  flex: 1;
  min-width: 0;
}

.store-view__tool-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.store-view__tool-desc {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-view__install-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;

  &:hover {
    background: var(--color-primary);
    color: white;
  }
}

.store-view__uninstall-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--color-success);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-success);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }
}

.store-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px;
  color: var(--text-tertiary);
  font-size: 13px;

  :deep(.iconify) {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.store-view__empty-repo {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

.store-view__no-repos {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  color: var(--text-tertiary);

  p {
    font-size: 14px;
  }
}

.store-view__empty-hint {
  font-size: 12px !important;
  color: var(--text-tertiary);
}

.store-view__installed-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 16px;
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  font-size: 13px;
  color: var(--text-secondary);
}

:deep(.h-card-box) {
  margin-bottom: 0;
}
</style>
