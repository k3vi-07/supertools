<template>
  <h-single-layout>
    <div class="bcrypt-hash">
      <h-radio
        v-model="mode"
        :options="[
          { label: '生成哈希', value: 'hash' },
          { label: '验证密码', value: 'verify' }
        ]"
        size="small"
      />

      <!-- 生成哈希模式 -->
      <template v-if="mode === 'hash'">
        <div class="bcrypt-hash__field">
          <label class="bcrypt-hash__label">密码</label>
          <h-input v-model="password" type="password" placeholder="输入密码..." />
        </div>
        <div class="bcrypt-hash__field">
          <label class="bcrypt-hash__label">盐值轮数: {{ rounds }}</label>
          <input type="range" v-model.number="rounds" min="4" max="14" step="1" class="bcrypt-hash__slider" />
        </div>
        <div class="bcrypt-hash__result">
          <div class="bcrypt-hash__result-header">
            <span>BCrypt 哈希</span>
            <button v-if="hashResult" class="bcrypt-hash__copy-btn" @click="copy(hashResult)">
              <h-icon icon="mdi:content-copy" :size="14" /> 复制
            </button>
          </div>
          <code class="bcrypt-hash__hash selectable">{{ hashResult || '点击下方按钮生成...' }}</code>
        </div>
        <h-button type="primary" icon="mdi:lock" @click="generateHash">生成哈希</h-button>
      </template>

      <!-- 验证模式 -->
      <template v-else>
        <div class="bcrypt-hash__field">
          <label class="bcrypt-hash__label">密码</label>
          <h-input v-model="password" type="password" placeholder="输入密码..." />
        </div>
        <div class="bcrypt-hash__field">
          <label class="bcrypt-hash__label">BCrypt 哈希</label>
          <h-input v-model="hashToVerify" placeholder="$2a$10$..." />
        </div>
        <h-button type="primary" icon="mdi:check" @click="verifyPassword">验证</h-button>
        <div v-if="verifyResult !== null" class="bcrypt-hash__verify-result" :class="verifyResult ? 'valid' : 'invalid'">
          <h-icon :icon="verifyResult ? 'mdi:check-circle' : 'mdi:close-circle'" :size="24" />
          <span>{{ verifyResult ? '密码匹配 ✓' : '密码不匹配 ✗' }}</span>
        </div>
      </template>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import bcrypt from 'bcryptjs'

const mode = ref<'hash' | 'verify'>('hash')
const password = ref('mypassword123')
const rounds = ref(10)
const hashResult = ref('')
const hashToVerify = ref('')
const verifyResult = ref<boolean | null>(null)

function generateHash(): void {
  if (!password.value) {
    window.$he3?.message.warning('请输入密码')
    return
  }
  try {
    const salt = bcrypt.genSaltSync(rounds.value)
    hashResult.value = bcrypt.hashSync(password.value, salt)
  } catch (err) {
    window.$he3?.message.error(`生成失败: ${(err as Error).message}`)
  }
}

function verifyPassword(): void {
  if (!password.value || !hashToVerify.value) {
    window.$he3?.message.warning('请输入密码和哈希')
    return
  }
  try {
    verifyResult.value = bcrypt.compareSync(password.value, hashToVerify.value)
  } catch (err) {
    window.$he3?.message.error(`验证失败: ${(err as Error).message}`)
    verifyResult.value = false
  }
}

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.bcrypt-hash {
  display: flex;
  flex-direction: column;
  gap: 16px;

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

  &__verify-result {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: var(--radius-md);
    font-size: 14px;

    &.valid {
      background: color-mix(in srgb, var(--color-success) 10%, transparent);
      color: var(--color-success);
    }

    &.invalid {
      background: color-mix(in srgb, var(--color-error) 10%, transparent);
      color: var(--color-error);
    }
  }
}
</style>
