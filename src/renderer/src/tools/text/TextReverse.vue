<template>
  <h-single-layout>
    <div class="text-reverse">
      <div class="text-reverse__options">
        <h-radio
          v-model="mode"
          :options="[
            { label: '整体反转', value: 'all' },
            { label: '逐行反转', value: 'line' },
            { label: '逐词反转', value: 'word' }
          ]"
          size="small"
        />
      </div>
      <h-text-transform sample-data="Hello World 你好世界" :transform="reverseFn" />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'all' | 'line' | 'word'>('all')

function reverseFn(input: string): string {
  switch (mode.value) {
    case 'all':
      return Array.from(input).reverse().join('')
    case 'line':
      return input.split('\n').map((l) => Array.from(l).reverse().join('')).join('\n')
    case 'word':
      return input.split('\n').map((line) =>
        line.split(' ').reverse().join(' ')
      ).join('\n')
  }
}
</script>

<style scoped lang="less">
.text-reverse {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
