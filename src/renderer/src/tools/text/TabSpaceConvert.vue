<template>
  <h-single-layout>
    <div class="tab-space">
      <div class="tab-space__options">
        <h-radio
          v-model="direction"
          :options="[
            { label: 'Tab → 空格', value: 'toSpace' },
            { label: '空格 → Tab', value: 'toTab' }
          ]"
          size="small"
        />
        <label class="tab-space__label">空格数: {{ tabSize }}</label>
        <input type="range" v-model.number="tabSize" min="1" max="8" class="tab-space__slider" />
      </div>
      <h-text-transform sample-data="	if (true) {\n		return 'hello';\n	}" :transform="convertFn" :refresh-key="[direction, tabSize]" />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const direction = ref<'toSpace' | 'toTab'>('toSpace')
const tabSize = ref(4)

function convertFn(input: string): string {
  if (direction.value === 'toSpace') {
    const spaces = ' '.repeat(tabSize.value)
    return input.replace(/\t/g, spaces)
  } else {
    const regex = new RegExp(' '.repeat(tabSize.value), 'g')
    return input.replace(regex, '\t')
  }
}
</script>

<style scoped lang="less">
.tab-space {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__slider {
    accent-color: var(--color-primary);
    width: 120px;
  }
}
</style>
