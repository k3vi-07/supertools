<template>
  <h-single-layout>
    <div class="html-encode">
      <div class="html-encode__options">
        <h-radio
          v-model="mode"
          :options="[
            { label: '全部实体', value: 'all' },
            { label: '仅特殊字符', value: 'special' }
          ]"
          size="small"
        />
      </div>
      <h-text-transform
        :sample-data="sample"
        :enable-reverse="true"
        :transform="encodeFn"
        :reverse-transform="decodeFn"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'all' | 'special'>('special')
const sample = '<div class="hello">Hello & Welcome</div>'

const ALL_MAP: Record<string, string> = {}
const SPECIAL_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

// 构建全部实体映射
for (let i = 0; i < 128; i++) {
  ALL_MAP[String.fromCharCode(i)] = `&#${i};`
}

function encodeFn(input: string): string {
  const map = mode.value === 'all' ? ALL_MAP : SPECIAL_MAP
  return input.replace(/[&<>"']/g, (char) => {
    if (mode.value === 'all') {
      return ALL_MAP[char] || char
    }
    return SPECIAL_MAP[char] || char
  }).replace(mode.value === 'all' ? /[\x00-\x7F]/g : /(?!.)/g, (char) => {
    return map[char] || char
  })
}

function decodeFn(input: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = input
  return textarea.value
}
</script>

<style scoped lang="less">
.html-encode {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
