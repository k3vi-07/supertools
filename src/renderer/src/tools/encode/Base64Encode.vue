<template>
  <h-single-layout>
    <h-text-transform
      :sample-data="sample"
      :enable-reverse="true"
      :transform="encodeFn"
      :reverse-transform="decodeFn"
      :auto-fill-input-condition="isBase64Like"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const sample = 'Hello SuperTools! 你好世界！'

function encodeFn(input: string): string {
  try {
    // 处理 Unicode 字符
    const bytes = new TextEncoder().encode(input)
    let binary = ''
    bytes.forEach((b) => {
      binary += String.fromCharCode(b)
    })
    return btoa(binary)
  } catch {
    return 'Error: 编码失败'
  }
}

function decodeFn(input: string): string {
  try {
    const binary = atob(input.trim())
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  } catch {
    return 'Error: 无效的 Base64'
  }
}

function isBase64Like(str: string): boolean {
  const trimmed = str.trim()
  if (trimmed.length < 8) return false
  return /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0
}
</script>
