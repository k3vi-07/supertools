<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- 可拖拽标题栏区域 -->
      <div class="sidebar__drag-region"></div>

      <!-- Logo -->
      <div class="sidebar__logo" @click="router.push('/')">
        <img src="../assets/icon.png" alt="SuperTools" class="sidebar__logo-icon" />
        <span class="sidebar__logo-text">SuperTools</span>
      </div>

      <!-- 搜索框 -->
      <div class="sidebar__search" @click="focusSearch">
        <h-icon icon="mdi:magnify" :size="16" color="var(--text-tertiary)" />
        <span class="sidebar__search-placeholder">搜索工具</span>
        <kbd class="sidebar__search-kbd">{{ shortcutHint }}</kbd>
      </div>

      <!-- 导航 -->
      <nav class="sidebar__nav">
        <div class="sidebar__nav-group">
          <RouterLink to="/" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:home-outline" :size="18" />
            <span>{{ t('nav.home') }}</span>
          </RouterLink>
          <RouterLink to="/category/encode" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:lock-outline" :size="18" />
            <span>{{ t('category.encode') }}</span>
          </RouterLink>
          <RouterLink to="/category/json" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:code-json" :size="18" />
            <span>{{ t('category.json') }}</span>
          </RouterLink>
          <RouterLink to="/category/cryptography" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:shield-key-outline" :size="18" />
            <span>{{ t('category.cryptography') }}</span>
          </RouterLink>
          <RouterLink to="/category/text" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:text" :size="18" />
            <span>{{ t('category.text') }}</span>
          </RouterLink>
          <RouterLink to="/category/web" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:language-html5" :size="18" />
            <span>{{ t('category.web') }}</span>
          </RouterLink>
          <RouterLink to="/category/color" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:palette" :size="18" />
            <span>{{ t('category.color') }}</span>
          </RouterLink>
          <RouterLink to="/category/datetime" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:clock-outline" :size="18" />
            <span>{{ t('category.datetime') }}</span>
          </RouterLink>
          <RouterLink to="/category/programming" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:code-braces" :size="18" />
            <span>编程工具</span>
          </RouterLink>
          <RouterLink to="/category/network" class="sidebar__nav-item" active-class="active">
            <h-icon icon="mdi:lan" :size="18" />
            <span>网络工具</span>
          </RouterLink>

          <!-- 分隔线 -->
          <div class="sidebar__divider"></div>

          <!-- 工具商店 -->
          <RouterLink to="/store" class="sidebar__nav-item sidebar__nav-item--store" active-class="active">
            <h-icon icon="mdi:store-search-outline" :size="18" />
            <span>工具商店</span>
            <span v-if="remoteCount > 0" class="sidebar__badge">{{ remoteCount }}</span>
          </RouterLink>
        </div>
      </nav>

      <!-- 底部 -->
      <div class="sidebar__footer">
        <RouterLink to="/settings" class="sidebar__nav-item" active-class="active">
          <h-icon icon="mdi:cog-outline" :size="18" />
          <span>{{ t('nav.settings') }}</span>
        </RouterLink>
        <button class="sidebar__theme-btn" @click="settingsStore.toggleTheme()">
          <h-icon
            :icon="settingsStore.theme === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'"
            :size="18"
          />
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 可拖拽标题栏条 -->
      <div class="main-content__drag-bar"></div>
      <div class="main-content__body">
        <RouterView v-slot="{ Component: comp }">
          <Transition name="fade" mode="out-in">
            <component :is="comp" />
          </Transition>
        </RouterView>
      </div>
    </main>

    <!-- 弹出式搜索 -->
    <SearchModal v-model:visible="searchVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { useFavoritesStore } from '../stores/favorites'
import { useHistoryStore } from '../stores/history'
import { useRemoteToolsStore } from '../stores/remoteTools'
import SearchModal from '../components/SearchModal.vue'

const router = useRouter()
const { t } = useI18n()
const settingsStore = useSettingsStore()
const favoritesStore = useFavoritesStore()
const historyStore = useHistoryStore()
const remoteToolsStore = useRemoteToolsStore()

/** 已安装远程工具数量 */
const remoteCount = computed(() => remoteToolsStore.installedTools.length)

const shortcutHint = computed(() => {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  return isMac ? '⌘K' : 'Ctrl+K'
})

/** 弹出式搜索可见性 */
const searchVisible = ref(false)

function focusSearch(): void {
  searchVisible.value = true
}

// 全局快捷键监听（Cmd+K / Ctrl+K）
function handleKeyDown(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchVisible.value = true
  }
}

// 监听导航事件（从搜索浮层）
let navHandler: ((toolId: string) => void) | null = null

onMounted(() => {
  favoritesStore.init()
  historyStore.init()
  remoteToolsStore.init()
  document.addEventListener('keydown', handleKeyDown)

  // 暴露 router 给 App.vue 用于导航
  ;(window as unknown as { __router?: typeof router }).__router = router

  // 监听搜索浮层导航
  navHandler = (toolId: string) => {
    router.push(`/tool/${toolId}`)
  }
  window.supertools?.onNavigate(navHandler)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="less">
.main-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  padding: 0 0 12px;

  &__drag-region {
    height: 28px;
    flex-shrink: 0;
    -webkit-app-region: drag;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 16px 16px;
    cursor: pointer;
  }

  &__logo-icon {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    flex-shrink: 0;
  }

  &__logo-text {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 12px 12px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
    background: var(--bg-base);
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
    }
  }

  &__search-placeholder {
    flex: 1;
    font-size: 13px;
    color: var(--text-tertiary);
  }

  &__search-kbd {
    padding: 2px 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 11px;
    color: var(--text-tertiary);
    background: var(--bg-surface);
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
  }

  &__nav-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 13px;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    &.active {
      background: var(--color-primary);
      color: white;
    }

    &--store {
      color: var(--color-primary);

      &.active {
        background: var(--color-primary);
      }
    }
  }

  &__divider {
    height: 1px;
    background: var(--border-color);
    margin: 8px 12px;
  }

  &__badge {
    margin-left: auto;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--color-primary);
    color: white;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__footer {
    display: flex;
    align-items: center;
    padding: 8px;
    border-top: 1px solid var(--border-color);
    margin-top: 8px;

    .sidebar__nav-item {
      flex: 1;
    }
  }

  &__theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  }
}

.main-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;

  &__drag-bar {
    height: 28px;
    flex-shrink: 0;
    -webkit-app-region: drag;
  }

  &__body {
    flex: 1;
    overflow: auto;
  }
}
</style>
