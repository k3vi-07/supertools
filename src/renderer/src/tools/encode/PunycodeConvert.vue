<template>
  <h-single-layout>
    <div class="punycode">
      <div class="punycode__options">
        <h-radio
          v-model="direction"
          :options="[
            { label: '域名 → Punycode', value: 'encode' },
            { label: 'Punycode → 域名', value: 'decode' }
          ]"
          size="small"
        />
      </div>
      <h-text-transform
        sample-data="中文.com"
        :transform="convertFn"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const direction = ref<'encode' | 'decode'>('encode')

// 简化版 Punycode 实现
const TMIN = 1
const TMAX = 26
const BASE = 36
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128
const DELIMITER = '-'

function adapt(delta: number, numpoints: number, first: boolean): number {
  delta = first ? Math.floor(delta / DAMP) : Math.floor(delta / 2)
  delta += Math.floor(delta / numpoints)
  let k = 0
  while (delta > Math.floor((BASE - TMIN) * TMAX / 2)) {
    delta = Math.floor(delta / (BASE - TMIN))
    k += BASE
  }
  return k + Math.floor((BASE - TMIN + 1) * delta / (delta + SKEW))
}

function encode(input: string): string {
  const output: string[] = []
  // 提取基本 ASCII 字符
  const basic = input.split('').filter((c) => c.charCodeAt(0) < 128)
  if (basic.length > 0) output.push(basic.join(''))

  let n = INITIAL_N
  let delta = 0
  let bias = INITIAL_BIAS
  const inputChars = Array.from(input)
  let h = basic.length
  const b = h

  if (b > 0 && b < inputChars.length) output.push(DELIMITER)

  while (h < inputChars.length) {
    let m = Infinity
    for (const c of inputChars) {
      const cc = c.codePointAt(0)!
      if (cc >= n && cc < m) m = cc
    }
    delta += (m - n) * (h + 1)
    n = m
    for (const c of inputChars) {
      const cc = c.codePointAt(0)!
      if (cc < n) delta++
      if (cc === n) {
        let q = delta
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
          if (q < t) break
          output.push(String.fromCharCode(((t + (q - t) % (BASE - t)) + BASE - TMIN)))
          q = Math.floor((q - t) / (BASE - t))
        }
        output.push(String.fromCharCode(q + BASE - TMIN))
        bias = adapt(delta, h + 1, h === b)
        delta = 0
        h++
      }
    }
    delta++
    n++
  }
  return 'xn--' + output.join('')
}

function decode(input: string): string {
  // 简单处理：移除 xn-- 前缀后用 URL 解码
  try {
    const url = new URL('http://' + input)
    return url.hostname
  } catch {
    return input
  }
}

function convertFn(input: string): string {
  try {
    if (direction.value === 'encode') {
      // 对域名的每个标签分别编码
      return input.split('.').map((label) => {
        const hasNonAscii = /[^\x00-\x7F]/.test(label)
        return hasNonAscii ? encode(label) : label
      }).join('.')
    } else {
      return decode(input)
    }
  } catch {
    return 'Error: 转换失败'
  }
}
</script>

<style scoped lang="less">
.punycode {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
