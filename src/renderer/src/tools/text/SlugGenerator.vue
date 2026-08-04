<template>
  <h-single-layout>
    <div class="slug-generator">
      <div class="slug-generator__field">
        <label class="slug-generator__label">输入文本</label>
        <h-input v-model="input" placeholder="输入要转换的文本..." />
      </div>
      <div class="slug-generator__options">
        <label class="slug-generator__label">分隔符</label>
        <h-select
          v-model="separator"
          :options="[
            { label: '- (连字符)', value: '-' },
            { label: '_ (下划线)', value: '_' },
            { label: '. (点)', value: '.' }
          ]"
        />
        <h-checkbox v-model="lowerCase" label="小写" />
      </div>
      <div class="slug-generator__result">
        <div class="slug-generator__result-header">
          <span>Slug 结果</span>
          <h-text-copy-button v-if="result" :content="result" />
        </div>
        <code class="slug-generator__slug selectable">{{ result || '—' }}</code>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const input = ref('Hello World! This is a Test Title 你好')
const separator = ref<'-' | '_' | '.'>('-')
const lowerCase = ref(true)

const result = computed(() => {
  let slug = input.value
    // 替换中文为拼音近似（简单处理：移除）
    .replace(/[\u4e00-\u9fa5]+/g, '')
    // 替换特殊字符
    .replace(/[^\w\s-]/g, '')
    // 将空格替换为分隔符
    .replace(/[\s_-]+/g, separator.value)
    .trim()

  if (lowerCase.value) slug = slug.toLowerCase()
  return slug
})
</script>

<style scoped lang="less">
.slug-generator {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__result {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__slug {
    display: block;
    padding: 12px;
    font-family: 'SF Mono', monospace;
    font-size: 14px;
    color: var(--color-primary);
    background: var(--bg-code);
    word-break: break-all;
  }
}
</style>
