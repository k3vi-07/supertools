import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { registerComponents } from './components/register'
import { allTools, mergeRemoteTools } from './tools'
import { useToolsStore } from './stores/tools'
import { useSettingsStore } from './stores/settings'
import { useRemoteToolsStore } from './stores/remoteTools'
import { i18n } from './i18n'
import './assets/styles/global.less'

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

// 初始化工具注册表
const toolsStore = useToolsStore()
toolsStore.registerTools(allTools)

// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.init()

// 初始化远程工具
const remoteToolsStore = useRemoteToolsStore()
remoteToolsStore.init()
// 合并已安装的远程工具
mergeRemoteTools(remoteToolsStore.remoteToolManifests)
toolsStore.registerTools(allTools)

app.mount('#app')
