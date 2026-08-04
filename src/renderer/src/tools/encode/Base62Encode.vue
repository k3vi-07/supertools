<template>
  <h-single-layout>
    <h-text-transform
      sample-data="Hello SuperTools!"
      :enable-reverse="true"
      :transform="encodeFn"
      :reverse-transform="decodeFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const BASE = BigInt(62)

function encodeFn(input: string): string {
  try {
    const bytes = new TextEncoder().encode(input)
    if (bytes.length === 0) return ''
    let num = BigInt(0)
    for (const b of bytes) {
      num = (num << BigInt(8)) | BigInt(b)
    }
    let encoded = ''
    while (num > 0) {
      encoded = CHARSET[Number(num % BASE)] + encoded
      num = num / BASE
    }
    return encoded
  } catch {
    return 'Error: 编码失败'
  }
}

function decodeFn(input: string): string {
  try {
    let num = BigInt(0)
    for (const char of input) {
      const index = CHARSET.indexOf(char)
      if (index === -1) return 'Error: 无效的 Base62 字符'
      num = num * BASE + BigInt(index)
    }
    const bytes: number[] = []
    while (num > 0) {
      bytes.unshift(Number(num & BigInt(255)))
      num = num >> BigInt(8)
    }
    return new TextDecoder().decode(new Uint8Array(bytes))
  } catch {
    return 'Error: 解码失败'
  }
}
</script>
