<template>
  <h-single-layout>
    <div class="csv-json">
      <div class="csv-json__options">
        <h-radio
          v-model="direction"
          :options="[
            { label: 'CSV → JSON', value: 'toJSON' },
            { label: 'JSON → CSV', value: 'toCSV' }
          ]"
          size="small"
        />
      </div>
      <h-transform
        left-title="输入"
        right-title="输出"
        :sample-data="direction === 'toJSON' ? csvSample : jsonSample"
        :input-handler="convertFn"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const direction = ref<'toJSON' | 'toCSV'>('toJSON')
const csvSample = 'name,version,openSource\nSuperTools,1.0.0,true\nDevTool,2.1.0,false'
const jsonSample = JSON.stringify([
  { name: 'SuperTools', version: '1.0.0', openSource: 'true' },
  { name: 'DevTool', version: '2.1.0', openSource: 'false' }
], null, 2)

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n')
  if (lines.length === 0) return '[]'
  const headers = parseCsvLine(lines[0])
  const result = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    return obj
  })
  return JSON.stringify(result, null, 2)
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function jsonToCsv(json: string): string {
  const data = JSON.parse(json)
  if (!Array.isArray(data) || data.length === 0) return 'Error: JSON 必须是非空对象数组'
  const headers = Object.keys(data[0])
  const lines = [headers.join(',')]
  for (const row of data) {
    const values = headers.map((h) => {
      const val = String(row[h] ?? '')
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    lines.push(values.join(','))
  }
  return lines.join('\n')
}

function convertFn(input: string): string {
  try {
    return direction.value === 'toJSON' ? csvToJson(input) : jsonToCsv(input)
  } catch (err) {
    return `❌ 转换失败: ${(err as Error).message}`
  }
}
</script>

<style scoped lang="less">
.csv-json {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
