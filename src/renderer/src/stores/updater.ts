import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 更新状态 */
export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export const useUpdaterStore = defineStore('updater', () => {
  /** 当前状态 */
  const status = ref<UpdateStatus>('idle')
  /** 当前应用版本 */
  const currentVersion = ref('')
  /** 可用的新版本号 */
  const availableVersion = ref('')
  /** 下载进度 (0-100) */
  const progress = ref(0)
  /** 错误信息 */
  const errorMessage = ref('')

  /** 是否已初始化 */
  let initialized = false

  /** 初始化：订阅更新事件，获取当前版本 */
  async function init(): Promise<void> {
    if (initialized) return
    initialized = true

    // 获取当前版本
    try {
      const result = await window.supertools.getUpdateStatus()
      currentVersion.value = result.currentVersion
    } catch {
      currentVersion.value = '1.0.0'
    }

    // 订阅主进程的更新事件
    window.supertools.onUpdateEvent((event) => {
      switch (event.type) {
        case 'checking':
          status.value = 'checking'
          errorMessage.value = ''
          break
        case 'available':
          status.value = 'available'
          availableVersion.value = event.info?.version || ''
          progress.value = 0
          // toast 提示
          window.$he3?.message.info(
            `发现新版本 v${event.info?.version}，正在后台下载...`
          )
          break
        case 'not-available':
          status.value = 'not-available'
          break
        case 'progress':
          status.value = 'downloading'
          progress.value = Math.round(event.info?.percent || 0)
          break
        case 'downloaded':
          status.value = 'downloaded'
          // toast 提示
          window.$he3?.message.success('更新已下载，重启后即可生效')
          break
        case 'error':
          status.value = 'error'
          errorMessage.value = event.info?.message || '未知错误'
          break
      }
    })
  }

  /** 手动检查更新 */
  async function checkForUpdates(): Promise<void> {
    status.value = 'checking'
    errorMessage.value = ''
    try {
      await window.supertools.checkForUpdates()
    } catch (err) {
      status.value = 'error'
      errorMessage.value = (err as Error).message
    }
  }

  /** 安装已下载的更新 */
  function installUpdate(): void {
    window.supertools.installUpdate()
  }

  return {
    status,
    currentVersion,
    availableVersion,
    progress,
    errorMessage,
    init,
    checkForUpdates,
    installUpdate
  }
})
