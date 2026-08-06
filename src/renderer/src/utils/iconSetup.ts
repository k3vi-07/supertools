/**
 * Iconify 离线图标预加载
 *
 * 默认 @iconify/vue 在运行时从 api.iconify.design 按需加载图标，
 * 网络不稳定时图标无法显示。这里在启动时将整个 MDI 图标集注册到内存，
 * 确保所有 mdi: 前缀图标离线可用。
 */
import { addCollection } from '@iconify/vue'
// @iconify-json/mdi 包含完整的 MDI 图标集（7600+ 图标）
import mdiIcons from '@iconify-json/mdi/icons.json'

let loaded = false

export function setupIcons(): void {
  if (loaded) return
  addCollection(mdiIcons as Parameters<typeof addCollection>[0])
  loaded = true
}
