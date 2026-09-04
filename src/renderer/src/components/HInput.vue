<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :readonly="readonly"
    class="h-input"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    type?: string
    placeholder?: string
    readonly?: boolean
  }>(),
  {
    type: 'text',
    placeholder: '',
    readonly: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="less">
.h-input {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color var(--transition-fast);
  user-select: text;

  &:focus-visible {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 28%, transparent);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
}
</style>
