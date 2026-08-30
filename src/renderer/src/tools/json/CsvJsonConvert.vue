<template>
  <h-single-layout>
    <div class="csv-json">
      <h-text-transform
        :sample-data="csvSample"
        :enable-reverse="true"
        :transform="csvToJson"
        :reverse-transform="jsonToCsv"
        forward-label="CSV → JSON"
        reverse-label="JSON → CSV"
        forward-input-title="CSV"
        forward-output-title="JSON"
        reverse-input-title="JSON"
        reverse-output-title="CSV"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
const csvSample = 'name,version,openSource\nSuperTools,1.0.0,true\nDevTool,2.1.0,false'

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

</script>

<style scoped lang="less">
.csv-json {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
