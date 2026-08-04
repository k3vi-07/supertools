<template>
  <h-single-layout>
    <div class="password-generator">
      <div class="password-generator__preview">
        <code class="password-generator__password selectable">{{ password }}</code>
        <div class="password-generator__actions">
          <button class="password-generator__btn" @click="generate">
            <h-icon icon="mdi:refresh" :size="16" /> 重新生成
          </button>
          <button class="password-generator__btn" @click="copy">
            <h-icon icon="mdi:content-copy" :size="16" /> 复制
          </button>
        </div>
      </div>

      <div class="password-generator__strength">
        <span class="password-generator__strength-label">强度:</span>
        <div class="password-generator__strength-bar">
          <div
            class="password-generator__strength-fill"
            :style="{ width: strength.percent + '%', background: strength.color }"
          />
        </div>
        <span class="password-generator__strength-text" :style="{ color: strength.color }">
          {{ strength.label }}
        </span>
      </div>

      <div class="password-generator__field">
        <label class="password-generator__label">长度: {{ length }}</label>
        <input type="range" v-model.number="length" min="4" max="64" step="1" class="password-generator__slider" @input="generate" />
      </div>

      <div class="password-generator__options">
        <h-checkbox v-model="useUpper" label="大写字母 (A-Z)" @update:model-value="generate" />
        <h-checkbox v-model="useLower" label="小写字母 (a-z)" @update:model-value="generate" />
        <h-checkbox v-model="useNumbers" label="数字 (0-9)" @update:model-value="generate" />
        <h-checkbox v-model="useSymbols" label="特殊符号 (!@#$)" @update:model-value="generate" />
      </div>

      <div class="password-generator__field">
        <label class="password-generator__label">排除字符</label>
        <h-input v-model="excludeChars" placeholder="例如: O0Il1" @update:model-value="generate" />
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const length = ref(16)
const useUpper = ref(true)
const useLower = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(false)
const excludeChars = ref('')
const password = ref('')

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function generate(): void {
  let chars = ''
  if (useUpper.value) chars += UPPER
  if (useLower.value) chars += LOWER
  if (useNumbers.value) chars += NUMBERS
  if (useSymbols.value) chars += SYMBOLS

  // 排除字符
  if (excludeChars.value) {
    chars = chars.split('').filter((c) => !excludeChars.value.includes(c)).join('')
  }

  if (!chars) {
    password.value = ''
    return
  }

  // 使用 crypto.getRandomValues 生成安全随机数
  const randomValues = new Uint32Array(length.value)
  crypto.getRandomValues(randomValues)

  let result = ''
  for (let i = 0; i < length.value; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  password.value = result
}

const strength = computed(() => {
  const pwd = password.value
  if (!pwd) return { percent: 0, label: '无', color: '#999' }

  let score = 0
  if (pwd.length >= 8) score += 25
  if (pwd.length >= 16) score += 25
  if (pwd.length >= 32) score += 10
  if (/[A-Z]/.test(pwd)) score += 10
  if (/[a-z]/.test(pwd)) score += 10
  if (/[0-9]/.test(pwd)) score += 10
  if (/[^A-Za-z0-9]/.test(pwd)) score += 10

  score = Math.min(score, 100)

  if (score < 40) return { percent: score, label: '弱', color: '#ef4444' }
  if (score < 60) return { percent: score, label: '中', color: '#f59e0b' }
  if (score < 80) return { percent: score, label: '强', color: '#22c55e' }
  return { percent: score, label: '非常强', color: '#16a34a' }
})

function copy(): void {
  if (!password.value) return
  window.$he3?.copyText(password.value)
  window.$he3?.message.success('密码已复制')
}

onMounted(() => {
  generate()
})
</script>

<style scoped lang="less">
.password-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  &__password {
    flex: 1;
    font-family: 'SF Mono', monospace;
    font-size: 16px;
    color: var(--color-primary);
    word-break: break-all;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }

  &__strength {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__strength-label {
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 40px;
  }

  &__strength-bar {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--bg-active);
    overflow: hidden;
  }

  &__strength-fill {
    height: 100%;
    border-radius: 3px;
    transition: all var(--transition-base);
  }

  &__strength-text {
    font-size: 12px;
    font-weight: 600;
    min-width: 50px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__slider {
    width: 100%;
    accent-color: var(--color-primary);
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }
}
</style>
