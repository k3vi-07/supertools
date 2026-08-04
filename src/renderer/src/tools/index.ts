import type { Component } from 'vue'
import type { ToolManifest } from './types'
import { encodeToolManifests } from './encode/manifests'
import { jsonToolManifests } from './json/manifests'
import { cryptoToolManifests } from './cryptography/manifests'
import { textToolManifests } from './text/manifests'
import { webToolManifests } from './web/manifests'
import { programmingToolManifests } from './programming/manifests'
import { networkToolManifests } from './network/manifests'
import { datetimeToolManifests } from './datetime/manifests'

/**
 * 插件化自动注册系统
 *
 * 核心设计：
 * 1. 所有工具组件通过 import.meta.glob 自动扫描（懒加载）
 * 2. 组件路径通过 manifest 的 id 自动推导（kebab-case → PascalCase.vue）
 * 3. 无需手动维护 componentPathMap 映射表
 *
 * 新增工具只需两步：
 *   a) 在 tools/<category>/manifests.ts 添加 manifest（包含 id）
 *   b) 创建 tools/<category>/<PascalCase>.vue 组件
 *
 * 文件名约定：id 为 'json-format' → 组件文件为 'JsonFormat.vue'
 */

// 使用 Vite 的 import.meta.glob 预加载所有工具组件（懒加载）
const toolModules = import.meta.glob('./**/*.vue')

/** 将 kebab-case id 转为 PascalCase 文件名 */
function idToFileName(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + '.vue'
}

/** 尝试匹配组件路径：优先用 componentFile，再用 id 推导 */
function resolveComponentPath(manifest: { id: string; componentFile?: string }, category: string): string | undefined {
  // 1. 如果 manifest 显式声明了 componentFile，直接使用
  if (manifest.componentFile) {
    const explicitPath = `./${category}/${manifest.componentFile}`
    if (toolModules[explicitPath]) return explicitPath
    // 也尝试在其他目录搜索
    const globKey = Object.keys(toolModules).find((key) => key.endsWith(`/${manifest.componentFile}`))
    if (globKey) return globKey
  }

  // 2. 从 id 自动推导文件名 (kebab-case → PascalCase.vue)
  const fileName = idToFileName(manifest.id)
  const exactPath = `./${category}/${fileName}`
  if (toolModules[exactPath]) return exactPath

  // 3. 在所有子目录中搜索该文件名
  const globKey = Object.keys(toolModules).find((key) => key.endsWith(`/${fileName}`))
  if (globKey) return globKey

  return undefined
}

/** 构建工具列表：自动为每个 manifest 关联懒加载组件 */
function buildTools(
  manifests: Array<Omit<ToolManifest, 'component'>>,
  category: string
): ToolManifest[] {
  const tools: ToolManifest[] = []
  const warnings: string[] = []

  for (const m of manifests) {
    const path = resolveComponentPath(m, category)
    if (!path) {
      warnings.push(`⚠️ 工具 "${m.id}" 未找到对应组件文件 (期望: ${category}/${m.componentFile || idToFileName(m.id)})`)
      continue
    }
    tools.push({
      ...m,
      component: toolModules[path] as () => Promise<{ default: Component }>
    })
  }

  if (warnings.length > 0) {
    console.warn('[ToolRegistry] 部分工具组件缺失:\n' + warnings.join('\n'))
  }

  return tools
}

/** 本地内置工具列表（自动注册） */
export const localTools: ToolManifest[] = [
  ...buildTools(encodeToolManifests, 'encode'),
  ...buildTools(jsonToolManifests, 'json'),
  ...buildTools(cryptoToolManifests, 'cryptography'),
  ...buildTools(textToolManifests, 'text'),
  ...buildTools(webToolManifests, 'web'),
  ...buildTools(programmingToolManifests, 'programming'),
  ...buildTools(networkToolManifests, 'network'),
  ...buildTools(datetimeToolManifests, 'datetime')
]

/**
 * 所有工具列表（本地内置 + 运行时动态合并远程工具）
 *
 * 远程工具在 main.ts 中初始化后通过 mergeRemoteTools() 动态合并。
 * 初始值仅包含本地工具。
 */
export const allTools: ToolManifest[] = [...localTools]

/**
 * 合并远程工具到 allTools（运行时调用）
 * 在 main.ts 中初始化 remoteTools store 后调用。
 */
export function mergeRemoteTools(remoteManifests: ToolManifest[]): void {
  // 先移除旧的远程工具（重新安装/卸载后刷新）
  const localIds = new Set(localTools.map((t) => t.id))
  // 保留本地工具，清除之前的远程工具
  allTools.length = 0
  allTools.push(...localTools)
  // 添加当前远程工具（避免 id 冲突）
  for (const remote of remoteManifests) {
    if (!localIds.has(remote.id)) {
      allTools.push(remote)
    }
  }
  console.log(`[ToolRegistry] 工具列表已更新: ${localTools.length} 本地 + ${remoteManifests.length} 远程 = ${allTools.length} 总计`)
}

/** 重新导出类型和常量 */
export * from './types'
