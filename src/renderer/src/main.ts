import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { registerComponents } from './components/register'
import { allTools, mergeRemoteTools } from './tools'
import { useToolsStore } from './stores/tools'
import { useSettingsStore } from './stores/settings'
import { useRemoteToolsStore } from './stores/remoteTools'
import { useFavoritesStore } from './stores/favorites'
import { useHistoryStore } from './stores/history'
import { useUpdaterStore } from './stores/updater'
import { i18n } from './i18n'
import { setupIcons } from './utils/iconSetup'
import './assets/styles/global.less'

// 预加载离线图标集（MDI 7600+ 图标，不再依赖网络）
setupIcons()

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue')
    },
    {
      path: '/category/:category',
      name: 'category',
      component: () => import('./views/CategoryView.vue')
    },
    {
      path: '/tool/:id',
      name: 'tool',
      component: () => import('./views/ToolView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('./views/SearchView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/SettingsView.vue')
    },
    {
      path: '/store',
      name: 'store',
      component: () => import('./views/StoreView.vue')
    }
  ]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// 注册全局 h- 组件
registerComponents(app)

// 初始化各 store（统一在 mount 前完成，避免 MainLayout 重复初始化）
const toolsStore = useToolsStore()
const settingsStore = useSettingsStore()
const remoteToolsStore = useRemoteToolsStore()
const favoritesStore = useFavoritesStore()
const historyStore = useHistoryStore()

settingsStore.init()
remoteToolsStore.init()
favoritesStore.init()
historyStore.init()

// 合并远程工具后注册一次（无需先注册本地再重注册）
mergeRemoteTools(remoteToolsStore.remoteToolManifests)
toolsStore.registerTools(allTools)

// 延迟初始化自动更新（不阻塞首屏渲染）
setTimeout(() => {
  const updaterStore = useUpdaterStore()
  updaterStore.init()
}, 3000)

app.mount('#app')
