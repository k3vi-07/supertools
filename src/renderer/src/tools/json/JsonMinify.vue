<template>
  <h-single-layout>
    <h-transform
      left-title="JSON 输入"
      right-title="压缩结果"
      input-lang="json"
      output-lang="json"
      :sample-data="sample"
      :input-handler="minifyFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const sample = `{
  "name": "SuperTools",
  "version": "1.0.0",
  "features": ["搜索", "剪贴板识别"]
}`

function minifyFn(input: string): string {
  try {
    const parsed = JSON.parse(input)
    return JSON.stringify(parsed)
  } catch (err) {
    return `❌ JSON 格式错误: ${(err as Error).message}`
  }
}
</script>
