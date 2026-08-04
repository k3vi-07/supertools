<template>
  <TransitionGroup name="slide-up" tag="div" class="h-message-container">
    <div
      v-for="msg in messages"
      :key="msg.id"
      class="h-message"
      :class="`h-message--${msg.type}`"
    >
      <h-icon :icon="iconMap[msg.type]" :size="18" />
      <span class="h-message__text">{{ msg.text }}</span>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MessageItem {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  text: string
}

const iconMap: Record<string, string> = {
  success: 'mdi:check-circle-outline',
  error: 'mdi:alert-circle-outline',
  info: 'mdi:information-outline',
  warning: 'mdi:alert-outline'
}

const messages = ref<MessageItem[]>([])
let msgId = 0
let handler: ((e: Event) => void) | null = null

function showMessage(type: MessageItem['type'], text: string): void {
  const id = ++msgId
  messages.value.push({ id, type, text })
  // 3 秒后自动消失
  setTimeout(() => {
    messages.value = messages.value.filter((m) => m.id !== id)
  }, 3000)
}

onMounted(() => {
  handler = (e: Event): void => {
    const detail = (e as CustomEvent).detail as { type: string; text: string }
    showMessage(detail.type as MessageItem['type'], detail.text)
  }
  window.addEventListener('he3:message', handler)
})

onUnmounted(() => {
  if (handler) {
    window.removeEventListener('he3:message', handler)
  }
})
</script>

<style scoped lang="less">
.h-message-container {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.h-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  box-shadow: var(--shadow-lg);
  font-size: 13px;
  min-width: 200px;
  pointer-events: auto;

  &--success {
    color: var(--color-success);
  }
  &--error {
    color: var(--color-error);
  }
  &--info {
    color: var(--color-info);
  }
  &--warning {
    color: var(--color-warning);
  }

  &__text {
    color: var(--text-primary);
    user-select: text;
  }
}
</style>
