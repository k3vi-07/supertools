<template>
  <div class="category-view">
    <div class="category-view__header">
      <h1 class="category-view__title">
        <h-icon :icon="categoryInfo?.icon || 'mdi:folder-outline'" :size="24" />
        {{ categoryInfo?.name || category }}
      </h1>
      <span class="category-view__count">{{ tools.length }} 个工具</span>
    </div>
    <div class="tool-grid">
      <ToolCard
        v-for="tool in tools"
        :key="tool.id"
        :tool="tool"
        @click="openTool(tool.id)"
      />
    </div>
    <div v-if="tools.length === 0" class="category-view__empty">
      <h-icon icon="mdi:archive-search-outline" :size="48" color="var(--text-tertiary)" />
      <p>此分类下暂无工具</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToolsStore } from '../stores/tools'
import { useHistoryStore } from '../stores/history'
import { CATEGORIES } from '../tools/types'
import ToolCard from '../components/ToolCard.vue'

const route = useRoute()
const router = useRouter()
const toolsStore = useToolsStore()
const historyStore = useHistoryStore()

const category = computed(() => route.params.category as string)

const categoryInfo = computed(() => {
  return CATEGORIES.find((c) => c.id === category.value)
})

const tools = computed(() => {
  return toolsStore.getToolsByCategory(category.value)
})

function openTool(id: string): void {
  historyStore.recordUse(id)
  router.push(`/tool/${id}`)
}

</script>

<style scoped lang="less">
.category-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

&__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.category-view__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.category-view__count {
  font-size: 13px;
  color: var(--text-tertiary);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.category-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
