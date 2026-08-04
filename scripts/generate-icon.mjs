/**
 * SuperTools 应用图标生成器
 * 极简代码风：深色圆角方形背景 + 绿色 >_ 符号
 *
 * 用法: node scripts/generate-icon.mjs
 * 输出: build/icon.png (1024x1024)
 *       src/renderer/src/assets/icon.png (用于侧边栏 logo)
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

/** 图标 SVG 设计 */
function createIconSVG(size = 1024) {
  const radius = size * 0.18 // 圆角半径
  const fontSize = size * 0.42
  const strokeWidth = size * 0.035

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- 背景渐变：深蓝紫 -> 深紫 -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
    <!-- >_ 符号发光效果 -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${size * 0.015}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 圆角方形背景 -->
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>

  <!-- >_ 符号 -->
  <g filter="url(#glow)">
    <!-- > 部分（折线） -->
    <polyline
      points="${size * 0.26},${size * 0.34} ${size * 0.44},${size * 0.50} ${size * 0.26},${size * 0.66}"
      fill="none"
      stroke="#00e676"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- _ 部分（底部横线） -->
    <line
      x1="${size * 0.50}" y1="${size * 0.68}"
      x2="${size * 0.74}" y2="${size * 0.68}"
      stroke="#00e676"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
    />
  </g>
</svg>`
}

async function main() {
  const svg = createIconSVG(1024)

  // 输出到 build/icon.png（electron-builder 自动识别）
  const buildIconPath = join(root, 'build', 'icon.png')
  mkdirSync(join(root, 'build'), { recursive: true })

  await sharp(Buffer.from(svg))
    .png()
    .toFile(buildIconPath)
  console.log(`✅ 生成: ${buildIconPath}`)

  // 输出到 src/renderer/src/assets/icon.png（侧边栏 logo + favicon）
  const assetIconPath = join(root, 'src', 'renderer', 'src', 'assets', 'icon.png')
  mkdirSync(dirname(assetIconPath), { recursive: true })

  await sharp(Buffer.from(svg))
    .png()
    .toFile(assetIconPath)
  console.log(`✅ 生成: ${assetIconPath}`)

  // 同时保存 SVG 源文件以备后用
  const svgPath = join(root, 'build', 'icon.svg')
  writeFileSync(svgPath, svg)
  console.log(`✅ 生成: ${svgPath}`)
}

main().catch(console.error)
