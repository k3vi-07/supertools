<template>
  <h-single-layout>
    <div class="color-palette">
      <div class="color-palette__base">
        <label>基础颜色</label>
        <div class="color-palette__picker-row">
          <input type="color" v-model="baseColor" class="color-palette__picker" />
          <h-input v-model="baseColor" placeholder="#7c3aed" />
          <h-select v-model="scheme" :options="schemeOptions" />
        </div>
      </div>
      <div class="color-palette__palette">
        <div
          v-for="(color, i) in palette"
          :key="i"
          class="color-palette__color"
          :style="{ background: color }"
          @click="copy(color)"
        >
          <span class="color-palette__hex">{{ color.toUpperCase() }}</span>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const baseColor = ref('#7c3aed')
const scheme = ref<'analogous' | 'complementary' | 'triadic' | 'monochrome'>('analogous')

const schemeOptions = [
  { label: '类比色', value: 'analogous' },
  { label: '互补色', value: 'complementary' },
  { label: '三元色', value: 'triadic' },
  { label: '单色渐变', value: 'monochrome' }
]

const palette = computed(() => {
  const base = hexToHsl(baseColor.value)
  if (!base) return []
  const { h, s, l } = base
  const colors: string[] = []

  switch (scheme.value) {
    case 'analogous':
      for (let i = -2; i <= 2; i++) {
        colors.push(hslToHex((h + i * 30 + 360) % 360, s, l))
      }
      break
    case 'complementary':
      colors.push(hslToHex(h, s, l))
      colors.push(hslToHex(h, s * 0.7, l * 1.3 > 90 ? 85 : l * 1.3))
      colors.push(hslToHex((h + 180) % 360, s, l))
      colors.push(hslToHex((h + 180) % 360, s * 0.7, l * 1.3 > 90 ? 85 : l * 1.3))
      colors.push(hslToHex(h, s, l * 0.6))
      break
    case 'triadic':
      colors.push(hslToHex(h, s, l))
      colors.push(hslToHex((h + 120) % 360, s, l))
      colors.push(hslToHex((h + 240) % 360, s, l))
      colors.push(hslToHex(h, s * 0.5, l * 1.2 > 90 ? 88 : l * 1.2))
      colors.push(hslToHex(h, s, l * 0.5))
      break
    case 'monochrome':
      for (let i = 0; i < 5; i++) {
        colors.push(hslToHex(h, s, Math.max(10, Math.min(90, l - 30 + i * 15))))
      }
      break
  }
  return colors
})

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
      case g: h = ((b - r) / d + 2) * 60; break
      case b: h = ((r - g) / d + 4) * 60; break
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x } else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c } else { r = c; b = x }
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')
}

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success(`已复制: ${text}`)
}
</script>

<style scoped lang="less">
.color-palette {
  display: flex; flex-direction: column; gap: 16px;
  &__base { display: flex; flex-direction: column; gap: 8px; label { font-size: 12px; color: var(--text-secondary); } }
  &__picker-row { display: flex; gap: 8px; align-items: center; }
  &__picker { width: 48px; height: 32px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; }
  &__palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
  &__color {
    height: 80px; border-radius: var(--radius-sm); cursor: pointer;
    display: flex; align-items: flex-end; justify-content: center;
    transition: transform var(--transition-fast);
    &:hover { transform: scale(1.05); }
  }
  &__hex {
    padding: 3px 8px; background: rgba(0,0,0,0.6); color: white;
    border-radius: 4px; font-size: 10px; font-family: monospace;
    margin-bottom: 6px;
  }
}
</style>
