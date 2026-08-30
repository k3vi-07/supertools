<template>
  <div class="h-transform">
    <div class="h-transform__left">
      <slot name="left" />
      <div class="h-transform__editor-wrapper">
        <h-code-editor
          :model-value="inputValue"
          :title="leftTitle"
          :placeholder="inputPlaceholder"
          :lang="inputLang"
          :autofocus="true"
          :min-height="minHeight"
          @update:model-value="handleInputChange"
        />
      </div>
    </div>
    <div class="h-transform__divider" />
    <div class="h-transform__right">
      <slot name="right" />
      <div class="h-transform__editor-wrapper">
        <h-code-editor
          :model-value="outputValue"
          :title="rightTitle"
          :readonly="true"
          :lang="outputLang"
          :min-height="minHeight"
        />
      </div>
    </div>
    <p v-if="errorMessage" class="h-transform__error" role="alert">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    leftTitle?: string
    rightTitle?: string
    inputPlaceholder?: string
    inputLang?: string
    outputLang?: string
    minHeight?: number
    /** 转换函数 */
    inputHandler?: (input: string) => string | Promise<string>
    /** 逆向转换函数 */
    resultHandler?: (output: string) => string | Promise<string>
    /** 示例数据 */
    sampleData?: string
    /** 自动回填条件 */
    autoFillInputCondition?: (str: string) => boolean | null
    refreshKey?: unknown
  }>(),
  {
    modelValue: '',
    leftTitle: 'Input',
    rightTitle: 'Output',
    inputPlaceholder: '请输入...',
    inputLang: 'text',
    outputLang: 'text',
    minHeight: 300,
    inputHandler: undefined,
    resultHandler: undefined,
    sampleData: '',
    autoFillInputCondition: undefined,
    refreshKey: undefined
  }
)

const inputValue = ref(props.modelValue || props.sampleData || '')
const outputValue = ref('')
const errorMessage = ref('')
let requestSequence = 0

function normalizeResult(result: string): string {
  if (/^(Error:|❌)/.test(result)) throw new Error(result.replace(/^(Error:\s*|❌\s*)/, ''))
  return result
}

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

/** 处理输入变化并执行转换 */
async function handleInputChange(value: string): Promise<void> {
  inputValue.value = value
  emit('update:modelValue', value)
  emit('change', value)

  if (props.inputHandler) {
    const sequence = ++requestSequence
    errorMessage.value = ''
    try {
      if (value.trim()) {
        const result = normalizeResult(await props.inputHandler(value))
        if (sequence === requestSequence) outputValue.value = result
      } else {
        outputValue.value = ''
      }
    } catch (err) {
      if (sequence === requestSequence) {
        outputValue.value = ''
        errorMessage.value = (err as Error).message || '转换失败'
      }
    }
  }
}

/** 执行转换 */
async function transform(): Promise<void> {
  if (props.inputHandler && inputValue.value.trim()) {
    const sequence = ++requestSequence
    errorMessage.value = ''
    try {
      const result = normalizeResult(await props.inputHandler(inputValue.value))
      if (sequence === requestSequence) outputValue.value = result
    } catch (err) {
      if (sequence === requestSequence) {
        outputValue.value = ''
        errorMessage.value = (err as Error).message || '转换失败'
      }
    }
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== inputValue.value) {
      inputValue.value = val
      transform()
    }
  }
)

watch(() => props.refreshKey, () => void transform(), { deep: true })

onMounted(async () => {
  // 初始转换
  await transform()

  // 剪贴板自动回填
  if (props.autoFillInputCondition) {
    try {
      const clipboardValue = await window.$he3?.getLastClipboard()
      if (clipboardValue && props.autoFillInputCondition(clipboardValue)) {
        inputValue.value = clipboardValue
        await transform()
        window.$he3?.message.info('已自动填入剪贴板内容')
      }
    } catch {
      // 忽略剪贴板错误
    }
  }
})

// 暴露方法
defineExpose({
  inputValue,
  outputValue,
  errorMessage,
  transform
})
</script>

<style scoped lang="less">
.h-transform {
  display: flex;
  height: 100%;
  gap: 0;
  flex: 1;
  overflow: hidden;
  flex-wrap: wrap;

  &__left,
  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__divider {
    width: 8px;
    flex-shrink: 0;
  }

  &__editor-wrapper {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  &__error {
    flex-basis: 100%;
    margin: 8px 0 0;
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--color-error) 45%, var(--border-color));
    border-radius: var(--radius-sm);
    color: var(--color-error);
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
    font-size: 12px;
  }
}
</style>
