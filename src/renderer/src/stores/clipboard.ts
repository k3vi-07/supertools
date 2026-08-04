import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { detectContentType } from '@utils/clipboardDetect'
import type { ContentType } from '@shared/types'
import { useToolsStore } from './tools'

export const useClipboardStore = defineStore('clipboard', () => {
  /** 最近剪贴板内容 */
  const lastContent = ref<string>('')
  /** 检测到的内容类型 */
  const detectedType = ref<ContentType>('unknown')

  /** 根据剪贴板内容推荐的工具列表 */
  const recommendedToolIds = computed((): string[] => {
    const toolsStore = useToolsStore()
    if (detectedType.value === 'unknown') return []

    const matched = toolsStore.tools
      .filter((t) => t.advance?.recommend?.type === detectedType.value)
      .sort((a, b) => {
        const pa = a.advance?.recommend?.priority || 0
        const pb = b.advance?.recommend?.priority || 0
        return pb - pa
      })
      .map((t) => t.id)

    return matched
  })

  /** 检测剪贴板内容 */
  async function detect(): Promise<void> {
    try {
      const content = await window.$he3?.getLastClipboard()
      if (content && content !== lastContent.value) {
        lastContent.value = content
        detectedType.value = detectContentType(content)
      }
    } catch {
      // 忽略
    }
  }

  return {
    lastContent,
    detectedType,
    recommendedToolIds,
    detect
  }
})
