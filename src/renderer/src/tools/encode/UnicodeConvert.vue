<template>
  <h-single-layout>
    <div class="unicode-convert">
      <div class="unicode-convert__options">
        <label class="unicode-convert__check">
          <input type="checkbox" v-model="addU" /> \u 前缀
        </label>
      </div>
      <h-text-transform
        :sample-data="sample"
        :enable-reverse="true"
        :transform="toUnicode"
        :reverse-transform="toChinese"
        :auto-fill-input-condition="likeUnicode"
        :refresh-key="addU"
        forward-label="文本 → Unicode"
        reverse-label="Unicode → 文本"
        forward-input-title="文本"
        forward-output-title="Unicode 转义"
        reverse-input-title="Unicode 转义"
        reverse-output-title="文本"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { textToUnicodeEscapes, unicodeEscapesToText } from '../../utils/encodingTransforms'

const addU = ref(true)
const sample = '你好世界 SuperTools'

function toUnicode(input: string): string {
  return textToUnicodeEscapes(input, addU.value)
}

function toChinese(input: string): string {
  return unicodeEscapesToText(input)
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
