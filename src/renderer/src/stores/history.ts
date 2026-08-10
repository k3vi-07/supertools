import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageGetJSON, storageSetJSON } from '../utils/storage'

const MAX_HISTORY = 50

interface HistoryEntry {
  id: string
  timestamp: number
  useCount: number
}

export const useHistoryStore = defineStore('history', () => {
  /** 使用历史（按时间倒序） */
  const history = ref<HistoryEntry[]>([])

  /** 初始化 */
  function init(): void {
    const parsed = storageGetJSON<Array<{ id: string; timestamp: number; useCount?: number }>>('history', [])
    // 兼容旧数据：缺少 useCount 的补为 1
    history.value = parsed.map((h) => ({
      id: h.id,
      timestamp: h.timestamp,
      useCount: h.useCount ?? 1
    }))
  }

  /** 记录使用：递增使用次数 + 更新时间戳到最前 */
  function recordUse(toolId: string): void {
    const existing = history.value.find((h) => h.id === toolId)
    if (existing) {
      existing.useCount += 1
      existing.timestamp = Date.now()
      // 移到最前
      history.value = history.value.filter((h) => h.id !== toolId)
      history.value.unshift(existing)
    } else {
      history.value.unshift({ id: toolId, timestamp: Date.now(), useCount: 1 })
    }
    // 限制最大数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    save()
  }

  /** 最近使用的工具 id 列表（按时间倒序） */
  const recentToolIds = computed((): string[] => {
    return history.value.map((h) => h.id)
  })

  /** 最常使用的工具 id（按使用次数排序） */
  const mostUsedToolIds = computed((): string[] => {
    return [...history.value]
      .sort((a, b) => b.useCount - a.useCount)
      .map((h) => h.id)
  })

  function save(): void {
    storageSetJSON('history', history.value)
  }

  return {
    history,
    recentToolIds,
    mostUsedToolIds,
    init,
    recordUse
  }
})
