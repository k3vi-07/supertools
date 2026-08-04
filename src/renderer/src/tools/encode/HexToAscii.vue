<template>
  <h-single-layout>
    <div class="hex-ascii">
      <div class="hex-ascii__options">
        <h-radio
          v-model="direction"
          :options="[
            { label: '文本 → Hex', value: 'toHex' },
            { label: 'Hex → 文本', value: 'toAscii' }
          ]"
          size="small"
        />
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
        :transform="convertFn"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const direction = ref<'toHex' | 'toAscii'>('toHex')
const addSpace = ref(true)
const upperCase = ref(true)
const addPrefix = ref(false)
const sample = 'Hello'

function toHex(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let result = Array.from(bytes).map((b) => {
    let hex = b.toString(16)
    if (upperCase.value) hex = hex.toUpperCase()
    if (hex.length === 1) hex = '0' + hex
    return addPrefix.value ? '0x' + hex : hex
  })
  return result.join(addSpace.value ? ' ' : '')
}

function toAscii(input: string): string {
  const cleaned = input.trim().replace(/0x/gi, '').replace(/\s+/g, '')
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16)
  }
  return new TextDecoder().decode(bytes)
}

function convertFn(input: string): string {
  try {
    return direction.value === 'toHex' ? toHex(input) : toAscii(input)
  } catch {
    return 'Error: 转换失败'
  }
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
