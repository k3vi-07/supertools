<template>
  <label class="h-checkbox">
    <input
      type="checkbox"
      :checked="modelValue"
      class="h-checkbox__input"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="h-checkbox__box">
      <h-icon v-if="modelValue" icon="mdi:check" :size="14" color="white" />
    </span>
    <span v-if="label" class="h-checkbox__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped lang="less">
.h-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;

  &__input {
    display: none;
  }

  &__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    background: var(--bg-surface);
    transition: all var(--transition-fast);
  }

  &__input:checked + &__box {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  &__label {
    font-size: 13px;
    color: var(--text-primary);
  }
}
</style>
