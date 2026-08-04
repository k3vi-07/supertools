<template>
  <button
    class="h-switch"
    :class="{ active: modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="h-switch__thumb" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped lang="less">
.h-switch {
  position: relative;
  width: 40px;
  height: 22px;
  border: none;
  border-radius: 11px;
  background: var(--bg-active);
  cursor: pointer;
  transition: background var(--transition-fast);

  &.active {
    background: var(--color-primary);
  }

  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    transition: transform var(--transition-fast);
  }

  &.active &__thumb {
    transform: translateX(18px);
  }
}
</style>
