<template>
  <h-single-layout>
    <div class="uuid-generator">
      <div class="uuid-generator__options">
        <label class="uuid-generator__label">版本</label>
        <h-select
          v-model="version"
          :options="[
            { label: 'UUID v4 (随机)', value: 'v4' },
            { label: 'UUID v1 (时间)', value: 'v1' },
            { label: 'NIL UUID', value: 'nil' }
          ]"
        />
        <label class="uuid-generator__label">数量</label>
        <h-number-input v-model="count" :min="1" :max="100" />
        <label class="uuid-generator__check">
          <input type="checkbox" v-model="upperCase" /> 大写
        </label>
        <label class="uuid-generator__check">
          <input type="checkbox" v-model="noHyphens" /> 无连字符
        </label>
      </div>

      <div class="uuid-generator__actions">
        <h-button type="primary" icon="mdi:refresh" @click="generate">重新生成</h-button>
        <h-button v-if="uuids.length" icon="mdi:content-copy-all" @click="copyAll">全部复制</h-button>
      </div>

      <div class="uuid-generator__list">
        <div v-for="(uuid, i) in uuids" :key="i" class="uuid-generator__item">
          <code class="uuid-generator__uuid selectable">{{ uuid }}</code>
          <button class="uuid-generator__copy-btn" @click="copy(uuid)">
            <h-icon icon="mdi:content-copy" :size="14" />
          </button>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { v4, v1 } from 'uuid'

// NIL UUID 常量
const NIL_UUID = '00000000-0000-0000-0000-000000000000'

const version = ref<'v4' | 'v1' | 'nil'>('v4')
const count = ref(5)
const upperCase = ref(false)
const noHyphens = ref(false)
const uuids = ref<string[]>([])

function generateOne(): string {
  let uuid: string
  if (version.value === 'v4') uuid = v4()
  else if (version.value === 'v1') uuid = v1()
  else uuid = NIL_UUID

  if (noHyphens.value) uuid = uuid.replace(/-/g, '')
  if (upperCase.value) uuid = uuid.toUpperCase()
  return uuid
}

function generate(): void {
  uuids.value = Array.from({ length: count.value }, () => generateOne())
}

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}

function copyAll(): void {
  window.$he3?.copyText(uuids.value.join('\n'))
  window.$he3?.message.success(`已复制 ${uuids.value.length} 个 UUID`)
}

onMounted(() => {
  generate()
})
</script>

<style scoped lang="less">
.uuid-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__options {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
  }

  &__uuid {
    flex: 1;
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    color: var(--text-primary);
  }

  &__copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
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
}
</style>
