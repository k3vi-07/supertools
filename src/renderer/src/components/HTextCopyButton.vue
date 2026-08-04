<template>
  <h-button type="default" :icon="copied ? 'mdi:check' : 'mdi:content-copy'" @click="handleCopy">
    {{ copied ? successMessage : '复制' }}
  </h-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    content: string
    successMessage?: string
  }>(),
  {
    successMessage: '已复制'
  }
)

const copied = ref(false)

async function handleCopy(): Promise<void> {
  await window.$he3?.copyText(props.content)
  copied.value = true
  window.$he3?.message.success(props.successMessage)
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
