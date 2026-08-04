<template>
  <div class="h-kv-input">
    <div v-for="(item, index) in items" :key="index" class="h-kv-input__row">
      <h-input
        :model-value="item.key"
        placeholder="Key"
        class="h-kv-input__key"
        @update:model-value="(val: string) => updateKey(index, val)"
      />
      <h-input
        :model-value="item.value"
        placeholder="Value"
        class="h-kv-input__value"
        @update:model-value="(val: string) => updateValue(index, val)"
      />
      <button class="h-kv-input__btn" title="删除" @click="removeRow(index)">
        <h-icon icon="mdi:close" :size="16" />
      </button>
    </div>
    <h-button type="dashed" size="small" icon="mdi:plus" @click="addRow">
      添加
    </h-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface KVItem {
  key: string
  value: string
}

const props = defineProps<{
  modelValue?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const items = ref<KVItem[]>([])

// 从 modelValue 初始化
function initFromModel(): void {
  if (props.modelValue) {
    items.value = Object.entries(props.modelValue).map(([key, value]) => ({ key, value }))
  }
  if (items.value.length === 0) {
    items.value = [{ key: '', value: '' }]
  }
}

initFromModel()

function emitChange(): void {
  const result: Record<string, string> = {}
  for (const item of items.value) {
    if (item.key) {
      result[item.key] = item.value
    }
  }
  emit('update:modelValue', result)
}

function updateKey(index: number, val: string): void {
  items.value[index].key = val
  emitChange()
}

function updateValue(index: number, val: string): void {
  items.value[index].value = val
  emitChange()
}

function addRow(): void {
  items.value.push({ key: '', value: '' })
}

function removeRow(index: number): void {
  items.value.splice(index, 1)
  if (items.value.length === 0) {
    items.value = [{ key: '', value: '' }]
  }
  emitChange()
}

watch(
  () => props.modelValue,
  () => {
    // 仅在外部完全替换时重新初始化
  },
  { deep: true }
)
</script>

<style scoped lang="less">
.h-kv-input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__key {
    flex: 1;
  }

  &__value {
    flex: 2;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
      color: var(--color-error);
    }
  }
}
</style>
