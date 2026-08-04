<template>
  <h-single-layout>
    <h-transform
      left-title="JSON 输入"
      right-title="输出"
      input-lang="json"
      :sample-data="sample"
      :input-handler="convertFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

// 通过 props 接收目标语言
const props = defineProps<{
  language: string
}>()

const sample = `{
  "name": "SuperTools",
  "version": "1.0.0",
  "isOpenSource": true,
  "downloads": 10000,
  "tags": ["electron", "vue"],
  "author": {
    "name": "Dev",
    "email": "dev@example.com"
  }
}`

function convertFn(input: string): string {
  try {
    const data = JSON.parse(input)
    return convert(data, props.language)
  } catch (err) {
    return `❌ ${(err as Error).message}`
  }
}

function getType(val: unknown, lang: string): string {
  if (val === null) return langMap[lang]?.nullType || 'Null'
  if (Array.isArray(val)) {
    if (val.length === 0) return langMap[lang]?.anyArray || 'any[]'
    return `${getType(val[0], lang)}${langMap[lang]?.arraySuffix || '[]'}`
  }
  switch (typeof val) {
    case 'string': return langMap[lang]?.string || 'String'
    case 'number': return Number.isInteger(val) ? (langMap[lang]?.int || 'Int') : (langMap[lang]?.float || 'Float')
    case 'boolean': return langMap[lang]?.bool || 'Boolean'
    case 'object': return langMap[lang]?.object || 'Object'
    default: return langMap[lang]?.any || 'Any'
  }
}

interface LangConfig {
  string: string; int: string; float: string; bool: string; nullType: string; any: string
  anyArray: string; arraySuffix: string; object: string
  className: (key: string) => string
  indent: string
  format: (name: string, fields: [string, string][], indent: string) => string
}

const langMap: Record<string, LangConfig> = {
  'csharp': {
    string: 'string', int: 'int', float: 'double', bool: 'bool', nullType: 'object',
    any: 'object', anyArray: 'List<object>', arraySuffix: '[]', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `public class ${name}\n{\n${fields.map(([k, t]) => `${ind}public ${t} ${capitalize(k)} { get; set; }`).join('\n')}\n}`
  },
  'java': {
    string: 'String', int: 'int', float: 'double', bool: 'boolean', nullType: 'Object',
    any: 'Object', anyArray: 'List<Object>', arraySuffix: '[]', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `public class ${name} {\n${fields.map(([k, t]) => `${ind}private ${t} ${k};`).join('\n')}\n}`
  },
  'kotlin': {
    string: 'String', int: 'Int', float: 'Double', bool: 'Boolean', nullType: 'Any',
    any: 'Any', anyArray: 'List<Any>', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `data class ${name}(\n${fields.map(([k, t]) => `${ind}val ${k}: ${t}`).join(',\n')}\n)`
  },
  'python': {
    string: 'str', int: 'int', float: 'float', bool: 'bool', nullType: 'None',
    any: 'Any', anyArray: 'list', arraySuffix: '', object: "'RootObject'",
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `class ${name}:\n${fields.map(([k, t]) => `${ind}${k}: ${t}`).join('\n')}\n}`
  },
  'rust': {
    string: 'String', int: 'i64', float: 'f64', bool: 'bool', nullType: 'Option<()>',
    any: 'serde_json::Value', anyArray: 'Vec<serde_json::Value>', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `#[derive(Debug, Serialize, Deserialize)]\nstruct ${name} {\n${fields.map(([k, t]) => `${ind}${k}: ${t},`).join('\n')}\n}`
  },
  'cpp': {
    string: 'std::string', int: 'int', float: 'double', bool: 'bool', nullType: 'std::any',
    any: 'std::any', anyArray: 'std::vector<any>', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `struct ${name} {\n${fields.map(([k, t]) => `${ind}${t} ${k};`).join('\n')}\n};`
  },
  'php': {
    string: 'string', int: 'int', float: 'float', bool: 'bool', nullType: 'mixed',
    any: 'mixed', anyArray: 'array', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `class ${name} {\n${fields.map(([k, t]) => `${ind}public ${t} $${k};`).join('\n')}\n}`
  },
  'ruby': {
    string: 'String', int: 'Integer', float: 'Float', bool: 'Boolean', nullType: 'NilClass',
    any: 'Object', anyArray: 'Array', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '  ',
    format: (name, fields, ind) => `class ${name}\n${fields.map(([k]) => `${ind}attr_accessor :${k}`).join('\n')}\nend`
  },
  'swift': {
    string: 'String', int: 'Int', float: 'Double', bool: 'Bool', nullType: 'Any',
    any: 'Any', anyArray: '[Any]', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '    ',
    format: (name, fields, ind) => `struct ${name}: Codable {\n${fields.map(([k, t]) => `${ind}let ${k}: ${t}`).join('\n')}\n}`
  },
  'dart': {
    string: 'String', int: 'int', float: 'double', bool: 'bool', nullType: 'dynamic',
    any: 'dynamic', anyArray: 'List<dynamic>', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '  ',
    format: (name, fields, ind) => `class ${name} {\n${fields.map(([k, t]) => `${ind}final ${t} ${k};`).join('\n')}\n\n${ind}${name}({${fields.map(([k]) => `required this.${k}`).join(', ')}});\n}`
  },
  'scala': {
    string: 'String', int: 'Int', float: 'Double', bool: 'Boolean', nullType: 'Any',
    any: 'Any', anyArray: 'Seq[Any]', arraySuffix: '', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '  ',
    format: (name, fields, ind) => `case class ${name}(\n${fields.map(([k, t]) => `${ind}${k}: ${t}`).join(',\n')}\n)`
  },
  'typescript': {
    string: 'string', int: 'number', float: 'number', bool: 'boolean', nullType: 'null',
    any: 'any', anyArray: 'any[]', arraySuffix: '[]', object: 'RootObject',
    className: (k) => capitalize(k),
    indent: '  ',
    format: (name, fields, ind) => `interface ${name} {\n${fields.map(([k, t]) => `${ind}${k}: ${t};`).join('\n')}\n}`
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function convert(data: unknown, lang: string, name = 'RootObject'): string {
  const cfg = langMap[lang]
  if (!cfg) return `不支持的语言: ${lang}`
  if (data === null || typeof data !== 'object') return `${cfg.any} value`
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      return convert(data[0], lang, name) + (lang === 'rust' ? '\n\ntype RootArray = Vec<RootObject>;' : '')
    }
    return `${cfg.anyArray}`
  }
  return convertObject(data as Record<string, unknown>, lang, name)
}

function convertObject(obj: Record<string, unknown>, lang: string, name: string, depth = 0): string {
  const cfg = langMap[lang]
  const fields: [string, string][] = []
  const nested: string[] = []
  for (const [key, val] of Object.entries(obj)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const nestedName = cfg.className(key)
      nested.push(convertObject(val as Record<string, unknown>, lang, nestedName, depth + 1))
      fields.push([key, nestedName])
    } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      const nestedName = cfg.className(key)
      nested.push(convertObject(val[0] as Record<string, unknown>, lang, nestedName, depth + 1))
      const arrType = lang === 'rust' ? `Vec<${nestedName}>` : lang === 'csharp' ? `List<${nestedName}>` : `${nestedName}${cfg.arraySuffix}`
      fields.push([key, arrType])
    } else {
      fields.push([key, getType(val, lang)])
    }
  }
  const struct = cfg.format(name, fields, cfg.indent)
  return nested.length > 0 ? `${nested.join('\n\n')}\n\n${struct}` : struct
}

// 让 Vue 识别组件 props
void (props as Component)
</script>
