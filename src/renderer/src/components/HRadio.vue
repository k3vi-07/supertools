<template>
  <div class="h-radio-group" :class="`h-radio-group--${size}`">
    <label
      v-for="opt in options"
      :key="String(opt.value)"
      class="h-radio-button"
      :class="{ active: modelValue === opt.value }"
    >
      <input
        type="radio"
        :value="opt.value"
        :checked="modelValue === opt.value"
        class="h-radio-button__input"
        @change="$emit('update:modelValue', opt.value)"
      />
      <span class="h-radio-button__label">{{ opt.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface RadioOption {
  label: string
  value: string | number
}

withDefaults(
  defineProps<{
    modelValue: string | number
    options: RadioOption[]
    size?: 'small' | 'middle' | 'large'
  }>(),
  {
    size: 'middle'
  }
)

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<style scoped lang="less">
.h-radio-group {
  display: inline-flex;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;

  &--small {
    .h-radio-button {
      padding: 2px 10px;
      font-size: 12px;
    }
  }
  &--middle {
    .h-radio-button {
      padding: 4px 14px;
      font-size: 13px;
    }
  }
}

.h-radio-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-right: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  user-select: none;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--color-primary);
    color: white;
  }

  &__input {
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

  &:has(&__input:focus-visible) {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
}
</style>
