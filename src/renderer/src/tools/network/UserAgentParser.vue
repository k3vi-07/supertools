<template>
  <h-single-layout>
    <div class="ua-parser">
      <div class="ua-parser__input">
        <label>User-Agent 字符串</label>
        <textarea v-model="ua" class="ua-parser__textarea selectable" rows="3" spellcheck="false" />
      </div>
      <h-card-box text="解析结果" icon="mdi:account-details">
        <div v-if="parsed" class="ua-parser__result">
          <div class="ua-parser__row"><span>浏览器</span><strong>{{ parsed.browser }}</strong></div>
          <div class="ua-parser__row"><span>浏览器版本</span><code>{{ parsed.browserVersion }}</code></div>
          <div class="ua-parser__row"><span>引擎</span><code>{{ parsed.engine }}</code></div>
          <div class="ua-parser__row"><span>操作系统</span><strong>{{ parsed.os }}</strong></div>
          <div class="ua-parser__row"><span>设备类型</span><strong>{{ parsed.device }}</strong></div>
          <div class="ua-parser__row"><span>CPU 架构</span><code>{{ parsed.cpu }}</code></div>
        </div>
      </h-card-box>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ua = ref(navigator.userAgent)

const parsed = computed(() => {
  const s = ua.value
  if (!s) return null

  // 浏览器检测
  let browser = 'Unknown', browserVersion = ''
  if (/Edg\/([\d.]+)/.test(s)) { browser = 'Microsoft Edge'; browserVersion = RegExp.$1 }
  else if (/OPR\/([\d.]+)/.test(s)) { browser = 'Opera'; browserVersion = RegExp.$1 }
  else if (/Chrome\/([\d.]+)/.test(s)) { browser = 'Chrome'; browserVersion = RegExp.$1 }
  else if (/Firefox\/([\d.]+)/.test(s)) { browser = 'Firefox'; browserVersion = RegExp.$1 }
  else if (/Safari\/([\d.]+)/.test(s)) {
    browser = 'Safari'
    browserVersion = s.match(/Version\/([\d.]+)/)?.[1] || ''
  }

  // 引擎
  let engine = 'Unknown'
  if (/Gecko\/|Firefox/.test(s)) engine = 'Gecko'
  else if (/AppleWebKit/.test(s)) engine = 'Blink/Webkit'
  else if (/Trident/.test(s)) engine = 'Trident'

  // OS
  let os = 'Unknown'
  if (/Windows NT ([\d.]+)/.test(s)) {
    const ver = RegExp.$1
    os = ver === '10.0' ? 'Windows 10/11' : `Windows NT ${ver}`
  }
  else if (/Mac OS X ([\d_]+)/.test(s)) os = `macOS ${RegExp.$1.replace(/_/g, '.')}`
  else if (/Android ([\d.]+)/.test(s)) os = `Android ${RegExp.$1}`
  else if (/iPhone OS ([\d_]+)/.test(s)) os = `iOS ${RegExp.$1.replace(/_/g, '.')}`
  else if (/Linux/.test(s)) os = 'Linux'

  // 设备
  let device = 'Desktop'
  if (/iPad/.test(s)) device = 'iPad'
  else if (/iPhone/.test(s)) device = 'iPhone'
  else if (/Android.*Mobile/.test(s)) device = 'Android Phone'
  else if (/Android/.test(s)) device = 'Android Tablet'

  // CPU
  let cpu = 'Unknown'
  if (/WOW64|Win64|x64/.test(s)) cpu = 'x86_64'
  else if (/arm|aarch64/i.test(s)) cpu = 'ARM'
  else if (/i686|x86/.test(s)) cpu = 'x86'

  return { browser, browserVersion, engine, os, device, cpu }
})
</script>

<style scoped lang="less">
.ua-parser {
  display: flex; flex-direction: column; gap: 16px;
  &__input {
    display: flex; flex-direction: column; gap: 6px;
    label { font-size: 12px; color: var(--text-secondary); }
  }
  &__textarea {
    width: 100%; padding: 10px;
    border: 1px solid var(--border-color); border-radius: var(--radius-sm);
    background: var(--bg-surface); color: var(--text-primary);
    font-family: monospace; font-size: 12px; outline: none; resize: vertical;
    &:focus { border-color: var(--color-primary); }
  }
  &__result { display: flex; flex-direction: column; gap: 8px; }
  &__row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; border-bottom: 1px solid var(--border-color-light);
    span { font-size: 13px; color: var(--text-tertiary); }
    strong { font-size: 13px; color: var(--text-primary); }
    code { font-family: monospace; font-size: 12px; color: var(--color-primary); }
  }
}
</style>
