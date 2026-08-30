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
      forward-output-title="Base62"
      reverse-input-title="Base62"
      reverse-output-title="解码文本"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
import { encodeBase62, decodeBase62 } from '../../utils/encodingTransforms'
const encodeFn = encodeBase62
const decodeFn = decodeBase62
</script>
