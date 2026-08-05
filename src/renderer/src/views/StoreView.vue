<template>
  <div class="store-view">
    <h1 class="store-view__title">{{ t('store.title') }}</h1>
    <p class="store-view__subtitle">{{ t('store.subtitle') }}</p>

    <!-- 添加仓库 -->
    <div class="store-view__add-repo">
      <h-input
        v-model="newRepoInput"
        :placeholder="t('store.addPlaceholder')"
        @keydown.enter="handleAddRepo"
      />
      <h-button type="primary" @click="handleAddRepo">{{ t('store.addRepo') }}</h-button>
    </div>
    <p class="store-view__hint">{{ t('store.repoHint') }}</p>

    <!-- 工具栏：搜索 + 排序 + 批量操作 -->
    <div v-if="remoteToolsStore.repos.length > 0" class="store-view__toolbar">
      <div class="store-view__search">
        <h-icon icon="mdi:magnify" :size="16" color="var(--text-tertiary)" />
        <input
          v-model="searchQuery"
          class="store-view__search-input"
          :placeholder="t('store.searchPlaceholder')"
        />
      </div>

      <div class="store-view__actions">
        <h-button
          size="small"
          :icon="'mdi:cloud-download-outline'"
          :disabled="remoteToolsStore.checkingUpdates"
          @click="handleCheckUpdates"
        >
          {{ remoteToolsStore.checkingUpdates ? t('store.checking') : t('store.checkUpdates') }}
          <span v-if="remoteToolsStore.outdatedCount > 0" class="store-view__badge">{{ remoteToolsStore.outdatedCount }}</span>
        </h-button>
        <h-button
          v-if="remoteToolsStore.outdatedCount > 0"
          size="small"
          type="primary"
          :icon="'mdi:update'"
          @click="handleUpdateAll"
        >
          {{ t('store.updateAll') }}
        </h-button>
        <h-button size="small" :icon="'mdi:download'" @click="handleExport">{{ t('store.exportList') }}</h-button>
        <h-button size="small" :icon="'mdi:upload'" @click="triggerImport">{{ t('store.importList') }}</h-button>
        <input ref="importInputRef" type="file" accept=".json" style="display:none" @change="handleImport" />
      </div>
    </div>

    <!-- 分类筛选 -->
    <div v-if="remoteToolsStore.repos.length > 0" class="store-view__filters">
      <div
        v-for="cat in filterCategories"
        :key="cat.id"
        class="store-view__filter-tag"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.id === 'all' ? t('store.filterAll') : cat.name }}
        <span v-if="cat.count > 0" class="store-view__filter-count">{{ cat.count }}</span>
      </div>
    </div>

    <!-- 已安装统计 -->
    <div v-if="remoteToolsStore.installedCount > 0" class="store-view__summary">
      <h-icon icon="mdi:check-circle" :size="14" color="var(--color-success)" />
      <span>{{ t('store.installedSummary', { count: remoteToolsStore.installedCount }) }}</span>
    </div>

    <!-- 空状态 -->
    <div v-if="remoteToolsStore.repos.length === 0" class="store-view__empty">
      <h-icon icon="mdi:store-outline" :size="48" color="var(--text-tertiary)" />
      <p>{{ t('store.noRepos') }}</p>
      <p class="store-view__empty-hint">{{ t('store.noReposHint') }}</p>
    </div>

    <!-- 仓库列表 -->
    <div v-else class="store-view__repos">
      <div v-for="repo in remoteToolsStore.repos" :key="repo.id" class="store-card">
        <!-- 仓库头部 -->
        <div class="store-card__header">
          <div class="store-card__repo-info">
            <h-icon icon="mdi:github" :size="18" />
            <span class="store-card__repo-name">{{ repo.name }}</span>
            <span class="store-card__repo-id">{{ repo.id }}</span>
            <span class="store-card__tool-count">{{ t('store.toolsCount', { count: (repoTools[repo.id] || []).length }) }}</span>
          </div>
          <div class="store-card__actions">
            <button class="store-card__btn store-card__btn--refresh" @click="refreshRepo(repo.id)">
              <h-icon icon="mdi:refresh" :size="14" />
            </button>
            <button class="store-card__btn store-card__btn--remove" @click="removeRepo(repo.id)">
              <h-icon icon="mdi:close" :size="14" />
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingRepos[repo.id]" class="store-card__loading">
          <h-icon icon="mdi:loading mdi-spin" :size="20" color="var(--text-tertiary)" />
          <span>{{ t('store.loading') }}</span>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="loadErrors[repo.id]" class="store-card__error" @click="refreshRepo(repo.id)">
          <h-icon icon="mdi:alert-circle-outline" :size="20" color="var(--color-error)" />
          <span>{{ t('store.loadFailed') }}</span>
        </div>

        <!-- 空仓库 -->
        <div v-else-if="filteredTools(repo.id).length === 0 && !searchQuery && activeCategory === 'all'" class="store-card__empty">
          {{ t('store.empty') }}
        </div>

        <!-- 无搜索结果 -->
        <div v-else-if="filteredTools(repo.id).length === 0" class="store-card__empty">
          {{ t('search.noResult') }}
        </div>

        <!-- 工具列表 -->
        <div v-else>
          <!-- 仓库级批量操作 -->
          <div class="store-card__bulk">
            <h-button
              v-if="!allToolsInstalled(repo.id)"
              size="small"
              type="primary"
              :icon="'mdi:download-multiple'"
              @click="handleInstallAll(repo.id)"
            >
              {{ t('store.installAll') }}
            </h-button>
            <h-button
              v-if="anyToolInstalled(repo.id)"
              size="small"
              :icon="'mdi:trash-can-outline'"
              @click="handleUninstallAll(repo.id)"
            >
              {{ t('store.uninstallAll') }}
            </h-button>
          </div>

          <div
            v-for="tool in filteredTools(repo.id)"
            :key="tool.id"
            class="tool-item"
            :class="{ installed: remoteToolsStore.isInstalled(tool.id) }"
          >
            <div class="tool-item__icon">
              <h-icon :icon="tool.icon" :size="20" />
            </div>
            <div class="tool-item__info">
              <div class="tool-item__name-row">
                <span class="tool-item__name">{{ tool.nameZh }}</span>
                <span v-if="tool.version" class="tool-item__version">v{{ tool.version }}</span>
                <span
                  v-if="remoteToolsStore.isOutdated(tool.id)"
                  class="tool-item__update-badge"
                  @click.stop="handleUpdateTool(tool)"
                >
                  {{ t('store.hasUpdate') }}
                </span>
              </div>
              <div class="tool-item__desc">{{ tool.description }}</div>
              <div class="tool-item__meta">
                <span v-if="tool.author" class="tool-item__meta-item">
                  <h-icon icon="mdi:account" :size="11" />
                  {{ tool.author }}
                </span>
                <span v-if="tool.category && tool.category.length" class="tool-item__meta-item">
                  <h-icon icon="mdi:tag" :size="11" />
                  {{ getCategoryName(tool.category[0]) }}
                </span>
              </div>
            </div>
            <div class="tool-item__actions">
              <!-- 评分 -->
              <div class="tool-item__rating">
                <button
                  class="tool-item__rate-btn"
                  :class="{ active: remoteToolsStore.getRating(tool.id) === 'like' }"
                  @click.stop="remoteToolsStore.setRating(tool.id, 'like')"
                >
                  <h-icon icon="mdi:thumb-up-outline" :size="14" />
                </button>
                <button
                  class="tool-item__rate-btn"
                  :class="{ active: remoteToolsStore.getRating(tool.id) === 'dislike' }"
                  @click.stop="remoteToolsStore.setRating(tool.id, 'dislike')"
                >
                  <h-icon icon="mdi:thumb-down-outline" :size="14" />
                </button>
              </div>

              <!-- 安装/卸载按钮 -->
              <button
                v-if="!remoteToolsStore.isInstalled(tool.id)"
                class="tool-item__btn tool-item__btn--install"
                @click="installTool(tool, repo.id)"
              >
                {{ t('store.install') }}
              </button>
              <button
                v-else-if="remoteToolsStore.isOutdated(tool.id)"
                class="tool-item__btn tool-item__btn--update"
                @click="handleUpdateTool(tool)"
              >
                {{ t('store.update') }}
              </button>
              <button
                v-else
                class="tool-item__btn tool-item__btn--uninstall"
                @click="uninstallTool(tool.id)"
              >
                {{ t('store.uninstall') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRemoteToolsStore } from '../stores/remoteTools'
import { useToolsStore } from '../stores/tools'
import { mergeRemoteTools } from '../tools'
import { initSearchIndex } from '../utils/fuzzySearch'
import { CATEGORIES } from '../tools/types'
import type { RemoteToolEntry } from '@shared/types'

const { t } = useI18n()
const remoteToolsStore = useRemoteToolsStore()
const toolsStore = useToolsStore()

const newRepoInput = ref('')
const searchQuery = ref('')
const activeCategory = ref('all')
const sortBy = ref<'name' | 'installed' | 'recent'>('installed')
const repoTools = reactive<Record<string, RemoteToolEntry[]>>({})
const loadingRepos = reactive<Record<string, boolean>>({})
const loadErrors = reactive<Record<string, boolean>>({})
const importInputRef = ref<HTMLInputElement>()

/** 获取分类名称 */
function getCategoryName(categoryId: string): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  return cat?.name || categoryId
}

/** 分类筛选标签（含"全部"） */
const filterCategories = computed(() => {
  const all = Object.values(repoTools).flat()
  const categoryCounts: Record<string, number> = {}
  for (const tool of all) {
    for (const cat of tool.category || []) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  }
  return [
    { id: 'all', name: t('store.filterAll'), count: all.length },
    ...CATEGORIES.filter((c) => categoryCounts[c.id] > 0).map((c) => ({
      id: c.id,
      name: c.name,
      count: categoryCounts[c.id] || 0
    }))
  ]
})

/** 过滤+排序后的工具 */
function filteredTools(repoId: string): RemoteToolEntry[] {
  let tools = repoTools[repoId] || []

  // 分类筛选
  if (activeCategory.value !== 'all') {
    tools = tools.filter((tool) => tool.category?.includes(activeCategory.value))
  }

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    tools = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.nameZh.includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q))
    )
  }

  // 排序
  const sorted = [...tools]
  if (sortBy.value === 'name') {
    sorted.sort((a, b) => a.nameZh.localeCompare(b.nameZh))
  } else if (sortBy.value === 'installed') {
    sorted.sort((a, b) => {
      const ai = remoteToolsStore.isInstalled(a.id) ? 0 : 1
      const bi = remoteToolsStore.isInstalled(b.id) ? 0 : 1
      return ai - bi
    })
  } else if (sortBy.value === 'recent') {
    sorted.sort((a, b) => {
      const aTool = remoteToolsStore.installedTools.find((i) => i.id === a.id)
      const bTool = remoteToolsStore.installedTools.find((i) => i.id === b.id)
      return (bTool?.installedAt || 0) - (aTool?.installedAt || 0)
    })
  }

  return sorted
}

/** 判断仓库工具是否全部已安装 */
function allToolsInstalled(repoId: string): boolean {
  const tools = repoTools[repoId] || []
  return tools.length > 0 && tools.every((tool) => remoteToolsStore.isInstalled(tool.id))
}

/** 判断仓库是否有工具已安装 */
function anyToolInstalled(repoId: string): boolean {
  const tools = repoTools[repoId] || []
  return tools.some((tool) => remoteToolsStore.isInstalled(tool.id))
}

/** 添加仓库 */
async function handleAddRepo(): Promise<void> {
  const input = newRepoInput.value.trim()
  if (!input) return
  if (!input.includes('/')) {
    window.$he3?.message.error('请输入有效的 GitHub 仓库地址')
    return
  }

  let repoId = input
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')

  const success = await remoteToolsStore.addRepo(repoId)
  if (success) {
    newRepoInput.value = ''
    await loadRepoTools(repoId)
    window.$he3?.message.success('仓库添加成功')
  } else {
    window.$he3?.message.error('添加失败，请检查仓库地址或网络')
  }
}

/** 加载仓库工具列表 */
async function loadRepoTools(repoId: string): Promise<void> {
  loadingRepos[repoId] = true
  loadErrors[repoId] = false
  try {
    const registry = await remoteToolsStore.fetchRegistry(repoId)
    repoTools[repoId] = registry.tools
  } catch {
    loadErrors[repoId] = true
  } finally {
    loadingRepos[repoId] = false
  }
}

/** 刷新仓库 */
async function refreshRepo(repoId: string): Promise<void> {
  delete remoteToolsStore.registryCache[repoId]
  await loadRepoTools(repoId)
}

/** 移除仓库 */
function removeRepo(repoId: string): void {
  remoteToolsStore.removeRepo(repoId)
  delete repoTools[repoId]
  refreshToolList()
  window.$he3?.message.info('已移除仓库')
}

/** 安装工具 */
function installTool(tool: RemoteToolEntry, repoId: string): void {
  remoteToolsStore.installTool(tool, repoId)
  refreshToolList()
  window.$he3?.message.success(t('store.installSuccess', { name: tool.nameZh }))
}

/** 卸载工具 */
function uninstallTool(toolId: string): void {
  remoteToolsStore.uninstallTool(toolId)
  refreshToolList()
  window.$he3?.message.info(t('store.uninstallSuccess', { name: toolId }))
}

/** 安装仓库全部工具 */
async function handleInstallAll(repoId: string): Promise<void> {
  const count = await remoteToolsStore.installAllFromRepo(repoId)
  refreshToolList()
  window.$he3?.message.success(t('store.installAllSuccess', { count }))
}

/** 卸载仓库全部工具 */
function handleUninstallAll(repoId: string): void {
  const count = remoteToolsStore.uninstallAllFromRepo(repoId)
  refreshToolList()
  window.$he3?.message.info(t('store.uninstallAllSuccess', { count }))
}

/** 检查更新 */
async function handleCheckUpdates(): Promise<void> {
  const outdated = await remoteToolsStore.checkUpdates()
  if (outdated.length === 0) {
    window.$he3?.message.success(t('store.noUpdates'))
  } else {
    window.$he3?.message.info(`发现 ${outdated.length} 个可更新工具`)
  }
}

/** 更新单个工具 */
function handleUpdateTool(tool: RemoteToolEntry): void {
  const installed = remoteToolsStore.installedTools.find((i) => i.id === tool.id)
  if (installed) {
    remoteToolsStore.installTool(tool, installed.sourceRepo)
    remoteToolsStore.outdatedTools = remoteToolsStore.outdatedTools.filter((i) => i.toolId !== tool.id)
    refreshToolList()
    window.$he3?.message.success(t('store.updateSuccess'))
  }
}

/** 更新全部 */
function handleUpdateAll(): void {
  const count = remoteToolsStore.updateAll()
  refreshToolList()
  window.$he3?.message.success(t('store.updateAllSuccess', { count }))
}

/** 导出已安装列表 */
function handleExport(): void {
  const json = remoteToolsStore.exportInstalled()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `supertools-installed-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  window.$he3?.message.success(t('store.exportSuccess', { count: remoteToolsStore.installedCount }))
}

/** 触发文件选择 */
function triggerImport(): void {
  importInputRef.value?.click()
}

/** 导入列表 */
async function handleImport(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const text = await file.text()
  const result = await remoteToolsStore.importInstalled(text)
  refreshToolList()
  window.$he3?.message.info(t('store.importSuccess', { success: result.success, failed: result.failed }))
  input.value = ''
}

/** 刷新工具列表（注册到搜索+导航） */
function refreshToolList(): void {
  mergeRemoteTools(remoteToolsStore.remoteToolManifests)
  toolsStore.registerTools([...toolsStore.tools])
  initSearchIndex([...toolsStore.tools])
}

onMounted(async () => {
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

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  &__subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  &__add-repo {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__hint {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 20px;
    line-height: 1.5;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 200px;
    padding: 6px 12px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
  }

  &__search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 13px;

    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: var(--color-error);
    color: white;
    font-size: 10px;
    font-weight: 600;
    margin-left: 4px;
  }

  &__filters {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  &__filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    &.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }
  }

  &__filter-count {
    font-size: 10px;
    opacity: 0.8;
  }

  &__summary {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 60px 20px;
    color: var(--text-tertiary);
    font-size: 14px;
  }

  &__empty-hint {
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

.store-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color-light);
  }

  &__repo-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
  }

  &__repo-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__repo-id {
    font-size: 12px;
    color: var(--text-tertiary);
    font-family: 'SF Mono', Menlo, monospace;
  }

  &__tool-count {
    font-size: 11px;
    color: var(--text-tertiary);
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--bg-base);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    &--remove:hover {
      color: var(--color-error);
    }
  }

  &__loading,
  &__error,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 30px;
    color: var(--text-tertiary);
    font-size: 13px;
  }

  &__error {
    cursor: pointer;
    color: var(--color-error);
  }

  &__bulk {
    display: flex;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-color-light);
  }
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color-light);
  transition: background var(--transition-fast);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-hover);
  }

  &.installed {
    background: rgba(34, 197, 94, 0.04);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--bg-base);
    color: var(--color-primary);
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  &__version {
    font-size: 10px;
    color: var(--text-tertiary);
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--bg-base);
    font-family: 'SF Mono', Menlo, monospace;
  }

  &__update-badge {
    font-size: 10px;
    color: white;
    background: var(--color-warning);
    padding: 1px 6px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      opacity: 0.85;
    }
  }

  &__desc {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    gap: 12px;
    margin-top: 3px;
  }

  &__meta-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--text-tertiary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__rating {
    display: flex;
    gap: 2px;
  }

  &__rate-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-base);
      color: var(--text-secondary);
    }

    &.active {
      color: var(--color-primary);
    }
  }

  &__btn {
    padding: 5px 14px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;

    &--install {
      background: var(--color-primary);
      color: white;

      &:hover {
        opacity: 0.9;
      }
    }

    &--update {
      background: var(--color-warning);
      color: white;

      &:hover {
        opacity: 0.9;
      }
    }

    &--uninstall {
      background: var(--bg-base);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);

      &:hover {
        border-color: var(--color-error);
        color: var(--color-error);
      }
    }
  }
}
</style>
