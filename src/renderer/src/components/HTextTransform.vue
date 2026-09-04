<template>
  <div class="h-text-transform">
    <div v-if="enableReverse" class="h-text-transform__direction" aria-label="转换方向">
      <button type="button" :class="{ active: direction === 'forward' }" :aria-pressed="direction === 'forward'" :disabled="pending" @click="setDirection('forward')">
        {{ forwardLabel }}
      </button>
      <button type="button" :class="{ active: direction === 'reverse' }" :aria-pressed="direction === 'reverse'" :disabled="pending" @click="setDirection('reverse')">
        {{ reverseLabel }}
      </button>
    </div>

    <!-- 选项插槽 -->
    <div v-if="$slots.option" class="h-text-transform__options">
      <slot name="option" />
    </div>

    <!-- 输入输出区域 -->
    <div class="h-text-transform__body">
      <div class="h-text-transform__panel">
        <div class="h-text-transform__header">
          <span class="h-text-transform__title">{{ resolvedInputTitle }}</span>
        </div>
        <textarea
          v-model="inputValue"
          class="h-text-transform__textarea selectable"
          :placeholder="inputPlaceholder"
          spellcheck="false"
          :aria-label="resolvedInputTitle"
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="errorMessage ? errorId : undefined"
          @input="handleTransform"
        />
      </div>

      <div class="h-text-transform__panel">
        <div class="h-text-transform__header">
          <span class="h-text-transform__title">{{ resolvedOutputTitle }}</span>
          <div class="h-text-transform__actions">
            <button
              v-if="outputValue"
              type="button"
              class="h-text-transform__btn"
              title="复制"
              aria-label="复制输出"
              :disabled="pending"
              @click="handleCopy"
            >
              <h-icon icon="mdi:content-copy" :size="14" />
              <span>复制</span>
            </button>
            <button
              v-if="enableReverse && outputValue"
              type="button"
              class="h-text-transform__btn"
              title="交换输入输出"
              aria-label="交换输入输出并切换方向"
              :disabled="pending"
              @click="handleSwap"
            >
              <h-icon icon="mdi:swap-horizontal" :size="14" />
              <span>交换</span>
            </button>
          </div>
        </div>
        <textarea
          :value="outputValue"
          class="h-text-transform__textarea selectable h-text-transform__output"
          readonly
          spellcheck="false"
          :aria-label="resolvedOutputTitle"
          :aria-busy="pending"
        />
      </div>
    </div>
    <p v-if="errorMessage" :id="errorId" class="h-text-transform__error" role="alert">
      <h-icon icon="mdi:alert-circle-outline" :size="16" />
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    inputPlaceholder?: string
    sampleData?: string
    enableReverse?: boolean
    enableFile?: boolean
    inputTitle?: string
    outputTitle?: string
    forwardLabel?: string
    reverseLabel?: string
    forwardInputTitle?: string
    forwardOutputTitle?: string
    reverseInputTitle?: string
    reverseOutputTitle?: string
    /** 外部选项变化时传入新值，触发重新计算 */
    refreshKey?: unknown
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
    inputTitle: '输入',
    outputTitle: '输出',
    forwardLabel: '编码',
    reverseLabel: '解码',
    forwardInputTitle: '',
    forwardOutputTitle: '',
    reverseInputTitle: '',
    reverseOutputTitle: '',
    refreshKey: undefined,
    transform: undefined,
    reverseTransform: undefined,
    autoFillInputCondition: undefined
  }
)

const inputValue = ref(props.sampleData || '')
const outputValue = ref('')
const errorMessage = ref('')
const pending = ref(false)
const direction = ref<'forward' | 'reverse'>('forward')
const errorId = `transform-error-${Math.random().toString(36).slice(2)}`
let requestSequence = 0

const resolvedInputTitle = computed(() => direction.value === 'forward'
  ? props.forwardInputTitle || props.inputTitle
  : props.reverseInputTitle || props.inputTitle)
const resolvedOutputTitle = computed(() => direction.value === 'forward'
  ? props.forwardOutputTitle || props.outputTitle
  : props.reverseOutputTitle || props.outputTitle)

function normalizeResult(result: string): string {
  if (/^(Error:|❌)/.test(result)) {
    throw new Error(result.replace(/^(Error:\s*|❌\s*)/, ''))
  }
  return result
}

/** 执行转换 */
async function handleTransform(): Promise<void> {
  const handler = direction.value === 'reverse' ? props.reverseTransform : props.transform
  if (!handler) return
  const sequence = ++requestSequence
  errorMessage.value = ''
  try {
    if (inputValue.value) {
      pending.value = true
      const result = normalizeResult(await handler(inputValue.value))
      if (sequence === requestSequence) outputValue.value = result
    } else {
      outputValue.value = ''
    }
  } catch (err) {
    if (sequence === requestSequence) {
      outputValue.value = ''
      errorMessage.value = (err as Error).message || '转换失败'
    }
  } finally {
    if (sequence === requestSequence) pending.value = false
  }
}

function setDirection(value: 'forward' | 'reverse'): void {
  if (direction.value === value) return
  direction.value = value
  void handleTransform()
}

/** 交换当前结果与输入，并切换转换方向 */
async function handleSwap(): Promise<void> {
  if (!outputValue.value) return
  inputValue.value = outputValue.value
  direction.value = direction.value === 'forward' ? 'reverse' : 'forward'
  await handleTransform()
}

/** 复制输出 */
function handleCopy(): void {
  window.$he3?.copyText(outputValue.value)
  window.$he3?.message.success('已复制到剪贴板')
}

onMounted(async () => {
  // 剪贴板自动回填
  if (props.autoFillInputCondition) {
    try {
      const clipboardValue = await window.$he3?.getLastClipboard()
      if (clipboardValue && props.autoFillInputCondition(clipboardValue)) {
        inputValue.value = clipboardValue
        if (props.reverseTransform) direction.value = 'reverse'
        await handleTransform()
        window.$he3?.message.info('已自动填入剪贴板内容')
      }
    } catch {
      // 忽略
    }
  }
  if (!inputValue.value || outputValue.value) return
  await handleTransform()
})

watch(() => props.refreshKey, () => void handleTransform(), { deep: true })

defineExpose({
  inputValue,
  outputValue,
  errorMessage,
  direction,
  setDirection,
  handleSwap,
  handleTransform
})
</script>

<style scoped lang="less">
.h-text-transform {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;

  &__direction {
    display: inline-flex;
    align-self: flex-start;
    padding: 2px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);

    button {
      min-height: 36px;
      padding: 4px 14px;
      border: 0;
      border-radius: calc(var(--radius-sm) - 2px);
      color: var(--text-secondary);
      background: transparent;
      font: inherit;
      font-size: 12px;
      cursor: pointer;

      &.active { color: white; background: var(--color-primary); }
      &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
      &:disabled { cursor: wait; opacity: 0.55; }
    }
  }

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

    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    &:disabled { cursor: wait; opacity: 0.55; }

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
      border-color: var(--color-primary);
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--color-error) 45%, var(--border-color));
    border-radius: var(--radius-sm);
    color: var(--color-error);
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
    font-size: 12px;
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

    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-primary);
    }

    &::placeholder {
      color: var(--text-tertiary);
    }

    &.h-text-transform__output {
      background: var(--bg-code);
      cursor: default;
    }
  }
}

@media (max-width: 720px) {
  .h-text-transform__direction button,
  .h-text-transform__btn { min-height: 44px; }
  .h-text-transform__body { flex-direction: column; overflow: visible; }
  .h-text-transform__panel { min-height: 220px; }
}

@media (prefers-reduced-motion: reduce) {
  .h-text-transform :where(*) { transition-duration: 0.01ms !important; }
}
</style>
