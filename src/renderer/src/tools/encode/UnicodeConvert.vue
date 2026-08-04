<template>
  <h-single-layout>
    <div class="unicode-convert">
      <div class="unicode-convert__options">
        <h-radio
          v-model="direction"
          :options="[
            { label: '中文 → Unicode', value: 'toUnicode' },
            { label: 'Unicode → 中文', value: 'toChinese' }
          ]"
          size="small"
        />
        <label class="unicode-convert__check">
          <input type="checkbox" v-model="addU" /> \u 前缀
        </label>
      </div>
      <h-text-transform
        :sample-data="sample"
        :transform="convertFn"
        :auto-fill-input-condition="likeUnicode"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const direction = ref<'toUnicode' | 'toChinese'>('toUnicode')
const addU = ref(true)
const sample = '你好世界 SuperTools'

function toUnicode(input: string): string {
  let result = ''
  for (const char of input) {
    const code = char.codePointAt(0)!
    if (code > 127) {
      const hex = code.toString(16).padStart(4, '0')
      result += addU.value ? '\\u' + hex : hex
    } else {
      result += char
    }
  }
  return result
}

function toChinese(input: string): string {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  }).replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16))
  })
}

function convertFn(input: string): string {
  try {
    return direction.value === 'toUnicode' ? toUnicode(input) : toChinese(input)
  } catch {
    return 'Error: 转换失败'
  }
}

function likeUnicode(str: string): boolean {
  return str.split('\\u').length >= 3 || /&#x[0-9a-fA-F]+;/.test(str)
}
</script>

<style scoped lang="less">
.unicode-convert {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
  }
}
</style>
