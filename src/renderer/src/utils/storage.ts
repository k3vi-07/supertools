/**
 * 统一 localStorage 存储层
 *
 * 所有 key 自动加 supertools: 前缀，避免与其他应用冲突。
 * JSON 方法内置 try-catch + fallback，防止数据损坏导致崩溃。
 */

const PREFIX = 'supertools:'

/** 读取字符串值 */
export function storageGet(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(PREFIX + key) ?? fallback
  } catch {
    return fallback
  }
}

/** 写入字符串值 */
export function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value)
  } catch {
    // 忽略 quota 超限或隐私模式
  }
}

/** 删除值 */
export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // 忽略
  }
}

/** 读取并 JSON.parse，失败返回 fallback */
export function storageGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** JSON.stringify 后写入 */
export function storageSetJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 忽略
  }
}
