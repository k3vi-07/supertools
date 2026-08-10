<template>
  <div class="shortcut-recorder">
    <!-- 快捷键显示/录制按钮 -->
    <button
      v-if="!recording"
      class="shortcut-recorder__btn"
      :class="{ disabled: !modelValue }"
      @click="startRecording"
    >
      <span v-if="modelValue">{{ formatShortcut(modelValue) }}</span>
      <span v-else class="shortcut-recorder__placeholder">{{ t('settings.shortcutDisabled') }}</span>
    </button>

    <!-- 录制中状态 -->
    <button v-else class="shortcut-recorder__btn recording" @click="cancelRecording">
      <span>{{ t('settings.shortcutRecording') }}</span>
    </button>

    <!-- 操作按钮 -->
    <div class="shortcut-recorder__actions">
      <button
        v-if="!recording"
        class="shortcut-recorder__action"
        :title="t('settings.shortcutClear')"
        @click="handleDisable"
      >
        <h-icon icon="mdi:close-circle-outline" :size="14" />
      </button>
      <button
        v-if="!recording"
        class="shortcut-recorder__action"
        :title="t('settings.shortcutReset')"
        @click="handleReset"
      >
        <h-icon icon="mdi:restore" :size="14" />
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="shortcut-recorder__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatShortcut } from '../utils/shortcut'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  defaultValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'recorded': [accelerator: string]
}>()

const recording = ref(false)
const error = ref('')

/** 开始录制 */
function startRecording(): void {
  recording.value = true
  error.value = ''
  document.addEventListener('keydown', handleKeydown, { once: false })
}

/** 取消录制 */
function cancelRecording(): void {
  recording.value = false
  document.removeEventListener('keydown', handleKeydown)
}

/** 禁用快捷键（设为空） */
function handleDisable(): void {
  error.value = ''
  emit('update:modelValue', '')
  emit('recorded', '')
}

/** 恢复默认快捷键 */
function handleReset(): void {
  error.value = ''
  emit('update:modelValue', props.defaultValue)
  emit('recorded', props.defaultValue)
}

/** 录制键盘事件 */
function handleKeydown(e: KeyboardEvent): void {
  e.preventDefault()
  e.stopPropagation()

  // Escape 取消录制
  if (e.key === 'Escape') {
    cancelRecording()
    return
  }

  // 忽略单独的修饰键
  const modifierKeys = ['Control', 'Shift', 'Alt', 'Meta']
  if (modifierKeys.includes(e.key)) return

  // 构建 accelerator 字符串
  const parts: string[] = []
  if (e.metaKey) parts.push('Command')
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  // 获取主键名
  let key = e.key
  // 特殊键映射
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
    'Enter': 'Return',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'Tab': 'Tab'
  }
  if (keyMap[key]) key = keyMap[key]
  // 单字母大写
  if (key.length === 1) key = key.toUpperCase()
  // F1-F12 保持原样
  if (/^F\d{1,2}$/.test(key)) { /* keep */ }

  parts.push(key)
  const accelerator = parts.join('+')

  // 至少需要一个修饰键（除了功能键 F1-F12）
  const hasModifier = e.metaKey || e.ctrlKey || e.altKey
  const isFunctionKey = /^F\d{1,2}$/.test(e.key)
  if (!hasModifier && !isFunctionKey) {
    error.value = t('settings.shortcutNeedModifier')
    return
  }

  cancelRecording()
  error.value = ''
  emit('update:modelValue', accelerator)
  emit('recorded', accelerator)
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="less">
.shortcut-recorder {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.shortcut-recorder__btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-base);
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 80px;
  justify-content: center;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &.disabled {
    opacity: 0.5;
  }

  &.recording {
    border-color: var(--color-primary);
    color: var(--color-primary);
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.shortcut-recorder__placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

.shortcut-recorder__actions {
  display: flex;
  gap: 4px;
}

.shortcut-recorder__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }
}

.shortcut-recorder__error {
  width: 100%;
  font-size: 11px;
  color: #ef4444;
}
</style>
