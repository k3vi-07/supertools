<template>
  <div class="tool-view">
    <!-- 工具头部 -->
    <div class="tool-view__header">
      <button type="button" class="tool-view__back" :aria-label="t('tool.back')" @click="router.back()">
        <h-icon icon="mdi:arrow-left" :size="18" aria-hidden="true" />
      </button>
      <div class="tool-view__icon">
        <h-icon :icon="tool?.icon || 'mdi:tools'" :size="22" />
      </div>
      <div class="tool-view__info">
        <h1 class="tool-view__title">{{ tool?.nameZh }}</h1>
        <p class="tool-view__desc">{{ tool?.description }}</p>
      </div>
      <button
        type="button"
        class="tool-view__fav-btn"
        :class="{ active: isFav }"
        :aria-label="isFav ? t('tool.removeFavorite') : t('tool.addFavorite')"
        :aria-pressed="isFav"
        @click="toggleFav"
      >
        <h-icon :icon="isFav ? 'mdi:star' : 'mdi:star-outline'" :size="18" />
      </button>
    </div>

    <div v-if="securityNotice" class="tool-view__security" :class="`tool-view__security--${securityNotice.level}`" role="note">
      <h-icon :icon="securityNotice.level === 'danger' ? 'mdi:alert-octagon-outline' : 'mdi:information-outline'" :size="18" aria-hidden="true" />
      <div>
        <strong>{{ securityNotice.title }}</strong>
        <span>{{ securityNotice.message }}</span>
      </div>
    </div>

    <!-- 工具内容 -->
    <div class="tool-view__content">
      <div v-if="loadError" class="tool-view__error">
        <h-icon :icon="errorIcon" :size="32" color="var(--color-error)" />
        <span class="tool-view__error-title">{{ errorTitle }}</span>
        <span class="tool-view__error-msg">{{ loadError.message }}</span>
        <div class="tool-view__error-actions">
          <button class="tool-view__retry" @click="retry">{{ t('tool.retry') }}</button>
        </div>
      </div>
      <div v-else-if="!toolComponent" class="tool-view__loading">
        <h-icon icon="mdi:loading" :size="32" color="var(--color-primary)" />
        <span>{{ t('tool.loading') }}</span>
      </div>
      <component v-else :is="toolComponent" :key="toolId" />
    </div>

    <!-- 相关工具 -->
    <div v-if="relatedTools.length > 0" class="tool-view__related">
      <h3 class="tool-view__related-title">
        <h-icon icon="mdi:link-variant" :size="16" />
        {{ t('tool.relatedTools') }}
      </h3>
      <div class="tool-view__related-list">
        <button
          v-for="rt in relatedTools"
          :key="rt.id"
          class="tool-view__related-item"
          @click="openTool(rt.id)"
        >
          <h-icon :icon="rt.icon" :size="16" />
          <span>{{ rt.nameZh }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, defineComponent, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToolsStore } from '../stores/tools'
import { useHistoryStore } from '../stores/history'
import { useFavoritesStore } from '../stores/favorites'
import { useRemoteToolsStore } from '../stores/remoteTools'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toolsStore = useToolsStore()
const historyStore = useHistoryStore()
const favoritesStore = useFavoritesStore()
const remoteToolsStore = useRemoteToolsStore()

const toolId = computed(() => route.params.id as string)

const tool = computed(() => toolsStore.getToolById(toolId.value))
const legacyAlgorithms = new Set([
  'des-encryption', 'rc4-encryption', 'tea-encryption', 'xtea-encryption',
  'blowfish-encryption', 'idea-encryption', 'rabbit-cipher', 'classical-cipher',
  'playfair-cipher', 'text-encryptor'
])
const nonCryptographicHashes = new Set(['city-hash', 'fnv-hash', 'murmur-hash'])
const unauthenticatedCiphers = new Set([
  'aes-cbc-encryption', 'aes-ctr-encryption', 'camellia-encryption',
  'chacha20-encryption', 'salsa20-encryption', 'sm4-encryption', 'twofish-encryption'
])
const securityNotice = computed(() => {
  if (legacyAlgorithms.has(toolId.value)) return {
    level: 'danger', title: '仅用于兼容与学习',
    message: '该算法不适合保护新数据。不要用于密码存储、令牌或生产系统的新加密方案。'
  }
  if (nonCryptographicHashes.has(toolId.value)) return {
    level: 'warning', title: '非加密哈希',
    message: '适合哈希表、分片或校验场景，不能用于密码存储、签名或防篡改。'
  }
  if (unauthenticatedCiphers.has(toolId.value)) return {
    level: 'warning', title: '不提供完整性保护',
    message: '此工具只执行基础算法或模式。生产场景应优先使用带认证的 AEAD（如 AES-GCM）并妥善管理随机数。'
  }
  return null
})
const isIsolatedRemote = computed(() => route.query.isolated === '1' && remoteToolsStore.isInstalled(toolId.value))

// 手动管理异步组件加载，避免 defineAsyncComponent 的 __esModule 歧义
const loadedComponent = shallowRef<ReturnType<typeof defineComponent> | null>(null)
const loadError = ref<{ type: string; message: string } | null>(null)

/** 根据错误信息推断错误类型 */
function classifyError(err: unknown): { type: string; message: string } {
  const msg = (err as Error)?.message || String(err)
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ERR_')) {
    return { type: 'network', message: t('tool.networkMessage') }
  }
  if (msg.includes('404') || msg.includes('Not Found') || msg.includes('所有版本均加载失败')) {
    return { type: 'not-found', message: t('tool.notFoundMessage') }
  }
  if (msg.includes('不支持 import') || msg.includes('编译') || msg.includes('SyntaxError') || msg.includes('Unexpected')) {
    return { type: 'compile', message: '工具代码编译失败: ' + msg.substring(0, 150) }
  }
  return { type: 'unknown', message: msg.substring(0, 200) }
}

const errorIcon = computed(() => {
  switch (loadError.value?.type) {
    case 'network': return 'mdi:wifi-off'
    case 'not-found': return 'mdi:file-question'
    case 'compile': return 'mdi:bug'
    default: return 'mdi:alert-circle-outline'
  }
})

const errorTitle = computed(() => {
  switch (loadError.value?.type) {
    case 'network': return t('tool.networkError')
    case 'not-found': return t('tool.notFound')
    case 'compile': return t('tool.compileError')
    default: return t('tool.loadFailed')
  }
})

async function loadTool(): Promise<void> {
  loadedComponent.value = null
  loadError.value = null
  if (remoteToolsStore.isInstalled(toolId.value) && !isIsolatedRemote.value) {
    window.supertools?.openRemoteTool(toolId.value)
    return
  }
  if (tool.value?.component) {
    try {
      const result = await tool.value.component()
      const comp = (result as { default?: unknown }).default || result
      loadedComponent.value = comp as ReturnType<typeof defineComponent>
    } catch (err) {
      console.error('[ToolView] 组件加载失败:', err)
      loadError.value = classifyError(err)
    }
  }
}

watch(toolId, () => { loadTool() }, { immediate: true })

/** 重试加载 */
function retry(): void {
  loadTool()
}

const toolComponent = computed(() => loadedComponent.value)

const isFav = computed(() => favoritesStore.isFavorite(toolId.value))

const relatedTools = computed(() => toolsStore.getRelatedTools(toolId.value))

function toggleFav(): void {
  favoritesStore.toggleFavorite(toolId.value)
}

function openTool(id: string): void {
  historyStore.recordUse(id)
  router.push(`/tool/${id}`)
}
</script>

<style scoped lang="less">
.tool-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.tool-view__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
}

.tool-view__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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

.tool-view__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-base);
  color: var(--color-primary);
}

.tool-view__info {
  flex: 1;
}

.tool-view__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.tool-view__desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.tool-view__fav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
    color: #f59e0b;
  }

  &.active {
    color: #f59e0b;
  }
}

.tool-view__content {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}

.tool-view__security {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 12px 24px 0;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 46%, var(--border-color));
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--color-warning) 9%, var(--bg-surface));

  > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  strong { font-size: 12px; }
  span { color: var(--text-secondary); font-size: 12px; line-height: 1.5; }

  &--danger {
    border-color: color-mix(in srgb, var(--color-error) 46%, var(--border-color));
    background: color-mix(in srgb, var(--color-error) 8%, var(--bg-surface));
  }
}

@media (max-width: 720px) {
  .tool-view__header { padding: 12px 16px; }
  .tool-view__back, .tool-view__fav-btn { width: 44px; height: 44px; flex: 0 0 44px; }
  .tool-view__security { margin: 10px 16px 0; }
  .tool-view__content { padding: 12px 16px; }
}

.tool-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-tertiary);

  :deep(.iconify) {
    animation: spin 1s linear infinite;
  }
}

.tool-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px;
  text-align: center;

  :deep(.iconify) {
    margin-bottom: 4px;
  }
}

.tool-view__error-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-error);
}

.tool-view__error-msg {
  font-size: 13px;
  color: var(--text-tertiary);
  max-width: 400px;
  word-break: break-word;
  line-height: 1.5;
}

.tool-view__error-actions {
  margin-top: 8px;
}

.tool-view__retry {
  padding: 6px 20px;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;

  &:hover {
    background: var(--color-primary);
    color: white;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tool-view__related {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface);
}

.tool-view__related-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.tool-view__related-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tool-view__related-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}
</style>
