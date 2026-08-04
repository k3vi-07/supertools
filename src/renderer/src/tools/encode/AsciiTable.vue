<template>
  <h-single-layout>
    <div class="ascii-table">
      <div class="ascii-table__controls">
        <h-input v-model="search" placeholder="搜索字符或十进制值..." />
      </div>
      <div class="ascii-table__grid">
        <div
          v-for="item in filteredItems"
          :key="item.dec"
          class="ascii-table__item"
          :class="{ 'ascii-table__item--extended': item.dec > 127 }"
          @click="copy(item.dec)"
        >
          <span class="ascii-table__char">{{ item.char }}</span>
          <span class="ascii-table__dec">{{ item.dec }}</span>
          <span class="ascii-table__hex">{{ item.hex }}</span>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface AsciiItem {
  dec: number
  hex: string
  char: string
}

const search = ref('')

const items = computed<AsciiItem[]>(() => {
  const result: AsciiItem[] = []
  for (let i = 0; i <= 255; i++) {
    let char = String.fromCharCode(i)
    // 控制字符显示名称
    const controlNames: Record<number, string> = {
      0: 'NUL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ',
      6: 'ACK', 7: 'BEL', 8: 'BS', 9: 'TAB', 10: 'LF', 11: 'VT',
      12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI', 16: 'DLE', 17: 'DC1',
      18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB',
      24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS',
      30: 'RS', 31: 'US', 127: 'DEL', 32: 'SP'
    }
    if (controlNames[i]) char = controlNames[i]
    result.push({ dec: i, hex: '0x' + i.toString(16).toUpperCase().padStart(2, '0'), char })
  }
  return result
})

const filteredItems = computed(() => {
  if (!search.value.trim()) return items.value
  const q = search.value.toLowerCase()
  return items.value.filter(
    (item) =>
      item.dec.toString().includes(q) ||
      item.char.toLowerCase().includes(q) ||
      item.hex.toLowerCase().includes(q)
  )
})

function copy(text: string | number): void {
  window.$he3?.copyText(String(text))
  window.$he3?.message.success(`已复制: ${text}`)
}
</script>

<style scoped lang="less">
.ascii-table {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__controls {
    input { width: 100%; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 6px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
    }

    &--extended {
      background: var(--bg-base);
    }
  }

  &__char {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: monospace;
  }

  &__dec {
    font-size: 11px;
    color: var(--color-primary);
    font-family: monospace;
  }

  &__hex {
    font-size: 10px;
    color: var(--text-tertiary);
    font-family: monospace;
  }
}
</style>
