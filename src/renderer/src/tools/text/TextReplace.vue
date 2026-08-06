<template>
  <h-single-layout>
    <div class="text-replace">
      <div class="text-replace__fields">
        <div class="text-replace__field">
          <label>查找</label>
          <h-input v-model="find" placeholder="输入要查找的内容..." />
        </div>
        <div class="text-replace__field">
          <label>替换为</label>
          <h-input v-model="replace" placeholder="输入替换内容..." />
        </div>
      </div>
      <div class="text-replace__options">
        <h-checkbox v-model="useRegex" label="正则匹配" />
        <h-checkbox v-model="caseSensitive" label="区分大小写" />
        <h-checkbox v-model="replaceAll" label="替换全部" />
      </div>
      <h-text-transform sample-data="Hello World! Hello SuperTools!" :transform="replaceFn" />
      <div v-if="replaceCount !== null" class="text-replace__count">
        替换了 {{ replaceCount }} 处
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const find = ref('Hello')
const replace = ref('Hi')
const useRegex = ref(false)
const caseSensitive = ref(true)
const replaceAll = ref(true)
const replaceCount = ref<number | null>(null)

function replaceFn(input: string): string {
  if (!find.value) return input
  replaceCount.value = 0
  try {
    let flags = caseSensitive.value ? 'g' : 'gi'
    if (!replaceAll.value) flags = flags.replace('g', '')
    const pattern = useRegex.value ? find.value : find.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(pattern, flags)
    return input.replace(regex, () => {
      replaceCount.value = (replaceCount.value ?? 0) + 1
      return replace.value
    })
  } catch (err) {
    return `❌ 正则错误: ${(err as Error).message}`
  }
}
</script>

<style scoped lang="less">
.text-replace {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__fields {
    display: flex;
    gap: 12px;
  }

  &__field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  &__options {
    display: flex;
    gap: 16px;
  }

  &__count {
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    background: var(--bg-code-header);
    font-size: 12px;
    color: var(--color-primary);
  }
}
</style>
