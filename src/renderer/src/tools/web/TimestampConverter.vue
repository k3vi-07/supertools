<template>
  <h-single-layout>
    <div class="timestamp-converter">
      <!-- 实时时间戳 -->
      <div class="timestamp-converter__now">
        <div class="timestamp-converter__now-info">
          <span class="timestamp-converter__now-label">当前时间戳</span>
          <code class="timestamp-converter__now-value selectable">{{ nowTimestamp }}</code>
          <span class="timestamp-converter__now-date">{{ nowDate }}</span>
        </div>
        <h-button size="small" icon="mdi:content-copy" @click="copy(nowTimestamp.toString())">复制</h-button>
      </div>

      <!-- 时间戳转日期 -->
      <h-card-box text="时间戳 → 日期" icon="mdi:arrow-right">
        <div class="timestamp-converter__row">
          <h-input v-model="tsInput" placeholder="输入时间戳 (如 1700000000)" />
          <h-button size="small" icon="mdi:arrow-right" @click="convertToDate">转换</h-button>
        </div>
        <div v-if="tsResult" class="timestamp-converter__result selectable">
          {{ tsResult }}
        </div>
      </h-card-box>

      <!-- 日期转时间戳 -->
      <h-card-box text="日期 → 时间戳" icon="mdi:arrow-left">
        <div class="timestamp-converter__row">
          <input type="datetime-local" v-model="dateInput" class="timestamp-converter__date-input" />
          <h-button size="small" icon="mdi:arrow-left" @click="convertToTimestamp">转换</h-button>
        </div>
        <div v-if="dateResult" class="timestamp-converter__result selectable">
          <div>秒: <code>{{ dateResult.seconds }}</code></div>
          <div>毫秒: <code>{{ dateResult.milliseconds }}</code></div>
        </div>
      </h-card-box>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const nowTimestamp = ref(Math.floor(Date.now() / 1000))
const nowDate = ref('')
const tsInput = ref('')
const tsResult = ref('')
const dateInput = ref('')
const dateResult = ref<{ seconds: number; milliseconds: number } | null>(null)

let timer: ReturnType<typeof setInterval> | null = null

function updateNow(): void {
  const now = new Date()
  nowTimestamp.value = Math.floor(now.getTime() / 1000)
  nowDate.value = now.toLocaleString('zh-CN')
}

function convertToDate(): void {
  const ts = Number(tsInput.value.trim())
  if (isNaN(ts)) {
    window.$he3?.message.error('请输入有效的数字')
    return
  }
  // 自动判断秒/毫秒
  const ms = tsInput.value.trim().length <= 10 ? ts * 1000 : ts
  const date = new Date(ms)
  if (isNaN(date.getTime())) {
    tsResult.value = '无效的时间戳'
    return
  }
  tsResult.value = date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZoneName: 'short'
  })
}

function convertToTimestamp(): void {
  if (!dateInput.value) {
    window.$he3?.message.error('请选择日期时间')
    return
  }
  const date = new Date(dateInput.value)
  dateResult.value = {
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime()
  }
}

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}

onMounted(() => {
  updateNow()
  timer = setInterval(updateNow, 1000)
  // 默认填充当前时间
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  dateInput.value = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="less">
.timestamp-converter {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__now {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }

  &__now-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__now-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__now-value {
    font-family: 'SF Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
  }

  &__now-date {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  &__date-input {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }

  &__result {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    background: var(--bg-code);
    font-size: 13px;
    color: var(--text-primary);

    code {
      font-family: 'SF Mono', monospace;
      color: var(--color-primary);
    }

    div {
      margin-bottom: 4px;
    }
  }

  :deep(.h-card-box) {
    margin-bottom: 0;
  }
}
</style>
