import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Theme, Lang } from '@shared/types'

const THEME_KEY = 'supertools:theme'
const LANG_KEY = 'supertools:lang'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('dark')
  const lang = ref<Lang>('zh')

  function init(): void {
    // 加载主题
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'dark'
    setTheme(savedTheme)

    // 加载语言
    const savedLang = (localStorage.getItem(LANG_KEY) as Lang) || 'zh'
    setLang(savedLang)
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
    init,
    setTheme,
    toggleTheme,
    setLang
  }
})
