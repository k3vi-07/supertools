<template>
  <h-single-layout>
    <div class="morse-code">
      <div class="morse-code__options">
        <h-radio
          v-model="direction"
          :options="[
            { label: '文本 → 摩斯', value: 'toMorse' },
            { label: '摩斯 → 文本', value: 'toText' }
          ]"
          size="small"
        />
      </div>
      <h-text-transform
        :sample-data="sample"
        :transform="convertFn"
        :auto-fill-input-condition="likeMorse"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const direction = ref<'toMorse' | 'toText'>('toMorse')
const sample = 'HELLO WORLD'

const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '@': '.--.-.', ' ': '/'
}

const REVERSE_MAP: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [key, val]) => {
    acc[val] = key
    return acc
  },
  {} as Record<string, string>
)

function toMorse(input: string): string {
  return input
    .toUpperCase()
    .split('')
    .map((char) => MORSE_MAP[char] || '')
    .filter(Boolean)
    .join(' ')
}

function toText(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((code) => REVERSE_MAP[code] || '')
    .join('')
}

function convertFn(input: string): string {
  try {
    return direction.value === 'toMorse' ? toMorse(input) : toText(input)
  } catch {
    return 'Error: 转换失败'
  }
}

function likeMorse(str: string): boolean {
  return /^[\.\-\s/]+$/.test(str) && str.includes('.') && str.includes('-')
}
</script>

<style scoped lang="less">
.morse-code {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}
</style>
