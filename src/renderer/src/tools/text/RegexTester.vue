<template>
  <h-single-layout>
    <div class="regex-tester">
      <div class="regex-tester__pattern">
        <label class="regex-tester__label">正则表达式</label>
        <div class="regex-tester__pattern-input">
          <span class="regex-tester__slash">/</span>
          <input
            v-model="pattern"
            class="regex-tester__pattern-field"
            placeholder="输入正则表达式..."
            spellcheck="false"
          />
          <span class="regex-tester__slash">/</span>
          <input v-model="flags" class="regex-tester__flags" placeholder="gim" />
        </div>
      </div>

      <div class="regex-tester__field">
        <label class="regex-tester__label">测试文本</label>
        <textarea v-model="testText" class="regex-tester__textarea selectable" spellcheck="false" />
      </div>

      <div class="regex-tester__result">
        <div class="regex-tester__result-header">
          <span>匹配结果</span>
          <span v-if="matches.length" class="regex-tester__count">{{ matches.length }} 个匹配</span>
        </div>
        <div v-if="error" class="regex-tester__error">
          <h-icon icon="mdi:alert-circle" :size="16" />
          {{ error }}
        </div>
        <div v-else class="regex-tester__highlight selectable" v-html="highlightedText"></div>
        <div v-if="matches.length" class="regex-tester__matches">
          <div v-for="(m, i) in matches.slice(0, 50)" :key="i" class="regex-tester__match-item">
            <span class="regex-tester__match-index">{{ i + 1 }}.</span>
            <code>{{ m }}</code>
          </div>
          <div v-if="matches.length > 50" class="regex-tester__more">...还有 {{ matches.length - 50 }} 个</div>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const pattern = ref('\\b\\w+@\\w+\\.\\w+\\b')
const flags = ref('g')
const testText = ref('联系我们: admin@supertools.app 或 support@example.com\n无效: not-an-email')

const error = computed(() => {
  if (!pattern.value) return ''
  try {
    new RegExp(pattern.value, flags.value)
    return ''
  } catch (err) {
    return (err as Error).message
  }
})

const matches = computed<string[]>(() => {
  if (!pattern.value || error.value) return []
  try {
    const regex = new RegExp(pattern.value, flags.value)
    const results = testText.value.match(regex)
    return results || []
  } catch {
    return []
  }
})

const highlightedText = computed(() => {
  if (!pattern.value || error.value) {
    return escapeHtml(testText.value)
  }
  try {
    const regex = new RegExp(pattern.value, flags.value.includes('g') ? flags.value : flags.value + 'g')
    return escapeHtml(testText.value).replace(regex, '<mark class="regex-mark">$&</mark>')
  } catch {
    return escapeHtml(testText.value)
  }
})

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML.replace(/\n/g, '<br>')
}
</script>

<style scoped lang="less">
.regex-tester {
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

  &__pattern-input {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__slash {
    padding: 0 8px;
    color: var(--text-tertiary);
    font-family: monospace;
  }

  &__pattern-field {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px 0;
    background: transparent;
    color: var(--text-primary);
    font-family: 'SF Mono', monospace;
    font-size: 13px;
  }

  &__flags {
    width: 50px;
    border: none;
    border-left: 1px solid var(--border-color);
    outline: none;
    padding: 8px;
    background: var(--bg-code-header);
    color: var(--text-primary);
    font-family: monospace;
    font-size: 13px;
  }

  &__textarea {
    height: 120px;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    resize: vertical;
    outline: none;

    &:focus {
      border-color: var(--color-primary);
    }
  }

  &__result {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  &__result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__count {
    color: var(--color-primary);
    font-weight: normal;
  }

  &__highlight {
    padding: 12px;
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--bg-code);

    :deep(.regex-mark) {
      background: color-mix(in srgb, var(--color-warning) 40%, transparent);
      border-radius: 2px;
      padding: 1px 2px;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    color: var(--color-error);
    font-size: 13px;
  }

  &__matches {
    padding: 8px 12px;
    border-top: 1px solid var(--border-color);
    max-height: 150px;
    overflow-y: auto;
  }

  &__match-item {
    display: flex;
    gap: 8px;
    padding: 2px 0;
    font-size: 12px;
  }

  &__match-index {
    color: var(--text-tertiary);
    min-width: 30px;
  }

  &__more {
    padding: 4px 0;
    font-size: 12px;
    color: var(--text-tertiary);
  }
}
</style>
