<template>
  <h-single-layout>
    <h-transform
      left-title="输入"
      right-title="结果"
      :sample-data="sample"
      :input-handler="escapeFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const props = defineProps<{ type: string; mode: string }>() // mode: escape | unescape

const samples: Record<string, string> = {
  html: '<div class="test">Hello & "World"</div>',
  xml: '<root attr="value">Test & Data</root>',
  js: 'const str = "Hello\\nWorld";',
  java: 'String s = "Hello\\nWorld";',
  sql: "SELECT * FROM users WHERE name = 'O\\'Brien'",
  string: 'Hello\\n\\tWorld\\u0041'
}
const sample = samples[props.type] || ''

function escapeFn(input: string): string {
  if (props.mode === 'escape') return doEscape(input)
  return doUnescape(input)
}

function doEscape(input: string): string {
  switch (props.type) {
    case 'html':
      return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    case 'xml':
      return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
    case 'js':
    case 'java':
      return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'")
        .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    case 'sql':
      return input.replace(/'/g, "''")
    case 'string':
      return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t').replace(/\r/g, '\\r')
    default: return input
  }
}

function doUnescape(input: string): string {
  switch (props.type) {
    case 'html':
      const div = document.createElement('div')
      div.innerHTML = input
      return div.textContent || ''
    case 'xml':
      const div2 = document.createElement('div')
      div2.innerHTML = input.replace(/&apos;/g, '&#39;')
      return div2.textContent || ''
    case 'js':
    case 'java':
      return input.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
        .replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\')
    case 'sql':
      return input.replace(/''/g, "'")
    case 'string':
      return input.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"')
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\\\\/g, '\\')
    default: return input
  }
}
</script>
