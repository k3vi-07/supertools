import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 前端开发辅助工具元数据 */
export const webToolManifests: Manifest[] = [
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    nameZh: '时间戳转换',
    icon: 'mdi:clock-outline',
    category: ['datetime', 'web'],
    keywords: ['timestamp', 'unix', 'time', 'date', '时间戳', '转换', '日期'],
    description: 'Unix 时间戳与日期时间互转',
    advance: {
      recommend: { type: 'timestamp', priority: 5 }
    }
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    nameZh: '颜色格式转换',
    icon: 'mdi:palette',
    category: ['color', 'web'],
    keywords: ['color', 'hex', 'rgb', 'hsl', '颜色', '转换'],
    description: 'HEX / RGB / HSL 颜色格式互转'
  },
  {
    id: 'box-shadow-generator',
    name: 'Box Shadow Generator',
    nameZh: 'Box Shadow 生成器',
    icon: 'mdi:box-shadow',
    category: ['web'],
    keywords: ['css', 'box', 'shadow', '阴影', '生成'],
    description: '可视化生成 CSS box-shadow'
  },
  {
    id: 'cron-parser',
    name: 'Cron Parser',
    nameZh: 'Cron 表达式解析',
    icon: 'mdi:calendar-clock',
    category: ['datetime', 'web'],
    keywords: ['cron', 'schedule', 'crontab', '定时', '表达式', '解析'],
    description: '解析 Cron 表达式并预览执行时间'
  },
  {
    id: 'http-status-codes',
    name: 'HTTP Status Codes',
    nameZh: 'HTTP 状态码速查',
    icon: 'mdi:web',
    category: ['web'],
    keywords: ['http', 'status', 'code', 'response', '状态码'],
    description: 'HTTP 状态码含义速查表'
  },
  {
    id: 'gradient-generator',
    name: 'CSS Gradient Generator',
    nameZh: 'CSS 渐变生成器',
    icon: 'mdi:gradient-horizontal',
    category: ['color', 'web'],
    keywords: ['css', 'gradient', 'linear', '渐变', '生成'],
    description: '可视化生成 CSS 线性渐变'
  },
  {
    id: 'border-radius-generator',
    name: 'Border Radius Generator',
    nameZh: '圆角生成器',
    icon: 'mdi:rounded-corner',
    category: ['web'],
    keywords: ['css', 'border', 'radius', '圆角', '生成'],
    description: '可视化生成 CSS border-radius'
  },
  {
    id: 'css-minify',
    name: 'CSS Minify',
    nameZh: 'CSS 压缩',
    icon: 'mdi:arrow-collapse',
    category: ['web'],
    keywords: ['css', 'minify', 'compress', '压缩', 'minify'],
    description: 'CSS 代码压缩/Minify',
    componentFile: 'CssMinify.vue'
  },
  {
    id: 'html-to-jsx',
    name: 'HTML to JSX',
    nameZh: 'HTML 转 JSX',
    icon: 'mdi:react',
    category: ['web'],
    keywords: ['html', 'jsx', 'react', '转换', 'convert'],
    description: '将 HTML 转换为 React JSX 语法'
  },
  {
    id: 'flex-generator',
    name: 'CSS Flex Generator',
    nameZh: 'Flex 布局生成器',
    icon: 'mdi:view-column-outline',
    category: ['web'],
    keywords: ['css', 'flex', 'flexbox', 'layout', '布局', '生成'],
    description: '可视化生成 CSS Flexbox 布局'
  },
  {
    id: 'text-shadow-generator',
    name: 'CSS Text Shadow',
    nameZh: '文字阴影生成器',
    icon: 'mdi:format-text',
    category: ['web'],
    keywords: ['css', 'text', 'shadow', '文字', '阴影', '生成'],
    description: '可视化生成 CSS text-shadow'
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    nameZh: '调色板生成器',
    icon: 'mdi:palette-outline',
    category: ['color', 'web'],
    keywords: ['color', 'palette', 'scheme', '调色板', '配色'],
    description: '生成类比/互补/三元/单色配色方案'
  }
]
