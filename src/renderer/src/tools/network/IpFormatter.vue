<template>
  <h-single-layout>
    <div class="ip-formatter">
      <div class="ip-formatter__input">
        <label>IP 地址</label>
        <h-input v-model="ip" placeholder="输入 IPv4 或 IPv6 地址..." />
      </div>
      <h-card-box text="IP 信息" icon="mdi:ip">
        <div v-if="info" class="ip-formatter__info">
          <div class="ip-formatter__row"><span>类型</span><span>{{ info.type }}</span></div>
          <div v-if="info.type === 'IPv4'" class="ip-formatter__row"><span>十进制</span><span class="selectable">{{ info.decimal }}</span></div>
          <div v-if="info.type === 'IPv4'" class="ip-formatter__row"><span>十六进制</span><span class="selectable">{{ info.hex }}</span></div>
          <div v-if="info.type === 'IPv4'" class="ip-formatter__row"><span>二进制</span><span class="selectable">{{ info.binary }}</span></div>
          <div v-if="info.type === 'IPv4'" class="ip-formatter__row"><span>八进制</span><span class="selectable">{{ info.octal }}</span></div>
          <div v-if="info.type === 'IPv4'" class="ip-formatter__row"><span>反向 DNS</span><span class="selectable">{{ info.reverseDns }}</span></div>
          <div v-if="info.isPrivate" class="ip-formatter__row"><span>类别</span><span>私有地址</span></div>
        </div>
      </h-card-box>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const ip = ref('192.168.1.1')

const info = computed(() => {
  if (!ip.value.trim()) return null
  const addr = ip.value.trim()
  if (isIPv4(addr)) return formatIPv4(addr)
  if (isIPv6(addr)) return { type: 'IPv6' as const }
  return { type: '无效 IP 地址' as const }
})

function isIPv4(s: string): boolean {
  const parts = s.split('.')
  return parts.length === 4 && parts.every((p) => { const n = Number(p); return !isNaN(n) && n >= 0 && n <= 255 })
}

function isIPv6(s: string): boolean {
  return /^[0-9a-fA-F:]+$/.test(s) && s.includes(':')
}

function formatIPv4(s: string) {
  const parts = s.split('.').map(Number)
  const decimal = parts.reduce((acc, val) => acc * 256 + val, 0)
  const hex = '0x' + parts.map((p) => p.toString(16).padStart(2, '0')).join('')
  const binary = parts.map((p) => p.toString(2).padStart(8, '0')).join('.')
  const octal = '0' + parts.map((p) => p.toString(8).padStart(3, '0')).join('.')
  const reverseDns = parts.reverse().join('.') + '.in-addr.arpa'
  const isPrivate = parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168) || parts[0] === 127
  return { type: 'IPv4' as const, decimal, hex, binary, octal, reverseDns, isPrivate }
}
</script>

<style scoped lang="less">
.ip-formatter {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__input {
    display: flex;
    flex-direction: column;
    gap: 6px;
    label { font-size: 12px; color: var(--text-secondary); }
    input { width: 100%; }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-color-light);
    font-size: 13px;

    span:first-child { color: var(--text-tertiary); }
    span:last-child { color: var(--text-primary); font-family: monospace; }
  }
}
</style>
