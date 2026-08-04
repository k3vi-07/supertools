<template>
  <h-single-layout>
    <div class="color-converter">
      <div class="color-converter__preview" :style="{ background: cssColor }">
        <div class="color-converter__preview-text">{{ cssColor.toUpperCase() }}</div>
      </div>

      <div class="color-converter__picker">
        <label class="color-converter__label">选择颜色</label>
        <input type="color" v-model="hexValue" class="color-converter__color-input" />
      </div>

      <div class="color-converter__formats">
        <div v-for="fmt in formats" :key="fmt.label" class="color-converter__format-item">
          <div class="color-converter__format-header">
            <span>{{ fmt.label }}</span>
            <button class="color-converter__copy-btn" @click="copy(fmt.value)">
              <h-icon icon="mdi:content-copy" :size="14" />
            </button>
          </div>
          <code class="color-converter__format-value selectable">{{ fmt.value }}</code>
        </div>
      </div>

      <div class="color-converter__rgb-controls">
        <div v-for="(ctrl, i) in rgbControls" :key="ctrl.label" class="color-converter__slider-group">
          <label class="color-converter__slider-label">{{ ctrl.label }}</label>
          <input type="range" :min="0" :max="ctrl.max" v-model.number="ctrl.value" class="color-converter__slider" @input="updateFromRgb" />
          <span class="color-converter__slider-value">{{ ctrl.value }}</span>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const hexValue = ref('#7c3aed')

const rgb = reactive({ r: 124, g: 58, b: 237 })

const rgbControls = reactive([
  { label: 'R', value: 124, max: 255 },
  { label: 'G', value: 58, max: 255 },
  { label: 'B', value: 237, max: 255 }
])

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function updateFromHex(): void {
  const c = hexToRgb(hexValue.value)
  rgb.r = c.r; rgb.g = c.g; rgb.b = c.b
  rgbControls[0].value = c.r
  rgbControls[1].value = c.g
  rgbControls[2].value = c.b
}

function updateFromRgb(): void {
  rgb.r = rgbControls[0].value
  rgb.g = rgbControls[1].value
  rgb.b = rgbControls[2].value
  hexValue.value = rgbToHex(rgb.r, rgb.g, rgb.b)
}

// 监听 hex 变化
const cssColor = computed(() => hexValue.value)

const formats = computed(() => {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return [
    { label: 'HEX', value: hexValue.value.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'RGB Values', value: `${rgb.r}, ${rgb.g}, ${rgb.b}` }
  ]
})

// 监听颜色选择器变化
import { watch } from 'vue'
watch(hexValue, () => updateFromHex())

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.color-converter {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    height: 80px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
  }

  &__preview-text {
    font-family: 'SF Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  &__picker {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__color-input {
    width: 60px;
    height: 36px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: transparent;
  }

  &__formats {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__format-item {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__format-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
  }

  &__format-value {
    display: block;
    padding: 8px 12px;
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-code);
  }

  &__rgb-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  &__slider-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__slider-label {
    width: 24px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__slider {
    flex: 1;
    accent-color: var(--color-primary);
  }

  &__slider-value {
    width: 36px;
    text-align: right;
    font-family: monospace;
    font-size: 12px;
    color: var(--text-primary);
  }
}
</style>
