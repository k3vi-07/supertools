<template>
  <h-single-layout>
    <h-text-transform
      :sample-data="sample"
      :enable-reverse="true"
      :transform="encodeFn"
      :reverse-transform="decodeFn"
      :auto-fill-input-condition="isBase64Like"
      forward-label="编码"
      reverse-label="解码"
      forward-input-title="原始文本"
      forward-output-title="Base64"
      reverse-input-title="Base64"
      reverse-output-title="解码文本"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
import { encodeBase64, decodeBase64 } from '../../utils/encodingTransforms'

const sample = 'Hello SuperTools! 你好世界！'

const encodeFn = encodeBase64
const decodeFn = decodeBase64

function isBase64Like(str: string): boolean {
  const trimmed = str.trim()
  if (trimmed.length < 8) return false
  return /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0
}
</script>
