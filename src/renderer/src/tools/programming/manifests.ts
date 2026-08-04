import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 编程工具元数据 */
export const programmingToolManifests: Manifest[] = [
  { id: 'sql-format', name: 'SQL Format', nameZh: 'SQL 格式化', icon: 'mdi:database', category: ['programming'], keywords: ['sql', 'format', 'beautify', '格式化'], description: 'SQL 代码格式化美化', componentFile: 'FormatSql.vue' },
  { id: 'sql-minify', name: 'SQL Minify', nameZh: 'SQL 压缩', icon: 'mdi:database-arrow-down', category: ['programming'], keywords: ['sql', 'minify', 'compress', '压缩'], description: 'SQL 代码压缩', componentFile: 'MinifySql.vue' },
  { id: 'sql-escape', name: 'SQL Escape', nameZh: 'SQL 转义', icon: 'mdi:shield', category: ['programming'], keywords: ['sql', 'escape', '转义'], description: 'SQL 字符串转义', componentFile: 'EscapeSql.vue' },
  { id: 'sql-unescape', name: 'SQL Unescape', nameZh: 'SQL 反转义', icon: 'mdi:shield-off', category: ['programming'], keywords: ['sql', 'unescape', '反转义'], description: 'SQL 字符串反转义', componentFile: 'UnescapeSql.vue' },
  { id: 'js-format', name: 'JS Format', nameZh: 'JavaScript 格式化', icon: 'mdi:language-javascript', category: ['programming'], keywords: ['js', 'javascript', 'format', '格式化'], description: 'JavaScript 代码格式化', componentFile: 'FormatJs.vue' },
  { id: 'js-minify', name: 'JS Minify', nameZh: 'JavaScript 压缩', icon: 'mdi:language-javascript', category: ['programming'], keywords: ['js', 'minify', 'compress', '压缩'], description: 'JavaScript 代码压缩', componentFile: 'MinifyJs.vue' },
  { id: 'js-escape', name: 'JS Escape', nameZh: 'JS 转义', icon: 'mdi:lock', category: ['programming'], keywords: ['js', 'escape', '转义'], description: 'JavaScript 字符串转义', componentFile: 'EscapeJs.vue' },
  { id: 'js-unescape', name: 'JS Unescape', nameZh: 'JS 反转义', icon: 'mdi:lock-open', category: ['programming'], keywords: ['js', 'unescape', '反转义'], description: 'JavaScript 字符串反转义', componentFile: 'UnescapeJs.vue' },
  { id: 'css-format', name: 'CSS Format', nameZh: 'CSS 格式化', icon: 'mdi:language-css3', category: ['programming'], keywords: ['css', 'format', 'beautify', '格式化'], description: 'CSS 代码格式化', componentFile: 'FormatCss.vue' },
  { id: 'css-format-minify', name: 'CSS Minify (Format)', nameZh: 'CSS 压缩', icon: 'mdi:arrow-collapse', category: ['programming'], keywords: ['css', 'minify', 'compress', '压缩'], description: 'CSS 代码压缩/Minify', componentFile: 'MinifyCss.vue' },
  { id: 'html-format', name: 'HTML Format', nameZh: 'HTML 格式化', icon: 'mdi:language-html5', category: ['programming'], keywords: ['html', 'format', 'beautify', '格式化'], description: 'HTML 代码格式化', componentFile: 'FormatHtml.vue' },
  { id: 'html-minify', name: 'HTML Minify', nameZh: 'HTML 压缩', icon: 'mdi:language-html5', category: ['programming'], keywords: ['html', 'minify', 'compress', '压缩'], description: 'HTML 代码压缩', componentFile: 'MinifyHtml.vue' },
  { id: 'html-escape-code', name: 'HTML Escape', nameZh: 'HTML 转义', icon: 'mdi:lock', category: ['programming'], keywords: ['html', 'escape', 'entity', '转义'], description: 'HTML 实体转义', componentFile: 'EscapeHtml.vue' },
  { id: 'html-unescape-code', name: 'HTML Unescape', nameZh: 'HTML 反转义', icon: 'mdi:lock-open', category: ['programming'], keywords: ['html', 'unescape', '反转义'], description: 'HTML 实体反转义', componentFile: 'UnescapeHtml.vue' },
  { id: 'xml-format', name: 'XML Format', nameZh: 'XML 格式化', icon: 'mdi:file-xml-box', category: ['programming'], keywords: ['xml', 'format', 'beautify', '格式化'], description: 'XML 代码格式化', componentFile: 'FormatXml.vue' },
  { id: 'xml-minify', name: 'XML Minify', nameZh: 'XML 压缩', icon: 'mdi:file-xml-box', category: ['programming'], keywords: ['xml', 'minify', 'compress', '压缩'], description: 'XML 代码压缩', componentFile: 'MinifyXml.vue' },
  { id: 'xml-escape', name: 'XML Escape', nameZh: 'XML 转义', icon: 'mdi:lock', category: ['programming'], keywords: ['xml', 'escape', '转义'], description: 'XML 实体转义', componentFile: 'EscapeXml.vue' },
  { id: 'xml-unescape', name: 'XML Unescape', nameZh: 'XML 反转义', icon: 'mdi:lock-open', category: ['programming'], keywords: ['xml', 'unescape', '反转义'], description: 'XML 实体反转义', componentFile: 'UnescapeXml.vue' },
  { id: 'java-escape', name: 'Java Escape', nameZh: 'Java 转义', icon: 'mdi:language-java', category: ['programming'], keywords: ['java', 'escape', '转义'], description: 'Java 字符串转义', componentFile: 'EscapeJava.vue' },
  { id: 'java-unescape', name: 'Java Unescape', nameZh: 'Java 反转义', icon: 'mdi:language-java', category: ['programming'], keywords: ['java', 'unescape', '反转义'], description: 'Java 字符串反转义', componentFile: 'UnescapeJava.vue' },
  { id: 'string-escape', name: 'String Escape', nameZh: '字符串转义', icon: 'mdi:format-quote-close', category: ['programming'], keywords: ['string', 'escape', '字符串', '转义'], description: '通用字符串转义', componentFile: 'EscapeString.vue' },
  { id: 'string-unescape', name: 'String Unescape', nameZh: '字符串反转义', icon: 'mdi:format-quote-open', category: ['programming'], keywords: ['string', 'unescape', '字符串', '反转义'], description: '通用字符串反转义', componentFile: 'UnescapeString.vue' }
]
