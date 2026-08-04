<template>
  <h-single-layout>
    <div class="flex-gen">
      <div class="flex-gen__controls">
        <div class="flex-gen__control"><label>方向</label><h-select v-model="opt.direction" :options="dirOpts" /></div>
        <div class="flex-gen__control"><label>主轴对齐</label><h-select v-model="opt.justify" :options="justifyOpts" /></div>
        <div class="flex-gen__control"><label>交叉轴对齐</label><h-select v-model="opt.align" :options="alignOpts" /></div>
        <div class="flex-gen__control"><label>换行</label><h-select v-model="opt.wrap" :options="wrapOpts" /></div>
        <div class="flex-gen__control"><label>间距</label><h-input v-model="opt.gap" placeholder="8px" /></div>
      </div>
      <div class="flex-gen__preview" :style="{ display: 'flex', ...flexStyle }">
        <div class="flex-gen__box">1</div>
        <div class="flex-gen__box">2</div>
        <div class="flex-gen__box">3</div>
      </div>
      <div class="flex-gen__output">
        <div class="flex-gen__output-header"><span>CSS</span><h-text-copy-button :content="cssOutput" /></div>
        <pre class="flex-gen__code selectable">{{ cssOutput }}</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const opt = reactive({ direction: 'row', justify: 'center', align: 'center', wrap: 'nowrap', gap: '8px' })
const dirOpts = [{ label: 'row', value: 'row' }, { label: 'row-reverse', value: 'row-reverse' }, { label: 'column', value: 'column' }, { label: 'column-reverse', value: 'column-reverse' }]
const justifyOpts = [{ label: 'flex-start', value: 'flex-start' }, { label: 'center', value: 'center' }, { label: 'flex-end', value: 'flex-end' }, { label: 'space-between', value: 'space-between' }, { label: 'space-around', value: 'space-around' }, { label: 'space-evenly', value: 'space-evenly' }]
const alignOpts = [{ label: 'flex-start', value: 'flex-start' }, { label: 'center', value: 'center' }, { label: 'flex-end', value: 'flex-end' }, { label: 'stretch', value: 'stretch' }]
const wrapOpts = [{ label: 'nowrap', value: 'nowrap' }, { label: 'wrap', value: 'wrap' }, { label: 'wrap-reverse', value: 'wrap-reverse' }]

const flexStyle = computed(() => ({
  flexDirection: opt.direction,
  justifyContent: opt.justify,
  alignItems: opt.align,
  flexWrap: opt.wrap,
  gap: opt.gap
}))

const cssOutput = computed(() => {
  const lines = ['display: flex;']
  if (opt.direction !== 'row') lines.push(`flex-direction: ${opt.direction};`)
  lines.push(`justify-content: ${opt.justify};`)
  lines.push(`align-items: ${opt.align};`)
  if (opt.wrap !== 'nowrap') lines.push(`flex-wrap: ${opt.wrap};`)
  if (opt.gap) lines.push(`gap: ${opt.gap};`)
  return lines.join('\n')
})
</script>

<style scoped lang="less">
.flex-gen {
  display: flex; flex-direction: column; gap: 16px;
  &__controls { display: flex; gap: 12px; flex-wrap: wrap; }
  &__control { display: flex; flex-direction: column; gap: 4px; label { font-size: 11px; color: var(--text-secondary); } }
  &__preview { height: 150px; padding: 16px; border: 2px dashed var(--border-color); border-radius: var(--radius-md); background: var(--bg-base); }
  &__box { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; border-radius: var(--radius-sm); font-weight: 600; }
  &__output-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-code-header); border: 1px solid var(--border-color); border-bottom: none; border-radius: var(--radius-md) var(--radius-md) 0 0; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
  &__code { padding: 12px; border: 1px solid var(--border-color); border-radius: 0 0 var(--radius-md) var(--radius-md); background: var(--bg-code); font-family: monospace; font-size: 13px; color: var(--color-primary); }
}
</style>
