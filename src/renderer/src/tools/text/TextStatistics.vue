<template>
  <h-single-layout>
    <div class="text-statistics">
      <h-multiline-input v-model="text" title="输入文本" placeholder="在此输入或粘贴文本..." />
      <div class="text-statistics__grid">
        <div v-for="stat in stats" :key="stat.label" class="text-statistics__card">
          <div class="text-statistics__value">{{ stat.value }}</div>
          <div class="text-statistics__label">{{ stat.label }}</div>
        </div>
      </div>
      <div class="text-statistics__reading">
        <h-icon icon="mdi:clock-outline" :size="16" />
        <span>预计阅读时间: {{ readingTime }} 分钟</span>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const text = ref('SuperTools 是一款专为开发者打造的工具箱应用。它集成了编码解码、JSON 处理、加密哈希、文本处理等多种实用工具，帮助开发者提高工作效率。')

const stats = computed(() => {
  const t = text.value
  const charCount = t.length
  const charNoSpace = t.replace(/\s/g, '').length
  const wordCount = t.trim() ? t.trim().split(/\s+/).length : 0
  const lineCount = t ? t.split('\n').length : 0
  const sentenceCount = t.split(/[。.!?！？\n]+/).filter((s) => s.trim()).length
  const paragraphCount = t.split(/\n\s*\n/).filter((s) => s.trim()).length

  return [
    { label: '字符数', value: charCount },
    { label: '字符(不含空格)', value: charNoSpace },
    { label: '单词数', value: wordCount },
    { label: '行数', value: lineCount },
    { label: '句子数', value: sentenceCount },
    { label: '段落数', value: paragraphCount }
  ]
})

const readingTime = computed(() => {
  const words = text.value.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
})
</script>

<style scoped lang="less">
.text-statistics {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-primary);
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__reading {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-size: 13px;
    color: var(--text-secondary);
  }
}
</style>
