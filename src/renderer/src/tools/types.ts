/**
 * 工具元数据定义 — 复刻 He3 的 manifest 系统
 */
import type { Component } from 'vue'
import type { ContentType, ToolCategory } from '@shared/types'

/** 工具智能推荐配置 */
export interface ToolAdvance {
  recommend: {
    type: ContentType
    priority: number
  }
  conversionFunction?: (input: string) => string
}

/** 工具元数据（Manifest） */
export interface ToolManifest {
  /** 唯一标识 */
  id: string
  /** 英文名 */
  name: string
  /** 中文名 */
  nameZh: string
  /** 图标（iconify 图标名） */
  icon: string
  /** 分类 */
  category: ToolCategory[]
  /** 搜索关键词 */
  keywords: string[]
  /** 描述 */
  description: string
  /** 关联工具 id */
  relatedToolId?: string[]
  /**
   * Vue 组件（懒加载）— 由注册系统自动填充
   * 手动声明此字段可在 id 与文件名不一致时指定组件文件名
   */
  component?: () => Promise<{ default: Component }>
  /** 组件文件名（可选，默认从 id 推导为 PascalCase.vue） */
  componentFile?: string
  /** 智能推荐配置 */
  advance?: ToolAdvance
}

/** 分类信息 */
export interface CategoryInfo {
  id: ToolCategory
  name: string
  nameEn: string
  icon: string
}

/** 所有分类 */
export const CATEGORIES: CategoryInfo[] = [
  { id: 'encode', name: '编码解码', nameEn: 'Encode', icon: 'mdi:lock-outline' },
  { id: 'json', name: 'JSON', nameEn: 'JSON', icon: 'mdi:code-json' },
  { id: 'cryptography', name: '加密哈希', nameEn: 'Crypto', icon: 'mdi:shield-key-outline' },
  { id: 'text', name: '文本处理', nameEn: 'Text', icon: 'mdi:text' },
  { id: 'web', name: '前端开发', nameEn: 'Web', icon: 'mdi:language-html5' },
  { id: 'color', name: '颜色', nameEn: 'Color', icon: 'mdi:palette' },
  { id: 'datetime', name: '时间日期', nameEn: 'DateTime', icon: 'mdi:clock-outline' }
]
