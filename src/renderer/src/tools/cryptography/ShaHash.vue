<template>
  <h-single-layout>
    <div class="sha-hash">
      <div class="sha-hash__options">
        <label class="sha-hash__label">算法</label>
        <h-select
          v-model="algorithm"
          :options="[
            { label: 'SHA-1', value: 'SHA1' },
            { label: 'SHA-256', value: 'SHA256' },
            { label: 'SHA-384', value: 'SHA384' },
            { label: 'SHA-512', value: 'SHA512' },
            { label: 'SHA-3', value: 'SHA3' }
          ]"
        />
        <label class="sha-hash__check">
          <input type="checkbox" v-model="upperCase" /> 大写
        </label>
        <label class="sha-hash__check">
          <input type="checkbox" v-model="base64" /> Base64 输出
        </label>
      </div>
      <h-text-transform
        :sample-data="sample"
        :transform="hashFn"
        :refresh-key="[algorithm, upperCase, base64]"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

const algorithm = ref<'SHA1' | 'SHA256' | 'SHA384' | 'SHA512' | 'SHA3'>('SHA256')
const upperCase = ref(false)
const base64 = ref(false)
const sample = 'Hello SuperTools!'

function hashFn(input: string): string {
  try {
    const hash = CryptoJS[algorithm.value](input)
    let result: string
    if (base64.value) {
      result = hash.toString(CryptoJS.enc.Base64)
    } else {
      result = hash.toString()
      if (upperCase.value) result = result.toUpperCase()
    }
    return result
  } catch {
    return 'Error: 哈希计算失败'
  }
}
</script>

<style scoped lang="less">
.sha-hash {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
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
