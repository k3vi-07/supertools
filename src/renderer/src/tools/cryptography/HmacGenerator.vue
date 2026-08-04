<template>
  <h-single-layout>
    <div class="hmac-generator">
      <div class="hmac-generator__options">
        <label class="hmac-generator__label">算法</label>
        <h-select
          v-model="algorithm"
          :options="[
            { label: 'HMAC-MD5', value: 'MD5' },
            { label: 'HMAC-SHA1', value: 'SHA1' },
            { label: 'HMAC-SHA256', value: 'SHA256' },
            { label: 'HMAC-SHA512', value: 'SHA512' }
          ]"
        />
      </div>
      <div class="hmac-generator__field">
        <label class="hmac-generator__label">密钥 (Key)</label>
        <h-input v-model="key" placeholder="输入密钥..." />
      </div>
      <div class="hmac-generator__field">
        <label class="hmac-generator__label">消息 (Message)</label>
        <h-input v-model="message" placeholder="输入消息..." />
      </div>
      <div class="hmac-generator__result">
        <div class="hmac-generator__result-header">
          <span>HMAC 结果</span>
          <button v-if="result" class="hmac-generator__copy-btn" @click="copy(result)">
            <h-icon icon="mdi:content-copy" :size="14" /> 复制
          </button>
        </div>
        <code class="hmac-generator__hash selectable">{{ result || '—' }}</code>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CryptoJS from 'crypto-js'

const algorithm = ref<'MD5' | 'SHA1' | 'SHA256' | 'SHA512'>('SHA256')
const key = ref('my-secret-key')
const message = ref('Hello SuperTools!')

const result = computed(() => {
  if (!key.value || !message.value) return ''
  try {
    return CryptoJS.Hmac[algorithm.value](message.value, key.value).toString()
  } catch {
    return 'Error'
  }
})

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.hmac-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__options {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  &__copy-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;

    &:hover {
      background: var(--bg-hover);
    }
  }

  &__hash {
    display: block;
    padding: 10px 12px;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    color: var(--text-primary);
    background: var(--bg-code);
    word-break: break-all;
  }
}
</style>
