import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Theme, Lang } from '@shared/types'

const THEME_KEY = 'supertools:theme'
const LANG_KEY = 'supertools:lang'

/** 默认快捷键 */
const DEFAULT_SHORTCUTS = {
  main: '',
  search: '',
  appSearch: ''
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('dark')
  const lang = ref<Lang>('zh')

  /** 快捷键配置（从主进程同步） */
  const mainShortcut = ref('')
  const searchShortcut = ref('')
  const appSearchShortcut = ref('')

  function init(): void {
    // 加载主题
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
    setTheme(savedTheme)

    // 加载语言
    const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'zh'
    setLang(savedLang)

    // 从主进程加载快捷键配置
    loadShortcuts()
  }

  /** 从主进程加载快捷键 */
  async function loadShortcuts(): Promise<void> {
    try {
      const shortcuts = await window.supertools?.getShortcuts()
      if (shortcuts) {
        mainShortcut.value = shortcuts.main || ''
        searchShortcut.value = shortcuts.search || ''
        appSearchShortcut.value = shortcuts.appSearch || ''
      }
    } catch {
      // 忽略
    }
  }

  /** 更新某个快捷键 */
  async function setShortcut(
    type: 'main' | 'search' | 'appSearch',
    accelerator: string
  ): Promise<{ ok: boolean; error?: string }> {
    // appSearch 是应用内快捷键，不走主进程 globalShortcut
    if (type === 'appSearch') {
      appSearchShortcut.value = accelerator
      // 应用内快捷键也持久化到主进程（保存但不注册 global）
      try {
        await window.supertools?.updateShortcuts({ appSearch: accelerator })
      } catch {
        // 忽略
      }
      return { ok: true }
    }

    // main / search 走主进程注册
    try {
      const result = await window.supertools?.updateShortcuts({ [type]: accelerator })
      if (result?.ok) {
        if (type === 'main') mainShortcut.value = accelerator
        if (type === 'search') searchShortcut.value = accelerator
        return { ok: true }
      }
      return { ok: false, error: result?.error || '注册失败' }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  }

  function setTheme(newTheme: Theme): void {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }

  function toggleTheme(): void {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function setLang(newLang: Lang): void {
    lang.value = newLang
    localStorage.setItem(LANG_KEY, newLang)
  }

  return {
    theme,
    lang,
    mainShortcut,
    searchShortcut,
    appSearchShortcut,
    init,
    setTheme,
    toggleTheme,
    setLang,
    setShortcut,
    loadShortcuts
  }
})
