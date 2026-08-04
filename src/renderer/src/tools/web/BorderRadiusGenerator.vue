<template>
  <h-single-layout>
    <div class="border-radius">
      <div class="border-radius__preview">
        <div class="border-radius__box" :style="{ borderRadius: cssValue, background: color }"></div>
      </div>
      <div class="border-radius__controls">
        <div class="border-radius__mode">
          <h-radio
            v-model="mode"
            :options="[
              { label: '统一', value: 'uniform' },
              { label: '分别控制', value: 'individual' }
            ]"
            size="small"
          />
        </div>
        <template v-if="mode === 'uniform'">
          <div class="border-radius__control">
            <label>圆角: {{ uniform }}px</label>
            <input type="range" v-model.number="uniform" min="0" max="100" class="border-radius__slider" />
          </div>
        </template>
        <template v-else>
          <div v-for="c in corners" :key="c.key" class="border-radius__control">
            <label>{{ c.label }}: {{ c.value }}px</label>
            <input type="range" v-model.number="c.value" min="0" max="100" class="border-radius__slider" />
          </div>
        </template>
        <div class="border-radius__control">
          <label>预览颜色</label>
          <input type="color" v-model="color" class="border-radius__color" />
        </div>
      </div>
      <div class="border-radius__output">
        <div class="border-radius__output-header">
          <span>CSS 代码</span>
          <h-text-copy-button :content="`border-radius: ${cssValue};`" />
        </div>
        <pre class="border-radius__code selectable">border-radius: {{ cssValue }};</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const mode = ref<'uniform' | 'individual'>('uniform')
const uniform = ref(16)
const color = ref('#7c3aed')
const corners = reactive([
  { key: 'tl', label: '左上', value: 16 },
  { key: 'tr', label: '右上', value: 16 },
  { key: 'br', label: '右下', value: 16 },
  { key: 'bl', label: '左下', value: 16 }
])

const cssValue = computed(() => {
  if (mode.value === 'uniform') {
    return `${uniform.value}px`
  }
  return `${corners[0].value}px ${corners[1].value}px ${corners[2].value}px ${corners[3].value}px`
})
</script>

<style scoped lang="less">
.border-radius {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 180px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-base);
  }

  &__box {
    width: 120px;
    height: 120px;
    transition: border-radius 0.2s;
  }

  &__controls {
    display: flex;
    flex-direction: column;
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

  &__slider {
    accent-color: var(--color-primary);
  }

  &__color {
    width: 80px;
    height: 32px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
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
