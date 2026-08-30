/**
 * 远程 registry.json schema 校验
 *
 * 确保远程仓库返回的数据结构合法，防止：
 * - 字段缺失或类型错误
 * - 路径穿越攻击（../）
 * - 非法分类
 * - ID 重复
 * - 超大/畸形数据
 */
import type { RemoteRegistry, RemoteToolEntry } from '@shared/types'

/** 合法分类 */
const VALID_CATEGORIES = new Set([
  'encode', 'json', 'cryptography', 'text', 'web', 'color', 'datetime', 'programming', 'network'
])

/** ID 格式：kebab-case 小写字母/数字/短横线 */
const ID_REGEX = /^[a-z0-9][a-z0-9-]{0,63}$/
/** path 格式：tools/Xxx.vue，禁止 .. 和特殊字符 */
const PATH_REGEX = /^[a-zA-Z0-9/._-]+\.vue$/
/** 版本号格式 */
const VERSION_REGEX = /^v?\d+\.\d+\.\d+$|^(master|main|latest|[a-f0-9]{7,40})$/

export interface ValidationResult {
  valid: boolean
  errors: string[]
  sanitized: RemoteRegistry | null
}

/** 校验单个工具条目 */
function validateToolEntry(entry: unknown, index: number, seenIds: Set<string>): string[] {
  const errors: string[] = []
  const prefix = `工具[${index}]`

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return [`${prefix}: 必须是对象`]
  }
  const e = entry as Record<string, unknown>

  // 必填字段
  if (typeof e.id !== 'string' || !ID_REGEX.test(e.id)) {
    errors.push(`${prefix}: id 格式无效（需为 kebab-case）`)
  } else if (seenIds.has(e.id)) {
    errors.push(`${prefix}: id "${e.id}" 重复`)
  } else {
    seenIds.add(e.id)
  }

  if (typeof e.name !== 'string' || e.name.length === 0 || e.name.length > 200) {
    errors.push(`${prefix}: name 无效`)
  }

  if (typeof e.nameZh !== 'string' || e.nameZh.length === 0 || e.nameZh.length > 200) {
    errors.push(`${prefix}: nameZh 无效`)
  }

  if (typeof e.icon !== 'string' || e.icon.length === 0 || e.icon.length > 100) {
    errors.push(`${prefix}: icon 无效`)
  }

  // path — 关键安全字段
  if (typeof e.path !== 'string' || !PATH_REGEX.test(e.path)) {
    errors.push(`${prefix}: path "${e.path}" 无效（需为 xxx.vue 格式，禁止 .. 等）`)
  } else if (e.path.includes('..')) {
    errors.push(`${prefix}: path 包含路径穿越字符 ..`)
  }

  // category
  if (!Array.isArray(e.category) || e.category.length === 0) {
    errors.push(`${prefix}: category 无效`)
  } else {
    for (const cat of e.category) {
      if (typeof cat !== 'string' || !VALID_CATEGORIES.has(cat)) {
        errors.push(`${prefix}: category "${cat}" 不在合法列表中`)
      }
    }
  }

  // keywords
  if (!Array.isArray(e.keywords) || e.keywords.length > 30 || e.keywords.some((k) => typeof k !== 'string' || k.length > 100)) {
    errors.push(`${prefix}: keywords 无效（需为数组，最多 30 个）`)
  }

  // description
  if (typeof e.description !== 'string' || e.description.length > 500) {
    errors.push(`${prefix}: description 无效`)
  }

  // version（可选）
  if (e.version !== undefined && e.version !== null) {
    if (typeof e.version !== 'string' || !VERSION_REGEX.test(e.version)) {
      errors.push(`${prefix}: version "${e.version}" 格式无效`)
    }
  }

  return errors
}

/**
 * 校验 registry 数据
 * @returns 校验结果，包含 sanitized 数据（仅合法条目）和错误列表
 */
export function validateRegistry(data: unknown): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['数据不是有效对象'], sanitized: null }
  }

  const reg = data as Record<string, unknown>

  // tools 数组校验
  if (!Array.isArray(reg.tools)) {
    return { valid: false, errors: ['tools 不是数组'], sanitized: null }
  }
  if (reg.tools.length > 500) {
    errors.push(`工具数量过多: ${reg.tools.length}（上限 500）`)
  }

  // 逐条校验
  const seenIds = new Set<string>()
  const validTools: RemoteToolEntry[] = []

  for (let i = 0; i < reg.tools.length; i++) {
    const toolErrors = validateToolEntry(reg.tools[i], i, seenIds)
    if (toolErrors.length === 0) {
      validTools.push(reg.tools[i] as RemoteToolEntry)
    } else {
      errors.push(...toolErrors)
    }
  }

  const sanitized: RemoteRegistry = {
    name: typeof reg.name === 'string' ? reg.name : '未命名仓库',
    description: typeof reg.description === 'string' ? reg.description : undefined,
    tools: validTools
  }

  // 如果没有任何合法工具，认为校验失败
  if (validTools.length === 0 && reg.tools.length > 0) {
    return { valid: false, errors: [...errors, '没有合法的工具条目'], sanitized: null }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}
