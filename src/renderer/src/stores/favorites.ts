import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageGetJSON, storageSetJSON } from '../utils/storage'

export const useFavoritesStore = defineStore('favorites', () => {
  /** 收藏的工具 id 集合 */
  const favorites = ref<Set<string>>(new Set())
  /** 收藏排序 */
  const favoritesOrder = ref<string[]>([])

  /** 初始化：从 localStorage 加载 */
  function init(): void {
    favorites.value = new Set(storageGetJSON<string[]>('favorites', []))
    favoritesOrder.value = storageGetJSON<string[]>('favorites-order', [])
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
    storageSetJSON('favorites', Array.from(favorites.value))
    storageSetJSON('favorites-order', favoritesOrder.value)
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
