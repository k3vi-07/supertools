#!/usr/bin/env node
//
// 内置工具 manifest 校验脚本
// 校验各分类 manifests.ts 的所有 manifest 条目：
// - ID 唯一性和格式（kebab-case）
// - 必填字段非空
// - 分类合法性
// - 组件文件存在性
// - relatedToolId 引用有效性
// - 孤立组件检测
//
// 用法: node scripts/validate-manifests.mjs
// 退出码: 有错误返回 1，仅警告返回 0


import { readdirSync, readFileSync, existsSync, statSync } from 'fs'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = join(__dirname, '..')
const toolsDir = join(root, 'src/renderer/src/tools')

const VALID_CATEGORIES = ['encode', 'json', 'cryptography', 'text', 'web', 'color', 'datetime', 'programming', 'network']
const ID_REGEX = /^[a-z0-9][a-z0-9-]*$/

const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`
}

let errorCount = 0
let warnCount = 0
let toolCount = 0

function error(msg) { console.error(colors.red('  ❌ ' + msg)); errorCount++ }
function warn(msg) { console.warn(colors.yellow('  ⚠️  ' + msg)); warnCount++ }

/** 简易解析 manifests.ts，提取 export const 数组 */
function parseManifests(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const category = basename(dirname(filePath))
  const tools = []

  // 匹配 id: 'xxx' 块 — 用 id 为锚点提取每个 manifest 对象的字段
  const idMatches = [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)]

  for (const match of idMatches) {
    const id = match[1]
    const pos = match.index

    // 从 id 位置向后搜索同一对象内的字段
    const nameMatch = content.slice(pos, pos + 800).match(/name:\s*['"]([^'"]*)['"]/)
    const nameZhMatch = content.slice(pos, pos + 800).match(/nameZh:\s*['"]([^'"]*)['"]/)
    const iconMatch = content.slice(pos, pos + 800).match(/icon:\s*['"]([^'"]*)['"]/)
    const descMatch = content.slice(pos, pos + 800).match(/description:\s*['"]([^'"]*)['"]/)
    const compFileMatch = content.slice(pos, pos + 800).match(/componentFile:\s*['"]([^'"]*)['"]/)

    // category — 提取数组
    const catSlice = content.slice(pos, pos + 800)
    const catArray = catSlice.match(/category:\s*\[([^\]]*)\]/)
    const categories = catArray
      ? catArray[1].match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, '')) || []
      : []

    // keywords 数组
    const kwArray = catSlice.match(/keywords:\s*\[([^\]]*)\]/)
    const keywords = kwArray
      ? kwArray[1].match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, '')) || []
      : []

    // relatedToolId 数组
    const relArray = catSlice.match(/relatedToolId:\s*\[([^\]]*)\]/)
    const relatedToolIds = relArray
      ? relArray[1].match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, '')) || []
      : []

    tools.push({
      id,
      name: nameMatch?.[1] || '',
      nameZh: nameZhMatch?.[1] || '',
      icon: iconMatch?.[1] || '',
      description: descMatch?.[1] || '',
      category: categories,
      keywords,
      relatedToolIds,
      componentFile: compFileMatch?.[1] || null,
      categoryDir: category,
      file: filePath
    })
  }

  return tools
}

/** kebab-case id → PascalCase 文件名 */
function idToFileName(id) {
  return id.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + '.vue'
}

/** 收集所有 .vue 文件（相对 toolsDir） */
function collectVueFiles() {
  const files = new Set()
  function scan(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) scan(full)
      else if (entry.name.endsWith('.vue')) files.add(full)
    }
  }
  scan(toolsDir)
  return files
}

// ---- 主逻辑 ----
console.log(colors.bold('\n🔍 SuperTools Manifest 校验\n'))

const categories = readdirSync(toolsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

const allTools = []
const allIds = new Set()
const vueFiles = collectVueFiles()
const registeredVueFiles = new Set()

for (const cat of categories) {
  const manifestPath = join(toolsDir, cat, 'manifests.ts')
  if (!existsSync(manifestPath)) continue

  console.log(colors.cyan(`\n📁 ${cat}/`))
  const tools = parseManifests(manifestPath)

  for (const t of tools) {
    toolCount++
    let hasError = false

    // ID 格式
    if (!ID_REGEX.test(t.id)) {
      error(`${t.id}: ID 格式无效（需 kebab-case）`)
      hasError = true
    }

    // ID 唯一
    if (allIds.has(t.id)) {
      error(`${t.id}: ID 重复`)
      hasError = true
    } else {
      allIds.add(t.id)
    }

    // 必填字段
    for (const [field, val] of [['name', t.name], ['nameZh', t.nameZh], ['icon', t.icon], ['description', t.description]]) {
      if (!val || val.trim() === '') {
        error(`${t.id}: ${field} 为空`)
        hasError = true
      }
    }

    if (t.keywords.length === 0) warn(`${t.id}: keywords 为空`)

    // 分类合法
    if (t.category.length === 0) {
      error(`${t.id}: category 为空`)
      hasError = true
    }
    for (const c of t.category) {
      if (!VALID_CATEGORIES.includes(c)) {
        error(`${t.id}: category "${c}" 不在合法列表 [${VALID_CATEGORIES.join(', ')}]`)
        hasError = true
      }
    }

    // 组件文件存在
    const fileName = t.componentFile || idToFileName(t.id)
    const expectedPath = join(toolsDir, t.categoryDir, fileName)
    if (!existsSync(expectedPath)) {
      // 尝试全局搜索
      const globalMatch = [...vueFiles].find(f => f.endsWith('/' + fileName))
      if (!globalMatch) {
        error(`${t.id}: 组件文件不存在 (期望: ${t.categoryDir}/${fileName})`)
        hasError = true
      } else {
        warn(`${t.id}: 组件文件在 ${basename(dirname(globalMatch))}/ 而非 ${t.categoryDir}/`)
        registeredVueFiles.add(globalMatch)
      }
    } else {
      registeredVueFiles.add(expectedPath)
    }

    if (!hasError) console.log(colors.green(`  ✅ ${t.id}`))
  }

  allTools.push(...tools)
}

// relatedToolId 引用校验（在所有 ID 收集完后）
console.log(colors.cyan('\n🔗 关联工具引用校验'))
let refErrors = false
for (const t of allTools) {
  for (const refId of t.relatedToolIds) {
    if (!allIds.has(refId)) {
      error(`${t.id}: relatedToolId "${refId}" 不存在`)
      refErrors = true
    }
  }
}
if (!refErrors && allTools.some(t => t.relatedToolIds.length > 0)) {
  console.log(colors.green('  ✅ 所有关联引用有效'))
}

// 孤立组件检测
console.log(colors.cyan('\n📦 孤立组件检测'))
const orphans = [...vueFiles].filter(f => !registeredVueFiles.has(f))
if (orphans.length === 0) {
  console.log(colors.green('  ✅ 无孤立组件'))
} else {
  for (const orphan of orphans) {
    const rel = orphan.replace(toolsDir + '/', '')
    warn(`孤立组件: ${rel}（无对应 manifest）`)
  }
}

// 汇总
console.log(colors.bold('\n📊 汇总'))
console.log(`  工具总数: ${toolCount}`)
console.log(`  组件总数: ${vueFiles.size}`)
console.log(`  ${errorCount > 0 ? colors.red(`错误: ${errorCount}`) : colors.green('错误: 0')}`)
console.log(`  ${warnCount > 0 ? colors.yellow(`警告: ${warnCount}`) : colors.green('警告: 0')}`)

if (errorCount > 0) {
  console.log(colors.red('\n❌ 校验失败，请修复上述错误\n'))
  process.exit(1)
} else {
  console.log(colors.green('\n✅ 校验通过\n'))
  process.exit(0)
}
