import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** JSON 工具类元数据 */
export const jsonToolManifests: Manifest[] = [
  {
    id: 'json-format',
    name: 'JSON Format',
    nameZh: 'JSON 格式化',
    icon: 'mdi:code-json',
    category: ['json'],
    keywords: ['json', 'format', 'beautify', 'pretty', '格式化', '美化'],
    description: 'JSON 格式化美化（缩进排版）',
    relatedToolId: ['json-minify', 'json-validate'],
    advance: {
      recommend: { type: 'json', priority: 5 }
    }
  },
  {
    id: 'json-minify',
    name: 'JSON Minify',
    nameZh: 'JSON 压缩',
    icon: 'mdi:compress',
    category: ['json'],
    keywords: ['json', 'minify', 'compress', '压缩'],
    description: 'JSON 压缩/Minify（去除空白）',
    relatedToolId: ['json-format'],
    advance: {
      recommend: { type: 'json', priority: 3 }
    }
  },
  {
    id: 'json-validate',
    name: 'JSON Validate',
    nameZh: 'JSON 校验',
    icon: 'mdi:check-decagram',
    category: ['json'],
    keywords: ['json', 'validate', 'check', '校验', '验证', 'lint'],
    description: '校验 JSON 格式是否正确',
    relatedToolId: ['json-format']
  },
  {
    id: 'json-to-typescript',
    name: 'JSON to TypeScript',
    nameZh: 'JSON 转 TypeScript',
    icon: 'mdi:language-typescript',
    category: ['json'],
    keywords: ['json', 'typescript', 'interface', 'ts', '转换', 'type'],
    description: 'JSON 转 TypeScript Interface',
    relatedToolId: ['json-to-go']
  },
  {
    id: 'json-to-go',
    name: 'JSON to Go',
    nameZh: 'JSON 转 Go Struct',
    icon: 'mdi:language-go',
    category: ['json'],
    keywords: ['json', 'go', 'golang', 'struct', '转换'],
    description: 'JSON 转 Go Struct',
    relatedToolId: ['json-to-typescript']
  },
  {
    id: 'json-path',
    name: 'JSON Path',
    nameZh: 'JSON 路径提取',
    icon: 'mdi:folder-search-outline',
    category: ['json'],
    keywords: ['json', 'path', 'extract', 'jq', '路径', '提取', '查询'],
    description: '使用点路径语法提取 JSON 数据',
    relatedToolId: ['json-format']
  },
  {
    id: 'yaml-json-convert',
    name: 'YAML / JSON',
    nameZh: 'YAML 与 JSON 互转',
    icon: 'mdi:file-document-outline',
    category: ['json'],
    keywords: ['yaml', 'json', 'convert', '转换', '配置文件'],
    description: 'YAML 与 JSON 格式互转',
    relatedToolId: ['json-format', 'csv-json-convert']
  },
  {
    id: 'csv-json-convert',
    name: 'CSV / JSON',
    nameZh: 'CSV 与 JSON 互转',
    icon: 'mdi:file-delimited',
    category: ['json'],
    keywords: ['csv', 'json', 'convert', '转换', '表格'],
    description: 'CSV 与 JSON 格式互转',
    relatedToolId: ['json-format', 'yaml-json-convert']
  },
  { id: 'json-to-csharp', name: 'JSON to C#', nameZh: 'JSON 转 C#', icon: 'mdi:language-csharp', category: ['json'], keywords: ['json', 'csharp', 'c#', 'class', '转换'], description: 'JSON 转 C# Class', relatedToolId: ['json-to-typescript', 'json-to-java'] },
  { id: 'json-to-java', name: 'JSON to Java', nameZh: 'JSON 转 Java', icon: 'mdi:language-java', category: ['json'], keywords: ['json', 'java', 'bean', 'class', '转换'], description: 'JSON 转 Java Bean', relatedToolId: ['json-to-typescript', 'json-to-kotlin'] },
  { id: 'json-to-kotlin', name: 'JSON to Kotlin', nameZh: 'JSON 转 Kotlin', icon: 'mdi:language-kotlin', category: ['json'], keywords: ['json', 'kotlin', 'data class', '转换'], description: 'JSON 转 Kotlin Data Class', relatedToolId: ['json-to-java'] },
  { id: 'json-to-python', name: 'JSON to Python', nameZh: 'JSON 转 Python', icon: 'mdi:language-python', category: ['json'], keywords: ['json', 'python', 'class', 'py', '转换'], description: 'JSON 转 Python Class', relatedToolId: ['json-to-typescript'] },
  { id: 'json-to-rust', name: 'JSON to Rust', nameZh: 'JSON 转 Rust', icon: 'mdi:language-rust', category: ['json'], keywords: ['json', 'rust', 'struct', '转换'], description: 'JSON 转 Rust Struct', relatedToolId: ['json-to-go'] },
  { id: 'json-to-cpp', name: 'JSON to C++', nameZh: 'JSON 转 C++', icon: 'mdi:language-cpp', category: ['json'], keywords: ['json', 'cpp', 'c++', 'struct', '转换'], description: 'JSON 转 C++ Struct', relatedToolId: ['json-to-go'] },
  { id: 'json-to-php', name: 'JSON to PHP', nameZh: 'JSON 转 PHP', icon: 'mdi:language-php', category: ['json'], keywords: ['json', 'php', 'class', '转换'], description: 'JSON 转 PHP Class', relatedToolId: ['json-to-typescript'] },
  { id: 'json-to-ruby', name: 'JSON to Ruby', nameZh: 'JSON 转 Ruby', icon: 'mdi:language-ruby', category: ['json'], keywords: ['json', 'ruby', 'module', '转换'], description: 'JSON 转 Ruby Module', relatedToolId: ['json-to-python'] },
  { id: 'json-to-swift', name: 'JSON to Swift', nameZh: 'JSON 转 Swift', icon: 'mdi:language-swift', category: ['json'], keywords: ['json', 'swift', 'struct', 'codable', '转换'], description: 'JSON 转 Swift Struct', relatedToolId: ['json-to-typescript'] },
  { id: 'json-to-dart', name: 'JSON to Dart', nameZh: 'JSON 转 Dart', icon: 'mdi:language-go', category: ['json'], keywords: ['json', 'dart', 'flutter', 'class', '转换'], description: 'JSON 转 Dart Class', relatedToolId: ['json-to-kotlin'] },
  { id: 'json-to-scala', name: 'JSON to Scala', nameZh: 'JSON 转 Scala', icon: 'mdi:language-scala', category: ['json'], keywords: ['json', 'scala', 'case class', '转换'], description: 'JSON 转 Scala Case Class', relatedToolId: ['json-to-java'] }
]
