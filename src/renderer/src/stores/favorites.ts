import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const FAVORITES_KEY = 'supertools:favorites'
const FAVORITES_ORDER_KEY = 'supertools:favorites-order'

export const useFavoritesStore = defineStore('favorites', () => {
  /** 收藏的工具 id 集合 */
  const favorites = ref<Set<string>>(new Set())
  /** 收藏排序 */
  const favoritesOrder = ref<string[]>([])

  /** 初始化：从 localStorage 加载 */
  function init(): void {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        favorites.value = new Set(JSON.parse(stored))
      }
      const order = localStorage.getItem(FAVORITES_ORDER_KEY)
      if (order) {
        favoritesOrder.value = JSON.parse(order)
      }
    } catch {
      // 忽略
    }
  }

  /** 收藏列表（按排序） */
  const favoriteList = computed((): string[] => {
    const ordered = favoritesOrder.value.filter((id) => favorites.value.has(id))
    const unordered = Array.from(favorites.value).filter((id) => !ordered.includes(id))
    return [...ordered, ...unordered]
  })

  /** 是否已收藏 */
  function isFavorite(id: string): boolean {
    return favorites.value.has(id)
  }

  /** 切换收藏 */
  function toggleFavorite(id: string): void {
    if (favorites.value.has(id)) {
      favorites.value.delete(id)
    } else {
      favorites.value.add(id)
      if (!favoritesOrder.value.includes(id)) {
        favoritesOrder.value.push(id)
      }
    }
    save()
  }

  /** 重新排序 */
  function reorder(newOrder: string[]): void {
    favoritesOrder.value = newOrder
    save()
  }

  /** 保存到 localStorage */
  function save(): void {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites.value)))
    localStorage.setItem(FAVORITES_ORDER_KEY, JSON.stringify(favoritesOrder.value))
  }

  return {
    favorites,
    favoritesOrder,
    favoriteList,
    init,
    isFavorite,
    toggleFavorite,
    reorder
  }
})
