<template>
  <h-single-layout>
    <div class="cron-parser">
      <div class="cron-parser__input">
        <label class="cron-parser__label">Cron 表达式</label>
        <div class="cron-parser__input-row">
          <code class="cron-parser__prefix">cron(</code>
          <input v-model="expression" class="cron-parser__field" placeholder="*/5 * * * *" spellcheck="false" @input="parse" />
          <code class="cron-parser__prefix">)</code>
        </div>
        <div class="cron-parser__examples">
          <button v-for="ex in examples" :key="ex.value" class="cron-parser__example" @click="expression = ex.value; parse()">
            {{ ex.label }}
          </button>
        </div>
      </div>

      <div v-if="error" class="cron-parser__error">
        <h-icon icon="mdi:alert-circle" :size="16" />
        {{ error }}
      </div>

      <div v-if="description" class="cron-parser__desc">
        <h-icon icon="mdi:information-outline" :size="16" color="var(--color-primary)" />
        <span>{{ description }}</span>
      </div>

      <div v-if="nextRuns.length" class="cron-parser__next">
        <div class="cron-parser__next-header">下次执行时间</div>
        <div v-for="(run, i) in nextRuns" :key="i" class="cron-parser__next-item">
          <span class="cron-parser__next-index">{{ i + 1 }}</span>
          <span class="cron-parser__next-time selectable">{{ run }}</span>
        </div>
      </div>

      <div class="cron-parser__fields">
        <div v-for="(field, i) in fieldInfo" :key="i" class="cron-parser__field-info">
          <span class="cron-parser__field-name">{{ field.name }}</span>
          <code class="cron-parser__field-value">{{ field.value }}</code>
          <span class="cron-parser__field-desc">{{ field.desc }}</span>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FieldInfo {
  name: string
  value: string
  desc: string
}

const expression = ref('*/5 * * * *')
const error = ref('')
const description = ref('')
const nextRuns = ref<string[]>([])
const fieldInfo = ref<FieldInfo[]>([])

const examples = [
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天午夜', value: '0 0 * * *' },
  { label: '每周一', value: '0 0 * * 1' },
  { label: '每月 1 号', value: '0 0 1 * *' }
]

function parse(): void {
  error.value = ''
  description.value = ''
  nextRuns.value = []
  fieldInfo.value = []

  const parts = expression.value.trim().split(/\s+/)
  if (parts.length !== 5) {
    error.value = 'Cron 表达式必须包含 5 个部分（分 时 日 月 周）'
    return
  }

  const [min, hour, day, month, weekday] = parts

  fieldInfo.value = [
    { name: '分钟', value: min, desc: parseField(min, 0, 59) },
    { name: '小时', value: hour, desc: parseField(hour, 0, 23) },
    { name: '日', value: day, desc: parseField(day, 1, 31) },
    { name: '月', value: month, desc: parseField(month, 1, 12) },
    { name: '星期', value: weekday, desc: parseField(weekday, 0, 7) }
  ]

  description.value = generateDescription(parts)
  calculateNextRuns(parts)
}

function parseField(field: string, min: number, max: number): string {
  if (field === '*') return `每 ${min === 0 ? '单位' : '单位'}`
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2), 10)
    return `每 ${step} ${min === 0 ? '分钟' : min <= 23 ? '小时' : '天'}`
  }
  if (field.includes(',')) return `指定: ${field}`
  if (field.includes('-')) return `范围: ${field}`
  return `值为 ${field}`
}

function generateDescription([min, hour, day, month, weekday]: string[]): string {
  const parts: string[] = []

  if (min === '*' && hour === '*') parts.push('每分钟')
  else if (min.startsWith('*/')) parts.push(`每 ${min.slice(2)} 分钟`)
  else if (hour === '*' && min !== '*') parts.push(`每小时的第 ${min} 分钟`)
  else if (hour.startsWith('*/')) parts.push(`每 ${hour.slice(2)} 小时`)
  else if (hour !== '*' && min !== '*') parts.push(`在 ${hour}:${min.padStart(2, '0')}`)
  else if (hour === '0' && min === '0') parts.push('每天午夜')

  if (weekday !== '*' && weekday !== '0' && weekday !== '7') {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    parts.push(`每${days[parseInt(weekday, 10)] || weekday}`)
  }

  if (day !== '*' && day !== '?' && !weekday.includes('*')) {
    parts.push(`每月 ${day} 号`)
  }

  if (month !== '*') parts.push(`${month} 月`)

  return parts.length > 0 ? parts.join('，') : '自定义计划'
}

function calculateNextRuns(parts: string[]): void {
  const [minField, hourField, dayField, monthField, weekdayField] = parts
  const runs: Date[] = []
  const now = new Date()
  let current = new Date(now.getTime() + 60000)
  current.setSeconds(0, 0)

  let attempts = 0
  while (runs.length < 5 && attempts < 100000) {
    attempts++
    if (matchesField(monthField, current.getMonth() + 1, 1, 12) &&
        matchesField(dayField, current.getDate(), 1, 31) &&
        matchesField(weekdayField, current.getDay() === 0 ? 7 : current.getDay(), 0, 7) &&
        matchesField(hourField, current.getHours(), 0, 23) &&
        matchesField(minField, current.getMinutes(), 0, 59)) {
      runs.push(new Date(current))
    }
    current = new Date(current.getTime() + 60000)
  }

  nextRuns.value = runs.map((d) =>
    d.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', weekday: 'short'
    })
  )
}

function matchesField(field: string, value: number, min: number, max: number): boolean {
  if (field === '*' || field === '?') return true
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2), 10)
    return (value - min) % step === 0
  }
  return field.split(',').some((part) => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      return value >= start && value <= end
    }
    return parseInt(part, 10) === value || (value === 0 && part === '7' && max === 7)
  })
}

onMounted(() => parse())
</script>

<style scoped lang="less">
.cron-parser {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__input {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__input-row {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__prefix {
    padding: 8px 12px;
    background: var(--bg-code-header);
    color: var(--text-tertiary);
    font-family: monospace;
    font-size: 13px;
  }

  &__field {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px;
    background: transparent;
    color: var(--text-primary);
    font-family: 'SF Mono', monospace;
    font-size: 14px;
  }

  &__examples {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__example {
    padding: 3px 10px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--color-error);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
    color: var(--color-error);
    font-size: 13px;
  }

  &__desc {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    font-size: 13px;
    color: var(--text-primary);
  }

  &__next {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  &__next-header {
    padding: 8px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__next-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color-light);

    &:last-child {
      border-bottom: none;
    }
  }

  &__next-index {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    font-size: 11px;
    font-weight: 600;
  }

  &__next-time {
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    color: var(--text-primary);
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__field-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
  }

  &__field-name {
    width: 50px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__field-value {
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    color: var(--color-primary);
    min-width: 60px;
  }

  &__field-desc {
    font-size: 12px;
    color: var(--text-tertiary);
  }
}
</style>
