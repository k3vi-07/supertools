<template>
  <Icon :icon="icon" :width="size" :height="size" :style="{ color }" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const props = withDefaults(
  defineProps<{
    icon: string
    size?: number | string
    color?: string
  }>(),
  {
    size: 18,
    color: 'currentColor'
  }
)

// 确保 props 被使用（避免 lint 警告）
void props
</script>
