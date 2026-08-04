<template>
  <h-single-layout>
    <div class="generic-table-convert">
      <h-transform
        left-title="输入"
        right-title="输出"
        :sample-data="sample"
        :input-handler="convertFn"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
const props = defineProps<{
  from: string  // json | csv | tsv | html | markdown | sql
  to: string    // json | csv | tsv | html | markdown | sql
}>()

const sample = props.from === 'json'
  ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
  : props.from === 'csv'
  ? 'name,age\nAlice,30\nBob,25'
  : 'name,age\nAlice,30\nBob,25'

type Row = Record<string, string>

function convertFn(input: string): string {
  try {
    // Step 1: 解析输入为行数据
    let headers: string[] = []
    let rows: Row[] = []

    switch (props.from) {
      case 'json':
        ({ headers, rows } = parseJsonTable(input))
        break
      case 'csv':
        ({ headers, rows } = parseDelimited(input, ','))
        break
      case 'tsv':
        ({ headers, rows } = parseDelimited(input, '\t'))
        break
      case 'markdown':
        ({ headers, rows } = parseMarkdownTable(input))
        break
      case 'html':
        ({ headers, rows } = parseHtmlTable(input))
        break
      case 'sql':
        ({ headers, rows } = parseSqlTable(input))
        break
    }

    // Step 2: 输出为目标格式
    switch (props.to) {
      case 'json': return toJsonTable(headers, rows)
      case 'csv': return toDelimited(headers, rows, ',')
      case 'tsv': return toDelimited(headers, rows, '\t')
      case 'markdown': return toMarkdownTable(headers, rows)
      case 'html': return toHtmlTable(headers, rows)
      case 'sql': return toSqlTable(headers, rows)
      default: return 'Error: 不支持的格式'
    }
  } catch (err) {
    return `❌ ${(err as Error).message}`
  }
}

function parseJsonTable(input: string): { headers: string[]; rows: Row[] } {
  const data = JSON.parse(input)
  const arr = Array.isArray(data) ? data : [data]
  const headers = arr.length > 0 ? Object.keys(arr[0]) : []
  const rows = arr.map((r: Record<string, unknown>) => {
    const row: Row = {}
    headers.forEach((h) => { row[h] = String(r[h] ?? '') })
    return row
  })
  return { headers, rows }
}

function parseDelimited(input: string, delimiter: string): { headers: string[]; rows: Row[] } {
  const lines = input.trim().split('\n').filter((l) => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].split(delimiter).map((h) => h.trim())
  const rows = lines.slice(1).map((line) => {
    const values = line.split(delimiter)
    const row: Row = {}
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim() })
    return row
  })
  return { headers, rows }
}

function parseMarkdownTable(input: string): { headers: string[]; rows: Row[] } {
  const lines = input.trim().split('\n').filter((l) => l.includes('|'))
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split('|').map((h) => h.trim()).filter(Boolean)
  const rows = lines.slice(2).map((line) => {
    const values = line.split('|').map((v) => v.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1 || true).filter(Boolean)
    const row: Row = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  })
  return { headers, rows }
}

function parseHtmlTable(input: string): { headers: string[]; rows: Row[] } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'text/html')
  const table = doc.querySelector('table')
  if (!table) return { headers: [], rows: [] }
  const headerCells = table.querySelectorAll('thead th, tr:first-child th, tr:first-child td')
  const headers = Array.from(headerCells).map((c) => c.textContent || '')
  const bodyRows = table.querySelectorAll('tbody tr, tr')
  const rows: Row[] = []
  bodyRows.forEach((tr, idx) => {
    if (idx === 0 && headerCells.length > 0) return
    const cells = tr.querySelectorAll('td')
    if (cells.length === 0) return
    const row: Row = {}
    headers.forEach((h, i) => { row[h] = cells[i]?.textContent || '' })
    rows.push(row)
  })
  return { headers, rows }
}

function parseSqlTable(input: string): { headers: string[]; rows: Row[] } {
  // 解析 INSERT INTO 语句
  const valuesMatch = input.match(/VALUES\s*(.+);?/is)
  const columnsMatch = input.match(/\(([^)]+)\)/)
  const headers = columnsMatch ? columnsMatch[1].split(',').map((h) => h.trim().replace(/['"`]/g, '')) : []
  const rows: Row[] = []
  if (valuesMatch) {
    const valuesStr = valuesMatch[1]
    const tupleRegex = /\(([^)]+)\)/g
    let match
    while ((match = tupleRegex.exec(valuesStr)) !== null) {
      const values = match[1].split(',').map((v) => v.trim().replace(/'/g, ''))
      const row: Row = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })
      rows.push(row)
    }
  }
  return { headers, rows }
}

function toJsonTable(headers: string[], rows: Row[]): string {
  return JSON.stringify(rows, null, 2)
}

function toDelimited(headers: string[], rows: Row[], delimiter: string): string {
  const lines = [headers.join(delimiter)]
  for (const row of rows) {
    lines.push(headers.map((h) => row[h] || '').join(delimiter))
  }
  return lines.join('\n')
}

function toMarkdownTable(headers: string[], rows: Row[]): string {
  const lines = [`| ${headers.join(' | ')} |`]
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`)
  for (const row of rows) {
    lines.push(`| ${headers.map((h) => row[h] || '').join(' | ')} |`)
  }
  return lines.join('\n')
}

function toHtmlTable(headers: string[], rows: Row[]): string {
  let html = '<table>\n  <thead>\n    <tr>'
  html += headers.map((h) => `<th>${h}</th>`).join('') + '</tr>\n  </thead>\n  <tbody>\n'
  for (const row of rows) {
    html += `    <tr>${headers.map((h) => `<td>${row[h] || ''}</td>`).join('')}</tr>\n`
  }
  html += '  </tbody>\n</table>'
  return html
}

function toSqlTable(headers: string[], rows: Row[]): string {
  if (rows.length === 0) return '-- 无数据'
  const tableName = 'my_table'
  const lines = [`INSERT INTO ${tableName} (${headers.join(', ')}) VALUES`]
  const values = rows.map((row) =>
    `  (${headers.map((h) => `'${row[h] || ''}'`).join(', ')})`
  )
  lines.push(values.join(',\n') + ';')
  return lines.join('\n')
}
</script>
