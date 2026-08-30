<template>
  <h-single-layout>
    <div class="hex-ascii">
      <div class="hex-ascii__options">
        <label class="hex-ascii__check">
          <input type="checkbox" v-model="addSpace" /> 添加空格
        </label>
        <label class="hex-ascii__check">
          <input type="checkbox" v-model="upperCase" /> 大写
        </label>
        <label class="hex-ascii__check">
          <input type="checkbox" v-model="addPrefix" /> 0x 前缀
        </label>
      </div>
      <h-text-transform
        :sample-data="sample"
        :enable-reverse="true"
        :transform="toHex"
        :reverse-transform="toAscii"
        :refresh-key="[addSpace, upperCase, addPrefix]"
        forward-label="文本 → Hex"
        reverse-label="Hex → 文本"
        forward-input-title="文本"
        forward-output-title="Hex"
        reverse-input-title="Hex"
        reverse-output-title="文本"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { textToHex, hexToText } from '../../utils/encodingTransforms'

const addSpace = ref(true)
const upperCase = ref(true)
const addPrefix = ref(false)
const sample = 'Hello'

function toHex(input: string): string {
  return textToHex(input, { spaced: addSpace.value, uppercase: upperCase.value, prefix: addPrefix.value })
}

function toAscii(input: string): string {
  return hexToText(input)
}
</script>

<style scoped lang="less">
.hex-ascii {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;

    input {
      cursor: pointer;
    }
  }
}
</style>
