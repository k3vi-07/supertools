<template>
  <div class="h-card-box">
    <div v-if="text || $slots.header" class="h-card-box__header">
      <slot name="header">
        <h-icon v-if="icon" :icon="icon" :size="16" />
        <span class="h-card-box__title">{{ text }}</span>
      </slot>
    </div>
    <div class="h-card-box__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
  icon?: string
}>()
</script>

<style scoped lang="less">
.h-card-box {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-code-header);
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__body {
    padding: 16px;
  }
}
</style>
