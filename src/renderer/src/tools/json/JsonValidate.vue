<template>
  <h-single-layout>
    <div class="json-validate">
      <h-multiline-input
        v-model="input"
        title="JSON 输入"
        :auto-select="true"
        placeholder="在此粘贴 JSON..."
      />
      <div class="json-validate__result" :class="{ valid: isValid, invalid: !isValid && input }">
        <h-icon
          :icon="isValid ? 'mdi:check-circle' : 'mdi:alert-circle'"
          :size="24"
          :color="isValid ? 'var(--color-success)' : 'var(--color-error)'"
        />
        <div class="json-validate__text">
          <template v-if="!input">请输入 JSON 内容</template>
          <template v-else-if="isValid">✅ JSON 格式正确！</template>
          <template v-else>❌ {{ errorMessage }}</template>
        </div>
      </div>
      <div v-if="isValid && parsed" class="json-validate__stats">
        <div class="json-validate__stat">
          <span class="json-validate__stat-label">类型</span>
          <span class="json-validate__stat-value">{{ Array.isArray(parsed) ? 'Array' : 'Object' }}</span>
        </div>
        <div class="json-validate__stat">
          <span class="json-validate__stat-label">键/元素数</span>
          <span class="json-validate__stat-value">{{ Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length }}</span>
        </div>
        <div class="json-validate__stat">
          <span class="json-validate__stat-label">大小</span>
          <span class="json-validate__stat-value">{{ formatBytes(new Blob([input]).size) }}</span>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const input = ref('{"name":"SuperTools","version":"1.0.0"}')
const errorMessage = ref('')
const parsed = computed(() => {
  if (!input.value) return null
  try {
    return JSON.parse(input.value)
  } catch {
    return null
  }
})

const isValid = computed(() => {
  if (!input.value.trim()) return false
  try {
    JSON.parse(input.value)
    errorMessage.value = ''
    return true
  } catch (err) {
    errorMessage.value = (err as Error).message
    return false
  }
})

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped lang="less">
.json-validate {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__result {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    border: 1px solid var(--border-color);

    &.valid {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success) 8%, transparent);
    }

    &.invalid {
      border-color: var(--color-error);
      background: color-mix(in srgb, var(--color-error) 8%, transparent);
    }
  }

  &__text {
    font-size: 14px;
    color: var(--text-primary);
  }

  &__stats {
    display: flex;
    gap: 24px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__stat-label {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  &__stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}
</style>
