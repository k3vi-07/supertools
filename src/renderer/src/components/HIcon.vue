<template>
  <Icon :icon="icon" :width="size" :height="size" :style="{ color }" />
</template>

<script setup lang="ts">
// 使用 offline 模式的 Icon 组件，不会向 api.iconify.design 发网络请求
// 所有 mdi: 图标通过 setupIcons() 在启动时预加载到内存
import { Icon } from '@iconify/vue/offline'

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
