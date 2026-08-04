<template>
  <h-single-layout>
    <div class="url-encode">
      <div class="url-encode__options">
        <h-radio
          v-model="mode"
          :options="[
            { label: 'URI', value: 'uri' },
            { label: 'URI Component', value: 'component' }
          ]"
          size="small"
        />
        <h-button size="small" icon="mdi:swap-horizontal" @click="swap">交换</h-button>
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

const mode = ref<'uri' | 'component'>('component')
const sample = 'https://supertools.app?name=超级工具&lang=zh'

function encodeFn(input: string): string {
  try {
    return mode.value === 'uri' ? encodeURI(input) : encodeURIComponent(input)
  } catch {
    return 'Error: 编码失败'
  }
}

function decodeFn(input: string): string {
  try {
    return mode.value === 'uri' ? decodeURI(input) : decodeURIComponent(input)
  } catch {
    return 'Error: 解码失败'
  }
}

function swap(): void {
  mode.value = mode.value === 'uri' ? 'component' : 'uri'
}
</script>

<style scoped lang="less">
.url-encode {
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
