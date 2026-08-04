<template>
  <h-single-layout>
    <div class="gradient-generator">
      <div class="gradient-generator__preview" :style="{ background: cssOutput }"></div>

      <div class="gradient-generator__controls">
        <div class="gradient-generator__control">
          <label>角度: {{ angle }}°</label>
          <input type="range" v-model.number="angle" min="0" max="360" class="gradient-generator__slider" />
        </div>
        <div class="gradient-generator__color-control">
          <label>起始颜色</label>
          <input type="color" v-model="color1" class="gradient-generator__color-input" />
        </div>
        <div class="gradient-generator__color-control">
          <label>结束颜色</label>
          <input type="color" v-model="color2" class="gradient-generator__color-input" />
        </div>
      </div>

      <div class="gradient-generator__presets">
        <span class="gradient-generator__presets-label">预设：</span>
        <button
          v-for="preset in presets"
          :key="preset.name"
          class="gradient-generator__preset"
          :style="{ background: preset.css }"
          :title="preset.name"
          @click="applyPreset(preset)"
        />
      </div>

      <div class="gradient-generator__output">
        <div class="gradient-generator__output-header">
          <span>CSS 代码</span>
          <h-text-copy-button :content="cssOutput" />
        </div>
        <pre class="gradient-generator__code selectable">background: {{ cssOutput }};</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const angle = ref(135)
const color1 = ref('#7c3aed')
const color2 = ref('#ec4899')

const cssOutput = computed(() => {
  return `linear-gradient(${angle.value}deg, ${color1.value}, ${color2.value})`
})

interface Preset {
  name: string
  css: string
  c1: string
  c2: string
  angle: number
}

const presets: Preset[] = [
  { name: '紫色渐变', css: 'linear-gradient(135deg, #7c3aed, #ec4899)', c1: '#7c3aed', c2: '#ec4899', angle: 135 },
  { name: '蓝色渐变', css: 'linear-gradient(135deg, #3b82f6, #06b6d4)', c1: '#3b82f6', c2: '#06b6d4', angle: 135 },
  { name: '绿色渐变', css: 'linear-gradient(135deg, #22c55e, #14b8a6)', c1: '#22c55e', c2: '#14b8a6', angle: 135 },
  { name: '橙色渐变', css: 'linear-gradient(135deg, #f59e0b, #ef4444)', c1: '#f59e0b', c2: '#ef4444', angle: 135 },
  { name: '日落', css: 'linear-gradient(135deg, #ff6b6b, #feca57)', c1: '#ff6b6b', c2: '#feca57', angle: 135 },
  { name: '海洋', css: 'linear-gradient(135deg, #667eea, #764ba2)', c1: '#667eea', c2: '#764ba2', angle: 135 },
  { name: '极光', css: 'linear-gradient(135deg, #a8edea, #fed6e3)', c1: '#a8edea', c2: '#fed6e3', angle: 135 },
  { name: '暗夜', css: 'linear-gradient(135deg, #0f0c29, #302b63)', c1: '#0f0c29', c2: '#302b63', angle: 135 }
]

function applyPreset(preset: Preset): void {
  color1.value = preset.c1
  color2.value = preset.c2
  angle.value = preset.angle
}
</script>

<style scoped lang="less">
.gradient-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    height: 160px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
  }

  &__controls {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  &__control {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  &__color-control {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  &__slider {
    accent-color: var(--color-primary);
  }

  &__color-input {
    width: 100%;
    height: 36px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  &__presets {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__presets-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__preset {
    width: 40px;
    height: 40px;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      transform: scale(1.1);
    }
  }

  &__output-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-code-header);
    border: 1px solid var(--border-color);
    border-bottom: none;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__code {
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    background: var(--bg-code);
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    color: var(--color-primary);
  }
}
</style>
