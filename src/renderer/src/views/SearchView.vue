<template>
  <div class="search-overlay">
    <div class="search-overlay__box">
      <div class="search-overlay__input-wrapper">
        <h-icon icon="mdi:magnify" :size="20" color="var(--text-tertiary)" />
        <input
          ref="inputRef"
          v-model="query"
          class="search-overlay__input"
          :placeholder="t('search.placeholder')"
          spellcheck="false"
          @keydown="handleKeyDown"
        />
        <kbd class="search-overlay__esc">ESC</kbd>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="results.length > 0" class="search-overlay__results">
      <div
        v-for="(result, index) in results"
        :key="result.tool.id"
        class="search-overlay__result"
        :class="{ active: index === activeIndex }"
        @mouseenter="activeIndex = index"
        @click="selectTool(result.tool.id)"
      >
        <div class="search-overlay__result-icon">
          <h-icon :icon="result.tool.icon" :size="18" />
        </div>
        <div class="search-overlay__result-info">
          <div class="search-overlay__result-name">{{ result.tool.nameZh }}</div>
          <div class="search-overlay__result-desc">{{ result.tool.description }}</div>
        </div>
        <div class="search-overlay__result-category">
          {{ getCategoryName(result.tool.category[0]) }}
        </div>
      </div>
    </div>

    <!-- 无搜索结果 -->
    <div v-else-if="query && results.length === 0" class="search-overlay__empty">
      <h-icon icon="mdi:magnify-close" :size="32" color="var(--text-tertiary)" />
      <p>{{ t('search.noResult') }}</p>
    </div>

    <!-- 空状态：最近使用 -->
    <div v-else-if="recentTools.length > 0" class="search-overlay__results">
      <div class="search-overlay__section-label">{{ t('home.recent') }}</div>
      <div
        v-for="(tool, index) in recentTools"
        :key="tool.id"
        class="search-overlay__result"
        :class="{ active: index === activeIndex }"
        @mouseenter="activeIndex = index"
        @click="selectTool(tool.id)"
      >
        <div class="search-overlay__result-icon">
          <h-icon :icon="tool.icon" :size="18" />
        </div>
        <div class="search-overlay__result-info">
          <div class="search-overlay__result-name">{{ tool.nameZh }}</div>
          <div class="search-overlay__result-desc">{{ tool.description }}</div>
        </div>
        <div class="search-overlay__result-category">
          {{ getCategoryName(tool.category[0]) }}
        </div>
      </div>
    </div>

    <!-- 完全无数据 -->
    <div v-else class="search-overlay__hint">
      <p>{{ t('search.hint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { searchTools, initSearchIndex } from '../utils/fuzzySearch'
import { useToolsStore } from '../stores/tools'
import { useHistoryStore } from '../stores/history'
import { CATEGORIES } from '../tools/types'
import type { ToolManifest } from '../tools/types'

const { t } = useI18n()
const toolsStore = useToolsStore()
const historyStore = useHistoryStore()

const query = ref('')
const inputRef = ref<HTMLInputElement>()
const activeIndex = ref(0)
const results = ref<ReturnType<typeof searchTools>>([])

/** 最近使用的工具列表（空状态展示） */
const recentTools = computed((): ToolManifest[] => {
  return historyStore.recentToolIds
    .slice(0, 6)
    .map((id) => toolsStore.getToolById(id))
    .filter((tool): tool is ToolManifest => tool !== undefined)
})

/** 获取分类名称 */
function getCategoryName(categoryId: string): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  return cat?.name || categoryId
}

/** 执行搜索 */
function performSearch(): void {
  if (query.value.trim()) {
    results.value = searchTools(query.value, 20)
  } else {
    results.value = []
  }
  activeIndex.value = 0
}

/** 监听输入变化，实时搜索 */
watch(query, performSearch)

/** 键盘导航 */
function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value[activeIndex.value]) {
      selectTool(results.value[activeIndex.value].tool.id)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    exitSearch()
  }
}

/** 选择工具 */
function selectTool(toolId: string): void {
  historyStore.recordUse(toolId)
  // 如果在主窗口内（应用内搜索模式），用 router 导航
  const router = (window as unknown as { __router?: { push: (path: string) => void } }).__router
  if (router) {
    router.push(`/tool/${toolId}`)
  } else {
    // 搜索浮层模式，通过 IPC 导航
    window.supertools?.navigateToTool(toolId)
  }
}

/** 退出搜索 */
function exitSearch(): void {
  // 如果在主窗口内（应用内搜索模式），用 router 返回首页
  const router = (window as unknown as { __router?: { push: (path: string) => void } }).__router
  if (router) {
    router.push('/')
  } else {
    // 搜索浮层模式，通过 IPC 隐藏
    window.supertools?.hideSearch()
  }
}

/** ESC 全局监听 */
function handleGlobalKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    exitSearch()
  }
}

onMounted(() => {
  // 初始化搜索索引（确保 toolsStore 已注册工具）
  if (toolsStore.tools.length > 0) {
    initSearchIndex(toolsStore.tools)
  }

  // 聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })

  // 监听显示事件（重新聚焦）--仅在搜索浮层模式生效
  window.supertools?.onShow(() => {
    query.value = ''
    results.value = []
    // 重新初始化搜索索引（确保工具列表是最新的）
    initSearchIndex(toolsStore.tools)
    nextTick(() => {
      inputRef.value?.focus()
    })
  })

  window.supertools?.onFocus(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })

  document.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<style scoped lang="less">
.search-overlay {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.search-overlay__box {
  border-bottom: 1px solid var(--border-color);
}

.search-overlay__input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
}

.search-overlay__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 16px;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.search-overlay__esc {
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.search-overlay__results {
  max-height: 380px;
  overflow-y: auto;
  padding: 8px;
}

.search-overlay__section-label {
  padding: 6px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.search-overlay__result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);

  &.active {
    background: var(--color-primary);

    .search-overlay__result-name,
    .search-overlay__result-desc,
    .search-overlay__result-category,
    .search-overlay__result-icon {
      color: white;
    }
  }
}

.search-overlay__result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-base);
  color: var(--color-primary);
  flex-shrink: 0;
}

.search-overlay__result-info {
  flex: 1;
  min-width: 0;
}

.search-overlay__result-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.search-overlay__result-desc {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-overlay__result-category {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  flex-shrink: 0;
}

.search-overlay__empty,
.search-overlay__hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
