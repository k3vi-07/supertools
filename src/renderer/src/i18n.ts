import { createI18n } from 'vue-i18n'
import { zhMessages } from './locales/zh'
import { enMessages } from './locales/en'

/** 共享的 i18n 实例，避免循环依赖 */
export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'zh',
  fallbackLocale: 'en',
  messages: {
    zh: zhMessages,
    en: enMessages
  }
})
