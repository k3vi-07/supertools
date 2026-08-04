<template>
  <h-single-layout>
    <h-text-transform
      :sample-data="sample"
      :enable-reverse="true"
      :transform="encodeFn"
      :reverse-transform="decodeFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const sample = 'Hello SuperTools!'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function encodeFn(input: string): string {
  try {
    const bytes = new TextEncoder().encode(input)
    let bits = 0
    let value = 0
    let output = ''

    for (const byte of bytes) {
      value = (value << 8) | byte
      bits += 8
      while (bits >= 5) {
        output += ALPHABET[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }
    if (bits > 0) {
      output += ALPHABET[(value << (5 - bits)) & 31]
    }
    while (output.length % 8 !== 0) {
      output += '='
    }
    return output
  } catch {
    return 'Error: 编码失败'
  }
}

function decodeFn(input: string): string {
  try {
    const cleaned = input.trim().replace(/=+$/, '').toUpperCase()
    let bits = 0
    let value = 0
    const bytes: number[] = []

    for (const char of cleaned) {
      const index = ALPHABET.indexOf(char)
      if (index === -1) continue
      value = (value << 5) | index
      bits += 5
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255)
        bits -= 8
      }
    }
    return new TextDecoder().decode(new Uint8Array(bytes))
  } catch {
    return 'Error: 无效的 Base32'
  }
}
</script>
