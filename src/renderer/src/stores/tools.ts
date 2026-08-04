import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ToolManifest } from '@tools/types'

export const useToolsStore = defineStore('tools', () => {
  /** 所有已注册的工具 */
  const tools = ref<ToolManifest[]>([])

  /** 工具映射（id -> manifest） */
  const toolsMap = computed((): Map<string, ToolManifest> => {
    const map = new Map<string, ToolManifest>()
    for (const tool of tools.value) {
      map.set(tool.id, tool)
    }
    return map
  })

  /** 注册工具列表 */
  function registerTools(toolList: ToolManifest[]): void {
    tools.value = toolList
  }

  /** 根据 id 获取工具 */
  function getToolById(id: string): ToolManifest | undefined {
    return toolsMap.value.get(id)
  }

  /** 根据分类获取工具 */
  function getToolsByCategory(category: string): ToolManifest[] {
    return tools.value.filter((t) => t.category.includes(category as never))
  }

  /** 获取关联工具 */
  function getRelatedTools(toolId: string): ToolManifest[] {
    const tool = getToolById(toolId)
    if (!tool?.relatedToolId) return []
    return tool.relatedToolId
      .map((id) => getToolById(id))
      .filter((t): t is ToolManifest => t !== undefined)
  }

  return {
    tools,
    toolsMap,
    registerTools,
    getToolById,
    getToolsByCategory,
    getRelatedTools
  }
})
