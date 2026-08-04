<template>
  <h-single-layout>
    <div class="case-converter">
      <h-multiline-input v-model="input" title="输入文本" :auto-select="true" />
      <div class="case-converter__options">
        <h-button v-for="opt in options" :key="opt.value" size="small" @click="type = opt.value">
          {{ opt.label }}
        </h-button>
      </div>
      <div class="case-converter__output">
        <div class="case-converter__output-header">
          <span>转换结果</span>
          <h-text-copy-button v-if="output" :content="output" />
        </div>
        <pre class="case-converter__result selectable">{{ output }}</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const input = ref('Hello World from SuperTools')
const type = ref<string>('')

const options = [
  { label: '全大写', value: 'upper' },
  { label: '全小写', value: 'lower' },
  { label: '首字母大写', value: 'capitalize' },
  { label: '驼峰', value: 'camel' },
  { label: '帕斯卡', value: 'pascal' },
  { label: '下划线', value: 'snake' },
  { label: '连字符', value: 'kebab' },
  { label: '常量', value: 'constant' }
]

const output = computed(() => {
  const text = input.value
  switch (type.value) {
    case 'upper': return text.toUpperCase()
    case 'lower': return text.toLowerCase()
    case 'capitalize': return text.replace(/\b\w/g, (c) => c.toUpperCase())
    case 'camel': return toCamelCase(text)
    case 'pascal': {
      const c = toCamelCase(text)
      return c.charAt(0).toUpperCase() + c.slice(1)
    }
    case 'snake': return toSnakeCase(text)
    case 'kebab': return toSnakeCase(text).replace(/_/g, '-')
    case 'constant': return toSnakeCase(text).toUpperCase()
    default: return '点击上方按钮选择转换方式...'
  }
})

function toCamelCase(s: string): string {
  return s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toLowerCase())
}
function toSnakeCase(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s\-]+/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}
</script>

<style scoped lang="less">
.case-converter {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__output-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-code-header);
    border: 1px solid var(--border-color);
    border-bottom: none;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  &__result {
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    background: var(--bg-code);
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    color: var(--text-primary);
    min-height: 60px;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
