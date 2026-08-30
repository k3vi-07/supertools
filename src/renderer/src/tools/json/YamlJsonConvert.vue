<template>
  <h-single-layout>
    <div class="yaml-json">
      <h-text-transform
        :sample-data="yamlSample"
        :enable-reverse="true"
        :transform="yamlToJson"
        :reverse-transform="jsonToYaml"
        forward-label="YAML → JSON"
        reverse-label="JSON → YAML"
        forward-input-title="YAML"
        forward-output-title="JSON"
        reverse-input-title="JSON"
        reverse-output-title="YAML"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
const yamlSample = `name: SuperTools
version: 1.0.0
isOpenSource: true
features:
  - 搜索
  - 剪贴板识别
  - 个性化主页
author:
  name: Dev
  email: dev@example.com`

/** 简易 YAML → JSON 转换器（支持基本缩进结构） */
function yamlToJson(yaml: string): string {
  const lines = yaml.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'))
  const result = parseYamlLines(lines, 0, 0).value
  return JSON.stringify(result, null, 2)
}

function parseYamlLines(lines: string[], startIdx: number, expectedIndent: number): { value: unknown; nextIdx: number } {
  if (startIdx >= lines.length) return { value: null, nextIdx: startIdx }

  const firstLine = lines[startIdx]
  const firstIndent = getIndent(firstLine)

  // 检测是否是数组
  if (firstLine.trim().startsWith('- ')) {
    const arr: unknown[] = []
    let i = startIdx
    while (i < lines.length) {
      const line = lines[i]
      if (getIndent(line) < firstIndent) break
      if (getIndent(line) === firstIndent && line.trim().startsWith('- ')) {
        const val = line.trim().slice(2).trim()
        if (val.includes(':')) {
          // 嵌套对象
          const sub = parseYamlLines(
            [line.replace('- ', '  '.repeat(firstIndent / 2 + 1)), ...lines.slice(i + 1)],
            0,
            firstIndent + 2
          )
          arr.push(sub.value)
          i = sub.nextIdx > 0 ? i + sub.nextIdx : i + 1
        } else {
          arr.push(parseScalar(val))
          i++
        }
      } else if (getIndent(line) > firstIndent) {
        i++
      } else {
        break
      }
    }
    return { value: arr, nextIdx: i }
  }

  // 对象
  const obj: Record<string, unknown> = {}
  let i = startIdx
  while (i < lines.length) {
    const line = lines[i]
    const indent = getIndent(line)
    if (indent < firstIndent) break
    if (indent === firstIndent) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) { i++; continue }
      const key = line.slice(indent, colonIdx).trim()
      const val = line.slice(colonIdx + 1).trim()
      if (val === '') {
        // 嵌套结构
        const sub = parseYamlLines(lines, i + 1, indent + 2)
        obj[key] = sub.value
        i = sub.nextIdx
      } else {
        obj[key] = parseScalar(val)
        i++
      }
    } else {
      i++
    }
  }
  return { value: obj, nextIdx: i }
}

function getIndent(line: string): number {
  return line.length - line.trimStart().length
}

function parseScalar(val: string): unknown {
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null' || val === '~') return null
  if (/^-?\d+$/.test(val)) return parseInt(val, 10)
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val)
  // 去除引号
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  return val
}

/** JSON → YAML */
function jsonToYaml(json: string): string {
  const data = JSON.parse(json)
  return toYaml(data, 0)
}

function toYaml(data: unknown, indent: number): string {
  const pad = '  '.repeat(indent)
  if (data === null) return 'null'
  if (typeof data !== 'object') return String(data)
  if (Array.isArray(data)) {
    if (data.length === 0) return '[]'
    return data.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const nested = toYaml(item, indent + 1)
        return `${pad}- ${nested.trimStart()}`
      }
      return `${pad}- ${String(item)}`
    }).join('\n')
  }
  const entries = Object.entries(data)
  if (entries.length === 0) return '{}'
  return entries.map(([key, val]) => {
    if (val === null) return `${pad}${key}: null`
    if (typeof val === 'object' && val !== null) {
      const nested = toYaml(val, indent + 1)
      if (Array.isArray(val)) {
        return `${pad}${key}:\n${nested}`
      }
      return `${pad}${key}:\n${nested}`
    }
    if (typeof val === 'string' && (val.includes(':') || val.includes('#') || val.includes('{'))) {
      return `${pad}${key}: "${val}"`
    }
    return `${pad}${key}: ${String(val)}`
  }).join('\n')
}

</script>

<style scoped lang="less">
.yaml-json {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
