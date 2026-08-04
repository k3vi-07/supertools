<template>
  <h-single-layout>
    <h-transform
      left-title="输入"
      right-title="格式化结果"
      :sample-data="sample"
      :input-handler="formatFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const props = defineProps<{ type: string }>()

const samples: Record<string, string> = {
  sql: 'SELECT * FROM users WHERE age > 18 ORDER BY name;',
  js: 'var x=1;function f(){return x+2;}',
  css: '.a{color:red;margin:0;padding:10px}',
  html: '<div><p>Hello</p></div>',
  xml: '<root><item>test</item></root>'
}
const sample = samples[props.type] || ''

function formatFn(input: string): string {
  try {
    switch (props.type) {
      case 'sql': return formatSql(input)
      case 'js': return formatJs(input)
      case 'css': return formatCss(input)
      case 'html': return formatHtml(input)
      case 'xml': return formatXml(input)
      default: return input
    }
  } catch (err) {
    return `❌ ${(err as Error).message}`
  }
}

function formatSql(sql: string): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX']
  let result = sql.trim()
  for (const kw of keywords) {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '\n' + kw)
  }
  return result.replace(/^\n/, '').replace(/,\s*/g, ',\n  ').trim()
}

function formatJs(js: string): string {
  return js
    .replace(/;/g, ';\n')
    .replace(/\{/g, '{\n')
    .replace(/\}/g, '\n}\n')
    .replace(/\}(?!\n)/g, '}\n')
    .split('\n').map((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('}') || trimmed === '}') return trimmed
      return trimmed ? '  ' + trimmed : ''
    }).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function formatCss(css: string): string {
  return css
    .replace(/\}/g, '}\n')
    .replace(/\{/g, ' {\n  ')
    .replace(/;/g, ';\n  ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/  \n/g, '\n')
    .trim()
}

function formatHtml(html: string): string {
  return html
    .replace(/></g, '>\n<')
    .split('\n').map((line) => {
      const depth = (line.match(/</g) || []).length - (line.match(/\//g) || []).length
      return line
    }).join('\n')
}

function formatXml(xml: string): string {
  return xml
    .replace(/></g, '>\n<')
    .split('\n').map((line, i, arr) => {
      const opens = arr.slice(0, i).reduce((d, l) => d + (l.includes('<') && !l.includes('</') && !l.includes('/>') ? 1 : 0), 0)
      const closes = arr.slice(0, i).reduce((d, l) => d + (l.includes('</') ? 1 : 0), 0)
      return '  '.repeat(Math.max(0, opens - closes)) + line.trim()
    }).join('\n')
}
</script>
