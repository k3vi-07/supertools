<template>
  <h-single-layout>
    <div class="timezone">
      <div class="timezone__input">
        <label>选择时间</label>
        <input type="datetime-local" v-model="datetime" class="timezone__dt" />
      </div>
      <div class="timezone__list">
        <div v-for="tz in timezones" :key="tz.id" class="timezone__item">
          <div class="timezone__info">
            <span class="timezone__name">{{ tz.name }}</span>
            <span class="timezone__offset">{{ tz.offset }}</span>
          </div>
          <code class="timezone__time selectable">{{ getTimeInZone(tz.id) }}</code>
          <button class="timezone__copy" @click="copy(getTimeInZone(tz.id))">
            <h-icon icon="mdi:content-copy" :size="12" />
          </button>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const now = new Date()
const datetime = ref(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16))

const timezones = [
  { id: 'UTC', name: 'UTC', offset: '+00:00' },
  { id: 'Asia/Shanghai', name: '北京 (UTC+8)', offset: '+08:00' },
  { id: 'Asia/Tokyo', name: '东京 (UTC+9)', offset: '+09:00' },
  { id: 'Asia/Kolkata', name: '孟买 (UTC+5:30)', offset: '+05:30' },
  { id: 'Asia/Dubai', name: '迪拜 (UTC+4)', offset: '+04:00' },
  { id: 'Europe/London', name: '伦敦 (UTC+0)', offset: '+00:00' },
  { id: 'Europe/Paris', name: '巴黎 (UTC+1)', offset: '+01:00' },
  { id: 'Europe/Moscow', name: '莫斯科 (UTC+3)', offset: '+03:00' },
  { id: 'America/New_York', name: '纽约 (UTC-5)', offset: '-05:00' },
  { id: 'America/Los_Angeles', name: '洛杉矶 (UTC-8)', offset: '-08:00' },
  { id: 'America/Sao_Paulo', name: '圣保罗 (UTC-3)', offset: '-03:00' },
  { id: 'Australia/Sydney', name: '悉尼 (UTC+11)', offset: '+11:00' }
]

function getTimeInZone(tz: string): string {
  try {
    const date = new Date(datetime.value)
    return date.toLocaleString('zh-CN', { timeZone: tz, hour12: false })
  } catch {
    return '—'
  }
}

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.timezone {
  display: flex; flex-direction: column; gap: 16px;
  &__input { display: flex; flex-direction: column; gap: 6px; label { font-size: 12px; color: var(--text-secondary); } }
  &__dt { padding: 6px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-primary); font-size: 13px; }
  &__list { display: flex; flex-direction: column; gap: 6px; }
  &__item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-surface); }
  &__info { min-width: 160px; display: flex; flex-direction: column; }
  &__name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  &__offset { font-size: 11px; color: var(--text-tertiary); }
  &__time { flex: 1; font-family: monospace; font-size: 13px; color: var(--color-primary); }
  &__copy { border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; padding: 4px; &:hover { color: var(--text-primary); } }
}
</style>
