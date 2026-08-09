#!/usr/bin/env node
//
// 社区仓库 registry.json 校验脚本
//
// 校验内容：
// - ID 唯一性 + 格式 (kebab-case)
// - path 对应 .vue 文件存在
// - path 禁止路径穿越 (..)
// - 分类合法性
// - 必填字段完整
// - 孤立文件检测（有 .vue 但未注册）
//
// 用法:
//   node scripts/validate-registry.mjs                          # 默认 ../supertools-community
//   node scripts/validate-registry.mjs /path/to/community-repo  # 指定路径

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const VALID_CATEGORIES = ['encode', 'json', 'cryptography', 'text', 'web', 'color', 'datetime', 'programming', 'network']
const ID_REGEX = /^[a-z0-9][a-z0-9-]*$/
const PATH_REGEX = /^[a-zA-Z0-9/._-]+\.vue$/

const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`
}

let errorCount = 0
let warnCount = 0

function error(msg) { console.error(colors.red('  ❌ ' + msg)); errorCount++ }
function warn(msg) { console.warn(colors.yellow('  ⚠️  ' + msg)); warnCount++ }

// 确定仓库路径
const repoPath = process.argv[2] || join(__dirname, '..', '..', 'supertools-community')
const registryPath = join(repoPath, 'registry.json')
const toolsDir = join(repoPath, 'tools')

console.log(colors.bold('\n🔍 Registry 校验\n'))

if (!existsSync(registryPath)) {
  console.error(colors.red(`❌ 找不到 registry.json: ${registryPath}`))
  console.error(colors.dim('   用法: node scripts/validate-registry.mjs /path/to/community-repo'))
  process.exit(1)
}

// 读取 registry.json
let registry
try {
  registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
} catch (e) {
  console.error(colors.red(`❌ registry.json 解析失败: ${e.message}`))
  process.exit(1)
}

console.log(colors.cyan(`仓库: ${registry.name || '未命名'}`))
console.log(colors.cyan(`版本: ${registry.version || '未指定'}`))
console.log(colors.cyan(`工具数: ${registry.tools?.length || 0}\n`))

if (!Array.isArray(registry.tools)) {
  console.error(colors.red('❌ tools 不是数组'))
  process.exit(1)
}

if (registry.tools.length > 500) {
  error(`工具数量过多: ${registry.tools.length}（上限 500）`)
}

// 收集所有 .vue 文件
const vueFiles = existsSync(toolsDir)
  ? new Set(readdirSync(toolsDir).filter(f => f.endsWith('.vue')))
  : new Set()
const registeredFiles = new Set()
const seenIds = new Set()

// 逐条校验
for (let i = 0; i < registry.tools.length; i++) {
  const t = registry.tools[i]
  const prefix = `[${i}]`
  let hasError = false

  // ID
  if (typeof t.id !== 'string' || !ID_REGEX.test(t.id)) {
    error(`${prefix} id "${t.id}" 格式无效（需 kebab-case）`)
    hasError = true
  } else if (seenIds.has(t.id)) {
    error(`${prefix} id "${t.id}" 重复`)
    hasError = true
  } else {
    seenIds.add(t.id)
  }

  // 必填字段
  for (const [field, max] of [['name', 200], ['nameZh', 200], ['icon', 100], ['description', 500]]) {
    if (typeof t[field] !== 'string' || t[field].length === 0) {
      error(`${prefix} ${t.id || '?'}: ${field} 为空`)
      hasError = true
    } else if (t[field].length > max) {
      warn(`${prefix} ${t.id}: ${field} 过长 (${t[field].length} > ${max})`)
    }
  }

  // path
  if (typeof t.path !== 'string') {
    error(`${prefix} ${t.id}: path 缺失`)
    hasError = true
  } else {
    if (t.path.includes('..')) {
      error(`${prefix} ${t.id}: path 包含路径穿越字符 ..`)
      hasError = true
    }
    if (!PATH_REGEX.test(t.path)) {
      error(`${prefix} ${t.id}: path "${t.path}" 格式无效（需 xxx.vue）`)
      hasError = true
    }
    const fullPath = join(repoPath, t.path)
    if (!existsSync(fullPath)) {
      error(`${prefix} ${t.id}: 文件不存在 ${t.path}`)
      hasError = true
    } else {
      registeredFiles.add(basename(t.path))
    }
  }

  // category
  if (!Array.isArray(t.category) || t.category.length === 0) {
    error(`${prefix} ${t.id}: category 为空`)
    hasError = true
  } else {
    for (const c of t.category) {
      if (!VALID_CATEGORIES.includes(c)) {
        error(`${prefix} ${t.id}: category "${c}" 不合法`)
        hasError = true
      }
    }
  }

  // keywords
  if (!Array.isArray(t.keywords)) {
    warn(`${prefix} ${t.id}: keywords 不是数组`)
  } else if (t.keywords.length === 0) {
    warn(`${prefix} ${t.id}: keywords 为空`)
  }

  if (!hasError) console.log(colors.green(`  ✅ ${t.id}`))
}

// 孤立文件检测
console.log(colors.cyan('\n📦 孤立文件检测'))
const orphans = [...vueFiles].filter(f => !registeredFiles.has(f))
if (orphans.length === 0) {
  console.log(colors.green('  ✅ 无孤立文件'))
} else {
  for (const orphan of orphans) {
    warn(`孤立文件: tools/${orphan}（在 registry 中未注册）`)
  }
}

// 汇总
console.log(colors.bold('\n📊 汇总'))
console.log(`  注册工具: ${registry.tools.length}`)
console.log(`  .vue 文件: ${vueFiles.size}`)
console.log(`  ${errorCount > 0 ? colors.red(`错误: ${errorCount}`) : colors.green('错误: 0')}`)
console.log(`  ${warnCount > 0 ? colors.yellow(`警告: ${warnCount}`) : colors.green('警告: 0')}`)

if (errorCount > 0) {
  console.log(colors.red('\n❌ 校验失败\n'))
  process.exit(1)
} else {
  console.log(colors.green('\n✅ 校验通过\n'))
  process.exit(0)
}
