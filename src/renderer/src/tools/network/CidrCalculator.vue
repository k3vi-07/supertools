<template>
  <h-single-layout>
    <div class="cidr-calc">
      <div class="cidr-calc__input">
        <label>CIDR</label>
        <h-input v-model="cidr" placeholder="例如: 192.168.1.0/24" />
      </div>
      <h-card-box text="CIDR 信息" icon="mdi:calculator-variant">
        <div v-if="info" class="cidr-calc__info">
          <div class="cidr-calc__row"><span>网络地址</span><code class="selectable">{{ info.network }}</code></div>
          <div class="cidr-calc__row"><span>广播地址</span><code class="selectable">{{ info.broadcast }}</code></div>
          <div class="cidr-calc__row"><span>子网掩码</span><code class="selectable">{{ info.mask }}</code></div>
          <div class="cidr-calc__row"><span>IP 总数</span><code>{{ info.total }}</code></div>
          <div class="cidr-calc__row"><span>可用 IP 数</span><code>{{ info.usable }}</code></div>
          <div class="cidr-calc__row"><span>第一个可用</span><code class="selectable">{{ info.firstUsable }}</code></div>
          <div class="cidr-calc__row"><span>最后可用</span><code class="selectable">{{ info.lastUsable }}</code></div>
          <div class="cidr-calc__row"><span>前缀长度</span><code>/{{ info.prefix }}</code></div>
        </div>
      </h-card-box>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const cidr = ref('192.168.1.0/24')

const info = computed(() => {
  const match = cidr.value.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/)
  if (!match) return null
  const [, a, b, c, d, p] = match.map(Number)
  const ip = (a << 24) | (b << 16) | (c << 8) | d
  const prefix = p
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const network = (ip & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = Math.pow(2, 32 - prefix)
  const usable = prefix >= 31 ? total : total - 2
  const firstUsable = prefix >= 31 ? network : network + 1
  const lastUsable = prefix >= 31 ? broadcast : broadcast - 1
  return {
    network: ipToStr(network), broadcast: ipToStr(broadcast),
    mask: ipToStr(mask), total, usable, prefix,
    firstUsable: ipToStr(firstUsable), lastUsable: ipToStr(lastUsable)
  }
})

function ipToStr(num: number): string {
  return [24, 16, 8, 0].map((s) => (num >>> s) & 0xFF).join('.')
}
</script>

<style scoped lang="less">
.cidr-calc {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__input {
    display: flex; flex-direction: column; gap: 6px;
    label { font-size: 12px; color: var(--text-secondary); }
    input { width: 100%; }
  }

  &__info {
    display: flex; flex-direction: column; gap: 8px;
  }

  &__row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; border-bottom: 1px solid var(--border-color-light);
    span { font-size: 13px; color: var(--text-tertiary); }
    code { font-family: monospace; font-size: 13px; color: var(--color-primary); }
  }
}
</style>
