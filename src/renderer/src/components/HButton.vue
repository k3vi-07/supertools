<template>
  <button
    class="h-button"
    :class="[`h-button--${type}`, `h-button--${size}`]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <h-icon v-if="icon" :icon="icon" :size="iconSize" />
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'default' | 'primary' | 'ghost' | 'link' | 'dashed'
    size?: 'small' | 'middle' | 'large'
    icon?: string
    disabled?: boolean
  }>(),
  {
    type: 'default',
    size: 'middle',
    icon: '',
    disabled: false
  }
)

defineEmits<{
  click: []
}>()

const iconSize = 14
</script>

<style scoped lang="less">
.h-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;

  &--small {
    padding: 2px 8px;
    font-size: 12px;
  }
  &--middle {
    padding: 6px 14px;
    font-size: 13px;
  }
  &--large {
    padding: 8px 18px;
    font-size: 14px;
  }

  &--primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;

    &:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary-light);
    }
  }

  &--ghost {
    background: transparent;
    border-color: transparent;

    &:hover {
      background: var(--bg-hover);
    }
  }

  &--link {
    background: transparent;
    border-color: transparent;
    color: var(--color-primary);

    &:hover {
      color: var(--color-primary-light);
    }
  }

  &--dashed {
    border-style: dashed;
    background: transparent;
  }

  &:hover:not(:disabled) {
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
