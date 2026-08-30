<template>
  <h-single-layout>
    <div class="morse-code">
      <h-text-transform
        :sample-data="sample"
        :enable-reverse="true"
        :transform="toMorse"
        :reverse-transform="toText"
        :auto-fill-input-condition="likeMorse"
        forward-label="文本 → 摩斯"
        reverse-label="摩斯 → 文本"
        forward-input-title="文本"
        forward-output-title="摩斯码"
        reverse-input-title="摩斯码"
        reverse-output-title="文本"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
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
  return input.toUpperCase().split('').map((char) => {
    const code = MORSE_MAP[char]
    if (!code) throw new Error(`不支持的字符：${char}`)
    return code
  }).join(' ')
}

function toText(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((code) => {
      const char = REVERSE_MAP[code]
      if (!char) throw new Error(`无效的摩斯码：${code}`)
      return char
    })
    .join('')
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

}
</style>
