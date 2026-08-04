import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 时间日期工具元数据 */
export const datetimeToolManifests: Manifest[] = [
  { id: 'hms-seconds-convert', name: 'HMS to Seconds', nameZh: '时分秒 ↔ 秒互转', icon: 'mdi:timer-sand', category: ['datetime'], keywords: ['hms', 'seconds', 'time', 'convert', '时分秒', '秒'], description: '时:分:秒 与秒数互转' },
  { id: 'timezone-convert', name: 'Timezone Convert', nameZh: '时区转换', icon: 'mdi:earth-clock', category: ['datetime'], keywords: ['timezone', 'convert', '时区', '转换'], description: '全球主要时区时间转换' }
]
