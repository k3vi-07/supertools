<template>
  <h-single-layout>
    <h-text-transform
      sample-data="Hello SuperTools!"
      :enable-reverse="true"
      :transform="encodeFn"
      :reverse-transform="decodeFn"
      forward-label="编码"
      reverse-label="解码"
      forward-input-title="原始文本"
      forward-output-title="Base58"
      reverse-input-title="Base58"
      reverse-output-title="解码文本"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
import { encodeBase58, decodeBase58 } from '../../utils/encodingTransforms'
const encodeFn = encodeBase58
const decodeFn = decodeBase58
</script>
