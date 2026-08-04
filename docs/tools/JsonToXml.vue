<!--
  SuperTools 远程工具示例：JSON 转 XML

  远程工具与本地工具完全一样的编写方式：
  - 使用 <template> + <script setup> + <style>
  - 可以使用所有 h- 前缀的全局组件（h-transform, h-single-layout 等）
  - 可以访问 window.$he3 API
  - 自动享受懒加载、搜索注册等特性
-->
<template>
  <h-single-layout>
    <h-transform
      left-title="JSON 输入"
      right-title="XML 输出"
      input-lang="json"
      output-lang="xml"
      :sample-data="sample"
      :input-handler="convertFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const sample = `{
  "name": "SuperTools",
  "version": "1.0.0",
  "isOpenSource": true,
  "features": ["搜索", "剪贴板识别"],
  "author": {
    "name": "社区",
    "email": "dev@example.com"
  }
}`

function convertFn(input: string): string {
  try {
    const data = JSON.parse(input)
    return jsonToXml(data, 'root')
  } catch (err) {
    return `❌ ${(err as Error).message}`
  }
}

function jsonToXml(data: unknown, tagName: string, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (data === null || data === undefined) return `${pad}<${tagName}></${tagName}>`
  if (typeof data !== 'object') return `${pad}<${tagName}>${escapeXml(String(data))}</${tagName}>`
  if (Array.isArray(data)) {
    return data.map((item) => jsonToXml(item, tagName.replace(/s$/, ''), indent)).join('\n')
  }
  const entries = Object.entries(data as Record<string, unknown>)
  const inner = entries.map(([key, val]) => jsonToXml(val, key, indent + 1)).join('\n')
  return `${pad}<${tagName}>\n${inner}\n${pad}</${tagName}>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
</script>
