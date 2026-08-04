<template>
  <select
    :value="modelValue"
    class="h-select"
    @change="handleChange"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
interface SelectOption {
  label: string
  value: string | number
}

defineProps<{
  modelValue: string | number
  options: SelectOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function handleChange(e: Event): void {
  const value = (e.target as HTMLSelectElement).value
  emit('update:modelValue', isNaN(Number(value)) ? value : Number(value))
}
</script>

<style scoped lang="less">
.h-select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);

  &:focus {
    border-color: var(--color-primary);
  }
}
</style>
