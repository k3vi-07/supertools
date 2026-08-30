<template>
  <h-single-layout>
    <h-text-transform
      :sample-data="sample"
      :enable-reverse="true"
      :transform="encodeFn"
      :reverse-transform="decodeFn"
      forward-label="编码"
      reverse-label="解码"
      forward-input-title="原始文本"
      forward-output-title="Base32"
      reverse-input-title="Base32"
      reverse-output-title="解码文本"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
import { encodeBase32, decodeBase32 } from '../../utils/encodingTransforms'

const sample = 'Hello SuperTools!'
const encodeFn = encodeBase32
const decodeFn = decodeBase32
</script>
