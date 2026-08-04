import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const HISTORY_KEY = 'supertools:history'
const MAX_HISTORY = 50

interface HistoryEntry {
  id: string
  timestamp: number
}

export const useHistoryStore = defineStore('history', () => {
  /** 使用历史（按时间倒序） */
  const history = ref<HistoryEntry[]>([])

  /** 初始化 */
  function init(): void {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch {
      // 忽略
    }
  }

  /** 记录使用 */
  function recordUse(toolId: string): void {
    // 移除已有记录
    history.value = history.value.filter((h) => h.id !== toolId)
    // 添加到最前面
    history.value.unshift({ id: toolId, timestamp: Date.now() })
    // 限制最大数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    save()
  }

  /** 最近使用的工具 id 列表 */
  const recentToolIds = computed((): string[] => {
    return history.value.map((h) => h.id)
  })

  /** 最常使用的工具 id（按使用次数排序） */
  const mostUsedToolIds = computed((): string[] => {
    const countMap = new Map<string, number>()
    for (const h of history.value) {
      countMap.set(h.id, (countMap.get(h.id) || 0) + 1)
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
  })

  function save(): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }

  return {
    history,
    recentToolIds,
    mostUsedToolIds,
    init,
    recordUse
  }
})
