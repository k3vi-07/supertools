<template>
  <h-single-layout>
    <div class="hash-generator">
      <div class="hash-generator__input-section">
        <h-multiline-input
          v-model="input"
          title="输入文本"
          :auto-select="true"
          placeholder="输入要哈希的文本..."
        />
      </div>
      <div class="hash-generator__results">
        <div v-for="algo in algorithms" :key="algo.name" class="hash-generator__result-item">
          <div class="hash-generator__result-header">
            <span class="hash-generator__algo-name">{{ algo.name }}</span>
            <button
              v-if="results[algo.name]"
              class="hash-generator__copy-btn"
              @click="copy(results[algo.name])"
            >
              <h-icon icon="mdi:content-copy" :size="14" />
            </button>
          </div>
          <code class="hash-generator__hash selectable">{{ results[algo.name] || '—' }}</code>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'

const input = ref('Hello SuperTools!')

const algorithms = [
  { name: 'MD5', fn: (s: string) => CryptoJS.MD5(s).toString() },
  { name: 'SHA-1', fn: (s: string) => CryptoJS.SHA1(s).toString() },
  { name: 'SHA-224', fn: (s: string) => CryptoJS.SHA224(s).toString() },
  { name: 'SHA-256', fn: (s: string) => CryptoJS.SHA256(s).toString() },
  { name: 'SHA-384', fn: (s: string) => CryptoJS.SHA384(s).toString() },
  { name: 'SHA-512', fn: (s: string) => CryptoJS.SHA512(s).toString() },
  { name: 'SHA-3', fn: (s: string) => CryptoJS.SHA3(s).toString() },
  { name: 'RIPEMD-160', fn: (s: string) => CryptoJS.RIPEMD160(s).toString() }
]

const results = computed(() => {
  const map: Record<string, string> = {}
  if (!input.value) return map
  for (const algo of algorithms) {
    try {
      map[algo.name] = algo.fn(input.value)
    } catch {
      map[algo.name] = 'Error'
    }
  }
  return map
})

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.hash-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__results {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__result-item {
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
  }

  &__algo-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  }

  &__hash {
    display: block;
    padding: 8px 12px;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--bg-code);
    word-break: break-all;
  }
}
</style>
