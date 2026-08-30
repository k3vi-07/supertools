<template>
  <h-single-layout>
    <div class="number-base">
      <div class="number-base__grid">
        <div v-for="base in bases" :key="base.value" class="number-base__item">
          <label class="number-base__label">{{ base.label }}</label>
          <div class="number-base__input-row">
            <span class="number-base__prefix">{{ base.prefix }}</span>
            <input
              v-model="values[base.value]"
              class="number-base__input"
              :spellcheck="false"
              @input="(e) => convert(base.value, (e.target as HTMLInputElement).value)"
            />
            <button class="number-base__copy" @click="copy(values[base.value])">
              <h-icon icon="mdi:content-copy" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="number-base__error">
        <h-icon icon="mdi:alert-circle" :size="16" />
        {{ error }}
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { parseIntegerStrict } from '../../utils/encodingTransforms'

const bases = [
  { value: 2, label: '二进制 (Binary)', prefix: '0b' },
  { value: 8, label: '八进制 (Octal)', prefix: '0o' },
  { value: 10, label: '十进制 (Decimal)', prefix: '' },
  { value: 16, label: '十六进制 (Hex)', prefix: '0x' }
]

const values = reactive<Record<number, string>>({
  2: '0',
  8: '0',
  10: '42',
  16: '0'
})
const error = ref('')

function convert(fromBase: number, inputValue: string): void {
  error.value = ''
  const cleaned = inputValue.trim()

  if (!cleaned) {
    for (const b of bases) values[b.value] = ''
    return
  }

  let number: bigint
  try {
    number = parseIntegerStrict(cleaned, fromBase)
  } catch (err) {
    error.value = (err as Error).message
    return
  }

  for (const b of bases) {
    if (b.value !== fromBase) {
      values[b.value] = number.toString(b.value).toUpperCase()
    }
  }
}

// 初始化
convert(10, '42')

function copy(text: string): void {
  if (!text) return
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.number-base {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__input-row {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__prefix {
    padding: 8px 12px;
    background: var(--bg-code-header);
    color: var(--text-tertiary);
    font-family: monospace;
    font-size: 13px;
    min-width: 32px;
    text-align: center;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px 12px;
    background: transparent;
    color: var(--text-primary);
    font-family: 'SF Mono', monospace;
    font-size: 14px;
  }

  &__copy {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 100%;
    border: none;
    border-left: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;

    &:hover { background: var(--bg-hover); color: var(--text-primary); }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--color-error);
    border-radius: var(--radius-sm);
    color: var(--color-error);
    font-size: 13px;
  }
}
</style>
