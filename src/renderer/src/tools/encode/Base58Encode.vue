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
// Base58 字母表（Bitcoin 风格，去除了 0、O、I、l 等易混淆字符）
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE = BigInt(58)

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
      const rem = num % BASE
      num = num / BASE
      encoded = ALPHABET[Number(rem)] + encoded
    }
    // 处理前导零
    for (const b of bytes) {
      if (b === 0) encoded = ALPHABET[0] + encoded
      else break
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
      const index = ALPHABET.indexOf(char)
      if (index === -1) return 'Error: 无效的 Base58 字符'
      num = num * BASE + BigInt(index)
    }
    const bytes: number[] = []
    while (num > 0) {
      bytes.unshift(Number(num & BigInt(255)))
      num = num >> BigInt(8)
    }
    // 处理前导零
    for (const char of input) {
      if (char === ALPHABET[0]) bytes.unshift(0)
      else break
    }
    return new TextDecoder().decode(new Uint8Array(bytes))
  } catch {
    return 'Error: 解码失败'
  }
}
</script>
