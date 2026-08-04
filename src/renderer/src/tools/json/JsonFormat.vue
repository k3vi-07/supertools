<template>
  <h-single-layout>
    <div class="json-format__options">
      <label class="json-format__label">缩进</label>
      <h-radio
        v-model="indent"
        :options="[
          { label: '2 空格', value: 2 },
          { label: '4 空格', value: 4 },
          { label: 'Tab', value: 0 }
        ]"
        size="small"
      />
    </div>
    <h-transform
      left-title="JSON 输入"
      right-title="格式化结果"
      input-lang="json"
      output-lang="json"
      :sample-data="sample"
      :input-handler="formatFn"
      :auto-fill-input-condition="isJson"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const indent = ref(2)
const sample = '{"name":"SuperTools","version":"1.0.0","tools":["encode","json","crypto"]}'

function formatFn(input: string): string {
  try {
    const parsed = JSON.parse(input)
    const indentStr = indent.value === 0 ? '\t' : indent.value
    return JSON.stringify(parsed, null, indentStr)
  } catch (err) {
    return `❌ JSON 格式错误: ${(err as Error).message}`
  }
}

function isJson(str: string): boolean {
  try {
    JSON.parse(str)
    return str.includes('{') || str.includes('[')
  } catch {
    return false
  }
}
</script>

<style scoped lang="less">
.json-format__options {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.json-format__label {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
