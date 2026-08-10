/**
 * 快捷键统一解析与格式化模块
 *
 * 消除 ShortcutRecorder.vue 和 MainLayout.vue 中的重复逻辑。
 */

/** 运行时检测 macOS（延迟评估，便于测试 mock） */
function getIsMac(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
}

/**
 * 格式化 accelerator 为显示字符串（带分隔符）
 * "Command+Shift+K" → "⌘ + ⇧ + K" (Mac) / "Ctrl + Shift + K" (Win)
 */
export function formatShortcut(accelerator: string): string {
  if (!accelerator) return ''
  const isMac = getIsMac()
  return accelerator
    .replace(/Command\+/g, isMac ? '⌘+' : 'Ctrl+')
    .replace(/Cmd\+/g, isMac ? '⌘+' : 'Ctrl+')
    .replace(/Control\+/g, 'Ctrl+')
    .replace(/Option\+/g, isMac ? '⌥+' : 'Alt+')
    .replace(/Alt\+/g, isMac ? '⌥+' : 'Alt+')
    .replace(/Shift\+/g, isMac ? '⇧+' : 'Shift+')
    .replace(/\+/g, ' + ')
}

/**
 * 格式化为紧凑显示（侧栏 kbd 用，无分隔符）
 * "Command+K" → "⌘K" (Mac) / "CtrlK" (Win)
 */
export function formatShortcutHint(accelerator: string): string {
  if (!accelerator) return ''
  const isMac = getIsMac()
  return accelerator
    .replace(/Command\+/g, isMac ? '⌘+' : 'Ctrl+')
    .replace(/Cmd\+/g, isMac ? '⌘+' : 'Ctrl+')
    .replace(/Control\+/g, 'Ctrl+')
    .replace(/Option\+/g, isMac ? '⌥+' : 'Alt+')
    .replace(/Alt\+/g, isMac ? '⌥+' : 'Alt+')
    .replace(/Shift\+/g, isMac ? '⇧+' : 'Shift+')
    .replace(/\+/g, '')
}

/**
 * 检查 KeyboardEvent 是否匹配 accelerator
 * accelerator 格式: "Command+K", "Ctrl+Shift+P", "Alt+Space" 等
 */
export function matchesShortcut(e: KeyboardEvent, accelerator: string): boolean {
  if (!accelerator) return false
  const parts = accelerator.split('+')
  const needCtrl = parts.includes('Ctrl')
  const needCmd = parts.includes('Command')
  const needAlt = parts.includes('Alt')
  const needShift = parts.includes('Shift')
  const key = parts[parts.length - 1].toLowerCase()

  if (needCtrl !== e.ctrlKey) return false
  if (needCmd !== e.metaKey) return false
  if (needAlt !== e.altKey) return false
  if (needShift !== e.shiftKey) return false
  return e.key.toLowerCase() === key
}

/**
 * 校验 accelerator 字符串是否合法
 * 至少需要一个修饰键 + 一个主键（或 F 键单独使用）
 */
export function isValidAccelerator(accelerator: string): boolean {
  if (!accelerator) return true // 空值 = 禁用，视为合法
  const parts = accelerator.split('+')
  if (parts.length < 2) {
    // 单键只允许 F1-F12
    return /^F\d{1,2}$/.test(parts[0])
  }
  return true
}
