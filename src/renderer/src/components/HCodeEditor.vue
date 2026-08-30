<template>
  <div class="h-code-editor">
    <div v-if="title" class="h-code-editor__header">
      <span class="h-code-editor__title">{{ title }}</span>
      <div class="h-code-editor__actions">
        <button
          v-if="copyable && modelValue"
          class="h-code-editor__btn"
          :title="t('tool.copy')"
          @click="handleCopy"
        >
          <h-icon icon="mdi:content-copy" :size="14" />
        </button>
        <button
          v-if="!readonly && modelValue"
          class="h-code-editor__btn"
          :title="t('tool.clear')"
          @click="handleClear"
        >
          <h-icon icon="mdi:close" :size="14" />
        </button>
      </div>
    </div>
    <div class="h-code-editor__body">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="props.placeholder || t('tool.inputPlaceholder')"
        :readonly="readonly"
        :spellcheck="false"
        class="h-code-editor__textarea selectable"
        :class="{ 'no-gutter': hiddenGutter }"
        :style="textareaStyle"
        @input="handleInput"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: string
    title?: string
    placeholder?: string
    lang?: string
    readonly?: boolean
    autofocus?: boolean
    copyable?: boolean
    hiddenGutter?: boolean
    minHeight?: number
  }>(),
  {
    title: '',
    placeholder: '',
    lang: 'text',
    readonly: false,
    autofocus: false,
    copyable: true,
    hiddenGutter: false,
    minHeight: 200
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  focus: []
  blur: []
}>()

const textareaRef = ref<HTMLTextAreaElement>()

const textareaStyle = computed(() => ({
  minHeight: `${props.minHeight}px`
}))

function handleInput(e: Event): void {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
  autoResize()
}

function handleCopy(): void {
  window.$he3?.copyText(props.modelValue)
  window.$he3?.message.success('已复制到剪贴板')
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
  if (props.autofocus) {
    textareaRef.value?.focus()
  }
  autoResize()
})
</script>

<style scoped lang="less">
.h-code-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface);
  flex: 1;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    min-height: 36px;
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
    width: 24px;
    height: 24px;
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

  &__body {
    flex: 1;
    overflow: hidden;
    display: flex;
  }

  &__textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas,
      'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    background: var(--bg-code);
    color: var(--text-primary);
    tab-size: 2;
    flex: 1;

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}
</style>
