<template>
  <div class="store-view">
    <header class="store-view__header">
      <div>
        <h1 class="store-view__title">{{ t('store.title') }}</h1>
        <p class="store-view__subtitle">{{ t('store.subtitle') }}</p>
      </div>
      <div v-if="remoteToolsStore.repos.length > 0" class="store-view__stats" aria-live="polite">
        <span>{{ t('store.reposSummary', { count: remoteToolsStore.repos.length }) }}</span>
        <span>{{ t('store.installedSummary', { count: remoteToolsStore.installedCount }) }}</span>
      </div>
    </header>

    <!-- 添加仓库 -->
    <div class="store-view__add-repo" :aria-busy="addingRepo">
      <label class="sr-only" for="repo-address">{{ t('store.repoAddress') }}</label>
      <h-input
        id="repo-address"
        v-model="newRepoInput"
        :placeholder="t('store.addPlaceholder')"
        :readonly="addingRepo"
        @keydown.enter="handleAddRepo"
      />
      <h-button type="primary" :disabled="addingRepo || !newRepoInput.trim()" @click="handleAddRepo">
        <h-icon v-if="addingRepo" icon="mdi:loading mdi-spin" :size="14" />
        {{ addingRepo ? t('store.addingRepo') : t('store.addRepo') }}
      </h-button>
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
          :aria-label="t('store.searchPlaceholder')"
        />
        <button
          v-if="searchQuery"
          class="store-view__clear-search"
          type="button"
          :aria-label="t('store.clearSearch')"
          :title="t('store.clearSearch')"
          @click="searchQuery = ''"
        >
          <h-icon icon="mdi:close" :size="14" />
        </button>
      </div>

      <label class="store-view__sort">
        <span>{{ t('store.sortBy') }}</span>
        <select v-model="sortBy" :aria-label="t('store.sortBy')">
          <option value="installed">{{ t('store.sortInstalled') }}</option>
          <option value="name">{{ t('store.sortName') }}</option>
          <option value="recent">{{ t('store.sortRecent') }}</option>
        </select>
      </label>

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
          :disabled="updatingAll"
          @click="handleUpdateAll"
        >
          {{ updatingAll ? t('store.updating') : t('store.updateAll') }}
        </h-button>
        <h-button size="small" :icon="'mdi:download'" @click="handleExport">{{ t('store.exportList') }}</h-button>
        <h-button size="small" :icon="'mdi:upload'" @click="triggerImport">{{ t('store.importList') }}</h-button>
        <input ref="importInputRef" type="file" accept=".json" style="display:none" @change="handleImport" />
      </div>
    </div>

    <!-- 分类筛选 -->
    <div v-if="remoteToolsStore.repos.length > 0" class="store-view__filters">
      <button
        v-for="cat in filterCategories"
        :key="cat.id"
        class="store-view__filter-tag"
        :class="{ active: activeCategory === cat.id }"
        type="button"
        :aria-pressed="activeCategory === cat.id"
        @click="activeCategory = cat.id"
      >
        {{ cat.id === 'all' ? t('store.filterAll') : cat.name }}
        <span v-if="cat.count > 0" class="store-view__filter-count">{{ cat.count }}</span>
      </button>
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
            <button
              class="store-card__btn store-card__btn--refresh"
              type="button"
              :disabled="loadingRepos[repo.id]"
              :aria-label="t('store.refreshRepo', { name: repo.name })"
              :title="t('store.refresh')"
              @click="refreshRepo(repo.id)"
            >
              <h-icon :icon="loadingRepos[repo.id] ? 'mdi:loading mdi-spin' : 'mdi:refresh'" :size="16" />
            </button>
            <button
              class="store-card__btn store-card__btn--remove"
              type="button"
              :aria-label="t('store.removeRepo', { name: repo.name })"
              :title="t('store.remove')"
              @click="requestRemoveRepo(repo.id)"
            >
              <h-icon icon="mdi:trash-can-outline" :size="16" />
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingRepos[repo.id]" class="store-card__loading">
          <h-icon icon="mdi:loading mdi-spin" :size="20" color="var(--text-tertiary)" />
          <span>{{ t('store.loading') }}</span>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="loadErrors[repo.id]" class="store-card__error" role="alert">
          <h-icon icon="mdi:alert-circle-outline" :size="20" color="var(--color-error)" />
          <span>{{ t('store.loadFailed') }}</span>
          <h-button size="small" @click="refreshRepo(repo.id)">{{ t('store.retry') }}</h-button>
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
              :disabled="repoActions[repo.id] === 'install'"
              @click="handleInstallAll(repo.id)"
            >
              {{ repoActions[repo.id] === 'install' ? t('store.installing') : t('store.installAll') }}
            </h-button>
            <h-button
              v-if="anyToolInstalled(repo.id)"
              size="small"
              :icon="'mdi:trash-can-outline'"
              :disabled="repoActions[repo.id] === 'uninstall'"
              @click="requestUninstallAll(repo.id)"
            >
              {{ t('store.uninstallAll') }}
            </h-button>
          </div>

          <div
            v-for="tool in filteredTools(repo.id)"
            :key="tool.id"
            class="tool-item"
            :class="{ installed: remoteToolsStore.isInstalled(tool.id, repo.id) }"
          >
            <div class="tool-item__icon">
              <h-icon :icon="tool.icon" :size="20" />
            </div>
            <div class="tool-item__info">
              <div class="tool-item__name-row">
                <span class="tool-item__name">{{ tool.nameZh }}</span>
                <span v-if="tool.version" class="tool-item__version">v{{ tool.version }}</span>
                <button
                  v-if="remoteToolsStore.isOutdated(tool.id, repo.id)"
                  class="tool-item__update-badge"
                  type="button"
                  :disabled="toolActions[tool.id] === 'update'"
                  @click.stop="handleUpdateTool(tool)"
                >
                  {{ t('store.hasUpdate') }}
                </button>
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
                  :class="{ active: remoteToolsStore.getRating(tool.id, repo.id) === 'like' }"
                  type="button"
                  :aria-label="t('store.likeTool', { name: tool.nameZh })"
                  :aria-pressed="remoteToolsStore.getRating(tool.id, repo.id) === 'like'"
                  @click.stop="remoteToolsStore.setRating(tool.id, 'like', repo.id)"
                >
                  <h-icon icon="mdi:thumb-up-outline" :size="14" />
                </button>
                <button
                  class="tool-item__rate-btn"
                  :class="{ active: remoteToolsStore.getRating(tool.id, repo.id) === 'dislike' }"
                  type="button"
                  :aria-label="t('store.dislikeTool', { name: tool.nameZh })"
                  :aria-pressed="remoteToolsStore.getRating(tool.id, repo.id) === 'dislike'"
                  @click.stop="remoteToolsStore.setRating(tool.id, 'dislike', repo.id)"
                >
                  <h-icon icon="mdi:thumb-down-outline" :size="14" />
                </button>
              </div>

              <!-- 安装/卸载按钮 -->
              <button
                v-if="!remoteToolsStore.isInstalled(tool.id, repo.id)"
                class="tool-item__btn tool-item__btn--install"
                type="button"
                :disabled="toolActions[tool.id] === 'install'"
                @click="installTool(tool, repo.id)"
              >
                {{ toolActions[tool.id] === 'install' ? t('store.installing') : t('store.install') }}
              </button>
              <button
                v-else-if="remoteToolsStore.isOutdated(tool.id, repo.id)"
                class="tool-item__btn tool-item__btn--update"
                type="button"
                :disabled="toolActions[tool.id] === 'update'"
                @click="handleUpdateTool(tool)"
              >
                {{ toolActions[tool.id] === 'update' ? t('store.updating') : t('store.update') }}
              </button>
              <button
                v-else
                class="tool-item__btn tool-item__btn--uninstall"
                type="button"
                @click="requestUninstallTool(tool, repo.id)"
              >
                {{ t('store.uninstall') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="confirmation" class="store-confirm" role="presentation" @click.self="closeConfirmation">
      <section
        ref="confirmationDialogRef"
        class="store-confirm__dialog"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="'store-confirm-title'"
        :aria-describedby="'store-confirm-description'"
        @keydown="handleConfirmationKeydown"
      >
        <div class="store-confirm__icon"><h-icon icon="mdi:alert-outline" :size="22" /></div>
        <div class="store-confirm__content">
          <h2 id="store-confirm-title">{{ confirmation.title }}</h2>
          <p id="store-confirm-description">{{ confirmation.description }}</p>
        </div>
        <div class="store-confirm__actions">
          <h-button @click="closeConfirmation">{{ t('store.cancel') }}</h-button>
          <button class="store-confirm__danger" type="button" @click="confirmAction">{{ confirmation.confirmLabel }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
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
const confirmationDialogRef = ref<HTMLElement>()
const addingRepo = ref(false)
const updatingAll = ref(false)
const toolActions = reactive<Record<string, 'install' | 'update' | undefined>>({})
const repoActions = reactive<Record<string, 'install' | 'uninstall' | undefined>>({})
const confirmation = ref<{
  title: string
  description: string
  confirmLabel: string
  action: () => void | Promise<void>
} | null>(null)
let confirmationTrigger: HTMLElement | null = null

const installedToolMap = computed(() => new Map(
  remoteToolsStore.installedTools.map((tool) => [`${tool.sourceRepo}:${tool.id}`, tool])
))

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
      const ai = remoteToolsStore.isInstalled(a.id, repoId) ? 0 : 1
      const bi = remoteToolsStore.isInstalled(b.id, repoId) ? 0 : 1
      return ai - bi
    })
  } else if (sortBy.value === 'recent') {
    sorted.sort((a, b) => {
      const aTool = installedToolMap.value.get(`${repoId}:${a.id}`)
      const bTool = installedToolMap.value.get(`${repoId}:${b.id}`)
      return (bTool?.installedAt || 0) - (aTool?.installedAt || 0)
    })
  }

  return sorted
}

/** 判断仓库工具是否全部已安装 */
function allToolsInstalled(repoId: string): boolean {
  const tools = repoTools[repoId] || []
  return tools.length > 0 && tools.every((tool) => remoteToolsStore.isInstalled(tool.id, repoId))
}

/** 判断仓库是否有工具已安装 */
function anyToolInstalled(repoId: string): boolean {
  const tools = repoTools[repoId] || []
  return tools.some((tool) => remoteToolsStore.isInstalled(tool.id, repoId))
}

/** 添加仓库 */
async function handleAddRepo(): Promise<void> {
  if (addingRepo.value) return
  const input = newRepoInput.value.trim()
  if (!input) return

  const repoId = input
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoId)) {
    window.$he3?.message.error(t('store.invalidRepo'))
    return
  }

  addingRepo.value = true
  try {
    const success = await remoteToolsStore.addRepo(repoId)
    if (success) {
      newRepoInput.value = ''
      await loadRepoTools(repoId)
      window.$he3?.message.success(t('store.repoAdded'))
    } else {
      window.$he3?.message.error(
        remoteToolsStore.repos.some((repo) => repo.id === repoId)
          ? t('store.repoExists')
          : t('store.addFailed')
      )
    }
  } finally {
    addingRepo.value = false
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

/** 移除仓库（store 会同时卸载来源于该仓库的工具） */
function removeRepo(repoId: string): void {
  remoteToolsStore.removeRepo(repoId)
  delete repoTools[repoId]
  refreshToolList()
  window.$he3?.message.info(t('store.repoRemoved'))
}

function openConfirmation(options: NonNullable<typeof confirmation.value>): void {
  confirmationTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  confirmation.value = options
  void nextTick(() => {
    confirmationDialogRef.value?.querySelector<HTMLButtonElement>('button')?.focus()
  })
}

function closeConfirmation(): void {
  confirmation.value = null
  const trigger = confirmationTrigger
  confirmationTrigger = null
  void nextTick(() => {
    if (trigger?.isConnected) trigger.focus()
  })
}

function handleConfirmationKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeConfirmation()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = confirmationDialogRef.value?.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable?.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

async function confirmAction(): Promise<void> {
  const action = confirmation.value?.action
  closeConfirmation()
  await action?.()
}

function requestRemoveRepo(repoId: string): void {
  const repo = remoteToolsStore.repos.find((item) => item.id === repoId)
  if (!repo) return
  const installedCount = remoteToolsStore.installedTools.filter((tool) => tool.sourceRepo === repoId).length
  openConfirmation({
    title: t('store.removeRepoTitle'),
    description: installedCount > 0
      ? t('store.removeRepoWithTools', { name: repo.name, count: installedCount })
      : t('store.removeRepoDescription', { name: repo.name }),
    confirmLabel: t('store.remove'),
    action: () => removeRepo(repoId)
  })
}

/** 安装工具 */
async function installTool(tool: RemoteToolEntry, repoId: string): Promise<void> {
  if (toolActions[tool.id]) return
  const conflict = remoteToolsStore.installedTools.find(
    (installed) => installed.id === tool.id && installed.sourceRepo !== repoId
  )
  if (conflict) {
    window.$he3?.message.error(t('store.toolIdConflict', { repo: conflict.sourceRepo }))
    return
  }
  toolActions[tool.id] = 'install'
  try {
    const success = await remoteToolsStore.installTool(tool, repoId)
    if (success) refreshToolList()
    window.$he3?.message[success ? 'success' : 'error'](success ? t('store.installSuccess', { name: tool.nameZh }) : t('store.installFailed'))
  } finally {
    delete toolActions[tool.id]
  }
}

/** 卸载工具 */
function uninstallTool(tool: RemoteToolEntry, repoId: string): void {
  remoteToolsStore.uninstallTool(tool.id, repoId)
  refreshToolList()
  window.$he3?.message.info(t('store.uninstallSuccess', { name: tool.nameZh }))
}

function requestUninstallTool(tool: RemoteToolEntry, repoId: string): void {
  openConfirmation({
    title: t('store.uninstallToolTitle'),
    description: t('store.uninstallToolDescription', { name: tool.nameZh }),
    confirmLabel: t('store.uninstall'),
    action: () => uninstallTool(tool, repoId)
  })
}

/** 安装仓库全部工具 */
async function handleInstallAll(repoId: string): Promise<void> {
  if (repoActions[repoId]) return
  repoActions[repoId] = 'install'
  try {
    const count = await remoteToolsStore.installAllFromRepo(repoId)
    refreshToolList()
    window.$he3?.message.success(t('store.installAllSuccess', { count }))
  } finally {
    delete repoActions[repoId]
  }
}

/** 卸载仓库全部工具 */
function handleUninstallAll(repoId: string): void {
  const count = remoteToolsStore.uninstallAllFromRepo(repoId)
  refreshToolList()
  window.$he3?.message.info(t('store.uninstallAllSuccess', { count }))
}

function requestUninstallAll(repoId: string): void {
  const repo = remoteToolsStore.repos.find((item) => item.id === repoId)
  const count = remoteToolsStore.installedTools.filter((tool) => tool.sourceRepo === repoId).length
  if (!repo || count === 0) return
  openConfirmation({
    title: t('store.uninstallAllTitle'),
    description: t('store.uninstallAllDescription', { name: repo.name, count }),
    confirmLabel: t('store.uninstallAll'),
    action: async () => {
      repoActions[repoId] = 'uninstall'
      try {
        handleUninstallAll(repoId)
      } finally {
        delete repoActions[repoId]
      }
    }
  })
}

/** 检查更新 */
async function handleCheckUpdates(): Promise<void> {
  const outdated = await remoteToolsStore.checkUpdates()
  if (remoteToolsStore.updateCheckErrors.length > 0) {
    window.$he3?.message.warning(t('store.updateCheckPartialFailed', {
      count: remoteToolsStore.updateCheckErrors.length
    }))
  } else if (outdated.length === 0) {
    window.$he3?.message.success(t('store.noUpdates'))
  } else {
    window.$he3?.message.info(t('store.updatesFound', { count: outdated.length }))
  }
}

/** 更新单个工具 */
async function handleUpdateTool(tool: RemoteToolEntry): Promise<void> {
  if (toolActions[tool.id]) return
  const installed = remoteToolsStore.installedTools.find((i) => i.id === tool.id)
  if (installed) {
    toolActions[tool.id] = 'update'
    try {
      const success = await remoteToolsStore.installTool(tool, installed.sourceRepo)
      if (!success) {
        window.$he3?.message.error(t('store.updateFailed'))
        return
      }
      remoteToolsStore.outdatedTools = remoteToolsStore.outdatedTools.filter((i) => i.toolId !== tool.id)
      refreshToolList()
      window.$he3?.message.success(t('store.updateSuccess'))
    } finally {
      delete toolActions[tool.id]
    }
  }
}

/** 更新全部 */
async function handleUpdateAll(): Promise<void> {
  if (updatingAll.value) return
  updatingAll.value = true
  try {
    const count = await remoteToolsStore.updateAll()
    refreshToolList()
    window.$he3?.message.success(t('store.updateAllSuccess', { count }))
  } finally {
    updatingAll.value = false
  }
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
  await Promise.all(remoteToolsStore.repos.map((repo) => loadRepoTools(repo.id)))
})
</script>

<style scoped lang="less">
.store-view {
  padding: 24px;
  max-width: 1040px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px;
  }

  &__subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
  }

  &__stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    span {
      padding: 5px 9px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      background: var(--bg-surface);
      font-size: 12px;
    }
  }

  &__add-repo {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;

    :deep(.h-input) {
      flex: 1;
      min-width: 0;
    }
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
    min-height: 34px;
    padding: 0 8px 0 12px;
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

  &__search:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 28%, transparent);
  }

  &__clear-search {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--text-tertiary);
    background: transparent;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      color: var(--text-primary);
      background: var(--bg-hover);
    }
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 0 9px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-tertiary);
    background: var(--bg-surface);
    font-size: 12px;

    select {
      border: 0;
      outline: 0;
      color: var(--text-primary);
      background: transparent;
      font: inherit;
      cursor: pointer;
    }

    &:focus-within {
      border-color: var(--color-primary);
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
    font-family: inherit;

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
    min-width: 0;
    flex-wrap: wrap;
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
    width: 32px;
    height: 32px;
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

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 1px;
    }

    &:disabled {
      opacity: 0.55;
      cursor: wait;
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
    border: 0;
    font-size: 10px;
    color: white;
    background: var(--color-warning);
    padding: 1px 6px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-family: inherit;

    &:hover {
      opacity: 0.85;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
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
    width: 30px;
    height: 30px;
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
      background: var(--bg-base);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 1px;
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
    min-height: 30px;

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

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.58;
      cursor: wait;
    }
  }
}

.store-confirm {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);

  &__dialog {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    width: min(420px, 100%);
    padding: 20px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    background: var(--bg-surface);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: var(--color-error);
    background: rgba(239, 68, 68, 0.1);
  }

  &__content {
    h2 {
      margin: 1px 0 6px;
      color: var(--text-primary);
      font-size: 15px;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.6;
    }
  }

  &__actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  &__danger {
    min-height: 32px;
    padding: 5px 14px;
    border: 1px solid var(--color-error);
    border-radius: var(--radius-sm);
    color: white;
    background: var(--color-error);
    font: inherit;
    font-size: 13px;
    cursor: pointer;

    &:hover { opacity: 0.9; }
    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// 主窗口最小宽度为 900px，扣除侧栏后内容区约 685px；断点需在此之前生效。
@media (max-width: 1000px) {
  .store-view {
    padding: 16px;

    &__header { flex-direction: column; gap: 12px; }
    &__toolbar { align-items: stretch; }
    &__search { flex-basis: 100%; }
    &__actions { width: 100%; }
    &__actions :deep(.h-button) { flex: 1; min-height: 44px; }
    &__clear-search { width: 44px; height: 44px; }
  }

  .store-card {
    &__header { align-items: flex-start; gap: 12px; }
    &__repo-id { flex-basis: 100%; overflow-wrap: anywhere; }
    &__btn { width: 44px; height: 44px; }
  }

  .tool-item {
    align-items: flex-start;
    flex-wrap: wrap;

    &__info { width: calc(100% - 48px); }
    &__actions { width: 100%; justify-content: flex-end; }
    &__rate-btn { width: 44px; height: 44px; }
    &__btn { min-height: 44px; }
    &__desc { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .store-view *, .store-card *, .tool-item *, .store-confirm * { transition: none !important; }
}
</style>
