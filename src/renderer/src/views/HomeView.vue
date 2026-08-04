<template>
  <div class="home-view">
    <!-- 剪贴板推荐条 -->
    <div v-if="clipboardStore.recommendedToolIds.length > 0" class="clipboard-banner">
      <h-icon icon="mdi:clipboard-check-outline" :size="18" color="var(--color-primary)" />
      <span class="clipboard-banner__text">
        检测到剪贴板内容类型：<strong>{{ detectedLabel }}</strong>，为你推荐：
      </span>
      <div class="clipboard-banner__tools">
        <button
          v-for="toolId in clipboardStore.recommendedToolIds.slice(0, 3)"
          :key="toolId"
          class="clipboard-banner__tool-btn"
          @click="openTool(toolId)"
        >
          {{ getToolName(toolId) }}
        </button>
      </div>
    </div>

    <!-- 最近使用 -->
    <section v-if="recentTools.length > 0" class="home-section">
      <h2 class="home-section__title">
        <h-icon icon="mdi:history" :size="18" />
        {{ t('home.recent') }}
      </h2>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in recentTools"
          :key="tool.id"
          :tool="tool"
          @click="openTool(tool.id)"
        />
      </div>
    </section>

    <!-- 常用工具 -->
    <section v-if="mostUsedTools.length > 0" class="home-section">
      <h2 class="home-section__title">
        <h-icon icon="mdi:fire" :size="18" />
        {{ t('home.mostUsed') }}
      </h2>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in mostUsedTools"
          :key="tool.id"
          :tool="tool"
          @click="openTool(tool.id)"
        />
      </div>
    </section>

    <!-- 收藏 -->
    <section class="home-section">
      <h2 class="home-section__title">
        <h-icon icon="mdi:star-outline" :size="18" />
        {{ t('home.favorites') }}
      </h2>
      <div v-if="favoriteTools.length > 0" class="tool-grid">
        <ToolCard
          v-for="tool in favoriteTools"
          :key="tool.id"
          :tool="tool"
          :is-favorite="true"
          @click="openTool(tool.id)"
        />
      </div>
      <div v-else class="home-empty">
        <h-icon icon="mdi:star-off-outline" :size="48" color="var(--text-tertiary)" />
        <p>{{ t('home.emptyFavorites') }}</p>
      </div>
    </section>

    <!-- 全部工具 -->
    <section class="home-section">
      <h2 class="home-section__title">
        <h-icon icon="mdi:apps" :size="18" />
        {{ t('home.allTools') }}
        <span class="home-section__count">({{ toolsStore.tools.length }})</span>
      </h2>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in toolsStore.tools"
          :key="tool.id"
          :tool="tool"
          @click="openTool(tool.id)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToolsStore } from '../stores/tools'
import { useHistoryStore } from '../stores/history'
import { useFavoritesStore } from '../stores/favorites'
import { useClipboardStore } from '../stores/clipboard'
import { contentTypeLabels } from '../utils/clipboardDetect'
import ToolCard from '../components/ToolCard.vue'
import type { ToolManifest } from '../tools/types'

const router = useRouter()
const { t } = useI18n()
const toolsStore = useToolsStore()
const historyStore = useHistoryStore()
const favoritesStore = useFavoritesStore()
const clipboardStore = useClipboardStore()

const recentTools = computed((): ToolManifest[] => {
  return historyStore.recentToolIds
    .slice(0, 8)
    .map((id) => toolsStore.getToolById(id))
    .filter((t): t is ToolManifest => t !== undefined)
})

const mostUsedTools = computed((): ToolManifest[] => {
  return historyStore.mostUsedToolIds
    .slice(0, 8)
    .map((id) => toolsStore.getToolById(id))
    .filter((t): t is ToolManifest => t !== undefined)
})

const favoriteTools = computed((): ToolManifest[] => {
  return favoritesStore.favoriteList
    .map((id) => toolsStore.getToolById(id))
    .filter((t): t is ToolManifest => t !== undefined)
})

const detectedLabel = computed(() => contentTypeLabels[clipboardStore.detectedType])

function getToolName(id: string): string {
  const tool = toolsStore.getToolById(id)
  return tool ? tool.nameZh : id
}

function openTool(id: string): void {
  historyStore.recordUse(id)
  router.push(`/tool/${id}`)
}

onMounted(() => {
  clipboardStore.detect()
})
</script>

<style scoped lang="less">
.home-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.clipboard-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);

  &__text {
    font-size: 13px;
    color: var(--text-secondary);
  }

  &__tools {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  &__tool-btn {
    padding: 4px 12px;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-primary);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--color-primary);
      color: white;
    }
  }
}

.home-section {
  margin-bottom: 32px;

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  &__count {
    font-size: 13px;
    color: var(--text-tertiary);
    font-weight: normal;
  }
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.home-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
