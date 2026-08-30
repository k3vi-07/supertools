<template>
  <h-single-layout>
    <div class="punycode">
      <h-text-transform
        sample-data="中文.com"
        :enable-reverse="true"
        :transform="encodeDomain"
        :reverse-transform="decodeDomain"
        :auto-fill-input-condition="isPunycodeDomain"
        forward-label="域名 → Punycode"
        reverse-label="Punycode → 域名"
        forward-input-title="Unicode 域名"
        forward-output-title="Punycode 域名"
        reverse-input-title="Punycode 域名"
        reverse-output-title="Unicode 域名"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { encodeDomain, decodeDomain } from '../../utils/punycode'

function isPunycodeDomain(input: string): boolean {
  return input.split('.').some((label) => label.toLowerCase().startsWith('xn--'))
}
</script>

<style scoped lang="less">
.punycode {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
