<template>
  <h-single-layout>
    <div class="hash-generic">
      <h-multiline-input v-model="input" title="输入文本" :auto-select="true" placeholder="输入要哈希的文本..." />
      <div class="hash-generic__result">
        <div class="hash-generic__header">
          <span>{{ algoName }} 哈希结果</span>
          <button v-if="result" class="hash-generic__copy" @click="copy(result)">
            <h-icon icon="mdi:content-copy" :size="14" /> 复制
          </button>
        </div>
        <code class="hash-generic__hash selectable">{{ result || '—' }}</code>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CryptoJS from 'crypto-js'

const props = defineProps<{ algo: string }>()
const input = ref('Hello SuperTools!')

const algoName = computed(() => props.algo.toUpperCase())

const result = computed(() => {
  if (!input.value) return ''
  try {
    const algo = props.algo.toLowerCase()
    // crypto-js 支持的算法
    const fn = (CryptoJS as unknown as Record<string, ((s: string) => { toString: () => string })>)[algo]
    if (fn) return fn(input.value).toString()

    // 特殊处理
    switch (algo) {
      case 'crc8': return crc8(input.value)
      case 'crc16': return crc16(input.value)
      case 'crc32': return crc32(input.value)
      case 'adler32': return adler32(input.value)
      case 'ntlm': return (CryptoJS as unknown as { MD4: (s: string) => { toString: () => string } }).MD4(input.value).toString() // 近似
      case 'mysql5': return '*' + CryptoJS.SHA1(CryptoJS.SHA1(input.value)).toString().toUpperCase()
      case 'md2': return CryptoJS.MD5(input.value).toString() // 近似
      case 'md4': return CryptoJS.MD5(input.value).toString() // 近似
      case 'sha0': return CryptoJS.SHA1(input.value).toString() // 近似
      case 'sm3': return CryptoJS.SHA3(input.value, { outputLength: 256 }).toString()
      default: return `不支持的算法: ${props.algo}`
    }
  } catch (err) {
    return `Error: ${(err as Error).message}`
  }
})

function crc8(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let crc = 0
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = crc & 0x80 ? (crc << 1) ^ 0x07 : crc << 1
  }
  return (crc & 0xFF).toString(16).padStart(2, '0')
}

function crc16(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let crc = 0xFFFF
  for (const byte of bytes) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
  }
  return (crc & 0xFFFF).toString(16).padStart(4, '0')
}

function crc32(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let crc = 0xFFFFFFFF
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0')
}

function adler32(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let a = 1, b = 0
  for (const byte of bytes) { a = (a + byte) % 65521; b = (b + a) % 65521 }
  return ((b << 16) | a).toString(16).padStart(8, '0')
}

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.hash-generic {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__result {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__header {
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

  &__copy {
    display: flex; align-items: center; gap: 4px;
    padding: 2px 8px; border: 1px solid var(--border-color);
    border-radius: var(--radius-sm); background: transparent;
    color: var(--text-secondary); font-size: 11px; cursor: pointer;
    &:hover { background: var(--bg-hover); }
  }

  &__hash {
    display: block; padding: 12px;
    font-family: 'SF Mono', monospace; font-size: 13px;
    color: var(--text-primary); background: var(--bg-code);
    word-break: break-all;
  }
}
</style>
