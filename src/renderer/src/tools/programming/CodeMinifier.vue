<template>
  <h-single-layout>
    <h-transform
      left-title="输入"
      right-title="压缩结果"
      :sample-data="sample"
      :input-handler="minifyFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const props = defineProps<{ type: string }>()

const samples: Record<string, string> = {
  js: 'function add(a, b) {\n  // 加法\n  return a + b;\n}',
  css: '.btn {\n  color: red;\n  /* 按钮 */\n  padding: 10px;\n}',
  html: '<div>\n  <p>Hello</p>\n</div>',
  xml: '<root>\n  <item>test</item>\n</root>',
  sql: 'SELECT *\nFROM users\nWHERE age > 18;'
}
const sample = samples[props.type] || ''

function minifyFn(input: string): string {
  switch (props.type) {
    case 'js':
      return input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n/g, '').replace(/\s+/g, ' ').replace(/\s*([;{}()=,])\s*/g, '$1').trim()
    case 'css':
      return input.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim()
    case 'html':
      return input.replace(/<!--[\s\S]*?-->/g, '').replace(/\n/g, '')
        .replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
    case 'xml':
      return input.replace(/<!--[\s\S]*?-->/g, '').replace(/\n/g, '')
        .replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
    case 'sql':
      return input.replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim()
    default:
      return input
  }
}
</script>
