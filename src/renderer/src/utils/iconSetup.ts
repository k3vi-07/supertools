/**
 * Iconify 离线图标预加载
 *
 * 默认 @iconify/vue 的 Icon 组件在找不到本地图标时会向
 * api.iconify.design 发请求，网络不稳定时图标长时间空白。
 *
 * 这里在启动时将整个 MDI 图标集注册到内存存储，
 * 确保所有 mdi: 前缀图标离线可用，不依赖网络。
 */
import { addCollection } from '@iconify/vue/offline'
// @iconify-json/mdi 包含完整的 MDI 图标集（7600+ 图标）
import mdiIcons from '@iconify-json/mdi/icons.json'

let loaded = false

export function setupIcons(): void {
  if (loaded) return
  // 注册完整 MDI 图标集到内存存储（同步操作）
  addCollection(mdiIcons as Parameters<typeof addCollection>[0])
  loaded = true
}


