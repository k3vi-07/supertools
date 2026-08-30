<template>
  <h-single-layout>
    <div class="text-dedup">
      <div class="text-dedup__options">
        <h-checkbox v-model="trimWhitespace" label="去除行首尾空格" />
        <h-checkbox v-model="ignoreEmpty" label="忽略空行" />
        <h-checkbox v-model="caseSensitive" label="区分大小写" />
      </div>
      <h-text-transform :sample-data="sample" :transform="dedupFn" :refresh-key="[trimWhitespace, ignoreEmpty, caseSensitive]" />
      <div class="text-dedup__stats">
        <span>原始: {{ stats.original }} 行</span>
        <span>去重后: {{ stats.deduped }} 行</span>
        <span>删除: {{ stats.removed }} 行</span>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const trimWhitespace = ref(true)
const ignoreEmpty = ref(true)
const caseSensitive = ref(true)
const sample = 'apple\nbanana\napple\ncherry\nbanana\nApple\ndate'

const stats = reactive({ original: 0, deduped: 0, removed: 0 })

function dedupFn(input: string): string {
  let lines = input.split('\n')
  stats.original = lines.length

  if (trimWhitespace.value) {
    lines = lines.map((l) => l.trim())
  }
  if (ignoreEmpty.value) {
    lines = lines.filter((l) => l.trim() !== '')
  }

  const seen = new Set<string>()
  const result: string[] = []
  for (const line of lines) {
    const key = caseSensitive.value ? line : line.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(line)
    }
  }
  stats.deduped = result.length
  stats.removed = stats.original - result.length
  return result.join('\n')
}
</script>

<style scoped lang="less">
.text-dedup {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__stats {
    display: flex;
    gap: 20px;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-size: 12px;
    color: var(--text-secondary);
  }
}
</style>
