<template>
  <h-single-layout>
    <div class="box-shadow-generator">
      <div class="box-shadow-generator__preview">
        <div class="box-shadow-generator__box" :style="{ boxShadow: cssOutput }">
          <span>Preview</span>
        </div>
      </div>

      <div class="box-shadow-generator__controls">
        <div class="box-shadow-generator__control">
          <label>X 偏移: {{ shadow.x }}px</label>
          <input type="range" v-model.number="shadow.x" min="-50" max="50" class="box-shadow-generator__slider" />
        </div>
        <div class="box-shadow-generator__control">
          <label>Y 偏移: {{ shadow.y }}px</label>
          <input type="range" v-model.number="shadow.y" min="-50" max="50" class="box-shadow-generator__slider" />
        </div>
        <div class="box-shadow-generator__control">
          <label>模糊: {{ shadow.blur }}px</label>
          <input type="range" v-model.number="shadow.blur" min="0" max="100" class="box-shadow-generator__slider" />
        </div>
        <div class="box-shadow-generator__control">
          <label>扩展: {{ shadow.spread }}px</label>
          <input type="range" v-model.number="shadow.spread" min="-50" max="50" class="box-shadow-generator__slider" />
        </div>
        <div class="box-shadow-generator__control">
          <label>颜色</label>
          <input type="color" v-model="shadow.color" class="box-shadow-generator__color" />
        </div>
        <div class="box-shadow-generator__control">
          <label>内阴影</label>
          <h-switch v-model="shadow.inset" />
        </div>
      </div>

      <div class="box-shadow-generator__output">
        <div class="box-shadow-generator__output-header">
          <span>CSS 代码</span>
          <h-text-copy-button :content="cssOutput" />
        </div>
        <pre class="box-shadow-generator__code selectable">box-shadow: {{ cssValue }};</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const shadow = reactive({
  x: 4,
  y: 4,
  blur: 10,
  spread: 0,
  color: '#00000040',
  inset: false
})

const cssValue = computed(() => {
  return `${shadow.inset ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
})

const cssOutput = computed(() => cssValue.value)
</script>

<style scoped lang="less">
.box-shadow-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-base);
  }

  &__box {
    width: 120px;
    height: 120px;
    background: white;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--text-secondary);
  }

  &__controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
    width: 100%;
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
