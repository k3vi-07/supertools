<template>
  <div class="h-multiline-input">
    <div v-if="title" class="h-multiline-input__header">
      <span class="h-multiline-input__title">{{ title }}</span>
      <div class="h-multiline-input__actions">
        <button
          v-if="modelValue"
          class="h-multiline-input__btn"
          title="复制"
          @click="handleCopy"
        >
          <h-icon icon="mdi:content-copy" :size="14" />
        </button>
        <button
          v-if="modelValue && !readonly"
          class="h-multiline-input__btn"
          title="清空"
          @click="handleClear"
        >
          <h-icon icon="mdi:close" :size="14" />
        </button>
      </div>
    </div>
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :spellcheck="false"
      class="h-multiline-input__textarea selectable"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    title?: string
    placeholder?: string
    readonly?: boolean
    autoSelect?: boolean
  }>(),
  {
    title: '',
    placeholder: '请输入...',
    readonly: false,
    autoSelect: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement>()

function handleInput(e: Event): void {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
  autoResize()
}

function handleCopy(): void {
  window.$he3?.copyText(props.modelValue)
  window.$he3?.message.success('已复制')
}

function handleClear(): void {
  emit('update:modelValue', '')
  emit('change', '')
}

function autoResize(): void {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
    }
  })
}

onMounted(() => {
  if (props.autoSelect && textareaRef.value) {
    textareaRef.value.focus()
    textareaRef.value.select()
  }
  autoResize()
})
</script>

<style scoped lang="less">
.h-multiline-input {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
  }

  &__title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  }

  &__textarea {
    border: none;
    outline: none;
    resize: vertical;
    min-height: 80px;
    padding: 12px;
    font-family: 'SF Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    background: var(--bg-surface);
    color: var(--text-primary);

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}
</style>
