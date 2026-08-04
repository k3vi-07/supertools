<template>
  <h-single-layout>
    <div class="ts-gen">
      <div class="ts-gen__preview"><span :style="{ textShadow: cssOutput }">Shadow Text</span></div>
      <div class="ts-gen__controls">
        <div class="ts-gen__ctrl"><label>X: {{ s.x }}px</label><input type="range" v-model.number="s.x" min="-20" max="20" /></div>
        <div class="ts-gen__ctrl"><label>Y: {{ s.y }}px</label><input type="range" v-model.number="s.y" min="-20" max="20" /></div>
        <div class="ts-gen__ctrl"><label>模糊: {{ s.blur }}px</label><input type="range" v-model.number="s.blur" min="0" max="30" /></div>
        <div class="ts-gen__ctrl"><label>颜色</label><input type="color" v-model="s.color" /></div>
      </div>
      <div class="ts-gen__output">
        <div class="ts-gen__header"><span>CSS</span><h-text-copy-button :content="`text-shadow: ${cssValue};`" /></div>
        <pre class="ts-gen__code selectable">text-shadow: {{ cssValue }};</pre>
      </div>
    </div>
  </h-single-layout>
</template>
<script setup lang="ts">
import { reactive, computed } from 'vue'
const s = reactive({ x: 2, y: 2, blur: 4, color: '#00000080' })
const cssValue = computed(() => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`)
const cssOutput = cssValue
</script>
<style scoped lang="less">
.ts-gen { display: flex; flex-direction: column; gap: 16px;
  &__preview { height: 100px; display: flex; align-items: center; justify-content: center; background: var(--bg-base); border-radius: var(--radius-md); border: 1px solid var(--border-color); span { font-size: 36px; font-weight: 700; color: var(--text-primary); } }
  &__controls { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); }
  &__ctrl { display: flex; flex-direction: column; gap: 4px; label { font-size: 12px; color: var(--text-secondary); } input[type=range] { accent-color: var(--color-primary); } input[type=color] { height: 28px; border: 1px solid var(--border-color); border-radius: 4px; } }
  &__header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-code-header); border: 1px solid var(--border-color); border-bottom: none; border-radius: var(--radius-md) var(--radius-md) 0 0; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
  &__code { padding: 12px; border: 1px solid var(--border-color); border-radius: 0 0 var(--radius-md) var(--radius-md); background: var(--bg-code); font-family: monospace; font-size: 13px; color: var(--color-primary); }
}
</style>
