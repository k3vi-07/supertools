<template>
  <div class="h-text-transform">
    <!-- 选项插槽 -->
    <div v-if="$slots.option" class="h-text-transform__options">
      <slot name="option" />
    </div>

    <!-- 输入输出区域 -->
    <div class="h-text-transform__body">
      <div class="h-text-transform__panel">
        <div class="h-text-transform__header">
          <span class="h-text-transform__title">Input</span>
        </div>
        <textarea
          v-model="inputValue"
          class="h-text-transform__textarea selectable"
          :placeholder="inputPlaceholder"
          spellcheck="false"
          @input="handleTransform"
        />
      </div>

      <div class="h-text-transform__panel">
        <div class="h-text-transform__header">
          <span class="h-text-transform__title">Output</span>
          <div class="h-text-transform__actions">
            <button
              v-if="outputValue"
              class="h-text-transform__btn"
              title="复制"
              @click="handleCopy"
            >
              <h-icon icon="mdi:content-copy" :size="14" />
              <span>复制</span>
            </button>
            <button
              v-if="enableReverse && outputValue"
              class="h-text-transform__btn"
              title="反向转换"
              @click="handleReverse"
            >
              <h-icon icon="mdi:swap-horizontal" :size="14" />
              <span>反转</span>
            </button>
          </div>
        </div>
        <textarea
          :value="outputValue"
          class="h-text-transform__textarea selectable h-text-transform__output"
          readonly
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    inputPlaceholder?: string
    sampleData?: string
    enableReverse?: boolean
    enableFile?: boolean
    /** 转换函数 */
    transform?: (input: string) => string | Promise<string>
    /** 反向转换函数 */
    reverseTransform?: (input: string) => string | Promise<string>
    /** 自动回填条件 */
    autoFillInputCondition?: (str: string) => boolean | null
  }>(),
  {
    inputPlaceholder: '请输入文本...',
    sampleData: '',
    enableReverse: false,
    enableFile: false,
    transform: undefined,
    reverseTransform: undefined,
    autoFillInputCondition: undefined
  }
)

const inputValue = ref(props.sampleData || '')
const outputValue = ref('')

/** 执行转换 */
async function handleTransform(): Promise<void> {
  if (!props.transform) return
  try {
    if (inputValue.value) {
      outputValue.value = await props.transform(inputValue.value)
    } else {
      outputValue.value = ''
    }
  } catch (err) {
    outputValue.value = `Error: ${(err as Error).message}`
  }
}

/** 执行反向转换：将输出解码后放回输入框，并重新计算输出 */
async function handleReverse(): Promise<void> {
  if (!props.reverseTransform || !outputValue.value) return
  try {
    const result = await props.reverseTransform(outputValue.value)
    // 交换：解码结果放入输入框，原输入放入输出框
    const oldInput = inputValue.value
    inputValue.value = result
    outputValue.value = oldInput
  } catch (err) {
    window.$he3?.message.error(`反转失败: ${(err as Error).message}`)
  }
}

/** 复制输出 */
function handleCopy(): void {
  window.$he3?.copyText(outputValue.value)
  window.$he3?.message.success('已复制到剪贴板')
}

onMounted(async () => {
  await handleTransform()

  // 剪贴板自动回填
  if (props.autoFillInputCondition) {
    try {
      const clipboardValue = await window.$he3?.getLastClipboard()
      if (clipboardValue && props.autoFillInputCondition(clipboardValue)) {
        inputValue.value = clipboardValue
        await handleTransform()
        window.$he3?.message.info('已自动填入剪贴板内容')
      }
    } catch {
      // 忽略
    }
  }
})

defineExpose({
  inputValue,
  outputValue,
  handleTransform
})
</script>

<style scoped lang="less">
.h-text-transform {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__body {
    flex: 1;
    display: flex;
    gap: 12px;
    overflow: hidden;
  }

  &__panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--bg-surface);
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    min-height: 34px;
  }

  &__title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    font-size: 12px;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--color-primary);
    }
  }

  &__textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: 'SF Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    background: var(--bg-surface);
    color: var(--text-primary);

    &::placeholder {
      color: var(--text-tertiary);
    }

    &.h-text-transform__output {
      background: var(--bg-code);
      cursor: default;
    }
  }
}
</style>
