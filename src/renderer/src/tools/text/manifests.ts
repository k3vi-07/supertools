import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 文本处理工具元数据 */
export const textToolManifests: Manifest[] = [
  {
    id: 'case-converter',
    name: 'Case Converter',
    nameZh: '大小写转换',
    icon: 'mdi:format-letter-case',
    category: ['text'],
    keywords: ['case', 'upper', 'lower', 'camel', 'snake', '大小写', '驼峰', '下划线'],
    description: '文本大小写转换（全大写/小写/驼峰/下划线等）'
  },
  {
    id: 'text-dedup',
    name: 'Text Dedup',
    nameZh: '文本去重',
    icon: 'mdi:content-duplicate',
    category: ['text'],
    keywords: ['dedup', 'unique', 'remove', 'duplicate', '去重', '重复'],
    description: '去除文本中的重复行'
  },
  {
    id: 'text-sort',
    name: 'Text Sort',
    nameZh: '文本排序',
    icon: 'mdi:sort-alphabetical-variant',
    category: ['text'],
    keywords: ['sort', 'order', '排序', '排列'],
    description: '对文本行进行排序'
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    nameZh: '文本对比',
    icon: 'mdi:file-compare',
    category: ['text'],
    keywords: ['diff', 'compare', '对比', '差异', '比较'],
    description: '对比两段文本的差异'
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum',
    nameZh: 'Lorem Ipsum 生成器',
    icon: 'mdi:text-long',
    category: ['text'],
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', '占位', '填充'],
    description: '生成 Lorem Ipsum 占位文本'
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    nameZh: 'Slug 生成器',
    icon: 'mdi:link',
    category: ['text'],
    keywords: ['slug', 'url', 'permalink', '链接', '别名'],
    description: '将文本转换为 URL 友好的 slug'
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    nameZh: '正则表达式测试',
    icon: 'mdi:regex',
    category: ['text'],
    keywords: ['regex', 'regular', 'expression', 'test', 'match', '正则', '匹配'],
    description: '测试正则表达式并高亮匹配结果',
    advance: {
      recommend: { type: 'regex', priority: 4 }
    }
  },
  {
    id: 'text-statistics',
    name: 'Text Statistics',
    nameZh: '文本统计',
    icon: 'mdi:counter',
    category: ['text'],
    keywords: ['count', 'statistics', 'words', 'characters', '统计', '字数', '字符'],
    description: '统计文本的字数、字符数、行数等'
  },
  {
    id: 'text-reverse',
    name: 'Text Reverse',
    nameZh: '文本反转',
    icon: 'mdi:flip-horizontal',
    category: ['text'],
    keywords: ['reverse', 'flip', '反转', '倒序', '倒置'],
    description: '反转文本（整体/逐行/逐词）'
  },
  {
    id: 'tab-space-convert',
    name: 'Tab / Space',
    nameZh: 'Tab 空格互转',
    icon: 'mdi:keyboard-tab',
    category: ['text'],
    keywords: ['tab', 'space', 'convert', '缩进', '转换'],
    description: 'Tab 与空格互转'
  },
  {
    id: 'text-replace',
    name: 'Text Replace',
    nameZh: '查找替换',
    icon: 'mdi:find-replace',
    category: ['text'],
    keywords: ['replace', 'find', 'search', '替换', '查找'],
    description: '文本查找与替换（支持正则）'
  },
  {
    id: 'number-base-convert',
    name: 'Number Base Converter',
    nameZh: '进制转换',
    icon: 'mdi:radix',
    category: ['text'],
    keywords: ['number', 'base', 'binary', 'hex', 'decimal', 'octal', '进制', '转换', '二进制', '十进制', '十六进制'],
    description: '二进制/八进制/十进制/十六进制互转'
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    nameZh: 'Markdown 预览',
    icon: 'mdi:language-markdown',
    category: ['text'],
    keywords: ['markdown', 'md', 'preview', 'render', '预览', '渲染'],
    description: '实时预览 Markdown 渲染效果'
  },
  { id: 'csv-to-json-table', name: 'CSV to JSON Table', nameZh: 'CSV 转 JSON 表格', icon: 'mdi:table', category: ['text'], keywords: ['csv', 'json', 'table', 'convert', '表格', '转换'], description: 'CSV 转 JSON 表格', componentFile: 'CsvToJson.vue' },
  { id: 'json-to-csv-table', name: 'JSON to CSV Table', nameZh: 'JSON 转 CSV 表格', icon: 'mdi:table', category: ['text'], keywords: ['json', 'csv', 'table', 'convert', '表格', '转换'], description: 'JSON 转 CSV 表格', componentFile: 'JsonToCsv.vue' },
  { id: 'csv-to-tsv-table', name: 'CSV to TSV', nameZh: 'CSV 转 TSV', icon: 'mdi:table', category: ['text'], keywords: ['csv', 'tsv', 'table', 'convert', '表格', '转换'], description: 'CSV 转 TSV 表格', componentFile: 'CsvToTsv.vue' },
  { id: 'tsv-to-csv-table', name: 'TSV to CSV', nameZh: 'TSV 转 CSV', icon: 'mdi:table', category: ['text'], keywords: ['tsv', 'csv', 'table', 'convert', '表格', '转换'], description: 'TSV 转 CSV 表格', componentFile: 'TsvToCsv.vue' },
  { id: 'csv-to-markdown-table', name: 'CSV to Markdown', nameZh: 'CSV 转 Markdown 表格', icon: 'mdi:table', category: ['text'], keywords: ['csv', 'markdown', 'table', 'convert', '表格', '转换'], description: 'CSV 转 MARKDOWN 表格', componentFile: 'CsvToMarkdown.vue' },
  { id: 'markdown-to-csv-table', name: 'Markdown to CSV', nameZh: 'Markdown 转 CSV', icon: 'mdi:table', category: ['text'], keywords: ['markdown', 'csv', 'table', 'convert', '表格', '转换'], description: 'MARKDOWN 转 CSV 表格', componentFile: 'MarkdownToCsv.vue' },
  { id: 'csv-to-html-table', name: 'CSV to HTML Table', nameZh: 'CSV 转 HTML 表格', icon: 'mdi:table', category: ['text'], keywords: ['csv', 'html', 'table', 'convert', '表格', '转换'], description: 'CSV 转 HTML 表格', componentFile: 'CsvToHtml.vue' },
  { id: 'html-to-csv-table', name: 'HTML to CSV', nameZh: 'HTML 转 CSV', icon: 'mdi:table', category: ['text'], keywords: ['html', 'csv', 'table', 'convert', '表格', '转换'], description: 'HTML 转 CSV 表格', componentFile: 'HtmlToCsv.vue' },
  { id: 'csv-to-sql-table', name: 'CSV to SQL', nameZh: 'CSV 转 SQL', icon: 'mdi:table', category: ['text'], keywords: ['csv', 'sql', 'table', 'convert', '表格', '转换'], description: 'CSV 转 SQL 表格', componentFile: 'CsvToSql.vue' },
  { id: 'json-to-markdown-table', name: 'JSON to Markdown', nameZh: 'JSON 转 Markdown 表格', icon: 'mdi:table', category: ['text'], keywords: ['json', 'markdown', 'table', 'convert', '表格', '转换'], description: 'JSON 转 MARKDOWN 表格', componentFile: 'JsonToMarkdown.vue' },
  { id: 'markdown-to-json-table', name: 'Markdown to JSON', nameZh: 'Markdown 转 JSON', icon: 'mdi:table', category: ['text'], keywords: ['markdown', 'json', 'table', 'convert', '表格', '转换'], description: 'MARKDOWN 转 JSON 表格', componentFile: 'MarkdownToJson.vue' },
  { id: 'json-to-html-table', name: 'JSON to HTML Table', nameZh: 'JSON 转 HTML 表格', icon: 'mdi:table', category: ['text'], keywords: ['json', 'html', 'table', 'convert', '表格', '转换'], description: 'JSON 转 HTML 表格', componentFile: 'JsonToHtml.vue' },
  { id: 'html-to-json-table', name: 'HTML to JSON', nameZh: 'HTML 转 JSON', icon: 'mdi:table', category: ['text'], keywords: ['html', 'json', 'table', 'convert', '表格', '转换'], description: 'HTML 转 JSON 表格', componentFile: 'HtmlToJson.vue' },
  { id: 'json-to-sql-table', name: 'JSON to SQL', nameZh: 'JSON 转 SQL', icon: 'mdi:table', category: ['text'], keywords: ['json', 'sql', 'table', 'convert', '表格', '转换'], description: 'JSON 转 SQL 表格', componentFile: 'JsonToSql.vue' },
  { id: 'tsv-to-json-table', name: 'TSV to JSON', nameZh: 'TSV 转 JSON', icon: 'mdi:table', category: ['text'], keywords: ['tsv', 'json', 'table', 'convert', '表格', '转换'], description: 'TSV 转 JSON 表格', componentFile: 'TsvToJson.vue' },
  { id: 'json-to-tsv-table', name: 'JSON to TSV', nameZh: 'JSON 转 TSV', icon: 'mdi:table', category: ['text'], keywords: ['json', 'tsv', 'table', 'convert', '表格', '转换'], description: 'JSON 转 TSV 表格', componentFile: 'JsonToTsv.vue' },
  { id: 'tsv-to-markdown-table', name: 'TSV to Markdown', nameZh: 'TSV 转 Markdown', icon: 'mdi:table', category: ['text'], keywords: ['tsv', 'markdown', 'table', 'convert', '表格', '转换'], description: 'TSV 转 MARKDOWN 表格', componentFile: 'TsvToMarkdown.vue' },
  { id: 'markdown-to-tsv-table', name: 'Markdown to TSV', nameZh: 'Markdown 转 TSV', icon: 'mdi:table', category: ['text'], keywords: ['markdown', 'tsv', 'table', 'convert', '表格', '转换'], description: 'MARKDOWN 转 TSV 表格', componentFile: 'MarkdownToTsv.vue' },
  { id: 'tsv-to-html-table', name: 'TSV to HTML', nameZh: 'TSV 转 HTML', icon: 'mdi:table', category: ['text'], keywords: ['tsv', 'html', 'table', 'convert', '表格', '转换'], description: 'TSV 转 HTML 表格', componentFile: 'TsvToHtml.vue' },
  { id: 'html-to-tsv-table', name: 'HTML to TSV', nameZh: 'HTML 转 TSV', icon: 'mdi:table', category: ['text'], keywords: ['html', 'tsv', 'table', 'convert', '表格', '转换'], description: 'HTML 转 TSV 表格', componentFile: 'HtmlToTsv.vue' },
  { id: 'tsv-to-sql-table', name: 'TSV to SQL', nameZh: 'TSV 转 SQL', icon: 'mdi:table', category: ['text'], keywords: ['tsv', 'sql', 'table', 'convert', '表格', '转换'], description: 'TSV 转 SQL 表格', componentFile: 'TsvToSql.vue' },
  { id: 'markdown-to-html-table', name: 'Markdown to HTML', nameZh: 'Markdown 转 HTML', icon: 'mdi:table', category: ['text'], keywords: ['markdown', 'html', 'table', 'convert', '表格', '转换'], description: 'MARKDOWN 转 HTML 表格', componentFile: 'MarkdownToHtml.vue' },
  { id: 'html-to-markdown-table', name: 'HTML to Markdown', nameZh: 'HTML 转 Markdown', icon: 'mdi:table', category: ['text'], keywords: ['html', 'markdown', 'table', 'convert', '表格', '转换'], description: 'HTML 转 MARKDOWN 表格', componentFile: 'HtmlToMarkdown.vue' },
  { id: 'markdown-to-sql-table', name: 'Markdown to SQL', nameZh: 'Markdown 转 SQL', icon: 'mdi:table', category: ['text'], keywords: ['markdown', 'sql', 'table', 'convert', '表格', '转换'], description: 'MARKDOWN 转 SQL 表格', componentFile: 'MarkdownToSql.vue' },
  { id: 'html-to-sql-table', name: 'HTML to SQL', nameZh: 'HTML 转 SQL', icon: 'mdi:table', category: ['text'], keywords: ['html', 'sql', 'table', 'convert', '表格', '转换'], description: 'HTML 转 SQL 表格', componentFile: 'HtmlToSql.vue' },
  { id: 'sql-to-json-table', name: 'SQL to JSON', nameZh: 'SQL 转 JSON', icon: 'mdi:table', category: ['text'], keywords: ['sql', 'json', 'table', 'convert', '表格', '转换'], description: 'SQL 转 JSON 表格', componentFile: 'SqlToJson.vue' },
  { id: 'sql-to-csv-table', name: 'SQL to CSV', nameZh: 'SQL 转 CSV', icon: 'mdi:table', category: ['text'], keywords: ['sql', 'csv', 'table', 'convert', '表格', '转换'], description: 'SQL 转 CSV 表格', componentFile: 'SqlToCsv.vue' },
  { id: 'sql-to-tsv-table', name: 'SQL to TSV', nameZh: 'SQL 转 TSV', icon: 'mdi:table', category: ['text'], keywords: ['sql', 'tsv', 'table', 'convert', '表格', '转换'], description: 'SQL 转 TSV 表格', componentFile: 'SqlToTsv.vue' },
  { id: 'sql-to-markdown-table', name: 'SQL to Markdown', nameZh: 'SQL 转 Markdown', icon: 'mdi:table', category: ['text'], keywords: ['sql', 'markdown', 'table', 'convert', '表格', '转换'], description: 'SQL 转 MARKDOWN 表格', componentFile: 'SqlToMarkdown.vue' },
  { id: 'sql-to-html-table', name: 'SQL to HTML', nameZh: 'SQL 转 HTML', icon: 'mdi:table', category: ['text'], keywords: ['sql', 'html', 'table', 'convert', '表格', '转换'], description: 'SQL 转 HTML 表格', componentFile: 'SqlToHtml.vue' },
]