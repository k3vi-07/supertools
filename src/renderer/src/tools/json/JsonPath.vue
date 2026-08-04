<template>
  <h-single-layout>
    <div class="json-path">
      <div class="json-path__input-section">
        <h-multiline-input
          v-model="jsonData"
          title="JSON 数据"
          placeholder='{"users":[{"name":"Alice","age":30}]}'
        />
      </div>
      <div class="json-path__path-section">
        <label class="json-path__label">路径表达式</label>
        <h-input
          v-model="path"
          placeholder="例如: users.0.name 或 users[*].name"
          class="json-path__path-input"
        />
        <div class="json-path__examples">
          <span class="json-path__examples-label">示例：</span>
          <button
            v-for="ex in examples"
            :key="ex"
            class="json-path__example-btn"
            @click="path = ex"
          >{{ ex }}</button>
        </div>
      </div>
      <div class="json-path__output-section">
        <div class="json-path__output-header">
          <span>结果</span>
          <h-text-copy-button v-if="result" :content="result" />
        </div>
        <pre class="json-path__result selectable">{{ result || '输入路径后显示结果...' }}</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const jsonData = ref(JSON.stringify({
  name: 'SuperTools',
  version: '1.0.0',
  tools: [
    { id: 'json-format', name: 'JSON 格式化', category: 'json' },
    { id: 'base64', name: 'Base64', category: 'encode' }
  ],
  meta: {
    author: 'dev',
    count: 2
  }
}, null, 2))

const path = ref('tools.0.name')
const examples = ['name', 'version', 'tools.0.name', 'tools.1.category', 'meta.author', 'tools']

const result = computed(() => {
  if (!jsonData.value || !path.value) return ''
  try {
    const data = JSON.parse(jsonData.value)
    const segments = path.value.split('.')
    let current: unknown = data

    for (const seg of segments) {
      if (current === null || current === undefined) return 'undefined'
      if (Array.isArray(current)) {
        const idx = parseInt(seg, 10)
        if (isNaN(idx)) {
          // 映射数组
          current = current.map((item) => (item as Record<string, unknown>)[seg])
        } else {
          current = current[idx]
        }
      } else if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[seg]
      } else {
        return 'undefined'
      }
    }

    if (typeof current === 'object' && current !== null) {
      return JSON.stringify(current, null, 2)
    }
    return String(current)
  } catch (err) {
    return `❌ ${(err as Error).message}`
  }
})
</script>

<style scoped lang="less">
.json-path {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__path-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__path-input {
    width: 100%;
  }

  &__examples {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__examples-label {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  &__example-btn {
    padding: 2px 8px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 11px;
    font-family: monospace;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
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
    line-height: 1.6;
    color: var(--text-primary);
    max-height: 300px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
