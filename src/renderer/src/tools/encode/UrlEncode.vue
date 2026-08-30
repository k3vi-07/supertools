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
      </div>
      <h-text-transform
        :sample-data="sample"
        :enable-reverse="true"
        :transform="encodeFn"
        :reverse-transform="decodeFn"
        :refresh-key="mode"
        forward-label="编码"
        reverse-label="解码"
        forward-input-title="原始 URL"
        forward-output-title="编码结果"
        reverse-input-title="编码 URL"
        reverse-output-title="解码结果"
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
