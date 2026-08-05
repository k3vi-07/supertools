<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="visible" class="search-modal" @click.self="close">
        <!-- 搜索面板 -->
        <div class="search-modal__panel">
          <!-- 输入框 -->
          <div class="search-modal__input-box">
            <h-icon icon="mdi:magnify" :size="22" color="var(--text-tertiary)" />
            <input
              ref="inputRef"
              v-model="query"
              class="search-modal__input"
              :placeholder="t('search.placeholder')"
              spellcheck="false"
              @keydown="handleKeyDown"
            />
            <kbd class="search-modal__esc">ESC</kbd>
          </div>

          <!-- 内容区 -->
          <div class="search-modal__body">
            <!-- 搜索结果 -->
            <template v-if="query.trim() && flatResults.length > 0">
              <div class="search-modal__results">
                <div
                  v-for="(item, i) in flatResults"
                  :key="item.tool.id"
                  class="search-modal__result"
                  :class="{ active: i === activeIndex }"
                  @mouseenter="activeIndex = i"
                  @click="selectTool(item.tool.id)"
                >
                  <div class="search-modal__result-icon">
                    <h-icon :icon="item.tool.icon" :size="20" />
                  </div>
                  <div class="search-modal__result-info">
                    <div class="search-modal__result-name">{{ item.tool.nameZh }}</div>
                    <div class="search-modal__result-desc">{{ item.tool.description }}</div>
                  </div>
                  <div class="search-modal__result-category">
                    {{ getCategoryName(item.tool.category[0]) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 空结果 -->
            <template v-else-if="query.trim() && flatResults.length === 0">
              <div class="search-modal__empty">
                <h-icon icon="mdi:magnify-close" :size="36" color="var(--text-tertiary)" />
                <p>{{ t('search.noResult') }}</p>
              </div>
            </template>

            <!-- 默认状态：最近使用 + 收藏 -->
            <template v-else>
              <!-- 最近使用 -->
              <div v-if="recentItems.length > 0" class="search-modal__section">
                <div class="search-modal__section-header">
                  <h-icon icon="mdi:history" :size="14" />
                  <span>{{ t('home.recent') }}</span>
                </div>
                <div
                  v-for="(item, i) in recentItems"
                  :key="'r-' + item.tool.id"
                  class="search-modal__result"
                  :class="{ active: i === activeIndex }"
                  @mouseenter="activeIndex = i"
                  @click="selectTool(item.tool.id)"
                >
                  <div class="search-modal__result-icon">
                    <h-icon :icon="item.tool.icon" :size="20" />
                  </div>
                  <div class="search-modal__result-info">
                    <div class="search-modal__result-name">{{ item.tool.nameZh }}</div>
                  </div>
                  <div class="search-modal__result-category">{{ getCategoryName(item.tool.category[0]) }}</div>
                </div>
              </div>

              <!-- 收藏 -->
              <div v-if="favoriteItems.length > 0" class="search-modal__section">
                <div class="search-modal__section-header">
                  <h-icon icon="mdi:star-outline" :size="14" />
                  <span>{{ t('home.favorites') }}</span>
                </div>
                <div
                  v-for="(item, i) in favoriteItems"
                  :key="'f-' + item.tool.id"
                  class="search-modal__result"
                  :class="{ active: (recentItems.length + i) === activeIndex }"
                  @mouseenter="activeIndex = recentItems.length + i"
                  @click="selectTool(item.tool.id)"
                >
                  <div class="search-modal__result-icon">
                    <h-icon :icon="item.tool.icon" :size="20" />
                  </div>
                  <div class="search-modal__result-info">
                    <div class="search-modal__result-name">{{ item.tool.nameZh }}</div>
                  </div>
                  <div class="search-modal__result-category">{{ getCategoryName(item.tool.category[0]) }}</div>
                </div>
              </div>

              <!-- 既无历史也无收藏 -->
              <div v-if="recentItems.length === 0 && favoriteItems.length === 0" class="search-modal__empty">
                <h-icon icon="mdi:keyboard-outline" :size="36" color="var(--text-tertiary)" />
                <p>{{ t('search.hint') }}</p>
              </div>
            </template>
          </div>

          <!-- 底部状态栏 -->
          <div class="search-modal__footer">
            <div class="search-modal__footer-hints">
              <span><kbd>↑</kbd><kbd>↓</kbd> {{ t('search.navigate') }}</span>
              <span><kbd>↵</kbd> {{ t('search.open') }}</span>
              <span><kbd>ESC</kbd> {{ t('search.close') }}</span>
            </div>
            <div class="search-modal__footer-count">
              {{ flatResults.length }} {{ t('search.results') }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { searchTools, initSearchIndex } from '../utils/fuzzySearch'
import { useToolsStore } from '../stores/tools'
import { useHistoryStore } from '../stores/history'
import { useFavoritesStore } from '../stores/favorites'
import { CATEGORIES } from '../tools/types'
import type { ToolManifest } from '../tools/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const { t } = useI18n()
const toolsStore = useToolsStore()
const historyStore = useHistoryStore()
const favoritesStore = useFavoritesStore()

const query = ref('')
const inputRef = ref<HTMLInputElement>()
const activeIndex = ref(0)
const searchResults = ref<ReturnType<typeof searchTools>>([])

/** 获取分类名称 */
function getCategoryName(categoryId: string): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  return cat?.name || categoryId
}

/** 搜索结果（有输入时） */
const searchItems = computed(() => {
  if (!query.value.trim()) return []
  return searchResults.value.map((r) => ({ tool: r.tool, score: r.score }))
})

/** 最近使用工具列表 */
const recentItems = computed(() => {
  return historyStore.recentToolIds
    .slice(0, 5)
    .map((id) => toolsStore.getToolById(id))
    .filter((tool): tool is ToolManifest => tool !== undefined)
    .map((tool) => ({ tool }))
})

/** 收藏工具列表 */
const favoriteItems = computed(() => {
  return favoritesStore.favoriteList
    .slice(0, 5)
    .map((id) => toolsStore.getToolById(id))
    .filter((tool): tool is ToolManifest => tool !== undefined)
    .map((tool) => ({ tool }))
})

/** 扁平化结果列表（用于键盘导航） */
const flatResults = computed(() => {
  if (query.value.trim()) return searchItems.value
  return [...recentItems.value, ...favoriteItems.value]
})

/** 执行搜索 */
function performSearch(): void {
  if (query.value.trim()) {
    searchResults.value = searchTools(query.value, 30)
  } else {
    searchResults.value = []
  }
  activeIndex.value = 0
}

watch(query, performSearch)

/** 当 visible 变化时，初始化/重置 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      query.value = ''
      searchResults.value = []
      activeIndex.value = 0
      initSearchIndex(toolsStore.tools)
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)

/** 键盘导航 */
function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, flatResults.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = flatResults.value[activeIndex.value]
    if (item) {
      selectTool(item.tool.id)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

/** 选择工具 */
function selectTool(toolId: string): void {
  historyStore.recordUse(toolId)
  emit('update:visible', false)
  // 通过全局 router 导航
  const router = (window as unknown as { __router?: { push: (path: string) => void } }).__router
  if (router) {
    router.push(`/tool/${toolId}`)
  }
}

/** 关闭 */
function close(): void {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.search-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.search-modal__panel {
  width: 640px;
  max-width: 90vw;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.search-modal__input-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
}

.search-modal__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 17px;

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.search-modal__esc {
  padding: 3px 8px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  font-size: 11px;
  color: var(--text-tertiary);
  background: var(--bg-base);
}

.search-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.search-modal__results {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search-modal__section {
  margin-bottom: 4px;

  &:not(:first-child) {
    margin-top: 8px;
  }
}

.search-modal__section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.search-modal__result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;

  &.active {
    background: var(--bg-hover);

    .search-modal__result-icon {
      color: var(--color-primary);
    }

    .search-modal__result-name {
      color: var(--color-primary);
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: var(--color-primary);
      border-radius: 0 2px 2px 0;
    }
  }
}

.search-modal__result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-base);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.search-modal__result-info {
  flex: 1;
  min-width: 0;
}

.search-modal__result-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.search-modal__result-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.search-modal__result-category {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  flex-shrink: 0;
}

.search-modal__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.search-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-base);
}

.search-modal__footer-hints {
  display: flex;
  gap: 20px;
  font-size: 11px;
  color: var(--text-tertiary);

  kbd {
    display: inline-block;
    padding: 1px 5px;
    margin-right: 2px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    font-size: 10px;
    background: var(--bg-surface);
  }
}

.search-modal__footer-count {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* 打开/关闭动画 */
.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 0.18s ease;

  .search-modal__panel {
    transition: transform 0.18s ease, opacity 0.18s ease;
  }
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;

  .search-modal__panel {
    transform: translateY(-12px);
    opacity: 0;
  }
}
</style>
