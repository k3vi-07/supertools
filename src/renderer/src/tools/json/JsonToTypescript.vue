<template>
  <h-single-layout>
    <h-transform
      left-title="JSON 输入"
      right-title="TypeScript Interface"
      input-lang="json"
      output-lang="typescript"
      :sample-data="sample"
      :input-handler="convertFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
const sample = `{
  "name": "SuperTools",
  "version": "1.0.0",
  "isOpenSource": true,
  "downloads": 10000,
  "tags": ["electron", "vue", "tools"],
  "author": {
    "name": "Dev",
    "email": "dev@example.com"
  }
}`

interface FieldInfo {
  name: string
  type: string
  optional: boolean
}

function getTypeName(value: unknown, depth = 0): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]'
    const elemType = getTypeName(value[0], depth + 1)
    return `${elemType}[]`
  }
  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return Number.isInteger(value) ? 'number' : 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      return 'RootObject' + depth
    default:
      return 'any'
  }
}

function objectToInterface(obj: Record<string, unknown>, interfaceName: string, depth = 0): string {
  const fields: FieldInfo[] = []
  const nestedInterfaces: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nestedName = depth === 0 ? capitalize(key) : `${interfaceName}${capitalize(key)}`
      nestedInterfaces.push(objectToInterface(value as Record<string, unknown>, nestedName, depth + 1))
      fields.push({ name: key, type: nestedName, optional: false })
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const nestedName = depth === 0 ? capitalize(key) : `${interfaceName}${capitalize(key)}`
      nestedInterfaces.push(objectToInterface(value[0] as Record<string, unknown>, nestedName, depth + 1))
      fields.push({ name: key, type: `${nestedName}[]`, optional: false })
    } else {
      fields.push({ name: key, type: getTypeName(value, depth), optional: false })
    }
  }

  const fieldsStr = fields.map((f) => `  ${f.name}: ${f.type};`).join('\n')
  const interfaceStr = `interface ${interfaceName} {\n${fieldsStr}\n}`

  return nestedInterfaces.length > 0
    ? `${nestedInterfaces.join('\n\n')}\n\n${interfaceStr}`
    : interfaceStr
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function convertFn(input: string): string {
  try {
    const parsed = JSON.parse(input)
    if (typeof parsed !== 'object' || parsed === null) {
      return 'Error: 输入必须是 JSON 对象或数组'
    }
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return 'type RootArray = any[];'
      const first = parsed[0]
      if (typeof first === 'object' && first !== null) {
        return objectToInterface(first as Record<string, unknown>, 'RootObject') + '\n\ntype RootArray = RootObject[];'
      }
      return `type RootArray = ${getTypeName(first)}[];`
    }
    return objectToInterface(parsed as Record<string, unknown>, 'RootObject')
  } catch (err) {
    return `❌ JSON 格式错误: ${(err as Error).message}`
  }
}
</script>
