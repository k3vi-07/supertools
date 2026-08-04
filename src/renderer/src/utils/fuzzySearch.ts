import Fuse from 'fuse.js'
import type { ToolManifest } from '@tools/types'
import { i18n } from '../i18n'

/** 搜索结果项 */
export interface SearchResult {
  tool: ToolManifest
  score: number
}

/** 构建搜索索引数据 */
interface SearchEntry {
  id: string
  name: string
  nameZh: string
  keywords: string[]
  description: string
  category: string[]
  tool: ToolManifest
}

let fuseInstance: Fuse<SearchEntry> | null = null

/** 初始化 Fuse.js 搜索索引 */
export function initSearchIndex(tools: ToolManifest[]): void {
  const entries: SearchEntry[] = tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    nameZh: tool.nameZh,
    keywords: tool.keywords,
    description: tool.description,
    category: tool.category,
    tool
  }))

  fuseInstance = new Fuse(entries, {
    keys: [
      { name: 'name', weight: 0.3 },
      { name: 'nameZh', weight: 0.3 },
      { name: 'keywords', weight: 0.2 },
      { name: 'id', weight: 0.15 },
      { name: 'description', weight: 0.05 }
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
    includeScore: true
  })
}

/** 搜索工具 */
export function searchTools(query: string, limit = 20): SearchResult[] {
  if (!fuseInstance || !query.trim()) return []

  const results = fuseInstance.search(query, { limit })
  return results.map((r) => ({
    tool: r.item.tool,
    score: r.score || 0
  }))
}

/** 获取工具的显示名（根据语言） */
export function getToolDisplayName(tool: ToolManifest): string {
  return i18n.global.locale.value === 'zh' ? tool.nameZh : tool.name
}
