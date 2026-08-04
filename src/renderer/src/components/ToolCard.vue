<template>
  <div class="tool-card" @click="$emit('click')">
    <div class="tool-card__icon">
      <h-icon :icon="tool.icon" :size="22" />
    </div>
    <div class="tool-card__info">
      <div class="tool-card__name">{{ tool.nameZh }}</div>
      <div class="tool-card__desc">{{ tool.description }}</div>
    </div>
    <div v-if="isFavorite" class="tool-card__star">
      <h-icon icon="mdi:star" :size="14" color="#f59e0b" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolManifest } from '../tools/types'

defineProps<{
  tool: ToolManifest
  isFavorite?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="less">
.tool-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &__icon {
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

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 12px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__star {
    flex-shrink: 0;
  }
}
</style>
