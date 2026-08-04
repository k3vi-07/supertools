<template>
  <h-single-layout>
    <div class="hms-convert">
      <div class="hms-convert__options">
        <h-radio v-model="direction" :options="[{ label: 'HMS → 秒', value: 'toSec' }, { label: '秒 → HMS', value: 'toHms' }]" size="small" />
      </div>
      <div v-if="direction === 'toSec'" class="hms-convert__fields">
        <div class="hms-convert__field">
          <label>时</label>
          <h-number-input v-model="hours" :min="0" :max="999" />
        </div>
        <div class="hms-convert__field">
          <label>分</label>
          <h-number-input v-model="minutes" :min="0" :max="59" />
        </div>
        <div class="hms-convert__field">
          <label>秒</label>
          <h-number-input v-model="seconds" :min="0" :max="59" />
        </div>
      </div>
      <div v-else class="hms-convert__field">
        <label>秒数</label>
        <h-input v-model="totalSec" type="number" placeholder="输入秒数..." />
      </div>
      <h-card-box text="结果" icon="mdi:clock-outline">
        <div class="hms-convert__result selectable">{{ result }}</div>
      </h-card-box>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const direction = ref<'toSec' | 'toHms'>('toSec')
const hours = ref(1)
const minutes = ref(30)
const seconds = ref(45)
const totalSec = ref('5445')

const result = computed(() => {
  if (direction.value === 'toSec') {
    const total = hours.value * 3600 + minutes.value * 60 + seconds.value
    return `${total} 秒`
  } else {
    const sec = parseInt(totalSec.value, 10)
    if (isNaN(sec)) return '请输入有效数字'
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const parts: string[] = []
    if (h > 0) parts.push(`${h} 时`)
    parts.push(`${m} 分`)
    parts.push(`${s} 秒`)
    return parts.join(' ')
  }
})
</script>

<style scoped lang="less">
.hms-convert {
  display: flex; flex-direction: column; gap: 16px;
  &__fields { display: flex; gap: 16px; }
  &__field { display: flex; flex-direction: column; gap: 4px; label { font-size: 12px; color: var(--text-secondary); } }
  &__result { font-size: 18px; font-weight: 600; color: var(--color-primary); text-align: center; padding: 12px; }
}
</style>
