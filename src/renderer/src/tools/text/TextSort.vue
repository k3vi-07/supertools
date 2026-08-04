<template>
  <h-single-layout>
    <div class="text-sort">
      <div class="text-sort__options">
        <h-radio
          v-model="order"
          :options="[
            { label: '升序 A→Z', value: 'asc' },
            { label: '降序 Z→A', value: 'desc' },
            { label: '随机', value: 'random' }
          ]"
          size="small"
        />
        <h-checkbox v-model="caseSensitive" label="区分大小写" />
        <h-checkbox v-model="numericSort" label="数字排序" />
      </div>
      <h-text-transform :sample-data="sample" :transform="sortFn" />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const order = ref<'asc' | 'desc' | 'random'>('asc')
const caseSensitive = ref(false)
const numericSort = ref(false)
const sample = 'banana\n10\napple\n2\ncherry\n1'

function sortFn(input: string): string {
  let lines = input.split('\n').filter((l) => l !== '')

  if (order.value === 'random') {
    // Fisher-Yates 洗牌
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[lines[i], lines[j]] = [lines[j], lines[i]]
    }
    return lines.join('\n')
  }

  lines.sort((a, b) => {
    let cmpA = a, cmpB = b
    if (!caseSensitive.value) {
      cmpA = a.toLowerCase()
      cmpB = b.toLowerCase()
    }
    if (numericSort.value) {
      const numA = parseFloat(cmpA)
      const numB = parseFloat(cmpB)
      if (!isNaN(numA) && !isNaN(numB)) {
        return order.value === 'asc' ? numA - numB : numB - numA
      }
    }
    if (cmpA < cmpB) return order.value === 'asc' ? -1 : 1
    if (cmpA > cmpB) return order.value === 'asc' ? 1 : -1
    return 0
  })

  return lines.join('\n')
}
</script>

<style scoped lang="less">
.text-sort {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
}
</style>
